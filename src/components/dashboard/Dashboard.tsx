"use client";

import React, { useEffect, useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Typography, 
  Table, 
  Input, 
  Button, 
  Spin, 
  Alert, 
  Divider, 
  Tag, 
  Tooltip, 
  Space
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  SearchOutlined, 
  LineChartOutlined,
  DollarCircleOutlined,
  GlobalOutlined,
  FireOutlined,
  StarOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StockData, MarketIndices } from '@/types/stock';
import { getMarketIndices, getWatchlist, searchStocks } from '@/services/stockApi';
import Link from 'next/link';
import { motion } from 'framer-motion';

const { Title, Text, Paragraph } = Typography;

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketIndices | null>(null);
  const [watchlist, setWatchlist] = useState<StockData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState({
    market: true,
    watchlist: true,
    search: false,
  });
  const [error, setError] = useState({
    market: '',
    watchlist: '',
    search: '',
  });
  const [trendingStocks, setTrendingStocks] = useState<StockData[]>([]);

  // Fetch market data on component mount
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const data = await getMarketIndices();
        setMarketData(data);
        setLoading(prev => ({ ...prev, market: false }));
      } catch (err) {
        console.error('Failed to fetch market data:', err);
        setError(prev => ({ ...prev, market: 'Failed to load market data' }));
        setLoading(prev => ({ ...prev, market: false }));
      }
    };

    fetchMarketData();
  }, []);

  // Fetch watchlist data on component mount
  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await getWatchlist();
        setWatchlist(data);
        
        // Set trending stocks (for demo purposes, just using the watchlist data)
        const sortedByChange = [...data].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        setTrendingStocks(sortedByChange.slice(0, 3));
        
        setLoading(prev => ({ ...prev, watchlist: false }));
      } catch (err) {
        console.error('Failed to fetch watchlist:', err);
        setError(prev => ({ ...prev, watchlist: 'Failed to load watchlist' }));
        setLoading(prev => ({ ...prev, watchlist: false }));
      }
    };

    fetchWatchlist();
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(prev => ({ ...prev, search: true }));
    setError(prev => ({ ...prev, search: '' }));

    try {
      const results = await searchStocks(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
      setError(prev => ({ ...prev, search: 'Failed to search stocks' }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Handle key press in search input
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const columns: ColumnsType<StockData> = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
      render: (text) => (
        <Link href={`/stocks/${text}`} style={{ fontWeight: 'bold' }}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <Link href={`/stocks/${record.symbol}`} style={{ color: 'inherit' }}>
            {name}
          </Link>
          {record.sector && (
            <Tag color="blue" style={{ marginLeft: 8 }}>
              {record.sector}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => (
        <Text strong>${price.toFixed(2)}</Text>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ 
            color: change >= 0 ? '#52c41a' : '#f5222d',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center'
          }}>
            {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span style={{ marginLeft: 4 }}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)} ({record.changePercent.toFixed(2)}%)
            </span>
          </span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Link href={`/stocks/${record.symbol}`}>
              <Button type="primary" size="small" icon={<LineChartOutlined />}>
                Details
              </Button>
            </Link>
          </Tooltip>
          <Tooltip title="Add to Watchlist">
            <Button 
              type="text" 
              size="small" 
              icon={<StarOutlined />} 
              style={{ color: '#faad14' }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Render market index card
  const renderMarketCard = (
    title: string, 
    value: number, 
    change: number, 
    changePercent: number,
    icon: React.ReactNode
  ) => (
    <motion.div variants={itemVariants}>
      <Card 
        hoverable
        style={{ 
          height: '100%',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
            <div style={{ 
              fontSize: 24, 
              fontWeight: 'bold', 
              margin: '8px 0',
              display: 'flex',
              alignItems: 'baseline'
            }}>
              {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'rgba(22, 119, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1677ff'
          }}>
            {icon}
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          marginTop: 8,
          padding: '4px 8px',
          borderRadius: 4,
          width: 'fit-content',
          background: change >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(245, 34, 45, 0.1)',
          color: change >= 0 ? '#52c41a' : '#f5222d'
        }}>
          {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          <span style={{ marginLeft: 4 }}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </span>
        </div>
      </Card>
    </motion.div>
  );

  // Render trending stock card
  const renderTrendingCard = (stock: StockData, index: number) => (
    <motion.div 
      variants={itemVariants}
      key={stock.symbol}
      style={{ marginBottom: 16 }}
    >
      <Card 
        hoverable
        style={{ 
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #f0f0f0'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: 'rgba(22, 119, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1677ff',
              marginRight: 12
            }}>
              {index + 1}
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>
                <Link href={`/stocks/${stock.symbol}`} style={{ color: 'inherit' }}>
                  {stock.symbol}
                </Link>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>{stock.name}</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>${stock.price.toFixed(2)}</div>
            <div style={{ 
              color: stock.change >= 0 ? '#52c41a' : '#f5222d',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>
              {stock.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              <span style={{ marginLeft: 4 }}>
                {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0 }}>Market Overview</Title>
          <Text type="secondary">
            Last updated: {new Date().toLocaleString()}
          </Text>
        </div>
      </motion.div>
      
      {loading.market ? (
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : error.market ? (
        <Alert message={error.market} type="error" showIcon />
      ) : marketData && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              {renderMarketCard(
                "S&P 500", 
                marketData.sp500.value, 
                marketData.sp500.change, 
                marketData.sp500.changePercent,
                <LineChartOutlined />
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderMarketCard(
                "Dow Jones", 
                marketData.dowJones.value, 
                marketData.dowJones.change, 
                marketData.dowJones.changePercent,
                <GlobalOutlined />
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderMarketCard(
                "Nasdaq", 
                marketData.nasdaq.value, 
                marketData.nasdaq.change, 
                marketData.nasdaq.changePercent,
                <DollarCircleOutlined />
              )}
            </Col>
            <Col xs={24} sm={12} md={6}>
              {renderMarketCard(
                "Russell 2000", 
                marketData.russell2000.value, 
                marketData.russell2000.change, 
                marketData.russell2000.changePercent,
                <LineChartOutlined />
              )}
            </Col>
          </Row>
        </motion.div>
      )}

      <Divider style={{ margin: '32px 0 24px' }} />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0 }}>Watchlist</Title>
              <Link href="/watchlist">
                <Button type="link">View All</Button>
              </Link>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Input 
                placeholder="Search stocks by name or symbol..." 
                prefix={<SearchOutlined />} 
                style={{ width: '100%' }}
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
                size="large"
                suffix={
                  <Button 
                    type="primary" 
                    onClick={handleSearch} 
                    loading={loading.search}
                  >
                    Search
                  </Button>
                }
              />
            </div>

            {error.watchlist ? (
              <Alert message={error.watchlist} type="error" showIcon />
            ) : loading.watchlist ? (
              <div style={{ textAlign: 'center', margin: '40px 0' }}>
                <Spin size="large" />
              </div>
            ) : (
              <Card 
                bordered={false} 
                style={{ 
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}
              >
                <Table 
                  columns={columns} 
                  dataSource={
                    searchResults.length > 0 
                      ? searchResults.map((stock, index) => ({ ...stock, key: index.toString() })) 
                      : watchlist.map((stock, index) => ({ ...stock, key: index.toString() }))
                  } 
                  pagination={{ pageSize: 5 }}
                  size="middle"
                  loading={loading.search}
                  rowKey="symbol"
                />
              </Card>
            )}

            {error.search && <Alert message={error.search} type="error" showIcon style={{ marginTop: 16 }} />}
          </motion.div>
        </Col>

        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
                  <span>Trending Stocks</span>
                </div>
              }
              bordered={false}
              style={{ 
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              {loading.watchlist ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Spin />
                </div>
              ) : (
                <div>
                  {trendingStocks.map((stock, index) => renderTrendingCard(stock, index))}
                  <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link href="/stocks">
                      <Button type="primary">Discover More Stocks</Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>

            <Card 
              title="Market News"
              bordered={false}
              style={{ 
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                marginTop: 24
              }}
            >
              <Paragraph>
                <Text strong>Market Insights:</Text> Stay updated with the latest market trends and news.
              </Paragraph>
              <Button type="primary" ghost style={{ width: '100%' }}>
                Coming Soon
              </Button>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
