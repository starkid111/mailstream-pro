import React, { useState } from 'react';
import { Modal } from './Modal';
import { api } from '../services/api';
import { Radio, CheckCircle, AlertTriangle, Send } from 'lucide-react';

export const WebhookSimulatorModal = ({ isOpen, onClose, campaignId, onSimulated }) => {
  const [status, setStatus] = useState('DELIVERED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.post('/webhooks/simulate', {
        campaignId,
        status,
      });

      if (res.success) {
        setSuccess(res.message);
        setTimeout(() => {
          onSimulated();
          onClose();
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to trigger simulated webhook event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simulate Provider Delivery Webhook">
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        In real production environments, email providers (e.g. SendGrid, Mailgun) send async webhook events when an email is delivered or bounces. Use this control to simulate provider events for this campaign.
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="form-group">
        <label className="form-label">Simulated Delivery Event</label>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="simStatus"
              value="DELIVERED"
              checked={status === 'DELIVERED'}
              onChange={(e) => setStatus(e.target.value)}
            />
            <span style={{ color: '#4ade80', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={16} /> DELIVERED
            </span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="simStatus"
              value="FAILED"
              checked={status === 'FAILED'}
              onChange={(e) => setStatus(e.target.value)}
            />
            <span style={{ color: '#f87171', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <AlertTriangle size={16} /> FAILED (Bounce/Reject)
            </span>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSimulate} disabled={loading}>
          {loading ? (
            <span className="spinner" style={{ width: '16px', height: '16px' }} />
          ) : (
            <>
              <Send size={16} /> Fire Provider Webhook
            </>
          )}
        </button>
      </div>
    </Modal>
  );
};
