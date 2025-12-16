
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getBotData } from '../utils/storage';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import realTradesData from '../data/real_trades.json';

// Enhanced Bot Definitions (Static Info Only)
const BOT_DETAILS = {
    // Saudi
    'al_maestro': {
        name_ar: 'المايسترو', emoji: '🤖', market: 'saudi', risk_level: 'متوسط',
        description: 'روبوت متوازن يركز على الأسهم القيادية وذات العوائد.',
        strategy_title: 'النمو المتوازن (Trend Following + Dip)',
        strategy_desc: 'يقوم المايسترو بتحديد الأسهم التي في مسار صاعد قوي (فوق متوسط 200 يوم)، ثم ينتظر حدوث "تصحيح" أو هبوط مؤقت للسعر ليشتري بسعر مخفض.',
        indicators: [
            { name: 'SMA 200', role: 'تحديد الاتجاه العام' },
            { name: 'RSI 14', role: 'اقتناص الفرصة' }
        ],
        example_case: 'اشترى سهم الراجحي عند 80 ريال رغم أن سعره العادل 90، مستغلاً هبوط السوق المؤقت.'
    },
    'al_qannas': {
        name_ar: 'القناص', emoji: '🦁', market: 'saudi', risk_level: 'عالي',
        description: 'يبحث عن الفرص السريعة والمضاربة اليومية.',
        strategy_title: 'اختراق المقاومة (Breakout)',
        strategy_desc: 'يراقب القناص الأسهم التي تتحرك في نطاق ضيق، وبمجرد اختراق السعر لحاجز المقاومة بكميات تداول عالية، يدخل فوراً متوقعاً انطلاقة سعرية.',
        indicators: [{ name: 'Volume', role: 'سيولة عالية' }, { name: 'Bollinger', role: 'انفجار سعري' }],
        example_case: 'دخل في سهم أميانتيت عند اختراق سعر 45 ريال، وباع عند 47 ريال في نفس الجلسة.'
    },
    'wall_street_wolf': {
        name_ar: 'ذئب وول ستريت', emoji: '🐺', market: 'us', risk_level: 'عالي',
        description: 'تركيز على أسهم التكنولوجيا والنمو السريع.',
        strategy_title: 'زخم النمو (Momentum)',
        strategy_desc: 'يلاحق الأسهم التي تحقق ارتفاعات متتالية وقوية (Trend is your friend)، ولا يخرج إلا عند ظهور إشارات ضعف واضحة.',
        indicators: [{ name: 'MACD', role: 'زخم إيجابي' }, { name: 'EMA 9', role: 'وقف الخسارة المتحرك' }],
        example_case: 'اشترى سهم NVIDIA عند بداية الموجة الصاعدة وحقق ربح 15% خلال 3 أيام.'
    },
    'crypto_king': {
        name_ar: 'ملك الكريبتو', emoji: '👑', market: 'crypto', risk_level: 'جنوني',
        description: 'ملك التقلبات، يصطاد الحيتان في بحر العملات الرقمية.',
        strategy_title: 'اصطياد التقلبات (Volatility Hunter)',
        strategy_desc: 'يستخدم خوارزميات معقدة لرصد تحركات الحيتان المفاجئة ويدخل معهم قبل انفجار السعر.',
        indicators: [{ name: 'Whale Alert', role: 'تتبع المحافظ' }, { name: 'ATR', role: 'قياس التقلب' }],
        example_case: 'دخل في BTC قبل قفزة 10% بناءً على حركة محافظ كبيرة.'
    },
    'default': {
        name_ar: 'روبوت تِبر', emoji: '🤖', market: 'saudi', risk_level: 'متوسط',
        description: 'استراتيجية ذكية تعتمد على التحليل الفني.',
        strategy_title: 'التحليل الفني المتقدم',
        strategy_desc: 'يجمع بين عدة مؤشرات فنية لتحديد أفضل نقاط الدخول والخروج بأقل مخاطرة ممكنة.',
        indicators: [{ name: 'Technical Score', role: 'تقييم شامل' }],
        example_case: 'دخول مدروس في القاع وبيع عند القمة.'
    }
};

