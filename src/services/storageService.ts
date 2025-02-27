/**
 * Storage Service
 * 
 * This service provides methods for persisting data in the browser's localStorage.
 * It handles watchlist and portfolio data persistence.
 */

// No need to import StockData as it's not used

// Define portfolio item interface
export interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  purchaseDate: string;
}

// Keys for localStorage
const WATCHLIST_KEY = 'vercel-finance-watchlist';
const PORTFOLIO_KEY = 'vercel-finance-portfolio';

/**
 * Get watchlist from localStorage
 */
export const getWatchlist = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const watchlist = localStorage.getItem(WATCHLIST_KEY);
    return watchlist ? JSON.parse(watchlist) : [];
  } catch (error) {
    console.error('Error getting watchlist from localStorage:', error);
    return [];
  }
};

/**
 * Add stock to watchlist
 */
export const addToWatchlist = (symbol: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const watchlist = getWatchlist();
    if (!watchlist.includes(symbol)) {
      watchlist.push(symbol);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }
  } catch (error) {
    console.error('Error adding to watchlist:', error);
  }
};

/**
 * Remove stock from watchlist
 */
export const removeFromWatchlist = (symbol: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    let watchlist = getWatchlist();
    watchlist = watchlist.filter(item => item !== symbol);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  } catch (error) {
    console.error('Error removing from watchlist:', error);
  }
};

/**
 * Check if stock is in watchlist
 */
export const isInWatchlist = (symbol: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const watchlist = getWatchlist();
    return watchlist.includes(symbol);
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
};

/**
 * Get portfolio from localStorage
 */
export const getPortfolio = (): PortfolioItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const portfolio = localStorage.getItem(PORTFOLIO_KEY);
    return portfolio ? JSON.parse(portfolio) : [];
  } catch (error) {
    console.error('Error getting portfolio from localStorage:', error);
    return [];
  }
};

/**
 * Add stock to portfolio
 */
export const addToPortfolio = (item: PortfolioItem): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const portfolio = getPortfolio();
    
    // Check if stock already exists in portfolio
    const existingIndex = portfolio.findIndex(p => p.symbol === item.symbol);
    
    if (existingIndex >= 0) {
      // Update existing position (average down/up)
      const existing = portfolio[existingIndex];
      const totalShares = existing.shares + item.shares;
      const totalCost = (existing.shares * existing.purchasePrice) + (item.shares * item.purchasePrice);
      const newAveragePrice = totalCost / totalShares;
      
      portfolio[existingIndex] = {
        ...existing,
        shares: totalShares,
        purchasePrice: newAveragePrice,
        // Keep the earliest purchase date
        purchaseDate: new Date(existing.purchaseDate) < new Date(item.purchaseDate) 
          ? existing.purchaseDate 
          : item.purchaseDate
      };
    } else {
      // Add new position
      portfolio.push(item);
    }
    
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error adding to portfolio:', error);
  }
};

/**
 * Update portfolio item
 */
export const updatePortfolioItem = (symbol: string, updates: Partial<PortfolioItem>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const portfolio = getPortfolio();
    const index = portfolio.findIndex(item => item.symbol === symbol);
    
    if (index >= 0) {
      portfolio[index] = { ...portfolio[index], ...updates };
      localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    }
  } catch (error) {
    console.error('Error updating portfolio item:', error);
  }
};

/**
 * Remove stock from portfolio
 */
export const removeFromPortfolio = (symbol: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    let portfolio = getPortfolio();
    portfolio = portfolio.filter(item => item.symbol !== symbol);
    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
  } catch (error) {
    console.error('Error removing from portfolio:', error);
  }
};

/**
 * Calculate portfolio statistics
 */
export const getPortfolioStats = (currentPrices: Record<string, number>): {
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  dailyChange: number;
  dailyChangePercent: number;
} => {
  const portfolio = getPortfolio();
  
  let totalValue = 0;
  let totalCost = 0;
  let dailyChange = 0;
  
  portfolio.forEach(item => {
    const currentPrice = currentPrices[item.symbol] || 0;
    const positionValue = item.shares * currentPrice;
    const positionCost = item.shares * item.purchasePrice;
    
    totalValue += positionValue;
    totalCost += positionCost;
    
    // Assuming a 1% daily change for demonstration
    // In a real app, you would get the actual daily change from the API
    dailyChange += positionValue * 0.01;
  });
  
  const totalReturn = totalValue - totalCost;
  const totalReturnPercent = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;
  const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0;
  
  return {
    totalValue,
    totalCost,
    totalReturn,
    totalReturnPercent,
    dailyChange,
    dailyChangePercent
  };
};

// Create a named object for the default export
const storageService = {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
  getPortfolio,
  addToPortfolio,
  updatePortfolioItem,
  removeFromPortfolio,
  getPortfolioStats
};

export default storageService;
