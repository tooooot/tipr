
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import '../styles/LivePage.css';
import { getSimulation } from '../utils/storage';
import { DEFAULT_BOTS } from './BotsPage';

// Helper to categorize bots
const getBotMarket = (botId) => {
    const usBots = ['wall_street_wolf', 'tech_titan', 'dividend_king'];
    const cryptoBots = ['crypto_king', 'defi_wizard'];
    if (usBots.includes(botId)) return 'us';
    if (cryptoBots.includes(botId)) return 'crypto';
    return 'saudi';
};

const TICKER_ITEMS = [
    { symbol: 'TASI', price: '11,450', change: '+0.5%', up: true },
    { symbol: 'SPX', price: '4,780', change: '+0.2%', up: true },
    { symbol: 'BTC', price: '68,500', change: '+2.1%', up: true },
    { symbol: 'ETH', price: '3,800', change: '+1.8%', up: true },
    { symbol: 'ARAMCO', price: '32.50', change: '-0.1%', up: false },
    { symbol: 'RAJHI', price: '85.10', change: '+0.4%', up: true },
    { symbol: 'NVDA', price: '950.00', change: '+3.5%', up: true },
    { symbol: 'SOL', price: '145.20', change: '-1.2%', up: false }
];

export default function LivePage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [stats, setStats] = useState({
        totalProfit: 0,
        winRate: 0,
        totalTrades: 0,
        leaders: { saudi: null, us: null, crypto: null },
        feed: []
    });

    // --- Load Data ---
    useEffect(() => {
        const sim = getSimulation();
        const bots = sim?.bot_portfolios || {};

        // 1. Calculate Global Stats
        let totalP = 0;
        let totalW = 0;
        let totalT = 0;
        let allTrades = [];
        let botPerformances = [];

        DEFAULT_BOTS.forEach(bot => {
            const data = bots[bot.id];
            const profit = data?.total_profit_pct || 0;
            const trades = data?.trades || [];

            totalP += profit;
            totalT += trades.length;
            totalW += (data?.win_rate || 0);

            // Collect for Leaderboard
            botPerformances.push({ ...bot, profit, tradesCount: trades.length });

            // Collect Trades for Feed
            trades.forEach(t => {
                allTrades.push({
                    id: `${bot.id}_${t.symbol}_${t.date}`,
                    botId: bot.id,
                    botName: bot.name_ar,
                    symbol: t.symbol,
                    action: t.profit_pct >= 0 ? 'selling' : 'stop_loss',
                    type: t.profit_pct >= 0 ? 'win' : 'loss', // win/loss/buy
                    profit: t.profit_pct,
                    time: t.date, // For now using date as time
                    desc: `${t.profit_pct >= 0 ? 'ربح' : 'خسارة'} في ${t.symbol} (${t.profit_pct}%)`
                });
            });
        });

        const activeBotsCount = DEFAULT_BOTS.length;
        const avgProfit = activeBotsCount > 0 ? (totalP / activeBotsCount).toFixed(1) : 0;

        // 2. Identify Leaders
        const getLeader = (market) => {
            const marketBots = botPerformances.filter(b => getBotMarket(b.id) === market);
            if (marketBots.length === 0) return null;
            return marketBots.sort((a, b) => b.profit - a.profit)[0];
        };

        const leaders = {
            saudi: getLeader('saudi'),
            us: getLeader('us'),
            crypto: getLeader('crypto')
        };

        // 3. Generate Feed (Mix of real trades + simulated "scanning" events if empty)
        let finalFeed = allTrades.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 20);

        // Fill with dummy if empty (for new users)
        if (finalFeed.length === 0) {
            finalFeed = [
                { botName: 'المايسترو', action: 'scanning', desc: 'جاري مسح السوق السعودي...', type: 'scan', time: 'الآن' },
                { botName: 'القناص', action: 'scanning', desc: 'تحليل الفرص المضاربية', type: 'scan', time: 'منذ دقيقة' },
            ];
        }

        setStats({
            totalProfit: avgProfit,
            totalTrades: totalT,
            leaders,
            feed: finalFeed
        });

    }, []);

    // --- Slides Components (Dynamic) ---

    // 1. Challenge
    const SlideChallenge = () => (
        <div className="slide-content">
            <div className="slide-avatar trophy-shine" style={{ fontSize: '4rem' }}>🏆</div>
            <div className="slide-title gold-text">كأس تِبر للروبوتات</div>
            <div className="slide-sub" style={{ marginTop: '10px' }}>الأداء المباشر</div>
            <div className="slide-badge white-bg" style={{ marginTop: '15px' }}>
                {DEFAULT_BOTS.length} روبوت متنافس 🤖
            </div>
        </div>
    );

    // 2. Performance
    const SlidePerformance = () => (
        <div className="slide-content">
            <div className="slide-label">متوسط الأداء الجماعي</div>
            <div className={`slide-value large-num ${stats.totalProfit >= 0 ? 'green-text' : 'red-text'}`}>
                {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit}%
            </div>
            <div className="bar-graph">
                {[40, 60, 45, 75, 50, 80, 60, 90].map((h, i) => (
                    <div key={i} className="bar" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.1) }}></div>
                ))}
            </div>
            <div className="slide-sub" style={{ fontSize: '0.8rem', marginTop: '10px' }}>
                إجمالي الصفقات المنفذة: {stats.totalTrades}
            </div>
        </div>
    );

    // Helper for Leader Slides
    const LeaderSlide = ({ title, bot, flag }) => {
        if (!bot) return (
            <div className="slide-content">
                <div className="slide-label">{flag} {title}</div>
                <div className="slide-title">جاري التحديث...</div>
            </div>
        );
        return (
            <div className="slide-content" onClick={() => navigate(`/bot/${bot.id}`)} style={{ cursor: 'pointer' }}>
                <div className="slide-label">{flag} {title}</div>
                <div className="slide-avatar bounce">{bot.emoji}</div>
                <div className="slide-title gold-text">{bot.name_ar}</div>
                <div className={`slide-value ${bot.profit >= 0 ? 'green-text' : 'red-text'}`}>
                    {bot.profit > 0 ? '+' : ''}{bot.profit.toFixed(1)}%
                </div>
            </div>
        );
    };

    // 6. Timer
    const SlideTimer = () => (
        <div className="slide-content">
            <div className="signal-icon pulse-ring" style={{ fontSize: '2rem', width: '60px', height: '60px', borderColor: '#ef4444' }}>⏳</div>
            <div className="slide-label" style={{ marginTop: '1rem' }}>نهاية الموسم</div>
            <div className="slide-value large-num" style={{ fontFamily: 'monospace', fontSize: '3.5rem' }}>12:00:00</div>
            <div className="slide-sub">التحديث القادم</div>
        </div>
    );

    const SLIDES_CONFIG = [
        { id: 'challenge', component: <SlideChallenge />, bgClass: 'hero-bg-default' },
        { id: 'performance', component: <SlidePerformance />, bgClass: 'hero-bg-default' },
        { id: 'saudi', component: <LeaderSlide title="متصدر السعودي" bot={stats.leaders.saudi} flag="🇸🇦" />, bgClass: 'hero-bg-saudi' },
        { id: 'us', component: <LeaderSlide title="متصدر الأمريكي" bot={stats.leaders.us} flag="🇺🇸" />, bgClass: 'hero-bg-us' },
        { id: 'crypto', component: <LeaderSlide title="متصدر الكريبتو" bot={stats.leaders.crypto} flag="🪙" />, bgClass: 'hero-bg-crypto' },
        { id: 'timer', component: <SlideTimer />, bgClass: 'hero-bg-default' }
    ];

    // --- Auto Play ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % SLIDES_CONFIG.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [SLIDES_CONFIG.length]);

    const activeSlide = SLIDES_CONFIG[currentSlide];

    // --- Check for Stream Mode (No Navigation) ---
    const location = window.location;
    const isStreamMode = new URLSearchParams(location.search).get('mode') === 'stream';

    return (
        <div className="live-page-container" style={isStreamMode ? { paddingBottom: 0 } : {}}>
            {/* 1. Market Pulse Ticker */}
            <div className="market-pulse-ticker">
                <div className="ticker-content">
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                        <div key={idx} className="ticker-item">
                            <span style={{ color: '#fff' }}>{item.symbol}</span>
                            <span className={item.up ? 'price-up' : 'price-down'}>
                                {item.price} ({item.change})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Stream Mode Conditional Rendering */}
            {isStreamMode ? (
                // ... Stream Content ...
                <div style={styles.page}>
                    {/* ... Header ... */}
                    <header style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '24px 20px',
                        marginBottom: '10px',
                        background: 'linear-gradient(180deg, #0f172a 0%, transparent 100%)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '55px', height: '55px',
                                background: 'linear-gradient(135deg, #FFD700, #FDB931)',
                                borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(253, 185, 49, 0.3)'
                            }}>
                                <span style={{ fontSize: '32px' }}>🦁</span>
                            </div>
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: '900', margin: 0, letterSpacing: '-0.5px' }}>Tipr Live</h1>
                                <span style={{ fontSize: '14px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></span>
                                    بث مباشر للفرص
                                </span>
                            </div>
                        </div>
                    </header>

                    {/* ... Hero (Stream) ... */}
                    <div className="hero-section" style={{ padding: '0 20px', marginBottom: '30px' }}>
                        {/* Slide 1: Challenge Progress */}
                        {currentSlide % 2 === 0 && (
                            <div className="animate-fade-in" style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                borderRadius: '24px',
                                padding: '30px 20px',
                                border: '1px solid #334155',
                                textAlign: 'center',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)' }}></div>
                                <h2 style={{ fontSize: '20px', color: '#94a3b8', margin: '0 0 10px 0' }}>تحدي المليون 🏆</h2>
                                <div style={{ fontSize: '56px', fontWeight: '900', color: 'white', lineHeight: '1', marginBottom: '10px', letterSpacing: '-2px' }}>
                                    124,500
                                    <span style={{ fontSize: '24px', color: styles.gold, verticalAlign: 'top', marginLeft: '5px' }}>SR</span>
                                </div>
                                <div style={{
                                    background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80',
                                    padding: '6px 16px', borderRadius: '99px', fontSize: '18px', fontWeight: 'bold',
                                    display: 'inline-block', border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}>
                                    +24.5% ربح محقق 🚀
                                </div>
                            </div>
                        )}
                        {/* Slide 2: Performance Summary */}
                        {currentSlide % 2 !== 0 && (
                            <div className="animate-fade-in" style={{
                                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                                borderRadius: '24px',
                                padding: '30px 20px',
                                border: '1px solid #334155',
                                textAlign: 'center',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '140%', height: '140%', background: 'radial-gradient(circle, rgba(255,215,0,0.05) 0%, transparent 70%)' }}></div>
                                <h2 style={{ fontSize: '20px', color: '#94a3b8', margin: '0 0 10px 0' }}>متوسط الأداء الجماعي</h2>
                                <div className={`slide-value large-num ${stats.totalProfit >= 0 ? 'green-text' : 'red-text'}`} style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1', marginBottom: '10px', letterSpacing: '-2px' }}>
                                    {stats.totalProfit > 0 ? '+' : ''}{stats.totalProfit}%
                                </div>
                                <div style={{ fontSize: '18px', color: '#94a3b8', marginTop: '10px' }}>
                                    إجمالي الصفقات المنفذة: {stats.totalTrades}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // ... Normal Mobile Content ...
                <>
                    <div className={`hero-section ${activeSlide.bgClass}`}>
                        <div className="hero-content-wrapper">
                            {activeSlide.component}
                        </div>
                        <div className="carousel-dots">
                            {SLIDES_CONFIG.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`dot ${currentSlide === idx ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(idx)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* 3. Transparency Ticker */}
                    <div className="transparency-ticker">
                        <div className="ticker-content">
                            <span className="transparency-item" style={{ color: '#fbbf24' }}>🔴 بيانات حية</span>
                            <span className="transparency-item" style={{ color: 'white' }}>⚡ تحديث لحظي</span>
                            <span className="transparency-item" style={{ color: '#22c55e' }}>💰 أداء وشفافية</span>
                        </div>
                    </div>
                </>
            )}

            {/* 4. Live Feed */}
            <div className="activity-feed-section" style={isStreamMode ? { height: 'calc(100vh - 400px)' } : {}}>
                <div className="feed-header">
                    <span>⚡ نبض السوق</span>
                    <div className="live-indicator"></div>
                </div>

                <div className="feed-list">
                    {stats.feed.map((item, i) => (
                        <div
                            key={i}
                            className="feed-card"
                            onClick={() => {
                                if (item.botId && !isStreamMode) navigate(`/bot/${item.botId}`);
                            }}
                            style={{ cursor: item.botId && !isStreamMode ? 'pointer' : 'default' }}
                        >
                            <div className={`status-bar status-${item.type}`}></div>
                            <div className={`feed-icon icon-bg-${item.type}`}>
                                {item.type === 'win' || item.type === 'buy' ? '🟢' : item.type === 'loss' || item.type === 'sell' ? '🔴' : '🔵'}
                            </div>
                            <div className="feed-content">
                                <span className="robot-name">{item.botName}</span>
                                <div className="feed-desc">{item.desc}</div>
                            </div>
                            <div className="feed-time">{item.time || 'الآن'}</div>
                        </div>
                    ))}
                </div>
            </div>

            {!isStreamMode && <BottomNav />}
        </div>
    );
}
