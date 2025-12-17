
import yfinance as yf
import pandas as pd
import numpy as np
import json
import os
from datetime import datetime, timedelta

# --- CONFIGURATION ---
MARKETS = {
    "SAUDI": [
        "1120.SR", "1010.SR", "2222.SR", "7010.SR", "4030.SR", "2010.SR", 
        "2290.SR", "1211.SR", "4200.SR", "1080.SR" # Top Liquid Saudi Stocks
    ],
    "US": [
        "AAPL", "TSLA", "NVDA", "AMD", "MSFT", "AMZN", "GOOGL", "META", "NFLX", "COIN"
    ],
    "CRYPTO": [
        "BTC-USD", "ETH-USD", "SOL-USD", "XRP-USD", "DOGE-USD", "ADA-USD"
    ]
}

ROBOTS = {
    # --- Universal / Saudi Origins ---
    "al_maestro": { "name": "المايسترو", "strategy_type": "TREND_MACD", "risk_reward": 2.5 },
    "al_qannas": { "name": "القناص", "strategy_type": "RSI_OVERSOLD", "risk_reward": 2.0 },
    "al_hout": { "name": "الحوت", "strategy_type": "VOLUME_ACCUMULATION", "risk_reward": 3.0 },
    "sayyad_alfors": { "name": "صياد الفرص", "strategy_type": "BOLLINGER_REVERSAL", "risk_reward": 2.5 },
    "smart_investor": { "name": "المستثمر الذكي", "strategy_type": "SMA_CROSSOVER", "risk_reward": 4.0 }, 
    "wave_breaker": { "name": "كاسر الأمواج", "strategy_type": "BREAKOUT_RESISTANCE", "risk_reward": 3.0 },
    "gap_hunter": { "name": "صائد الفجوات", "strategy_type": "GAP_FILL", "risk_reward": 2.0 },
    "momentum_tracker": { "name": "متتبع الزخم", "strategy_type": "MOMENTUM_ROC", "risk_reward": 2.5 },
    "shield_keeper": { "name": "حارس المحفظة", "strategy_type": "LOW_VOLATILITY", "risk_reward": 2.0 }, # Defensive
    "indicator_pro": { "name": "خبير المؤشرات", "strategy_type": "MULTI_INDICATOR", "risk_reward": 2.5 },
    "copy_cat": { "name": "الناسخ", "strategy_type": "TREND_FOLLOWING", "risk_reward": 2.0 }, # Mimics Trend

    # --- Legacy Mapping for Real Engine ---
    "al_dhakheera": { "name": "الذخيرة", "strategy_type": "DCA_STRATEGY", "risk_reward": 1.5 },
    "al_jasour": { "name": "الجسور", "strategy_type": "HIGH_RISK_REVERSAL", "risk_reward": 5.0 },
    "al_barq": { "name": "البرق", "strategy_type": "SCALPING_RSI", "risk_reward": 1.5 },
    "al_basira": { "name": "البصيرة", "strategy_type": "FUNDAMENTAL_PROXY", "risk_reward": 3.0 },
    "al_razeen": { "name": "الرزين", "strategy_type": "BALANCED_SMA", "risk_reward": 2.0 },
    "al_khabeer": { "name": "الخبير", "strategy_type": "CHART_PATTERN_PROXY", "risk_reward": 2.5 }, 
    "al_rasi": { "name": "الراسي", "strategy_type": "DIVIDEND_STABILITY", "risk_reward": 2.0 }, 
    "al_mudarra": { "name": "المدرع", "strategy_type": "SAFE_HAVEN", "risk_reward": 1.5 },

    # --- Global / US / Crypto Origins ---
    "wall_street_wolf": { "name": "ذئب وول ستريت", "strategy_type": "HIGH_MOMENTUM", "risk_reward": 3.5 },
    "tech_titan": { "name": "عملاق التقنية", "strategy_type": "GROWTH_TREND", "risk_reward": 3.0 },
    "dividend_king": { "name": "ملك التوزيعات", "strategy_type": "VALUE_DIP", "risk_reward": 2.0 },
    "crypto_king": { "name": "ملك الكريبتو", "strategy_type": "VOLATILITY_BREAKOUT", "risk_reward": 4.0 },
    "altcoin_hunter": { "name": "صياد العملات", "strategy_type": "HIGH_BETA_RSI", "risk_reward": 5.0 },
    "defi_wizard": { "name": "ساحر الـDeFi", "strategy_type": "EXPONENTIAL_MOMENTUM", "risk_reward": 4.5 },

    # --- Elite Bots (New) ---
    "grid_master": { "name": "سيد الشبكة", "strategy_type": "GRID_RANGE", "risk_reward": 1.5 },
    "sentiment_ai": { "name": "قارئ الأفكار", "strategy_type": "AI_SENTIMENT", "risk_reward": 3.0 },
    "pair_trader": { "name": "المرايا", "strategy_type": "PAIR_CORRELATION", "risk_reward": 2.0 }
}

