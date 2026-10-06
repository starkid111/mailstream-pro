import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { WebhookSimulatorModal } from '../components/WebhookSimulatorModal';
import { Send, CheckCircle2, XCircle, Clock, Radio, ArrowLeft, RefreshCw, AlertCircle, FileText, Edit2, ExternalLink } from 'lucide-react';

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
  
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);

  const fetchCampaignDetails = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await api.get(`/campaigns/${id}`);
      if (res.success) {
        setCampaign(res.data.campaign);
      }
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

  // Automatic real-time status polling (updates SENT -> DELIVERED live without page refresh)
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
    return (
      <div className="alert alert-error">
        <AlertCircle size={16} /> {error}
      </div>
    );
  }

  const stats = campaign?.stats || { totalRecipients: 0, sentCount: 0, deliveredCount: 0, failedCount: 0, pendingCount: 0, deliveryRate: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/campaigns" className="btn btn-secondary btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{campaign?.name}</h1>
              <Badge status={campaign?.status} />
            </div>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Subject: "{campaign?.subject}"</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { fetchCampaignDetails(); fetchCampaignRecipients(pagination.page); }}>
            <RefreshCw size={14} /> Refresh Data
          </button>

          {campaign?.status === 'DRAFT' && (
            <Link to={`/campaigns/${id}/edit`} className="btn btn-secondary btn-sm">
              <Edit2 size={14} /> Edit Draft
            </Link>
          )}

          <button className="btn btn-primary btn-sm" onClick={handleSendNow} disabled={sending}>
            {sending ? <span className="spinner" style={{ width: '14px', height: '14px' }} /> : <><Send size={14} /> {campaign?.status === 'DRAFT' ? 'Send Campaign Now' : 'Re-send Email Campaign'}</>}
          </button>

          {(campaign?.status === 'SENT' || campaign?.status === 'SENDING') && (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsSimulatorOpen(true)} style={{ borderColor: '#0284c7', color: '#0284c7' }}>
              <Radio size={14} /> Simulate Webhook Delivery
            </button>
          )}
        </div>
      </div>

      {actionSuccess && <div className="alert alert-success">{actionSuccess}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Analytics Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Target Audience</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#0f172a' }}>{stats.totalRecipients}</div>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Sent Emails</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#0284c7' }}>{stats.sentCount}</div>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Delivered</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#007a4e' }}>{stats.deliveredCount}</div>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Failed / Bounced</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#dc2626' }}>{stats.failedCount}</div>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Delivery Success Rate</span>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.35rem', color: '#9333ea' }}>{stats.deliveryRate}%</div>
        </div>
      </div>

      {/* Content Preview Box */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <FileText size={16} /> Dispatched Email Template Preview
        </h4>
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
          <div style={{ background: '#00925d', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#ffffff', fontWeight: '700', fontSize: '1rem', letterSpacing: '-0.3px' }}>MailStream Pro</span>
            <span style={{ color: '#dcfce7', fontSize: '0.75rem', fontWeight: '500' }}>MailStream Pro Template</span>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', color: '#0f172a', fontSize: '1.1rem', fontWeight: '700' }}>{campaign?.subject}</h3>
            <div style={{ fontSize: '0.92rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {campaign?.content}
            </div>
          </div>
          <div style={{ background: '#f8fafc', padding: '10px 16px', borderTop: '1px solid #e2e8f0', fontSize: '0.78rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Targeted Audience Delivery</span>
            <span style={{ fontWeight: '600', color: '#00925d' }}>Powered by MailStream Pro</span>
          </div>
        </div>
      </div>

      {/* Recipient-level Delivery Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ color: '#0f172a' }}>Recipient Delivery Status Breakdown</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
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
                      <td style={{ fontWeight: '600' }}>
                        {cr.recipientId ? `${cr.recipientId.firstName} ${cr.recipientId.lastName}` : 'Unknown'}
                      </td>
                      <td style={{ color: '#64748b' }}>
                        {cr.recipientId?.email || 'N/A'}
                        {cr.failureReason && (
                          <div style={{ fontSize: '0.78rem', color: '#dc2626', marginTop: '0.25rem', maxWidth: '300px', lineHeight: '1.3' }}>
                            ⚠️ {cr.failureReason}
                          </div>
                        )}
                      </td>
                      <td>
                        <Badge status={cr.status} />
                      </td>
                      <td style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: '#64748b' }}>
                        {cr.providerMessageId || 'Pending dispatch...'}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
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
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>N/A</span>
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

      {/* Webhook Simulator Modal */}
      <WebhookSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        campaignId={id}
        onSimulated={() => {
          fetchCampaignDetails();
          fetchCampaignRecipients(pagination.page);
        }}
      />
    </div>
  );
};
