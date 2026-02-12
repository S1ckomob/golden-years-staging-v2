import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `You are Lisa, the Golden Years Senior Services virtual assistant on their website. You are warm, professional, empathetic, and helpful. Always introduce yourself as Lisa when greeting someone new. Your job is to:

1. ANSWER QUESTIONS about Golden Years services
2. CAPTURE LEADS by naturally gathering name, email/phone, and situation
3. HELP SCHEDULE free consultations

## About Golden Years Senior Services
- Located in Central Ontario, serving Barrie, Orillia, Midland, Collingwood, Innisfil, and Simcoe County
- Professional senior transition support for families
- Founded by Curtis and his wife
- Services: sorting/decluttering, downsizing management, move coordination, estate transitions, vendor coordination, emotional support

## Service Tiers
- **Essentials (from $2,500)**: Up to 4 sorting sessions, room-by-room categorization, donation coordination, basic move planning, client portal access
- **Full-Service (from $5,500)**: Up to 10 sessions, vendor coordination, move day supervision, new home setup, photo documentation. Most popular.
- **Premium Estate (from $9,500)**: Unlimited sessions, estate sale management, real estate coordination, family mediation support, dedicated coordinator

## Process
1. Free consultation (no obligation)
2. Custom plan with clear milestones and pricing
3. Guided transition with hands-on support
4. Follow-up after settled

## Key Facts
- Typical transitions take 2-6 weeks
- All plans include client portal access (photo review, progress tracking, messaging)
- HST applies to all pricing
- No long-term contracts — can pause or adjust anytime
- Work with trusted local vendors (movers, estate sale companies, donation centers, realtors)
- Provide donation receipts for tax purposes
- Remote family members can participate through the client portal
- Available Monday-Saturday

## Lead Capture Instructions
Your secondary goal is to naturally capture the visitor's contact information. Do NOT ask for all info at once — gather it conversationally:
- First name
- Email or phone number
- Brief description of their situation (who needs help, timeline, home size)

When someone seems interested in services or asks about booking/consultations, guide toward providing their info by saying something like:
"I'd love to have one of our coordinators reach out to you. Could I get your name and the best way to contact you?"

When you have at least a name AND either email or phone, include this exact tag in your response (hidden from user):
<lead>{"name":"their name","email":"their@email.com","phone":"their phone","situation":"brief description"}</lead>

Only include the fields you have. Always include the tag on the FIRST message where you have enough info.

## Appointment Scheduling
If someone wants to book a consultation, ask for:
- Preferred day/time
- Name and contact info (if not captured yet)
Then confirm: "I'll have our team reach out to confirm your consultation for [day/time]. You'll receive a confirmation shortly!"

Include this tag when scheduling:
<appointment>{"name":"name","email":"email","phone":"phone","date":"preferred date","time":"preferred time","notes":"any notes"}</appointment>

## Communication Style
- Warm, empathetic, and professional
- Use short paragraphs (2-3 sentences max)
- Be concise — this is a chat, not a letter
- Show you understand the emotional weight of transitions
- Never be pushy about sales — be genuinely helpful
- If you don't know something specific, offer to connect them with the team
- Use the person's name once you have it
- Don't use emojis excessively (one or two per message max is fine)
- Format key info clearly but keep responses under 150 words when possible`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, leadCaptured } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages required' });
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: messages.filter(m => m.role === 'user' || m.role === 'assistant').slice(-20)
    });

    let reply = response.content[0].text;
    let leadSaved = false;

    // Extract and save lead data
    const leadMatch = reply.match(/<lead>(.*?)<\/lead>/s);
    if (leadMatch && !leadCaptured) {
      try {
        const leadData = JSON.parse(leadMatch[1]);
        await saveLead(leadData);
        leadSaved = true;
      } catch (e) { console.error('Lead parse error:', e); }
      reply = reply.replace(/<lead>.*?<\/lead>/s, '').trim();
    }

    // Extract and save appointment data
    const apptMatch = reply.match(/<appointment>(.*?)<\/appointment>/s);
    if (apptMatch) {
      try {
        const apptData = JSON.parse(apptMatch[1]);
        await saveAppointment(apptData);
      } catch (e) { console.error('Appointment parse error:', e); }
      reply = reply.replace(/<appointment>.*?<\/appointment>/s, '').trim();
    }

    return res.status(200).json({ reply, leadSaved });

  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function saveLead(data) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { error } = await supabase.from('leads').insert({
    name: data.name || null,
    email: data.email || null,
    phone: data.phone || null,
    situation: data.situation || null,
    source: 'website_chatbot',
    status: 'new'
  });

  if (error) console.error('Lead save error:', error);
}

