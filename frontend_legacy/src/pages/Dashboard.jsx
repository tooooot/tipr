
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles, btnGold } from '../styles/theme';
import { fetchAPI, getBotData, getSimulation } from '../utils/api';
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

                    {/* Simulation Summary Card */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))', border: '1px solid rgba(251,191,36,0.3)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: styles.gold, marginBottom: '8px', fontSize: '14px' }}>💰 قيمة المحفظة</p>
                                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
                                    {sim ? `${sim.leaderboard?.[0]?.final_balance?.toLocaleString()} ر.س` : '---'}
                                </p>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ color: styles.gray, fontSize: '12px' }}>أفضل أداء</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ fontSize: '20px' }}>{sim?.leaderboard?.[0]?.emoji}</span>
                                    <span style={{ fontWeight: 'bold' }}>{sim?.leaderboard?.[0]?.name_ar || '---'}</span>
                                </div>
                            </div>
                        </div>
                        {!sim && (
                            <button onClick={() => navigate('/time-machine')} style={{ ...btnGold, marginTop: '16px', padding: '8px', fontSize: '14px' }}>
                                ⏳ تشغيل المحاكاة
                            </button>
                        )}
                    </div>

                    {/* Quick Access Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate('/portfolio')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569', justifyContent: 'center' }}>
                            💼 المحفظة
                        </button>
                        <button onClick={() => navigate('/trades')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569', justifyContent: 'center' }}>
                            📋 الصفقات
                        </button>
                        <button onClick={() => navigate('/charts')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569', justifyContent: 'center' }}>
                            📊 الشارتات
                        </button>
                        <button onClick={() => navigate('/reporter')} style={{ ...btnGold, background: '#334155', color: 'white', border: '1px solid #475569', justifyContent: 'center' }}>
                            📝 المراسل
                        </button>
                    </div>

                    {/* Top Robots */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px' }}>🤖 الروبوتات المميزة</h3>
                        <span onClick={() => navigate('/bots')} style={{ color: styles.gold, fontSize: '14px', cursor: 'pointer' }}>عرض الكل</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        {bots.slice(0, 6).map(bot => {
                            const data = getBotData(bot.id);
                            return (
                                <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} style={{
                                    ...styles.card,
                                    cursor: 'pointer',
                                    marginBottom: 0,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    gap: '10px' // Ensure gap between icon and text
                                }}>
                                    <span style={{ fontSize: '40px', lineHeight: '1' }}>{bot.emoji}</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{bot.name_ar}</p>
                                        <p style={{
                                            color: data?.total_profit_pct >= 0 ? styles.green : styles.red,
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            marginTop: '4px'
                                        }}>
                                            {data ? `${data.total_profit_pct >= 0 ? '+' : ''}${data.total_profit_pct}%` : '---'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
                <BottomNav />
            </div>
        </div>
    );
}
