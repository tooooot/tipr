
import React, { useState, useEffect } from 'react';
import { styles } from '../styles/theme';
import BottomNav from '../components/BottomNav';
import { fetchAPI } from '../api/api';

// --- Enhanced Data Generator (For Demo Purposes) ---
// This acts as a placeholder for the real AI backend
const REAL_SOURCES = {
    'الراجحي': 'https://twitter.com/search?q=%23الراجحي&src=typed_query&f=live',
    'أرامكو': 'https://twitter.com/search?q=%23أرامكو&src=typed_query&f=live',
    'تاسي': 'https://twitter.com/search?q=%23تاسي&src=typed_query&f=live',
    'BTC': 'https://twitter.com/search?q=%24BTC&src=typed_query&f=live'
};

const GENERATE_TRENDS = () => [
    { hashtag: '#الراجحي', tweets: '54K', sentiment: 85, sentiment_label: 'تفاؤل كبير 🚀', volume_label: '🔥 ترند أول', url: REAL_SOURCES['الراجحي'] },
    { hashtag: '#أرامكو', tweets: '32K', sentiment: 92, sentiment_label: 'احتفال بالأرباح 💰', volume_label: '↗️ صاعد', url: REAL_SOURCES['أرامكو'] },
    { hashtag: '#تاسي', tweets: '12K', sentiment: 45, sentiment_label: 'حذر وترقب 😐', volume_label: '➡️ ثابت', url: REAL_SOURCES['تاسي'] },
    { hashtag: '#سبكيم', tweets: '8K', sentiment: 20, sentiment_label: 'غضب المساهمين 😡', volume_label: '↘️ هابط', url: null },
];

const GENERATE_STOCK_ANALYSIS = () => [
    { symbol: '1120', name: 'الراجحي', news_count: 45, positive: 35, negative: 5, neutral: 5, score: 80, momentum: 'high' },
    { symbol: '2222', name: 'أرامكو', news_count: 38, positive: 38, negative: 0, neutral: 0, score: 100, momentum: 'high' },
    { symbol: '2010', name: 'سابك', news_count: 22, positive: 5, negative: 15, neutral: 2, score: 30, momentum: 'low' },
    { symbol: '7010', name: 'STC', news_count: 18, positive: 10, negative: 2, neutral: 6, score: 65, momentum: 'med' },
];

const MOCK_NEWS_FEED = [
    { title: 'مجلس إدارة الراجحي يوصي بزيادة رأس المال', source: 'تداول', sentiment: 'positive', time: 'منذ 15 دقيقة', symbol: '1120', twitter_sentiment: 88, link: 'https://www.saudiexchange.sa/' },
    { title: 'أرباح أرامكو تقفز 15% بدعم من أسعار النفط', source: 'أرقام', sentiment: 'positive', time: 'منذ ساعة', symbol: '2222', twitter_sentiment: 95, link: 'https://www.argaam.com/' },
    { title: 'سابك تعلن عن صيانة دورية لمصانعها', source: 'رويترز', sentiment: 'neutral', time: 'منذ ساعتين', symbol: '2010', twitter_sentiment: 40, link: 'https://www.reuters.com/' },
    { title: 'تحليل فني: المؤشر العام يستهدف 12,500 نقطة', source: 'الرياض', sentiment: 'positive', time: 'منذ 3 ساعات', symbol: 'TASI', twitter_sentiment: 70, link: 'https://www.alriyadh.com/' },
];

