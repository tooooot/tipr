
import React, { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import '../styles/LivePage.css';

const TICKER_ITEMS = [
    { symbol: 'AAPL', price: '192.50', change: '+1.2%', up: true },
    { symbol: 'TSLA', price: '240.20', change: '-0.5%', up: false },
    { symbol: 'BTC', price: '42,100', change: '+2.1%', up: true },
    { symbol: 'ETH', price: '2,250', change: '+1.8%', up: true },
    { symbol: 'ARAMCO', price: '32.50', change: '-0.2%', up: false },
    { symbol: 'RAJHI', price: '85.10', change: '+0.4%', up: true }
];


// --- Slide 1: Challenge Data (بيانات التحدي) ---
const SlideChallenge = () => (
    <div className="slide-content">
        <div className="slide-avatar trophy-shine" style={{ fontSize: '4rem' }}>🏆</div>
        <div className="slide-title gold-text">كأس تِبر للروبوتات</div>
        <div className="slide-sub" style={{ marginTop: '10px' }}>الأسبوع الرابع - الجولة النهائية</div>
        <div className="slide-badge white-bg" style={{ marginTop: '15px' }}>
            12 روبوت متنافس 🤖
        </div>
    </div>
);

// --- Slide 2: Robot Performance (أداء الروبوتات) ---
const SlidePerformance = () => (
    <div className="slide-content">
        <div className="slide-label">متوسط الأداء الجماعي</div>
        <div className="slide-value green-text large-num">+24.5%</div>
        <div className="bar-graph">
            {[30, 50, 40, 70, 60, 80, 50, 90].map((h, i) => (
                <div key={i} className="bar" style={{ height: `${h}%`, opacity: 0.5 + (i * 0.1) }}></div>
            ))}
        </div>
        <div className="slide-sub" style={{ fontSize: '0.8rem', marginTop: '10px' }}>
            تم تحقيق 450 صفقة رابحة هذا الأسبوع
        </div>
    </div>
);

// --- Slide 3: Saudi Leader (متصدر السعودي) ---
const SlideSaudi = () => (
    <div className="slide-content">
        <div className="slide-label">🇸🇦 متصدر السوق السعودي</div>
        <div className="slide-avatar bounce">🤖</div>
        <div className="slide-title gold-text">المايسترو</div>
        <div className="slide-value green-text">+14.2%</div>
    </div>
);

// --- Slide 4: US Leader (متصدر الأمريكي) ---
const SlideUS = () => (
    <div className="slide-content">
        <div className="slide-label">🇺🇸 متصدر السوق الأمريكي</div>
        <div className="slide-avatar bounce">🦁</div>
        <div className="slide-title gold-text">القناص</div>
        <div className="slide-value green-text">+8.1%</div>
    </div>
);

// --- Slide 5: Crypto Leader (متصدر الكريبتو) ---
const SlideCrypto = () => (
    <div className="slide-content">
        <div className="slide-label">🪙 متصدر الكريبتو</div>
        <div className="slide-avatar bounce">🦊</div>
        <div className="slide-title gold-text">ساتوشي</div>
        <div className="slide-value green-text">+18.5%</div>
    </div>
);

// --- Slide 6: Countdown (باقي على نهاية التحدي) ---
const SlideTimer = () => (
    <div className="slide-content">
        <div className="signal-icon pulse-ring" style={{ fontSize: '2rem', width: '60px', height: '60px', borderColor: '#ef4444' }}>⏳</div>
        <div className="slide-label" style={{ marginTop: '1rem' }}>باقي على نهاية التحدي</div>
        <div className="slide-value large-num" style={{ fontFamily: 'monospace', fontSize: '3.5rem' }}>04:12:59</div>
        <div className="slide-sub">يوم : ساعة : دقيقة</div>
    </div>
);

// --- Slide 7: QR Code (باركود) ---
const SlideQR = () => (
    <div className="slide-content">
        <div className="slide-title white-text" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>جرب بنفسك</div>
        <div style={{
            background: 'white',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* Simulated QR Code with CSS Grid */}
            <div style={{
                width: '120px',
                height: '120px',
                background: 'black',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '2px',
                padding: '4px'
            }}>
                {Array(16).fill(0).map((_, i) => <div key={i} style={{ background: Math.random() > 0.3 ? 'white' : 'black' }}></div>)}
            </div>
        </div>
        <div className="slide-sub" style={{ marginTop: '15px', color: '#fbbf24' }}>امسح الكود لتحميل التطبيق</div>
    </div>
);

const RICH_SLIDES = [
    { id: 'challenge', component: <SlideChallenge />, bgClass: 'hero-bg-default' },
    { id: 'performance', component: <SlidePerformance />, bgClass: 'hero-bg-default' },
    { id: 'saudi', component: <SlideSaudi />, bgClass: 'hero-bg-saudi' },
    { id: 'us', component: <SlideUS />, bgClass: 'hero-bg-us' },
    { id: 'crypto', component: <SlideCrypto />, bgClass: 'hero-bg-crypto' },
    { id: 'timer', component: <SlideTimer />, bgClass: 'hero-bg-default' },
    { id: 'qr', component: <SlideQR />, bgClass: 'hero-bg-gold' }
];

const FEED_POOL = [
    { bot: 'المايسترو', action: 'selling', desc: 'بيع أرامكو عند 32.50 (+2.5%)', type: 'sell', time: 'الآن' },
    { bot: 'القناص', action: 'buying', desc: 'شراء TSLA عند 240.20', type: 'buy', time: 'منذ دقيقة' },
    { bot: 'ذئب وول ستريت', action: 'scanning', desc: 'يراقب حركة NVDA', type: 'scan', time: 'منذ دقيقتين' },
    { bot: 'المايسترو', action: 'buying', desc: 'شراء سابك عند 78.20', type: 'buy', time: 'منذ 5 دقائق' },
    { bot: 'ساتوشي', action: 'selling', desc: 'جني أرباح BTC (+5.0%)', type: 'sell', time: 'منذ 8 دقائق' }
];

export default function LivePage() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [feedItems, setFeedItems] = useState([]);

    // --- Carousel Auto-Play ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % RICH_SLIDES.length);
        }, 5000); // 5 seconds for rich content
        return () => clearInterval(timer);
    }, []);

    // --- Live Feed Simulation ---
    useEffect(() => {
        setFeedItems(FEED_POOL);
        const interval = setInterval(() => {
            const newItem = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
            const uniqueItem = { ...newItem, id: Date.now() };
            setFeedItems(prev => [uniqueItem, ...prev.slice(0, 5)]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const activeSlide = RICH_SLIDES[currentSlide];


    return (
        <div className="live-page-container">
            {/* 1. Market Pulse Ticker (Top) */}
            <div className="market-pulse-ticker">
                <div className="ticker-content">
                    {/* Duplicate items for infinite scroll effect */}
                    {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, idx) => (
                        <div key={idx} className="ticker-item">
                            <span style={{ color: '#fff' }}>{item.symbol}</span>
                            <span className={item.up ? 'price-up' : 'price-down'}>
                                {item.price} ({item.change})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. Hero Section (Stage) */}
            <div className={`hero-section ${activeSlide.bgClass}`}>
                <div className="hero-content-wrapper">
                    {activeSlide.component}
                </div>

                {/* Dots */}
                <div className="carousel-dots">
                    {RICH_SLIDES.map((_, idx) => (
                        <div
                            key={idx}
                            className={`dot ${currentSlide === idx ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                        />
                    ))}
                </div>
            </div>

            {/* 3. Transparency Ticker (Middle) */}
            <div className="transparency-ticker">
                <div className="ticker-content">
                    <span className="transparency-item" style={{ color: '#fbbf24' }}>🔴 صفقات حية</span>
                    <span className="transparency-item" style={{ color: 'white' }}>⚡ ذكاء اصطناعي 24/7</span>
                    <span className="transparency-item" style={{ color: '#22c55e' }}>💰 بلا عمولات خفية</span>
                    <span className="transparency-item" style={{ color: '#fbbf24' }}>🔴 صفقات حية</span>
                    <span className="transparency-item" style={{ color: 'white' }}>⚡ ذكاء اصطناعي 24/7</span>
                </div>
            </div>

            {/* 4. Live Robot Activity Feed (Bottom) */}
            <div className="activity-feed-section">
                <div className="feed-header">
                    <span>⚡ نبض الروبوتات</span>
                    <div className="live-indicator"></div>
                </div>

                <div className="feed-list">
                    {feedItems.map((item, i) => (
                        <div key={item.id || i} className="feed-card">
                            <div className={`status-bar status-${item.type}`}></div>
                            <div className={`feed-icon icon-bg-${item.type}`}>
                                {item.type === 'buy' ? '🟢' : item.type === 'sell' ? '🔴' : '🔵'}
                            </div>
                            <div className="feed-content">
                                <span className="robot-name">{item.bot}</span>
                                <div className="feed-desc">{item.desc}</div>
                            </div>
                            <div className="feed-time">{item.time}</div>
                        </div>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
