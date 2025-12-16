
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getSimulation, getBotData } from '../utils/storage';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
    const navigate = useNavigate();
    const [bots, setBots] = useState([]);
    const sim = getSimulation();

    useEffect(() => {
        fetchAPI('/api/bots').then(r => r?.data && setBots(r.data));
    }, []);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '28px', marginBottom: '8px' }}>🏆 تِبر</h1>
                    <p style={{ color: styles.gray, marginBottom: '24px' }}>روبوتات الاستثمار الذكية</p>

                    {/* Summary */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(251,191,36,0.3)' }}>
                        <p style={{ color: styles.gold, marginBottom: '8px' }}>💰 المحفظة</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
                            {sim ? `${sim.leaderboard?.[0]?.final_balance?.toLocaleString()} ر.س` : '---'}
                        </p>
                        <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>
                            {sim ? `أفضل روبوت: ${sim.leaderboard?.[0]?.emoji} ${sim.leaderboard?.[0]?.name_ar}` : 'شغّل المحاكاة أولاً'}
                        </p>
                    </div>

                    {/* Bots Grid */}
                    <h3 style={{ marginBottom: '16px' }}>🤖 الروبوتات</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {bots.slice(0, 6).map(bot => {
                            const data = getBotData(bot.id);
                            return (
                                <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} style={{ ...styles.card, cursor: 'pointer', marginBottom: 0 }}>
                                    <span style={{ fontSize: '32px' }}>{bot.emoji}</span>
                                    <p style={{ fontWeight: 'bold', marginTop: '8px' }}>{bot.name_ar}</p>
                                    <p style={{
                                        color: data?.total_profit_pct >= 0 ? styles.green : styles.red,
                                        fontSize: '14px',
                                        marginTop: '4px'
                                    }}>
                                        {data ? `${data.total_profit_pct >= 0 ? '+' : ''}${data.total_profit_pct}%` : '---'}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={() => navigate('/bots')} style={{ ...btnGold, marginTop: '16px' }}>
                        عرض كل الروبوتات 🤖
                    </button>

                    {/* Quick Links */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
                        <button onClick={() => navigate('/portfolio')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569' }}>
                            💼 المحفظة
                        </button>
                        <button onClick={() => navigate('/trades')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569' }}>
                            📋 الصفقات
                        </button>
                        <button onClick={() => navigate('/charts')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569' }}>
                            📊 الشارتات
                        </button>
                        <button onClick={() => navigate('/reporter')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569' }}>
                            📝 المراسل
                        </button>
                    </div>

                    <button onClick={() => navigate('/design-gallery')} style={{ ...btnGold, marginTop: '12px', background: '#1e293b', color: styles.gray, border: '1px solid #334155', fontSize: '12px' }}>
                        🎨 استوديو التصميم
                    </button>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
