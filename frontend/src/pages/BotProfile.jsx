import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';

// Bot Details
const BOTS = {
    'al_maestro': {
        name_ar: 'المايسترو',
        emoji: '🎭',
        strategy: 'استراتيجية الزخم الصاعد',
        description: 'يدخل في الأسهم ذات الزخم القوي مع مؤشرات صعودية واضحة',
        initial_capital: 100000
    },
    'al_qannas': {
        name_ar: 'القناص',
        emoji: '🎯',
        strategy: 'استراتيجية RSI المنخفض',
        description: 'يصطاد الأسهم عند التشبع البيعي للدخول في فرص الارتداد',
        initial_capital: 100000
    },
    'sayyad_alfors': {
        name_ar: 'صياد الفرص',
        emoji: '🏹',
        strategy: 'استراتيجية الدعم القوي',
        description: 'يدخل عند اختبار مستويات الدعم القوية',
        initial_capital: 100000
    },
    'al_jasour': {
        name_ar: 'الجسور',
        emoji: '🦅',
        strategy: 'استراتيجية الانخفاض الكبير',
        description: 'يستغل الانخفاضات الحادة للدخول بأسعار مغرية',
        initial_capital: 100000
    },
    'al_hout': {
        name_ar: 'الحوت',
        emoji: '🐋',
        strategy: 'استراتيجية الحجم الضخم',
        description: 'يتابع الأحجام الكبيرة ويدخل مع المؤسسات',
        initial_capital: 100000
    }
};

// Helper: Group trades by week
function groupByWeek(trades) {
    const weeks = {};

    trades.forEach(trade => {
        const date = new Date(trade.entry_date);
        const year = date.getFullYear();
        const weekNum = Math.ceil((date - new Date(year, 0, 1)) / 604800000);
        const weekKey = `${year}-W${weekNum}`;

        if (!weeks[weekKey]) {
            weeks[weekKey] = {
                weekNum,
                year,
                trades: [],
                totalProfit: 0,
                wins: 0,
                losses: 0
            };
        }

        weeks[weekKey].trades.push(trade);
        weeks[weekKey].totalProfit += trade.profit_pct || 0;
        if (trade.profit_pct > 0) weeks[weekKey].wins++;
        else weeks[weekKey].losses++;
    });

    return Object.values(weeks).sort((a, b) => b.year - a.year || b.weekNum - a.weekNum);
}

