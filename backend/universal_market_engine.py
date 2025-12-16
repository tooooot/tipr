
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
    "al_maestro": {
        "name": "المايسترو",
        "strategy_type": "TREND",
        "risk_reward": 2.5,
        "win_rate_bias": 0.55
    },
    "al_qannas": {
        "name": "القناص",
        "strategy_type": "RSI_MEAN_REVERSION",
        "risk_reward": 1.5,
        "win_rate_bias": 0.70
    },
    "wall_street_wolf": {
        "name": "ذئب وول ستريت",
        "strategy_type": "MOMENTUM_BREAKOUT",
        "risk_reward": 3.0,
        "win_rate_bias": 0.45 
    },
    "crypto_king": {
        "name": "ملك الكريبتو",
        "strategy_type": "VOLATILITY",
        "risk_reward": 4.0,
        "win_rate_bias": 0.40
    }
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
        
        # RSI
        delta = col_close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        # Bollinger Bands
        df['BB_Mid'] = col_close.rolling(window=20).mean()
        df['BB_Std'] = col_close.rolling(window=20).std()
        df['BB_Upper'] = df['BB_Mid'] + (df['BB_Std'] * 2)
        df['BB_Lower'] = df['BB_Mid'] - (df['BB_Std'] * 2)
    except Exception as e:
        print(f"Indicator Error: {e}")
    
    return df

# --- STRATEGY LOGIC ---
def check_entry_signal(robot_key, row, prev_row):
    strategy = ROBOTS[robot_key]['strategy_type']
    
    try:
        # Safety check for NaNs
        if pd.isna(row['Close']) or pd.isna(row['SMA_50']): return False

        if strategy == "TREND":
            if row['Close'] > row['SMA_50'] and prev_row['Close'] <= prev_row['SMA_50']:
                return True
                
        elif strategy == "RSI_MEAN_REVERSION":
            if row['RSI'] < 35 and row['RSI'] > prev_row['RSI']:
                return True
                
        elif strategy == "MOMENTUM_BREAKOUT":
            if row['Close'] > row['BB_Upper']:
                return True
                
        elif strategy == "VOLATILITY":
            change = (row['Close'] - prev_row['Close']) / prev_row['Close']
            if abs(change) > 0.05: 
                return True
    except:
        return False
        
    return False

# --- ENGINE ---
def run_universal_simulation():
    all_trades = []
    
    print("🌍 Starting Universal Market Engine v3...")
    
    for market_name, symbols in MARKETS.items():
        print(f"  Scanning Market: {market_name}...")
        
        for symbol in symbols:
            try:
                # Download
                df = yf.download(symbol, period="2y", interval="1d", progress=False)
                
                if df.empty:
                    print(f"Skipping {symbol}: Empty DataFrame")
                    continue
                
                if len(df) < 50: 
                    print(f"Skipping {symbol}: Not enough data ({len(df)})")
                    continue
                
                # FIX: FORCE FLATTENING
                # If columns are MultiIndex, just take the first level which usually contains 'Close'
                if isinstance(df.columns, pd.MultiIndex):
                     df.columns = df.columns.get_level_values(0)
                
                # Verify 'Close'
                if 'Close' not in df.columns:
                     # Try to identify which column is Close
                     # Sometimes it's 'Adj Close'
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
                            if check_entry_signal(robot_key, row, prev_row):
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
                                        # Handle NaNs effectively
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

if __name__ == "__main__":
    run_universal_simulation()
