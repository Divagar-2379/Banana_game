import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(0); // 0 = idle, 1 = animating
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
        if (formData.password.length < 6) return setError('Password must be at least 6 characters');
        if (formData.username.length < 3) return setError('Username must be at least 3 characters');

        setLoading(true);
        const result = await register(formData.username, formData.email, formData.password);
        if (result.success) navigate('/play');
        else setError(result.message);
        setLoading(false);
    };

    const strengthScore = (() => {
        const p = formData.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 6) s++;
        if (p.length >= 10) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^a-zA-Z0-9]/.test(p)) s++;
        return s;
    })();

    const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][strengthScore] || '';
    const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strengthScore] || '#333';

    return (
        <div style={styles.root}>
            <div style={styles.blob1} />
            <div style={styles.blob2} />

            {/* Right: Image Panel */}
            <div style={styles.imagePanel}>
                <img src="/auth-bg.png" alt="Banana Hunt" style={styles.bgImage} />
                <div style={styles.imagePanelOverlay}>
                    <div style={styles.gameBadge}>🏆 JOIN THE HUNT</div>
                    <h1 style={styles.heroTitle}>Start Your<br /><span style={styles.heroAccent}>Adventure</span></h1>
                    <p style={styles.heroDesc}>Create your account and start hunting bananas today!</p>
                    <div style={styles.featureList}>
                        {['100 Progressive Levels', 'Endless Streak Mode', 'Global Leaderboards', 'Daily Challenges'].map(f => (
                            <div key={f} style={styles.featureItem}>
                                <span style={styles.featureCheck}>✦</span>
                                <span style={styles.featureText}>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Left: Form Panel */}
            <div style={styles.formPanel}>
                <div style={styles.formInner}>
                    <div style={styles.logoRow}>
                        <div style={styles.logoIcon}>🍌</div>
                        <span style={styles.logoText}>Banana Hunt</span>
                    </div>

                    <div style={styles.formHeader}>
                        <h2 style={styles.formTitle}>Create account</h2>
                        <p style={styles.formSubtitle}>Join thousands of hunters worldwide</p>
                    </div>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Username</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>👤</span>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    minLength="3"
                                    placeholder="HunterPro42"
                                    style={styles.input}
                                    onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                {formData.username.length >= 3 && (
                                    <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                                )}
                            </div>
                        </div>

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
                                {formData.email.includes('@') && (
                                    <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                                )}
                            </div>
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Password</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔒</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    placeholder="••••••••••••"
                                    style={styles.input}
                                    onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                            {/* Password strength bar */}
                            {formData.password && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} style={{
                                                flex: 1, height: '3px', borderRadius: '99px',
                                                background: i <= strengthScore ? strengthColor : 'rgba(255,255,255,0.1)',
                                                transition: 'background 0.3s',
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: strengthColor }}>
                                        {strengthLabel}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <div style={styles.inputWrapper}>
                                <span style={styles.inputIcon}>🔑</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••••••"
                                    style={styles.input}
                                    onFocus={e => e.target.parentNode.style.borderColor = '#f5c518'}
                                    onBlur={e => e.target.parentNode.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                {formData.confirmPassword && formData.confirmPassword === formData.password && (
                                    <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.submitBtn, opacity: loading ? 0.8 : 1 }}
                            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(245,197,24,0.5)'; }}
                            onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(245,197,24,0.35)'; }}
                        >
                            {loading
                                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <span style={styles.spinner} /> Creating Account...
                                </span>
                                : '🍌 Create My Account'}
                        </button>
                    </form>

                    <p style={styles.terms}>
                        By signing up you agree to our{' '}
                        <span style={{ color: '#f5c518', cursor: 'pointer' }}>Terms of Service</span>{' '}
                        and <span style={{ color: '#f5c518', cursor: 'pointer' }}>Privacy Policy</span>
                    </p>

                    <p style={styles.switchText}>
                        Already have an account?{' '}
                        <Link to="/login" style={styles.switchLink}>Sign in →</Link>
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
    heroDesc: { color: 'rgba(255,255,255,0.75)', fontSize: '16px', fontWeight: 500, margin: '0 0 28px' },
    featureList: { display: 'flex', flexDirection: 'column', gap: '10px' },
    featureItem: {
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px',
    },
    featureCheck: { color: '#f5c518', fontSize: '12px', fontWeight: 900 },
    featureText: { color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 600 },
    formPanel: {
        width: '100%', maxWidth: '480px', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px', position: 'relative', zIndex: 10,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        overflowY: 'auto',
    },
    formInner: { width: '100%', maxWidth: '400px', paddingTop: '24px', paddingBottom: '24px' },
    logoRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px' },
    logoIcon: {
        width: '40px', height: '40px', background: 'linear-gradient(135deg, #f5c518, #ff8c00)',
        borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', boxShadow: '0 4px 16px rgba(245,197,24,0.4)',
    },
    logoText: { fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' },
    formHeader: { marginBottom: '28px' },
    formTitle: { fontSize: '30px', fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: '-0.03em' },
    formSubtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.45)', fontWeight: 500, margin: 0 },
    errorBox: {
        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
        color: '#fc8181', borderRadius: '12px', padding: '12px 16px',
        fontSize: '13px', fontWeight: 600, marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '8px',
    },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
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
        color: '#fff', fontSize: '14px', fontWeight: 500, padding: '14px 0',
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
        letterSpacing: '0.02em', marginTop: '8px',
    },
    spinner: {
        display: 'inline-block', width: '16px', height: '16px',
        border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a0a0f',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
    },
    terms: {
        textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)',
        fontWeight: 500, margin: '16px 0 0',
    },
    switchText: {
        textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.4)',
        fontWeight: 500, margin: '20px 0 0',
    },
    switchLink: { color: '#f5c518', textDecoration: 'none', fontWeight: 700 },
};

export default Register;