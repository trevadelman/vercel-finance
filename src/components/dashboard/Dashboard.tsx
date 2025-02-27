import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Table, Input, Button, Spin, Alert } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { StockData, MarketIndices } from '@/types/stock';
import { getMarketIndices, getWatchlist, searchStocks } from '@/services/stockApi';

const { Title } = Typography;

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
      render: (text) => <strong>{text}</strong>,
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
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change) => (
        <span style={{ color: change >= 0 ? '#3f8600' : '#cf1322' }}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Change %',
      dataIndex: 'changePercent',
      key: 'changePercent',
      render: (changePercent) => (
        <span style={{ color: changePercent >= 0 ? '#3f8600' : '#cf1322' }}>
          {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" size="small">
          Details
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>Market Overview</Title>
      
      {loading.market ? (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin size="large" />
        </div>
      ) : error.market ? (
        <Alert message={error.market} type="error" showIcon />
      ) : marketData && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="S&P 500"
                value={marketData.sp500.value}
                precision={2}
                valueStyle={{ color: marketData.sp500.change >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={marketData.sp500.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`${marketData.sp500.change >= 0 ? '+' : ''}${marketData.sp500.changePercent.toFixed(2)}%`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Dow Jones"
                value={marketData.dowJones.value}
                precision={2}
                valueStyle={{ color: marketData.dowJones.change >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={marketData.dowJones.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`${marketData.dowJones.change >= 0 ? '+' : ''}${marketData.dowJones.changePercent.toFixed(2)}%`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Nasdaq"
                value={marketData.nasdaq.value}
                precision={2}
                valueStyle={{ color: marketData.nasdaq.change >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={marketData.nasdaq.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`${marketData.nasdaq.change >= 0 ? '+' : ''}${marketData.nasdaq.changePercent.toFixed(2)}%`}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Statistic
                title="Russell 2000"
                value={marketData.russell2000.value}
                precision={2}
                valueStyle={{ color: marketData.russell2000.change >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={marketData.russell2000.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`${marketData.russell2000.change >= 0 ? '+' : ''}${marketData.russell2000.changePercent.toFixed(2)}%`}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ margin: '24px 0' }}>
        <Title level={3}>Watchlist</Title>
        <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Search stocks..." 
            prefix={<SearchOutlined />} 
            style={{ width: 300 }}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            suffix={
              <Button 
                type="primary" 
                onClick={handleSearch} 
                loading={loading.search}
                size="small"
              >
                Search
              </Button>
            }
          />
        </div>

        {error.watchlist ? (
          <Alert message={error.watchlist} type="error" showIcon />
        ) : loading.watchlist ? (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table 
            columns={columns} 
            dataSource={searchResults.length > 0 ? searchResults : watchlist.map((stock, index) => ({ ...stock, key: index.toString() }))} 
            pagination={false}
            size="middle"
            bordered
            loading={loading.search}
          />
        )}

        {error.search && <Alert message={error.search} type="error" showIcon style={{ marginTop: 16 }} />}
      </div>
    </div>
  );
};

export default Dashboard;
