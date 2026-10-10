import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Send,
  Mail,
  Zap,
  BarChart3,
  ShieldCheck,
  Clock,
  Search,
  Filter,
  Layers,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How does real-time delivery tracking work?',
      a: 'When you launch a campaign, status changes (PENDING -> SENT -> DELIVERED) stream automatically to your dashboard so you see live progress without manually refreshing the page.',
    },
    {
      q: 'Can I target specific recipients for a campaign?',
      a: 'Yes. You can manage saved contacts under Recipients and choose exactly who should receive each email campaign.',
    },
    {
      q: 'Are my contacts and campaign data private?',
      a: 'Yes. All recipient lists and campaign data are strictly isolated to your authenticated account.',
    },
  ];

  return (
    <div className="landing-container">
      {/* 1. Split Hero Section */}
      <div className="landing-hero-grid">
        {/* Left Column: Copy & Actions */}
        <div>
          <h1 className="landing-hero-title">
            Send email campaigns that <span style={{ color: '#00925d' }}>reach the inbox</span>
          </h1>
          <p className="landing-hero-subtitle">
            MailStream Pro makes it simple to manage contacts, compose targeted email campaigns, and monitor delivery status live in real time.
          </p>

          {/* Action Buttons */}
          <div className="landing-hero-actions">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary landing-btn-hero">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary landing-btn-hero">
                  Get Started Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary landing-btn-hero">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#475569', fontWeight: '500' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} style={{ color: '#00925d' }} /> Contact Management
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={16} style={{ color: '#00925d' }} /> Live Delivery Status
            </span>
          </div>
        </div>

        {/* Right Column: MacBook Window UI Preview */}
        <div
          style={{
            borderRadius: '14px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            background: '#ffffff',
          }}
        >
          {/* Top Bar */}
          <div style={{ background: '#0f172a', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '0.5rem', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                mailstream-pro.app / campaign-analytics
              </span>
            </div>
          </div>

          {/* App Preview Body */}
          <div style={{ padding: '1.25rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Active Campaign</div>
                <h3 style={{ fontSize: '1.1rem', color: '#0f172a', margin: '0.1rem 0 0 0' }}>Welcome & Onboarding Campaign</h3>
              </div>
              <div>
                <span className="badge badge-delivered">Delivered (100%)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Target Audience</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginTop: '0.1rem' }}>2 Recipients</div>
              </div>
              <div style={{ background: '#ffffff', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Delivered to Inbox</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#00925d', marginTop: '0.1rem' }}>2 (100%)</div>
              </div>
            </div>

            {/* Recipient Status Table */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                  <tr>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'left', color: '#475569' }}>RECIPIENT</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'left', color: '#475569' }}>EMAIL</th>
                    <th style={{ padding: '0.6rem 0.85rem', textAlign: 'left', color: '#475569' }}>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0.85rem', fontWeight: '600' }}>Ramadan Adewale</td>
                    <td style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>ramadanadex111@gmail.com</td>
                    <td style={{ padding: '0.6rem 0.85rem' }}><span className="badge badge-delivered">DELIVERED</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.6rem 0.85rem', fontWeight: '600' }}>Rarevision Team</td>
                    <td style={{ padding: '0.6rem 0.85rem', color: '#64748b' }}>rarevisionns@gmail.com</td>
                    <td style={{ padding: '0.6rem 0.85rem' }}><span className="badge badge-delivered">DELIVERED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Key Performance Metric Strip */}
      <div className="landing-metrics-strip">
        <div className="landing-metric-item">
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#00925d', letterSpacing: '-0.02em' }}>99.8%</div>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>Inbox Delivery Rate</div>
        </div>
        <div className="landing-metric-item">
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>&lt; 1.2s</div>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>Avg Dispatch Latency</div>
        </div>
        <div className="landing-metric-item">
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#00925d', letterSpacing: '-0.02em' }}>Real-time</div>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>Live Delivery Polling</div>
        </div>
        <div className="landing-metric-item">
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>100%</div>
          <div style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: '600', marginTop: '0.2rem' }}>Data Privacy Isolation</div>
        </div>
      </div>

      {/* 3. Deep-Dive Feature 1: Real-Time Live Delivery Intelligence */}
      <div className="landing-feature-grid">
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#00925d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            REAL-TIME MONITORING
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem' }}>
            Watch dispatches update live without refreshing
          </h2>
          <p style={{ color: '#475569', fontSize: '1.02rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
            Never guess whether your email landed in your customer's inbox. MailStream Pro streams real-time delivery status transitions directly onto your dashboard.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#e6f4ea', color: '#00925d', borderRadius: '50%', padding: '0.25rem', marginTop: '0.1rem' }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Automated Status Transitions</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Recipient rows update automatically from SENT to DELIVERED in seconds.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#e6f4ea', color: '#00925d', borderRadius: '50%', padding: '0.25rem', marginTop: '0.1rem' }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Detailed Audit Logs</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Inspect specific recipient delivery timestamps and error diagnostics if any email fails.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Visual Widget */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00925d', display: 'inline-block' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#00925d' }}>STREAMING DELIVERIES</span>
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>Updated just now</span>
          </div>

          {/* Progress Bar Container */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f1f5f9', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>
              <span>Campaign Dispatch Progress</span>
              <span style={{ color: '#00925d' }}>100% Completed</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#00925d', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
            <div style={{ background: '#e6f4ea', padding: '0.75rem 0.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#00925d' }}>100%</div>
              <div style={{ fontSize: '0.72rem', color: '#00925d', fontWeight: '700', marginTop: '0.1rem' }}>DELIVERED</div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '0.75rem 0.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#64748b' }}>0</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', marginTop: '0.1rem' }}>PENDING</div>
            </div>
            <div style={{ background: '#fef2f2', padding: '0.75rem 0.5rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444' }}>0</div>
              <div style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: '700', marginTop: '0.1rem' }}>FAILED</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Deep-Dive Feature 2: Contact & Audience Management */}
      <div className="landing-feature-grid">
        {/* Left Visual Card */}
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <Search size={16} style={{ color: '#64748b' }} />
            <span style={{ fontSize: '0.88rem', color: '#64748b' }}>Search contacts by name or email...</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Ramadan Adewale</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>ramadanadex111@gmail.com</div>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#e6f4ea', color: '#00925d', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                Active Contact
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', border: '1px solid #f1f5f9', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Rarevision Team</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>rarevisionns@gmail.com</div>
              </div>
              <span style={{ fontSize: '0.75rem', background: '#e6f4ea', color: '#00925d', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: '600' }}>
                Active Contact
              </span>
            </div>
          </div>
        </div>

        {/* Right Copy Column */}
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#00925d', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            AUDIENCE MANAGEMENT
          </div>
          <h2 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', lineHeight: 1.2, marginBottom: '1rem' }}>
            Organize your recipient list with ease
          </h2>
          <p style={{ color: '#475569', fontSize: '1.02rem', lineHeight: '1.65', marginBottom: '1.5rem' }}>
            Maintain clean contact records, update emails instantly, and target specific audience segments for maximum engagement.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#e6f4ea', color: '#00925d', borderRadius: '50%', padding: '0.25rem', marginTop: '0.1rem' }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Instant Search & Pagination</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Quickly locate recipient records across hundreds of contacts.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ background: '#e6f4ea', color: '#00925d', borderRadius: '50%', padding: '0.25rem', marginTop: '0.1rem' }}>
                <Check size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Targeted Campaign Selection</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem' }}>Pick exact recipients or send to your entire audience list in one click.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clean 3-Step Horizontal Stepper (No AI Cards) */}
      <div style={{ margin: '5rem 0' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.1rem', color: '#0f172a', fontWeight: '800' }}>How MailStream Pro Works</h2>
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '0.4rem' }}>
            Launch your campaign in 3 simple steps
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {/* Step 1 */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00925d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STEP 01
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>
              Save Your Recipients
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Add contact names and email addresses under Recipients. Organize contacts with built-in search tools.
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00925d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STEP 02
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>
              Compose & Select Audience
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Draft your email subject line and message content. Choose target contacts using our campaign creation wizard.
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#00925d', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              STEP 03
            </div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '700', marginBottom: '0.5rem' }}>
              Dispatch & Track Live
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
              Hit dispatch and watch live delivery status updates update automatically right on your campaign monitor screen.
            </p>
          </div>
        </div>
      </div>

      {/* 6. FAQ Accordion */}
      <div style={{ marginBottom: '5rem', maxWidth: '800px', margin: '0 auto 5rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#0f172a', fontWeight: '800' }}>Frequently Asked Questions</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.4rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.98rem',
                  fontWeight: '600',
                  color: '#0f172a',
                }}
              >
                <span>{faq.q}</span>
                {openFaq === index ? <ChevronUp size={18} style={{ color: '#00925d' }} /> : <ChevronDown size={18} style={{ color: '#64748b' }} />}
              </button>
              {openFaq === index && (
                <div style={{ padding: '0 1.4rem 1.1rem 1.4rem', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Bottom Conversion Banner */}
      <div
        style={{
          background: '#00925d',
          borderRadius: '14px',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(0, 146, 93, 0.3)',
        }}
      >
        <h2 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.85rem' }}>
          Ready to launch your email campaign?
        </h2>
        <p style={{ fontSize: '1.05rem', opacity: 0.95, maxWidth: '560px', margin: '0 auto 1.75rem auto', lineHeight: '1.6' }}>
          Create your account today and start sending targeted emails with MailStream Pro.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '700', color: '#00925d' }}>
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/register" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: '700', color: '#00925d' }}>
              Get Started Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

