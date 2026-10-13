import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Plus,
  Mail,
  Store,
  Palette,
  Users,
  Briefcase,
  HeartHandshake,
  Inbox,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './landing.css';

const PEOPLE = [
  { name: 'Amara Okafor', email: 'amara@bakehouse.co', color: '#34d399' },
  { name: 'Daniel Mensah', email: 'dan@studio.io', color: '#fbbf24' },
  { name: 'Chioma Eze', email: 'chioma@club.org', color: '#60a5fa' },
  { name: 'Tunde Bello', email: 'tunde@freelance.dev', color: '#f472b6' },
];

const STATUS_FLOW = ['queued', 'sending', 'delivered'];
const STATUS_LABEL = { queued: 'Queued', sending: 'Sending', delivered: 'Delivered' };

const FAQS = [
  {
    q: 'Do I need any technical skills to use MailStream Pro?',
    a: 'Not at all. If you can write an email, you can send a campaign. Add your contacts, write your message, pick who gets it, and press send.',
  },
  {
    q: 'How do I know my email actually arrived?',
    a: 'Every person on your list gets a live status — queued, sending, delivered. It updates on its own, so you never have to refresh or guess.',
  },
  {
    q: 'Is it free to start?',
    a: 'Yes. Create an account and send your first campaign without paying anything.',
  },
  {
    q: 'Who can see my contacts?',
    a: 'Only you. Your contact lists and campaigns are private to your account and never shared.',
  },
];

/* Reveal elements as they scroll into view */
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.rs-reveal');
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

