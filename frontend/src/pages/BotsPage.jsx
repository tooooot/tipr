
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getBotData } from '../utils/storage';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export const DEFAULT_BOTS = [
    // --- Universal Strategies (Originally Saudi 🇸🇦) ---
    { id: 'al_maestro', name_ar: 'المايسترو', emoji: '🤖', market: 'all', description: 'الاستراتيجية الهجينة الذكية: توازن بين النمو والأمان.', risk_level: 'متوسط', strategy_ar: 'هجين ذكي' },
    { id: 'al_qannas', name_ar: 'القناص', emoji: '🦁', market: 'all', description: 'اقتناص الفرص السريعة والمضاربة اللحظية.', risk_level: 'عالي', strategy_ar: 'مضاربة سريعة' },
    { id: 'al_hout', name_ar: 'الحوت', emoji: '🐋', market: 'all', description: 'تتبع السيولة الذكية وأوامر الهوامير.', risk_level: 'منخفض', strategy_ar: 'تتبع السيولة' },
    { id: 'sayyad_alfors', name_ar: 'صياد الفرص', emoji: '🦅', market: 'all', description: 'الدخول عند الارتداد من القيعان السعرية.', risk_level: 'عالي', strategy_ar: 'ارتداد (Reversal)' },
    { id: 'smart_investor', name_ar: 'المستثمر الذكي', emoji: '🧠', market: 'all', description: 'التركيز على الشركات ذات النمو المستدام والعوائد.', risk_level: 'منخفض', strategy_ar: 'استثمار قيمة' },
    { id: 'wave_breaker', name_ar: 'كاسر الأمواج', emoji: '🌊', market: 'all', description: 'الدخول مع اختراق نقاط المقاومة (Breakout).', risk_level: 'متوسط', strategy_ar: 'اختراق (Breakout)' },
    { id: 'gap_hunter', name_ar: 'صائد الفجوات', emoji: '🕳️', market: 'all', description: 'الاستفادة من الفجوات السعرية عند الافتتاح.', risk_level: 'عالي', strategy_ar: 'فجوات (Gaps)' },
    { id: 'momentum_tracker', name_ar: 'متتبع الزخم', emoji: '🚀', market: 'all', description: 'ركوب موجة الصعود القوي (Momentum).', risk_level: 'عالي', strategy_ar: 'زخم (Momentum)' },
    { id: 'shield_keeper', name_ar: 'حارس المحفظة', emoji: '🛡️', market: 'all', description: 'استراتيجية التحوط وتقليل المخاطر (DCA).', risk_level: 'منخفض جداً', strategy_ar: 'تحوط (Hedging)' },
    { id: 'indicator_pro', name_ar: 'خبير المؤشرات', emoji: '📊', market: 'all', description: 'الاعتماد الكلي على التحليل الفني (RSI, MACD, MA).', risk_level: 'متوسط', strategy_ar: 'تحليل فني' },
    { id: 'copy_cat', name_ar: 'الناسخ', emoji: '👥', market: 'all', description: 'نسخ صفقات المحافظ الأعلى أداءً تلقائياً.', risk_level: 'عالي', strategy_ar: 'نسخ (Social)' },

    // --- Global Strategies (Originally US/Crypto 🇺🇸 🪙) ---
    { id: 'wall_street_wolf', name_ar: 'ذئب وول ستريت', emoji: '🐺', market: 'all', description: 'اقتناص الأسهم الأكثر تداولاً وجدلاً.', risk_level: 'عالي جداً', strategy_ar: 'Trend Following' },
    { id: 'tech_titan', name_ar: 'عملاق التقنية', emoji: '💻', market: 'all', description: 'متخصص في قطاع التكنولوجيا والذكاء الاصطناعي.', risk_level: 'متوسط', strategy_ar: 'قطاعي (Sector)' },
    { id: 'dividend_king', name_ar: 'ملك التوزيعات', emoji: '👑', market: 'all', description: 'بناء دخل سلبي من توزيعات الأرباح.', risk_level: 'منخفض', strategy_ar: 'دخل (Income)' },
    { id: 'crypto_king', name_ar: 'ملك الكريبتو', emoji: '🤴', market: 'all', description: 'استراتيجيات خاصة للأصول الرقمية والبيتكوين.', risk_level: 'عالي', strategy_ar: 'أصول رقمية' },
    { id: 'defi_wizard', name_ar: 'ساحر الـDeFi', emoji: '🧙‍♂️', market: 'all', description: 'اكتشاف مشاريع التمويل اللامركزي المبكرة.', risk_level: 'عالي جداً', strategy_ar: 'DeFi Alpha' },
];

