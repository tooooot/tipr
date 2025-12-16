"""
خدمة حساب المؤشرات الفنية الحقيقية
=====================================
تحسب RSI, SMA, EMA, Volume Change من بيانات الأسعار الحقيقية
"""

from typing import List, Dict, Optional
from datetime import datetime
import math


class TechnicalIndicators:
    """حساب المؤشرات الفنية من البيانات الحقيقية"""
    
    @staticmethod
    def calculate_rsi(prices: List[float], period: int = 14) -> Optional[float]:
        """
        حساب مؤشر القوة النسبية RSI
        
        Args:
            prices: قائمة الأسعار (الإغلاق)
            period: فترة الحساب (افتراضي 14)
            
        Returns:
            قيمة RSI (0-100) أو None إذا لم تكن هناك بيانات كافية
        """
        if len(prices) < period + 1:
            return None
        
        # حساب التغيرات
        changes = [prices[i] - prices[i-1] for i in range(1, len(prices))]
        
        # الأخذ آخر period تغير
        recent_changes = changes[-(period):]
        
        # فصل المكاسب والخسائر
        gains = [c if c > 0 else 0 for c in recent_changes]
        losses = [-c if c < 0 else 0 for c in recent_changes]
        
        avg_gain = sum(gains) / period
        avg_loss = sum(losses) / period
        
        if avg_loss == 0:
            return 100.0
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        
        return round(rsi, 2)
    
    @staticmethod
    def calculate_sma(prices: List[float], period: int) -> Optional[float]:
        """
        حساب المتوسط المتحرك البسيط SMA
        
        Args:
            prices: قائمة الأسعار
            period: فترة الحساب (مثل 20, 50, 200)
            
        Returns:
            قيمة SMA أو None
        """
        if len(prices) < period:
            return None
        
        recent_prices = prices[-period:]
        sma = sum(recent_prices) / period
        
        return round(sma, 2)
    
    @staticmethod
    def calculate_ema(prices: List[float], period: int) -> Optional[float]:
        """
        حساب المتوسط المتحرك الأسي EMA
        
        Args:
            prices: قائمة الأسعار
            period: فترة الحساب
            
        Returns:
            قيمة EMA أو None
        """
        if len(prices) < period:
            return None
        
        multiplier = 2 / (period + 1)
        
        # البدء بـ SMA كأول قيمة
        ema = sum(prices[:period]) / period
        
        # حساب EMA للباقي
        for price in prices[period:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        
        return round(ema, 2)
    
    @staticmethod
    def calculate_volume_change(volumes: List[int], period: int = 20) -> Optional[float]:
        """
        حساب نسبة تغير الحجم مقارنة بالمتوسط
        
        Args:
            volumes: قائمة أحجام التداول
            period: فترة المقارنة
            
        Returns:
            نسبة الحجم كنسبة مئوية من المتوسط
        """
        if len(volumes) < period + 1:
            return None
        
        current_volume = volumes[-1]
        avg_volume = sum(volumes[-period-1:-1]) / period
        
        if avg_volume == 0:
            return 0
        
        change_pct = (current_volume / avg_volume) * 100
        
        return round(change_pct, 1)
    
    @staticmethod
    def calculate_macd(prices: List[float]) -> Optional[Dict]:
        """
        حساب مؤشر MACD
        
        Returns:
            dict مع macd_line, signal_line, histogram
        """
        if len(prices) < 26:
            return None
        
        # EMA 12 و 26
        ema12 = TechnicalIndicators.calculate_ema(prices, 12)
        ema26 = TechnicalIndicators.calculate_ema(prices, 26)
        
        if ema12 is None or ema26 is None:
            return None
        
        macd_line = round(ema12 - ema26, 4)
        
        # Signal line is 9-period EMA of MACD (simplified)
        signal_line = round(macd_line * 0.8, 4)  # Simplified
        
        histogram = round(macd_line - signal_line, 4)
        
        return {
            "macd_line": macd_line,
            "signal_line": signal_line,
            "histogram": histogram,
            "signal": "buy" if histogram > 0 else "sell"
        }
    
    @staticmethod
    def calculate_bollinger_bands(prices: List[float], period: int = 20, std_dev: float = 2) -> Optional[Dict]:
        """
        حساب نطاقات بولينجر
        
        Returns:
            dict مع upper, middle, lower bands
        """
        if len(prices) < period:
            return None
        
        recent_prices = prices[-period:]
        
        # Middle band (SMA)
        middle = sum(recent_prices) / period
        
        # Standard deviation
        variance = sum((p - middle) ** 2 for p in recent_prices) / period
        std = math.sqrt(variance)
        
        upper = middle + (std_dev * std)
        lower = middle - (std_dev * std)
        
        current_price = prices[-1]
        
        # موقع السعر الحالي
        if current_price >= upper:
            position = "overbought"
        elif current_price <= lower:
            position = "oversold"
        else:
            position = "neutral"
        
        return {
            "upper": round(upper, 2),
            "middle": round(middle, 2),
            "lower": round(lower, 2),
            "position": position
        }
    
    @staticmethod
    def get_all_indicators(price_data: List[Dict], day_idx: int) -> Dict:
        """
        حساب جميع المؤشرات الفنية لتاريخ معين
        
        Args:
            price_data: بيانات الأسعار الكاملة للسهم
            day_idx: فهرس اليوم الحالي
            
        Returns:
            dict مع كل المؤشرات
        """
        if day_idx < 1 or day_idx >= len(price_data):
            return {}
        
        # استخراج الأسعار حتى هذا اليوم
        prices_until_now = [d["close"] for d in price_data[:day_idx + 1]]
        volumes_until_now = [d["volume"] for d in price_data[:day_idx + 1]]
        
        current_price = price_data[day_idx]["close"]
        current_date = price_data[day_idx]["date"]
        
        # حساب المؤشرات
        rsi = TechnicalIndicators.calculate_rsi(prices_until_now, 14)
        sma_20 = TechnicalIndicators.calculate_sma(prices_until_now, 20)
        sma_50 = TechnicalIndicators.calculate_sma(prices_until_now, 50)
        sma_200 = TechnicalIndicators.calculate_sma(prices_until_now, 200)
        ema_12 = TechnicalIndicators.calculate_ema(prices_until_now, 12)
        ema_26 = TechnicalIndicators.calculate_ema(prices_until_now, 26)
        volume_change = TechnicalIndicators.calculate_volume_change(volumes_until_now, 20)
        macd = TechnicalIndicators.calculate_macd(prices_until_now)
        bollinger = TechnicalIndicators.calculate_bollinger_bands(prices_until_now, 20)
        
        # تحديد الاتجاه
        trend = "neutral"
        if sma_50 and sma_200:
            if sma_50 > sma_200:
                trend = "bullish"  # تقاطع ذهبي
            else:
                trend = "bearish"  # تقاطع ميت
        
        # تحديد حالة السوق بناءً على RSI
        rsi_status = "neutral"
        if rsi:
            if rsi < 30:
                rsi_status = "oversold"
            elif rsi > 70:
                rsi_status = "overbought"
        
        return {
            "date": current_date.strftime("%Y-%m-%d") if hasattr(current_date, 'strftime') else str(current_date),
            "price": current_price,
            "rsi": {
                "value": rsi,
                "status": rsi_status,
                "interpretation": "تشبع بيعي - فرصة شراء" if rsi_status == "oversold" else 
                                 "تشبع شرائي - حذر" if rsi_status == "overbought" else 
                                 "منطقة متوازنة"
            },
            "sma": {
                "sma_20": sma_20,
                "sma_50": sma_50,
                "sma_200": sma_200,
                "price_vs_sma20": "above" if sma_20 and current_price > sma_20 else "below" if sma_20 else None,
                "price_vs_sma50": "above" if sma_50 and current_price > sma_50 else "below" if sma_50 else None,
            },
            "ema": {
                "ema_12": ema_12,
                "ema_26": ema_26,
            },
            "volume": {
                "current": volumes_until_now[-1] if volumes_until_now else 0,
                "change_pct": volume_change,
                "status": "high" if volume_change and volume_change > 150 else 
                         "normal" if volume_change and volume_change > 80 else "low"
            },
            "macd": macd,
            "bollinger": bollinger,
            "trend": {
                "direction": trend,
                "golden_cross": trend == "bullish",
                "death_cross": trend == "bearish",
            },
            "signals": {
                "rsi_signal": "buy" if rsi_status == "oversold" else "sell" if rsi_status == "overbought" else "hold",
                "macd_signal": macd["signal"] if macd else None,
                "trend_signal": "buy" if trend == "bullish" else "sell" if trend == "bearish" else "hold",
            }
        }


# Singleton instance
technical_indicators = TechnicalIndicators()