/* Live delivery feed that cycles through statuses */
const LiveFeed = () => {
  const [statuses, setStatuses] = useState(PEOPLE.map(() => 'queued'));
  const [flash, setFlash] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      setStatuses((prev) => {
        const idx = prev.findIndex((s) => s !== 'delivered');
        if (idx === -1) return PEOPLE.map(() => 'queued');
        const next = [...prev];
        next[idx] = STATUS_FLOW[STATUS_FLOW.indexOf(prev[idx]) + 1];
        setFlash(idx);
        return next;
      });
    }, 1100);
    return () => clearInterval(id);
  }, []);

  const delivered = statuses.filter((s) => s === 'delivered').length;
  const rate = Math.round((delivered / PEOPLE.length) * 100);

  return (
    <div className="rs-window">
      <div className="rs-window-bar">
        <i /><i /><i />
        <span className="rs-window-title">October newsletter</span>
        <span className="rs-live"><span className="rs-pill-dot" /> LIVE</span>
      </div>
      <div className="rs-window-body">
        <div className="rs-kpis">
          <div className="rs-kpi"><small>Recipients</small><strong>{PEOPLE.length}</strong></div>
          <div className="rs-kpi"><small>Delivered</small><strong>{delivered}</strong></div>
          <div className="rs-kpi"><small>Success</small><strong style={{ color: '#10b981' }}>{rate}%</strong></div>
        </div>
        {PEOPLE.map((p, i) => (
          <div key={p.email} className={`rs-feed-row ${flash === i ? 'flash' : ''}`}>
            <span className="rs-avatar" style={{ background: p.color }}>{p.name[0]}</span>
            <div>
              <div className="rs-feed-name">{p.name}</div>
              <div className="rs-feed-email">{p.email}</div>
            </div>
            <span className={`rs-status rs-status-${statuses[i]}`}>{STATUS_LABEL[statuses[i]]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Typewriter subject line for the "write" card */
const TypingSubject = () => {
  const full = 'Our new menu is here 🍰';
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i = i > full.length + 12 ? 0 : i + 1;
      setText(full.slice(0, i));
    }, 110);
    return () => clearInterval(id);
  }, []);
  return <b className="rs-typing">{text}</b>;
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const cardsRef = useRef(null);
  useReveal();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Spotlight that follows the cursor on cards */
  const handleCardMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  const primaryCta = isAuthenticated
    ? { to: '/dashboard', label: 'Go to dashboard' }
    : { to: '/register', label: 'Get started' };

  return (
    <div className="rs-page">
      {/* Header */}
      <header className={`rs-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="rs-container rs-header-inner">
          <Link to="/" className="rs-logo" id="landing-logo">
            <span className="rs-logo-mark"><Mail size={15} color="#000" strokeWidth={2.5} /></span>
            MailStream Pro
          </Link>
          <nav className="rs-nav" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#live">Live tracking</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="rs-header-actions">
            {!isAuthenticated && (
              <Link to="/login" className="rs-btn rs-btn-sm rs-btn-ghost" id="header-login">Log in</Link>
            )}
            <Link to={primaryCta.to} className="rs-btn rs-btn-sm rs-btn-glass" id="header-cta">{primaryCta.label}</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="rs-hero">
          <div className="rs-hero-rays" aria-hidden="true" />
          <div className="rs-container rs-hero-grid">
            <div className="rs-hero-copy rs-hero-in">
              <h1 className="rs-display">
                Email that <em>lands</em><br />where it matters
              </h1>
              <p className="rs-lead">
                Write one email, send it to everyone who matters, and see the moment it reaches each inbox. No tech skills needed.
              </p>
              <div className="rs-hero-actions">
                <Link to={primaryCta.to} className="rs-btn rs-btn-glass" id="hero-cta">
                  {primaryCta.label} <ArrowRight size={16} className="rs-arrow" />
                </Link>
                {!isAuthenticated && (
                  <Link to="/login" className="rs-btn rs-btn-ghost" id="hero-login">I have an account</Link>
                )}
              </div>
              <div className="rs-hero-note">
                <span><Check size={14} color="#10b981" /> Free to start</span>
                <span><Check size={14} color="#10b981" /> Set up in 2 minutes</span>
              </div>
            </div>

            <div className="rs-visual rs-hero-in-2" aria-hidden="true">
              <div className="rs-visual-glow" />
              <div className="rs-envelope">
                <svg viewBox="0 0 300 210" fill="none">
                  <path d="M20 30 L150 120 L280 30" stroke="rgba(255,255,255,0.55)" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M20 185 L115 100 M280 185 L185 100" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
                </svg>
                <div className="rs-envelope-shine" />
              </div>
              <div className="rs-toast rs-toast-1">
                <span className="rs-toast-icon"><Check size={14} /></span>
                <div><b>Delivered</b><small>ramadanadex111@gmail.com</small></div>
              </div>
              <div className="rs-toast rs-toast-3">
                <span className="rs-toast-icon"><Inbox size={14} /></span>
                <div><b>In the inbox</b><small>just now</small></div>
              </div>
              <div className="rs-toast rs-toast-2">
                <span className="rs-toast-icon"><Send size={14} /></span>
                <div><b>248 sent</b><small>100% delivered</small></div>
              </div>
            </div>
          </div>
        </section>

        {/* Audience strip */}
        <section className="rs-audience rs-reveal">
          <div className="rs-container">
            <p>Made for people who'd rather send than set up.</p>
            <div className="rs-audience-row">
              <span className="rs-audience-item"><Store size={18} /> Small businesses</span>
              <span className="rs-audience-item"><Palette size={18} /> Creators</span>
              <span className="rs-audience-item"><Users size={18} /> Clubs &amp; communities</span>
              <span className="rs-audience-item"><Briefcase size={18} /> Freelancers</span>
              <span className="rs-audience-item"><HeartHandshake size={18} /> Non-profits</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="rs-section rs-section-top">
          <div className="rs-container">
            <div className="rs-center rs-reveal">
              <div className="rs-eyebrow">Everything you need</div>
              <h2 className="rs-h2">Simple by design.<br />Powerful when it counts.</h2>
              <p className="rs-sub">Three things done really well — so you spend less time setting up and more time talking to your people.</p>
            </div>

            <div className="rs-cards" ref={cardsRef}>
              <article className="rs-card rs-reveal rs-d1" onMouseMove={handleCardMove}>
                <div className="rs-card-visual">
                  {PEOPLE.slice(0, 3).map((p, i) => (
                    <div key={p.email} className={`rs-mini-row ${i === 0 ? 'hl' : ''}`}>
                      <span className="rs-avatar" style={{ background: p.color }}>{p.name[0]}</span>
                      {p.name}
                      <span className="rs-mini-muted">{p.email.split('@')[1]}</span>
                    </div>
                  ))}
                  <div className="rs-mini-row" style={{ color: '#6b6b6b' }}>
                    <Plus size={14} /> Add contact
                  </div>
                </div>
                <h3>Keep your people in one place</h3>
                <p>Save names and emails once. Find anyone in seconds, and keep your list tidy.</p>
              </article>

              <article className="rs-card rs-reveal rs-d2" onMouseMove={handleCardMove}>
                <div className="rs-card-visual">
                  <div className="rs-field">To: <b>Everyone (248)</b></div>
                  <div className="rs-field">Subject: <TypingSubject /></div>
                  <div className="rs-field" style={{ height: 52, lineHeight: 1.5 }}>
                    Hi there! We've been baking something special…
                  </div>
                </div>
                <h3>Write it once, send to many</h3>
                <p>Type your message like a normal email, choose who gets it, and hit send.</p>
              </article>

              <article className="rs-card rs-reveal rs-d3" onMouseMove={handleCardMove}>
                <div className="rs-card-visual">
                  <div style={{ fontSize: '0.74rem', color: '#6b6b6b', fontFamily: 'var(--rs-mono)' }}>DELIVERED</div>
                  <div className="rs-stat-big">99.8%</div>
                  <div className="rs-bar"><span /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.9rem', fontSize: '0.74rem', color: '#a1a1a1' }}>
                    <span>247 inboxes</span><span style={{ color: '#10b981' }}>● live</span>
                  </div>
                </div>
                <h3>Know it arrived</h3>
                <p>See exactly who received your email — updated live, no refreshing required.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Live tracking showcase */}
        <section id="live" className="rs-section rs-section-top">
          <div className="rs-container rs-showcase">
            <div className="rs-reveal">
              <div className="rs-eyebrow">Live tracking</div>
              <h2 className="rs-h2">Stop wondering.<br />Start knowing.</h2>
              <p className="rs-sub">The moment you press send, you'll watch each email move from queued to delivered — right on your screen.</p>
              <ul className="rs-checks">
                <li><span className="rs-check"><Check size={13} /></span><div><b>Updates on its own</b>No refresh button. Statuses change in front of you.</div></li>
                <li><span className="rs-check"><Check size={13} /></span><div><b>Person by person</b>See exactly who got it — and who didn't.</div></li>
                <li><span className="rs-check"><Check size={13} /></span><div><b>Clear reasons if something fails</b>Plain-English notes so you know what to fix.</div></li>
              </ul>
            </div>
            <div className="rs-reveal rs-d2">
              <LiveFeed />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="rs-section rs-section-top">
          <div className="rs-container">
            <div className="rs-center rs-reveal">
              <div className="rs-eyebrow">How it works</div>
              <h2 className="rs-h2">From idea to inbox<br />in three steps</h2>
            </div>
            <div className="rs-steps">
              {[
                { t: 'Add your people', d: 'Type in a few contacts or build your list over time. It stays saved for next time.' },
                { t: 'Write your email', d: 'Add a subject and your message. Pick everyone or just a few people.' },
                { t: 'Send & watch', d: 'Press send and see each email land in real time. That\u2019s it.' },
              ].map((s, i) => (
                <div key={s.t} className={`rs-step rs-reveal rs-d${i + 1}`}>
                  <div className="rs-step-num">0{i + 1}</div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                  <span className="rs-step-ghost" aria-hidden="true">{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="rs-section rs-section-top">
          <div className="rs-container">
            <div className="rs-center rs-reveal">
              <div className="rs-eyebrow">Questions</div>
              <h2 className="rs-h2">Good to know</h2>
            </div>
            <div className="rs-faq rs-reveal">
              {FAQS.map((f, i) => (
                <div key={f.q} className={`rs-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button
                    className="rs-faq-q"
                    id={`faq-${i}`}
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {f.q} <Plus size={18} />
                  </button>
                  <div className="rs-faq-a"><div>{f.a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rs-cta rs-section-top">
          <div className="rs-cta-glow" aria-hidden="true" />
          <div className="rs-container rs-reveal" style={{ position: 'relative' }}>
            <h2 className="rs-display">Your next email<br /><em>deserves</em> to be seen</h2>
            <p className="rs-lead" style={{ margin: '0 auto 2.25rem' }}>Join MailStream and send your first campaign today.</p>
            <div className="rs-hero-actions">
              <Link to={primaryCta.to} className="rs-btn rs-btn-glass" id="footer-cta">
                {primaryCta.label} <ArrowRight size={16} className="rs-arrow" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="rs-footer">
        <div className="rs-container rs-footer-inner">
          <span className="rs-logo" style={{ fontSize: '0.95rem' }}>
            <span className="rs-logo-mark" style={{ width: 22, height: 22, borderRadius: 6 }}><Mail size={12} color="#000" strokeWidth={2.5} /></span>
            MailStream Pro
          </span>
          <div>
            © {new Date().getFullYear()} MailStream Pro
            <Link to="/login">Log in</Link>
            <Link to="/register">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
