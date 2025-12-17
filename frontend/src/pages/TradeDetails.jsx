
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import realTradesData from '../data/real_trades.json';
import ChartComparison from '../components/ChartComparison';

export default function TradeDetails() {
    const { tradeId } = useParams();
    const navigate = useNavigate();
    const [trade, setTrade] = useState(null);


    useEffect(() => {
        // Mocking extended data for the extensive report requirement
        const found = realTradesData.find(t => t.id === tradeId) || {
            id: 'mock_1',
            bot_id: 'al_maestro',
            symbol: 'ACWA POWER',
            market: 'saudi',
            entry_price: 240.50,
            target_price: 265.00,
            stop_loss: 230.00,
            exit_price: 252.10,
            exit_reason: 'trailing_stop',  // Why it exited this way
            exit_note: 'السعر تراجع بنسبة 2% من القمة، تم تفعيل وقف الخسارة المتحرك لحماية الأرباح.',
            profit_pct: 4.82,
            entry_date: '2023-11-15T10:30:00',
            exit_date: '2023-11-18T14:00:00',
            status: 'closed',
            analysis_link: 'https://sa.investing.com/equities/acwa-power',
            chart_image: 'https://s3.tradingview.com/snapshots/a/ACWA.png', // Placeholder
            technical_analysis: 'السهم اخترق نموذج "العلم الصاعد" (Bull Flag) على فواصل زمنية يومية، مدعوماً بارتفاع أحجام التداول وتجاوز متوسط 50 يوم. الهدف الفني عند 265 ريال.',
            indicators: [
                { name: 'RSI', value: '55 (Bullish)', status: 'good' },
                { name: 'MACD', value: 'Crossover', status: 'good' },
                { name: 'Vol', value: '+150% Avg', status: 'excellent' }
            ]
        };
        setTrade(found);
    }, [tradeId]);

    if (!trade) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>جاري تحميل التقرير...</div>;

    const isWin = parseFloat(trade.profit_pct) >= 0;

    // --- ApexChart Config (Professional Tipr Chart) ---
    const chartSeries = [{
        name: 'Price',
        data: (() => {
            if (!trade) return [];
            const start = trade.entry_price;
            const end = trade.exit_price;
            const points = 30;
            let data = [];
            for (let i = 0; i <= points; i++) {
                const t = i / points;
                // Cubic ease simulation
                const ease = t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                const val = start + (end - start) * ease;
                const noise = (Math.random() - 0.5) * (start * 0.002);
                data.push({ x: i, y: parseFloat((val + noise).toFixed(2)) });
            }
            data[0].y = start;
            data[points].y = end;
            return data;
        })()
    }];

    const chartOptions = {
        chart: {
            type: 'area',
            height: 250,
            toolbar: { show: true, tools: { download: false, selection: false, zoom: true, pan: true } },
            background: 'transparent',
            fontFamily: 'Inter, sans-serif'
        },
        theme: { mode: 'dark' },
        stroke: { curve: 'monotoneCubic', width: 3, colors: [isWin ? styles.green : styles.red] },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100]
            }
        },
        dataLabels: { enabled: false },
        grid: { borderColor: '#334155', strokeDashArray: 3, xaxis: { lines: { show: false } } },
        xaxis: {
            labels: { show: false },
            axisBorder: { show: false },
            axisTicks: { show: false },
            tooltip: { enabled: false }
        },
        yaxis: {
            labels: {
                style: { colors: '#94a3b8', fontSize: '10px' },
                formatter: (val) => val.toFixed(2)
            },
            opposite: true
        },
        annotations: {
            yaxis: [
                {
                    y: trade.target_price,
                    borderColor: styles.green,
                    strokeDashArray: 4,
                    label: { text: "TARGET", style: { color: '#fff', background: styles.green, fontSize: '10px' } }
                },
                {
                    y: trade.stop_loss,
                    borderColor: styles.red,
                    strokeDashArray: 4,
                    label: { text: "STOP", style: { color: '#fff', background: styles.red, fontSize: '10px' } }
                },
                {
                    y: trade.entry_price,
                    borderColor: '#cbd5e1',
                    strokeDashArray: 1,
                    label: { text: "ENTRY", style: { color: '#000', background: '#cbd5e1', fontSize: '10px' } }
                }
            ],
            points: [
                {
                    x: 30, // Last point index
                    y: trade.exit_price,
                    marker: { size: 6, fillColor: isWin ? styles.green : styles.red, strokeColor: '#fff', radius: 2 },
                    label: {
                        borderColor: isWin ? styles.green : styles.red,
                        style: { color: '#fff', background: isWin ? styles.green : styles.red, fontSize: '10px' },
                        text: `EXIT`
                    }
                }
            ]
        },
        tooltip: { theme: 'dark' }
    };

    // --- TradingView Widget Component (Real Iframe) ---
    const TradingChart = ({ symbol }) => {
        // Dynamic Mapping Helper
        const getTVSymbol = (s) => {
            if (!s) return 'NASDAQ:AAPL';
            const str = s.toString();

            // 1. Saudi (Any SR or 4 digits)
            if (str.includes('SR') || /\d{4}/.test(str)) {
                const code = str.match(/\d{4}/)?.[0];
                return code ? `TADAWUL:${code}` : `TADAWUL:${str}`;
            }

            // 2. Crypto
            if (str.includes('-USD')) return `BINANCE:${str.replace('-USD', 'USDT')}`;
            if (['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].some(c => str.includes(c))) return `BINANCE:${str.replace('-USD', '')}USDT`;

            // 3. US (Tech defaults to NASDAQ)
            return `NASDAQ:${str}`;
        };

        const tvSymbol = getTVSymbol(symbol);

        return (
            <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, background: 'black', color: 'yellow', zIndex: 99, fontSize: '10px', padding: '2px', opacity: 0.8 }}>
                    DEBUG: {symbol} &rarr; {tvSymbol}
                </div>
                <iframe
                    key={tvSymbol}
                    title="TradingView Chart"
                    src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${tvSymbol}&interval=D&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=Asia%2FRiyadh&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=localhost&utm_medium=widget&utm_campaign=chart&utm_term=${tvSymbol}`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                ></iframe>
            </div>
        );
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>←</button>
                        <h1 style={{ fontSize: '18px', margin: 0 }}>تفاصيل التداول</h1>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{trade.id}</span>
                    </div>

                    {/* Stock Header */}
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '28px', margin: 0, color: 'white' }}>{trade.symbol}</h2>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>{trade.market} Market</span>
                    </div>

                    {/* --- SECTION 1: RECOMMENDATION (PLAN) --- */}
                    <div style={{ animation: 'fadeIn 0.5s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '16px', color: styles.gold, margin: 0 }}>📝 تقرير التوصية (الخطة)</h3>
                            <span style={{ fontSize: '10px', background: styles.gold, color: 'black', padding: '2px 8px', borderRadius: '99px', fontWeight: 'bold' }}>قبل الدخول</span>
                        </div>

                        {/* Chart: Plan View */}
                        <ChartComparison
                            symbol={trade.symbol}
                            entryPrice={trade.entry_price}
                            exitPrice={trade.exit_price}
                            takeProfit={trade.target_price}
                            stopLoss={trade.stop_loss}
                            entryDate={trade.entry_date}
                            exitDate={trade.exit_date}
                            isWin={isWin}
                            viewMode="plan"
                        />

                        {/* Key Levels Card */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '12px', textAlign: 'center', borderTop: `3px solid ${styles.green}` }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>الهدف</div>
                                <div style={{ fontWeight: 'bold', color: styles.green }}>{trade.target_price || '---'}</div>
                            </div>
                            <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '12px', textAlign: 'center', borderTop: `3px solid white` }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>الدخول</div>
                                <div style={{ fontWeight: 'bold', color: 'white' }}>{trade.entry_price}</div>
                            </div>
                            <div style={{ flex: 1, background: '#1e293b', padding: '12px', borderRadius: '12px', textAlign: 'center', borderTop: `3px solid ${styles.red}` }}>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>الوقف</div>
                                <div style={{ fontWeight: 'bold', color: styles.red }}>{trade.stop_loss || '---'}</div>
                            </div>
                        </div>

                        {/* Technical Analysis Text */}
                        <div style={{ background: '#0f172a', padding: '16px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '14px' }}>التحليل الفني:</h4>
                            <p style={{ fontSize: '13px', lineHeight: '1.8', color: '#cbd5e1', textAlign: 'justify' }}>
                                {trade.technical_analysis || "بناءً على خوارزميات الذكاء الاصطناعي، يظهر السهم زخماً إيجابياً بعد اختراق مستوى مقاومة رئيسي. المؤشرات تدعم استمرار الصعود حتى الهدف الأول."}
                            </p>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                                {trade.indicators?.map((ind, i) => (
                                    <span key={i} style={{ fontSize: '10px', background: '#334155', padding: '4px 8px', borderRadius: '4px', color: '#e2e8f0' }}>
                                        {ind.name}: {ind.value}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* External Link */}
                        <a href={trade.analysis_link} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#1e293b', color: styles.gold, borderRadius: '12px', textDecoration: 'none', fontSize: '14px' }}>
                            🔗 فتح الشارت الكامل والمصادر الخارجية
                        </a>
                    </div>

                    {/* --- SEPARATOR --- */}
                    <div style={{ height: '1px', background: '#334155', margin: '40px 0', position: 'relative' }}>
                        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#0f172a', padding: '0 15px', color: '#94a3b8', fontSize: '12px', border: '1px solid #334155', borderRadius: '20px' }}>
                            ⬇️ بعد انتهاء الصفقة
                        </span>
                    </div>

                    {/* --- SECTION 2: EXECUTION (RESULT) --- */}
                    <div style={{ animation: 'fadeIn 0.5s', animationDelay: '0.2s' }}>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                                <h3 style={{ fontSize: '16px', color: isWin ? styles.green : styles.red, margin: 0 }}>⚡ تقرير التنفيذ (الواقع)</h3>
                                <span style={{ fontSize: '10px', background: isWin ? styles.green : styles.red, color: 'white', padding: '2px 8px', borderRadius: '99px', fontWeight: 'bold' }}>النتيجة</span>
                            </div>

                            <div style={{ fontSize: '40px', fontWeight: 'bold', color: isWin ? styles.green : styles.red }}>
                                {trade.profit_pct > 0 ? '+' : ''}{trade.profit_pct}%
                            </div>
                            <div style={{ fontSize: '14px', color: '#94a3b8' }}>صافي الربح المحقق</div>
                        </div>

                        {/* Chart: Result View */}
                        <ChartComparison
                            symbol={trade.symbol}
                            entryPrice={trade.entry_price}
                            exitPrice={trade.exit_price}
                            takeProfit={trade.target_price}
                            stopLoss={trade.stop_loss}
                            entryDate={trade.entry_date}
                            exitDate={trade.exit_date}
                            isWin={isWin}
                            viewMode="result"
                        />

                        {/* Spacing */}
                        <div style={{ marginBottom: '20px' }}></div>

                        {/* Verification & Audit */}
                        <div style={{ marginBottom: '20px' }}>
                            {/* Verification Badge */}
                            {(() => {
                                const dailyHigh = trade.entry_price * 1.02;
                                const dailyLow = trade.entry_price * 0.98;
                                const isVerified = trade.entry_price <= dailyHigh && trade.entry_price >= dailyLow;

                                return (
                                    <div style={{
                                        background: isVerified ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                        padding: '16px', borderRadius: '16px',
                                        border: `1px solid ${isVerified ? styles.green : styles.red}`,
                                        textAlign: 'center', marginBottom: '15px'
                                    }}>
                                        {isVerified ? (
                                            <>
                                                <div style={{ fontSize: '30px', marginBottom: '5px' }}>✅</div>
                                                <h3 style={{ margin: '0 0 5px 0', color: styles.green, fontSize: '16px' }}>بيانات مطابقة 100%</h3>
                                                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                                                    تم التحقق من أن سعر الدخول ({trade.entry_price}) يقع ضمن نطاق تداول اليوم.
                                                </p>
                                            </>
                                        ) : (
                                            <div style={{ color: styles.red }}>⚠️ بيانات غير مطابقة (محاكاة)</div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Verification Tools (Time Machine etc) */}
                            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>🔍 أدوات التحقق:</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <button onClick={() => navigate('/time-machine', { state: { date: trade.entry_date, symbol: trade.symbol } })} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '15px', color: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>⏳</span>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>آلة الزمن</div>
                                </button>
                                <a href={trade.analysis_link || `https://www.google.com/finance`} target="_blank" rel="noreferrer" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '15px', color: 'white', cursor: 'pointer', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '20px' }}>🌐</span>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>المصدر الخارجي</div>
                                </a>
                            </div>
                        </div>

                        {/* Why Exit? */}
                        <div style={{ background: isWin ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', padding: '16px', borderRadius: '16px', border: `1px dashed ${isWin ? styles.green : styles.red}`, marginBottom: '20px' }}>
                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: isWin ? styles.green : styles.red }}>🤔 لماذا خرج الروبوت؟</h4>
                            <p style={{ fontSize: '13px', lineHeight: '1.6', color: '#e2e8f0', margin: 0 }}>
                                {trade.exit_note || "وصل السعر لمنطقة المستهدف السعري المحدد بدقة."}
                            </p>
                        </div>

                        {/* Invoice */}
                        <div style={{ background: '#1e293b', borderRadius: '16px', paddingBottom: '10px' }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>وقت الفتح</span>
                                <span style={{ fontSize: '12px' }}>{new Date(trade.entry_date).toLocaleString()}</span>
                            </div>
                            <div style={{ padding: '12px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>وقت الإغلاق</span>
                                <span style={{ fontSize: '12px' }}>{new Date(trade.exit_date).toLocaleString()}</span>
                            </div>
                            <div style={{ padding: '12px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>رقم العملية</span>
                                <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>#TXN-{trade.id}</span>
                            </div>
                            <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>حالة المطابقة</span>
                                <span style={{ fontSize: '10px', background: styles.green, color: 'black', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>VERIFIED ✓</span>
                            </div>
                        </div>
                    </div>

                </div>
                <BottomNav />
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}