export default function NewsPage() {
    const [activeTab, setActiveTab] = useState('feed'); // feed, analysis, trends
    const [news, setNews] = useState(MOCK_NEWS_FEED);
    const [trends, setTrends] = useState(GENERATE_TRENDS());
    const [stocks, setStocks] = useState(GENERATE_STOCK_ANALYSIS());
    const [loading, setLoading] = useState(false);

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.page}>
                    {/* Header */}
                    <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ color: styles.gold, fontSize: '28px', margin: 0 }}>🧠 المحلل الذكي</h1>
                            <p style={{ color: styles.gray, fontSize: '13px', marginTop: '4px' }}>
                                تحليل الأخبار، نبض الشارع، وزخم السوق
                            </p>
                        </div>
                        {/* Live Indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444' }}></span>
                            <span style={{ fontSize: '12px', color: 'white', fontWeight: 'bold' }}>مباشر</span>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display: 'flex', background: '#1e293b', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
                        {[
                            { id: 'feed', label: '📰 شريط الأخبار' },
                            { id: 'analysis', label: '📊 تحليل الأسهم' },
                            { id: 'trends', label: '🐦 ترند تويتر' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: activeTab === tab.id ? styles.gold : 'transparent',
                                    color: activeTab === tab.id ? '#0f172a' : '#94a3b8',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', marginTop: '60px', color: styles.gray }}>⏳ جاري تحليل السوق...</div>
                    ) : (
                        <>
                            {/* 1. News Feed Tab */}
                            {activeTab === 'feed' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {news.map((item, i) => (
                                        <div key={i} style={{ ...styles.card, padding: '20px', position: 'relative', borderRight: item.sentiment === 'positive' ? '5px solid #22c55e' : item.sentiment === 'negative' ? '5px solid #ef4444' : '5px solid #94a3b8' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <span style={{ fontSize: '11px', background: '#334155', color: '#fff', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold' }}>{item.source}</span>
                                                <span style={{ fontSize: '11px', color: styles.gray }}>{item.time}</span>
                                            </div>

                                            <h3 style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px', color: 'white' }}>{item.title}</h3>

                                            {/* Analysis Chips */}
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    background: item.sentiment === 'positive' ? 'rgba(34,197,94,0.1)' : item.sentiment === 'negative' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
                                                    color: item.sentiment === 'positive' ? '#22c55e' : item.sentiment === 'negative' ? '#ef4444' : '#94a3b8',
                                                    padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold'
                                                }}>
                                                    {item.sentiment === 'positive' ? 'ذكاء اصطناعي: إيجابي 📈' : item.sentiment === 'negative' ? 'ذكاء اصطناعي: سلبي 📉' : 'محايد ⚖️'}
                                                </span>

                                                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold' }}>
                                                    🐦 عاطفة تويتر: {item.twitter_sentiment}%
                                                </span>

                                                <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: '11px', color: styles.gold, textDecoration: 'none', borderBottom: `1px solid ${styles.gold}` }}>
                                                    تحقق من المصدر ↗️
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 2. Stock Analysis Tab */}
                            {activeTab === 'analysis' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {stocks.map((stock, i) => (
                                        <div key={i} style={{ ...styles.card, padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                    <div style={{ width: '48px', height: '48px', background: '#334155', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>{stock.symbol}</div>
                                                    <div>
                                                        <p style={{ fontWeight: 'bold', fontSize: '16px' }}>{stock.name}</p>
                                                        <p style={{ fontSize: '12px', color: styles.gray }}>تم تحليل {stock.news_count} خبر ومقال</p>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: stock.score > 60 ? '#22c55e' : stock.score < 40 ? '#ef4444' : '#fbbf24' }}>
                                                        {stock.score}%
                                                    </span>
                                                    <p style={{ fontSize: '11px', color: styles.gray }}>مؤشر التفاؤل</p>
                                                </div>
                                            </div>

                                            {/* Bar Chart Visualization */}
                                            <div style={{ marginBottom: '8px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', marginBottom: '4px' }}>
                                                    <span>توزيع الآراء:</span>
                                                </div>
                                                <div style={{ height: '12px', width: '100%', background: '#334155', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                                                    <div style={{ width: `${(stock.positive / stock.news_count) * 100}%`, background: '#22c55e' }} title="إيجابي"></div>
                                                    <div style={{ width: `${(stock.neutral / stock.news_count) * 100}%`, background: '#94a3b8' }} title="محايد"></div>
                                                    <div style={{ width: `${(stock.negative / stock.news_count) * 100}%`, background: '#ef4444' }} title="سلبي"></div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ fontSize: '11px', color: '#22c55e' }}>● {stock.positive} إيجابي</span>
                                                <span style={{ fontSize: '11px', color: '#ef4444' }}>● {stock.negative} سلبي</span>
                                                <a href={`https://www.google.com/search?q=${stock.name}+أخبار`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', fontSize: '11px', color: styles.gold, textDecoration: 'none' }}>
                                                    🔍 بحث في جوجل
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 3. Twitter Trends Tab */}
                            {activeTab === 'trends' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {trends.map((trend, i) => (
                                        <div key={i} style={{ ...styles.card, padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <span style={{ fontSize: '32px', color: '#38bdf8' }}>#</span>
                                                <div>
                                                    <p style={{ fontWeight: 'bold', fontSize: '18px', color: 'white' }}>{trend.hashtag}</p>
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{trend.tweets} تغريدة</span>
                                                        <span style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{trend.volume_label}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                <span style={{
                                                    background: trend.sentiment > 70 ? 'rgba(34,197,94,0.1)' : trend.sentiment < 40 ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                                                    color: trend.sentiment > 70 ? '#22c55e' : trend.sentiment < 40 ? '#ef4444' : '#fbbf24',
                                                    padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px'
                                                }}>
                                                    {trend.sentiment_label}
                                                </span>

                                                {trend.url && (
                                                    <a href={trend.url} target="_blank" rel="noopener noreferrer" style={{
                                                        background: '#1da1f2', color: 'white',
                                                        padding: '6px 12px', borderRadius: '20px',
                                                        fontSize: '11px', fontWeight: 'bold', textDecoration: 'none',
                                                        display: 'flex', alignItems: 'center', gap: '4px'
                                                    }}>
                                                        شاهد في تويتر ↗️
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ padding: '20px', background: 'rgba(56,189,248,0.1)', borderRadius: '12px', marginTop: '16px' }}>
                                        <p style={{ color: '#38bdf8', fontSize: '12px', lineHeight: '1.6', textAlign: 'center' }}>
                                            🤖 <strong>خوارزمية الزخم:</strong> تقوم بتحليل آلاف التغريدات لحظياً لتحديد "العاطفة السائدة" (تفاؤل، غضب، قلق) تجاه كل هاشتاق.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <BottomNav />
            </div>
        </div>
    );
}
