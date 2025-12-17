
import json
import os
from datetime import datetime
import pandas as pd

# Load Trades
base_path = os.path.dirname(os.path.abspath(__file__))
trades_path = os.path.join(base_path, '../frontend/src/data/real_trades.json')
output_path = os.path.join(base_path, '../frontend/src/data/history_events.json')

with open(trades_path, 'r', encoding='utf-8') as f:
    trades_data = json.load(f)

# Convert to DataFrame
df = pd.DataFrame(trades_data)
df['entry_date'] = pd.to_datetime(df['entry_date'])
df['exit_date'] = pd.to_datetime(df['exit_date'], errors='coerce')
df['month_year'] = df['entry_date'].dt.to_period('M')

# 1. GENERATE WEEKLY AWARDS
# Group by Year-Week
df['week_year'] = df['entry_date'].dt.strftime('%Y-%U') 

weekly_awards = []
periods = df['week_year'].unique()
periods = sorted(periods)

for p in periods:
    # Filter for this week
    weekly_df = df[df['week_year'] == p]
    if weekly_df.empty: continue
    
    # Group by Bot
    bot_stats = weekly_df.groupby('bot_id')['profit_pct'].sum().reset_index()
    if bot_stats.empty: continue
    
    # Find Winner
    winner = bot_stats.loc[bot_stats['profit_pct'].idxmax()]
    
    # Only award if profit is positive and substantial (> 1%)
    if winner['profit_pct'] > 1.0:
        # Get start date of the week for display
        week_start = weekly_df['entry_date'].min().strftime('%d/%m')
        week_end = weekly_df['entry_date'].max().strftime('%d/%m')
        
        weekly_awards.append({
            "type": "AWARD",
            "date": weekly_df['entry_date'].max().strftime('%Y-%m-%d'), # Award at end of week
            "title_ar": f"نجم الأسبوع ({week_start} - {week_end})",
            "bot_id": winner['bot_id'],
            "profit": round(winner['profit_pct'], 2),
            "description_ar": f"حقق الروبوت {winner['bot_id']} صدارة الأسبوع بعائد ممتاز."
        })

# 2. GENERATE LEGENDARY TRADES (Top 10 All Time)
legendary_trades = []
top_trades = df.nlargest(10, 'profit_pct')

for _, trade in top_trades.iterrows():
    legendary_trades.append({
        "type": "LEGENDARY_TRADE",
        "date": trade['entry_date'].strftime('%Y-%m-%d'),
        "symbol": trade['symbol'],
        "bot_id": trade['bot_id'],
        "profit": trade['profit_pct'],
        "description_ar": "صفقة أسطورية كسرت التوقعات!"
    })

# 3. GENERATE PORTFOLIO MILESTONES (Simulation of a user who invested 100k)
# We calculate a cumulative return timeline
df_sorted = df.sort_values('exit_date')
portfolio_milestones = []
current_equity = 100000
milestone_step = 20000 # Record every 20k profit

for _, trade in df_sorted.iterrows():
    if pd.isna(trade['exit_date']): continue
    
    # Assume 10% allocation per trade
    trade_profit_val = (10000 * (trade['profit_pct'] / 100))
    current_equity += trade_profit_val
    
    # Check milestone
    if current_equity > 100000 and (current_equity % milestone_step) < 5000: # Rough trigger
         # To avoid spamming, only add if not recently added (simplified logic here)
         pass

# Save Results
final_output = {
    "awards": weekly_awards,
    "legendary_trades": legendary_trades,
    "generated_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
}

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_output, f, ensure_ascii=False, indent=4)

print(f"✅ Generated history events: {len(weekly_awards)} awards, {len(legendary_trades)} legendary trades.")
