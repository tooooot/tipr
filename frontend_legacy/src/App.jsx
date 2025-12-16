/**
 * TIBR - تطبيق الروبوتات الاستثمارية
 * ================================
 * بناء جديد ونظيف
 */

import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import Chart from 'react-apexcharts';
import DesignGallery from './DesignGallery';

const API = 'http://localhost:8000';

// ============ API Functions ============
async function fetchAPI(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`);
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

async function fetchPOST(endpoint) {
    try {
        const res = await fetch(`${API}${endpoint}`, { method: 'POST' });
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        return null;
    }
}

// ============ Storage ============
const STORAGE_KEY = 'tibr_simulation';

function saveSimulation(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getSimulation() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch { return null; }
}

function getBotData(botId) {
    const sim = getSimulation();
    return sim?.bot_portfolios?.[botId] || null;
}

// ============ Styles ============
const styles = {
    wrapper: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        justifyContent: 'center',
    },
    container: {
        width: '100%',
        maxWidth: '430px',
        minHeight: '100vh',
        background: '#0f172a',
        position: 'relative',
    },
    page: {
        color: 'white',
        padding: '20px',
        paddingBottom: '100px',
        direction: 'rtl',
    },
    card: {
        background: '#1e293b',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid rgba(251, 191, 36, 0.1)',
    },
    gold: '#fbbf24',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#9ca3af',
};

const btnGold = {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#0f172a',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
};

// ============ Bottom Nav ============
function BottomNav() {
    const location = useLocation();
    const items = [
        { icon: '🏠', label: 'الرئيسية', path: '/' },
        { icon: '💼', label: 'المحفظة', path: '/portfolio' },
        { icon: '📋', label: 'الصفقات', path: '/trades' },
        { icon: '📊', label: 'الشارتات', path: '/charts' },
        { icon: '⚙️', label: 'المزيد', path: '/more' },
    ];

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '100%',
            maxWidth: '430px',
            background: 'rgba(15, 23, 42, 0.98)',
            borderTop: '1px solid rgba(251, 191, 36, 0.2)',
            padding: '12px 8px',
            display: 'flex',
            justifyContent: 'space-around',
        }}>
            {items.map((item, i) => (
                <Link key={i} to={item.path} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: location.pathname === item.path ? styles.gold : styles.gray,
                    fontSize: '11px',
                    gap: '4px',
                }}>
                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}

// ============ Dashboard ============
function Dashboard() {
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

// ============ Bots Page ============
function BotsPage() {
    const navigate = useNavigate();
    const [bots, setBots] = useState([]);

    useEffect(() => {
        fetchAPI('/api/bots').then(r => r?.data && setBots(r.data));
    }, []);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>🤖 الروبوتات</h1>

                    {bots.map(bot => {
                        const data = getBotData(bot.id);
                        return (
                            <div key={bot.id} onClick={() => navigate(`/bot/${bot.id}`)} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                                <span style={{ fontSize: '40px' }}>{bot.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{bot.name_ar}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>{bot.strategy_ar}</p>
                                    <span style={{
                                        display: 'inline-block',
                                        background: bot.risk_level.includes('منخفض') ? 'rgba(34,197,94,0.2)' : bot.risk_level.includes('عالي') ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)',
                                        color: bot.risk_level.includes('منخفض') ? styles.green : bot.risk_level.includes('عالي') ? styles.red : styles.gold,
                                        padding: '2px 8px',
                                        borderRadius: '999px',
                                        fontSize: '10px',
                                        marginTop: '4px',
                                    }}>{bot.risk_level}</span>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ color: data?.total_profit_pct >= 0 ? styles.green : data ? styles.red : styles.gray, fontWeight: 'bold' }}>
                                        {data ? `${data.total_profit_pct >= 0 ? '+' : ''}${data.total_profit_pct}%` : '---'}
                                    </p>
                                    <p style={{ color: styles.gray, fontSize: '11px' }}>{data ? `${data.total_trades} صفقة` : ''}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Bot Profile ============
function BotProfile() {
    const { botId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);
    const data = getBotData(botId);

    useEffect(() => {
        fetchAPI(`/api/bots/${botId}`).then(r => r?.data && setBot(r.data));
    }, [botId]);

    if (!bot) return <div style={{ ...styles.wrapper }}><div style={{ ...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>جاري التحميل...</div></div>;

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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ fontSize: '48px' }}>{bot.emoji}</span>
                            <div>
                                <h2 style={{ fontSize: '24px' }}>{bot.name_ar}</h2>
                                <p style={{ color: styles.gray }}>{bot.name_en}</p>
                            </div>
                        </div>
                        <p style={{ marginTop: '16px', color: '#d1d5db', lineHeight: '1.6' }}>{bot.description_ar}</p>
                    </div>

                    {/* No Data Notice */}
                    {!data && (
                        <div style={{ ...styles.card, background: 'rgba(251,191,36,0.1)', textAlign: 'center' }}>
                            <p style={{ color: styles.gold }}>⏱️ شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>⚙️ الذهاب للإعدادات</button>
                        </div>
                    )}

                    {/* Performance */}
                    {data && (
                        <>
                            {/* Balance */}
                            <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' }}>
                                <p style={{ color: styles.gold }}>💰 رصيد المحفظة</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', color: styles.gold }}>{data.final_balance?.toLocaleString()} ر.س</p>
                                <p style={{ color: data.total_profit_pct >= 0 ? styles.green : styles.red }}>
                                    {data.total_profit_pct >= 0 ? '+' : ''}{data.total_profit_pct}%
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0 }}>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>إجمالي الصفقات</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{data.total_trades}</p>
                                </div>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0 }}>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>نسبة الفوز</p>
                                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.gold }}>{data.win_rate}%</p>
                                </div>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0, background: 'rgba(34,197,94,0.1)' }}>
                                    <p style={{ color: styles.green, fontSize: '28px', fontWeight: 'bold' }}>🏆 {data.winning_trades}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>صفقات رابحة</p>
                                </div>
                                <div style={{ ...styles.card, textAlign: 'center', marginBottom: 0, background: 'rgba(239,68,68,0.1)' }}>
                                    <p style={{ color: styles.red, fontSize: '28px', fontWeight: 'bold' }}>📉 {data.losing_trades}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>صفقات خاسرة</p>
                                </div>
                            </div>

                            {/* Trades */}
                            <h3 style={{ marginBottom: '12px' }}>📋 الصفقات ({data.trades?.length || 0})</h3>
                            {data.trades?.slice(0, 10).map((trade, i) => (
                                <div key={trade.id || i} onClick={() => navigate(`/trade/${trade.id || `${botId}_${trade.symbol}_${i}`}`)} style={{
                                    ...styles.card,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    borderRight: `3px solid ${trade.profit_pct >= 0 ? styles.green : styles.red}`,
                                    marginBottom: '8px',
                                    padding: '12px 16px',
                                }}>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>{trade.symbol}</p>
                                        <p style={{ color: styles.gray, fontSize: '12px' }}>{trade.date}</p>
                                        <span style={{
                                            display: 'inline-block',
                                            fontSize: '10px',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: trade.profit_pct >= 0 ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                            color: trade.profit_pct >= 0 ? styles.green : styles.red,
                                        }}>{trade.is_closed ? '✅ مغلقة' : '⏳ مفتوحة'}</span>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ color: styles.gold }}>{trade.price} ر.س</p>
                                        <p style={{ color: trade.profit_pct >= 0 ? styles.green : styles.red, fontSize: '16px', fontWeight: 'bold' }}>
                                            {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Trade Details ============
function TradeDetails() {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const [bot, setBot] = useState(null);

    // Parse: botId_symbol_index (e.g., al_jasour_2222.SR_1)
    // Bot IDs can contain underscores, so we need smarter parsing
    // Format: {bot_id}_{symbol}_{index}
    // Symbol format: XXXX.SR

    // Find the symbol pattern (XXXX.SR) to split correctly
    const symbolMatch = tradeId?.match(/(\d+\.SR)/);
    let botId, symbol, tradeIndex;

    if (symbolMatch) {
        const symbolStart = tradeId.indexOf(symbolMatch[1]);
        botId = tradeId.substring(0, symbolStart - 1); // Remove trailing underscore
        const rest = tradeId.substring(symbolStart);
        const restParts = rest.split('_');
        symbol = restParts[0];
        tradeIndex = restParts.length > 1 ? parseInt(restParts[1]) : 0;
    } else {
        // Fallback to old logic
        const parts = tradeId?.split('_') || [];
        botId = parts[0];
        symbol = parts.length > 2 ? `${parts[1]}.SR` : parts[1];
        tradeIndex = parts.length > 2 ? parseInt(parts[2]) : 0;
    }

    const data = getBotData(botId);
    // Find trade by index or by symbol
    const trade = data?.trades?.[tradeIndex] || data?.trades?.find(t => t.symbol === symbol);

    useEffect(() => {
        fetchAPI(`/api/bots/${botId}`).then(r => r?.data && setBot(r.data));
    }, [botId]);

    // المتغيرات الأساسية
    const entryPrice = trade?.price || 45.20;
    const exitPrice = trade?.exit_price || (entryPrice * 1.03);
    const targetPrice = (entryPrice * 1.03).toFixed(2);
    const stopPrice = (entryPrice * 0.985).toFixed(2);
    const isWin = trade?.profit_pct > 0 || trade?.result === 'win';
    const isClosed = trade?.is_closed === true;
    const stockCode = (trade?.symbol || symbol)?.replace('.SR', '') || '2222';

    // ✅ استخدام المؤشرات الفنية الحقيقية من البيانات
    const entryIndicators = trade?.entry_indicators || {};
    const exitIndicators = trade?.exit_indicators || {};

    // المؤشرات الفنية الحقيقية (من Yahoo Finance)
    const rsiValue = entryIndicators?.rsi?.value || 50;
    const rsiStatus = entryIndicators?.rsi?.status || 'neutral';
    const rsiInterpretation = entryIndicators?.rsi?.interpretation || 'منطقة متوازنة';

    const volumeChange = entryIndicators?.volume?.change_pct || 100;
    const volumeStatus = entryIndicators?.volume?.status || 'normal';

    const sma20 = entryIndicators?.sma?.sma_20 || (entryPrice * 0.98).toFixed(2);
    const sma50 = entryIndicators?.sma?.sma_50 || (entryPrice * 0.97).toFixed(2);
    const sma200 = entryIndicators?.sma?.sma_200 || (entryPrice * 0.95).toFixed(2);

    const trendDirection = entryIndicators?.trend?.direction || 'neutral';
    const goldenCross = entryIndicators?.trend?.golden_cross || false;

    const macdSignal = entryIndicators?.macd?.signal || 'hold';
    const bollingerPosition = entryIndicators?.bollinger?.position || 'neutral';

    // تحديد ما إذا كانت البيانات حقيقية
    const hasRealIndicators = !!trade?.entry_indicators?.rsi?.value;

    // حالة السوق وقت الدخول
    const marketCondition = trendDirection === 'bullish' ? 'صاعد' :
        trendDirection === 'bearish' ? 'هابط' : 'متذبذب';

    // حالة التحقق
    const verificationStatus = hasRealIndicators ? 'verified' : (isClosed ? 'simulated' : 'pending');


    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header with Verification Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <div style={{ flex: 1 }}>
                            <h1 style={{ fontSize: '20px' }}>تفاصيل الصفقة</h1>
                            <p style={{ color: styles.gray, fontSize: '14px' }}>{symbol} • {bot?.name_ar || 'روبوت'}</p>
                        </div>
                        {/* Verification Badge */}
                        <div style={{
                            background: verificationStatus === 'verified' ? 'rgba(34,197,94,0.2)' :
                                verificationStatus === 'simulated' ? 'rgba(251,191,36,0.2)' : 'rgba(156,163,175,0.2)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{ fontSize: '14px' }}>
                                {verificationStatus === 'verified' ? '✅' : verificationStatus === 'simulated' ? '🔬' : '⏳'}
                            </span>
                            <span style={{
                                fontSize: '10px',
                                color: verificationStatus === 'verified' ? styles.green :
                                    verificationStatus === 'simulated' ? styles.gold : styles.gray
                            }}>
                                {verificationStatus === 'verified' ? 'تم التحقق' :
                                    verificationStatus === 'simulated' ? 'محاكاة' : 'جاري'}
                            </span>
                        </div>
                    </div>

                    {/* 🔍 Human Verification Section - External Sources */}
                    <div style={{ ...styles.card, marginBottom: '16px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h3 style={{ color: styles.gold, fontSize: '16px' }}>🔍 تحقق بنفسك</h3>
                            <span style={{
                                background: 'rgba(139,92,246,0.2)',
                                color: '#a78bfa',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px'
                            }}>
                                مصادر مستقلة
                            </span>
                        </div>

                        {/* Important Notice */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
                            border: '2px solid rgba(251,191,36,0.4)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</p>
                            <p style={{ color: styles.gold, fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>
                                تحقق من الأسعار بنفسك!
                            </p>
                            <p style={{ color: styles.gray, fontSize: '13px', lineHeight: '1.6' }}>
                                اضغط على أحد الروابط أدناه وتحقق من أن السعر في التاريخ المحدد يطابق ما نعرضه.
                            </p>
                        </div>

                        {/* Data Summary to Verify */}
                        <div style={{
                            background: '#1e293b',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px'
                        }}>
                            <p style={{
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                marginBottom: '16px'
                            }}>
                                📋 البيانات التي يجب التحقق منها:
                            </p>

                            {/* Symbol */}
                            <div style={{
                                background: '#334155',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ color: styles.gray, fontSize: '13px' }}>🏷️ رمز السهم:</span>
                                <span style={{ color: styles.gold, fontSize: '18px', fontWeight: 'bold' }}>
                                    {trade?.symbol || `${stockCode}.SR`}
                                </span>
                            </div>

                            {/* Entry */}
                            <div style={{
                                background: 'rgba(34,197,94,0.1)',
                                border: '1px solid rgba(34,197,94,0.3)',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                marginBottom: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '2px' }}>📅 تاريخ الدخول</p>
                                    <p style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{trade?.date || '---'}</p>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '2px' }}>💰 سعر الدخول</p>
                                    <p style={{ color: styles.green, fontSize: '20px', fontWeight: 'bold' }}>{entryPrice} ر.س</p>
                                </div>
                            </div>

                            {/* Exit (if closed) */}
                            {isClosed && (
                                <div style={{
                                    background: isWin ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${isWin ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                    padding: '12px 16px',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '2px' }}>📅 تاريخ الخروج</p>
                                        <p style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>{trade?.exit_date || '---'}</p>
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '2px' }}>💰 سعر الخروج</p>
                                        <p style={{
                                            color: isWin ? styles.green : styles.red,
                                            fontSize: '20px',
                                            fontWeight: 'bold'
                                        }}>
                                            {exitPrice} ر.س
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Verification Links - Best Sources for Saudi Stocks */}
                        <p style={{
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '12px'
                        }}>
                            🌐 افتح موقع خارجي للتحقق:
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {/* Mubasher - BEST for Saudi */}
                            <a
                                href={`https://www.mubasher.info/markets/TDWL/stocks/${stockCode}/historical`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                    color: 'white',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <span style={{ fontSize: '18px' }}>📊 مباشر (Mubasher)</span>
                                    <p style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>⭐ الأفضل للأسهم السعودية - بيانات تاريخية</p>
                                </div>
                                <span style={{ fontSize: '20px' }}>↗️</span>
                            </a>

                            {/* Yahoo Finance */}
                            <a
                                href={`https://finance.yahoo.com/quote/${stockCode}.SR/history/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: 'linear-gradient(135deg, #6001d2, #4a00a0)',
                                    color: 'white',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <span style={{ fontSize: '18px' }}>📈 Yahoo Finance</span>
                                    <p style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>البيانات التاريخية بالجدول</p>
                                </div>
                                <span style={{ fontSize: '20px' }}>↗️</span>
                            </a>

                            {/* Argaam */}
                            <a
                                href={`https://www.argaam.com/ar/company/companyoverview/marketid/3/companyid/${stockCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                                    color: 'white',
                                    padding: '16px 20px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                <div>
                                    <span style={{ fontSize: '18px' }}>💼 أرقام (Argaam)</span>
                                    <p style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>موقع عربي موثوق</p>
                                </div>
                                <span style={{ fontSize: '20px' }}>↗️</span>
                            </a>
                        </div>

                        {/* How to Verify */}
                        <div style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(139,92,246,0.1)',
                            borderRadius: '10px',
                            border: '1px solid rgba(139,92,246,0.3)'
                        }}>
                            <p style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>
                                📖 خطوات التحقق:
                            </p>
                            <ol style={{ color: styles.gray, fontSize: '12px', margin: 0, paddingRight: '20px', lineHeight: '2' }}>
                                <li>اضغط على <strong style={{ color: styles.green }}>مباشر</strong> أو <strong style={{ color: '#a78bfa' }}>Yahoo Finance</strong></li>
                                <li>ابحث عن "البيانات التاريخية" أو "Historical"</li>
                                <li>حدد التاريخ <strong style={{ color: 'white' }}>{trade?.date}</strong></li>
                                <li>قارن سعر الإغلاق مع <strong style={{ color: styles.green }}>{entryPrice} ر.س</strong></li>
                                {isClosed && (
                                    <li>كرر للتاريخ <strong style={{ color: 'white' }}>{trade?.exit_date}</strong> والسعر <strong style={{ color: isWin ? styles.green : styles.red }}>{exitPrice} ر.س</strong></li>
                                )}
                            </ol>
                        </div>
                    </div>


                    {/* Charts Comparison Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ color: styles.gold, marginBottom: '12px', fontSize: '16px' }}>📊 الشارتات المقارنة</h3>
                        <ChartComparison
                            symbol={stockCode}
                            entryDate={trade?.date}
                            exitDate={trade?.exit_date}
                            entryPrice={entryPrice}
                            exitPrice={exitPrice}
                        />
                    </div>

                    {/* Part 1: Before Trade */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ background: '#334155', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', color: styles.gold }}>الجزء الأول</span>
                            <h2 style={{ fontSize: '16px' }}>📋 قبل الصفقة</h2>
                        </div>

                        <div style={{ ...styles.card, borderRight: `4px solid ${styles.gold}` }}>
                            <h3 style={{ color: styles.gold, marginBottom: '12px' }}>🧠 لماذا دخل {bot?.name_ar || 'الروبوت'}؟</h3>
                            <p style={{ color: '#d1d5db', lineHeight: '1.8', marginBottom: '16px' }}>
                                {trade?.reason_ar || `تحليل: ${bot?.strategy_ar || 'استراتيجية فنية'}. الظروف مناسبة للدخول.`}
                            </p>

                            {/* Plan */}
                            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px' }}>
                                <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '12px' }}>📍 خطة الصفقة:</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div style={{ textAlign: 'center', background: '#334155', padding: '12px', borderRadius: '8px' }}>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>🟢 الدخول</p>
                                        <p style={{ color: styles.green, fontWeight: 'bold', fontSize: '16px' }}>{entryPrice}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', background: '#334155', padding: '12px', borderRadius: '8px' }}>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>🎯 الهدف</p>
                                        <p style={{ color: styles.gold, fontWeight: 'bold', fontSize: '16px' }}>{targetPrice}</p>
                                    </div>
                                    <div style={{ textAlign: 'center', background: '#334155', padding: '12px', borderRadius: '8px' }}>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>🛑 الوقف</p>
                                        <p style={{ color: styles.red, fontWeight: 'bold', fontSize: '16px' }}>{stopPrice}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Audit Report - Technical Indicators */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{ background: 'rgba(139,92,246,0.2)', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', color: '#a78bfa' }}>تقرير التدقيق</span>
                            <h2 style={{ fontSize: '16px' }}>🔍 المؤشرات الفنية وقت الدخول</h2>
                        </div>

                        <div style={{ ...styles.card, borderRight: '4px solid #a78bfa' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                                {/* RSI */}
                                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: styles.gray, fontSize: '11px' }}>📊 RSI</span>
                                        <span style={{
                                            color: rsiValue < 30 ? styles.green : rsiValue > 70 ? styles.red : styles.gold,
                                            fontWeight: 'bold'
                                        }}>{rsiValue}</span>
                                    </div>
                                    <div style={{
                                        height: '4px',
                                        background: '#334155',
                                        borderRadius: '2px',
                                        marginTop: '8px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${rsiValue}%`,
                                            height: '100%',
                                            background: rsiValue < 30 ? styles.green : rsiValue > 70 ? styles.red : styles.gold,
                                            borderRadius: '2px'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '10px', color: styles.gray, marginTop: '4px' }}>
                                        {rsiValue < 30 ? 'تشبع بيعي ↗️' : rsiValue > 70 ? 'تشبع شرائي ↘️' : 'منطقة متوازنة'}
                                    </p>
                                </div>

                                {/* Volume */}
                                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: styles.gray, fontSize: '11px' }}>📈 حجم التداول</span>
                                        <span style={{ color: volumeChange > 100 ? styles.green : styles.gray, fontWeight: 'bold' }}>
                                            {volumeChange}%
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '10px', color: styles.gray, marginTop: '8px' }}>
                                        {volumeChange > 150 ? '🔥 نشاط غير عادي' : volumeChange > 100 ? '📊 نشاط عالي' : '📉 نشاط عادي'}
                                    </p>
                                </div>

                                {/* SMA 50 */}
                                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: styles.gray, fontSize: '11px' }}>📏 SMA 50</span>
                                        <span style={{ color: entryPrice > parseFloat(sma50) ? styles.green : styles.red, fontWeight: 'bold' }}>
                                            {sma50}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '10px', color: styles.gray, marginTop: '8px' }}>
                                        السعر {entryPrice > parseFloat(sma50) ? 'أعلى ↗️' : 'أقل ↘️'} من المتوسط
                                    </p>
                                </div>

                                {/* SMA 200 */}
                                <div style={{ background: '#1e293b', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: styles.gray, fontSize: '11px' }}>📏 SMA 200</span>
                                        <span style={{ color: entryPrice > parseFloat(sma200) ? styles.green : styles.red, fontWeight: 'bold' }}>
                                            {sma200}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '10px', color: styles.gray, marginTop: '8px' }}>
                                        {parseFloat(sma50) > parseFloat(sma200) ? '✨ تقاطع ذهبي' : '⚠️ تقاطع ميت'}
                                    </p>
                                </div>
                            </div>

                            {/* Market Condition */}
                            <div style={{
                                background: marketCondition === 'صاعد' ? 'rgba(34,197,94,0.1)' :
                                    marketCondition === 'هابط' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                padding: '12px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <span style={{ color: styles.gray, fontSize: '11px' }}>🌍 حالة السوق وقت الدخول: </span>
                                <span style={{
                                    color: marketCondition === 'صاعد' ? styles.green :
                                        marketCondition === 'هابط' ? styles.red : styles.gold,
                                    fontWeight: 'bold'
                                }}>
                                    {marketCondition === 'صاعد' ? '📈 سوق صاعد' :
                                        marketCondition === 'هابط' ? '📉 سوق هابط' : '↔️ سوق متذبذب'}
                                </span>
                            </div>

                            {/* Data Source Indicator */}
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: hasRealIndicators ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)',
                                borderRadius: '8px',
                                border: `1px solid ${hasRealIndicators ? 'rgba(34,197,94,0.3)' : 'rgba(251,191,36,0.3)'}`,
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    fontSize: '12px',
                                    color: hasRealIndicators ? styles.green : styles.gold
                                }}>
                                    {hasRealIndicators ? (
                                        <>✅ <strong>بيانات حقيقية</strong> من Yahoo Finance</>
                                    ) : (
                                        <>⚠️ <strong>شغّل المحاكاة الجديدة</strong> للحصول على بيانات حقيقية</>
                                    )}
                                </p>
                            </div>

                            {/* External Verification Button */}
                            <a
                                href={`https://www.tradingview.com/chart/?symbol=TADAWUL:${stockCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'block',
                                    marginTop: '12px',
                                    padding: '12px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                    color: 'white',
                                    textAlign: 'center',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '13px'
                                }}
                            >
                                🔍 تحقق من المؤشرات على TradingView
                            </a>
                        </div>
                    </div>


                    {/* Part 2: Result */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <span style={{
                                background: isClosed ? (isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(251,191,36,0.2)',
                                padding: '4px 12px',
                                borderRadius: '999px',
                                fontSize: '12px',
                                color: isClosed ? (isWin ? styles.green : styles.red) : styles.gold
                            }}>الجزء الثاني</span>
                            <h2 style={{ fontSize: '16px' }}>📊 ما حدث فعلاً</h2>
                        </div>

                        <div style={{ ...styles.card, borderRight: `4px solid ${isClosed ? (isWin ? styles.green : styles.red) : styles.gold}` }}>
                            {isClosed ? (
                                <div>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '48px' }}>{isWin ? '🏆' : '📉'}</span>
                                        <h3 style={{ color: isWin ? styles.green : styles.red, fontSize: '24px', marginTop: '8px' }}>
                                            {isWin ? 'صفقة ناجحة!' : 'صفقة خاسرة'}
                                        </h3>
                                        <p style={{ color: isWin ? styles.green : styles.red, fontSize: '36px', fontWeight: 'bold', marginTop: '8px' }}>
                                            {trade?.profit_pct >= 0 ? '+' : ''}{trade?.profit_pct}%
                                        </p>
                                    </div>

                                    {/* Trade Details Table */}
                                    <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>📅 تاريخ الدخول</p>
                                                <p style={{ fontWeight: 'bold' }}>{trade?.date || '---'}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>📅 تاريخ الخروج</p>
                                                <p style={{ fontWeight: 'bold' }}>{trade?.exit_date || '---'}</p>
                                            </div>
                                            <div>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>💵 سعر الدخول</p>
                                                <p style={{ color: styles.gold, fontWeight: 'bold' }}>{trade?.price} ر.س</p>
                                            </div>
                                            <div>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>💰 سعر الخروج</p>
                                                <p style={{ color: isWin ? styles.green : styles.red, fontWeight: 'bold' }}>{trade?.exit_price} ر.س</p>
                                            </div>
                                        </div>
                                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #334155' }}>
                                            <p style={{ color: styles.gray, fontSize: '11px' }}>🏷️ سبب الخروج</p>
                                            <p style={{ color: isWin ? styles.green : styles.red, fontWeight: 'bold' }}>{trade?.exit_reason_ar || (isWin ? '🎯 وصل للهدف' : '🛑 وقف الخسارة')}</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(251,191,36,0.05)', padding: '12px', borderRadius: '8px' }}>
                                        <p style={{ color: styles.gold, fontSize: '12px' }}>💡 الدرس:</p>
                                        <p style={{ color: '#d1d5db', fontSize: '13px' }}>
                                            {isWin ? 'الاستراتيجية نجحت كما توقعنا!' : 'هذا جزء طبيعي من التداول. المهم إدارة المخاطر.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <span style={{ fontSize: '48px' }}>⏳</span>
                                    <h3 style={{ color: styles.gold, marginTop: '12px' }}>الصفقة مفتوحة</h3>
                                    <p style={{ color: styles.gray }}>ننتظر وصول السعر للهدف أو الوقف</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* External Verification Links */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ color: styles.gray, fontSize: '14px', marginBottom: '12px' }}>🔗 تحقق بنفسك</h3>

                        {/* TradingView */}
                        <a href={`https://www.tradingview.com/chart/?symbol=TADAWUL%3A${stockCode}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', ...styles.card, textDecoration: 'none', color: 'white', marginBottom: '8px', background: 'linear-gradient(135deg, rgba(19,78,74,0.3), rgba(6,78,59,0.2))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>📊</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>TradingView</p>
                                        <p style={{ fontSize: '11px', color: styles.gray }}>الرسم البياني التفاعلي</p>
                                    </div>
                                </div>
                                <span style={{ color: styles.gold }}>← فتح</span>
                            </div>
                        </a>

                        {/* Saudi Exchange (Tadawul) */}
                        <a href={`https://www.saudiexchange.sa/wps/portal/saudiexchange/hidden/company-profile-main?symbol=${stockCode}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', ...styles.card, textDecoration: 'none', color: 'white', marginBottom: '8px', background: 'linear-gradient(135deg, rgba(30,58,138,0.3), rgba(29,78,216,0.2))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>🏦</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>تداول (Tadawul)</p>
                                        <p style={{ fontSize: '11px', color: styles.gray }}>البيانات الرسمية</p>
                                    </div>
                                </div>
                                <span style={{ color: styles.gold }}>← فتح</span>
                            </div>
                        </a>

                        {/* Argaam */}
                        <a href={`https://www.argaam.com/ar/company/companyoverview/marketid/3/companyid/${stockCode}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', ...styles.card, textDecoration: 'none', color: 'white', marginBottom: '8px', background: 'linear-gradient(135deg, rgba(127,29,29,0.3), rgba(153,27,27,0.2))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>📰</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>أرقام (Argaam)</p>
                                        <p style={{ fontSize: '11px', color: styles.gray }}>الأخبار والتحليلات</p>
                                    </div>
                                </div>
                                <span style={{ color: styles.gold }}>← فتح</span>
                            </div>
                        </a>

                        {/* Mubasher */}
                        <a href={`https://www.mubasher.info/countries/sa/stocks/${stockCode}`} target="_blank" rel="noopener noreferrer"
                            style={{ display: 'block', ...styles.card, textDecoration: 'none', color: 'white', marginBottom: '8px', background: 'linear-gradient(135deg, rgba(88,28,135,0.3), rgba(126,34,206,0.2))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontSize: '24px' }}>💹</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>مباشر (Mubasher)</p>
                                        <p style={{ fontSize: '11px', color: styles.gray }}>بيانات السوق الحية</p>
                                    </div>
                                </div>
                                <span style={{ color: styles.gold }}>← فتح</span>
                            </div>
                        </a>
                    </div>

                    {/* Comments Section */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ color: styles.gold, marginBottom: '12px', fontSize: '16px' }}>💬 التعليقات</h3>
                        <CommentsSection tradeId={tradeId} />
                    </div>

                    {/* Disclaimer */}
                    <div style={{
                        background: 'rgba(251,191,36,0.05)',
                        border: '1px solid rgba(251,191,36,0.2)',
                        borderRadius: '12px',
                        padding: '12px',
                        marginBottom: '24px'
                    }}>
                        <p style={{ color: styles.gold, fontSize: '11px', textAlign: 'center' }}>
                            ⚠️ هذه محاكاة تعليمية. تحقق من البيانات الفعلية عبر الروابط أعلاه.
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div >
    );
}

// ============ Chart Comparison Component ============
function ChartComparison({ symbol, entryDate, exitDate, entryPrice, exitPrice }) {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef(null);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            const res = await fetchAPI(`/api/verify/stock/${symbol}?days=90`);
            if (res?.success) {
                setChartData(res.data);
            }
            setLoading(false);
        };
        fetchChartData();
    }, [symbol]);

    const takeScreenshot = () => {
        if (chartRef.current) {
            // استخدام html2canvas أو مكتبة أخرى
            alert('سيتم إضافة ميزة اللقطة قريباً! يمكنك حالياً استخدام Print Screen');
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '48px' }}>⏳</p>
                <p style={{ color: styles.gray, marginTop: '12px' }}>جاري تحميل الشارتات...</p>
            </div>
        );
    }

    if (!chartData) {
        return (
            <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                <p style={{ fontSize: '48px' }}>❌</p>
                <p style={{ color: styles.gray, marginTop: '12px' }}>لا توجد بيانات للشارت</p>
            </div>
        );
    }

    // تحضير بيانات ApexCharts
    const candlestickData = chartData.prices.map(p => ({
        x: new Date(p.date).getTime(),
        y: [p.open, p.high, p.low, p.close]
    }));

    // نقاط الدخول والخروج
    const annotations = {
        points: [
            {
                x: entryDate ? new Date(entryDate).getTime() : null,
                y: entryPrice,
                marker: {
                    size: 8,
                    fillColor: styles.green,
                    strokeColor: '#fff',
                    strokeWidth: 2,
                },
                label: {
                    borderColor: styles.green,
                    style: {
                        color: '#fff',
                        background: styles.green,
                    },
                    text: `دخول: ${entryPrice}`,
                }
            },
            exitDate ? {
                x: new Date(exitDate).getTime(),
                y: exitPrice,
                marker: {
                    size: 8,
                    fillColor: exitPrice >= entryPrice ? styles.green : styles.red,
                    strokeColor: '#fff',
                    strokeWidth: 2,
                },
                label: {
                    borderColor: exitPrice >= entryPrice ? styles.green : styles.red,
                    style: {
                        color: '#fff',
                        background: exitPrice >= entryPrice ? styles.green : styles.red,
                    },
                    text: `خروج: ${exitPrice}`,
                }
            } : null
        ].filter(Boolean)
    };

    const chartOptions = {
        chart: {
            type: 'candlestick',
            height: 350,
            background: '#1e293b',
            foreColor: '#9ca3af',
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                }
            }
        },
        title: {
            text: `${symbol}.SR - شارت تِبر`,
            align: 'right',
            style: {
                color: styles.gold,
                fontSize: '16px',
                fontWeight: 'bold'
            }
        },
        annotations: annotations,
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: '#9ca3af'
                }
            }
        },
        yaxis: {
            tooltip: {
                enabled: true
            },
            labels: {
                style: {
                    colors: '#9ca3af'
                },
                formatter: (val) => val?.toFixed(2)
            }
        },
        grid: {
            borderColor: '#334155'
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: styles.green,
                    downward: styles.red
                }
            }
        },
        tooltip: {
            theme: 'dark',
            x: {
                format: 'dd MMM yyyy'
            }
        }
    };

    return (
        <div>
            {/* Toggle Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button onClick={takeScreenshot} style={{
                    ...btnGold,
                    padding: '8px 16px',
                    fontSize: '12px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                }}>
                    📸 أخذ لقطة شاشة
                </button>
                <a href={`https://www.tradingview.com/chart/?symbol=TADAWUL:${symbol}`} target="_blank" rel="noopener noreferrer" style={{
                    ...btnGold,
                    padding: '8px 16px',
                    fontSize: '12px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    background: '#334155',
                    color: 'white'
                }}>
                    🔗 فتح في TradingView
                </a>
            </div>

            {/* Charts Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Our Chart (ApexCharts) */}
                <div ref={chartRef} style={{ ...styles.card, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: styles.gold, fontSize: '14px' }}>📊 شارت تِبر (بيانات حقيقية)</h4>
                        <span style={{
                            background: 'rgba(34,197,94,0.2)',
                            color: styles.green,
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px'
                        }}>
                            ✅ Yahoo Finance
                        </span>
                    </div>
                    <Chart
                        options={chartOptions}
                        series={[{ data: candlestickData }]}
                        type="candlestick"
                        height={350}
                    />
                    <p style={{ color: styles.gray, fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
                        💡 يمكنك التكبير والتصغير والتنقل في الشارت
                    </p>
                </div>

                {/* TradingView Chart (iframe) */}
                <div style={{ ...styles.card, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ color: '#2962ff', fontSize: '14px' }}>📈 TradingView (مرجع)</h4>
                        <span style={{
                            background: 'rgba(41,98,255,0.2)',
                            color: '#2962ff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px'
                        }}>
                            🌐 مباشر
                        </span>
                    </div>
                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                        <iframe
                            src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=TADAWUL%3A${symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FRiyadh&withdateranges=1&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=ar_AE&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=TADAWUL%3A${symbol}`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                borderRadius: '8px'
                            }}
                        />
                    </div>
                    <p style={{ color: styles.gray, fontSize: '11px', marginTop: '12px', textAlign: 'center' }}>
                        🔍 شارت TradingView للمقارنة والتحقق
                    </p>
                </div>
            </div>

            {/* Comparison Note */}
            <div style={{ ...styles.card, background: 'rgba(139,92,246,0.1)', marginTop: '16px' }}>
                <p style={{ color: '#a78bfa', fontSize: '12px', lineHeight: '1.6' }}>
                    💡 <strong>ملاحظة:</strong> كلا الشارتين يعرضان نفس البيانات من مصادر مختلفة.
                    شارت تِبر يستخدم بيانات Yahoo Finance الحقيقية، بينما TradingView يعرض البيانات مباشرة من السوق.
                </p>
            </div>
        </div>
    );
}

// ============ Comments Section Component ============
function CommentsSection({ tradeId }) {
    const [comments, setComments] = useState(() => {
        try {
            const saved = localStorage.getItem(`comments_${tradeId}`);
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState(() => {
        return localStorage.getItem('user_name') || '';
    });

    const addComment = () => {
        if (!newComment.trim()) return;

        const name = userName.trim() || 'مستخدم';
        if (userName.trim()) {
            localStorage.setItem('user_name', userName.trim());
        }

        const comment = {
            id: Date.now(),
            text: newComment.trim(),
            userName: name,
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const updated = [comment, ...comments];
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
        setNewComment('');
    };

    const deleteComment = (commentId) => {
        const updated = comments.filter(c => c.id !== commentId);
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
    };

    const likeComment = (commentId) => {
        const updated = comments.map(c =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
        );
        setComments(updated);
        localStorage.setItem(`comments_${tradeId}`, JSON.stringify(updated));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        return `منذ ${days} يوم`;
    };

    return (
        <div>
            {/* Add Comment */}
            <div style={{ ...styles.card, marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="اسمك (اختياري)"
                    value={userName}
                    onChange={e => setUserName(e.target.value)}
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '10px',
                        color: 'white',
                        fontSize: '14px',
                        marginBottom: '8px'
                    }}
                />
                <textarea
                    placeholder="اكتب تعليقك..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{
                        width: '100%',
                        background: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        padding: '12px',
                        color: 'white',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        fontFamily: 'inherit'
                    }}
                />
                <button onClick={addComment} disabled={!newComment.trim()} style={{
                    ...btnGold,
                    marginTop: '8px',
                    opacity: !newComment.trim() ? 0.5 : 1
                }}>
                    💬 إضافة تعليق
                </button>
            </div>

            {/* Comments List */}
            {comments.length === 0 ? (
                <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                    <p style={{ fontSize: '48px' }}>💭</p>
                    <p style={{ color: styles.gray, marginTop: '12px' }}>لا توجد تعليقات بعد</p>
                    <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>كن أول من يعلق!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {comments.map(comment => (
                        <div key={comment.id} style={{
                            ...styles.card,
                            borderRight: `3px solid ${styles.gold}`,
                            padding: '16px'
                        }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>👤</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{comment.userName}</p>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>{formatTime(comment.timestamp)}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteComment(comment.id)} style={{
                                    background: 'none',
                                    border: 'none',
                                    color: styles.red,
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    padding: '4px'
                                }}>
                                    🗑️
                                </button>
                            </div>

                            {/* Comment Text */}
                            <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                                {comment.text}
                            </p>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '16px', paddingTop: '8px', borderTop: '1px solid #334155' }}>
                                <button onClick={() => likeComment(comment.id)} style={{
                                    background: 'none',
                                    border: 'none',
                                    color: styles.gold,
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    👍 {comment.likes > 0 && <span>{comment.likes}</span>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============ Portfolio Page ============
function PortfolioPage() {
    const navigate = useNavigate();
    const sim = getSimulation();
    const [bots, setBots] = useState([]);
    const [copiedBots, setCopiedBots] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('copied_bots')) || [];
        } catch { return []; }
    });

    useEffect(() => {
        fetchAPI('/api/bots').then(r => r?.data && setBots(r.data));
    }, []);

    const toggleCopy = (botId) => {
        const newCopied = copiedBots.includes(botId)
            ? copiedBots.filter(id => id !== botId)
            : [...copiedBots, botId];
        setCopiedBots(newCopied);
        localStorage.setItem('copied_bots', JSON.stringify(newCopied));
    };

    const totalBalance = copiedBots.reduce((sum, botId) => {
        const data = getBotData(botId);
        return sum + (data?.final_balance || 0);
    }, 0);

    const totalProfit = copiedBots.reduce((sum, botId) => {
        const data = getBotData(botId);
        return sum + ((data?.final_balance || 0) - (data?.initial_capital || 0));
    }, 0);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>💼 محفظتي</h1>

                    {/* Portfolio Summary */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' }}>
                        <p style={{ color: styles.gray, fontSize: '12px' }}>💰 إجمالي المحفظة</p>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: styles.gold, marginTop: '8px' }}>
                            {totalBalance.toLocaleString()} ر.س
                        </p>
                        <p style={{ color: totalProfit >= 0 ? styles.green : styles.red, fontSize: '18px', marginTop: '4px' }}>
                            {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()} ر.س
                        </p>
                        <p style={{ color: styles.gray, fontSize: '11px', marginTop: '8px' }}>
                            {copiedBots.length} روبوت منسوخ
                        </p>
                    </div>

                    {/* Copied Bots */}
                    {copiedBots.length > 0 && (
                        <>
                            <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>🤖 الروبوتات المنسوخة</h3>
                            {copiedBots.map(botId => {
                                const bot = bots.find(b => b.id === botId);
                                const data = getBotData(botId);
                                if (!bot) return null;
                                return (
                                    <div key={botId} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '32px' }}>{bot.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 'bold' }}>{bot.name_ar}</p>
                                            <p style={{ color: styles.gray, fontSize: '12px' }}>{data?.total_trades || 0} صفقة</p>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ color: styles.gold, fontWeight: 'bold' }}>
                                                {data?.final_balance?.toLocaleString() || '---'} ر.س
                                            </p>
                                            <p style={{ color: data?.total_profit_pct >= 0 ? styles.green : styles.red, fontSize: '14px' }}>
                                                {data?.total_profit_pct >= 0 ? '+' : ''}{data?.total_profit_pct || 0}%
                                            </p>
                                        </div>
                                        <button onClick={() => navigate(`/bot/${botId}`)} style={{
                                            background: 'none',
                                            border: '1px solid ' + styles.gold,
                                            color: styles.gold,
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}>
                                            عرض
                                        </button>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Available Bots to Copy */}
                    <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>📋 الروبوتات المتاحة</h3>
                    {bots.map(bot => {
                        const isCopied = copiedBots.includes(bot.id);
                        const data = getBotData(bot.id);
                        return (
                            <div key={bot.id} style={{ ...styles.card, display: 'flex', alignItems: 'center', gap: '12px', opacity: isCopied ? 0.6 : 1 }}>
                                <span style={{ fontSize: '32px' }}>{bot.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold' }}>{bot.name_ar}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>{bot.strategy_ar}</p>
                                </div>
                                <button onClick={() => toggleCopy(bot.id)} style={{
                                    ...btnGold,
                                    padding: '8px 16px',
                                    fontSize: '14px',
                                    background: isCopied ? '#334155' : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                    color: isCopied ? 'white' : '#0f172a'
                                }}>
                                    {isCopied ? '✓ منسوخ' : '+ نسخ'}
                                </button>
                            </div>
                        );
                    })}

                    {!sim && (
                        <div style={{ ...styles.card, background: 'rgba(251,191,36,0.1)', textAlign: 'center', marginTop: '16px' }}>
                            <p style={{ color: styles.gold }}>⏱️ شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>
                                ⚙️ الذهاب للإعدادات
                            </button>
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Trades Page ============
function TradesPage() {
    const navigate = useNavigate();
    const sim = getSimulation();
    const [filter, setFilter] = useState('all'); // all, wins, losses, open
    const [sortBy, setSortBy] = useState('date'); // date, profit

    // Collect all trades from all bots
    const allTrades = [];
    if (sim?.bot_portfolios) {
        Object.entries(sim.bot_portfolios).forEach(([botId, portfolio]) => {
            portfolio.trades?.forEach(trade => {
                allTrades.push({ ...trade, bot_id: botId, bot_name: portfolio.name_ar, bot_emoji: portfolio.emoji });
            });
        });
    }

    // Filter trades
    let filteredTrades = allTrades;
    if (filter === 'wins') filteredTrades = allTrades.filter(t => t.profit_pct >= 0 && t.is_closed);
    if (filter === 'losses') filteredTrades = allTrades.filter(t => t.profit_pct < 0 && t.is_closed);
    if (filter === 'open') filteredTrades = allTrades.filter(t => !t.is_closed);

    // Sort trades
    if (sortBy === 'profit') {
        filteredTrades.sort((a, b) => (b.profit_pct || 0) - (a.profit_pct || 0));
    } else {
        filteredTrades.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const stats = {
        total: allTrades.length,
        wins: allTrades.filter(t => t.profit_pct >= 0 && t.is_closed).length,
        losses: allTrades.filter(t => t.profit_pct < 0 && t.is_closed).length,
        open: allTrades.filter(t => !t.is_closed).length,
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>📋 الصفقات</h1>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ ...styles.card, textAlign: 'center', padding: '12px', marginBottom: 0 }}>
                            <p style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.total}</p>
                            <p style={{ color: styles.gray, fontSize: '10px' }}>الكل</p>
                        </div>
                        <div style={{ ...styles.card, textAlign: 'center', padding: '12px', marginBottom: 0, background: 'rgba(34,197,94,0.1)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: styles.green }}>{stats.wins}</p>
                            <p style={{ color: styles.gray, fontSize: '10px' }}>رابحة</p>
                        </div>
                        <div style={{ ...styles.card, textAlign: 'center', padding: '12px', marginBottom: 0, background: 'rgba(239,68,68,0.1)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: styles.red }}>{stats.losses}</p>
                            <p style={{ color: styles.gray, fontSize: '10px' }}>خاسرة</p>
                        </div>
                        <div style={{ ...styles.card, textAlign: 'center', padding: '12px', marginBottom: 0, background: 'rgba(251,191,36,0.1)' }}>
                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: styles.gold }}>{stats.open}</p>
                            <p style={{ color: styles.gray, fontSize: '10px' }}>مفتوحة</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto' }}>
                        {[
                            { key: 'all', label: 'الكل' },
                            { key: 'wins', label: '✅ رابحة' },
                            { key: 'losses', label: '❌ خاسرة' },
                            { key: 'open', label: '⏳ مفتوحة' }
                        ].map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)} style={{
                                padding: '8px 16px',
                                background: filter === f.key ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#334155',
                                color: filter === f.key ? '#0f172a' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                            }}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Trades List */}
                    {filteredTrades.length === 0 ? (
                        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                            <p style={{ fontSize: '48px' }}>📭</p>
                            <p style={{ color: styles.gray, marginTop: '12px' }}>لا توجد صفقات</p>
                        </div>
                    ) : (
                        filteredTrades.map((trade, i) => (
                            <div key={i} onClick={() => navigate(`/trade/${trade.bot_id}_${trade.symbol}_${i}`)} style={{
                                ...styles.card,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                borderRight: `3px solid ${trade.profit_pct >= 0 ? styles.green : styles.red}`,
                                marginBottom: '8px',
                                padding: '12px 16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '24px' }}>{trade.bot_emoji}</span>
                                    <div>
                                        <p style={{ fontWeight: 'bold' }}>{trade.symbol}</p>
                                        <p style={{ color: styles.gray, fontSize: '11px' }}>{trade.bot_name}</p>
                                        <p style={{ color: styles.gray, fontSize: '10px' }}>{trade.date}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <p style={{ color: styles.gold, fontSize: '14px' }}>{trade.price} ر.س</p>
                                    <p style={{ color: trade.profit_pct >= 0 ? styles.green : styles.red, fontSize: '16px', fontWeight: 'bold' }}>
                                        {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                    </p>
                                    <span style={{
                                        display: 'inline-block',
                                        fontSize: '9px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        background: trade.is_closed ? 'rgba(34,197,94,0.2)' : 'rgba(251,191,36,0.2)',
                                        color: trade.is_closed ? styles.green : styles.gold,
                                    }}>{trade.is_closed ? '✅ مغلقة' : '⏳ مفتوحة'}</span>
                                </div>
                            </div>
                        ))
                    )}

                    {!sim && (
                        <div style={{ ...styles.card, background: 'rgba(251,191,36,0.1)', textAlign: 'center' }}>
                            <p style={{ color: styles.gold }}>⏱️ شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>
                                ⚙️ الذهاب للإعدادات
                            </button>
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Chart Center ============
function ChartCenterPage() {
    const navigate = useNavigate();
    const sim = getSimulation();
    const [selectedStock, setSelectedStock] = useState('2222');
    const [stockData, setStockData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get unique stocks from simulation
    const stocks = [];
    if (sim?.bot_portfolios) {
        const stockSet = new Set();
        Object.values(sim.bot_portfolios).forEach(portfolio => {
            portfolio.trades?.forEach(trade => {
                const code = trade.symbol.replace('.SR', '');
                stockSet.add(code);
            });
        });
        stocks.push(...Array.from(stockSet));
    }

    // Fetch stock data
    const fetchStockData = async (symbol) => {
        setLoading(true);
        const res = await fetchAPI(`/api/verify/stock/${symbol}?days=90`);
        if (res?.success) {
            setStockData(res.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedStock) {
            fetchStockData(selectedStock);
        }
    }, [selectedStock]);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>📊 مركز الشارتات</h1>

                    {/* Stock Selector */}
                    <div style={{ ...styles.card, marginBottom: '16px' }}>
                        <label style={{ color: styles.gray, fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                            اختر السهم
                        </label>
                        <select value={selectedStock} onChange={e => setSelectedStock(e.target.value)} style={{
                            width: '100%',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '12px',
                            color: 'white',
                            fontSize: '16px'
                        }}>
                            {stocks.length === 0 ? (
                                <option>لا توجد أسهم</option>
                            ) : (
                                stocks.map(stock => (
                                    <option key={stock} value={stock}>{stock}</option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                            <p style={{ fontSize: '48px' }}>⏳</p>
                            <p style={{ color: styles.gray, marginTop: '12px' }}>جاري تحميل البيانات...</p>
                        </div>
                    )}

                    {/* Stock Info */}
                    {!loading && stockData && (
                        <>
                            <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' }}>
                                <p style={{ color: styles.gold, fontSize: '14px' }}>📈 {stockData.symbol}</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '8px' }}>
                                    {stockData.prices[stockData.prices.length - 1]?.close} ر.س
                                </p>
                                <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>
                                    آخر تحديث: {stockData.prices[stockData.prices.length - 1]?.date}
                                </p>
                            </div>

                            {/* Price Table */}
                            <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>📋 الأسعار التاريخية</h3>
                            <div style={{ ...styles.card, padding: '0', overflow: 'hidden' }}>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#1e293b', zIndex: 1 }}>
                                            <tr>
                                                <th style={{ padding: '12px', textAlign: 'right', color: styles.gray, fontSize: '12px', borderBottom: '1px solid #334155' }}>التاريخ</th>
                                                <th style={{ padding: '12px', textAlign: 'center', color: styles.gray, fontSize: '12px', borderBottom: '1px solid #334155' }}>الإغلاق</th>
                                                <th style={{ padding: '12px', textAlign: 'center', color: styles.gray, fontSize: '12px', borderBottom: '1px solid #334155' }}>الأعلى</th>
                                                <th style={{ padding: '12px', textAlign: 'center', color: styles.gray, fontSize: '12px', borderBottom: '1px solid #334155' }}>الأدنى</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stockData.prices.slice().reverse().map((price, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                                                    <td style={{ padding: '10px', fontSize: '12px' }}>{price.date}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: styles.gold }}>{price.close}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', color: styles.green }}>{price.high}</td>
                                                    <td style={{ padding: '10px', textAlign: 'center', color: styles.red }}>{price.low}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* External Chart Link */}
                            <a href={`https://www.tradingview.com/chart/?symbol=TADAWUL:${selectedStock}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'block', ...btnGold, textDecoration: 'none', textAlign: 'center', marginTop: '16px' }}>
                                📊 فتح الشارت على TradingView
                            </a>
                        </>
                    )}

                    {!sim && (
                        <div style={{ ...styles.card, background: 'rgba(251,191,36,0.1)', textAlign: 'center' }}>
                            <p style={{ color: styles.gold }}>⏱️ شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>
                                ⚙️ الذهاب للإعدادات
                            </button>
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Reporter Page ============
function ReporterPage() {
    const navigate = useNavigate();
    const sim = getSimulation();

    // Calculate overall stats
    const stats = {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        bestBot: null,
        worstBot: null,
        bestTrade: null,
        worstTrade: null,
    };

    if (sim?.bot_portfolios) {
        Object.values(sim.bot_portfolios).forEach(portfolio => {
            stats.totalTrades += portfolio.total_trades || 0;
            stats.winningTrades += portfolio.winning_trades || 0;
            stats.losingTrades += portfolio.losing_trades || 0;
            stats.totalProfit += (portfolio.final_balance - portfolio.initial_capital) || 0;

            // Find best/worst trades
            portfolio.trades?.forEach(trade => {
                if (!stats.bestTrade || trade.profit_pct > stats.bestTrade.profit_pct) {
                    stats.bestTrade = { ...trade, bot_name: portfolio.name_ar, bot_emoji: portfolio.emoji };
                }
                if (!stats.worstTrade || trade.profit_pct < stats.worstTrade.profit_pct) {
                    stats.worstTrade = { ...trade, bot_name: portfolio.name_ar, bot_emoji: portfolio.emoji };
                }
            });
        });

        // Find best/worst bots
        const sortedBots = Object.values(sim.bot_portfolios).sort((a, b) => b.total_profit_pct - a.total_profit_pct);
        stats.bestBot = sortedBots[0];
        stats.worstBot = sortedBots[sortedBots.length - 1];
    }

    const winRate = stats.totalTrades > 0 ? ((stats.winningTrades / stats.totalTrades) * 100).toFixed(1) : 0;

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>📝 المراسل</h1>

                    {sim ? (
                        <>
                            {/* Overall Performance */}
                            <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))' }}>
                                <h3 style={{ color: styles.gold, marginBottom: '16px' }}>📊 الأداء الإجمالي</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                    <div>
                                        <p style={{ color: styles.gray, fontSize: '12px' }}>إجمالي الصفقات</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalTrades}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: styles.gray, fontSize: '12px' }}>نسبة الفوز</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.gold }}>{winRate}%</p>
                                    </div>
                                    <div>
                                        <p style={{ color: styles.gray, fontSize: '12px' }}>صفقات رابحة</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.green }}>{stats.winningTrades}</p>
                                    </div>
                                    <div>
                                        <p style={{ color: styles.gray, fontSize: '12px' }}>صفقات خاسرة</p>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.red }}>{stats.losingTrades}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(251,191,36,0.2)' }}>
                                    <p style={{ color: styles.gray, fontSize: '12px' }}>إجمالي الربح</p>
                                    <p style={{ fontSize: '28px', fontWeight: 'bold', color: stats.totalProfit >= 0 ? styles.green : styles.red }}>
                                        {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()} ر.س
                                    </p>
                                </div>
                            </div>

                            {/* Best Bot */}
                            {stats.bestBot && (
                                <div style={{ ...styles.card, background: 'rgba(34,197,94,0.1)', borderRight: `4px solid ${styles.green}` }}>
                                    <h3 style={{ color: styles.green, marginBottom: '12px' }}>🏆 أفضل روبوت</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ fontSize: '40px' }}>{stats.bestBot.emoji}</span>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '18px' }}>{stats.bestBot.name_ar}</p>
                                            <p style={{ color: styles.gray, fontSize: '12px' }}>{stats.bestBot.total_trades} صفقة</p>
                                        </div>
                                        <p style={{ fontSize: '24px', fontWeight: 'bold', color: styles.green }}>
                                            +{stats.bestBot.total_profit_pct}%
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Best Trade */}
                            {stats.bestTrade && (
                                <div style={{ ...styles.card, background: 'rgba(34,197,94,0.05)', borderRight: `3px solid ${styles.green}` }}>
                                    <h3 style={{ color: styles.green, marginBottom: '12px', fontSize: '14px' }}>💎 أفضل صفقة</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold' }}>{stats.bestTrade.symbol}</p>
                                            <p style={{ color: styles.gray, fontSize: '11px' }}>{stats.bestTrade.bot_emoji} {stats.bestTrade.bot_name}</p>
                                            <p style={{ color: styles.gray, fontSize: '10px' }}>{stats.bestTrade.date}</p>
                                        </div>
                                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: styles.green }}>
                                            +{stats.bestTrade.profit_pct}%
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Worst Trade */}
                            {stats.worstTrade && (
                                <div style={{ ...styles.card, background: 'rgba(239,68,68,0.05)', borderRight: `3px solid ${styles.red}` }}>
                                    <h3 style={{ color: styles.red, marginBottom: '12px', fontSize: '14px' }}>📉 أسوأ صفقة</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold' }}>{stats.worstTrade.symbol}</p>
                                            <p style={{ color: styles.gray, fontSize: '11px' }}>{stats.worstTrade.bot_emoji} {stats.worstTrade.bot_name}</p>
                                            <p style={{ color: styles.gray, fontSize: '10px' }}>{stats.worstTrade.date}</p>
                                        </div>
                                        <p style={{ fontSize: '20px', fontWeight: 'bold', color: styles.red }}>
                                            {stats.worstTrade.profit_pct}%
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Insights */}
                            <div style={{ ...styles.card, background: 'rgba(139,92,246,0.1)' }}>
                                <h3 style={{ color: '#a78bfa', marginBottom: '12px' }}>💡 رؤى وتوصيات</h3>
                                <ul style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.8', paddingRight: '20px' }}>
                                    <li>نسبة الفوز {winRate >= 60 ? 'ممتازة' : winRate >= 50 ? 'جيدة' : 'تحتاج تحسين'} ({winRate}%)</li>
                                    <li>أفضل أداء من {stats.bestBot?.name_ar} بربح {stats.bestBot?.total_profit_pct}%</li>
                                    <li>تم تنفيذ {stats.totalTrades} صفقة بإجمالي ربح {stats.totalProfit.toLocaleString()} ر.س</li>
                                    <li>البيانات من Yahoo Finance - تحقق من الأسعار الحقيقية</li>
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div style={{ ...styles.card, background: 'rgba(251,191,36,0.1)', textAlign: 'center' }}>
                            <p style={{ fontSize: '48px' }}>📊</p>
                            <p style={{ color: styles.gold, marginTop: '12px' }}>⏱️ شغّل المحاكاة أولاً</p>
                            <button onClick={() => navigate('/settings')} style={{ ...btnGold, marginTop: '12px' }}>
                                ⚙️ الذهاب للإعدادات
                            </button>
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ More Page (المزيد) ============
function MorePage() {
    const navigate = useNavigate();
    const sim = getSimulation();

    const pages = [
        { path: '/portfolio', icon: '💼', label: 'المحفظة', desc: 'نسخ الروبوتات وإدارة المحفظة' },
        { path: '/trades', icon: '📋', label: 'الصفقات', desc: 'جميع الصفقات من كل الروبوتات' },
        { path: '/charts', icon: '📊', label: 'مركز الشارتات', desc: 'الأسعار التاريخية والرسوم البيانية' },
        { path: '/reporter', icon: '📝', label: 'المراسل', desc: 'تقرير شامل عن الأداء' },
        { path: '/bots', icon: '🤖', label: 'الروبوتات', desc: 'جميع الروبوتات الاستثمارية' },
        { path: '/live', icon: '📺', label: 'البث المباشر', desc: 'مراقبة الأسواق مباشرة' },
        { path: '/news', icon: '📰', label: 'الأخبار', desc: 'آخر أخبار السوق' },
        { path: '/time-machine', icon: '⏱️', label: 'آلة الزمن', desc: 'اختبار الروبوتات على بيانات تاريخية' },
        { path: '/verify', icon: '🔍', label: 'التحقق', desc: 'التحقق من الأسعار الحقيقية' },
        { path: '/design-gallery', icon: '🎨', label: 'استوديو التصميم', desc: 'معرض التصاميم' },
    ];

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '8px' }}>⚙️ المزيد</h1>
                    <p style={{ color: styles.gray, marginBottom: '24px', fontSize: '14px' }}>جميع صفحات التطبيق</p>

                    {/* App Info */}
                    <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.05))', textAlign: 'center' }}>
                        <span style={{ fontSize: '48px' }}>🏆</span>
                        <h2 style={{ color: styles.gold, marginTop: '12px', fontSize: '20px' }}>تِبر</h2>
                        <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>روبوتات الاستثمار الذكية</p>
                        {sim && (
                            <p style={{ color: styles.green, fontSize: '14px', marginTop: '8px' }}>
                                ✅ المحاكاة نشطة
                            </p>
                        )}
                    </div>

                    {/* Pages Grid */}
                    <h3 style={{ marginBottom: '12px', marginTop: '24px' }}>📱 الصفحات</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {pages.map(page => (
                            <button key={page.path} onClick={() => navigate(page.path)} style={{
                                ...styles.card,
                                cursor: 'pointer',
                                border: '1px solid #334155',
                                padding: '16px',
                                marginBottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                textAlign: 'right'
                            }}>
                                <span style={{ fontSize: '32px' }}>{page.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{page.label}</p>
                                    <p style={{ color: styles.gray, fontSize: '12px', marginTop: '4px' }}>{page.desc}</p>
                                </div>
                                <span style={{ color: styles.gold, fontSize: '20px' }}>←</span>
                            </button>
                        ))}
                    </div>

                    {/* Version */}
                    <div style={{ textAlign: 'center', marginTop: '24px', padding: '16px' }}>
                        <p style={{ color: styles.gray, fontSize: '11px' }}>الإصدار 2.0</p>
                        <p style={{ color: styles.gray, fontSize: '10px', marginTop: '4px' }}>بيانات حقيقية من Yahoo Finance</p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Time Machine Page (آلة الزمن) ============
function TimeMachinePage() {
    const navigate = useNavigate();
    const [startDate, setStartDate] = useState('2024-01-01');
    const [capital, setCapital] = useState(100000);
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(() => {
        // بيانات مستقلة - لا تؤثر على التطبيق
        try {
            return JSON.parse(localStorage.getItem('time_machine_result')) || null;
        } catch { return null; }
    });

    const runSimulation = async () => {
        setRunning(true);
        setResult(null);
        const res = await fetchPOST(`/api/backtest/run?start_date=${startDate}&initial_capital=${capital}`);
        if (res) {
            setResult(res);
            // حفظ في مكان منفصل
            localStorage.setItem('time_machine_result', JSON.stringify(res));
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '24px', cursor: 'pointer' }}>→</button>
                        <div>
                            <h1 style={{ fontSize: '20px' }}>⏱️ آلة الزمن</h1>
                            <p style={{ color: styles.gray, fontSize: '12px' }}>اختبار مستقل - لا يؤثر على بيانات التطبيق</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={styles.card}>
                        <h3 style={{ color: styles.gold, marginBottom: '16px' }}>🎯 إعدادات المحاكاة</h3>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ color: styles.gray, fontSize: '12px', display: 'block', marginBottom: '4px' }}>📅 تاريخ البدء</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: 'white' }} />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ color: styles.gray, fontSize: '12px', display: 'block', marginBottom: '4px' }}>💰 رأس المال (ر.س)</label>
                            <input type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: 'white' }} />
                        </div>

                        <button onClick={runSimulation} disabled={running} style={{ ...btnGold, opacity: running ? 0.7 : 1 }}>
                            {running ? '⏳ جاري المحاكاة...' : '🚀 تشغيل المحاكاة'}
                        </button>

                        {result && (
                            <button onClick={clearResults} style={{ ...btnGold, marginTop: '8px', background: '#334155', color: 'white' }}>
                                🗑️ مسح النتائج
                            </button>
                        )}
                    </div>

                    {/* Results */}
                    {result && (
                        <>
                            {/* Winner */}
                            {result.leaderboard?.[0] && (
                                <div style={{ ...styles.card, background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))', textAlign: 'center' }}>
                                    <span style={{ fontSize: '48px' }}>🏆</span>
                                    <h3 style={{ color: styles.gold, marginTop: '12px' }}>الفائز</h3>
                                    <p style={{ fontSize: '24px', marginTop: '8px' }}>{result.leaderboard[0].emoji} {result.leaderboard[0].name_ar}</p>
                                    <p style={{ color: styles.green, fontSize: '32px', fontWeight: 'bold', marginTop: '8px' }}>+{result.leaderboard[0].total_profit_pct}%</p>
                                    <p style={{ color: styles.gray, fontSize: '12px', marginTop: '8px' }}>
                                        {result.leaderboard[0].final_balance?.toLocaleString()} ر.س
                                    </p>
                                </div>
                            )}

                            {/* Leaderboard */}
                            <h3 style={{ marginBottom: '12px' }}>📊 الترتيب</h3>
                            {result.leaderboard?.map((bot, i) => {
                                const botData = result.bot_portfolios?.[bot.bot_id];
                                return (
                                    <div key={bot.bot_id} style={{ ...styles.card, marginBottom: '8px', padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: botData?.trades?.length > 0 ? '12px' : 0 }}>
                                            <span style={{ fontSize: '20px', width: '30px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}</span>
                                            <span style={{ fontSize: '24px' }}>{bot.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 'bold' }}>{bot.name_ar}</p>
                                                <p style={{ color: styles.gray, fontSize: '11px' }}>{bot.total_trades} صفقة | فوز {bot.win_rate}%</p>
                                            </div>
                                            <p style={{ color: bot.total_profit_pct >= 0 ? styles.green : styles.red, fontWeight: 'bold' }}>
                                                {bot.total_profit_pct >= 0 ? '+' : ''}{bot.total_profit_pct}%
                                            </p>
                                        </div>

                                        {/* Trades - Clickable */}
                                        {botData?.trades?.length > 0 && (
                                            <div style={{ borderTop: '1px solid #334155', paddingTop: '12px' }}>
                                                <p style={{ color: styles.gray, fontSize: '11px', marginBottom: '8px' }}>📋 الصفقات ({botData.trades.length})</p>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                    {botData.trades.slice(0, 3).map((trade, ti) => (
                                                        <div key={ti} onClick={() => navigate(`/trade/${bot.bot_id}_${trade.symbol}_${ti}`)} style={{
                                                            background: '#1e293b',
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            borderRight: `2px solid ${trade.profit_pct >= 0 ? styles.green : styles.red}`
                                                        }}>
                                                            <div>
                                                                <p style={{ fontSize: '12px', fontWeight: 'bold' }}>{trade.symbol}</p>
                                                                <p style={{ fontSize: '10px', color: styles.gray }}>{trade.date}</p>
                                                            </div>
                                                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: trade.profit_pct >= 0 ? styles.green : styles.red }}>
                                                                {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {botData.trades.length > 3 && (
                                                        <p style={{ fontSize: '10px', color: styles.gray, textAlign: 'center' }}>
                                                            +{botData.trades.length - 3} صفقة أخرى
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Verify Button */}
                            <button
                                onClick={() => navigate('/verify')}
                                style={{
                                    ...btnGold,
                                    marginTop: '16px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
                                }}
                            >
                                🔍 التحقق من الأسعار الحقيقية
                            </button>
                        </>
                    )}

                    {/* Info */}
                    <div style={{ ...styles.card, background: 'rgba(139,92,246,0.1)', marginTop: '16px' }}>
                        <p style={{ color: '#a78bfa', fontSize: '12px', lineHeight: '1.6' }}>
                            💡 <strong>ملاحظة:</strong> نتائج آلة الزمن مستقلة تماماً ولا تؤثر على بيانات التطبيق الرئيسية.
                            يمكنك التجربة بحرية دون القلق على بياناتك.
                        </p>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Live Page (The TikTok Trap - Rebuilt) ============
function LivePage() {
    const [markets, setMarkets] = useState({
        saudi: { name: 'السوق السعودي', flag: '🇸🇦', data: null },
        us: { name: 'السوق الأمريكي', flag: '🇺🇸', data: null },
        crypto: { name: 'العملات الرقمية', flag: '🪙', data: null }
    });
    const [totalProfit, setTotalProfit] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    // --- 1. Robust Countdown Logic ---
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

    // --- 2. Data Fetching (With safe fallbacks) ---
    const fetchData = async (marketKey) => {
        // Simulate "Finding" data to ensure UI always has something to show eventually
        try {
            const res = await fetchPOST(`/api/backtest/run?start_date=2024-01-01&initial_capital=100000&market=${marketKey}`);
            if (res?.leaderboard?.[0]) {
                const winner = res.leaderboard[0];
                setMarkets(prev => ({
                    ...prev,
                    [marketKey]: { ...prev[marketKey], data: winner }
                }));
                setTotalProfit(prev => prev + (winner.final_balance - winner.initial_capital));
            }
        } catch (e) { console.error("Scan error", e); }
    };

    useEffect(() => {
        // Staggered load
        setTimeout(() => fetchData('saudi'), 500);
        setTimeout(() => fetchData('us'), 2500);
        setTimeout(() => fetchData('crypto'), 4500);
    }, []);

    // --- 3. The "Content" Slides (Data-Driven with BOLD TITLES) ---
    const slides = [
        // Slide 0: The Hook (Challenge) - Show Competing Robots
        {
            bg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <div style={{ fontSize: '72px', marginBottom: '8px', filter: 'drop-shadow(0 0 30px rgba(251, 191, 36, 0.4))' }}>📊</div>
                    <h1 style={{
                        color: 'white', fontSize: '36px', fontWeight: '900', margin: '0 0 8px 0',
                        fontFamily: 'Cairo, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        ملخص التنافس الأسبوعي
                    </h1>
                    <p style={{ color: styles.gold, fontSize: '18px', margin: '0 0 16px 0', fontWeight: 'bold', fontFamily: 'Cairo, sans-serif' }}>
                        <span style={{ fontFamily: 'Arial, sans-serif', direction: 'ltr' }}>11</span> روبوت في حلبة المنافسة
                    </p>

                    {/* Competing Robots List */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
                        maxWidth: '320px', margin: '0 auto 16px auto',
                        fontSize: '13px', color: 'white'
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>🤖 المايسترو</div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>🦁 القناص</div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>🦅 صياد الفرص</div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>🐋 الحوت</div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>⚡ البرق</div>
                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}>🎯 الهدّاف</div>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '30px',
                        display: 'inline-block', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ color: styles.gold, fontFamily: 'Arial, sans-serif', fontSize: '28px', fontWeight: 'bold', letterSpacing: '2px', direction: 'ltr' }}>
                            ⏱️ {timeLeft || '00:00:00'}
                        </span>
                    </div>
                </div>
            )
        },
        // Slide 1: Saudi Leader
        {
            bg: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{
                        color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 16px 0',
                        fontFamily: 'Cairo, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        متصدر السوق السعودي 🇸🇦
                    </h1>
                    <div style={{ fontSize: '80px', marginBottom: '8px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}>
                        {markets.saudi.data?.emoji || '🇸🇦'}
                    </div>
                    <div style={{ background: 'white', color: 'black', padding: '8px 24px', borderRadius: '12px', transform: 'rotate(-2deg)', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '900', fontFamily: 'Cairo, sans-serif' }}>{markets.saudi.data?.name_ar || 'جاري البحث...'}</h2>
                    </div>
                    {markets.saudi.data && (
                        <p style={{ color: '#4ade80', fontSize: '42px', fontWeight: '900', margin: '16px 0 0 0', fontFamily: 'monospace', textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>
                            +{markets.saudi.data.total_profit_pct}%
                        </p>
                    )}
                </div>
            )
        },
        // Slide 2: US Leader
        {
            bg: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{
                        color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 16px 0',
                        fontFamily: 'Cairo, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        متصدر السوق الأمريكي 🇺🇸
                    </h1>
                    <div style={{ fontSize: '80px', marginBottom: '8px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}>
                        {markets.us.data?.emoji || '🇺🇸'}
                    </div>
                    <div style={{ background: 'white', color: 'black', padding: '8px 24px', borderRadius: '12px', transform: 'rotate(2deg)', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '900', fontFamily: 'Cairo, sans-serif' }}>{markets.us.data?.name_ar || 'جاري البحث...'}</h2>
                    </div>
                    {markets.us.data && (
                        <p style={{ color: '#60a5fa', fontSize: '42px', fontWeight: '900', margin: '16px 0 0 0', fontFamily: 'monospace', textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>
                            +{markets.us.data.total_profit_pct}%
                        </p>
                    )}
                </div>
            )
        },
        // Slide 3: Crypto Leader
        {
            bg: 'linear-gradient(135deg, #854d0e 0%, #0f172a 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{
                        color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 16px 0',
                        fontFamily: 'Cairo, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        متصدر العملات الرقمية 🪙
                    </h1>
                    <div style={{ fontSize: '80px', marginBottom: '8px', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}>
                        {markets.crypto.data?.emoji || '🪙'}
                    </div>
                    <div style={{ background: 'white', color: 'black', padding: '8px 24px', borderRadius: '12px', transform: 'rotate(-2deg)', display: 'inline-block', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ fontSize: '24px', margin: 0, fontWeight: '900', fontFamily: 'Cairo, sans-serif' }}>{markets.crypto.data?.name_ar || 'جاري البحث...'}</h2>
                    </div>
                    {markets.crypto.data && (
                        <p style={{ color: '#facc15', fontSize: '42px', fontWeight: '900', margin: '16px 0 0 0', fontFamily: 'monospace', textShadow: '0 2px 0 rgba(0,0,0,0.5)' }}>
                            +{markets.crypto.data.total_profit_pct}%
                        </p>
                    )}
                </div>
            )
        },
        // Slide 4: QR Code (App Details)
        {
            bg: 'linear-gradient(135deg, #000000 0%, #171717 100%)',
            content: (
                <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                    <h1 style={{
                        color: 'white', fontSize: '32px', fontWeight: '900', margin: '0 0 20px 0',
                        fontFamily: 'Cairo, sans-serif', textShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}>
                        حمل التطبيق الآن 📲
                    </h1>
                    <div style={{
                        background: 'white', padding: '16px', borderRadius: '20px',
                        display: 'inline-block', boxShadow: '0 0 50px rgba(34, 197, 94, 0.2)'
                    }}>
                        {/* Simulation of a QR Code */}
                        <div style={{
                            width: '140px', height: '140px',
                            background: `
                                linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                                linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                            `,
                            backgroundColor: 'white',
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 10px 10px',
                            border: '4px solid black'
                        }}>
                            <div style={{ width: '40px', height: '40px', background: 'black', margin: '10px' }}></div>
                        </div>
                    </div>
                    <p style={{ color: styles.green, fontSize: '20px', fontWeight: 'bold', margin: '20px 0 0 0', fontFamily: 'Cairo, sans-serif' }}>
                        امسح الكود لتفاصيل أكثر
                    </p>
                </div>
            )
        }
    ];

    // --- 4. Auto-Rotation ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 4000); // 4 seconds per slide
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* Import Cairo Font */}
                <style>{`
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                    @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
                    @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                `}</style>

                {/* === SECTION 1: PRICE TICKER (Market Pulse) === */}
                <div style={{
                    background: 'linear-gradient(90deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                    padding: '10px 0',
                    borderTop: '1px solid rgba(59, 130, 246, 0.3)',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ display: 'inline-block', animation: 'scroll 30s linear infinite', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                        <span style={{ color: '#4ade80', marginRight: '40px', fontWeight: 'bold' }}>📈 AAPL: <span style={{ direction: 'ltr' }}>$195.50</span> <span style={{ fontSize: '11px' }}>+2.3%</span></span>
                        <span style={{ color: '#f87171', marginRight: '40px', fontWeight: 'bold' }}>📉 TSLA: <span style={{ direction: 'ltr' }}>$245.20</span> <span style={{ fontSize: '11px' }}>-1.5%</span></span>
                        <span style={{ color: '#4ade80', marginRight: '40px', fontWeight: 'bold' }}>📈 BTC: <span style={{ direction: 'ltr' }}>$43,250</span> <span style={{ fontSize: '11px' }}>+5.2%</span></span>
                        <span style={{ color: '#4ade80', marginRight: '40px', fontWeight: 'bold' }}>📈 أرامكو: <span style={{ direction: 'ltr' }}>28.50 SR</span> <span style={{ fontSize: '11px' }}>+1.8%</span></span>
                        <span style={{ color: '#f87171', marginRight: '40px', fontWeight: 'bold' }}>📉 الراجحي: <span style={{ direction: 'ltr' }}>85.30 SR</span> <span style={{ fontSize: '11px' }}>-0.5%</span></span>
                        <span style={{ color: '#facc15', marginRight: '40px', fontWeight: 'bold' }}>🪙 ETH: <span style={{ direction: 'ltr' }}>$2,380</span> <span style={{ fontSize: '11px' }}>+3.1%</span></span>
                        <span style={{ color: '#4ade80', marginRight: '40px', fontWeight: 'bold' }}>📈 NVDA: <span style={{ direction: 'ltr' }}>$480.50</span> <span style={{ fontSize: '11px' }}>+4.2%</span></span>
                    </div>
                </div>

                {/* === SECTION 2: THE STAGE (Top 50%) === */}
                <div style={{
                    height: '50vh',
                    width: '100%',
                    background: slides[currentSlide].bg,
                    display: 'flex',
                    flexDirection: 'column', // Prepare for alignment
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    transition: 'background 0.5s ease',
                    borderBottomLeftRadius: '32px',
                    borderBottomRightRadius: '32px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 10,
                    overflow: 'hidden'
                }}>
                    {/* The Active Slide Content */}
                    <div style={{ width: '100%', padding: '20px' }}>
                        {slides[currentSlide].content}
                    </div>

                    {/* Navigation Dots */}
                    <div style={{
                        position: 'absolute', bottom: '20px',
                        display: 'flex', gap: '8px'
                    }}>
                        {slides.map((_, i) => (
                            <div key={i} style={{
                                width: currentSlide === i ? '24px' : '8px',
                                height: '8px',
                                borderRadius: '4px',
                                background: currentSlide === i ? 'white' : 'rgba(255,255,255,0.3)',
                                transition: 'all 0.3s ease'
                            }} />
                        ))}
                    </div>
                </div>

                {/* === SECTION 3: INFO TICKER (Transparency Message) === */}
                <div style={{
                    background: '#000',
                    padding: '12px 0',
                    borderBottom: '1px solid #333',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ display: 'inline-block', animation: 'scroll 25s linear infinite', fontSize: '15px', fontFamily: 'Cairo, sans-serif' }}>
                        <span style={{ color: styles.gold, marginRight: '50px', fontWeight: 'bold' }}>🔴 صفقات مباشرة أون لاين بكل شفافية</span>
                        <span style={{ color: 'white', marginRight: '50px' }}>⚡ ذكاء اصطناعي يعمل 24/7 في الأسواق العالمية</span>
                        <span style={{ color: styles.green, marginRight: '50px', fontWeight: 'bold' }}>✅ شاهد كل عملية شراء وبيع لحظة حدوثها</span>
                        <span style={{ color: 'white', marginRight: '50px' }}>🤖 <span style={{ direction: 'ltr', fontFamily: 'Arial, sans-serif' }}>11</span> روبوت تتنافس على تحقيق أعلى ربح</span>
                        <span style={{ color: styles.gold, marginRight: 'bold', fontWeight: 'bold' }}>💰 لا خفايا - كل شيء مسجل ومفتوح للجميع</span>
                        <span style={{ color: 'white', marginRight: '50px' }}>📊 تحليل فني متقدم + استراتيجيات متنوعة</span>
                    </div>
                </div>

                {/* === SECTION 4: ROBOT ACTIVITY FEED (Live Updates) === */}
                <div style={{ padding: '20px', paddingBottom: '140px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: 'white', fontFamily: 'Cairo, sans-serif' }}>⚡ نبض الروبوتات (مباشر)</h3>
                        <div style={{ color: styles.green, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Cairo, sans-serif' }}>
                            <div style={{ width: '8px', height: '8px', background: styles.green, borderRadius: '50%', animation: 'blink 1s infinite' }} />
                            نشط الآن
                        </div>
                    </div>

                    {/* Feed Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Feed Item: BUY */}
                        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRight: `4px solid ${styles.green}` }}>
                            <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '8px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '20px' }}>🟢</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>المايسترو 🤖</span>
                                    <span style={{ color: styles.gray, fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}>الآن</span>
                                </div>
                                <p style={{ color: styles.green, margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'Cairo, sans-serif' }}>تنفيذ صفقة شراء: NVDA بسعر 480.50$</p>
                            </div>
                        </div>

                        {/* Feed Item: ANALYZE */}
                        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRight: '4px solid #3b82f6' }}>
                            <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '20px' }}>🔵</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>صياد الفرص 🦅</span>
                                    <span style={{ color: styles.gray, fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}>منذ دقيقة</span>
                                </div>
                                <p style={{ color: '#60a5fa', margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'Cairo, sans-serif' }}>جاري تحليل مؤشرات السيولة لسهم أرامكو...</p>
                            </div>
                        </div>

                        {/* Feed Item: SELL */}
                        <div style={{ background: '#1e293b', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderRight: `4px solid ${styles.red}` }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>
                                <span style={{ fontSize: '20px' }}>🔴</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px', fontFamily: 'Cairo, sans-serif' }}>القناص 🦁</span>
                                    <span style={{ color: styles.gray, fontSize: '12px', fontFamily: 'Cairo, sans-serif' }}>منذ 5 دقائق</span>
                                </div>
                                <p style={{ color: '#f87171', margin: '4px 0 0 0', fontSize: '13px', fontFamily: 'Cairo, sans-serif' }}>جني أرباح: بيع الراجحي بربح +2.5%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <BottomNav />
            </div>
        </div>
    );
}

// ============ News Page ============
function NewsPage() {
    const [news, setNews] = useState([]);

    useEffect(() => {
        fetchAPI('/api/news').then(r => r?.data && setNews(r.data));
    }, []);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '24px' }}>📰 الراصد</h1>
                    {news.map((item, i) => (
                        <div key={i} style={styles.card}>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{item.title}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: styles.gray, fontSize: '12px' }}>{item.source}</span>
                                <span style={{
                                    color: item.sentiment === 'positive' ? styles.green : item.sentiment === 'negative' ? styles.red : styles.gray,
                                    fontSize: '12px'
                                }}>
                                    {item.sentiment === 'positive' ? '📈 إيجابي' : item.sentiment === 'negative' ? '📉 سلبي' : '➖ محايد'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}

// ============ Price Verification Page ============
function VerificationPage() {
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
            const res = await fetch(`${API}/api/verify/trades?limit=${limit}`, {
                method: 'POST'
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

// ============ Main App ============
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/trades" element={<TradesPage />} />
                <Route path="/charts" element={<ChartCenterPage />} />
                <Route path="/reporter" element={<ReporterPage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/bots" element={<BotsPage />} />
                <Route path="/bot/:botId" element={<BotProfile />} />
                <Route path="/trade/:tradeId" element={<TradeDetails />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/time-machine" element={<TimeMachinePage />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/design-gallery" element={<DesignGallery />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;