async function saveAppointment(data) {
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  // Save as lead too if we have contact info
  if (data.name && (data.email || data.phone)) {
    await saveLead({ ...data, situation: `Consultation requested for ${data.date || 'TBD'} at ${data.time || 'TBD'}` });
  }

  // Parse the date Lisa provides (e.g. "next Tuesday", "February 20", "2026-02-20")
  let appointmentDate = null;
  if (data.date) {
    // Try direct ISO parse first
    const parsed = new Date(data.date);
    if (!isNaN(parsed.getTime())) {
      appointmentDate = parsed.toISOString().split('T')[0];
    } else {
      // For relative dates like "next Tuesday", default to 7 days from now
      const future = new Date();
      future.setDate(future.getDate() + 7);
      appointmentDate = future.toISOString().split('T')[0];
    }
  } else {
    // No date given, default to 7 days from now
    const future = new Date();
    future.setDate(future.getDate() + 7);
    appointmentDate = future.toISOString().split('T')[0];
  }

  // Parse time (e.g. "2pm", "14:00", "2:00 PM")
  let startTime = '10:00:00';
  let endTime = '11:00:00';
  if (data.time) {
    const timeStr = data.time.toLowerCase().trim();
    const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
    if (match) {
      let hours = parseInt(match[1]);
      const mins = match[2] ? match[2] : '00';
      const ampm = match[3];
      if (ampm === 'pm' && hours < 12) hours += 12;
      if (ampm === 'am' && hours === 12) hours = 0;
      startTime = `${hours.toString().padStart(2, '0')}:${mins}:00`;
      endTime = `${(hours + 1).toString().padStart(2, '0')}:${mins}:00`;
    }
  }

  // Create appointment in Supabase → n8n workflow #4 picks this up → creates Outlook calendar event
  const { error: apptError } = await supabase.from('appointments').insert({
    title: `Free Consultation — ${data.name}`,
    description: `Website chatbot booking.\nName: ${data.name}\nEmail: ${data.email || 'N/A'}\nPhone: ${data.phone || 'N/A'}\nNotes: ${data.notes || 'None'}`,
    date: appointmentDate,
    start_time: startTime,
    end_time: endTime,
    type: 'Consultation',
    status: 'Scheduled',
    location: 'Phone/Video Call — to be confirmed'
  });

  if (apptError) console.error('Appointment save error:', apptError);

  // Queue email notification to admin
  const { error: emailError } = await supabase.from('email_queue').insert({
    to_email: process.env.ADMIN_EMAIL || 'cyarde@gyss.ca',
    to_name: 'Admin',
    subject: `New Consultation Request from ${data.name}`,
    body: `A new consultation has been requested through the website chatbot.\n\nName: ${data.name}\nEmail: ${data.email || 'Not provided'}\nPhone: ${data.phone || 'Not provided'}\nPreferred Date: ${appointmentDate}\nPreferred Time: ${data.time || 'Not specified'}\nNotes: ${data.notes || 'None'}\n\nThis appointment has been automatically added to your Outlook calendar.`,
    status: 'pending',
    related_type: 'consultation_request'
  });

  if (emailError) console.error('Email queue error:', emailError);
}
