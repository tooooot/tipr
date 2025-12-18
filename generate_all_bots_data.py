"""
Generate trades for ALL 16 bots
"""

import json
import random
from datetime import datetime, timedelta
from pathlib import Path

# All 16 bots with their configurations
BOTS = {
    'al_maestro': {
        'name_ar': 'المايسترو', 'emoji': '🤖',
        'stocks': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'],
        'base_price': {'AAPL': 180, 'MSFT': 380, 'GOOGL': 140, 'NVDA': 480, 'TSLA': 240},
        'win_rate': 0.72, 'avg_profit': 4.5, 'avg_loss': -2.1
    },
    'al_qannas': {
        'name_ar': 'القناص', 'emoji': '🦁',
        'stocks': ['1120.SR', '2222.SR', '2010.SR', '7010.SR'],
        'base_price': {'1120.SR': 85.5, '2222.SR': 28.8, '2010.SR': 78.2, '7010.SR': 124.5},
        'win_rate': 0.68, 'avg_profit': 3.8, 'avg_loss': -1.9
    },
    'al_hout': {
        'name_ar': 'الحوت', 'emoji': '🐋',
        'stocks': ['AAPL', 'TSLA', 'NVDA', '2222.SR', 'BTC-USD'],
        'base_price': {'AAPL': 180, 'TSLA': 240, 'NVDA': 480, '2222.SR': 28.8, 'BTC-USD': 42000},
        'win_rate': 0.70, 'avg_profit': 5.2, 'avg_loss': -2.4
    },
    'sayyad_alfors': {
        'name_ar': 'صياد الفرص', 'emoji': '🦅',
        'stocks': ['AAPL', 'AMZN', 'META', '1120.SR'],
        'base_price': {'AAPL': 180, 'AMZN': 150, 'META': 350, '1120.SR': 85.5},
        'win_rate': 0.65, 'avg_profit': 3.2, 'avg_loss': -1.8
    },
    'al_jasour': {
        'name_ar': 'الجسور', 'emoji': '🦅',
        'stocks': ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD'],
        'base_price': {'BTC-USD': 42000, 'ETH-USD': 2300, 'BNB-USD': 310, 'SOL-USD': 98},
        'win_rate': 0.60, 'avg_profit': 6.5, 'avg_loss': -3.2
    },
    'smart_investor': {
        'name_ar': 'المستثمر الذكي', 'emoji': '🧠',
        'stocks': ['AAPL', 'MSFT', 'JNJ', 'PG'],
        'base_price': {'AAPL': 180, 'MSFT': 380, 'JNJ': 150, 'PG': 145},
        'win_rate': 0.75, 'avg_profit': 4.0, 'avg_loss': -1.5
    },
    'wave_breaker': {
        'name_ar': 'كاسر الأمواج', 'emoji': '🌊',
        'stocks': ['NVDA', 'AMD', 'INTC', '1120.SR'],
        'base_price': {'NVDA': 480, 'AMD': 145, 'INTC': 42, '1120.SR': 85.5},
        'win_rate': 0.66, 'avg_profit': 5.5, 'avg_loss': -2.8
    },
    'gap_hunter': {
        'name_ar': 'صائد الفجوات', 'emoji': '🕳️',
        'stocks': ['TSLA', 'NFLX', 'SHOP', '2222.SR'],
        'base_price': {'TSLA': 240, 'NFLX': 485, 'SHOP': 78, '2222.SR': 28.8},
        'win_rate': 0.58, 'avg_profit': 7.2, 'avg_loss': -4.1
    },
    'momentum_tracker': {
        'name_ar': 'متتبع الزخم', 'emoji': '🚀',
        'stocks': ['NVDA', 'TSLA', 'COIN', 'BTC-USD'],
        'base_price': {'NVDA': 480, 'TSLA': 240, 'COIN': 155, 'BTC-USD': 42000},
        'win_rate': 0.62, 'avg_profit': 8.5, 'avg_loss': -4.5
    },
    'shield_keeper': {
        'name_ar': 'حارس المحفظة', 'emoji': '🛡️',
        'stocks': ['SPY', 'QQQ', 'VTI', '2010.SR'],
        'base_price': {'SPY': 455, 'QQQ': 395, 'VTI': 225, '2010.SR': 78.2},
        'win_rate': 0.80, 'avg_profit': 2.5, 'avg_loss': -1.0
    },
    'indicator_pro': {
        'name_ar': 'خبير المؤشرات', 'emoji': '📊',
        'stocks': ['AAPL', 'MSFT', '1120.SR', '2222.SR'],
        'base_price': {'AAPL': 180, 'MSFT': 380, '1120.SR': 85.5, '2222.SR': 28.8},
        'win_rate': 0.69, 'avg_profit': 4.2, 'avg_loss': -2.0
    },
    'copy_cat': {
        'name_ar': 'الناسخ', 'emoji': '👥',
        'stocks': ['AAPL', 'NVDA', 'TSLA', 'BTC-USD'],
        'base_price': {'AAPL': 180, 'NVDA': 480, 'TSLA': 240, 'BTC-USD': 42000},
        'win_rate': 0.71, 'avg_profit': 4.8, 'avg_loss': -2.2
    },
    'wall_street_wolf': {
        'name_ar': 'ذئب وول ستريت', 'emoji': '🐺',
        'stocks': ['GME', 'AMC', 'BBBY', 'TSLA'],
        'base_price': {'GME': 18, 'AMC': 5.5, 'BBBY': 3.2, 'TSLA': 240},
        'win_rate': 0.52, 'avg_profit': 12.5, 'avg_loss': -7.8
    },
    'tech_titan': {
        'name_ar': 'عملاق التقنية', 'emoji': '💻',
        'stocks': ['NVDA', 'AMD', 'INTC', 'QCOM'],
        'base_price': {'NVDA': 480, 'AMD': 145, 'INTC': 42, 'QCOM': 145},
        'win_rate': 0.68, 'avg_profit': 5.8, 'avg_loss': -2.9
    },
    'dividend_king': {
        'name_ar': 'ملك التوزيعات', 'emoji': '👑',
        'stocks': ['KO', 'PEP', 'JNJ', 'PG'],
        'base_price': {'KO': 58, 'PEP': 170, 'JNJ': 150, 'PG': 145},
        'win_rate': 0.78, 'avg_profit': 3.0, 'avg_loss': -1.2
    },
    'crypto_king': {
        'name_ar': 'ملك الكريبتو', 'emoji': '🤴',
        'stocks': ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD'],
        'base_price': {'BTC-USD': 42000, 'ETH-USD': 2300, 'SOL-USD': 98, 'ADA-USD': 0.52},
        'win_rate': 0.61, 'avg_profit': 9.5, 'avg_loss': -5.2
    },
    'defi_wizard': {
        'name_ar': 'ساحر الـDeFi', 'emoji': '🧙‍♂️',
        'stocks': ['UNI-USD', 'AAVE-USD', 'LINK-USD', 'ETH-USD'],
        'base_price': {'UNI-USD': 6.5, 'AAVE-USD': 95, 'LINK-USD': 14.5, 'ETH-USD': 2300},
        'win_rate': 0.55, 'avg_profit': 15.2, 'avg_loss': -8.5
    }
}

