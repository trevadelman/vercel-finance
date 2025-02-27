export type QuoteType = 'Equity' | 'ETF' | 'Fund' | 'Cryptocurrency' | 'Index' | 'Other';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  pe?: number;
  dividend?: number;
  sector?: string;
  quoteType?: QuoteType;
}

export interface MarketIndex {
  value: number;
  change: number;
  changePercent: number;
}

export interface MarketIndices {
  sp500: MarketIndex;
  dowJones: MarketIndex;
  nasdaq: MarketIndex;
  russell2000: MarketIndex;
}

export interface StockHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
