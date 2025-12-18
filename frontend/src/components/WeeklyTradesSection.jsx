import React, { useState } from 'react';
import { styles } from '../styles/theme';
import { useNavigate } from 'react-router-dom';

export default function WeeklyTradesSection({ weeklyTrades, botEmoji }) {
    const navigate = useNavigate();
    const [expandedWeek, setExpandedWeek] = useState(null);

    if (!weeklyTrades || weeklyTrades.length === 0) {
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weeklyTrades.map((week, idx) => {
                const isExpanded = expandedWeek === week.weekKey;

                return (
                    <div
                        key={week.weekKey}
                        style={{
                            background: '#1e293b',
                            borderRadius: '16px',
                            border: '1px solid #334155',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Week Summary Header (Clickable) */}
                        <div
                            onClick={() => setExpandedWeek(isExpanded ? null : week.weekKey)}
                            style={{
                                padding: '16px',
                                cursor: 'pointer',
                                background: isExpanded ? '#0f172a' : 'transparent',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '20px' }}>
                                    {isExpanded ? '📂' : '📁'}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', marginBottom: '4px' }}>
                                        🏆 تحدي الأسبوع {week.weekNum}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                        {week.startDate.toLocaleDateString('ar-SA', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                                        الصفقات
                                    </div>
                                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: styles.gold }}>
                                        {week.trades.length}
                                    </div>
                                </div>
                            </div>

                            {/* Week Stats */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '8px',
                                marginTop: '12px'
                            }}>
                                <div style={{
                                    background: '#334155',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                                        الربح
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: week.totalProfit >= 0 ? styles.green : styles.red
                                    }}>
                                        {week.totalProfit >= 0 ? '+' : ''}{week.totalProfit}%
                                    </div>
                                </div>

                                <div style={{
                                    background: '#334155',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                                        الفوز
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        color: styles.green
                                    }}>
                                        {Math.round(week.winRate)}%
                                    </div>
                                </div>

                                <div style={{
                                    background: '#334155',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px' }}>
                                        نتيجة
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
                                        {week.wins}W / {week.losses}L
                                    </div>
                                </div>
                            </div>

                            {/* Expand Indicator */}
                            <div style={{
                                textAlign: 'center',
                                marginTop: '12px',
                                fontSize: '12px',
                                color: '#64748b'
                            }}>
                                {isExpanded ? '▲ إخفاء الصفقات' : '▼ عرض صفقات الأسبوع'}
                            </div>
                        </div>

                        {/* Expanded Trades List */}
                        {isExpanded && (
                            <div style={{
                                borderTop: '1px solid #334155',
                                padding: '12px',
                                background: '#0f172a'
                            }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {week.trades.map((trade, tradeIdx) => (
                                        <div
                                            key={tradeIdx}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/trade/${trade.id}`);
                                            }}
                                            style={{
                                                background: '#1e293b',
                                                padding: '12px',
                                                borderRadius: '12px',
                                                border: `1px solid ${trade.profit_pct >= 0 ? '#22c55e33' : '#ef444433'}`,
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                        >
                                            {/* Icon */}
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '12px',
                                                background: trade.profit_pct >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '20px'
                                            }}>
                                                {trade.profit_pct >= 0 ? '✅' : '❌'}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginBottom: '2px' }}>
                                                    {trade.symbol}
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                    {new Date(trade.entry_date).toLocaleDateString('ar-SA', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>

                                            {/* Profit */}
                                            <div style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: trade.profit_pct >= 0 ? styles.green : styles.red
                                            }}>
                                                {trade.profit_pct >= 0 ? '+' : ''}{trade.profit_pct}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