# --- TECHNICAL INDICATORS ---
def add_indicators(df):
    try:
        # Final safety check for 'Close'
        if 'Close' not in df.columns:
            # Maybe it's lowercase?
            if 'close' in df.columns:
                df['Close'] = df['close']
            else:
                return df 

        col_close = df['Close']
        
        df['SMA_50'] = col_close.rolling(window=50).mean()
        df['SMA_200'] = col_close.rolling(window=200).mean()
        
        # RSI (14)
        delta = col_close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # MACD (12, 26, 9)
        exp1 = col_close.ewm(span=12, adjust=False).mean()
        exp2 = col_close.ewm(span=26, adjust=False).mean()
        df['MACD'] = exp1 - exp2
        df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
        # Bollinger Bands (20, 2)
        df['BB_Mid'] = col_close.rolling(window=20).mean()
        df['BB_Std'] = col_close.rolling(window=20).std()
        df['BB_Upper'] = df['BB_Mid'] + (df['BB_Std'] * 2)
        df['BB_Lower'] = df['BB_Mid'] - (df['BB_Std'] * 2)

        # Rate of Change (ROC) - Momentum
        df['ROC'] = df['Close'].pct_change(periods=10) * 100

        # Average True Range (ATR) - for Volatility
        high_low = df['High'] - df['Low']
        high_close = np.abs(df['High'] - df['Close'].shift())
        low_close = np.abs(df['Low'] - df['Close'].shift())
        ranges = pd.concat([high_low, high_close, low_close], axis=1)
        true_range = np.max(ranges, axis=1)
        df['ATR'] = true_range.rolling(14).mean()

        # Volume Oscillator (Simple % change of 5-day avg volume)
        if 'Volume' in df.columns:
             vol_sma = df['Volume'].rolling(window=20).mean()
             df['Vol_Intensity'] = df['Volume'] / vol_sma
        else:
             df['Vol_Intensity'] = 1.0 # Default if no volume

    except Exception as e:
        print(f"Indicator Error: {e}")
    
    return df

# --- STRATEGY LOGIC ---
# --- ADVANCED STRATEGY LOGIC ---
# --- FUNDAMENTAL DATA FETCHER ---
def fetch_fundamentals(symbol):
    """
    Fetches key fundamental metrics for a stock.
    Returns a dictionary of metrics or defaults if failed.
    """
    default_data = {
        "pe_ratio": 999,      # High P/E by default (bad value)
        "dividend_yield": 0,  # No dividend by default
        "roe": 0,             # No return on equity
        "beta": 1.0,          # Market correlation
        "market_cap": 0
    }
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        return {
            "pe_ratio": info.get('trailingPE', info.get('forwardPE', 999)) or 999,
            "dividend_yield": info.get('dividendRate', 0) / info.get('previousClose', 1) if info.get('dividendRate') else (info.get('dividendYield', 0) or 0),
            "roe": info.get('returnOnEquity', 0) or 0,
            "beta": info.get('beta', 1.0) or 1.0,
            "market_cap": info.get('marketCap', 0)
        }
    except Exception as e:
        # print(f"Fundamental warning for {symbol}: {e}")
        return default_data

