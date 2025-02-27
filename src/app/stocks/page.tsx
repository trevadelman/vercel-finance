"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import { Typography, Card, Input, Button, Table, Tag, Space, Spin, Alert } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchStocks } from '@/services/stockApi';
import { StockData } from '@/types/stock';

const { Title, Paragraph } = Typography;

// Define table record type
interface StockRecord {
  key: string;
  symbol: string;
  name: string;
  sector: string;
}

export default function StocksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

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
    },
    {
      key: '2',
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      sector: 'Technology',
    },
    {
      key: '3',
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      sector: 'Technology',
    },
    {
      key: '4',
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      sector: 'Consumer Cyclical',
    },
    {
      key: '5',
      symbol: 'META',
      name: 'Meta Platforms Inc.',
      sector: 'Technology',
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
      title: 'Sector',
      dataIndex: 'sector',
      key: 'sector',
      render: (sector: string) => (
        sector ? <Tag color="blue">{sector}</Tag> : <Tag color="default">N/A</Tag>
      ),
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
