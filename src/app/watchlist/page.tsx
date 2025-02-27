"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Typography, Table, Button, Empty, Card, Spin, Alert, message } from 'antd';
import { PlusOutlined, DeleteOutlined, StarFilled, LineChartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { getWatchlist } from '@/services/stockApi';
import { StockData } from '@/types/stock';

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
  const recommendedStocks = [
    {
      key: '1',
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.52,
      change: 1.23,
    },
    {
      key: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      price: 417.88,
      change: -2.45,
    },
    {
      key: '3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 152.19,
      change: 0.87,
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
      render: (_: any, record: StockData) => (
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
      render: (_: any, record: any) => (
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
          <Card style={{ marginBottom: 24 }}>
            <Table 
              columns={watchlistColumns}
              dataSource={watchlistData.map(stock => ({ ...stock, key: stock.symbol }))}
              pagination={false}
              rowKey="symbol"
            />
          </Card>
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
