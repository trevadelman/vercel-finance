import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';
import { StockData, QuoteType } from '@/types/stock';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const action = searchParams.get('action') || 'quote';

  try {
    if (action === 'quote' && symbol) {
      // Get a single stock quote
      const result = await yahooFinance.quote(symbol);
      
      // Determine the quote type
      let quoteType: QuoteType = 'Other';
      if (result.quoteType) {
        if (result.quoteType === 'EQUITY') quoteType = 'Equity';
        else if (result.quoteType === 'ETF') quoteType = 'ETF';
        else if (result.quoteType === 'MUTUALFUND') quoteType = 'Fund';
        else if (result.quoteType === 'CRYPTOCURRENCY') quoteType = 'Cryptocurrency';
        else if (result.quoteType === 'INDEX') quoteType = 'Index';
      }
      
      const stockData: StockData = {
        symbol: result.symbol,
        name: result.longName || result.shortName || result.symbol,
        price: result.regularMarketPrice || 0,
        change: result.regularMarketChange || 0,
        changePercent: result.regularMarketChangePercent || 0,
        volume: result.regularMarketVolume,
        marketCap: result.marketCap,
        pe: result.trailingPE,
        // Handle optional fields that might not exist in the result
        dividend: result.trailingAnnualDividendYield || 0,
        sector: 'N/A', // Yahoo Finance API doesn't directly provide sector in quote
        quoteType: quoteType
      };
      
      return NextResponse.json(stockData);
    } 
    else if (action === 'search' && symbol) {
      // Search for stocks
      const results = await yahooFinance.search(symbol);
      
      // Type safety: filter and map only valid equity quotes
      const stocks: StockData[] = [];
      
      for (const quote of results.quotes) {
        // Use type checking to ensure we have the necessary properties
        if ('symbol' in quote) {
          const symbol = quote.symbol as string;
          let name = symbol;
          
          // Try to get a better name if available
          if ('shortname' in quote) name = quote.shortname as string;
          else if ('longname' in quote) name = quote.longname as string;
          
          // Get the quote type to determine what kind of security it is
          const quoteType = 'quoteType' in quote ? quote.quoteType : '';
          const typeDisp = 'typeDisp' in quote ? quote.typeDisp : '';
          
          // Determine the standardized quote type for our app
          let standardQuoteType: QuoteType = 'Other';
          
          if (quoteType === 'EQUITY' || typeDisp === 'Equity') {
            standardQuoteType = 'Equity';
          } else if (quoteType === 'ETF' || typeDisp === 'ETF') {
            standardQuoteType = 'ETF';
          } else if (quoteType === 'MUTUALFUND' || typeDisp === 'Fund') {
            standardQuoteType = 'Fund';
          } else if (quoteType === 'CRYPTOCURRENCY' || typeDisp === 'Cryptocurrency') {
            standardQuoteType = 'Cryptocurrency';
          } else if (quoteType === 'INDEX') {
            standardQuoteType = 'Index';
          }
          
          // Include equities, ETFs, mutual funds, cryptocurrencies, and indices
          if (standardQuoteType !== 'Other' || 
              quoteType === 'EQUITY' || 
              quoteType === 'ETF' || 
              quoteType === 'MUTUALFUND' || 
              quoteType === 'CRYPTOCURRENCY' || 
              quoteType === 'INDEX' || 
              typeDisp === 'Equity' || 
              typeDisp === 'ETF' || 
              typeDisp === 'Fund' || 
              typeDisp === 'Cryptocurrency') {
            stocks.push({
              symbol,
              name,
              price: 0, // Search doesn't provide price data
              change: 0,
              changePercent: 0,
              quoteType: standardQuoteType
            });
          }
        }
        
        // Limit to 10 results
        if (stocks.length >= 10) break;
      }
      
      return NextResponse.json(stocks);
    }
    else if (action === 'market') {
      // Get market indices
      const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT']; // S&P 500, Dow Jones, NASDAQ, Russell 2000
      const results = await Promise.all(
        indices.map(index => yahooFinance.quote(index).catch(() => null))
      );
      
      const marketData = {
        sp500: {
          value: results[0]?.regularMarketPrice || 0,
          change: results[0]?.regularMarketChange || 0,
          changePercent: results[0]?.regularMarketChangePercent || 0,
        },
        dowJones: {
          value: results[1]?.regularMarketPrice || 0,
          change: results[1]?.regularMarketChange || 0,
          changePercent: results[1]?.regularMarketChangePercent || 0,
        },
        nasdaq: {
          value: results[2]?.regularMarketPrice || 0,
          change: results[2]?.regularMarketChange || 0,
          changePercent: results[2]?.regularMarketChangePercent || 0,
        },
        russell2000: {
          value: results[3]?.regularMarketPrice || 0,
          change: results[3]?.regularMarketChange || 0,
          changePercent: results[3]?.regularMarketChangePercent || 0,
        },
      };
      
      return NextResponse.json(marketData);
    }
    
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' }, 
      { status: 500 }
    );
  }
}
