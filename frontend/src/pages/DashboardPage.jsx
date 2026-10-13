import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Badge } from '../components/Badge';
import { Send, Users, CheckCircle2, TrendingUp, Plus, ArrowRight } from 'lucide-react';

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/campaigns/dashboard/summary');
      if (res.success) setSummary(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard summary');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <div className="spinner" style={{ width: '36px', height: '36px' }} />
      </div>
    );
  }

  if (error) return <div className="alert alert-error">{error}</div>;

  const stats = [
    { label: 'Total Campaigns', value: summary?.totalCampaigns || 0, icon: Send, color: '#a1a1a1' },
    { label: 'Saved Recipients', value: summary?.totalRecipients || 0, icon: Users, color: '#a1a1a1' },
    { label: 'Total Delivered', value: summary?.totalDelivered || 0, icon: CheckCircle2, color: '#10b981' },
    { label: 'Success Rate', value: `${summary?.deliveryRate || 0}%`, icon: TrendingUp, color: '#10b981' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.2rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#6b6b6b', fontSize: '0.88rem' }}>
            Overview of your campaigns, recipients, and deliverability.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
          <Link to="/recipients" className="btn btn-secondary btn-sm">
            <Plus size={14} /> Manage Recipients
          </Link>
          <Link to="/campaigns/new" className="btn btn-primary btn-sm">
            <Plus size={14} /> Create Campaign
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card" style={{ padding: '1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                <div style={{ fontSize: '0.78rem', color: '#6b6b6b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {stat.label}
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} style={{ color: stat.color }} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color === '#10b981' ? '#10b981' : '#ededed', letterSpacing: '-0.04em', lineHeight: 1 }}>
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Campaigns Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ color: '#fff', fontWeight: '600', letterSpacing: '-0.02em' }}>Recent Campaigns</h3>
          <Link to="/campaigns" style={{ fontSize: '0.83rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600', color: '#10b981' }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>

        {summary?.recentCampaigns?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b6b6b' }}>
            <Send size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p style={{ marginBottom: '1rem', color: '#a1a1a1' }}>No campaigns created yet.</p>
            <Link to="/campaigns/new" className="btn btn-primary btn-sm">
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
                      <Link to={`/campaigns/${camp._id}`} style={{ fontWeight: '600', color: '#ededed', textDecoration: 'none' }}>
                        {camp.name}
                      </Link>
                    </td>
                    <td><Badge status={camp.status} /></td>
                    <td style={{ color: '#6b6b6b', fontSize: '0.85rem' }}>
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
