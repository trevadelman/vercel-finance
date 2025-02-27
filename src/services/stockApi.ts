import { StockData, MarketIndices } from '@/types/stock';

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
 * Get watchlist (to be implemented with local storage or database)
 */
export const getWatchlist = async (): Promise<StockData[]> => {
  // For now, return a few popular stocks
  // In the future, this will fetch from user's saved watchlist
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  
  try {
    const stockPromises = symbols.map(symbol => getStockQuote(symbol));
    return await Promise.all(stockPromises);
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
};

export default {
  getStockQuote,
  searchStocks,
  getMarketIndices,
  getWatchlist,
};
