import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { Send, CheckCircle2, XCircle, Clock, ArrowLeft, RefreshCw, AlertCircle, FileText, Edit2, ExternalLink, Users, TrendingUp } from 'lucide-react';

export const CampaignDetailsPage = () => {
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchCampaignDetails = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await api.get(`/campaigns/${id}`);
      if (res.success) setCampaign(res.data.campaign);
    } catch (err) {
      if (!isBackground) setError(err.message || 'Failed to fetch campaign details');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const fetchCampaignRecipients = async (page = 1, filter = statusFilter) => {
    try {
      const endpoint = `/campaigns/${id}/recipients?page=${page}&limit=10${filter ? `&status=${filter}` : ''}`;
      const res = await api.get(endpoint);
      if (res.success) {
        setRecipients(res.data.recipients);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load campaign recipients:', err);
    }
  };

  useEffect(() => {
    fetchCampaignDetails(false);
    fetchCampaignRecipients(1, statusFilter);
  }, [id, statusFilter]);

  useEffect(() => {
    if (!campaign) return;
    const hasActiveStates =
      campaign.status === 'SENDING' ||
      recipients.some((r) => r.status === 'SENT' || r.status === 'PENDING');
    if (!hasActiveStates) return;
    const interval = setInterval(() => {
      fetchCampaignDetails(true);
      fetchCampaignRecipients(pagination.page, statusFilter);
    }, 2500);
    return () => clearInterval(interval);
  }, [id, campaign?.status, recipients, pagination.page, statusFilter]);

  const handleSendNow = async () => {
    setSending(true);
    setError('');
    setActionSuccess('');
    try {
      const res = await api.post(`/campaigns/${id}/send`);
      if (res.success) {
        setActionSuccess(res.message);
        fetchCampaignDetails(true);
        fetchCampaignRecipients(1);
      }
    } catch (err) {
      setError(err.message || 'Failed to send campaign');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (error && !campaign) {
    return <div className="alert alert-error"><AlertCircle size={16} /> {error}</div>;
  }

  const stats = campaign?.stats || { totalRecipients: 0, sentCount: 0, deliveredCount: 0, failedCount: 0, pendingCount: 0, deliveryRate: 0 };

  const statCards = [
    { label: 'Target Audience', value: stats.totalRecipients, color: '#a1a1a1' },
    { label: 'Sent Emails', value: stats.sentCount, color: '#38bdf8' },
    { label: 'Delivered', value: stats.deliveredCount, color: '#10b981' },
    { label: 'Failed / Bounced', value: stats.failedCount, color: '#ef4444' },
    { label: 'Delivery Success Rate', value: `${stats.deliveryRate}%`, color: '#a78bfa' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/campaigns" className="btn btn-secondary btn-icon">
            <ArrowLeft size={17} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: '700', letterSpacing: '-0.03em' }}>{campaign?.name}</h1>
              <Badge status={campaign?.status} />
            </div>
            <p style={{ color: '#6b6b6b', fontSize: '0.85rem', marginTop: '0.1rem' }}>Subject: "{campaign?.subject}"</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { fetchCampaignDetails(); fetchCampaignRecipients(pagination.page); }}>
            <RefreshCw size={13} /> Refresh Data
          </button>
          {campaign?.status === 'DRAFT' && (
            <Link to={`/campaigns/${id}/edit`} className="btn btn-secondary btn-sm">
              <Edit2 size={13} /> Edit Draft
            </Link>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleSendNow} disabled={sending}>
            {sending ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : <><Send size={13} /> {campaign?.status === 'DRAFT' ? 'Send Campaign Now' : 'Re-send Email Campaign'}</>}
          </button>
        </div>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Analytics Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1rem' }}>
        {statCards.map((s) => (
          <div key={s.label} className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b6b6b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              {s.label}
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: s.color, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Email Preview — Dark Theme */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b6b6b', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <FileText size={14} /> Email Preview
        </h4>

        {/* Dark email mock window */}
        <div style={{
          borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)',
          background: '#070707', overflow: 'hidden',
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.7), 0 0 40px -15px rgba(16,185,129,0.12)',
        }}>
          {/* Window chrome bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
          }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a2a2a', display: 'block' }} />
            <span style={{ marginLeft: '0.6rem', fontFamily: 'monospace', fontSize: '0.72rem', color: '#6b6b6b' }}>
              email_preview.html
            </span>
            <span style={{
              marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.68rem', color: '#10b981', fontFamily: 'monospace',
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block', animation: 'rs-pulse 2s infinite' }} />
              Template
            </span>
          </div>

          {/* Email header bar */}
          <div style={{
            background: 'linear-gradient(135deg, #059669, #10b981)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '7px',
                background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Send size={14} style={{ color: '#fff' }} />
              </div>
              <span style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '-0.02em' }}>MailStream Pro</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.72rem', fontWeight: '500' }}>Transactional Email</span>
          </div>

          {/* Email body */}
          <div style={{ padding: '1.5rem 1.25rem', background: '#0a0a0a' }}>
            <h3 style={{ margin: '0 0 0.85rem 0', color: '#fff', fontSize: '1.05rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
              {campaign?.subject}
            </h3>
            <div style={{ fontSize: '0.9rem', color: '#a1a1a1', whiteSpace: 'pre-wrap', lineHeight: '1.65' }}>
              {campaign?.content}
            </div>
          </div>

          {/* Email footer */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', padding: '10px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: '0.75rem', color: '#6b6b6b',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>Powered by MailStream Pro</span>
            <span style={{ color: '#10b981', fontWeight: '600' }}>MailStream Pro</span>
          </div>
        </div>
      </div>

      {/* Delivery Status Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: '#fff', fontWeight: '600', letterSpacing: '-0.02em' }}>Delivery Status</h3>
          <div className="filter-pills-wrapper">
            {['', 'PENDING', 'SENT', 'DELIVERED', 'FAILED'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st === '' ? 'ALL' : st}
              </button>
            ))}
          </div>
        </div>

        {recipients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#6b6b6b' }}>
            No recipient delivery records found matching filter.
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Recipient</th>
                    <th>Email Address</th>
                    <th>Delivery Status</th>
                    <th>Provider Message ID</th>
                    <th>Status Timestamp</th>
                    <th>Inbox Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((cr) => (
                    <tr key={cr._id}>
                      <td style={{ fontWeight: '600', color: '#ededed' }}>
                        {cr.recipientId ? `${cr.recipientId.firstName} ${cr.recipientId.lastName}` : 'Unknown'}
                      </td>
                      <td style={{ color: '#a1a1a1', fontSize: '0.88rem' }}>
                        {cr.recipientId?.email || 'N/A'}
                        {cr.failureReason && cr.status === 'FAILED' && (
                          <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem', maxWidth: '300px', lineHeight: '1.3' }}>
                            ⚠️ {cr.failureReason}
                          </div>
                        )}
                      </td>
                      <td><Badge status={cr.status} /></td>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#6b6b6b' }}>
                        {cr.providerMessageId || 'Pending dispatch...'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#6b6b6b' }}>
                        {cr.deliveredAt
                          ? `Delivered: ${new Date(cr.deliveredAt).toLocaleTimeString()}`
                          : cr.failedAt
                          ? `Failed: ${new Date(cr.failedAt).toLocaleTimeString()}`
                          : cr.sentAt
                          ? `Sent: ${new Date(cr.sentAt).toLocaleTimeString()}`
                          : 'Pending'}
                      </td>
                      <td>
                        {cr.previewUrl ? (
                          <a
                            href={cr.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '0.78rem', gap: '0.35rem', padding: '0.3rem 0.6rem' }}
                            title="Open Ethereal Web Inbox"
                          >
                            <ExternalLink size={12} /> View Email ↗
                          </a>
                        ) : (
                          <span style={{ color: '#6b6b6b', fontSize: '0.8rem' }}>N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              onPageChange={(p) => fetchCampaignRecipients(p, statusFilter)}
            />
          </>
        )}
      </div>
    </div>
  );
};
