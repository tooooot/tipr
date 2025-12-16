
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import { getBotData, getSimulation } from '../utils/storage';
import { styles, btnGold } from '../styles/theme';
import BottomNav from '../components/BottomNav';

export default function PortfolioPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('saudi'); // saudi, us, crypto
    const [bots, setBots] = useState([]);

    // محاكاة لأرصدة المحافظ (رصيد ابتدائي 100 ألف لكل سوق)
    const [wallets, setWallets] = useState({
        saudi: { balance: 100000, currency: 'SAR', label: 'الأسهم السعودية', flag: '🇸🇦' },
        us: { balance: 100000, currency: 'USD', label: 'السوق الأمريكي', flag: '🇺🇸' },
        crypto: { balance: 100000, currency: 'USDT', label: 'العملات الرقمية', flag: '🪙' }
    });

    const [copiedBots, setCopiedBots] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('copied_bots')) || [];
        } catch { return []; }
    });

    useEffect(() => {
        // Fetch valid bot list
        fetchAPI('/api/bots').then(r => {
            if (r?.data && r.data.length > 0) {
                // Assuming logic to link copied bots to real data would happen here
                // For now, we trust storage
            }
        });
    }, []);

    // Helper: Determine Bot's Market
    const getBotMarket = (botId) => {
        if (['al_maestro', 'al_qannas', 'al_hout', 'sayyad_alfors'].includes(botId)) return 'saudi';
        if (['wall_street_wolf', 'tech_titan', 'dividend_king'].includes(botId)) return 'us';
        if (['crypto_king', 'altcoin_hunter', 'defi_wizard'].includes(botId)) return 'crypto';
        return 'saudi'; // Default
    };

    // Calculate Dynamic Equity:
    // Base 100k + Profit from active bots (Simplified simulation)
    const calculateMarketEquity = (marketKey) => {
        // Find bots in this market
        const marketBots = copiedBots.filter(id => getBotMarket(id) === marketKey);
        let totalProfit = 0;

        marketBots.forEach(botId => {
            const data = getBotData(botId);
            if (data?.total_profit_pct) {
                // Assume allocated 20% of capital per bot
                const allocation = 20000;
                totalProfit += allocation * (data.total_profit_pct / 100);
            }
        });

        return wallets[marketKey].balance + totalProfit;
    };

    // Total Net Worth Calculator (Converted to SAR for display)
    const EXCHANGE_RATE = { usd: 3.75, usdt: 3.75 };
    const currentSaudiEquity = calculateMarketEquity('saudi');
    const currentUsEquity = calculateMarketEquity('us');
    const currentCryptoEquity = calculateMarketEquity('crypto');

    const totalNetWorthSAR =
        currentSaudiEquity +
        (currentUsEquity * EXCHANGE_RATE.usd) +
        (currentCryptoEquity * EXCHANGE_RATE.usdt);

    // Phantom-like Number Style
    const numberStyle = {
        fontFamily: "'Inter', 'Roboto', sans-serif", // Clean western font
        fontWeight: '700',
        letterSpacing: '-1px'
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>

                    {/* Import Inter Font for Numbers */}
                    <style>{`
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                    `}</style>

                    {/* Header: Net Worth (Phantom Style) */}
                    <div style={{ textAlign: 'center', margin: '30px 0 40px 0' }}>
                        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>صافي الأصول المقدر</p>
                        <h1 style={{
                            color: 'white',
                            fontSize: '48px',
                            margin: 0,
                            ...numberStyle
                        }}>
                            {totalNetWorthSAR.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                            <span style={{ fontSize: '20px', color: '#94a3b8', marginLeft: '8px', fontWeight: '400' }}>SAR</span>
                        </h1>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 12px', borderRadius: '20px', marginTop: '12px' }}>
                            <span style={{ fontSize: '12px' }}>🚀</span>
                            <span style={{ color: styles.green, ...numberStyle }}>+4.2%</span>
                        </div>
                    </div>

                    {/* Market Tabs (Wallets) */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#1e293b', padding: '4px', borderRadius: '16px' }}>
                        {Object.entries(wallets).map(([key, wallet]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                style={{
                                    flex: 1,
                                    padding: '12px 8px',
                                    background: activeTab === key ? styles.gold : 'transparent',
                                    color: activeTab === key ? '#0f172a' : styles.gray,
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontFamily: 'Cairo, sans-serif'
                                }}
                            >
                                <span style={{ display: 'block', fontSize: '20px', marginBottom: '4px' }}>{wallet.flag}</span>
                                {wallet.label}
                            </button>
                        ))}
                    </div>

                    {/* Active Wallet Card (Phantom Style) */}
                    <div style={{
                        borderRadius: '24px',
                        padding: '24px',
                        background: activeTab === 'saudi' ? 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' :
                            activeTab === 'us' ? 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' :
                                'linear-gradient(135deg, #78350f 0%, #451a03 100%)',
                        marginBottom: '32px',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '8px', fontFamily: 'Cairo, sans-serif' }}>الرصيد المتاح</p>
                                    <p style={{
                                        color: 'white',
                                        fontSize: '36px',
                                        lineHeight: '1',
                                        ...numberStyle
                                    }}>
                                        {activeTab === 'saudi' ? currentSaudiEquity.toLocaleString('en-US') :
                                            activeTab === 'us' ? currentUsEquity.toLocaleString('en-US') :
                                                currentCryptoEquity.toLocaleString('en-US')}
                                        <span style={{ fontSize: '16px', marginLeft: '6px', opacity: 0.7 }}>{wallets[activeTab].currency}</span>
                                    </p>
                                </div>
                                <button style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: 'white',
                                    width: '44px', height: '44px',
                                    borderRadius: '50%',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>+</button>
                            </div>
                        </div>
                    </div>

                    {/* Active Bots in this Wallet */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ fontSize: '16px', color: 'white' }}>🤖 الروبوتات النشطة</h3>
                        <button onClick={() => navigate('/bots')} style={{ background: 'none', border: 'none', color: styles.gold, fontSize: '12px', cursor: 'pointer' }}>
                            + إضافة روبوت
                        </button>
                    </div>

                    {copiedBots.filter(id => getBotMarket(id) === activeTab).length === 0 ? (
                        <div style={{
                            border: '2px dashed #334155',
                            borderRadius: '12px',
                            padding: '30px',
                            textAlign: 'center',
                            color: styles.gray
                        }}>
                            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🔌</p>
                            <p>لا توجد روبوتات تعمل في هذه المحفظة</p>
                            <button
                                onClick={() => navigate('/bots')}
                                style={{
                                    marginTop: '12px',
                                    background: '#334155',
                                    color: 'white',
                                    border: 'none',
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                تصفح روبوتات {wallets[activeTab].label}
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {copiedBots
                                .filter(id => getBotMarket(id) === activeTab)
                                .map(botId => {
                                    const bot = bots.find(b => b.id === botId);
                                    const data = getBotData(botId);
                                    if (!bot) return null; // Loading or error

                                    return (
                                        <div key={botId} style={{ ...styles.card, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '48px', height: '48px',
                                                background: '#334155', borderRadius: '12px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '24px'
                                            }}>
                                                {bot.emoji || '🤖'}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ fontWeight: 'bold' }}>{bot.name_ar || botId}</p>
                                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                    <span style={{ fontSize: '10px', color: styles.green, background: 'rgba(34,197,94,0.1)', padding: '2px 6px', borderRadius: '4px' }}>نشط ✅</span>
                                                    <span style={{ fontSize: '10px', color: styles.gray }}>مخصص: 10,000</span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'left' }}>
                                                <p style={{ fontWeight: 'bold', color: data?.total_profit_pct >= 0 ? styles.green : styles.red }}>
                                                    {data?.total_profit_pct || 0}%
                                                </p>
                                                <p style={{ fontSize: '10px', color: styles.gray }}>الأرباح</p>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