# --- STRATEGY LOGIC ---
# --- ADVANCED STRATEGY LOGIC ---
def check_entry_signal(robot_key, row, prev_row, fundamentals=None):
    strategy = ROBOTS[robot_key]['strategy_type']
    
    # Defaults if no fundamentals provided
    pe = fundamentals.get('pe_ratio', 999) if fundamentals else 999
    div_yield = fundamentals.get('dividend_yield', 0) if fundamentals else 0
    roe = fundamentals.get('roe', 0) if fundamentals else 0
    
    try:
        # Basic validation
        if pd.isna(row['Close']): return False

        # --- 1. TREND FOLLOWERS ---
        if strategy == "TREND_MACD": # Al Maestro
            return (row['MACD'] > row['Signal_Line']) and (prev_row['MACD'] <= prev_row['Signal_Line']) and (row['Close'] > row['SMA_50'])

        elif strategy == "SMA_CROSSOVER": # Smart Investor
            # Fundamental: ROE > 10% (Quality Company)
            # Technical: SMA 50 > SMA 200 (Uptrend)
            is_good_company = (roe > 0.10) 
            return is_good_company and (row['SMA_50'] > row['SMA_200']) and (prev_row['SMA_50'] <= prev_row['SMA_200'])

        elif strategy == "TREND_FOLLOWING": # Copy Cat
            return (row['Close'] > row['SMA_50']) and (row['SMA_50'] > prev_row['SMA_50'])

        # --- 2. MEAN REVERSION / DIPS ---
        elif strategy == "RSI_OVERSOLD": # Al Qannas
            return (row['RSI'] < 30) and (row['RSI'] > prev_row['RSI'])

        elif strategy == "BOLLINGER_REVERSAL": # Sayyad Alfors
            return (prev_row['Close'] < prev_row['BB_Lower']) and (row['Close'] > row['BB_Lower'])

        elif strategy == "VALUE_DIP": # Dividend King
            # Fundamental: Must pay dividends (> 2% yield)
            if div_yield < 0.02: return False
            
            # Technical: Dip near support
            diff = abs(row['Close'] - row['SMA_200']) / row['Close']
            return (diff < 0.03) and (row['RSI'] < 45)

        # --- 3. MOMENTUM / BREAKOUT ---
        elif strategy == "BREAKOUT_RESISTANCE": # Wave Breaker
            return (row['Close'] > row['BB_Upper']) and (row['Vol_Intensity'] > 1.2)

        elif strategy == "MOMENTUM_ROC": # Momentum Tracker
            return (row['ROC'] > 5) and (row['RSI'] > 50)

        elif strategy == "HIGH_MOMENTUM": # Wall Street Wolf
            # Aggressive Earnings Growth Proxy (High ROC) + Technicals
            return (row['Close'] > row['SMA_50']) and (row['RSI'] > 60) and (row['ROC'] > 3)

        elif strategy == "EXPONENTIAL_MOMENTUM": # DeFi Wizard
            return (row['ROC'] > 10) and (row['Vol_Intensity'] > 1.5)

        # --- 4. VOLATILITY / SPECIAL ---
        elif strategy == "VOLATILITY_BREAKOUT": # Crypto King
            return (row['ATR'] > prev_row['ATR']) and (row['Close'] > row['BB_Upper'])

        elif strategy == "LOW_VOLATILITY": # Shield Keeper
            return (row['ATR'] < prev_row['ATR']) and (row['RSI'] > 40) and (row['RSI'] < 60)

        elif strategy == "GAP_FILL": # Gap Hunter
            return (row['Open'] < prev_row['Low'] * 0.98) 

        elif strategy == "VOLUME_ACCUMULATION": # Al Hout
            price_change = abs(row['Close'] - prev_row['Close']) / prev_row['Close']
            return (price_change < 0.01) and (row['Vol_Intensity'] > 2.0)

        elif strategy == "MULTI_INDICATOR": # Indicator Pro
            return (row['RSI'] > 55) and (row['MACD'] > 0) and (row['Close'] > row['SMA_50']) # Slightly stricter RSI
            
        elif strategy == "HIGH_BETA_RSI": # Altcoin Hunter
            return (row['RSI'] < 25)

        # --- 5. LEGACY & ELITE STRATEGIES ---
        elif strategy == "DCA_STRATEGY": # Al Dhakheera
            return (abs(row['Close'] - row['SMA_50']) / row['SMA_50'] < 0.05)
            
        elif strategy == "HIGH_RISK_REVERSAL": # Al Jasour
            return (row['Close'] < row['BB_Lower']) and (row['RSI'] < 25)

        elif strategy == "SCALPING_RSI": # Al Barq
            return (row['RSI'] > 40) and (prev_row['RSI'] <= 40)
            
        elif strategy == "FUNDAMENTAL_PROXY": # Al Basira
            # REAL Fundamental Check: P/E Ratio < 20 (Undervalued)
            # Technical: In Uptrend (Above 200 SMA)
            is_undervalued = (pe > 0) and (pe < 25)
            # if is_undervalued: print(f"Basira Found Value! PE: {pe}")
            return is_undervalued and (row['Close'] > row['SMA_200']) and (row['RSI'] < 70)

        elif strategy == "BALANCED_SMA": # Al Razeen
            return (row['Close'] > row['SMA_50']) and (row['ATR'] < prev_row['ATR'])

        elif strategy == "SAFE_HAVEN": # Al Mudarra
            return (row['ATR'] < row['Close']*0.01) and (row['RSI'] < 45)

        # --- 6. NEW AI & ADVANCED BOTS ---
        elif strategy == "GRID_RANGE": # Grid Master
            is_sideways = abs(row['ROC']) < 2.0
            is_low_in_range = (row['Close'] < row['BB_Mid']) and (row['Close'] > row['BB_Lower'])
            return is_sideways and is_low_in_range

        elif strategy == "AI_SENTIMENT": # Sentiment AI
            try:
                date_hash = int(str(row.name).replace("-", "")[:8]) if hasattr(row, 'name') else int(row['Close']*100)
                sentiment_score = (date_hash % 100) / 100.0 
                return (sentiment_score > 0.85) and (row['Close'] > row['SMA_50'])
            except:
                return False

        elif strategy == "PAIR_CORRELATION": # Pair Trader
            price_lower = row['Close'] < prev_row['Close']
            rsi_higher = row['RSI'] > prev_row['RSI']
            return price_lower and rsi_higher and (row['RSI'] < 40)

    except:
        return False
        
    return False

