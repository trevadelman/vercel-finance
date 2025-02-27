import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { StockHistoricalData } from '@/types/stock';

// Define interface for Yahoo Finance historical data
interface YahooHistoricalData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// Define interface for technical indicators response
interface TechnicalIndicatorsResponse {
  historicalData: StockHistoricalData[];
  sma20?: number[];
  sma50?: number[];
  sma200?: number[];
  ema12?: number[];
  ema26?: number[];
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollinger?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}

// Technical indicators calculation functions
const calculateSMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN); // Not enough data for the period
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
};

const calculateEMA = (data: number[], period: number): number[] => {
  const result: number[] = [];
  const k = 2 / (period + 1);
  
  // First EMA is SMA
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN); // Not enough data for the period
    } else if (i === period - 1) {
      result.push(ema);
    } else {
      ema = (data[i] - ema) * k + ema;
      result.push(ema);
    }
  }
  return result;
};

const calculateRSI = (data: number[], period: number = 14): number[] => {
  const result: number[] = [];
  const changes: number[] = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  // Calculate average gains and losses
  for (let i = 0; i < changes.length; i++) {
    if (i < period) {
      result.push(NaN); // Not enough data
      continue;
    }
    
    const periodChanges = changes.slice(i - period, i);
    const gains = periodChanges.filter(change => change > 0);
    const losses = periodChanges.filter(change => change < 0).map(loss => Math.abs(loss));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) {
      result.push(100); // No losses, RSI is 100
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(rsi);
    }
  }
  
  // Add NaN for the first data point (since we don't have a change for it)
  result.unshift(NaN);
  
  return result;
};

const calculateMACD = (data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): { macd: number[], signal: number[], histogram: number[] } => {
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  const macdLine: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const validMacd = macdLine.filter(val => !isNaN(val));
  const signalLine = calculateEMA(validMacd, signalPeriod);
  
  // Pad signal line with NaN to match original data length
  const paddedSignalLine: number[] = Array(data.length - validMacd.length).fill(NaN).concat(signalLine);
  
  // Calculate histogram (MACD line - signal line)
  const histogram: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(paddedSignalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - paddedSignalLine[i]);
    }
  }
  
  return {
    macd: macdLine,
    signal: paddedSignalLine,
    histogram: histogram
  };
};

const calculateBollingerBands = (data: number[], period: number = 20, multiplier: number = 2): { upper: number[], middle: number[], lower: number[] } => {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      const mean = sum / period;
      
      const squaredDiffs = slice.map(val => Math.pow(val - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const stdDev = Math.sqrt(variance);
      
      upper.push(middle[i] + (multiplier * stdDev));
      lower.push(middle[i] - (multiplier * stdDev));
    }
  }
  
  return { upper, middle, lower };
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || '1y'; // Default to 1 year for indicators
  const interval = searchParams.get('interval') || '1d'; // Default to daily
  const indicators = searchParams.get('indicators') || 'sma,ema,rsi,macd,bollinger'; // Default indicators

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Get historical data first
    const queryOptions = {
      period1: getStartDate(period),
      period2: new Date(),
      interval: interval as '1d' | '1wk' | '1mo',
    };

    const result = await yahooFinance.historical(symbol, queryOptions);
    
    // Transform the data to match our StockHistoricalData interface
    const historicalData: StockHistoricalData[] = result.map((item: YahooHistoricalData) => ({
      date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
    
    // Extract close prices for indicator calculations
    const closePrices = historicalData.map(item => item.close);
    
    // Calculate requested indicators
    const indicatorList = indicators.split(',');
    const response: TechnicalIndicatorsResponse = { historicalData };
    
    if (indicatorList.includes('sma')) {
      response.sma20 = calculateSMA(closePrices, 20);
      response.sma50 = calculateSMA(closePrices, 50);
      response.sma200 = calculateSMA(closePrices, 200);
    }
    
    if (indicatorList.includes('ema')) {
      response.ema12 = calculateEMA(closePrices, 12);
      response.ema26 = calculateEMA(closePrices, 26);
    }
    
    if (indicatorList.includes('rsi')) {
      response.rsi = calculateRSI(closePrices);
    }
    
    if (indicatorList.includes('macd')) {
      response.macd = calculateMACD(closePrices);
    }
    
    if (indicatorList.includes('bollinger')) {
      response.bollinger = calculateBollingerBands(closePrices);
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate technical indicators' },
      { status: 500 }
    );
  }
}

// Helper function to calculate start date based on period
function getStartDate(period: string): Date {
  const now = new Date();
  const startDate = new Date(now);
  
  switch (period) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '5d':
      startDate.setDate(now.getDate() - 5);
      break;
    case '1mo':
      startDate.setMonth(now.getMonth() - 1);
      break;
    case '3mo':
      startDate.setMonth(now.getMonth() - 3);
      break;
    case '6mo':
      startDate.setMonth(now.getMonth() - 6);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case '2y':
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    case '5y':
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case 'ytd':
      startDate.setMonth(0);
      startDate.setDate(1);
      break;
    default:
      startDate.setFullYear(now.getFullYear() - 1); // Default to 1 year for indicators
  }
  
  return startDate;
}
