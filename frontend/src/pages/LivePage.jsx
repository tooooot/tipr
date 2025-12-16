
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import { fetchPOST } from '../api/api';
// Import Real Data
import realTradesData from '../data/real_trades.json';

export default function LivePage() {
    const [markets, setMarkets] = useState({
        saudi: { name: 'السوق السعودي', flag: '🇸🇦', data: null },
        us: { name: 'السوق الأمريكي', flag: '🇺🇸', data: null },
        crypto: { name: 'العملات الرقمية', flag: '🪙', data: null }
    });
    const [currentSlide, setCurrentSlide] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    // --- Live Feed Logic ---
    const [feedItems, setFeedItems] = useState([]);
    const [displayIndex, setDisplayIndex] = useState(0); // Pointer to current item in the pool

    // --- 1. Load Real Data & Setup Feed Pool ---
    useEffect(() => {
        // Prepare the "Pool" of last 10-15 events from real data
        const loadFeed = () => {
            let pool = [];
            if (realTradesData && realTradesData.length > 0) {
                // Get latest 15 trades
                const sorted = [...realTradesData].sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
                const latest = sorted.slice(0, 15);

                pool = latest.map(t => ({
                    id: t.id,
                    bot: t.bot_id.replace('_', ' '),
                    type: t.status === 'open' ? 'BUY' : (parseFloat(t.profit_pct) > 0 ? 'WIN' : 'LOSS'),
                    symbol: t.symbol,
                    price: t.status === 'open' ? t.entry_price : t.exit_price,
                    profit: t.profit_pct,
                    time: t.entry_date
                }));
            } else {
                // Fallback Mock if file empty
                pool = [
                    { id: 'm1', bot: 'المايسترو', type: 'BUY', symbol: 'ARAMCO', price: '28.50', time: 'الآن' },
                    { id: 'm2', bot: 'القناص', type: 'WIN', symbol: 'Al Rajhi', price: '85.20', profit: '2.1', time: 'منذ دقيقة' },
                    { id: 'm3', bot: 'ذئب وول ستريت', type: 'BUY', symbol: 'NVDA', price: '480.20', time: 'منذ دقيقتين' },
                ];
            }
            // Initialize Feed with first 3
            setFeedItems(pool.slice(0, 3));
            return pool;
        };

        const eventPool = loadFeed();

        // --- CYCLE LOGIC: Add one from pool every 3 seconds ---
        let poolIdx = 3;
        const interval = setInterval(() => {
            if (!eventPool || eventPool.length === 0) return;

            setFeedItems(prev => {
                const nextItem = eventPool[poolIdx % eventPool.length];
                poolIdx++;
                // Add to top, remove from bottom to keep length 3-4
                return [nextItem, ...prev.slice(0, 3)];
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // --- 2. Robust Countdown Logic ---
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const target = new Date();
            target.setDate(now.getDate() + (4 + 7 - now.getDay()) % 7); // Next Thursday
            target.setHours(16, 0, 0, 0);
            if (target < now) target.setDate(target.getDate() + 7);

            const diff = target - now;
            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            return `${d} يوم ${h}:${m}`;
        };
        const timer = setInterval(() => setTimeLeft(calculateTime()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- 3. Mock Leaderboard Fetch (Visual Only) ---
    useEffect(() => {
        // Simulate winners for the slides
        setMarkets({
            saudi: { name: 'السوق السعودي', data: { name_ar: 'المايسترو', emoji: '🤖', total_profit_pct: 12.5 } },
            us: { name: 'السوق الأمريكي', data: { name_ar: 'ذئب وول ستريت', emoji: '🐺', total_profit_pct: 18.2 } },
            crypto: { name: 'العملات الرقمية', data: { name_ar: 'ملك الكريبتو', emoji: '👑', total_profit_pct: 45.3 } }
        });
    }, []);

    // --- 4. Slides Configuration ---
    const slides = [
        // Slide 0: Summary
        {
            bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <div style={{ fontSize: '64px', marginBottom: '8px' }}>📊</div>
                    <h1 style={{ color: 'white', fontSize: '28px', fontWeight: '900', fontFamily: 'Cairo, sans-serif' }}>ملخص التنافس</h1>
                    <p style={{ color: styles.gold, fontSize: '16px' }}>11 روبوت في الحلبة</p>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)', padding: '8px 24px', borderRadius: '30px', margin: '10px auto',
                        display: 'inline-block', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ color: styles.gold, fontSize: '24px', fontWeight: 'bold' }}>⏱️ {timeLeft}</span>
                    </div>
                </div>
            )
        },
        // Slide 1: Saudi Leader
        {
            bg: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{ color: 'white', fontSize: '24px', fontFamily: 'Cairo, sans-serif' }}>متصدر السعودي 🇸🇦</h1>
                    <div style={{ fontSize: '70px', margin: '10px 0' }}>🤖</div>
                    <div style={{ background: 'white', color: 'black', padding: '4px 16px', borderRadius: '12px', display: 'inline-block' }}>
                        <h2 style={{ fontSize: '20px', margin: 0 }}>المايسترو</h2>
                    </div>
                    <p style={{ color: '#4ade80', fontSize: '36px', fontWeight: '900', margin: '10px 0', fontFamily: 'monospace' }}>+12.5%</p>
                </div>
            )
        }
    ];

    // --- Auto-Rotation ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Helper for Feed Colors
    const getFeedStyle = (type) => {
        if (type === 'BUY') return { color: styles.gold, icon: '🔵', bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6' };
        if (type === 'WIN') return { color: styles.green, icon: '🟢', bg: 'rgba(34, 197, 94, 0.2)', border: styles.green };
        return { color: styles.red, icon: '🔴', bg: 'rgba(239, 68, 68, 0.2)', border: styles.red };
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
                    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                    @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                `}</style>

                {/* === SECTION 1: PRICE TICKER === */}
                <div style={{ background: '#0f172a', padding: '10px 0', borderBottom: '1px solid #334155', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-block', animation: 'scroll 30s linear infinite', fontSize: '13px', fontFamily: 'Arial' }}>
                        <span style={{ color: '#4ade80', marginRight: '30px' }}>📈 AAPL: $195.50</span>
                        <span style={{ color: '#4ade80', marginRight: '30px' }}>📈 BTC: $43,250</span>
                        <span style={{ color: '#f87171', marginRight: '30px' }}>📉 TSLA: $245.20</span>
                        <span style={{ color: '#4ade80', marginRight: '30px' }}>📈 ARAMCO: 28.50</span>
                        <span style={{ color: '#f87171', marginRight: '30px' }}>📉 ALRAJHI: 85.30</span>
                    </div>
                </div>

                {/* === SECTION 2: THE STAGE (Visuals) === */}
                <div style={{
                    height: '45vh', width: '100%', background: slides[currentSlide].bg,
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                    transition: 'background 0.5s ease', borderBottomLeftRadius: '32px', borderBottomRightRadius: '32px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', marginBottom: '20px', overflow: 'hidden'
                }}>
                    {slides[currentSlide].content}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                        {slides.map((_, i) => (
                            <div key={i} style={{ width: currentSlide === i ? '20px' : '8px', height: '8px', borderRadius: '4px', background: 'white', opacity: currentSlide === i ? 1 : 0.3, transition: 'all 0.3s' }} />
                        ))}
                    </div>
                </div>

                {/* === SECTION 3: ROBOT PULSE (LIVE FEED) === */}
                <div style={{ padding: '0 20px 100px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', fontFamily: 'Cairo, sans-serif' }}>⚡ نبض السوق (مباشر)</h3>
                        <div style={{ color: styles.green, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{ width: '8px', height: '8px', background: styles.green, borderRadius: '50%', animation: 'blink 1s infinite' }} />
                            تحديث لحظي
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {feedItems.map((item, index) => {
                            const style = getFeedStyle(item.type);
                            return (
                                <div key={item.id + index} style={{
                                    background: '#1e293b', padding: '12px', borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    borderRight: `4px solid ${style.border}`,
                                    animation: index === 0 ? 'slideIn 0.5s ease-out' : 'none' // Animate new items
                                }}>
                                    <div style={{ background: style.bg, padding: '8px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '20px' }}>{style.icon}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px', fontFamily: 'Cairo' }}>{item.bot}</span>
                                            <span style={{ color: styles.gray, fontSize: '12px' }}>{item.time}</span>
                                        </div>
                                        <p style={{ color: style.color, margin: '0', fontSize: '15px', fontFamily: 'Cairo', fontWeight: 'bold' }}>
                                            {item.type === 'BUY' ? `🛒 تنفيذ شراء ${item.symbol} بسعر ${item.price}` :
                                                item.type === 'WIN' ? `💰 صفقة رابحة ${item.profit}% في ${item.symbol}` :
                                                    `🔻 خسارة ${item.profit}% في ${item.symbol}`}
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
