"use client";

import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { Card, Radio, Spin, Alert, Typography, Statistic, Row, Col, Divider, Space } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import type { StatisticProps } from 'antd/es/statistic';
import { StockHistoricalData } from '@/types/stock';
import { getStockHistory } from '@/services/stockApi';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface StockChartProps {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

type PeriodOption = {
  label: string;
  value: string;
  interval: string;
};

// Define tooltip props interface
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: StockHistoricalData;
    value: number;
    name: string;
  }>;
  label?: string;
}

const periodOptions: PeriodOption[] = [
  { label: '1D', value: '1d', interval: '1d' },
  { label: '5D', value: '5d', interval: '1d' },
  { label: '1M', value: '1mo', interval: '1d' },
  { label: '3M', value: '3mo', interval: '1d' },
  { label: '6M', value: '6mo', interval: '1wk' },
  { label: '1Y', value: '1y', interval: '1wk' },
  { label: '5Y', value: '5y', interval: '1mo' },
  { label: 'YTD', value: 'ytd', interval: '1wk' },
];

const StockChart: React.FC<StockChartProps> = ({ symbol, name, price, change = 0, changePercent = 0 }) => {
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(periodOptions[2]); // Default to 1M
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

  useEffect(() => {
    const fetchHistoricalData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const data = await getStockHistory(
          symbol, 
          selectedPeriod.value, 
          selectedPeriod.interval
        );
        
        if (data.length === 0) {
          setError('No historical data available for this period');
        } else {
          setHistoricalData(data);
          
          // Calculate price range for chart
          const prices = data.map(item => item.close);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const padding = (max - min) * 0.1; // Add 10% padding
          setPriceRange({ 
            min: Math.max(0, min - padding), 
            max: max + padding 
          });
        }
      } catch (err) {
        console.error('Error fetching historical data:', err);
        setError('Failed to load historical data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [symbol, selectedPeriod]);

  const handlePeriodChange = (e: RadioChangeEvent) => {
    const period = periodOptions.find(option => option.value === e.target.value);
    if (period) {
      setSelectedPeriod(period);
    }
  };

  // Format the date for display in the tooltip
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format the price for display in the tooltip
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Get chart color based on price trend
  const getChartColor = () => {
    if (historicalData.length < 2) return '#1677ff';
    
    const firstPrice = historicalData[0].close;
    const lastPrice = historicalData[historicalData.length - 1].close;
    
    return lastPrice >= firstPrice ? '#52c41a' : '#f5222d';
  };

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const priceChange = data.close - data.open;
      const priceChangePercent = (priceChange / data.open) * 100;
      
      return (
        <Card 
          size="small" 
          style={{ 
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)',
            border: 'none',
            width: 220
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <Text strong>{label ? formatDate(label) : ''}</Text>
          </div>
          
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>Open</div>
              <div style={{ fontWeight: 'bold' }}>{formatPrice(data.open)}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>Close</div>
              <div style={{ fontWeight: 'bold' }}>{formatPrice(data.close)}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>High</div>
              <div style={{ fontWeight: 'bold', color: '#52c41a' }}>{formatPrice(data.high)}</div>
            </Col>
            <Col span={12}>
              <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>Low</div>
              <div style={{ fontWeight: 'bold', color: '#f5222d' }}>{formatPrice(data.low)}</div>
            </Col>
          </Row>
          
          <Divider style={{ margin: '8px 0' }} />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '4px 8px',
            borderRadius: 4,
            background: priceChange >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(245, 34, 45, 0.1)',
            color: priceChange >= 0 ? '#52c41a' : '#f5222d',
            width: 'fit-content'
          }}>
            {priceChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            <span style={{ marginLeft: 4 }}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
          
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
            Volume: {data.volume.toLocaleString()}
          </div>
        </Card>
      );
    }
    return null;
  };

  // Volume formatter for Statistic component
  const volumeFormatter: StatisticProps['formatter'] = (value) => {
    if (typeof value === 'number') {
      return Math.round(value).toLocaleString();
    }
    return '';
  };

  return (
    <Card 
      bordered={false}
      style={{ 
        borderRadius: 12,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            {name || symbol} Price Chart
          </Title>
          {price !== undefined && (
            <div style={{ marginTop: 8 }}>
              <Space align="baseline">
                <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
                  ${price.toFixed(2)}
                </Text>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: change >= 0 ? 'rgba(82, 196, 26, 0.1)' : 'rgba(245, 34, 45, 0.1)',
                  color: change >= 0 ? '#52c41a' : '#f5222d'
                }}>
                  {change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  <span style={{ marginLeft: 4 }}>
                    {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
                  </span>
                </div>
              </Space>
            </div>
          )}
        </div>
        <div>
          <Radio.Group 
            value={selectedPeriod.value} 
            onChange={handlePeriodChange}
            optionType="button"
            buttonStyle="solid"
            size="middle"
            style={{ marginBottom: 8 }}
          >
            {periodOptions.map(option => (
              <Radio.Button key={option.value} value={option.value}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Radio.Group 
              value={chartType} 
              onChange={(e) => setChartType(e.target.value)}
              optionType="button"
              buttonStyle="outline"
              size="small"
            >
              <Radio.Button value="area">Area</Radio.Button>
              <Radio.Button value="line">Line</Radio.Button>
            </Radio.Group>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart
                data={historicalData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    // Format based on selected period
                    if (selectedPeriod.value === '1d' || selectedPeriod.value === '5d') {
                      return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    } else if (selectedPeriod.value === '1mo' || selectedPeriod.value === '3mo') {
                      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else {
                      return new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }
                  }}
                  stroke="#bfbfbf"
                />
                <YAxis 
                  domain={[priceRange.min, priceRange.max]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="#bfbfbf"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="close" 
                  stroke={getChartColor()} 
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  name="Price"
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  strokeWidth={2}
                />
                {historicalData.length > 0 && (
                  <ReferenceLine 
                    y={historicalData[0].close} 
                    stroke="#8c8c8c" 
                    strokeDasharray="3 3" 
                  />
                )}
              </AreaChart>
            ) : (
              <LineChart
                data={historicalData}
                margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    // Format based on selected period
                    if (selectedPeriod.value === '1d' || selectedPeriod.value === '5d') {
                      return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    } else if (selectedPeriod.value === '1mo' || selectedPeriod.value === '3mo') {
                      return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    } else {
                      return new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                    }
                  }}
                  stroke="#bfbfbf"
                />
                <YAxis 
                  domain={[priceRange.min, priceRange.max]}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                  stroke="#bfbfbf"
                  width={60}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke={getChartColor()} 
                  name="Price" 
                  dot={false}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                {historicalData.length > 0 && (
                  <ReferenceLine 
                    y={historicalData[0].close} 
                    stroke="#8c8c8c" 
                    strokeDasharray="3 3" 
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      
      {!loading && !error && historicalData.length > 0 && (
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Open" 
                value={historicalData[0].open} 
                precision={2} 
                prefix="$"
                valueStyle={{ fontSize: 16 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="High" 
                value={Math.max(...historicalData.map(d => d.high))} 
                precision={2} 
                prefix="$"
                valueStyle={{ fontSize: 16, color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Low" 
                value={Math.min(...historicalData.map(d => d.low))} 
                precision={2} 
                prefix="$"
                valueStyle={{ fontSize: 16, color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Volume" 
                value={historicalData.reduce((sum, d) => sum + d.volume, 0) / historicalData.length} 
                precision={0}
                formatter={volumeFormatter}
                valueStyle={{ fontSize: 16 }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default StockChart;
