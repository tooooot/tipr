
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getBotData } from '../utils/storage';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

const DEFAULT_BOTS = [
    // --- Saudi Market 🇸🇦 ---
    { id: 'al_maestro', name_ar: 'المايسترو', emoji: '🤖', market: 'saudi', description: 'روبوت متوازن يركز على الأسهم القيادية وذات العوائد.', risk_level: 'متوسط', strategy_ar: 'نمو متوازن' },
    { id: 'al_qannas', name_ar: 'القناص', emoji: '🦁', market: 'saudi', description: 'يبحث عن الفرص السريعة والمضاربة اليومية.', risk_level: 'عالي', strategy_ar: 'مضاربة سريعة' },
    { id: 'al_hout', name_ar: 'الحوت', emoji: '🐋', market: 'saudi', description: 'يركز على السيولة العالية وتجميع الأسهم.', risk_level: 'منخفض', strategy_ar: 'تجميع' },
    { id: 'sayyad_alfors', name_ar: 'صياد الفرص', emoji: '🦅', market: 'saudi', description: 'اقتناص الأسهم المرتدة من القيعان.', risk_level: 'عالي', strategy_ar: 'ارتداد' },

    // --- US Market 🇺🇸 ---
    { id: 'wall_street_wolf', name_ar: 'ذئب وول ستريت', emoji: '🐺', market: 'us', description: 'تركيز على أسهم التكنولوجيا والنمو السريع.', risk_level: 'عالي', strategy_ar: 'نمو جسور' },
    { id: 'tech_titan', name_ar: 'عملاق التقنية', emoji: '💻', market: 'us', description: 'يستثمر حصرياً في العمالقة السبعة (Magnificent Seven).', risk_level: 'متوسط', strategy_ar: 'استثمار تقني' },
    { id: 'dividend_king', name_ar: 'ملك التوزيعات', emoji: '👑', market: 'us', description: 'أسهم الأرستقراطيين التي توزع أرباحاً متزايدة.', risk_level: 'منخفض', strategy_ar: 'دخل سلبي' },

    // --- Crypto Market 🪙 ---
    { id: 'crypto_king', name_ar: 'ملك الكريبتو', emoji: '🤴', market: 'crypto', description: 'تداول البيتكوين والإيثيريوم فقط.', risk_level: 'متوسط', strategy_ar: 'Trend Following' },
    { id: 'altcoin_hunter', name_ar: 'صياد العملات', emoji: '🚀', market: 'crypto', description: 'البحث عن الجواهر الخفية والعملات البديلة.', risk_level: 'عالي جداً', strategy_ar: 'High Risk' },
    { id: 'defi_wizard', name_ar: 'saher_defi', emoji: '🧙‍♂️', market: 'crypto', description: 'الاستفادة من تحركات التمويل اللامركزي.', risk_level: 'عالي', strategy_ar: 'DeFi Omni' },
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
    const filteredBots = bots.filter(bot => {
        if (filter === 'all') return true;
        // Check both explicit market field and inferred logic for backward compatibility
        const m = bot.market || (['al_maestro', 'al_qannas', 'al_hout', 'sayyad_alfors'].includes(bot.id) ? 'saudi' : 'us');
        return m === filter;
    });

    const getMarketInfo = (bot) => {
        // Determine market details based on bot ID or market field
        let market = { flag: '🇸🇦', currency: 'ر.س', label: 'السوق السعودي' };

        if (bot.market === 'us' || ['wall_street_wolf', 'tech_titan', 'dividend_king'].includes(bot.id)) {
            market = { flag: '🇺🇸', currency: '$', label: 'السوق الأمريكي' };
        } else if (bot.market === 'crypto' || ['crypto_king', 'altcoin_hunter', 'defi_wizard'].includes(bot.id)) {
            market = { flag: '🪙', currency: 'USDT', label: 'سوق الكريبتو' };
        }
        return market;
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                        borderRadius: '24px',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                        border: '1px solid #334155'
                                    }}
                                >
                                    {/* Header Section: Big Emoji + Name */}
                                    <div style={{
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 1) 100%)',
                                        borderBottom: '1px solid #334155'
                                    }}>
                                        <div style={{
                                            fontSize: '80px',
                                            marginBottom: '10px',
                                            filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.2))'
                                        }}>
                                            {bot.emoji}
                                        </div>
                                        <h2 style={{
                                            color: 'white',
                                            fontSize: '28px',
                                            fontWeight: '900',
                                            margin: '0 0 8px 0',
                                            fontFamily: 'Cairo, sans-serif'
                                        }}>
                                            {bot.name_ar}
                                        </h2>
                                        <p style={{
                                            color: styles.gray,
                                            fontSize: '16px',
                                            margin: 0,
                                            lineHeight: '1.5'
                                        }}>
                                            {bot.description}
                                        </p>
                                    </div>

                                    {/* Stats Section */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '32px' }}>{marketInfo.flag}</span>
                                            <div>
                                                <p style={{ color: styles.gray, fontSize: '12px' }}>السوق</p>
                                                <p style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>{marketInfo.label}</p>
                                            </div>
                                        </div>

                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ color: styles.gray, fontSize: '12px' }}>العائد الكلي</p>
                                            <p style={{
                                                color: isPositive ? styles.green : styles.red,
                                                fontSize: '32px',
                                                fontWeight: '900',
                                                margin: 0,
                                                direction: 'ltr',
                                                fontFamily: 'monospace'
                                            }}>
                                                {isPositive ? '+' : ''}{profit}%
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div >

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
