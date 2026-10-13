import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { Send, Plus, Search, Trash2, Eye, Users, Edit2 } from 'lucide-react';

export const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingCampaign, setDeletingCampaign] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/campaigns?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setCampaigns(res.data.campaigns);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch campaigns list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(1, search); }, [search]);

  const handleDeleteCampaign = async () => {
    if (!deletingCampaign) return;
    setSubmitting(true);
    try {
      await api.delete(`/campaigns/${deletingCampaign._id}`);
      setDeletingCampaign(null);
      fetchCampaigns(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete campaign');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
            Campaigns
          </h1>
          <p style={{ color: '#6b6b6b', fontSize: '0.88rem' }}>
            Manage and monitor your email campaign broadcasts.
          </p>
        </div>
        <Link to="/campaigns/new" className="btn btn-primary btn-sm">
          <Plus size={15} /> Create Campaign
        </Link>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search campaigns by name or subject line..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ width: '36px', height: '36px' }} />
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b6b6b' }}>
            <Send size={44} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#a1a1a1', marginBottom: '0.5rem' }}>No Campaigns Found</h3>
            <p style={{ fontSize: '0.88rem', color: '#6b6b6b' }}>
              {search ? 'No campaigns matched your search filter.' : 'Create your first email campaign to target recipients.'}
            </p>
            {!search && (
              <Link to="/campaigns/new" className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }}>
                <Plus size={15} /> Create Campaign
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Campaign Name & Subject</th>
                    <th>Status</th>
                    <th>Recipients</th>
                    <th>Delivered / Sent</th>
                    <th>Date Created</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((camp) => (
                    <tr key={camp._id}>
                      <td>
                        <Link to={`/campaigns/${camp._id}`} style={{ fontWeight: '600', color: '#ededed', textDecoration: 'none' }}>
                          {camp.name}
                        </Link>
                        <div style={{ fontSize: '0.8rem', color: '#6b6b6b', marginTop: '0.15rem' }}>{camp.subject}</div>
                      </td>
                      <td><Badge status={camp.status} /></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', color: '#a1a1a1' }}>
                          <Users size={13} style={{ color: '#6b6b6b' }} />
                          {camp.stats?.totalRecipients || 0}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>{camp.stats?.deliveredCount || 0}</span>
                        <span style={{ color: '#6b6b6b' }}> / {camp.stats?.sentCount || 0}</span>
                      </td>
                      <td style={{ color: '#6b6b6b', fontSize: '0.85rem' }}>
                        {new Date(camp.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          {camp.status === 'DRAFT' && (
                            <Link to={`/campaigns/${camp._id}/edit`} className="btn btn-secondary btn-sm" title="Edit Campaign Draft">
                              <Edit2 size={14} /> Edit
                            </Link>
                          )}
                          <Link to={`/campaigns/${camp._id}`} className="btn btn-secondary btn-sm" title="View Details">
                            <Eye size={14} /> Details
                          </Link>
                          <button
                            className="btn btn-danger btn-icon"
                            onClick={() => setDeletingCampaign(camp)}
                            title="Delete Campaign"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
              onPageChange={(p) => fetchCampaigns(p, search)}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingCampaign} onClose={() => setDeletingCampaign(null)} title="Confirm Campaign Delete">
        <p style={{ color: '#a1a1a1', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Are you sure you want to delete campaign <strong style={{ color: '#ededed' }}>"{deletingCampaign?.name}"</strong>? All associated delivery records will be removed.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setDeletingCampaign(null)} disabled={submitting}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteCampaign} disabled={submitting}>
            {submitting ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Delete Campaign'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
