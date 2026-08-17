import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, ChevronLeft } from 'lucide-react';

type Mode = 'login' | 'forgot-email' | 'forgot-code' | 'forgot-password' | 'forgot-done';

export default function AdminLogin() {
  const { signInAdmin, sendResetCode, confirmReset, adminUser } = useAdminAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Redirect if already logged in as admin
  useEffect(() => {
    if (adminUser?.isAdmin) navigate('/admin/dashboard', { replace: true });
  }, [adminUser, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      await signInAdmin(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('UserNotFoundException') || msg.includes('not found')) {
        setError('No admin account found with this email address.');
      } else if (msg.includes('NotAuthorizedException') || msg.includes('Incorrect')) {
        setError('Incorrect password. Please try again.');
      } else if (msg.includes('not have admin')) {
        setError('This account does not have admin access.');
      } else {
        setError(msg || 'Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    try {
      await sendResetCode(email);
      setInfo('A verification code has been sent to your email.');
      setMode('forgot-code');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!resetCode) { setError('Please enter the verification code.'); return; }
    setMode('forgot-password');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!newPassword || !confirmPassword) { setError('Please fill in both password fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!/[A-Z]/.test(newPassword)) { setError('Include at least one uppercase letter.'); return; }
    if (!/[0-9]/.test(newPassword)) { setError('Include at least one number.'); return; }
    if (!/[^A-Za-z0-9]/.test(newPassword)) { setError('Include at least one special character.'); return; }
    setLoading(true);
    try {
      await confirmReset(email, resetCode, newPassword);
      setMode('forgot-done');
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('CodeMismatch')) setError('Invalid verification code.');
      else if (msg.includes('ExpiredCode') || msg.includes('expired')) setError('Code expired. Please request a new one.');
      else if (msg.includes('InvalidPassword') || msg.includes('password')) setError('Password does not meet requirements.');
      else setError(msg || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setMode('login'); setError(''); setInfo('');
    setResetCode(''); setNewPassword(''); setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-gray-500 block mb-2">Admin Portal</span>
          <h1 className="text-3xl font-black italic text-white" style={{ fontFamily: 'Georgia, serif' }}>SENDSMILES</h1>
          <p className="text-gray-500 text-xs mt-1 font-mono">Operations Dashboard</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 shadow-2xl space-y-6">

          {/* Error / Info banners */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-950 border border-red-800 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {info && (
            <div className="flex items-start gap-2 p-3 bg-emerald-950 border border-emerald-800 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <>
              <div>
                <h2 className="text-white font-bold text-lg">Sign In</h2>
                <p className="text-gray-500 text-xs mt-1">Admin access only</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold font-mono">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="email" required value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="admin@sendsmiles.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none font-mono placeholder-gray-600"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold font-mono">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none placeholder-gray-600"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <button type="button" onClick={() => { setError(''); setInfo(''); setMode('forgot-email'); }}
                      className="text-[11px] text-red-400 hover:text-red-300 font-mono font-bold cursor-pointer">
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
                  {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
                    : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT — STEP 1: email ── */}
          {mode === 'forgot-email' && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={resetFlow} className="text-gray-500 hover:text-gray-300 cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-white font-bold text-lg">Reset Password</h2>
              </div>
              <p className="text-gray-500 text-xs">Enter your admin email to receive a verification code.</p>
              <form onSubmit={handleSendCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold font-mono">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@sendsmiles.com"
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none font-mono placeholder-gray-600" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
                  {loading ? 'Sending...' : <><span>Send Reset Code</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT — STEP 2: code ── */}
          {mode === 'forgot-code' && (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setMode('forgot-email')} className="text-gray-500 hover:text-gray-300 cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                <h2 className="text-white font-bold text-lg">Verify Code</h2>
              </div>
              <p className="text-gray-500 text-xs">Enter the 6-digit code sent to <span className="text-gray-300">{email}</span></p>
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <input type="text" required value={resetCode} onChange={e => setResetCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="123456" maxLength={6}
                  className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-xl tracking-[0.5em] font-mono focus:border-red-500 focus:outline-none placeholder-gray-600" />
                <button type="submit" className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer">
                  <span>Continue</span><ArrowRight className="w-4 h-4" />
                </button>
                <div className="text-center">
                  <button type="button" onClick={handleSendCode as any} disabled={loading} className="text-xs text-gray-500 hover:text-gray-300 font-mono cursor-pointer disabled:opacity-50">
                    Resend Code
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── FORGOT — STEP 3: new password ── */}
          {mode === 'forgot-password' && (
            <>
              <h2 className="text-white font-bold text-lg">New Password</h2>
              <p className="text-gray-500 text-xs">Min 8 chars, uppercase, lowercase, number & special character</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                {[{ label: 'New Password', val: newPassword, set: setNewPassword }, { label: 'Confirm Password', val: confirmPassword, set: setConfirmPassword }].map(({ label, val, set }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-gray-400 text-[11px] uppercase tracking-wider font-bold font-mono">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="password" required value={val} onChange={e => set(e.target.value)} placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:border-red-500 focus:outline-none placeholder-gray-600" />
                    </div>
                  </div>
                ))}
                <button type="submit" disabled={loading} className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer">
                  {loading ? 'Resetting...' : <><span>Reset Password</span><ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT — DONE ── */}
          {mode === 'forgot-done' && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center mx-auto border border-emerald-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Password Reset!</h2>
              <p className="text-gray-400 text-sm">Your password has been reset successfully.</p>
              <button onClick={resetFlow} className="w-full py-3 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest cursor-pointer">
                Back to Sign In
              </button>
            </div>
          )}

        </div>

        <p className="text-center text-gray-700 text-[11px] mt-6 font-mono">
          Admin access only · Not for customers
        </p>
      </div>
    </div>
  );
}
