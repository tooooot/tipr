
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import { fetchPOST } from '../api/api';

const MOCK_SIMULATION_RESULT = {
    leaderboard: [
        { bot_id: 'al_maestro', name_ar: 'المايسترو', emoji: '🤖', total_profit_pct: 12.5, total_trades: 5, win_rate: 80, final_balance: 112500 },
        { bot_id: 'al_qannas', name_ar: 'القناص', emoji: '🦁', total_profit_pct: 8.2, total_trades: 12, win_rate: 65, final_balance: 108200 },
        { bot_id: 'al_hout', name_ar: 'الحوت', emoji: '🐋', total_profit_pct: 5.1, total_trades: 3, win_rate: 100, final_balance: 105100 },
    ],
    bot_portfolios: {
        'al_maestro': {
            trades: [
                { symbol: '1120.SR', date: '2024-03-01', entry_price: 82.5, exit_price: 88.0, profit_pct: 6.6, result: 'win' },
                { symbol: '2222.SR', date: '2024-03-05', entry_price: 31.2, exit_price: 33.5, profit_pct: 7.3, result: 'win' },
                { symbol: '7010.SR', date: '2024-03-10', entry_price: 40.0, exit_price: 39.0, profit_pct: -2.5, result: 'loss' }
            ]
        },
        'al_qannas': {
            trades: [
                { symbol: '4030.SR', date: '2024-03-02', entry_price: 55.0, exit_price: 58.0, profit_pct: 5.4, result: 'win' },
                { symbol: '2010.SR', date: '2024-03-07', entry_price: 78.0, exit_price: 76.5, profit_pct: -1.9, result: 'loss' }
            ]
        }
    }
};

