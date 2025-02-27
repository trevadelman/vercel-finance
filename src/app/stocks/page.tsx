"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Typography, Card, Input, Button, Table, Tag, Space, Spin, Alert, message, Tooltip } from 'antd';
import { SearchOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import { searchStocks } from '@/services/stockApi';
import { StockData } from '@/types/stock';

const { Title, Paragraph } = Typography;

// Define table record type
interface StockRecord {
  key: string;
  symbol: string;
  name: string;
  sector: string;
  quoteType?: string;
}

export default function StocksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  // Load watchlist on component mount
  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        // Import storage service dynamically to avoid SSR issues
        const { getWatchlist } = await import('@/services/storageService');
        setWatchlist(getWatchlist());
      } catch (error) {
        console.error('Error loading watchlist:', error);
      }
    };
    
    loadWatchlist();
  }, []);

  // Toggle watchlist status
  const toggleWatchlist = async (symbol: string) => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { addToWatchlist, removeFromWatchlist, isInWatchlist } = await import('@/services/storageService');
      
      const inWatchlist = isInWatchlist(symbol);
      
      if (inWatchlist) {
        removeFromWatchlist(symbol);
        message.success(`${symbol} removed from watchlist`);
      } else {
        addToWatchlist(symbol);
        message.success(`${symbol} added to watchlist`);
      }
      
      // Update watchlist state
      const { getWatchlist } = await import('@/services/storageService');
      setWatchlist(getWatchlist());
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      message.error('Failed to update watchlist');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
      setSearched(true);
      
      if (results.length === 0) {
        setError(`No results found for "${searchQuery}"`);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search stocks');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToStockDetail = (symbol: string) => {
    router.push(`/stocks/${symbol}`);
  };

  // Popular stocks data
  const popularStocks: StockRecord[] = [
    {
      key: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      sector: 'Technology',
      quoteType: 'Equity',
    },
    {
      key: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
      quoteType: 'Equity',
    },
    {
      key: '3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Technology',
      quoteType: 'Equity',
    },
    {
      key: '4',
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      sector: 'Consumer Cyclical',
      quoteType: 'Equity',
    },
    {
      key: '5',
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      sector: 'Technology',
      quoteType: 'Equity',
    },
    {
      key: '6',
      symbol: 'BTC-USD',
      name: 'Bitcoin USD',
      sector: 'Cryptocurrency',
      quoteType: 'Cryptocurrency',
    },
    {
      key: '7',
      symbol: 'SPY',
      name: 'SPDR S&P 500 ETF Trust',
      sector: 'Financial Services',
      quoteType: 'ETF',
    },
    {
      key: '8',
      symbol: 'SWPPX',
      name: 'Schwab S&P 500 Index Fund',
      sector: 'Financial Services',
      quoteType: 'Fund',
    },
  ];

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'quoteType',
      key: 'quoteType',
      render: (quoteType: string) => {
        let color = 'default';
        if (quoteType === 'Equity') color = 'blue';
        else if (quoteType === 'ETF') color = 'green';
        else if (quoteType === 'Fund') color = 'purple';
        else if (quoteType === 'Cryptocurrency') color = 'orange';
        else if (quoteType === 'Index') color = 'cyan';
        
        return <Tag color={color}>{quoteType || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      render: (sector: string) => (
        sector ? <Tag color="blue">{sector}</Tag> : <Tag color="default">N/A</Tag>
      ),
    },
    {
      title: 'Watchlist',
      key: 'watchlist',
      render: (_: unknown, record: StockRecord) => {
        const inWatchlist = watchlist.includes(record.symbol);
        return (
          <Tooltip title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}>
            <Button 
              type="text"
              icon={inWatchlist ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                toggleWatchlist(record.symbol);
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: StockRecord) => (
        <Button 
          type="link"
          onClick={() => navigateToStockDetail(record.symbol)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <div>
        <Title level={2}>Stock Search</Title>
        <Paragraph>
          Search for stocks by company name or symbol. View detailed information and add to your watchlist.
        </Paragraph>
        
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              size="large"
              placeholder="Search for a stock (e.g., AAPL, Apple, MSFT, Microsoft)"
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              suffix={
                <Button 
                  type="primary"
                  onClick={handleSearch}
                  loading={loading}
                >
                  Search
                </Button>
              }
            />
            <Paragraph type="secondary">
              Enter a company name or stock symbol to search. Results will appear below.
            </Paragraph>
          </Space>
        </Card>
        
        {loading ? (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
        ) : searched && searchResults.length > 0 ? (
          <>
            <Title level={3}>Search Results</Title>
            <Table 
              columns={columns}
              dataSource={searchResults.map((stock, index) => ({
                ...stock,
                key: index.toString(),
                sector: stock.sector || 'N/A',
                quoteType: stock.quoteType || 'Other',
              }))}
              pagination={false}
              style={{ marginBottom: 24 }}
            />
          </>
        ) : null}
        
        {(!searched || searchResults.length === 0) && (
          <>
            <Title level={3}>Popular Stocks</Title>
            <Table 
              columns={columns}
              dataSource={popularStocks}
              pagination={false}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
}
