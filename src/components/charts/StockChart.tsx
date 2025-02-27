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
  Legend
} from 'recharts';
import { Card, Radio, Spin, Alert, Typography } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import { StockHistoricalData } from '@/types/stock';
import { getStockHistory } from '@/services/stockApi';

const { Title } = Typography;

interface StockChartProps {
  symbol: string;
  name?: string;
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

const StockChart: React.FC<StockChartProps> = ({ symbol, name }) => {
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(periodOptions[2]); // Default to 1M
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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

  // Custom tooltip component
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0 }}><strong>{label ? formatDate(label) : ''}</strong></p>
          <p style={{ margin: 0, color: '#1677ff' }}>
            Open: {formatPrice(payload[0].payload.open)}
          </p>
          <p style={{ margin: 0, color: '#52c41a' }}>
            High: {formatPrice(payload[0].payload.high)}
          </p>
          <p style={{ margin: 0, color: '#f5222d' }}>
            Low: {formatPrice(payload[0].payload.low)}
          </p>
          <p style={{ margin: 0, color: '#722ed1' }}>
            Close: {formatPrice(payload[0].payload.close)}
          </p>
          <p style={{ margin: 0 }}>
            Volume: {payload[0].payload.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {name || symbol} Price Chart
          </Title>
          <Radio.Group 
            value={selectedPeriod.value} 
            onChange={handlePeriodChange}
            optionType="button"
            buttonStyle="solid"
            size="small"
          >
            {periodOptions.map(option => (
              <Radio.Button key={option.value} value={option.value}>
                {option.label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      }
    >
      {loading ? (
        <div style={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert message={error} type="error" showIcon />
      ) : (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
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
              />
              <YAxis 
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke="#8884d8" 
                name="Price" 
                dot={false}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default StockChart;