export default function BotsPage() {
    const navigate = useNavigate();
    const [bots, setBots] = useState(DEFAULT_BOTS);
    const [filter, setFilter] = useState('all'); // all, saudi, us, crypto

    useEffect(() => {
        // Try to fetch from API, fallback to DEFAULT_BOTS if empty/fails
        fetchAPI('/api/bots')
            .then(r => {
                if (r?.data && r.data.length > 0) {
                    setBots(r.data);
                } else {
                    setBots(DEFAULT_BOTS);
                }
            })
            .catch(() => setBots(DEFAULT_BOTS));
    }, []);

    // Filter Logic
    // Filter Logic: Show All Bots for now (Universal Concept), 
    // unless user wants to simulate filtering by origin (optional). 
    // For universal bots, we show everything.
    const filteredBots = bots;

    const getMarketInfo = (bot) => {
        // If filter is 'all', default to Saudi or Bot's origin.
        // If filter is specific (e.g. 'us'), show that market's info for the bot.

        let targetMarket = filter === 'all' ? 'saudi' : filter;

        // Specific overrides if needed, but for now we follow the filter
        if (targetMarket === 'us') return { flag: '🇺🇸', currency: '$', label: 'السوق الأمريكي' };
        if (targetMarket === 'crypto') return { flag: '🪙', currency: 'USDT', label: 'سوق الكريبتو' };

        // Default
        return { flag: '🇸🇦', currency: 'ر.س', label: 'السوق السعودي' };
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h1 style={{ color: styles.gold, fontSize: '24px', margin: 0 }}>🤖 الروبوتات</h1>
                        <span style={{ fontSize: '12px', color: styles.gray }}>{filteredBots.length} روبوت نشط</span>
                    </div>

                    {/* Market Filters */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
                        {[
                            { id: 'all', label: 'الكل', icon: '🌍' },
                            { id: 'saudi', label: 'السعودي', icon: '🇸🇦' },
                            { id: 'us', label: 'الأمريكي', icon: '🇺🇸' },
                            { id: 'crypto', label: 'الكريبتو', icon: '🪙' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                style={{
                                    flex: 1,
                                    background: filter === f.id ? styles.gold : '#334155',
                                    color: filter === f.id ? '#0f172a' : 'white',
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '12px 16px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{f.icon}</span> {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Bots List */}
                    {/* Bots List (Compact Grid) */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px'
                    }}>
                        {filteredBots.map(bot => {
                            const data = getBotData(bot.id);
                            const marketInfo = getMarketInfo(bot);
                            const profit = data?.total_profit_pct || 0;
                            const isPositive = profit >= 0;

                            return (
                                <div
                                    key={bot.id}
                                    onClick={() => navigate(`/bot/${bot.id}`)}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        border: '1px solid #334155',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    {/* Compact Header */}
                                    <div style={{
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        flex: 2,
                                        background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.3) 0%, rgba(30, 41, 59, 0) 100%)'
                                    }}>
                                        <div style={{ fontSize: '42px', marginBottom: '8px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                                            {bot.emoji}
                                        </div>
                                        <h2 style={{ color: 'white', fontSize: '16px', fontWeight: 'bold', margin: '0 0 4px 0', lineHeight: '1.2' }}>
                                            {bot.name_ar}
                                        </h2>
                                        <p style={{ color: styles.gray, fontSize: '10px', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {bot.description}
                                        </p>
                                    </div>

                                    {/* Compact Stats */}
                                    <div style={{
                                        padding: '12px',
                                        borderTop: '1px solid #334155',
                                        background: 'rgba(15, 23, 42, 0.5)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '18px' }}>{marketInfo.flag}</span>
                                        <span style={{
                                            color: isPositive ? styles.green : styles.red,
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            direction: 'ltr',
                                            fontFamily: 'monospace'
                                        }}>
                                            {isPositive ? '+' : ''}{profit}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Zero State */}
                    {
                        filteredBots.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '40px', color: styles.gray }}>
                                <p style={{ fontSize: '48px', marginBottom: '16px' }}>💤</p>
                                <p>لا توجد روبوتات في هذا السوق حالياً</p>
                            </div>
                        )
                    }
                </div >
                <BottomNav />
            </div >
        </div >
    );
}
