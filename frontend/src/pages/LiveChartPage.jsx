import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import BottomNav from '../components/BottomNav';

// البيانات
import livePricesData from '../data/live_prices.json';
import openTradesData from '../data/open_trades.json';
import liveNotifications from '../data/live_notifications.json';
import { ROBOTS_DATA } from '../data/robots';

export default function LiveChartPage() {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const wsRef = useRef(null);
    const terminalRef = useRef(null);

    const [activeMarket, setActiveMarket] = useState('crypto');
    const [livePrices, setLivePrices] = useState(livePricesData);
    const [selectedStock, setSelectedStock] = useState(null);
    const [price, setPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [priceData, setPriceData] = useState([]);
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [opportunities, setOpportunities] = useState(liveNotifications || []);
    const [openTrades, setOpenTrades] = useState(openTradesData || []);
    const [activeTab, setActiveTab] = useState('chart');
    const [cursor, setCursor] = useState({ x: 0, y: 0, active: false, index: -1 });
    const [isPulsing, setIsPulsing] = useState(false);
    const [showStockSelector, setShowStockSelector] = useState(false);

    // إضافة سجل للتيرمنال
    const addLog = useCallback((message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString('ar-SA');
        setTerminalLogs(prev => [
            { time: timestamp, message, type },
            ...prev.slice(0, 99)
        ]);
    }, []);

    // حالة السوق
    const getMarketStatus = (marketKey) => {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hour = now.getHours();
        const minute = now.getMinutes();
        const timeVal = hour + minute / 60;

        if (marketKey === 'crypto') return { label: 'مفتوح 24/7', isOpen: true };

        if (marketKey === 'saudi') {
            // Sunday (0) to Thursday (4)
            // 10:00 to 15:20 (approx)
            if (day >= 0 && day <= 4 && timeVal >= 10 && timeVal <= 15.33) {
                return { label: 'مفتوح', isOpen: true };
            }
            return { label: 'مغلق', isOpen: false };
        }

        if (marketKey === 'us') {
            // Monday (1) to Friday (5)
            // 17:30 to 24:00 (approx KSA time for NYSE) - simplified
            if (day >= 1 && day <= 5) {
                if (timeVal >= 17.5 || timeVal <= 0.0) return { label: 'مفتوح', isOpen: true }; // Simplified
            }
            return { label: 'مغلق', isOpen: false };
        }

        return { label: '---', isOpen: false };
    };

    // تهيئة
    useEffect(() => {
        setLivePrices(livePricesData);
        setOpportunities(liveNotifications || []);
        setOpenTrades(openTradesData || []);

        if (livePricesData.markets[activeMarket]?.stocks?.length > 0) {
            const firstStock = livePricesData.markets[activeMarket].stocks[0];
            setSelectedStock(firstStock);
            setPrice(firstStock.price);
            setPriceChange(firstStock.change || 0);
            addLog(`تم تحميل بيانات ${firstStock.name}`, 'success');
        }
    }, [activeMarket, addLog]);

    // رسم الشارت
    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || priceData.length < 2) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const padding = { top: 30, right: 60, bottom: 40, left: 10 };

        // Clear
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#0a0e17';
        ctx.fillRect(0, 0, width, height);

        // Calculate bounds with padding for volatility zooming
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const prices = priceData.map(d => d.price);
        const minData = Math.min(...prices);
        const maxData = Math.max(...prices);

        // Add minimal padding to avoid touching edges
        const paddingPct = 0.02; // 2% padding
        const diff = maxData - minData || 1;
        const minPrice = minData - (diff * paddingPct);
        const maxPrice = maxData + (diff * paddingPct);
        const priceRange = maxPrice - minPrice || 1;

        // Draw grid
        ctx.strokeStyle = '#1a1f2e';
        ctx.lineWidth = 1;

        // Horizontal lines & Labels
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= 5; i++) {
            const y = padding.top + chartHeight * (i / 5);

            // Grid line
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Price Label
            const priceLabel = maxPrice - (priceRange * (i / 5));
            ctx.fillStyle = '#64748b';
            ctx.fillText(priceLabel.toFixed(2), width - padding.right + 8, y);
        }

        // Time labels
        ctx.textAlign = 'center';
        const timeStep = Math.max(Math.floor(priceData.length / 6), 1);
        for (let i = 0; i < priceData.length; i += timeStep) {
            if (priceData[i]?.time) {
                const x = padding.left + (i / (priceData.length - 1)) * chartWidth;
                const timeStr = new Date(priceData[i].time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
                ctx.fillText(timeStr, x, height - 15);
            }
        }

        // --- CHART LINE & AREA ---
        const colors = {
            crypto: { line: '#00d4aa', fill1: 'rgba(0, 212, 170, 0.2)', fill2: 'rgba(0, 212, 170, 0.0)' },
            us: { line: '#00ff88', fill1: 'rgba(0, 255, 136, 0.2)', fill2: 'rgba(0, 255, 136, 0.0)' },
            saudi: { line: '#ffd700', fill1: 'rgba(255, 215, 0, 0.2)', fill2: 'rgba(255, 215, 0, 0.0)' },
        };
        const color = colors[activeMarket] || colors.crypto;

        const getX = (i) => padding.left + (i / (priceData.length - 1)) * chartWidth;
        const getY = (p) => padding.top + ((maxPrice - p) / priceRange) * chartHeight;

        // Gradient Area
        const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
        gradient.addColorStop(0, color.fill1);
        gradient.addColorStop(1, color.fill2);

        ctx.beginPath();
        ctx.moveTo(getX(0), getY(priceData[0].price));
        priceData.forEach((point, i) => {
            ctx.lineTo(getX(i), getY(point.price));
        });
        ctx.lineTo(getX(priceData.length - 1), height - padding.bottom);
        ctx.lineTo(getX(0), height - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Line
        ctx.beginPath();
        priceData.forEach((point, i) => {
            const x = getX(i);
            const y = getY(point.price);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color.line;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.shadowColor = color.line;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset

        // --- INTERACTIVITY ---
        if (cursor.active && cursor.index >= 0 && cursor.index < priceData.length) {
            const point = priceData[cursor.index];
            const x = getX(cursor.index);
            const y = getY(point.price);

            // 1. Crosshair X
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, height - padding.bottom);
            ctx.stroke();

            // 2. Crosshair Y
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. Dot on line
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.strokeStyle = color.line;
            ctx.stroke();

            // 4. Tooltip
            const tooltipPadding = 8;
            const timeStr = new Date(point.time).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const priceStr = point.price.toFixed(2);

            const text = `${timeStr} | ${priceStr}`;
            const textWidth = ctx.measureText(text).width;
            const tooltipWidth = textWidth + tooltipPadding * 2;
            const tooltipHeight = 24;

            // Tooltip position (keep within bounds)
            let tooltipX = x - tooltipWidth / 2;
            let tooltipY = y - tooltipHeight - 15;

            if (tooltipX < 10) tooltipX = 10;
            if (tooltipX + tooltipWidth > width - 10) tooltipX = width - tooltipWidth - 10;
            if (tooltipY < 10) tooltipY = y + 15; // Flip down if too high

            ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
            ctx.strokeStyle = '#334155';
            ctx.beginPath();
            ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, tooltipX + tooltipWidth / 2, tooltipY + tooltipHeight / 2);
        }
        // Current Price Dot (if not hovering or hovering last)
        else if (priceData.length > 0) {
            const last = priceData[priceData.length - 1];
            const lx = getX(priceData.length - 1);
            const ly = getY(last.price);

            ctx.beginPath();
            ctx.arc(lx, ly, 4, 0, 2 * Math.PI);
            ctx.fillStyle = color.line;
            ctx.fill();

            // Pulse Effect Ring
            if (isPulsing) {
                ctx.beginPath();
                ctx.arc(lx, ly, 12, 0, 2 * Math.PI);
                ctx.fillStyle = color.fill1;
                ctx.fill();
            }
        }

    }, [priceData, activeMarket, cursor, isPulsing]);

    // WebSocket
    useEffect(() => {
        if (!selectedStock || activeMarket !== 'crypto') {
            setIsConnected(false);
            return;
        }

        const symbol = selectedStock.symbol.toLowerCase();
        addLog(`جاري الاتصال بـ ${selectedStock.name}...`, 'info');

        if (wsRef.current) wsRef.current.close();

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            addLog(`✅ تم الاتصال بـ Binance WebSocket`, 'success');
        };

        ws.onerror = (e) => {
            setIsConnected(false);
            addLog(`❌ خطأ في الاتصال: ${e.message || 'مشكلة في الشبكة'}`, 'error');
        };

        ws.onclose = (e) => {
            setIsConnected(false);
            if (e.wasClean) {
                addLog(`🔌 تم قطع الاتصال بشكل طبيعي`, 'warning');
            } else {
                addLog(`⚠️ انقطاع مفاجئ في الاتصال (Code: ${e.code})`, 'error');
            }
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const newPrice = parseFloat(data.p);
                const time = data.T;

                setPrice(prev => {
                    if (newPrice !== prev) {
                        setPriceChange(((newPrice - prev) / prev) * 100);
                        setIsPulsing(true);
                        setTimeout(() => setIsPulsing(false), 300);
                    }
                    return newPrice;
                });

                setPriceData(prev => {
                    // Keep last 150 points for better density
                    const updated = [...prev, { time, price: newPrice }];
                    return updated.length > 150 ? updated.slice(-150) : updated;
                });

                // Reduce log noise
                if (Math.random() < 0.02) {
                    addLog(`💹 ${selectedStock.name}: $${newPrice.toLocaleString()}`, 'price');
                }
            } catch (e) {
                console.error(e);
            }
        };

        return () => ws.close();
    }, [selectedStock, activeMarket, addLog]);

    // Non-crypto data (Simulated)
    useEffect(() => {
        if (activeMarket === 'crypto' || !selectedStock) return;

        setIsConnected(false);
        setPrice(selectedStock.price);
        setPriceChange(selectedStock.change || 0);
        addLog(`📊 تم تحميل ${selectedStock.name}: ${selectedStock.price}`, 'info');

        // Generate synthetic history based on current price
        const mockHistory = [];
        let p = selectedStock.price * 0.98;
        const now = Date.now();
        for (let i = 0; i < 150; i++) { // More points
            // Trend + Random Walk
            const change = (Math.random() - 0.48) * 0.005; // 0.5% volatility
            p = p * (1 + change);
            mockHistory.push({ time: now - (150 - i) * 10000, price: p }); // 10s interval
        }
        mockHistory.push({ time: now, price: selectedStock.price });
        setPriceData(mockHistory);
    }, [selectedStock, activeMarket, addLog]);

    // Draw trigger
    useEffect(() => {
        drawChart();
    }, [drawChart]);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current && canvasRef.current) {
                canvasRef.current.width = containerRef.current.clientWidth;
                canvasRef.current.height = 300; // Taller chart
                drawChart();
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [drawChart]);

    // Interaction Handlers
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !priceData.length) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const padding = { left: 10, right: 60 };
        const chartWidth = canvas.width - padding.left - padding.right;

        // Find nearest index
        // x = padding.left + (i / len) * w
        // (x - padding.left) / w * len = i
        let index = Math.round(((x - padding.left) / chartWidth) * (priceData.length - 1));

        // Clamp
        if (index < 0) index = 0;
        if (index >= priceData.length) index = priceData.length - 1;

        setCursor({ x, y, active: true, index });
    };

    const handleMouseLeave = () => {
        setCursor(prev => ({ ...prev, active: false, index: -1 }));
    };

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = 0;
        }
    }, [terminalLogs]);


    // Helpers
    const changeMarket = (marketId) => {
        setActiveMarket(marketId);
        setPriceData([]);
        addLog(`🔄 تغيير السوق إلى ${livePrices.markets[marketId]?.name}`, 'info');
    };

    const formatPrice = (p, market) => {
        if (!p) return '---';
        if (market === 'saudi') return `${p.toLocaleString('en-US')} ر.س`;
        return `$${p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'success': return '#00ff88';
            case 'error': return '#ff4444';
            case 'warning': return '#ffaa00';
            case 'price': return '#00d4aa';
            default: return '#94a3b8';
        }
    };

    const currentMarket = livePrices.markets[activeMarket];
    const stocks = currentMarket?.stocks || [];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0a0e17',
            color: 'white',
            paddingBottom: '80px',
            fontFamily: 'Inter, system-ui, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                background: 'linear-gradient(180deg, #0f1520 0%, #0a0e17 100%)',
                borderBottom: '1px solid #1a1f2e'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                        width: '44px',
                        height: '44px',
                        background: isPulsing
                            ? `linear-gradient(135deg, #00d4aa, #fff)`
                            : 'linear-gradient(135deg, #00d4aa, #00ff88)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        boxShadow: isPulsing ? '0 0 15px rgba(0, 212, 170, 0.6)' : 'none',
                        transition: 'all 0.1s ease',
                        transform: isPulsing ? 'scale(1.05)' : 'scale(1)'
                    }}>
                        {isConnected ? '⚡' : '📊'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                            مركز التحكم الحي
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: isConnected ? '#00ff88' : '#64748b',
                                boxShadow: isConnected ? '0 0 8px #00ff88' : 'none'
                            }} />
                            <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>
                                {isConnected ? 'متصل بالشبكة الحية' : 'جاري الاتصال...'}
                                {priceData.length > 0 && ` • ${priceData.length} نقطة`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Market Tabs */}
                <div style={{ display: 'flex', background: '#0f1520', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
                    {Object.entries(livePrices.markets).map(([key, market]) => {
                        const status = getMarketStatus(key);
                        const isActive = activeMarket === key;
                        return (
                            <button
                                key={key}
                                onClick={() => changeMarket(key)}
                                style={{
                                    flex: 1,
                                    padding: '10px 6px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: isActive ? '#1e293b' : 'transparent',
                                    color: isActive ? '#fff' : '#64748b',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px'
                                }}
                            >
                                <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500' }}>
                                    {market.name}
                                </span>
                                <span style={{
                                    fontSize: '10px',
                                    color: status.isOpen ? '#00ff88' : '#ff4444',
                                    fontWeight: 'bold',
                                    opacity: isActive ? 1 : 0.7
                                }}>
                                    {status.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Stock Selection */}
                <div style={{ position: 'relative' }}>
                    <div
                        onClick={() => setShowStockSelector(!showStockSelector)}
                        style={{
                            background: '#1a1f2e',
                            padding: '12px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            border: '1px solid #334155'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>{selectedStock?.emoji}</span>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '14px' }}>{selectedStock?.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedStock?.symbol}</div>
                            </div>
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>▼ تغيير</span>
                    </div>

                    {showStockSelector && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            background: '#1a1f2e',
                            border: '1px solid #334155',
                            borderRadius: '12px',
                            marginTop: '8px',
                            maxHeight: '300px',
                            overflowY: 'auto',
                            zIndex: 100,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                        }}>
                            {stocks.map(stock => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => {
                                        setSelectedStock(stock);
                                        setPrice(stock.price);
                                        setPriceData([]);
                                        setShowStockSelector(false);
                                        addLog(`📌 تم اختيار ${stock.name}`, 'info');
                                    }}
                                    style={{
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        borderBottom: '1px solid #334155',
                                        background: selectedStock?.symbol === stock.symbol ? '#334155' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <span>{stock.emoji}</span>
                                    <span style={{ flex: 1, fontWeight: '600' }}>{stock.name}</span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{stock.symbol}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Price Display */}
            <div style={{ padding: '16px 16px 8px', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                <span style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    fontFamily: 'monospace',
                    letterSpacing: '-1px',
                    color: isPulsing ? '#fff' : '#e2e8f0',
                    transition: 'color 0.2s'
                }}>
                    {formatPrice(price, activeMarket)}
                </span>
                <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    paddingBottom: '6px',
                    color: priceChange >= 0 ? '#00ff88' : '#ff4444',
                    display: 'flex', alignItems: 'center', gap: '4px'
                }}>
                    {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}%
                </span>
            </div>

            {/* Interactive Chart */}
            <div
                ref={containerRef}
                style={{
                    height: '300px',
                    background: '#0a0e17',
                    position: 'relative',
                    cursor: 'crosshair',
                    marginBottom: '16px'
                }}
            >
                <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 16px' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #1a1f2e', marginBottom: '16px' }}>
                    {[
                        { id: 'terminal', label: '💻 التيرمنال', count: terminalLogs.length },
                        { id: 'opportunities', label: '🎯 الفرص', count: opportunities.length },
                        { id: 'rules', label: '📜 القواعد', count: ROBOTS_DATA.length },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '12px',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '2px solid #00d4aa' : '2px solid transparent',
                                background: 'transparent',
                                color: activeTab === tab.id ? '#00d4aa' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}
                        >
                            {tab.label} {tab.count > 0 && <span style={{ fontSize: '10px', background: '#1a1f2e', padding: '2px 6px', borderRadius: '10px', marginLeft: '4px' }}>{tab.count}</span>}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ minHeight: '200px' }}>
                    {/* Terminal */}
                    {activeTab === 'terminal' && (
                        <div
                            ref={terminalRef}
                            style={{
                                background: '#000',
                                borderRadius: '12px',
                                padding: '16px',
                                height: '300px',
                                overflowY: 'auto',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                border: '1px solid #1a1f2e'
                            }}
                        >
                            <div style={{ color: '#00d4aa', marginBottom: '12px', fontWeight: 'bold' }}>
                                root@tipr-live:~$ monitor_start
                            </div>
                            {terminalLogs.map((log, i) => (
                                <div key={i} style={{ marginBottom: '6px', display: 'flex', gap: '8px', opacity: 0.9 }}>
                                    <span style={{ color: '#444' }}>[{log.time}]</span>
                                    <span style={{ color: getLogColor(log.type) }}>{log.message}</span>
                                </div>
                            ))}
                            {terminalLogs.length === 0 && (
                                <div style={{ color: '#444', fontStyle: 'italic' }}>في انتظار البيانات...</div>
                            )}
                        </div>
                    )}

                    {/* Opportunities */}
                    {activeTab === 'opportunities' && (
                        <div style={{ display: 'grid', gap: '10px' }}>
                            {opportunities.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                    لا توجد فرص نشطة حالياً
                                </div>
                            )}
                            {opportunities.slice(0, 20).map((opp, i) => {
                                const robot = ROBOTS_DATA.find(r => r.id === opp.bot_id) || {};
                                return (
                                    <div
                                        key={i}
                                        style={{
                                            background: '#131b29',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: '1px solid #1a1f2e',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '18px' }}>{opp.emoji}</span>
                                                <span style={{ fontWeight: '700', fontSize: '15px' }}>{opp.stock_name}</span>
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: '11px' }}>{opp.time}</span>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '13px', color: '#00ff88', fontWeight: 'bold' }}>
                                                {opp.signal} @ {opp.price}
                                            </div>
                                            <div style={{ fontSize: '11px', background: '#1a1f2e', padding: '4px 8px', borderRadius: '4px', color: '#94a3b8' }}>
                                                ثقة: {opp.confidence}%
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
                                            {opp.reason}
                                        </div>

                                        <div style={{
                                            marginTop: '8px',
                                            paddingTop: '8px',
                                            borderTop: '1px solid #1a1f2e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            fontSize: '11px'
                                        }}>
                                            <span>{robot.emoji || '🤖'}</span>
                                            <span style={{ color: '#00d4aa' }}>{robot.name || opp.bot_name}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Rules */}
                    {activeTab === 'rules' && (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <div style={{
                                background: '#1a1f2e',
                                borderRadius: '12px',
                                padding: '16px',
                                border: '1px solid #334155'
                            }}>
                                <div style={{ color: '#00d4aa', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🧠</span> منطق عمل الروبوتات
                                </div>
                                <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}>
                                    تعمل هذه الروبوتات بمراقبة السوق لحظياً بناءً على القواعد المذكورة أدناه. عند تحقق الشرط، يتم إرسال تنبيه فوراً أو فتح صفقة آلية.
                                </div>
                            </div>

                            {ROBOTS_DATA.map((robot) => (
                                <div
                                    key={robot.id}
                                    style={{
                                        background: '#0f1520',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        border: '1px solid #1a1f2e',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px',
                                            background: '#1a1f2e', borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '24px'
                                        }}>
                                            {robot.emoji}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#fff', fontSize: '15px' }}>{robot.name}</div>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{robot.market === 'all' ? 'جميع الأسواق' : robot.market}</div>
                                        </div>
                                    </div>

                                    <div style={{
                                        background: '#000',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        marginBottom: '10px',
                                        fontFamily: 'monospace',
                                        fontSize: '12px',
                                        color: '#00d4aa',
                                        borderLeft: '3px solid #00d4aa'
                                    }}>
                                        IF ({robot.rule}) <br />
                                        THEN BUY
                                    </div>

                                    <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                                        {robot.description}
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '8px',
                                        fontSize: '11px'
                                    }}>
                                        <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '6px', borderRadius: '4px', textAlign: 'center', color: '#00ff88' }}>
                                            🎯 هدف: {robot.take_profit}
                                        </div>
                                        <div style={{ background: 'rgba(255, 68, 68, 0.1)', padding: '6px', borderRadius: '4px', textAlign: 'center', color: '#ff4444' }}>
                                            🛡️ وقف: {robot.stop_loss}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
