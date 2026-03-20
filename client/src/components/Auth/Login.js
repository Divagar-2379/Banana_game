import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/play');
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <div style={styles.root}>
            {/* Animated background blobs */}
            <div style={styles.blob1} />
            <div style={styles.blob2} />
            <div style={styles.blob3} />

            {/* Center: Form Panel */}
            <div style={styles.formPanel}>
                <div style={styles.formInner}>
                    {/* Logo */}
                    <div style={styles.logoRow}>
                        <div style={styles.logoIcon}>🍌</div>
                        <span style={styles.logoText}>Banana Hunt</span>
                    </div>

                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Welcome back</h2>
                        <p style={styles.formSubtitle}>Sign in to continue your hunt</p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>⚠</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>✉</span>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="you@example.com"
                                    style={styles.input}
                                    onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <div style={styles.labelRow}>
                                <label style={styles.label}>Password</label>
                                <Link to="/forgot-password" style={styles.forgotLink}>Forgot password?</Link>
                            </div>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••••••"
                                    style={styles.input}
                                    onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={styles.eyeBtn}
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.submitBtn, opacity: loading ? 0.8 : 1 }}
                            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(245,197,24,0.5)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(245,197,24,0.35)'; }}
                        >
                            {loading ? (
                                <span style={styles.spinnerRow}>
                                    <span style={styles.spinner} /> Signing in...
                                </span>
                            ) : (
                                <span>▶ &nbsp;Sign In</span>
                            )}
                        </button>
                    </form>

                    <div style={styles.dividerRow}>
                        <div style={styles.dividerLine} />
                        <span style={styles.dividerText}>OR CONTINUE WITH</span>
                        <div style={styles.dividerLine} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
                        <GoogleLogin
                            onSuccess={credentialResponse => {
                                googleLogin(credentialResponse.credential).then(res => {
                                    if(res.success) navigate('/play');
                                    else setError(res.message);
                                });
                            }}
                            onError={() => {
                                setError('Google Login Failed');
                            }}
                            theme="filled_black"
                            shape="pill"
                        />
                    </div>

                    <p style={styles.switchText}>
                        New to Banana Hunt?{' '}
                        <Link to="/register" style={styles.switchLink}>Create account →</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    root: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'url(/auth-bg.png) no-repeat center center / cover',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    blob1: {
        position: 'absolute', top: '-200px', left: '-200px',
        width: '600px', height: '600px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,197,24,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none',
    },
    blob2: {
        position: 'absolute', bottom: '-150px', right: '420px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,0,0.1) 0%, transparent 70%)',
        filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none',
    },
    blob3: {
        position: 'absolute', top: '50%', left: '30%',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 70%)',
        filter: 'blur(40px)', zIndex: 0, pointerEvents: 'none',
    },
    imagePanel: {
        flex: 1,
        position: 'relative',
        display: 'none',
        overflow: 'hidden',
    },
    bgImage: {
        width: '100%', height: '100%', objectFit: 'cover',
        position: 'absolute', inset: 0,
    },
    imagePanelOverlay: {
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 100%)',
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
        fontSize: '56px', fontWeight: 900, lineHeight: 1.1, color: '#fff',
        margin: '0 0 12px', textShadow: '0 4px 20px rgba(0,0,0,0.5)',
    },
    heroAccent: {
        color: '#f5c518',
        textShadow: '0 0 40px rgba(245,197,24,0.6)',
    },
    heroDesc: {
        color: 'rgba(255,255,255,0.75)', fontSize: '16px', fontWeight: 500,
        margin: '0 0 32px',
    },
    statRow: {
        display: 'flex', alignItems: 'center', gap: '24px',
        background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px',
        padding: '16px 28px',
    },
    statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
    statNum: { fontSize: '22px', fontWeight: 900, color: '#f5c518' },
    statLabel: { fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' },
    statDivider: { width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)' },
    formPanel: {
        width: '100%', maxWidth: '480px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', zIndex: 10,
        background: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        boxShadow: '0 24px 40px rgba(0,0,0,0.6)',
        margin: '20px'
    },
    formInner: { width: '100%', maxWidth: '400px' },
    logoRow: {
        display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px',
    },
    logoIcon: {
        width: '40px', height: '40px', background: 'linear-gradient(135deg, #f5c518, #ff8c00)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', boxShadow: '0 4px 16px rgba(245,197,24,0.4)',
    },
    logoText: { fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    formHeader: { marginBottom: '32px' },
    formTitle: { fontSize: '32px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.03em' },
    formSubtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, margin: 0 },
    errorBox: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#fc8181', borderRadius: '12px', padding: '12px 16px',
        fontSize: '13px', fontWeight: 600, marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '8px',
    },
    errorIcon: { fontSize: '14px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    label: { fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.02em' },
    forgotLink: { fontSize: '12px', color: '#f5c518', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.01em' },
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
    eyeBtn: {
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '15px', opacity: 0.5, padding: '4px', flexShrink: 0,
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #f5c518 0%, #ff8c00 100%)',
        border: 'none', borderRadius: '14px', padding: '15px',
        fontSize: '15px', fontWeight: 800, color: '#0a0a0f',
        cursor: 'pointer', transition: 'all 0.25s ease',
        boxShadow: '0 8px 30px rgba(245,197,24,0.35)',
        letterSpacing: '0.02em', marginTop: '4px',
    },
    spinnerRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
    spinner: {
        display: 'inline-block', width: '16px', height: '16px',
        border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a0a0f',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    },
    dividerRow: { display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0 20px' },
    dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
    dividerText: { fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', whiteSpace: 'nowrap' },
    socialRow: { display: 'flex', gap: '12px', marginBottom: '28px' },
    socialBtn: {
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.1)',
        borderRadius: '12px', padding: '13px 16px', cursor: 'pointer',
        color: '#fff', fontSize: '13px', fontWeight: 600, transition: 'border-color 0.2s',
        fontFamily: 'inherit',
    },
    switchText: { textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, margin: 0 },
    switchLink: { color: '#f5c518', textDecoration: 'none', fontWeight: 700 },
};

// Inject keyframes globally
if (typeof document !== 'undefined' && !document.getElementById('banana-hunt-auth-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'banana-hunt-auth-styles';
    styleEl.textContent = `
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 768px) {
            .auth-image-panel { display: flex !important; }
        }
    `;
    document.head.appendChild(styleEl);
}

export default Login;