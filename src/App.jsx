import { useState, useEffect, useRef } from 'react'
import Chatbot from './components/Chatbot'

const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID"

const services = [
  { icon: "🏠", title: "Sorting & Decluttering", desc: "Compassionate, room-by-room organization. We help categorize belongings into keep, donate, sell, and discard — always at your pace, never rushed." },
  { icon: "📦", title: "Downsizing Coordination", desc: "Full-service downsizing from planning to execution. We manage every detail so you can focus on the memories, not the logistics." },
  { icon: "🚚", title: "Move Management", desc: "End-to-end moving coordination — vendor scheduling, packing supervision, and new home setup. One point of contact for everything." },
  { icon: "🏡", title: "Estate Transitions", desc: "Respectful handling of estate cleanouts and family home transitions. We honour memories while helping families move forward." },
  { icon: "📋", title: "Vendor Network", desc: "We coordinate with trusted realtors, movers, estate sale companies, and donation centres — so you don't have to manage multiple vendors." },
  { icon: "💛", title: "Emotional Support", desc: "Transitions are deeply personal. Our team brings patience, empathy, and understanding to every interaction, every step of the way." }
]

const steps = [
  { num: "01", title: "Free Consultation", desc: "A no-obligation conversation to understand your situation, timeline, and unique needs. We listen first." },
  { num: "02", title: "Custom Plan", desc: "We create a tailored transition plan with clear milestones, realistic timelines, and transparent pricing." },
  { num: "03", title: "Guided Transition", desc: "Our team works alongside you through every step — sorting, coordinating, and managing all the details." },
  { num: "04", title: "Settled & Supported", desc: "We ensure everything is in place at the new home and follow up to make sure you're comfortable." }
]

const tiers = [
  { name: "Essentials", price: "From $2,500", desc: "Focused sorting & organization", features: ["Up to 4 sorting sessions", "Room-by-room categorization", "Donation coordination", "Basic move planning", "Client portal access"] },
  { name: "Full-Service", price: "From $5,500", desc: "Complete transition management", features: ["Up to 10 sorting sessions", "Everything in Essentials", "Vendor coordination", "Move day supervision", "New home setup", "Photo documentation"], popular: true },
  { name: "Premium Estate", price: "From $9,500", desc: "End-to-end estate handling", features: ["Unlimited sessions", "Everything in Full-Service", "Estate sale management", "Real estate coordination", "Family mediation support", "Dedicated coordinator"] }
]

const areas = [
  { region: "Barrie & Area", towns: ["Barrie", "Innisfil", "Springwater", "Oro-Medonte"] },
  { region: "Orillia & Area", towns: ["Orillia", "Ramara", "Severn", "Gravenhurst"] },
  { region: "Georgian Bay", towns: ["Midland", "Penetanguishene", "Tiny", "Tay"] },
  { region: "Simcoe North", towns: ["Collingwood", "Wasaga Beach", "Clearview", "New Tecumseth"] }
]

const testimonials = [
  { quote: "Golden Years made what felt impossible feel manageable. They treated my mother's belongings with the same reverence we did.", name: "Jennifer M.", location: "Barrie, ON" },
  { quote: "After Dad passed, we were overwhelmed. The team was patient, organized, and genuinely caring. They gave us peace of mind.", name: "David & Karen T.", location: "Orillia, ON" },
  { quote: "Professional, compassionate, and thorough. They coordinated everything — movers, donations, even setting up Mom's new apartment.", name: "Robert S.", location: "Midland, ON" }
]

const faqs = [
  { q: "What areas do you serve?", a: "We serve Central Ontario including Barrie, Orillia, Midland, Collingwood, Innisfil, and surrounding communities within Simcoe County." },
  { q: "How long does a typical transition take?", a: "Most transitions take 2–6 weeks depending on the size of the home and complexity. We provide a realistic timeline during your free consultation." },
  { q: "Do you handle estate sales?", a: "Yes! Our Premium Estate tier includes full estate sale management. We coordinate with trusted partners to maximize value while minimizing stress." },
  { q: "Can family members be involved?", a: "Absolutely. We encourage family involvement and can facilitate decision-making sessions. Remote family members can participate through our client portal." },
  { q: "What happens to donated items?", a: "We partner with reputable local charities. Items go to people who need them, and we provide donation receipts for tax purposes." },
  { q: "Is there a contract or commitment?", a: "No long-term contracts. We start with a free consultation, then provide a detailed proposal. You can pause or adjust services at any time." }
]