export default function BotProfile() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);
    const [trades, setTrades] = useState([]);
    const [stats, setStats] = useState({
        totalProfit: 0,
        tradeCount: 0,
        winRate: 0,
        weeklyWins: 0,
        bestTrade: 0
    });
    const [loading, setLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);
    const [visibleTrades, setVisibleTrades] = useState(10);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            // 1. Bot Metadata
            const details = BOT_DETAILS[botId] || { ...BOT_DETAILS['default'], id: botId };
            setBot(details);

            // 2. Load Real Trades
            // Filter trades relative to this bot
            let botTrades = realTradesData ? realTradesData.filter(t => t.bot_id === botId) : [];

            // Sort by date descending
            botTrades.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
            setTrades(botTrades);

            // 3. Calculate Real Statistics
            let totalProfit = 0;
            let wins = 0;
            let weeklyWins = 0;
            let bestTrade = -999;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            botTrades.forEach(t => {
                const profit = parseFloat(t.profit_pct);
                totalProfit += profit;

                if (profit > 0) {
                    wins++;
                    if (new Date(t.entry_date) > oneWeekAgo) {
                        weeklyWins++;
                    }
                }
                if (profit > bestTrade) bestTrade = profit;
            });

            setStats({
                totalProfit: totalProfit.toFixed(1),
                tradeCount: botTrades.length,
                winRate: botTrades.length > 0 ? ((wins / botTrades.length) * 100).toFixed(0) : 0,
                weeklyWins: weeklyWins,
                bestTrade: bestTrade > -999 ? bestTrade.toFixed(1) : 0
            });

            // 4. Copy Status
            try {
                const copied = JSON.parse(localStorage.getItem('copied_bots')) || [];
                setIsCopied(copied.includes(botId));
            } catch { setIsCopied(false); }

            setLoading(false);
        };
        // Simulate slight network delay for realism
        setTimeout(loadData, 600);
    }, [botId]);

    const toggleCopy = () => {
        try {
            const copied = JSON.parse(localStorage.getItem('copied_bots')) || [];
            let newCopied;
            if (isCopied) {
                newCopied = copied.filter(id => id !== botId);
            } else {
                newCopied = [...copied, botId];
            }
            localStorage.setItem('copied_bots', JSON.stringify(newCopied));
            setIsCopied(!isCopied);
        } catch { }
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px', fontSize: '18px' }}>⏳ جاري تحميل البيانات الحقيقية...</div>;
    if (!bot) return null;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '32px', cursor: 'pointer' }}>→</button>
                        <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>بروفايل الروبوت</h1>
                    </div>

                    {/* Profile Card */}
                    <div style={{ ...styles.card, textAlign: 'center', padding: '32px 20px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
                        <div style={{ fontSize: '72px', marginBottom: '16px' }}>{bot.emoji}</div>
                        <h2 style={{ fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>{bot.name_ar}</h2>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                            <span style={{
                                background: bot.risk_level.includes('عالي') || bot.risk_level.includes('جنوني') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)',
                                color: bot.risk_level.includes('عالي') || bot.risk_level.includes('جنوني') ? styles.red : styles.green,
                                padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold'
                            }}>
                                مخاطرة {bot.risk_level}
                            </span>
                            <span style={{ background: '#334155', color: '#cbd5e1', padding: '4px 12px', borderRadius: '999px', fontSize: '12px' }}>
                                {bot.market === 'saudi' ? 'السوق السعودي 🇸🇦' : bot.market === 'us' ? 'السوق الأمريكي 🇺🇸' : 'العملات الرقمية 🪙'}
                            </span>
                        </div>

                        {/* NEW REAL STATS GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px' }}>
                            <div style={{ background: '#334155', padding: '16px', borderRadius: '12px' }}>
                                <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '4px' }}>العائد الكلي</p>
                                <p style={{ color: stats.totalProfit >= 0 ? styles.green : styles.red, fontWeight: 'bold', fontSize: '20px', direction: 'ltr' }}>
                                    {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit}%
                                </p>
                            </div>
                            <div style={{ background: '#334155', padding: '16px', borderRadius: '12px' }}>
                                <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '4px' }}>نسبة النجاح</p>
                                <p style={{ color: styles.gold, fontWeight: 'bold', fontSize: '20px' }}>{stats.winRate}%</p>
                            </div>

                            {/* WEEKLY WINS HIGHLIGHT */}
                            <div style={{ background: 'rgba(34,197,94,0.1)', border: `1px solid ${styles.green}`, padding: '16px', borderRadius: '12px', gridColumn: 'span 2' }}>
                                <p style={{ color: styles.green, fontSize: '12px', marginBottom: '4px', fontWeight: 'bold' }}>🔥 فوز هذا الأسبوع</p>
                                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '24px' }}>{stats.weeklyWins} صفقات</p>
                            </div>
                        </div>

                        <button
                            onClick={toggleCopy}
                            style={{
                                ...btnGold,
                                marginTop: '24px', width: '100%',
                                background: isCopied ? '#334155' : styles.gold,
                                color: isCopied ? '#94a3b8' : '#0f172a',
                                padding: '14px', fontSize: '16px', fontWeight: 'bold'
                            }}
                        >
                            {isCopied ? '✅ تم النسخ' : 'نسخ الاستراتيجية'}
                        </button>
                    </div>

                    {/* Comparison Chart Section */}
                    <div style={{ marginTop: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>📊 سجل الأداء الفعلي</h3>
                            <span style={{ fontSize: '12px', color: styles.gray }}>أحدث {visibleTrades} صفقة</span>
                        </div>

                        {!trades.length ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray, border: '1px dashed #334155', borderRadius: '12px' }}>
                                لا توجد بيانات حقيقية مسجلة لهذا الروبوت حالياً.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {trades.slice(0, visibleTrades).map((trade, i) => (
                                    <div
                                        key={i}
                                        onClick={() => navigate(`/trade/${botId}_${trade.symbol}_${i}`, { state: { trade } })}
                                        style={{
                                            ...styles.card,
                                            padding: '16px',
                                            cursor: 'pointer',
                                            borderRight: trade.profit_pct >= 0 ? `4px solid ${styles.green}` : `4px solid ${styles.red}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{trade.symbol}</span>
                                                    <span style={{ fontSize: '10px', background: '#334155', padding: '2px 6px', borderRadius: '4px' }}>{trade.entry_date}</span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: styles.gray, marginTop: '4px' }}>
                                                    دخول: {trade.entry_price} ➝ خروج: {trade.exit_price}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ fontSize: '16px', color: trade.profit_pct >= 0 ? styles.green : styles.red, fontWeight: 'bold', direction: 'ltr' }}>
                                                    {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                                </p>
                                                <span style={{ fontSize: '10px', color: trade.status === 'open' ? styles.gold : styles.gray }}>
                                                    {trade.status === 'open' ? 'تداول جاري' : (trade.profit_pct >= 0 ? 'ربح' : 'وقف خسارة')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {visibleTrades < trades.length && (
                                    <button
                                        onClick={() => setVisibleTrades(prev => prev + 10)}
                                        style={{
                                            background: 'rgba(255,255,255,0.05)',
                                            color: styles.gold,
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            marginTop: '12px',
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            width: '100%'
                                        }}
                                    >
                                        ⬇️ عرض المزيد
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