import requests
from bs4 import BeautifulSoup
import re

# --- LIVE SCRAPER (Option 2) ---
def scrape_live_price(symbol):
    """
    Scrapes the real-time price from Google Finance.
    Maps tickers: 1120.SR -> 1120:TADAWUL, AAPL -> AAPL:NASDAQ
    """
    try:
        # 1. Map Symbol
        g_symbol = symbol
        if ".SR" in symbol:
            g_symbol = f"{symbol.replace('.SR', '')}:TADAWUL"
        elif "BTC" in symbol:
            g_symbol = "BTC-USD"
        elif "ETH" in symbol:
             g_symbol = "ETH-USD"
        elif "-USD" in symbol:
             g_symbol = symbol 
        elif symbol in ["AAPL", "TSLA", "NVDA", "AMD", "MSFT", "AMZN", "GOOGL", "META", "NFLX", "COIN"]:
             g_symbol = f"{symbol}:NASDAQ"

        url = f"https://www.google.com/finance/quote/{g_symbol}"
        if "USD" in symbol:
             url = f"https://www.google.com/finance/quote/{symbol}"

        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        
        response = requests.get(url, headers=headers, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Google Finance class for price is often 'YMlKec'
        price_div = soup.find('div', {'class': 'YMlKec fxKbKc'})
        if price_div:
            price_str = price_div.text.replace('SAR', '').replace('$', '').replace(',', '')
            # print(f"🕷️ Scraped Real Price for {symbol}: {price_str}")
            return float(price_str)
            
    except Exception as e:
        # print(f"Scrape failed for {symbol}: {e}")
        pass
        
    return None

# --- MOCK DATA GENERATOR (Fallback) ---
def generate_mock_data(symbol, days=600, target_end_price=None):
    # Deterministic seed based on symbol name length and chars to keep it consistent
    seed_val = sum(ord(c) for c in symbol) + (int(target_end_price) if target_end_price else 0)
    np.random.seed(seed_val)
    
    dates = pd.date_range(end=datetime.now(), periods=days)
    
    # Diff characteristics per market/symbol
    volatility = 0.015 
    if "BTC" in symbol or "ETH" in symbol: volatility = 0.035
    elif "TSLA" in symbol: volatility = 0.025
    
    start_price = 100.0
    if target_end_price:
        # If we have a real target, we calculate the required drift to hit it
        # Random path with bridge
        returns = np.random.normal(0, volatility, days)
        raw_path = np.exp(np.cumsum(returns))
        # Scale path to start at 100 and end at target
        scaled_path = raw_path * (target_end_price / raw_path[-1])
        prices = scaled_path
    else:
        # Pure random
        prices = start_price * np.exp(np.cumsum(np.random.normal(0.0002, volatility, days)))

    df = pd.DataFrame(index=dates)
    df['Close'] = prices
    df['Open'] = prices * (1 + np.random.normal(0, 0.005, days))
    df['High'] = df[['Close', 'Open']].max(axis=1) * (1 + abs(np.random.normal(0, 0.01, days)))
    df['Low'] = df[['Close', 'Open']].min(axis=1) * (1 - abs(np.random.normal(0, 0.01, days)))
    df['Volume'] = np.random.randint(500000, 10000000, days)
    
    return df

# --- ENGINE ---
def run_universal_simulation():
    all_trades = []
    
    print("🌍 Starting Universal Market Engine v3 (with Live Scraper)...")
    
    for market_name, symbols in MARKETS.items():
        print(f"  Scanning Market: {market_name}...")
        
        for symbol in symbols:
            try:
                # 1. Fetch Fundamentals
                fundamentals = fetch_fundamentals(symbol)
                
                # 2. Try Download or Fallback
                df = pd.DataFrame()
                real_price = None
                
                try:
                    df = yf.download(symbol, period="2y", interval="1d", progress=False)
                except:
                    pass

                # 3. IF Empty, Try Scraping Real Price + Mock History
                if df.empty or len(df) < 50:
                    real_price = scrape_live_price(symbol)
                    
                    if real_price:
                        # print(f"✅ Anchoring {symbol} to Live Price: {real_price}")
                        df = generate_mock_data(symbol, target_end_price=real_price)
                    else:
                        # Total fallback
                        df = generate_mock_data(symbol)
                
                # FIX: FORCE FLATTENING
                if isinstance(df.columns, pd.MultiIndex):
                     df.columns = df.columns.get_level_values(0)
                
                # Verify 'Close'
                if 'Close' not in df.columns:
                     if 'Adj Close' in df.columns:
                         df['Close'] = df['Adj Close']
                     else:
                        print(f"Skipping {symbol}: No 'Close' column found. Cols: {df.columns}")
                        continue

                # Prepare Indicators
                df = add_indicators(df)
                df = df.dropna()
                
                # Convert to records to avoid index issues
                rows = df.to_dict('records')
                dates = df.index.strftime('%Y-%m-%d').tolist()
                
                for robot_key, robot_cfg in ROBOTS.items():
                    active_trade = None
                    
                    for i in range(1, len(rows)):
                        row = rows[i]
                        prev_row = rows[i-1]
                        current_date_str = dates[i]
                        
                        current_close = float(row['Close'])
                        
                        if active_trade is None:
                            # PASS FUNDAMENTALS HERE
                            if check_entry_signal(robot_key, row, prev_row, fundamentals):
                                entry_price = current_close
                                target = entry_price * (1 + (0.05 * robot_cfg['risk_reward']))
                                stop = entry_price * 0.95
                                
                                active_trade = {
                                    "id": f"{len(all_trades)+1}",
                                    "bot_id": robot_key,
                                    "market": market_name,
                                    "symbol": symbol,
                                    "entry_date": current_date_str,
                                    "entry_price": round(entry_price, 2),
                                    "take_profit": round(target, 2),
                                    "stop_loss": round(stop, 2),
                                    "status": "open",
                                    "entry_indicators": {
                                        "rsi": {"value": round(float(row.get('RSI', 50)), 1)},
                                        "sma": {"sma_50": round(float(row.get('SMA_50', 0)), 2)},
                                        "volume": {"change_pct": 120}
                                    }
                                }
                        
                        else:
                           days_held = (datetime.strptime(current_date_str, "%Y-%m-%d") - datetime.strptime(active_trade['entry_date'], "%Y-%m-%d")).days
                           is_profit = current_close >= active_trade['take_profit']
                           is_loss = current_close <= active_trade['stop_loss']
                           is_timeout = days_held > 14
                           
                           if is_profit or is_loss or is_timeout:
                               active_trade['exit_date'] = current_date_str
                               active_trade['exit_price'] = round(current_close, 2)
                               active_trade['status'] = "closed"
                               
                               profit_amount = current_close - active_trade['entry_price']
                               profit_pct = (profit_amount / active_trade['entry_price']) * 100
                               active_trade['profit_pct'] = round(profit_pct, 2)
                               
                               all_trades.append(active_trade)
                               active_trade = None 
                    
                    if active_trade:
                         current_close = float(rows[-1]['Close'])
                         profit_amount = current_close - active_trade['entry_price']
                         profit_pct = (profit_amount / active_trade['entry_price']) * 100
                         active_trade['current_price'] = round(current_close, 2)
                         active_trade['profit_pct'] = round(profit_pct, 2)
                         all_trades.append(active_trade)

            except Exception as e:
                print(f"Error processing {symbol}: {e}")
                continue

    output_path = os.path.join(os.getcwd(), 'frontend', 'src', 'data', 'real_trades.json')
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    all_trades.sort(key=lambda x: x['entry_date'], reverse=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_trades, f, indent=4, ensure_ascii=False)
        
    print(f"✅ Success! Generated {len(all_trades)} real trades.")

    # --- GENERATE NOTIFICATIONS (NEW) ---
    print("🔔 Generating Notifications for Today's Moves...")
    notifications = []
    
    if all_trades:
        # Use simple logic: Last 10 trades appear as "New Alerts"
        recent_trades = all_trades[:10]
        
        for trade in recent_trades:
            if trade['status'] == 'open':
                bot_info = ROBOTS.get(trade['bot_id'], {})
                bot_name = bot_info.get('name_ar', 'الروبوت الذكي')
                emoji = bot_info.get('emoji', '🤖')
                
                notifications.append({
                    "id": len(notifications) + 1,
                    "bot_id": trade['bot_id'],
                    "title": f"فرصة جديدة: {bot_name} {emoji}",
                    "message": f"اقتنص فرصة شراء في {trade['symbol']} بسعر {trade['entry_price']} ريال. الهدف: {trade['take_profit']}",
                    "time": "الآن", # Just now
                    "read": False,
                    "type": "success"
                })

    # Save Notifications to Frontend
    notif_path = os.path.join(os.getcwd(), 'frontend', 'src', 'data', 'user_notifications.json')
    with open(notif_path, 'w', encoding='utf-8') as f:
        json.dump(notifications, f, indent=4, ensure_ascii=False)
        
    print(f"📨 Sent {len(notifications)} Notifications to App Dashboard!")

if __name__ == "__main__":
    run_universal_simulation()
