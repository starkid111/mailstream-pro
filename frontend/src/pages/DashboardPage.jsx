import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { Send, Users, CheckCircle2, TrendingUp, Plus, ArrowRight, XCircle } from 'lucide-react';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns/dashboard/summary');
      if (res.success) {
        setSummary(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Header & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>Dashboard Overview</h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem' }}>
            Track campaign performance and deliverability in real-time
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/recipients" className="btn btn-secondary btn-sm">
            <Plus size={16} /> Manage Recipients
          </Link>
          <Link to="/campaigns/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Create Campaign
          </Link>
        </div>
      </div>

      {/* Summary Performance Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Total Campaigns</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7' }}>
              <Send size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', marginTop: '0.75rem', color: '#0f172a' }}>
            {summary?.totalCampaigns || 0}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Saved Recipients</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f0fdf4', color: '#00925d' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', marginTop: '0.75rem', color: '#0f172a' }}>
            {summary?.totalRecipients || 0}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Total Delivered</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#e6f4ea', color: '#007a4e' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', marginTop: '0.75rem', color: '#007a4e' }}>
            {summary?.totalDelivered || 0}
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Overall Success Rate</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f3e8ff', color: '#9333ea' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: '800', marginTop: '0.75rem', color: '#9333ea' }}>
            {summary?.deliveryRate || 0}%
          </div>
        </div>
      </div>

      {/* Recent Campaigns Deliverability Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ color: '#0f172a' }}>Recent Campaigns</h3>
          <Link to="/campaigns" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: '600', color: '#00925d' }}>
            View All Campaigns <ArrowRight size={14} />
          </Link>
        </div>

        {summary?.recentCampaigns?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
            <Send size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p>No campaigns created yet.</p>
            <Link to="/campaigns/new" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Date Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentCampaigns.map((camp) => (
                  <tr key={camp._id}>
                    <td>
                      <Link to={`/campaigns/${camp._id}`} style={{ fontWeight: '600', color: '#0f172a', textDecoration: 'none' }}>
                        {camp.name}
                      </Link>
                    </td>
                    <td>
                      <Badge status={camp.status} />
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(camp.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/campaigns/${camp._id}`} className="btn btn-secondary btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