export default function TimeMachinePage() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('2024-01-01');
    const [market, setMarket] = useState('saudi');
    const [capital, setCapital] = useState(100000);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('time_machine_result')) || null;
        } catch { return null; }
    });

    const runSimulation = async () => {
        setRunning(true);
        setResult(null);

        try {
            const res = await fetchPOST(`/api/backtest/run?start_date=${startDate}&initial_capital=${capital}&market=${market}`);
            if (res) {
                setResult(res);
                localStorage.setItem('time_machine_result', JSON.stringify(res));
            } else {
                setTimeout(() => {
                    setResult(MOCK_SIMULATION_RESULT);
                    localStorage.setItem('time_machine_result', JSON.stringify(MOCK_SIMULATION_RESULT));
                    setRunning(false);
                }, 1500);
                return;
            }
        } catch (e) {
            setTimeout(() => {
                setResult(MOCK_SIMULATION_RESULT);
                localStorage.setItem('time_machine_result', JSON.stringify(MOCK_SIMULATION_RESULT));
                setRunning(false);
            }, 1500);
            return;
        }
        setRunning(false);
    };

    const clearResults = () => {
        setResult(null);
        localStorage.removeItem('time_machine_result');
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '32px', cursor: 'pointer' }}>→</button>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>⏱️ آلة الزمن</h1>
                            <p style={{ color: styles.gray, fontSize: '15px', marginTop: '4px' }}>اختبار مستقل - لا يؤثر على بيانات التطبيق</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ ...styles.card, padding: '24px' }}>
                        <h3 style={{ color: styles.gold, marginBottom: '24px', fontSize: '20px' }}>🎯 إعدادات المحاكاة</h3>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: styles.gray, fontSize: '15px', display: 'block', marginBottom: '8px' }}>🌍 اختر السوق</label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {[
                                    { id: 'saudi', label: '🇸🇦 السعودي', currency: 'ر.س' },
                                    { id: 'us', label: '🇺🇸 الأمريكي', currency: '$' },
                                    { id: 'crypto', label: '🪙 الكريبتو', currency: 'USDT' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMarket(m.id)}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            background: market === m.id ? styles.gold : '#334155',
                                            color: market === m.id ? '#0f172a' : 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            fontSize: '15px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            transition: 'transform 0.1s',
                                            transform: market === m.id ? 'scale(1.05)' : 'scale(1)'
                                        }}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: styles.gray, fontSize: '15px', display: 'block', marginBottom: '8px' }}>📅 تاريخ البدء</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    fontSize: '16px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ color: styles.gray, fontSize: '15px', display: 'block', marginBottom: '8px' }}>💰 رأس المال ({market === 'saudi' ? 'ر.س' : market === 'us' ? '$' : 'USDT'})</label>
                            <input
                                type="number"
                                value={capital}
                                onChange={e => setCapital(Number(e.target.value))}
                                style={{
                                    width: '100%',
                                    background: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    fontSize: '16px',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <button
                            onClick={runSimulation}
                            disabled={running}
                            style={{
                                ...btnGold,
                                opacity: running ? 0.7 : 1,
                                width: '100%',
                                padding: '16px',
                                fontSize: '18px',
                                fontWeight: 'bold'
                            }}
                        >
                            {running ? '⏳ جاري المحاكاة...' : '🚀 تشغيل المحاكاة'}
                        </button>

                        {result && (
                            <button
                                onClick={clearResults}
                                style={{
                                    ...btnGold,
                                    marginTop: '12px',
                                    background: '#334155',
                                    color: 'white',
                                    width: '100%',
                                    padding: '16px',
                                    fontSize: '16px'
                                }}
                            >
                                🗑️ مسح النتائج
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    {result && (
                        <>
                            {/* Winner */}
                            {result.leaderboard?.[0] && (
                                <div style={{
                                    ...styles.card,
                                    background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))',
                                    textAlign: 'center',
                                    padding: '32px',
                                    marginTop: '24px'
                                }}>
                                    <span style={{ fontSize: '64px' }}>🏆</span>
                                    <h3 style={{ color: styles.gold, marginTop: '16px', fontSize: '24px' }}>الفائز</h3>
                                    <p style={{ fontSize: '32px', marginTop: '8px', fontWeight: 'bold' }}>
                                        {result.leaderboard[0].emoji} {result.leaderboard[0].name_ar}
                                    </p>
                                    <p style={{ color: styles.green, fontSize: '48px', fontWeight: 'bold', marginTop: '8px', direction: 'ltr' }}>
                                        +{result.leaderboard[0].total_profit_pct}%
                                    </p>
                                    <p style={{ color: styles.gray, fontSize: '16px', marginTop: '12px' }}>
                                        الرصيد النهائي: {result.leaderboard[0].final_balance?.toLocaleString()} {market === 'saudi' ? 'ر.س' : market === 'us' ? '$' : 'USDT'}
                                    </p>
                                </div>
                            )}

                            {/* Leaderboard */}
                            <h3 style={{ marginBottom: '16px', marginTop: '24px', fontSize: '20px', color: 'white' }}>📊 جدول الترتيب والنتائج</h3>

                            {result.leaderboard?.map((bot, i) => {
                                const botData = result.bot_portfolios?.[bot.bot_id];
                                return (
                                    <div key={bot.bot_id} style={{ ...styles.card, marginBottom: '16px', padding: '20px' }}>
                                        {/* Bot Header */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: botData?.trades?.length > 0 ? '16px' : 0 }}>
                                            <span style={{
                                                fontSize: '24px',
                                                width: '40px', height: '40px',
                                                background: '#334155', borderRadius: '50%',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                            </span>
                                            <span style={{ fontSize: '32px' }}>{bot.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{bot.name_ar}</p>
                                                <p style={{ color: styles.gray, fontSize: '14px', marginTop: '4px' }}>
                                                    {bot.total_trades} صفقة | نسبة الفوز {bot.win_rate}%
                                                </p>
                                            </div>
                                            <p style={{
                                                color: bot.total_profit_pct >= 0 ? styles.green : styles.red,
                                                fontWeight: 'bold',
                                                fontSize: '24px',
                                                direction: 'ltr'
                                            }}>
                                                {bot.total_profit_pct >= 0 ? '+' : ''}{bot.total_profit_pct}%
                                            </p>
                                        </div>

                                        {/* Trades - Clickable */}
                                        {botData?.trades?.length > 0 && (
                                            <div style={{ borderTop: '2px solid #334155', paddingTop: '16px' }}>
                                                <p style={{ color: styles.gray, fontSize: '13px', marginBottom: '12px' }}>📋 تفاصيل آخر الصفقات:</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    {botData.trades.slice(0, 3).map((trade, ti) => (
                                                        <div
                                                            key={ti}
                                                            onClick={() => navigate(`/trade/${bot.bot_id}_${trade.symbol}_${ti}`)}
                                                            style={{
                                                                background: '#1e293b',
                                                                padding: '12px 16px',
                                                                borderRadius: '12px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                borderRight: `4px solid ${trade.profit_pct >= 0 ? styles.green : styles.red}`,
                                                                transition: 'background 0.2s'
                                                            }}
                                                        >
                                                            <div>
                                                                <p style={{ fontSize: '15px', fontWeight: 'bold' }}>{trade.symbol}</p>
                                                                <p style={{ fontSize: '12px', color: styles.gray, marginTop: '2px' }}>{trade.date}</p>
                                                            </div>
                                                            <div style={{ textAlign: 'left' }}>
                                                                <p style={{ fontSize: '16px', fontWeight: 'bold', color: trade.profit_pct >= 0 ? styles.green : styles.red, direction: 'ltr' }}>
                                                                    {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                                                </p>
                                                                <span style={{ fontSize: '10px', color: styles.gray }}>اضغط للتفاصيل</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {botData.trades.length > 3 && (
                                                        <p style={{ fontSize: '13px', color: styles.gray, textAlign: 'center', padding: '8px' }}>
                                                            +{botData.trades.length - 3} صفقة أخرى...
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Info */}
                    <div style={{ ...styles.card, background: 'rgba(139,92,246,0.1)', marginTop: '24px', padding: '16px' }}>
                        <p style={{ color: '#a78bfa', fontSize: '14px', lineHeight: '1.8', textAlign: 'center' }}>
                            💡 <strong>ملاحظة:</strong> نتائج آلة الزمن مستقلة تماماً ولا تؤثر على بيانات التطبيق الرئيسية.
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