function useInView(ref, threshold = 0.15) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, threshold])
  return vis
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef()
  const vis = useInView(ref)
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`
    }}>
      {children}
    </div>
  )
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" })
  const [formStatus, setFormStatus] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setFormStatus("sending")
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setFormStatus("success")
        setFormData({ name: "", email: "", phone: "", message: "" })
      } else setFormStatus("error")
    } catch { setFormStatus("error") }
  }

  return (
    <>
      <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
        <a href="#" className="nav-logo">
          <div className="nav-logo-icon">GY</div>
          <div><div className="nav-logo-text">Golden Years</div><div className="nav-logo-sub">SENIOR SERVICES</div></div>
        </a>
        <div className={`nav-links ${mobileNav ? "nav-links-open" : ""}`}>
          <a href="#services" onClick={() => setMobileNav(false)}>Services</a>
          <a href="#how-it-works" onClick={() => setMobileNav(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMobileNav(false)}>Pricing</a>
          <a href="#areas" onClick={() => setMobileNav(false)}>Areas</a>
          <a href="#faq" onClick={() => setMobileNav(false)}>FAQ</a>
          <a href="#contact" className="nav-cta" onClick={() => setMobileNav(false)}>Free Consultation</a>
        </div>
        <button className="nav-hamburger" onClick={() => setMobileNav(!mobileNav)}>{mobileNav ? "✕" : "☰"}</button>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <FadeIn><span className="hero-badge">Serving Central Ontario</span></FadeIn>
          <FadeIn delay={0.1}><h1 className="hero-title">Compassionate Senior<br /><span className="hero-highlight">Home Transitions</span></h1></FadeIn>
          <FadeIn delay={0.2}><p className="hero-desc">Professional downsizing, sorting, and moving support for seniors and their families. We handle the logistics with care — so you can focus on what matters most.</p></FadeIn>
          <FadeIn delay={0.3}>
            <div className="hero-btns">
              <a href="#contact" className="btn btn-primary">Book Your Free Consultation</a>
              <a href="#how-it-works" className="btn btn-secondary">Learn How It Works</a>
            </div>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="hero-trust">
              <div className="trust-item"><span className="trust-num">200+</span><span className="trust-label">Families Helped</span></div>
              <div className="trust-divider" />
              <div className="trust-item"><span className="trust-num">4.9★</span><span className="trust-label">Client Rating</span></div>
              <div className="trust-divider" />
              <div className="trust-item"><span className="trust-num">100%</span><span className="trust-label">Satisfaction</span></div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section id="services" className="section section-white">
        <div className="container">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">How We Help</h2></FadeIn>
          <FadeIn><p className="section-subtitle">Every transition is unique. We offer comprehensive support tailored to your family's specific needs.</p></FadeIn>
          <div className="grid-3">
            {services.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}><div className="card"><div className="card-icon">{s.icon}</div><h3 className="card-title">{s.title}</h3><p className="card-desc">{s.desc}</p></div></FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section section-cream">
        <div className="container">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">How It Works</h2></FadeIn>
          <FadeIn><p className="section-subtitle">A simple, supportive process from first call to settled home.</p></FadeIn>
          <div className="grid-4">
            {steps.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.1}><div className="step"><div className="step-num">{s.num}</div><h3 className="step-title">{s.title}</h3><p className="step-desc">{s.desc}</p></div></FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="section section-white">
        <div className="container">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">Service Packages</h2></FadeIn>
          <FadeIn><p className="section-subtitle">Transparent pricing with no hidden fees. Every package includes access to our client portal.</p></FadeIn>
          <div className="grid-3 pricing-grid">
            {tiers.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}>
                <div className={`pricing-card ${t.popular ? "pricing-popular" : ""}`}>
                  {t.popular && <div className="pricing-badge">Most Popular</div>}
                  <h3 className="pricing-name">{t.name}</h3>
                  <p className="pricing-desc">{t.desc}</p>
                  <div className="pricing-price">{t.price}</div>
                  <ul className="pricing-features">{t.features.map(f => <li key={f}><span className="check">✓</span> {f}</li>)}</ul>
                  <a href="#contact" className={`btn ${t.popular ? "btn-primary" : "btn-outline"} btn-full`}>Get Started</a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-cream">
        <div className="container">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">Families We've Helped</h2></FadeIn>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.1}><div className="testimonial"><p className="testimonial-quote">"{t.quote}"</p><div className="testimonial-author"><strong>{t.name}</strong><span>{t.location}</span></div></div></FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="section section-white">
        <div className="container">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">Areas We Serve</h2></FadeIn>
          <FadeIn><p className="section-subtitle">Proudly serving communities across Central Ontario and Simcoe County.</p></FadeIn>
          <div className="grid-4">
            {areas.map((a, i) => (
              <FadeIn key={a.region} delay={i * 0.08}><div className="area-card"><h3 className="area-region">{a.region}</h3><ul className="area-towns">{a.towns.map(t => <li key={t}>{t}</li>)}</ul></div></FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="section section-cream">
        <div className="container container-sm">
          <FadeIn><div className="section-bar" /></FadeIn>
          <FadeIn><h2 className="section-title">Common Questions</h2></FadeIn>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <FadeIn key={i} delay={0.05}>
                <div className="faq-item">
                  <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{f.q}</span><span className={`faq-icon ${openFaq === i ? "faq-icon-open" : ""}`}>+</span>
                  </button>
                  <div className={`faq-a ${openFaq === i ? "faq-a-open" : ""}`}><p>{f.a}</p></div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section section-white">
        <div className="container">
          <FadeIn>
            <div className="cta-box">
              <div className="cta-content">
                <h2 className="cta-title">Ready to Start Your Transition?</h2>
                <p className="cta-desc">Book a free, no-obligation consultation. We'll discuss your situation and create a plan that works for your family.</p>
                <div className="cta-contact-info">
                  <a href="tel:+17055551234" className="cta-link">📞 (705) 555-1234</a>
                  <a href="mailto:info@goldenyearsseniorservices.ca" className="cta-link">✉️ info@goldenyearsseniorservices.ca</a>
                </div>
                <p className="cta-chat-hint">Or chat with Lisa using the button in the bottom right corner →</p>
              </div>
              <div className="cta-form-wrap">
                <form onSubmit={handleSubmit} className="cta-form">
                  <input type="text" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" />
                  <input type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="form-input" />
                  <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="form-input" />
                  <textarea placeholder="Tell us about your situation..." rows="4" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="form-input form-textarea" />
                  <button type="submit" className="btn btn-primary btn-full" disabled={formStatus === "sending"}>{formStatus === "sending" ? "Sending..." : "Request Free Consultation"}</button>
                  {formStatus === "success" && <p className="form-msg form-success">Thank you! We'll be in touch within 24 hours.</p>}
                  {formStatus === "error" && <p className="form-msg form-error">Something went wrong. Please try again or call us directly.</p>}
                </form>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo"><div className="nav-logo-icon nav-logo-icon-sm">GY</div><span className="footer-brand">Golden Years</span></div>
              <p className="footer-tagline">Compassionate senior transition support for families across Central Ontario.</p>
            </div>
            <div>
              <h4 className="footer-heading">Services</h4>
              <ul className="footer-list"><li>Sorting & Decluttering</li><li>Downsizing Coordination</li><li>Move Management</li><li>Estate Transitions</li></ul>
            </div>
            <div>
              <h4 className="footer-heading">Contact</h4>
              <ul className="footer-list"><li>📞 (705) 555-1234</li><li>✉️ info@goldenyearsseniorservices.ca</li><li>📍 Serving Central Ontario</li><li>🕐 Mon–Sat, 8am–6pm</li></ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Golden Years Senior Services. All rights reserved.</span>
            <div className="footer-links"><a href="#">Privacy Policy</a><a href="#">Terms of Service</a></div>
          </div>
        </div>
      </footer>

      <Chatbot />
    </>
  )
}
