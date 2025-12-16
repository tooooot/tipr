
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
// Import Real Data directly (It will be updated by the backend script)
import realTradesData from '../data/real_trades.json';

export default function TradesPage() {
    const navigate = useNavigate();
    const [trades, setTrades] = useState([]);
    const [filter, setFilter] = useState('all'); // all, win, loss, open
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate loading briefly to feel like a fetch
        setTimeout(() => {
            if (realTradesData && realTradesData.length > 0) {
                setTrades(realTradesData);
            } else {
                setTrades([]); // Should not happen after script runs
            }
            setLoading(false);
        }, 800);
    }, []);

    const filteredTrades = trades.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'win') return parseFloat(t.profit_pct) > 0;
        if (filter === 'loss') return parseFloat(t.profit_pct) < 0;
        if (filter === 'open') return t.status === 'open';
        return true;
    });

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <h1 style={{ fontSize: '24px', color: styles.gold, fontWeight: 'bold' }}>📜 سجل الصفقات</h1>
                        <p style={{ color: styles.gray, fontSize: '14px' }}>تتبع أداء جميع الروبوتات في مكان واحد</p>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {[
                            { id: 'all', label: 'الكل' },
                            { id: 'win', label: '✅ رابحة' },
                            { id: 'loss', label: '🔻 خاسرة' },
                            { id: 'open', label: '⏳ مفتوحة' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    background: filter === f.id ? styles.gold : '#334155',
                                    color: filter === f.id ? '#0f172a' : 'white',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Trades List */}
                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '40px', color: styles.gray }}>جاري تحميل الصفقات...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {filteredTrades.map((trade, i) => (
                                <div
                                    key={i}
                                    onClick={() => navigate(`/trade/${trade.bot_id}_${trade.symbol}_${trade.id}`, { state: { trade } })}
                                    style={{
                                        ...styles.card,
                                        padding: '16px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        borderRight: trade.status === 'open' ? `4px solid ${styles.gold}` :
                                            trade.profit_pct >= 0 ? `4px solid ${styles.green}` : `4px solid ${styles.red}`
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px',
                                            background: '#334155', borderRadius: '8px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 'bold', fontSize: '12px'
                                        }}>
                                            {trade.symbol.split('.')[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 'bold', fontSize: '15px' }}>{trade.symbol}</p>
                                            <p style={{ fontSize: '12px', color: styles.gray }}>
                                                {trade.bot_id.replace('_', ' ')} • {trade.date}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'left' }}>
                                        {trade.status === 'open' ? (
                                            <span style={{ color: styles.gold, fontSize: '13px', fontWeight: 'bold' }}>جاري...</span>
                                        ) : (
                                            <p style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: trade.profit_pct >= 0 ? styles.green : styles.red,
                                                direction: 'ltr'
                                            }}>
                                                {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                            </p>
                                        )}
                                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                                            {trade.status === 'open' ? 'دخول: ' + trade.entry_price : 'إغلاق'}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {filteredTrades.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                    لا توجد صفقات مطابقة للبحث.
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
