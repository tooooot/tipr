
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import { fetchAPI } from '../api/api';
import { getSimulation } from '../utils/storage';

const API = 'http://localhost:8000'; // Or from config

export default function VerificationPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [limit, setLimit] = useState(5);

    const sim = getSimulation();

    const runVerification = async () => {
        setLoading(true);
        setError(null);
        setResults(null);

        try {
            // Using fetch directly or via api wrapper if it supports POST with query params
            // Assuming fetchAPI is a GET wrapper, we might need a POST specific one or just use fetch
            const res = await fetch(`${API}/api/verify/trades?limit=${limit}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();

            if (data.success) {
                setResults(data.data);
            } else {
                setError(data.error || 'حدث خطأ أثناء التحقق');
            }
        } catch (e) {
            setError('فشل الاتصال بالخادم');
            console.error(e);
        }

        setLoading(false);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified': return styles.green;
            case 'partial': return styles.gold;
            case 'mismatch': return styles.red;
            default: return styles.gray;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'verified': return '✅ متطابق';
            case 'partial': return '⚠️ جزئي';
            case 'mismatch': return '❌ غير متطابق';
            case 'no_data': return '📭 لا توجد بيانات';
            default: return '⏳ جاري';
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <div>
                            <h1 style={{ fontSize: '20px' }}>🔍 التحقق من الأسعار</h1>
                            <p style={{ color: styles.gray, fontSize: '12px' }}>مقارنة أسعار المحاكاة مع السوق الحقيقي</p>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(88,28,135,0.1))', border: '1px solid rgba(139,92,246,0.3)' }}>
                        <h3 style={{ color: '#a78bfa', marginBottom: '8px' }}>ℹ️ كيف يعمل التحقق؟</h3>
                        <ul style={{ color: styles.gray, fontSize: '12px', margin: 0, paddingRight: '20px', lineHeight: '1.8' }}>
                            <li>نسحب الأسعار الحقيقية من <strong style={{ color: styles.gold }}>Yahoo Finance</strong></li>
                            <li>نقارن سعر الدخول/الخروج مع السعر الفعلي</li>
                            <li>الفرق أقل من <strong style={{ color: styles.green }}>5%</strong> = متطابق</li>
                        </ul>
                    </div>

                    {/* Check if simulation exists */}
                    {!sim ? (
                        <div style={{ ...styles.card, textAlign: 'center' }}>
                            <span style={{ fontSize: '48px' }}>⚠️</span>
                            <p style={{ color: styles.gold, marginTop: '12px' }}>شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>
                                ⚙️ الذهاب للإعدادات
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Limit Selector */}
                            <div style={{ ...styles.card, marginBottom: '16px' }}>
                                <label style={{ color: styles.gray, fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                    عدد الصفقات للتحقق:
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[3, 5, 10, 20].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setLimit(n)}
                                            style={{
                                                flex: 1,
                                                padding: '10px',
                                                background: limit === n ? styles.gold : '#334155',
                                                color: limit === n ? '#0f172a' : 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Run Button */}
                            <button
                                onClick={runVerification}
                                disabled={loading}
                                style={{ ...btnGold, opacity: loading ? 0.7 : 1, marginBottom: '24px' }}
                            >
                                {loading ? '⏳ جاري التحقق من الأسعار...' : '🔍 بدء التحقق من الأسعار الحقيقية'}
                            </button>

                            {/* Error */}
                            {error && (
                                <div style={{ ...styles.card, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '16px' }}>
                                    <p style={{ color: styles.red }}>❌ {error}</p>
                                </div>
                            )}

                            {/* Results */}
                            {results && (
                                <>
                                    {/* Summary */}
                                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(245,158,11,0.05))' }}>
                                        <h3 style={{ color: styles.gold, marginBottom: '16px' }}>📊 ملخص التحقق</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                            <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>إجمالي الصفقات</p>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{results.summary.total}</p>
                                            </div>
                                            <div style={{ background: 'rgba(34,197,94,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>متطابق ✅</p>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.green }}>{results.summary.verified}</p>
                                            </div>
                                            <div style={{ background: 'rgba(251,191,36,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>جزئي ⚠️</p>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.gold }}>{results.summary.partial}</p>
                                            </div>
                                            <div style={{ background: 'rgba(239,68,68,0.1)', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>غير متطابق ❌</p>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.red }}>{results.summary.mismatch}</p>
                                            </div>
                                        </div>

                                        {/* Verification Rate */}
                                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                                            <p style={{ color: styles.gray, fontSize: '12px' }}>نسبة التطابق</p>
                                            <p style={{
                                                fontSize: '32px',
                                                fontWeight: 'bold',
                                                color: results.summary.verification_rate >= 80 ? styles.green :
                                                    results.summary.verification_rate >= 50 ? styles.gold : styles.red
                                            }}>
                                                {results.summary.verification_rate}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Individual Trades */}
                                    <h3 style={{ color: styles.gray, fontSize: '14px', margin: '24px 0 12px' }}>📋 تفاصيل الصفقات</h3>

                                    {results.trades.map((trade, i) => (
                                        <div key={i} style={{
                                            ...styles.card,
                                            marginBottom: '12px',
                                            borderRight: `4px solid ${getStatusColor(trade.verification.overall_status)}`
                                        }}>
                                            {/* Header */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div>
                                                    <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{trade.symbol}</p>
                                                    <p style={{ color: styles.gray, fontSize: '11px' }}>{trade.simulated.entry_date}</p>
                                                </div>
                                                <span style={{
                                                    background: `${getStatusColor(trade.verification.overall_status)}20`,
                                                    color: getStatusColor(trade.verification.overall_status),
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    fontSize: '11px'
                                                }}>
                                                    {getStatusText(trade.verification.overall_status)}
                                                </span>
                                            </div>

                                            {/* Comparison Table */}
                                            <div style={{ background: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
                                                {/* Entry Price */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #334155' }}>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155' }}>
                                                        <p style={{ color: styles.gray, fontSize: '10px' }}>السعر</p>
                                                    </div>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155', textAlign: 'center' }}>
                                                        <p style={{ color: styles.gray, fontSize: '10px' }}>🔬 محاكاة</p>
                                                    </div>
                                                    <div style={{ padding: '10px', textAlign: 'center' }}>
                                                        <p style={{ color: styles.gray, fontSize: '10px' }}>📈 حقيقي</p>
                                                    </div>
                                                </div>

                                                {/* Entry Row */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #334155' }}>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155' }}>
                                                        <p style={{ fontSize: '12px' }}>سعر الدخول</p>
                                                    </div>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155', textAlign: 'center' }}>
                                                        <p style={{ fontWeight: 'bold' }}>{trade.simulated.entry_price}</p>
                                                    </div>
                                                    <div style={{ padding: '10px', textAlign: 'center' }}>
                                                        <p style={{ fontWeight: 'bold', color: trade.real.entry ? (trade.verification.entry_verified ? styles.green : styles.red) : styles.gray }}>
                                                            {trade.real.entry?.close || '---'}
                                                        </p>
                                                        {trade.verification.entry_difference_pct !== null && (
                                                            <p style={{ fontSize: '10px', color: trade.verification.entry_verified ? styles.green : styles.red }}>
                                                                ({trade.verification.entry_verified ? '✓' : '✗'} {trade.verification.entry_difference_pct}%)
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Exit Row */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155' }}>
                                                        <p style={{ fontSize: '12px' }}>سعر الخروج</p>
                                                    </div>
                                                    <div style={{ padding: '10px', borderLeft: '1px solid #334155', textAlign: 'center' }}>
                                                        <p style={{ fontWeight: 'bold' }}>{trade.simulated.exit_price || '---'}</p>
                                                    </div>
                                                    <div style={{ padding: '10px', textAlign: 'center' }}>
                                                        <p style={{ fontWeight: 'bold', color: trade.real.exit ? (trade.verification.exit_verified ? styles.green : styles.red) : styles.gray }}>
                                                            {trade.real.exit?.close || '---'}
                                                        </p>
                                                        {trade.verification.exit_difference_pct !== null && (
                                                            <p style={{ fontSize: '10px', color: trade.verification.exit_verified ? styles.green : styles.red }}>
                                                                ({trade.verification.exit_verified ? '✓' : '✗'} {trade.verification.exit_difference_pct}%)
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actual Dates Note */}
                                            {trade.real.entry && trade.real.entry.days_difference > 0 && (
                                                <p style={{ fontSize: '10px', color: styles.gray, marginTop: '8px' }}>
                                                    📅 أقرب يوم تداول: {trade.real.entry.actual_date}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* Disclaimer */}
                    <div style={{
                        background: 'rgba(251,191,36,0.05)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginTop: '24px'
                    }}>
                        <p style={{ color: styles.gold, fontSize: '11px', textAlign: 'center' }}>
                            📊 البيانات من Yahoo Finance - قد يكون هناك تأخير في الأسعار
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
