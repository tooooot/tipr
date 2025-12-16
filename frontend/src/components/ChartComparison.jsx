
import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { styles, btnGold } from '../styles/theme';

// Generate Mock Price Data that RESPECTS the trade outcome
const generateSmartData = (basePrice, isWin, volatility = 0.02) => {
    let prices = [];
    let date = new Date();
    date.setDate(date.getDate() - 60);

    let currentPrice = basePrice;
    // Trend Control: If Win -> Trend Up, If Loss -> Trend Down
    let trendBias = isWin ? 0.002 : -0.002;

    for (let i = 0; i < 90; i++) {
        // Random walk with Bias
        let change = (Math.random() - 0.5 + (trendBias * 10)) * (currentPrice * volatility);
        currentPrice += change;

        // Safety: Don't let price go to zero
        if (currentPrice < 1) currentPrice = 1;

        prices.push({
            x: new Date(date).getTime(),
            y: parseFloat(currentPrice.toFixed(2))
        });
        date.setDate(date.getDate() + 1);
    }
    return prices;
};

// updated signature to accept isWin explicitly
export default function ChartComparison({ symbol, entryDate, exitDate, entryPrice, exitPrice, stopLoss, takeProfit, isWin: isWinProp }) {
    const [chartSeries, setChartSeries] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Validate Inputs
    const rawEntry = parseFloat(entryPrice);
    const validEntry = !isNaN(rawEntry) && rawEntry > 0 ? rawEntry : 50.00;

    // Determine Winning Status Logic (Priority: Prop > Calculated)
    const rawExit = parseFloat(exitPrice);
    const validExit = !isNaN(rawExit) && rawExit > 0 ? rawExit : null;

    // If isWinProp is provided (boolean), use it. Otherwise calculate.
    const isWin = isWinProp !== undefined ? isWinProp : (validExit ? (validExit >= validEntry) : true);

    const validTakeProfit = parseFloat(takeProfit) || (validEntry * 1.05);
    const validStopLoss = parseFloat(stopLoss) || (validEntry * 0.95);

    useEffect(() => {
        // Generate data that MATCHES the outcome (Smart Generator)
        const data = generateSmartData(validEntry, isWin);

        // HACK: Force the END data points to align visually with the Exit Price
        if (validExit) {
            // Smoothly transition the last 10 points to the exit price
            const lastIndex = data.length - 1;
            for (let i = 0; i < 10; i++) {
                data[lastIndex - i].y = validExit + (Math.random() - 0.5); // Add slight noise
            }
            data[lastIndex].y = validExit; // Exact match for last
        }

        setChartData(data);
        setChartSeries([{ name: 'السعر', data: data }]);
        setLoading(false);
    }, [symbol, validEntry, validExit, isWin]);

    const takeScreenshot = () => {
        alert('سيتم إضافة ميزة اللقطة قريباً!');
    };

    if (loading) return <div style={{ ...styles.card, padding: '40px', textAlign: 'center' }}>جاري رسم الشارت...</div>;

    // --- SCALING ---
    const dataMin = Math.min(...chartData.map(d => d.y));
    const dataMax = Math.max(...chartData.map(d => d.y));
    const absoluteMin = Math.min(dataMin, validStopLoss, validEntry) * 0.98;
    const absoluteMax = Math.max(dataMax, validTakeProfit, validEntry) * 1.02;

    // Timestamps
    const entryPointIndex = Math.floor(chartData.length * 0.2); // Start earlier
    const exitPointIndex = chartData.length - 1; // End at the end
    const entryTimestamp = chartData[entryPointIndex]?.x || new Date().getTime();
    const exitTimestamp = chartData[exitPointIndex]?.x || new Date().getTime();

    // --- Chart 1: The Plan ---
    const planOptions = {
        chart: { type: 'area', height: 300, background: '#1e293b', toolbar: { show: false }, zoom: { enabled: false } },
        stroke: { curve: 'smooth', width: 2, colors: [styles.gold] },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 100] } },
        dataLabels: { enabled: false },
        xaxis: { type: 'datetime', tooltip: { enabled: false }, labels: { style: { colors: '#94a3b8' } } },
        yaxis: {
            show: true, labels: { style: { colors: '#94a3b8' } },
            min: absoluteMin, max: absoluteMax
        },
        grid: { show: false },
        theme: { mode: 'dark' },
        annotations: {
            yaxis: [
                { y: validEntry, borderColor: styles.gold, label: { borderColor: styles.gold, style: { color: '#000', background: styles.gold, fontSize: '10px' }, text: `دخول` } },
                { y: validTakeProfit, borderColor: styles.green, strokeDashArray: 4, label: { borderColor: styles.green, style: { color: '#fff', background: styles.green, fontSize: '10px' }, text: `هدف` } },
                { y: validStopLoss, borderColor: styles.red, strokeDashArray: 4, label: { borderColor: styles.red, style: { color: '#fff', background: styles.red, fontSize: '10px' }, text: `وقف` } }
            ]
        }
    };

    // --- Chart 2: The Result ---
    const resultOptions = {
        ...planOptions,
        annotations: {
            yaxis: [
                { y: validEntry, borderColor: styles.gold, strokeDashArray: 4, label: { style: { color: '#000', background: styles.gold, fontSize: '10px' }, text: `الدخول` } }
            ],
            points: [
                {
                    x: exitTimestamp,
                    y: validExit || validEntry,
                    marker: {
                        size: 8,
                        fillColor: isWin ? styles.green : styles.red,
                        strokeColor: '#fff', strokeWidth: 3
                    },
                    label: {
                        borderColor: isWin ? styles.green : styles.red,
                        offsetY: 0,
                        style: {
                            color: '#fff',
                            background: isWin ? styles.green : styles.red,
                            fontSize: '12px', fontWeight: 'bold'
                        },
                        text: isWin ? '✅ خروج ربح' : '🛑 خروج خسارة'
                    }
                }
            ]
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button onClick={takeScreenshot} style={{ ...btnGold, padding: '8px 16px', fontSize: '12px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                    📸 حفظ بطاقة الصفقة
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ ...styles.card, padding: '20px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)' }}>
                    <div style={{ marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                        <h4 style={{ color: styles.gold, fontSize: '16px', marginBottom: '4px' }}>📐 خطة الروبوت</h4>
                    </div>
                    <Chart options={planOptions} series={chartSeries} type="area" height={300} />
                </div>

                <div style={{ ...styles.card, padding: '20px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', border: isWin ? `2px solid ${styles.green}` : `2px solid ${styles.red}` }}>
                    <div style={{ marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                        <h4 style={{ color: isWin ? styles.green : styles.red, fontSize: '16px', marginBottom: '4px' }}>
                            {isWin ? '🏆 النتيجة النهائية: نجاح' : '🔻 النتيجة النهائية: خسارة'}
                        </h4>
                    </div>
                    <Chart options={resultOptions} series={chartSeries} type="area" height={300} />
                </div>
            </div>
        </div>
    );
}
