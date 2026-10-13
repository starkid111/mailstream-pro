import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff, X, CheckCircle2, KeyRound } from 'lucide-react';
import { api } from '../services/api';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all required fields.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) { setForgotError('Please enter your email address.'); return; }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(res.message || 'A 6-digit code has been sent to your email.');
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.message || 'Failed to send reset code. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!resetCode || !newPassword) { setForgotError('Please enter the verification code and your new password.'); return; }
    if (newPassword.length < 6) { setForgotError('Password must be at least 6 characters long.'); return; }
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { email: forgotEmail, code: resetCode, newPassword });
      setForgotSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => {
        setEmail(forgotEmail);
        setShowForgotModal(false);
        setForgotStep(1);
        setResetCode('');
        setNewPassword('');
        setForgotSuccess('');
      }, 2000);
    } catch (err) {
      setForgotError(err.message || 'Failed to reset password. Please check your code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const openForgotModal = () => {
    setForgotEmail(email);
    setForgotStep(1);
    setForgotError('');
    setForgotSuccess('');
    setShowForgotModal(true);
  };

  const iconStyle = { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)',
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.8), 0 0 60px -20px rgba(16,185,129,0.1)',
        backdropFilter: 'blur(12px)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '14px', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #34d399, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
          }}>
            <LogIn size={22} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#fff', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Welcome back
          </h2>
          <p style={{ color: '#a1a1a1', fontSize: '0.9rem' }}>
            Sign in to your MailStream Pro account
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle} />
              <input
                type="email" className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@company.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button" onClick={openForgotModal}
                style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer' }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'} className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <><LogIn size={17} /> Sign In</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6b6b6b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '600', color: '#10b981' }}>
            Create one
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <KeyRound size={18} style={{ color: '#10b981' }} />
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Reset Password</h3>
              </div>
              <button onClick={() => setShowForgotModal(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: '#a1a1a1', borderRadius: '8px', padding: '0.3rem', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {forgotError && <div className="alert alert-error"><AlertCircle size={15} />{forgotError}</div>}
            {forgotSuccess && <div className="alert alert-success"><CheckCircle2 size={15} />{forgotSuccess}</div>}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestCode}>
                <p style={{ color: '#a1a1a1', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.55' }}>
                  Enter your account email and we'll send you a 6-digit code to reset your password.
                </p>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={iconStyle} />
                    <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="name@company.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForgotModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <p style={{ color: '#a1a1a1', fontSize: '0.88rem', marginBottom: '1.25rem', lineHeight: '1.55' }}>
                  We sent a 6-digit code to <strong style={{ color: '#ededed' }}>{forgotEmail}</strong>. Enter it below with your new password.
                </p>
                <div className="form-group">
                  <label className="form-label">6-Digit Verification Code</label>
                  <input type="text" className="form-input" placeholder="123456" maxLength={6} style={{ letterSpacing: '6px', fontSize: '1.2rem', fontWeight: '700', textAlign: 'center' }} value={resetCode} onChange={(e) => setResetCode(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={iconStyle} />
                    <input type={showNewPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} placeholder="At least 6 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', display: 'flex', alignItems: 'center' }} title={showNewPassword ? 'Hide' : 'Show'}>
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setForgotStep(1)}>Back</button>
                  <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                    {forgotLoading ? <span className="spinner" style={{ width: '16px', height: '16px' }} /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
