
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles, btnGold } from '../styles/theme';
import { fetchAPI, getBotData } from '../utils/api';
import BottomNav from '../components/BottomNav';

export default function BotProfile() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);
    const data = getBotData(botId);

    useEffect(() => {
        fetchAPI(`/api/bots/${botId}`).then(r => r?.data && setBot(r.data));
    }, [botId]);

    if (!bot) return <div style={styles.wrapper}><div style={{ ...styles.container, color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>جاري التحميل...</div></div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <h1 style={{ fontSize: '20px' }}>ملف الروبوت</h1>
                    </div>

                    {/* Bot Card */}
                    <div style={styles.card}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <span style={{ fontSize: '48px', lineHeight: '1', minWidth: '60px', textAlign: 'center' }}>{bot.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>{bot.name_ar}</h2>
                                <p style={{ color: styles.gray }}>{bot.name_en}</p>
                            </div>
                        </div>
                        <p style={{ marginTop: '16px', color: '#d1d5db', lineHeight: '1.6' }}>{bot.description_ar}</p>
                    </div>

                    {/* Stats */}
                    {data ? (
                        <>
                            {/* Balance */}
                            <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' }}>
                                <p style={{ color: styles.gold, marginBottom: '8px' }}>💰 رصيد المحفظة</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: styles.gold }}>{data.final_balance?.toLocaleString()} ر.س</p>
                                    <span style={{
                                        color: data.total_profit_pct >= 0 ? styles.green : styles.red,
                                        background: data.total_profit_pct >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontWeight: 'bold'
                                    }}>
                                        {data.total_profit_pct >= 0 ? '+' : ''}{data.total_profit_pct}%
                                    </span>
                                </div>
                            </div>

                            {/* Grid Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0 }}>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>نسبة الفوز</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.gold }}>{data.win_rate}%</p>
                                </div>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0 }}>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>إجمالي الصفقات</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.total_trades}</p>
                                </div>
                            </div>

                            {/* Trades List */}
                            <h3 style={{ marginBottom: '12px' }}>📋 آخر الصفقات</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {data.trades?.slice(0, 10).map((trade, i) => (
                                    <div key={i} onClick={() => navigate(`/trade/${botId}_${trade.symbol}_${i}`)} style={{
                                        ...styles.card,
                                        marginBottom: 0,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '16px',
                                        borderRight: `4px solid ${trade.profit_pct >= 0 ? styles.green : styles.red}`
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{trade.symbol}</span>
                                            <span style={{ color: styles.gray, fontSize: '12px' }}>{trade.date}</span>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <span style={{
                                                color: trade.profit_pct >= 0 ? styles.green : styles.red,
                                                fontWeight: 'bold',
                                                fontSize: '16px',
                                                direction: 'ltr',
                                                display: 'block'
                                            }}>
                                                {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                            </span>
                                            <span style={{ fontSize: '12px', color: styles.gold }}>{trade.price} ر.س</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ ...styles.card, textAlign: 'center', padding: '30px' }}>
                            <p style={{ fontSize: '40px', marginBottom: '10px' }}>📉</p>
                            <p>لا توجد بيانات محاكاة. يرجى تشغيل "آلة الزمن" أولاً.</p>
                            <button onClick={() => navigate('/time-machine')} style={{ ...btnGold, marginTop: '16px' }}>الانتقال لآلة الزمن</button>
                        </div>
                    )}

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
