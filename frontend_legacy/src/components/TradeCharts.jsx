
import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { styles, btnGold } from '../styles/theme';
import { fetchAPI } from '../utils/api';

export default function TradeCharts({ symbol, entryDate, exitDate, entryPrice, exitPrice, targetPrice, stopPrice, botId }) {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            const res = await fetchAPI(`/api/verify/stock/${symbol}?days=90`);
            if (res?.success) {
                setChartData(res.data);
            }

            // Mock News Fetching for Basira (would be real in production)
            if (botId === 'al_basira') {
                // Mock news relevant to the entry date
                setNews([
                    { date: entryDate, title: `أخبار إيجابية قوية لـ ${symbol}`, url: `https://www.google.com/search?q=${symbol}+news`, sentiment: 'positive' },
                    { date: insertDays(entryDate, -2), title: "توقعات بنمو الأرباح", url: "#", sentiment: 'positive' }
                ]);
            }

            setLoading(false);
        };
        fetchChartData();
    }, [symbol, botId, entryDate]);

    const insertDays = (dateStr, days) => {
        const d = new Date(dateStr);
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
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

    // Prepare ApexCharts Data
    const candlestickData = chartData.prices.map(p => ({
        x: new Date(p.date).getTime(),
        y: [p.open, p.high, p.low, p.close]
    }));

    // Annotations for Entry, Target, Stop
    const yaxisAnnotations = [
        {
            y: entryPrice,
            borderColor: styles.gold,
            label: {
                borderColor: styles.gold,
                style: { color: '#fff', background: styles.gold },
                text: `دخول: ${entryPrice}`
            }
        },
        targetPrice ? {
            y: targetPrice,
            borderColor: styles.green,
            label: {
                borderColor: styles.green,
                style: { color: '#fff', background: styles.green },
                text: `هدف: ${targetPrice}`
            }
        } : null,
        stopPrice ? {
            y: stopPrice,
            borderColor: styles.red,
            label: {
                borderColor: styles.red,
                style: { color: '#fff', background: styles.red },
                text: `وقف: ${stopPrice}`
            }
        } : null
    ].filter(Boolean);

    // Points (Entry/Exit markers)
    const pointsAnnotations = [
        {
            x: new Date(entryDate).getTime(),
            y: entryPrice,
            marker: { size: 6, fillColor: styles.gold, strokeColor: '#fff', strokeWidth: 2 },
            label: { borderColor: styles.gold, style: { color: '#fff', background: styles.gold }, text: '🚀 دخول' }
        },
        exitDate ? {
            x: new Date(exitDate).getTime(),
            y: exitPrice,
            marker: { size: 6, fillColor: exitPrice >= entryPrice ? styles.green : styles.red, strokeColor: '#fff', strokeWidth: 2 },
            label: {
                borderColor: exitPrice >= entryPrice ? styles.green : styles.red,
                style: { color: '#fff', background: exitPrice >= entryPrice ? styles.green : styles.red },
                text: exitPrice >= entryPrice ? '✅ ربح' : '❌ خمارة'
            }
        } : null
    ].filter(Boolean);

    // News Annotations (for Basira)
    if (botId === 'al_basira' && news.length > 0) {
        news.forEach(n => {
            pointsAnnotations.push({
                x: new Date(n.date).getTime(),
                y: entryPrice, // Put it near entry price
                marker: { size: 5, fillColor: '#3b82f6', strokeColor: '#fff', radius: 2 },
                label: {
                    borderColor: '#3b82f6',
                    style: { color: '#fff', background: '#3b82f6' },
                    text: `📰 ${n.title}`
                }
            });
        });
    }

    const chartOptions = {
        chart: { type: 'candlestick', height: 350, background: 'transparent', toolbar: { show: false } }, // Transparent to blend with card
        theme: { mode: 'dark' },
        title: { text: '', align: 'right' },
        annotations: {
            yaxis: yaxisAnnotations,
            points: pointsAnnotations
        },
        xaxis: { type: 'datetime', tooltip: { enabled: true } },
        yaxis: { tooltip: { enabled: true } },
        plotOptions: { candlestick: { colors: { upward: styles.green, downward: styles.red } } },
        grid: { borderColor: '#334155' }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Chart 1: Plan & Analysis (With Entry/Target/Stop) */}
            <div style={{ ...styles.card, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: styles.gold, fontSize: '14px' }}>📊 شارت الخطة (دخول - هدف - وقف)</h4>
                </div>
                <Chart options={chartOptions} series={[{ data: candlestickData }]} type="candlestick" height={300} />
            </div>

            {/* Chart 2: What Happened (Outcome) */}
            <div style={{ ...styles.card, padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: '#a78bfa', fontSize: '14px' }}>📉 ماذا حدث؟ (التنفيذ الفعلي)</h4>
                </div>
                {/* Same data but focused on the outcome period */}
                <Chart
                    options={{
                        ...chartOptions,
                        annotations: { points: pointsAnnotations }, // Only show points here, maybe remove lines to reduce clutter or keep them
                        chart: { ...chartOptions.chart, id: 'outcome-chart' }
                    }}
                    series={[{ data: candlestickData }]}
                    type="candlestick"
                    height={300}
                />
                <p style={{ color: styles.gray, fontSize: '12px', marginTop: '8px', textAlign: 'center' }}>
                    {exitDate ? `تم إغلاق الصفقة في ${exitDate} عند ${exitPrice}` : 'الصفقة لا تزال مفتوحة'}
                </p>
            </div>

            {/* Basira News Section */}
            {botId === 'al_basira' && (
                <div style={styles.card}>
                    <h3 style={{ color: styles.gold, marginBottom: '12px' }}>👁️ أخبار البصيرة</h3>
                    <p style={{ color: styles.gray, fontSize: '12px', marginBottom: '16px' }}>
                        الأخبار التي اعتمد عليها "البصيرة" في اتخاذ القرار:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {news.map((n, i) => (
                            <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{
                                background: '#334155',
                                padding: '12px',
                                borderRadius: '8px',
                                color: 'white',
                                textDecoration: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>{n.title} <span style={{ fontSize: '10px', color: '#94a3b8' }}>({n.date})</span></span>
                                <span>↗️</span>
                            </a>
                        ))}
                        <a href={`https://news.google.com/search?q=${symbol}+stock+saudi`} target="_blank" rel="noopener noreferrer" style={{
                            ...btnGold,
                            marginTop: '8px',
                            background: '#2563eb',
                            color: 'white'
                        }}>
                            📰 بحث في Google News
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
