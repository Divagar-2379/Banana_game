import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP + New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await forgotPassword(email);
        if (result.success) {
            setSuccess(result.message);
            setStep(2);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters');
        setLoading(true);
        const result = await resetPassword(email, otp, newPassword);
        if (result.success) {
            setSuccess('Password reset! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={styles.root}>
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            {/* Right: Image Panel */}
            <div style={styles.imagePanel}>
                <img src="/auth-bg.png" alt="Banana Hunt" style={styles.bgImage} />
                <div style={styles.imagePanelOverlay}>
                    <div style={styles.gameBadge}>🔐 ACCOUNT RECOVERY</div>
                    <h1 style={styles.heroTitle}>Secure Your<br /><span style={styles.heroAccent}>Account</span></h1>
                    <p style={styles.heroDesc}>Reset your password safely and get back to hunting bananas.</p>
                </div>
            </div>

            {/* Left: Form Panel */}
            <div style={styles.formPanel}>
                <div style={styles.formInner}>
                    <div style={styles.logoRow}>
                        <div style={styles.logoIcon}>🍌</div>
                        <span style={styles.logoText}>Banana Hunt</span>
                    </div>

                    {/* Step indicator */}
                    <div style={styles.stepRow}>
                        <div style={{ ...styles.stepDot, background: '#f5c518' }}>1</div>
                        <div style={{ ...styles.stepLine, background: step >= 2 ? '#f5c518' : 'rgba(255,255,255,0.15)' }} />
                        <div style={{ ...styles.stepDot, background: step >= 2 ? '#f5c518' : 'rgba(255,255,255,0.15)', color: step >= 2 ? '#0a0a0f' : 'rgba(255,255,255,0.5)' }}>2</div>
                    </div>

                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>{step === 1 ? 'Forgot Password?' : 'Enter Reset Code'}</h2>
                        <p style={styles.formSubtitle}>
                            {step === 1
                                ? 'Enter your email and we will send you a reset code'
                                : `We sent a code to ${email}`}
                        </p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>⚠ {error}</div>
                    )}
                    {success && step === 2 && (
                        <div style={styles.successBox}>✓ {success}</div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestReset} style={styles.form}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>✉</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@example.com"
                                        style={styles.input}
                                        onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                        onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...styles.submitBtn, opacity: loading ? 0.8 : 1 }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(245,197,24,0.5)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(245,197,24,0.35)'; }}
                            >
                                {loading ? 'Sending...' : '📧 Send Reset Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} style={styles.form}>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>6-Digit Code</label>
                                <div style={{ ...styles.inputWrapper, justifyContent: 'center' }}>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/, '').slice(0, 6))}
                                        required
                                        placeholder="000000"
                                        maxLength={6}
                                        autoFocus
                                        style={{
                                            ...styles.input,
                                            textAlign: 'center',
                                            fontSize: '28px',
                                            letterSpacing: '0.4em',
                                            fontWeight: 800,
                                            padding: '16px 0',
                                        }}
                                        onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                        onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, textAlign: 'center' }}>
                                    Check your server console for the code (dev mode)
                                </p>
                            </div>
                            <div style={styles.fieldGroup}>
                                <label style={styles.label}>New Password</label>
                                <div style={styles.inputWrapper}>
                                    <span style={styles.inputIcon}>🔒</span>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength="6"
                                        placeholder="New secure password"
                                        style={styles.input}
                                        onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                        onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ ...styles.submitBtn, opacity: loading ? 0.8 : 1 }}
                                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(245,197,24,0.5)'; }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(245,197,24,0.35)'; }}
                            >
                                {loading ? 'Resetting...' : '🔑 Reset Password'}
                            </button>
                        </form>
                    )}

                    <p style={styles.switchText}>
                        Remembered it?{' '}
                        <Link to="/login" style={styles.switchLink}>Back to Sign In →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    root: {
        minHeight: '100vh', display: 'flex', flexDirection: 'row-reverse',
        background: '#0a0a0f', position: 'relative', overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    blob1: {
        position: 'absolute', top: '-100px', left: '-100px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,197,24,0.10) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none',
    },
    blob2: {
        position: 'absolute', bottom: '-200px', right: '500px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,0,0.08) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none',
    },
    imagePanel: {
        flex: 1, position: 'relative', overflow: 'hidden', display: 'none',
    },
    bgImage: { width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 },
    imagePanelOverlay: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.25) 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        justifyContent: 'flex-end', padding: '48px',
    },
    gameBadge: {
        background: 'rgba(245,197,24,0.2)', border: '1px solid rgba(245,197,24,0.4)',
        color: '#f5c518', fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em',
        borderRadius: '20px', padding: '6px 14px', marginBottom: '16px',
        backdropFilter: 'blur(10px)',
    },
    heroTitle: {
        fontSize: '52px', fontWeight: 900, lineHeight: 1.1, color: '#fff',
        margin: '0 0 12px', textShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    heroAccent: { color: '#f5c518', textShadow: '0 0 40px rgba(245,197,24,0.6)' },
    heroDesc: { color: 'rgba(255,255,255,0.75)', fontSize: '16px', fontWeight: 500, margin: 0 },
    formPanel: {
        width: '100%', maxWidth: '480px', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.06)',
    },
    formInner: { width: '100%', maxWidth: '400px' },
    logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' },
    logoIcon: {
        width: '40px', height: '40px', background: 'linear-gradient(135deg, #f5c518, #ff8c00)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', boxShadow: '0 4px 16px rgba(245,197,24,0.4)',
    },
    logoText: { fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    stepRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' },
    stepDot: {
        width: '28px', height: '28px', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '12px', fontWeight: 800, color: '#0a0a0f',
        transition: 'all 0.3s',
    },
    stepLine: { flex: 1, height: '2px', borderRadius: '99px', transition: 'background 0.3s' },
    formHeader: { marginBottom: '28px' },
    formTitle: { fontSize: '30px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.03em' },
    formSubtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, margin: 0 },
    errorBox: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#fc8181', borderRadius: '12px', padding: '12px 16px',
        fontSize: '13px', fontWeight: 600, marginBottom: '20px',
    },
    successBox: {
        background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)',
        color: '#86efac', borderRadius: '12px', padding: '12px 16px',
        fontSize: '13px', fontWeight: 600, marginBottom: '20px',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' },
    inputWrapper: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: '14px', padding: '0 16px', transition: 'border-color 0.2s',
    },
    inputIcon: { fontSize: '15px', opacity: 0.5, flexShrink: 0 },
    input: {
        flex: 1, background: 'transparent', border: 'none', outline: 'none',
        color: '#fff', fontSize: '14px', fontWeight: 500, padding: '15px 0',
        fontFamily: 'inherit',
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #f5c518 0%, #ff8c00 100%)',
        border: 'none', borderRadius: '14px', padding: '15px',
        fontSize: '15px', fontWeight: 800, color: '#0a0a0f',
        cursor: 'pointer', transition: 'all 0.25s ease',
        boxShadow: '0 8px 30px rgba(245,197,24,0.35)',
        letterSpacing: '0.02em',
    },
    switchText: {
        textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
        fontWeight: 500, marginTop: '28px',
    },
    switchLink: { color: '#f5c518', textDecoration: 'none', fontWeight: 700 },
};

export default ForgotPassword;
