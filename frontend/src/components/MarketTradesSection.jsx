import React, { useState } from 'react';
import { styles } from '../styles/theme';

export default function MarketTradesSection({ marketData }) {
    const [expandedMarket, setExpandedMarket] = useState(null);
    const [expandedWeek, setExpandedWeek] = useState(null);

    if (!marketData) return null;

    const markets = ['saudi', 'us', 'crypto'];
    const hasData = markets.some(m => marketData[m]?.trades?.length > 0);

    if (!hasData) {
        return (
            <div style={{
                background: '#1e293b',
                padding: '40px 20px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid #334155'
            }}>
                <span style={{ fontSize: '48px', opacity: 0.5 }}>📭</span>
                <p style={{ color: '#94a3b8', marginTop: '12px' }}>
                    لا توجد صفقات بعد
                </p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {markets.map(marketKey => {
                const market = marketData[marketKey];
                if (!market || market.trades.length === 0) return null;

                const isMarketExpanded = expandedMarket === marketKey;

                return (
                    <div
                        key={marketKey}
                        style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            border: '1px solid #334155',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Market Header */}
                        <div
                            onClick={() => setExpandedMarket(isMarketExpanded ? null : marketKey)}
                            style={{
                                padding: '16px',
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                borderBottom: isMarketExpanded ? '1px solid #334155' : 'none'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                <span style={{ fontSize: '28px' }}>{market.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                                        {market.name}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                                        {market.stats.total} صفقة | {market.weeks.length} أسبوع
                                    </div>
                                </div>
                                <div style={{
                                    fontSize: '20px',
                                    color: isMarketExpanded ? styles.gold : '#64748b'
                                }}>
                                    {isMarketExpanded ? '▲' : '▼'}
                                </div>
                            </div>

                            {/* Market Stats */}
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
                                        إجمالي الربح
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: market.stats.totalProfit >= 0 ? styles.green : styles.red
                                    }}>
                                        {market.stats.totalProfit >= 0 ? '+' : ''}{market.stats.totalProfit}%
                                    </div>
                                </div>

                                <div style={{
                                    background: '#0f172a',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                                        نسبة الفوز
                                    </div>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        color: styles.green
                                    }}>
                                        {Math.round(market.stats.winRate)}%
                                    </div>
                                </div>

                                <div style={{
                                    background: '#0f172a',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                                        النتيجة
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                                        {market.stats.wins}W/{market.stats.losses}L
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weeks within Market */}
                        {isMarketExpanded && market.weeks && (
                            <div style={{ padding: '12px', background: '#0f172a' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {market.weeks.map(week => {
                                        const weekKey = `${marketKey}_${week.weekKey}`;
                                        const isWeekExpanded = expandedWeek === weekKey;

                                        return (
                                            <div
                                                key={weekKey}
                                                style={{
                                                    background: '#1e293b',
                                                    borderRadius: '12px',
                                                    overflow: 'hidden',
                                                    border: '1px solid #334155'
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
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '16px' }}>
                                                            {isWeekExpanded ? '📂' : '📁'}
                                                        </span>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                                                                الأسبوع {week.weekNum}
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: '#64748b' }}>
                                                                {week.trades.length} صفقة
                                                            </div>
                                                        </div>
                                                        <div style={{
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            color: week.totalProfit >= 0 ? styles.green : styles.red
                                                        }}>
                                                            {week.totalProfit >= 0 ? '+' : ''}{week.totalProfit}%
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
                                                                style={{
                                                                    background: '#1e293b',
                                                                    padding: '8px',
                                                                    borderRadius: '8px',
                                                                    marginBottom: '4px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    fontSize: '12px'
                                                                }}
                                                            >
                                                                <span>{trade.profit_pct >= 0 ? '✅' : '❌'}</span>
                                                                <span style={{ flex: 1, fontWeight: 'bold', color: 'white' }}>
                                                                    {trade.symbol}
                                                                </span>
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
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