export default function BotProfile() {
    const { botId } = useParams();
    const navigate = useNavigate();

    const bot = BOTS[botId] || BOTS['al_maestro'];
    const [trades, setTrades] = useState([]);
    const [marketData, setMarketData] = useState({});
    const [stats, setStats] = useState({ total: 0, winRate: 0, profit: 0 });
    const [portfolios, setPortfolios] = useState({});
    const [championships, setChampionships] = useState([]);
    const [expandedMarket, setExpandedMarket] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(null);

    useEffect(() => {
        // Load trades
        import('../data/real_trades.json')
            .then(data => {
                if (data.default) {
                    const botTrades = data.default.filter(t => t.bot_id === botId);
                    setTrades(botTrades);

                    // Calculate overall stats
                    const totalProfit = botTrades.reduce((sum, t) => sum + (t.profit_pct || 0), 0);
                    const wins = botTrades.filter(t => t.profit_pct > 0).length;

                    setStats({
                        total: botTrades.length,
                        winRate: botTrades.length > 0 ? Math.round((wins / botTrades.length) * 100) : 0,
                        profit: Math.round(totalProfit * 10) / 10
                    });

                    // Group by market and calculate portfolios
                    const saudi = botTrades.filter(t => t.market === 'saudi');
                    const us = botTrades.filter(t => t.market === 'us');
                    const crypto = botTrades.filter(t => t.market === 'crypto');

                    const calculatePortfolio = (trades, initialCap) => {
                        const profit = trades.reduce((sum, t) => sum + (t.profit_pct || 0), 0);
                        const profitAmount = (initialCap * profit) / 100;
                        return {
                            initialYear: initialCap, // قبل سنة
                            current: Math.round(initialCap + profitAmount), // الآن
                            profit: Math.round(profit * 10) / 10,
                            profitAmount: Math.round(profitAmount),
                            growth: Math.round((profitAmount / initialCap) * 100 * 10) / 10
                        };
                    };

                    setPortfolios({
                        saudi: calculatePortfolio(saudi, bot.initial_capital),
                        us: calculatePortfolio(us, bot.initial_capital),
                        crypto: calculatePortfolio(crypto, bot.initial_capital)
                    });

                    setMarketData({
                        saudi: { trades: saudi, weeks: groupByWeek(saudi) },
                        us: { trades: us, weeks: groupByWeek(us) },
                        crypto: { trades: crypto, weeks: groupByWeek(crypto) }
                    });
                }
            })
            .catch(() => { });

        // Load championships
        import('../data/history_events.json')
            .then(data => {
                if (data.default?.awards) {
                    const botChamps = data.default.awards
                        .filter(a => a.bot_id === botId)
                        .sort((a, b) => new Date(b.date) - new Date(a.date));
                    setChampionships(botChamps);
                }
            })
            .catch(() => { });
    }, [botId]);

    const marketInfo = {
        saudi: { name: 'السوق السعودي', emoji: '🇸🇦' },
        us: { name: 'السوق الأمريكي', emoji: '🇺🇸' },
        crypto: { name: 'الكريبتو', emoji: '🪙' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }}
                        >
                            ←
                        </button>
                        <h1 style={{ fontSize: '20px', margin: 0 }}>ملف الروبوت</h1>
                    </div>

                    {/* Bot Card */}
                    <div style={{
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        padding: '24px',
                        borderRadius: '24px',
                        marginBottom: '24px',
                        border: '1px solid #334155',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ fontSize: '72px', marginBottom: '8px' }}>{bot.emoji}</div>
                        <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', color: styles.gold }}>{bot.name_ar}</h2>
                        <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '4px' }}>{bot.strategy}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6', marginTop: '12px' }}>
                            {bot.description}
                        </div>
                    </div>

                    {/* Overall Stats */}
                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '18px', color: styles.gold, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📊</span> الأداء الإجمالي
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '12px'
                        }}>
                            <div style={{
                                background: '#1e293b',
                                padding: '16px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                border: '1px solid #334155'
                            }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                                    إجمالي الصفقات
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>
                                    {stats.total}
                                </div>
                            </div>

                            <div style={{
                                background: '#1e293b',
                                padding: '16px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                border: '1px solid #334155'
                            }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                                    نسبة الفوز
                                </div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: styles.green }}>
                                    {stats.winRate}%
                                </div>
                            </div>

                            <div style={{
                                background: '#1e293b',
                                padding: '16px',
                                borderRadius: '16px',
                                textAlign: 'center',
                                border: '1px solid #334155'
                            }}>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                                    إجمالي الربح
                                </div>
                                <div style={{
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: stats.profit >= 0 ? styles.green : styles.red
                                }}>
                                    {stats.profit >= 0 ? '+' : ''}{stats.profit}%
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Championships */}
                    {championships.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', color: styles.gold, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>🏆</span> البطولات ({championships.length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {championships.slice(0, 5).map((champ, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: '#1e293b',
                                            padding: '14px',
                                            borderRadius: '12px',
                                            border: '1px solid #334155',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <span style={{ fontSize: '24px' }}>🏆</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                                                {champ.title_ar}
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                {new Date(champ.date).toLocaleDateString('ar-SA')}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: styles.green }}>
                                            +{champ.profit}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Markets with Portfolios */}
                    <div style={{ marginBottom: '100px' }}>
                        <h3 style={{ fontSize: '18px', color: styles.gold, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>🌍</span> المحافظ والصفقات
                        </h3>

                        {Object.entries(marketData).map(([market, data]) => {
                            if (!data.trades || data.trades.length === 0) return null;

                            const info = marketInfo[market];
                            const portfolio = portfolios[market] || {};
                            const isExpanded = expandedMarket === market;

                            return (
                                <div
                                    key={market}
                                    style={{
                                        background: '#1e293b',
                                        borderRadius: '16px',
                                        marginBottom: '16px',
                                        border: '1px solid #334155',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Market Header + Portfolio */}
                                    <div
                                        onClick={() => setExpandedMarket(isExpanded ? null : market)}
                                        style={{
                                            padding: '16px',
                                            cursor: 'pointer',
                                            background: 'linear-gradient(135deg, #1e293b, #0f172a)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '28px' }}>{info.emoji}</span>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                                                    {info.name}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {data.trades.length} صفقة | {data.weeks.length} أسبوع
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '20px', color: isExpanded ? styles.gold : '#64748b' }}>
                                                {isExpanded ? '▲' : '▼'}
                                            </div>
                                        </div>

                                        {/* Portfolio Stats */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(3, 1fr)',
                                            gap: '8px'
                                        }}>
                                            <div style={{
                                                background: '#0f172a',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                                                    قبل سنة
                                                </div>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#64748b' }}>
                                                    ${portfolio.initialYear?.toLocaleString()}
                                                </div>
                                            </div>

                                            <div style={{
                                                background: '#0f172a',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                                                    الرصيد الآن
                                                </div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', color: styles.green }}>
                                                    ${portfolio.current?.toLocaleString()}
                                                </div>
                                            </div>

                                            <div style={{
                                                background: '#0f172a',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                textAlign: 'center'
                                            }}>
                                                <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                                                    الربح
                                                </div>
                                                <div style={{
                                                    fontSize: '14px',
                                                    fontWeight: 'bold',
                                                    color: portfolio.profit >= 0 ? styles.green : styles.red
                                                }}>
                                                    {portfolio.profit >= 0 ? '+' : ''}{portfolio.profit}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Weeks */}
                                    {isExpanded && data.weeks && (
                                        <div style={{
                                            borderTop: '1px solid #334155',
                                            padding: '12px',
                                            background: '#0f172a'
                                        }}>
                                            {data.weeks.map(week => {
                                                const weekKey = `${market}_W${week.weekNum}`;
                                                const isWeekExpanded = expandedWeek === weekKey;

                                                return (
                                                    <div
                                                        key={weekKey}
                                                        style={{
                                                            background: '#1e293b',
                                                            borderRadius: '12px',
                                                            marginBottom: '8px',
                                                            border: '1px solid #334155',
                                                            overflow: 'hidden'
                                                        }}
                                                    >
                                                        {/* Week Summary */}
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedWeek(isWeekExpanded ? null : weekKey);
                                                            }}
                                                            style={{
                                                                padding: '12px',
                                                                cursor: 'pointer',
                                                                background: isWeekExpanded ? '#0f172a' : 'transparent'
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                                <span style={{ fontSize: '16px' }}>
                                                                    {isWeekExpanded ? '📂' : '📁'}
                                                                </span>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                                                                        الأسبوع {week.weekNum}
                                                                    </div>
                                                                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                                        {week.trades.length} صفقة | {week.wins}W {week.losses}L
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '16px',
                                                                    fontWeight: 'bold',
                                                                    color: week.totalProfit >= 0 ? styles.green : styles.red
                                                                }}>
                                                                    {week.totalProfit >= 0 ? '+' : ''}{Math.round(week.totalProfit * 10) / 10}%
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Week Trades */}
                                                        {isWeekExpanded && (
                                                            <div style={{
                                                                borderTop: '1px solid #334155',
                                                                padding: '8px',
                                                                background: '#0f172a'
                                                            }}>
                                                                {week.trades.map((trade, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        onClick={() => navigate(`/trade/${trade.id}`)}
                                                                        style={{
                                                                            background: '#1e293b',
                                                                            padding: '10px',
                                                                            borderRadius: '8px',
                                                                            marginBottom: '4px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: '8px',
                                                                            fontSize: '12px',
                                                                            cursor: 'pointer',
                                                                            transition: 'transform 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                                                                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                                                    >
                                                                        <span>{trade.profit_pct >= 0 ? '✅' : '❌'}</span>
                                                                        <div style={{ flex: 1 }}>
                                                                            <span style={{ fontWeight: 'bold', color: 'white' }}>
                                                                                {trade.symbol}
                                                                            </span>
                                                                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                                                {trade.entry_date}
                                                                            </div>
                                                                        </div>
                                                                        <span style={{
                                                                            fontWeight: 'bold',
                                                                            color: trade.profit_pct >= 0 ? styles.green : styles.red
                                                                        }}>
                                                                            {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}
