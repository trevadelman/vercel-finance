import { StockData, MarketIndices, StockHistoricalData } from '@/types/stock';

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

// Base URL for API requests
const API_BASE_URL = '/api/stocks';

/**
 * Get a stock quote by symbol
 */
export const getStockQuote = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=quote&symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stock quote: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

/**
 * Search for stocks by query
 */
export const searchStocks = async (query: string): Promise<StockData[]> => {
  if (!query) return [];
  
  try {
    const response = await fetch(`${API_BASE_URL}?action=search&symbol=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search stocks: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

/**
 * Get market indices data
 */
export const getMarketIndices = async (): Promise<MarketIndices> => {
  try {
    const response = await fetch(`${API_BASE_URL}?action=market`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market indices: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching market indices:', error);
    // Return default values if API fails
    return {
      sp500: { value: 0, change: 0, changePercent: 0 },
      dowJones: { value: 0, change: 0, changePercent: 0 },
      nasdaq: { value: 0, change: 0, changePercent: 0 },
      russell2000: { value: 0, change: 0, changePercent: 0 },
    };
  }
};

/**
 * Get historical stock data
 * @param symbol Stock symbol
 * @param period Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, ytd)
 * @param interval Data interval (1d, 1wk, 1mo)
 */
export const getStockHistory = async (
  symbol: string,
  period: string = '1mo',
  interval: string = '1d'
): Promise<StockHistoricalData[]> => {
  try {
    const url = `${API_BASE_URL}/history?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch historical data: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return [];
  }
};

/**
 * Get technical indicators for a stock
 * @param symbol Stock symbol
 * @param period Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, ytd)
 * @param interval Data interval (1d, 1wk, 1mo)
 * @param indicators Comma-separated list of indicators (sma,ema,rsi,macd,bollinger)
 */
export const getTechnicalIndicators = async (
  symbol: string,
  period: string = '1y',
  interval: string = '1d',
  indicators: string = 'sma,ema,rsi,macd,bollinger'
): Promise<TechnicalIndicatorsResponse> => {
  try {
    const url = `${API_BASE_URL}/indicators?symbol=${encodeURIComponent(symbol)}&period=${period}&interval=${interval}&indicators=${indicators}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch technical indicators: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching technical indicators:', error);
    return { historicalData: [] };
  }
};

/**
 * Get watchlist from local storage and fetch current data
 */
export const getWatchlist = async (): Promise<StockData[]> => {
  // Import dynamically to avoid SSR issues
  const { getWatchlist } = await import('./storageService');
  
  // Get symbols from local storage
  const symbols = getWatchlist();
  
  // If watchlist is empty, return empty array
  if (symbols.length === 0) {
    return [];
  }
  
  try {
    const stockPromises = symbols.map(symbol => getStockQuote(symbol));
    return await Promise.all(stockPromises);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

// Create a named object for the default export
const stockApi = {
  getStockQuote,
  searchStocks,
  getMarketIndices,
  getStockHistory,
  getTechnicalIndicators,
  getWatchlist,
};

export default stockApi;
