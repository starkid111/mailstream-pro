import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { Pagination } from '../components/Pagination';
import { Users, Plus, Search, Edit2, Trash2, Mail, User as UserIcon, AlertCircle } from 'lucide-react';

export const RecipientsPage = () => {
  const [recipients, setRecipients] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [deletingRecipient, setDeletingRecipient] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRecipients = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/recipients?page=${page}&limit=10&search=${encodeURIComponent(searchQuery)}`);
      if (res.success) {
        setRecipients(res.data.recipients);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Error fetching recipients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecipients(1, search); }, [search]);

  const handleOpenAddModal = () => {
    setFirstName(''); setLastName(''); setEmail(''); setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (rec) => {
    setEditingRecipient(rec);
    setFirstName(rec.firstName); setLastName(rec.lastName); setEmail(rec.email);
    setFormError('');
  };

  const handleSaveRecipient = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!firstName || !lastName || !email) { setFormError('First name, last name, and email are required.'); return; }
    setSubmitting(true);
    try {
      if (editingRecipient) {
        await api.patch(`/recipients/${editingRecipient._id}`, { firstName, lastName, email });
        setEditingRecipient(null);
      } else {
        await api.post('/recipients', { firstName, lastName, email });
        setIsAddModalOpen(false);
      }
      fetchRecipients(pagination.page);
    } catch (err) {
      setFormError(err.message || 'Failed to save recipient.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecipient = async () => {
    if (!deletingRecipient) return;
    setSubmitting(true);
    try {
      await api.delete(`/recipients/${deletingRecipient._id}`);
      setDeletingRecipient(null);
      fetchRecipients(pagination.page);
    } catch (err) {
      setError(err.message || 'Failed to delete recipient.');
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
            Recipients
          </h1>
          <p style={{ color: '#6b6b6b', fontSize: '0.88rem' }}>
            Manage saved contacts for your email campaigns.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
          <Plus size={15} /> Add Recipient
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '0.85rem 1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' }} />
          <input
            type="text" className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search recipients by name or email address..."
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
        ) : recipients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b6b6b' }}>
            <Users size={44} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <h3 style={{ color: '#a1a1a1', marginBottom: '0.5rem' }}>No Recipients Found</h3>
            <p style={{ fontSize: '0.88rem', color: '#6b6b6b' }}>
              {search ? 'No contacts matched your search query.' : 'Get started by adding your first contact recipient.'}
            </p>
            {!search && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: '1.25rem' }} onClick={handleOpenAddModal}>
                <Plus size={15} /> Add Recipient
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Recipient Name</th>
                    <th>Email Address</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipients.map((rec) => (
                    <tr key={rec._id}>
                      <td style={{ fontWeight: '600', color: '#ededed' }}>
                        {rec.firstName} {rec.lastName}
                      </td>
                      <td style={{ color: '#a1a1a1', fontSize: '0.88rem' }}>{rec.email}</td>
                      <td style={{ color: '#6b6b6b', fontSize: '0.85rem' }}>
                        {new Date(rec.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-icon" onClick={() => handleOpenEditModal(rec)} title="Edit Recipient">
                            <Edit2 size={14} />
                          </button>
                          <button className="btn btn-danger btn-icon" onClick={() => setDeletingRecipient(rec)} title="Delete Recipient">
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
              onPageChange={(p) => fetchRecipients(p, search)}
            />
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingRecipient}
        onClose={() => { setIsAddModalOpen(false); setEditingRecipient(null); }}
        title={editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
      >
        {formError && (
          <div className="alert alert-error">
            <AlertCircle size={15} />{formError}
          </div>
        )}
        <form onSubmit={handleSaveRecipient}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" placeholder="Smith" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' }} />
              <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setEditingRecipient(null); }} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Save Recipient'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingRecipient} onClose={() => setDeletingRecipient(null)} title="Confirm Delete">
        <p style={{ color: '#a1a1a1', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Are you sure you want to remove{' '}
          <strong style={{ color: '#ededed' }}>
            {deletingRecipient?.firstName} {deletingRecipient?.lastName}
          </strong>{' '}
          from your recipients list?
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setDeletingRecipient(null)} disabled={submitting}>Cancel</button>
          <button className="btn btn-danger" onClick={handleDeleteRecipient} disabled={submitting}>
            {submitting ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Delete Recipient'}
          </button>
        </div>
      </Modal>
    </div>
  );
};
