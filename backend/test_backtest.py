"""
Test the new backtest engine with custom strategies
"""
from app.services.backtest_engine import BacktestEngine
import json

print('=' * 60)
print('🚀 تشغيل الباكتيست بالاستراتيجيات المخصصة لكل روبوت')
print('=' * 60)

# تشغيل المحاكاة
engine = BacktestEngine('2024-01-01', 100000)
results = engine.run()

# عرض النتائج
print()
print('=' * 60)
print('📊 نتائج المحاكاة بالاستراتيجيات المخصصة:')
print('=' * 60)
print()

for bot in results['leaderboard']:
    emoji = bot['emoji']
    name = bot['name_ar']
    profit = bot['total_profit_pct']
    win_rate = bot['win_rate']
    wins = bot['winning_trades']
    losses = bot['losing_trades']
    total = bot['total_trades']
    
    status = 'UP' if profit > 0 else 'DOWN'
    win_status = 'MORE_WINS' if wins > losses else 'MORE_LOSSES'
    
    print(f'{emoji} {name}:')
    print(f'   Profit: {profit:+.2f}% {status}')
    print(f'   Win Rate: {win_rate}% | Wins: {wins} | Losses: {losses} {win_status}')
    print()

# حفظ النتائج
with open('test_output_new.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, ensure_ascii=False)
print('Done! Results saved to test_output_new.json')
