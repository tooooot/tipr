
import React, { useState } from 'react';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import ChartComparison from '../components/ChartComparison';

export default function ChartCenterPage() {
    const [symbol, setSymbol] = useState('');
    const [activeSymbol, setActiveSymbol] = useState(null);

    const handleSearch = () => {
        if (symbol.trim()) {
            // Remove .SR if user added it, then append it correctly
            const cleanSymbol = symbol.trim().toUpperCase().replace('.SR', '');
            setActiveSymbol(`${cleanSymbol}.SR`);
        }
    };

    const popularStocks = [
        { name: 'الراجحي', code: '1120' },
        { name: 'أرامكو', code: '2222' },
        { name: 'سابك', code: '2010' },
        { name: 'STC', code: '7010' },
        { name: 'الاهلي', code: '1180' },
    ];

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    <h1 style={{ color: styles.gold, fontSize: '24px', marginBottom: '8px' }}>📊 مركز الشارتات</h1>
                    <p style={{ color: styles.gray, fontSize: '14px', marginBottom: '24px' }}>
                        حلل أي سهم في السوق السعودي
                    </p>

                    {/* Search Box */}
                    <div style={{ ...styles.card, display: 'flex', gap: '8px', padding: '16px' }}>
                        <input
                            type="text"
                            placeholder="اكتب رمز السهم (مثلاً 2222)"
                            value={symbol}
                            onChange={e => setSymbol(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                background: '#334155',
                                border: 'none',
                                padding: '12px',
                                borderRadius: '8px',
                                color: 'white',
                                fontFamily: 'inherit'
                            }}
                        />
                        <button onClick={handleSearch} style={{
                            background: styles.gold,
                            color: '#0f172a',
                            border: 'none',
                            padding: '0 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                            بحث
                        </button>
                    </div>

                    {/* Popular Stocks */}
                    {!activeSymbol && (
                        <div style={{ marginBottom: '24px' }}>
                            <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '8px' }}>الأكثر بحثاً:</p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {popularStocks.map(stock => (
                                    <button
                                        key={stock.code}
                                        onClick={() => {
                                            setSymbol(stock.code);
                                            setActiveSymbol(`${stock.code}.SR`);
                                        }}
                                        style={{
                                            background: '#334155',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#e2e8f0',
                                            padding: '8px 16px',
                                            borderRadius: '999px',
                                            fontSize: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {stock.name} ({stock.code})
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Chart Display */}
                    {activeSymbol && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h2 style={{ fontSize: '20px' }}>{activeSymbol}</h2>
                                <button onClick={() => setActiveSymbol(null)} style={{ color: styles.red, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    ✕ إغلاق
                                </button>
                            </div>
                            <ChartComparison symbol={activeSymbol} />
                        </div>
                    )}

                    {/* Info Card */}
                    <div style={{ ...styles.card, background: 'rgba(59,130,246,0.1)', marginTop: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '24px' }}>💡</span>
                            <div>
                                <h3 style={{ color: '#60a5fa', fontSize: '16px', marginBottom: '4px' }}>هل تعلم؟</h3>
                                <p style={{ color: '#dbeafe', fontSize: '13px', lineHeight: '1.6' }}>
                                    يمكنك استخدام مركز الشارتات للتحقق من أي فرصة تداول، أو لمراجعة تاريخ أي سهم قبل الاستثمار فيه.
                                    البيانات المعروضة هي بيانات حقيقية من السوق.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
