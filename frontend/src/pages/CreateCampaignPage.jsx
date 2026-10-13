import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Send, Users, FileText, CheckCircle2, ArrowRight, ArrowLeft, Search, AlertCircle } from 'lucide-react';

export const CreateCampaignPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [step, setStep] = useState(1);

  // Form states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedRecipientIds, setSelectedRecipientIds] = useState([]);

  // Recipients list for step 2
  const [recipients, setRecipients] = useState([]);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load existing campaign data if editing
  useEffect(() => {
    if (isEditing) {
      const fetchExistingCampaign = async () => {
        try {
          const res = await api.get(`/campaigns/${id}`);
          if (res.success && res.data.campaign) {
            const camp = res.data.campaign;
            setName(camp.name);
            setSubject(camp.subject);
            setContent(camp.content);
          }

          const recRes = await api.get(`/campaigns/${id}/recipients?limit=500`);
          if (recRes.success && recRes.data.recipients) {
            const targetIds = recRes.data.recipients
              .map((cr) => cr.recipientId?._id || cr.recipientId)
              .filter(Boolean);
            setSelectedRecipientIds(targetIds);
          }
        } catch (err) {
          setError(err.message || 'Error loading campaign details for editing.');
        }
      };
      fetchExistingCampaign();
    }
  }, [id, isEditing]);

  useEffect(() => {
    const loadAllRecipients = async () => {
      setLoadingRecipients(true);
      try {
        const res = await api.get(`/recipients?page=1&limit=500&search=${encodeURIComponent(recipientSearch)}`);
        if (res.success) {
          setRecipients(res.data.recipients);
        }
      } catch (err) {
        console.error('Error loading recipients for campaign:', err);
      } finally {
        setLoadingRecipients(false);
      }
    };

    if (step === 2) {
      loadAllRecipients();
    }
  }, [step, recipientSearch]);

  const toggleRecipient = (id) => {
    if (selectedRecipientIds.includes(id)) {
      setSelectedRecipientIds(selectedRecipientIds.filter((item) => item !== id));
    } else {
      setSelectedRecipientIds([...selectedRecipientIds, id]);
    }
  };

  const selectAllRecipients = () => {
    const currentIds = recipients.map((r) => r._id);
    const combined = Array.from(new Set([...selectedRecipientIds, ...currentIds]));
    setSelectedRecipientIds(combined);
  };

  const clearSelectedRecipients = () => {
    setSelectedRecipientIds([]);
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1) {
      if (!name || !subject || !content) {
        setError('Please fill in campaign name, subject line, and content.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (selectedRecipientIds.length === 0) {
        setError('Please select at least one recipient for this campaign.');
        return;
      }
      setStep(3);
    }
  };

  const handleSaveCampaign = async (shouldSendImmediately = false) => {
    setError('');
    setSubmitting(true);
    try {
      let campaignId = id;

      if (isEditing) {
        const res = await api.patch(`/campaigns/${id}`, {
          name,
          subject,
          content,
          recipientIds: selectedRecipientIds,
        });
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await api.post('/campaigns', {
          name,
          subject,
          content,
          recipientIds: selectedRecipientIds,
        });
        if (res.success && res.data.campaign) {
          campaignId = res.data.campaign._id;
        } else {
          throw new Error(res.message);
        }
      }

      if (shouldSendImmediately && campaignId) {
        await api.post(`/campaigns/${campaignId}/send`);
      }

      navigate(`/campaigns/${campaignId}`);
    } catch (err) {
      setError(err.message || 'Failed to save campaign');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
      <h1 style={{ fontSize: '1.6rem', color: '#fff', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
        {isEditing ? 'Edit Campaign' : 'Create New Campaign'}
      </h1>
      <p style={{ color: '#6b6b6b', fontSize: '0.88rem' }}>
        {isEditing ? 'Modify your campaign settings and recipient audience' : 'Compose your message and select recipient target list'}
      </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="glass-panel stepper-wrapper">
        <div className={`stepper-item ${step >= 1 ? 'active' : ''}`}>
          <div className="stepper-number">1</div>
          <span className="stepper-label">Content</span>
        </div>

        <div className={`stepper-line ${step >= 2 ? 'active' : ''}`} />

        <div className={`stepper-item ${step >= 2 ? 'active' : ''}`}>
          <div className="stepper-number">2</div>
          <span className="stepper-label">Audience</span>
        </div>

        <div className={`stepper-line ${step >= 3 ? 'active' : ''}`} />

        <div className={`stepper-item ${step >= 3 ? 'active' : ''}`}>
          <div className="stepper-number">3</div>
          <span className="stepper-label">Review</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* STEP 1: Campaign Details */}
      {step === 1 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: '600' }}>
            <FileText size={18} style={{ color: '#10b981' }} /> Step 1: Campaign Information
          </h3>

          <div className="form-group">
            <label className="form-label">Campaign Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Monthly Newsletter"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Line</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Exciting updates for October"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Body</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '160px' }}
              placeholder="Write your email content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Select Audience <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Targeting / Recipient Selection */}
      {step === 2 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: '600' }}>
              <Users size={18} style={{ color: '#38bdf8' }} /> Step 2: Target Audience ({selectedRecipientIds.length} Selected)
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={selectAllRecipients}>
                Select All
              </button>
              <button className="btn btn-secondary btn-sm" onClick={clearSelectedRecipients}>
                Clear
              </button>
            </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search contacts..."
              value={recipientSearch}
              onChange={(e) => setRecipientSearch(e.target.value)}
            />
          </div>

          {loadingRecipients ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ width: '28px', height: '28px' }} />
            </div>
          ) : recipients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No recipients found. Please add recipients from the Recipients page first.
            </div>
          ) : (
          <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)' }}>
              {recipients.map((rec) => {
                const isSelected = selectedRecipientIds.includes(rec._id);
                return (
                  <div
                    key={rec._id}
                    onClick={() => toggleRecipient(rec._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(16,185,129,0.08)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} // Handled by div click
                        style={{ cursor: 'pointer', accentColor: '#10b981' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.88rem', color: '#ededed' }}>{rec.firstName} {rec.lastName}</div>
                        <div style={{ fontSize: '0.78rem', color: '#6b6b6b' }}>{rec.email}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={15} style={{ color: '#10b981' }} />}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </button>
            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Review & Confirm <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Send */}
      {step === 3 && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: '600' }}>
            <Send size={18} style={{ color: '#10b981' }} /> Step 3: Review & Launch Campaign
          </h3>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Campaign Name:</span>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff', marginTop: '0.2rem' }}>{name}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Subject Line:</span>
              <div style={{ fontWeight: '600', color: '#ededed', marginTop: '0.2rem' }}>{subject}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Targeted Recipients Count:</span>
              <div style={{ fontWeight: '700', color: '#10b981', marginTop: '0.2rem' }}>{selectedRecipientIds.length} Recipients Selected</div>
            </div>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#6b6b6b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Email Deliverable Preview:</span>
              {/* Dark email mock window */}
              <div style={{ marginTop: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#070707', overflow: 'hidden', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
                  <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
                  <span style={{ marginLeft: '0.5rem', fontFamily: 'monospace', fontSize: '0.7rem', color: '#6b6b6b' }}>email_preview.html</span>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>MailStream Pro</span>
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.72rem' }}>MailStream Pro Template</span>
                </div>
                <div style={{ padding: '1.25rem', background: '#0a0a0a' }}>
                  <h3 style={{ margin: '0 0 0.75rem 0', color: '#fff', fontSize: '1rem', fontWeight: '700' }}>{subject || 'No Subject Specified'}</h3>
                  <div style={{ fontSize: '0.88rem', color: '#a1a1a1', whiteSpace: 'pre-wrap', lineHeight: '1.65' }}>
                    {content || 'No email message content provided yet...'}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '9px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.74rem', color: '#6b6b6b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Sent via MailStream Pro Engine</span>
                  <span style={{ fontWeight: '600', color: '#10b981' }}>MailStream Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={() => setStep(2)} disabled={submitting}>
              <ArrowLeft size={16} /> Back
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => handleSaveCampaign(false)} disabled={submitting}>
                Save as Draft
              </button>
              <button className="btn btn-primary" onClick={() => handleSaveCampaign(true)} disabled={submitting}>
                {submitting ? (
                  <span className="spinner" style={{ width: '18px', height: '18px' }} />
                ) : (
                  <>
                    <Send size={18} /> Send Campaign Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
