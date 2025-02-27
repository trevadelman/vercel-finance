"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Typography, Table, Button, Empty, Card, Spin, Alert, message, Tag } from 'antd';
import { DeleteOutlined, StarFilled, LineChartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getWatchlist } from '@/services/stockApi';
import { StockData } from '@/types/stock';

// Define interface for recommended stocks
interface StockRecord {
  key: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  quoteType?: string;
}

const { Title, Paragraph } = Typography;

export default function WatchlistPage() {
  const [watchlistData, setWatchlistData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch watchlist data
  useEffect(() => {
    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const data = await getWatchlist();
        setWatchlistData(data);
      } catch (err) {
        console.error('Error fetching watchlist:', err);
        setError('Failed to load watchlist data');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  // Remove stock from watchlist
  const removeFromWatchlist = async (symbol: string) => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { removeFromWatchlist } = await import('@/services/storageService');
      removeFromWatchlist(symbol);
      
      // Update state
      setWatchlistData(prev => prev.filter(stock => stock.symbol !== symbol));
      message.success(`${symbol} removed from watchlist`);
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      message.error('Failed to remove from watchlist');
    }
  };

  // Recommended stocks
  const recommendedStocks: StockRecord[] = [
    {
      key: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.52,
      change: 1.23,
      quoteType: 'Equity',
    },
    {
      key: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 417.88,
      change: -2.45,
      quoteType: 'Equity',
    },
    {
      key: '3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 152.19,
      change: 0.87,
      quoteType: 'Equity',
    },
    {
      key: '4',
      symbol: 'BTC-USD',
      name: 'Bitcoin USD',
      price: 62345.78,
      change: 1234.56,
      quoteType: 'Cryptocurrency',
    },
    {
      key: '5',
      symbol: 'SWPPX',
      name: 'Schwab S&P 500 Index Fund',
      price: 73.45,
      change: 0.32,
      quoteType: 'Fund',
    },
  ];

  // Add stock to watchlist
  const addToWatchlist = async (symbol: string) => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { addToWatchlist } = await import('@/services/storageService');
      addToWatchlist(symbol);
      
      // Refresh watchlist
      const data = await getWatchlist();
      setWatchlistData(data);
      
      message.success(`${symbol} added to watchlist`);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      message.error('Failed to add to watchlist');
    }
  };

  // Define columns for watchlist table
  const watchlistColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => (
        <Link href={`/stocks/${text}`}>
          <span style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 'bold' }}>
            {text}
          </span>
        </Link>
      ),
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number, record: StockData) => (
        <span style={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)} ({record.changePercent.toFixed(2)}%)
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: StockData) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/stocks/${record.symbol}`}>
            <Button type="default" icon={<LineChartOutlined />} size="small">
              Chart
            </Button>
          </Link>
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => removeFromWatchlist(record.symbol)}
          />
        </div>
      ),
    },
  ];

  // Define columns for recommended stocks table
  const recommendedColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text: string) => (
        <Link href={`/stocks/${text}`}>
          <span style={{ color: '#1890ff', cursor: 'pointer', fontWeight: 'bold' }}>
            {text}
          </span>
        </Link>
      ),
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
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number) => (
        <span style={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: StockRecord) => (
        <Button 
          type="primary" 
          size="small" 
          icon={<StarFilled />}
          onClick={() => addToWatchlist(record.symbol)}
        >
          Add
        </Button>
      ),
    },
  ];

  // Group watchlist data by quote type
  const getGroupedWatchlist = () => {
    const groups: Record<string, StockData[]> = {
      'Equity': [],
      'ETF': [],
      'Fund': [],
      'Cryptocurrency': [],
      'Index': [],
      'Other': []
    };
    
    watchlistData.forEach(stock => {
      const type = stock.quoteType || 'Other';
      if (groups[type]) {
        groups[type].push(stock);
      } else {
        groups['Other'].push(stock);
      }
    });
    
    return groups;
  };

  return (
    <AppLayout>
      <div>
        <Title level={2}>Your Watchlist</Title>
        <Paragraph>
          Track your favorite stocks in one place. Add stocks to your watchlist to monitor their performance.
        </Paragraph>
        
        {loading ? (
          <div style={{ textAlign: 'center', margin: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
        ) : watchlistData.length === 0 ? (
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Your watchlist is empty"
            >
              <Paragraph style={{ marginBottom: 16 }}>
                Add stocks to your watchlist to track their performance
              </Paragraph>
            </Empty>
          </Card>
        ) : (
          <>
            {/* Group watchlist by quote type */}
            {Object.entries(getGroupedWatchlist()).map(([type, stocks]) => {
              if (stocks.length === 0) return null;
              
              return (
                <Card 
                  key={type} 
                  title={`${type} Watchlist`} 
                  style={{ marginBottom: 16 }}
                  headStyle={{ 
                    backgroundColor: 
                      type === 'Equity' ? '#e6f7ff' : 
                      type === 'ETF' ? '#f6ffed' : 
                      type === 'Fund' ? '#f9f0ff' : 
                      type === 'Cryptocurrency' ? '#fff7e6' : 
                      type === 'Index' ? '#e6fffb' : 
                      '#f0f0f0'
                  }}
                >
                  <Table 
                    columns={watchlistColumns}
                    dataSource={stocks.map(stock => ({ ...stock, key: stock.symbol }))}
                    pagination={false}
                    rowKey="symbol"
                  />
                </Card>
              );
            })}
          </>
        )}
        
        <Title level={3}>Recommended Stocks</Title>
        <Table 
          columns={recommendedColumns}
          dataSource={recommendedStocks}
          pagination={false}
          rowKey="symbol"
        />
      </div>
    </AppLayout>
  );
}
