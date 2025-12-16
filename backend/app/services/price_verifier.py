"""
خدمة التحقق من الأسعار الحقيقية
================================
تسحب بيانات الأسعار التاريخية من Yahoo Finance وتقارنها مع أسعار المحاكاة
"""

import yfinance as yf
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import logging

logger = logging.getLogger(__name__)


class PriceVerifier:
    """خدمة التحقق من الأسعار"""
    
    def __init__(self):
        self.cache = {}  # كاش مؤقت للأسعار
    
    def get_real_price(self, symbol: str, date: str) -> Optional[Dict[str, Any]]:
        """
        جلب السعر الحقيقي لسهم في تاريخ محدد
        
        Args:
            symbol: رمز السهم (مثل 2222.SR)
            date: التاريخ (YYYY-MM-DD)
            
        Returns:
            dict مع بيانات السعر أو None إذا فشل
        """
        try:
            # تنسيق الرمز لـ Yahoo Finance
            yahoo_symbol = symbol if '.SR' in symbol else f"{symbol}.SR"
            
            # تحويل التاريخ
            target_date = datetime.strptime(date, '%Y-%m-%d')
            start_date = target_date - timedelta(days=5)  # 5 أيام قبل (للتعامل مع العطل)
            end_date = target_date + timedelta(days=5)  # 5 أيام بعد
            
            # التحقق من الكاش
            cache_key = f"{yahoo_symbol}_{date}"
            if cache_key in self.cache:
                return self.cache[cache_key]
            
            # جلب البيانات من Yahoo Finance
            ticker = yf.Ticker(yahoo_symbol)
            hist = ticker.history(start=start_date.strftime('%Y-%m-%d'), 
                                 end=end_date.strftime('%Y-%m-%d'))
            
            if hist.empty:
                logger.warning(f"لا توجد بيانات لـ {yahoo_symbol} في {date}")
                return None
            
            # البحث عن أقرب تاريخ تداول
            hist.index = hist.index.tz_localize(None)  # إزالة timezone
            
            # البحث عن التاريخ المطلوب أو أقرب تاريخ
            closest_date = None
            min_diff = float('inf')
            
            for idx in hist.index:
                diff = abs((idx - target_date).days)
                if diff < min_diff:
                    min_diff = diff
                    closest_date = idx
            
            if closest_date is None:
                return None
            
            row = hist.loc[closest_date]
            
            result = {
                'symbol': yahoo_symbol,
                'requested_date': date,
                'actual_date': closest_date.strftime('%Y-%m-%d'),
                'open': round(float(row['Open']), 2),
                'high': round(float(row['High']), 2),
                'low': round(float(row['Low']), 2),
                'close': round(float(row['Close']), 2),
                'volume': int(row['Volume']),
                'date_match': min_diff == 0,
                'days_difference': min_diff
            }
            
            # حفظ في الكاش
            self.cache[cache_key] = result
            
            return result
            
        except Exception as e:
            logger.error(f"خطأ في جلب السعر لـ {symbol} في {date}: {str(e)}")
            return None
    
    def verify_trade(self, trade: Dict[str, Any]) -> Dict[str, Any]:
        """
        التحقق من صفقة واحدة
        
        Args:
            trade: بيانات الصفقة
            
        Returns:
            نتيجة التحقق
        """
        symbol = trade.get('symbol', '')
        entry_date = trade.get('date') or trade.get('entry_date')
        exit_date = trade.get('exit_date')
        simulated_entry_price = trade.get('price') or trade.get('entry_price')
        simulated_exit_price = trade.get('exit_price')
        
        result = {
            'trade_id': trade.get('id', 'unknown'),
            'symbol': symbol,
            'simulated': {
                'entry_price': simulated_entry_price,
                'exit_price': simulated_exit_price,
                'entry_date': entry_date,
                'exit_date': exit_date
            },
            'real': {
                'entry': None,
                'exit': None
            },
            'verification': {
                'entry_verified': False,
                'exit_verified': False,
                'entry_difference_pct': None,
                'exit_difference_pct': None,
                'overall_status': 'pending'
            }
        }
        
        # التحقق من سعر الدخول
        if entry_date:
            real_entry = self.get_real_price(symbol, entry_date)
            if real_entry:
                result['real']['entry'] = real_entry
                
                # مقارنة السعر (نستخدم السعر الأقرب - عادة الإغلاق)
                real_price = real_entry['close']
                difference_pct = abs(simulated_entry_price - real_price) / real_price * 100
                
                result['verification']['entry_difference_pct'] = round(difference_pct, 2)
                # نعتبر السعر متطابق إذا الفرق أقل من 5%
                result['verification']['entry_verified'] = difference_pct < 5
        
        # التحقق من سعر الخروج
        if exit_date and simulated_exit_price:
            real_exit = self.get_real_price(symbol, exit_date)
            if real_exit:
                result['real']['exit'] = real_exit
                
                real_price = real_exit['close']
                difference_pct = abs(simulated_exit_price - real_price) / real_price * 100
                
                result['verification']['exit_difference_pct'] = round(difference_pct, 2)
                result['verification']['exit_verified'] = difference_pct < 5
        
        # حساب الحالة الإجمالية
        if result['verification']['entry_verified'] and result['verification']['exit_verified']:
            result['verification']['overall_status'] = 'verified'
        elif result['verification']['entry_verified'] or result['verification']['exit_verified']:
            result['verification']['overall_status'] = 'partial'
        elif result['real']['entry'] or result['real']['exit']:
            result['verification']['overall_status'] = 'mismatch'
        else:
            result['verification']['overall_status'] = 'no_data'
        
        return result
    
    def verify_multiple_trades(self, trades: List[Dict[str, Any]], limit: int = 10) -> Dict[str, Any]:
        """
        التحقق من عدة صفقات
        
        Args:
            trades: قائمة الصفقات
            limit: الحد الأقصى للصفقات
            
        Returns:
            نتائج التحقق
        """
        results = []
        verified_count = 0
        mismatch_count = 0
        no_data_count = 0
        
        for trade in trades[:limit]:
            verification = self.verify_trade(trade)
            results.append(verification)
            
            status = verification['verification']['overall_status']
            if status == 'verified':
                verified_count += 1
            elif status == 'mismatch':
                mismatch_count += 1
            elif status == 'no_data':
                no_data_count += 1
        
        return {
            'trades': results,
            'summary': {
                'total': len(results),
                'verified': verified_count,
                'partial': len(results) - verified_count - mismatch_count - no_data_count,
                'mismatch': mismatch_count,
                'no_data': no_data_count,
                'verification_rate': round(verified_count / max(len(results), 1) * 100, 1)
            }
        }


# Singleton instance
price_verifier = PriceVerifier()