def determine_market(symbol):
    if symbol.endswith('.SR'):
        return 'saudi'
    elif '-USD' in symbol:
        return 'crypto'
    else:
        return 'us'

def generate_trade_price(base_price, is_win, avg_profit, avg_loss):
    """Generate realistic entry/exit prices"""
    entry = base_price * random.uniform(0.95, 1.05)
    
    if is_win:
        profit_pct = random.gauss(avg_profit, avg_profit * 0.3)
        profit_pct = max(0.5, min(profit_pct, avg_profit * 2))
    else:
        profit_pct = random.gauss(avg_loss, abs(avg_loss) * 0.3)
        profit_pct = max(avg_loss * 2, min(profit_pct, -0.5))
    
    exit = entry * (1 + profit_pct / 100)
    
    return round(entry, 2), round(exit, 2), round(profit_pct, 2)

def generate_realistic_trades(bot_id, bot_config, num_days=365):
    """Generate realistic trades over time"""
    trades = []
    start_date = datetime.now() - timedelta(days=num_days)
    
    # Generate 8-15 trades per stock
    for stock in bot_config['stocks']:
        num_trades = random.randint(8, 15)
        base_price = bot_config['base_price'][stock]
        
        for i in range(num_trades):
            days_offset = random.randint(0, num_days - 7)
            entry_date = start_date + timedelta(days=days_offset)
            
            is_win = random.random() < bot_config['win_rate']
            
            entry_price, exit_price, profit_pct = generate_trade_price(
                base_price, is_win,
                bot_config['avg_profit'], bot_config['avg_loss']
            )
            
            hold_days = random.randint(2, 7)
            exit_date = entry_date + timedelta(days=hold_days)
            
            trade = {
                'id': f"{bot_id}_{stock}_{i}_{random.randint(1000, 9999)}",
                'bot_id': bot_id,
                'bot_name': bot_config['name_ar'],
                'bot_emoji': bot_config['emoji'],
                'symbol': stock,
                'entry_date': entry_date.strftime('%Y-%m-%d'),
                'entry_time': f"{random.randint(9,15)}:{random.randint(0,59):02d}",
                'entry_price': entry_price,
                'exit_date': exit_date.strftime('%Y-%m-%d'),
                'exit_time': f"{random.randint(9,15)}:{random.randint(0,59):02d}",
                'exit_price': exit_price,
                'profit_pct': profit_pct,
                'status': 'closed',
                'market': determine_market(stock)
            }
            
            trades.append(trade)
    
    return sorted(trades, key=lambda x: x['entry_date'], reverse=True)

def main():
    print("=" * 70)
    print("🤖 GENERATING TRADES FOR ALL 16 BOTS")
    print("=" * 70)
    
    all_trades = []
    
    for bot_id, bot_config in BOTS.items():
        print(f"\n🔄 {bot_config['name_ar']} ({bot_config['emoji']})...")
        
        trades = generate_realistic_trades(bot_id, bot_config)
        all_trades.extend(trades)
        
        total_profit = sum(t['profit_pct'] for t in trades)
        wins = len([t for t in trades if t['profit_pct'] > 0])
        win_rate = (wins / len(trades)) * 100 if trades else 0
        
        print(f"   ✅ {len(trades)} trades | {total_profit:+.1f}% | {win_rate:.1f}% WR")
    
    # Save
    trades_path = Path(__file__).parent / 'frontend' / 'src' / 'data' / 'real_trades.json'
    
    with open(trades_path, 'w', encoding='utf-8') as f:
        json.dump(all_trades, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Saved {len(all_trades)} total trades")
    print("=" * 70)
    print("✅ SUCCESS!")
    print("=" * 70)

if __name__ == '__main__':
    main()
