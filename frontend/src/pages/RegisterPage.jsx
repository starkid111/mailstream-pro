import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters long.'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const iconStyle = { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#6b6b6b', pointerEvents: 'none' };
  const eyeBtnStyle = { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b6b6b', display: 'flex', alignItems: 'center', padding: '0.2rem' };

  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '2rem 1rem',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(16,185,129,0.08), transparent 70%)',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
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
            <UserPlus size={22} style={{ color: '#fff' }} />
          </div>
          <h2 style={{ fontSize: '1.65rem', color: '#fff', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '0.4rem' }}>
            Create your account
          </h2>
          <p style={{ color: '#a1a1a1', fontSize: '0.9rem' }}>
            Start sending with MailStream Pro
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={15} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={16} style={iconStyle} />
              <input type="text" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={iconStyle} />
              <input type="email" className="form-input" style={{ paddingLeft: '2.5rem' }} placeholder="john@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input type={showPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle} title={showPassword ? 'Hide' : 'Show'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={iconStyle} />
              <input type={showConfirmPassword ? 'text' : 'password'} className="form-input" style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }} placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={eyeBtnStyle} title={showConfirmPassword ? 'Hide' : 'Show'}>
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem', borderRadius: '12px', fontSize: '0.95rem' }} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: '18px', height: '18px' }} /> : <><UserPlus size={17} /> Create Account</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: '#6b6b6b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600', color: '#10b981' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
