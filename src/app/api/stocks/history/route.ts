import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { StockHistoricalData } from '@/types/stock';

// Define valid interval types for Yahoo Finance
type YahooInterval = '1d' | '1wk' | '1mo';

// Define the Yahoo Finance historical data item type
interface YahooHistoricalDataItem {
  date: Date;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const period = searchParams.get('period') || '1mo'; // Default to 1 month
  const intervalParam = searchParams.get('interval') || '1d'; // Default to daily

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Ensure interval is a valid Yahoo Finance interval
    const interval: YahooInterval = 
      (intervalParam === '1d' || intervalParam === '1wk' || intervalParam === '1mo') 
        ? intervalParam as YahooInterval 
        : '1d';

    // Valid periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    // Valid intervals: 1d, 1wk, 1mo
    const queryOptions = {
      period1: getStartDate(period),
      period2: new Date(),
      interval: interval,
    };

    const result = await yahooFinance.historical(symbol, queryOptions);
    
    // Transform the data to match our StockHistoricalData interface
    const historicalData: StockHistoricalData[] = result.map((item: YahooHistoricalDataItem) => ({
      date: item.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
    }));
    
    return NextResponse.json(historicalData);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch historical data' },
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
      startDate.setMonth(now.getMonth() - 1); // Default to 1 month
  }
  
  return startDate;
}
