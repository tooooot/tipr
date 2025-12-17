/**
 * LiveCryptoChart - شارت الكريبتو الحي (نسخة مبسطة)
 * ===================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import { createChart } from 'lightweight-charts';

// Available trading pairs
const SYMBOLS = [
    { id: 'btcusdt', name: 'Bitcoin', symbol: 'BTC/USDT', emoji: '₿' },
    { id: 'ethusdt', name: 'Ethereum', symbol: 'ETH/USDT', emoji: 'Ξ' },
    { id: 'bnbusdt', name: 'BNB', symbol: 'BNB/USDT', emoji: '🔶' },
    { id: 'solusdt', name: 'Solana', symbol: 'SOL/USDT', emoji: '◎' },
];

// Store for robots to access
if (!window.TIPR_LIVE_DATA) {
    window.TIPR_LIVE_DATA = {
        currentPrice: null,
        lastUpdate: null,
        symbol: null,
        candles: [],
        priceHistory: []
    };
}

export default function LiveCryptoChart({ onPriceUpdate }) {
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const wsRef = useRef(null);

    const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0]);
    const [currentPrice, setCurrentPrice] = useState(null);
    const [priceChange, setPriceChange] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [chartReady, setChartReady] = useState(false);

    // Step 1: Initialize Chart ONCE
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const container = chartContainerRef.current;

        // Clear any existing chart
        container.innerHTML = '';

        const chart = createChart(container, {
            width: container.clientWidth || 600,
            height: 350,
            layout: {
                background: { color: '#0f172a' },
                textColor: '#e2e8f0',
            },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            },
        });

        // Use Line series instead of Candlestick for simplicity
        const series = chart.addLineSeries({
            color: '#22c55e',
            lineWidth: 2,
        });

        chartRef.current = chart;
        seriesRef.current = series;
        setChartReady(true);

        const handleResize = () => {
            if (container) {
                chart.applyOptions({ width: container.clientWidth });
            }
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            setChartReady(false);
        };
    }, []);

    // Step 2: Load Data & Connect WebSocket when symbol changes
    useEffect(() => {
        if (!chartReady) return;

        const symbol = selectedSymbol.id.toLowerCase();

        // Load historical data
        const loadData = async () => {
            try {
                const url = `https://api.binance.com/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m&limit=60`;
                const response = await fetch(url);
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const lineData = data.map(k => ({
                        time: Math.floor(k[0] / 1000),
                        value: parseFloat(k[4]), // close price
                    }));

                    if (seriesRef.current) {
                        seriesRef.current.setData(lineData);
                        chartRef.current?.timeScale().fitContent();
                    }

                    // Store for robots
                    window.TIPR_LIVE_DATA.candles = lineData;
                }
            } catch (err) {
                console.error('Load error:', err);
            }
        };

        loadData();

        // WebSocket connection
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                const price = parseFloat(data.p);
                const time = Math.floor(data.T / 1000);

                setCurrentPrice(price);

                // Update chart
                if (seriesRef.current) {
                    seriesRef.current.update({ time, value: price });
                }

                // Store for robots
                window.TIPR_LIVE_DATA = {
                    currentPrice: price,
                    lastUpdate: new Date().toISOString(),
                    symbol: selectedSymbol.symbol,
                    priceHistory: [...(window.TIPR_LIVE_DATA.priceHistory || []).slice(-99), price]
                };

                if (onPriceUpdate) {
                    onPriceUpdate(window.TIPR_LIVE_DATA);
                }
            } catch (e) {
                // ignore parse errors
            }
        };

        ws.onerror = () => setIsConnected(false);
        ws.onclose = () => setIsConnected(false);

        return () => ws.close();
    }, [chartReady, selectedSymbol, onPriceUpdate]);

    return (
        <div>
            {/* Symbol Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {SYMBOLS.map(sym => (
                    <button
                        key={sym.id}
                        onClick={() => setSelectedSymbol(sym)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: selectedSymbol.id === sym.id ? '2px solid #FFD700' : '1px solid rgba(255,255,255,0.2)',
                            background: selectedSymbol.id === sym.id ? 'rgba(255, 215, 0, 0.15)' : 'rgba(255,255,255,0.05)',
                            color: selectedSymbol.id === sym.id ? '#FFD700' : '#94a3b8',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                        }}
                    >
                        {sym.emoji} {sym.symbol}
                    </button>
                ))}

                {/* Connection Status */}
                <div style={{
                    marginRight: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '99px',
                    background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isConnected ? '#22c55e' : '#ef4444',
                        boxShadow: `0 0 10px ${isConnected ? '#22c55e' : '#ef4444'}`,
                    }} />
                    <span style={{ color: isConnected ? '#22c55e' : '#ef4444', fontSize: '13px' }}>
                        {isConnected ? 'متصل' : 'غير متصل'}
                    </span>
                </div>
            </div>

            {/* Price Display */}
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
                    ${currentPrice ? currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '---'}
                </span>
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                    {selectedSymbol.symbol}
                </span>
            </div>

            {/* Chart Container */}
            <div
                ref={chartContainerRef}
                style={{
                    width: '100%',
                    height: '350px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    background: '#0f172a',
                }}
            />

            {/* Robot Data Info */}
            <div style={{
                marginTop: '16px',
                padding: '12px 16px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                <span style={{ fontSize: '24px' }}>🤖</span>
                <div>
                    <div style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '14px' }}>
                        بيانات الروبوتات متاحة
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                        <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>
                            window.TIPR_LIVE_DATA
                        </code>
                    </div>
                </div>
            </div>
        </div>
    );
}
