"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Descriptions, 
  Button, 
  Spin, 
  Alert,
  Divider
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  StarOutlined, 
  StarFilled 
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import StockChart from '@/components/charts/StockChart';
import { getStockQuote } from '@/services/stockApi';
import { StockData } from '@/types/stock';

const { Title, Paragraph } = Typography;

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await getStockQuote(symbol);
        setStockData(data);
        
        // Check if stock is in watchlist (to be implemented with local storage or database)
        // For now, just a placeholder
        setInWatchlist(false);
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to load stock data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchStockData();
    }
  }, [symbol]);

  const toggleWatchlist = () => {
    // To be implemented with local storage or database
    setInWatchlist(!inWatchlist);
  };

  const formatLargeNumber = (num: number | undefined) => {
    if (num === undefined) return 'N/A';
    
    if (num >= 1000000000000) {
      return `$${(num / 1000000000000).toFixed(2)}T`;
    } else if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else {
      return `$${num.toLocaleString()}`;
    }
  };

  return (
    <AppLayout>
      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : stockData && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={2} style={{ marginBottom: 0 }}>{stockData.symbol}</Title>
              <Paragraph>{stockData.name}</Paragraph>
            </div>
            <Button 
              type={inWatchlist ? "primary" : "default"}
              icon={inWatchlist ? <StarFilled /> : <StarOutlined />}
              onClick={toggleWatchlist}
            >
              {inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            </Button>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Price"
                  value={stockData.price}
                  precision={2}
                  prefix="$"
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Change"
                  value={stockData.change}
                  precision={2}
                  valueStyle={{ color: stockData.change >= 0 ? '#3f8600' : '#cf1322' }}
                  prefix={stockData.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  suffix={`(${stockData.changePercent.toFixed(2)}%)`}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Statistic
                  title="Volume"
                  value={stockData.volume}
                  formatter={(value) => value?.toLocaleString()}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <StockChart symbol={symbol} name={stockData.name} />

          <Divider />

          <Card title="Company Information">
            <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
              <Descriptions.Item label="Market Cap">
                {formatLargeNumber(stockData.marketCap)}
              </Descriptions.Item>
              <Descriptions.Item label="P/E Ratio">
                {stockData.pe?.toFixed(2) || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Dividend Yield">
                {stockData.dividend ? `${(stockData.dividend * 100).toFixed(2)}%` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Sector">
                {stockData.sector || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="52 Week High">
                N/A
              </Descriptions.Item>
              <Descriptions.Item label="52 Week Low">
                N/A
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
