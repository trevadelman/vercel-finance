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
  ReferenceLine,
  Legend,
  ComposedChart,
  Bar
} from 'recharts';
import { 
  Card, 
  Radio, 
  Spin, 
  Alert, 
  Typography, 
  Statistic, 
  Row, 
  Col, 
  Divider, 
  Space, 
  Checkbox,
  Tooltip as AntTooltip
} from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import type { StatisticProps } from 'antd/es/statistic';
import { StockHistoricalData } from '@/types/stock';

// Define interface for technical indicators data
interface TechnicalData {
  historicalData: StockHistoricalData[];
  sma20?: number[];
  sma50?: number[];
  sma200?: number[];
  ema12?: number[];
  ema26?: number[];
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollinger?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
}
import { getTechnicalIndicators } from '@/services/stockApi';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined
} from '@ant-design/icons';

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
    payload: StockHistoricalData & Record<string, unknown>;
    value: number;
    name: string;
    color: string;
  }>;
  label?: string;
}

// Technical indicator types
type IndicatorType = 'sma' | 'ema' | 'bollinger' | 'rsi' | 'macd' | 'volume';

interface IndicatorOption {
  key: IndicatorType;
  label: string;
  description: string;
  color?: string;
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

const indicatorOptions: IndicatorOption[] = [
  { 
    key: 'sma', 
    label: 'Moving Averages', 
    description: 'Simple Moving Averages (SMA) help identify trend direction by smoothing price data.'
  },
  { 
    key: 'ema', 
    label: 'Exponential MAs', 
    description: 'Exponential Moving Averages (EMA) give more weight to recent prices, making them more responsive to new information.'
  },
  { 
    key: 'bollinger', 
    label: 'Bollinger Bands', 
    description: 'Bollinger Bands measure volatility by placing bands above and below a moving average, helping identify overbought/oversold conditions.'
  },
  { 
    key: 'rsi', 
    label: 'RSI', 
    description: 'Relative Strength Index (RSI) measures the speed and change of price movements, indicating overbought (>70) or oversold (<30) conditions.'
  },
  { 
    key: 'macd', 
    label: 'MACD', 
    description: 'Moving Average Convergence Divergence (MACD) shows the relationship between two moving averages, helping identify momentum shifts.'
  },
  { 
    key: 'volume', 
    label: 'Volume', 
    description: 'Trading volume can confirm price movements and signal potential reversals when diverging from price.'
  },
];

const StockChart: React.FC<StockChartProps> = ({ symbol, name, price, change = 0, changePercent = 0 }) => {
  const [historicalData, setHistoricalData] = useState<StockHistoricalData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(periodOptions[5]); // Default to 1Y for technical analysis
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'area' | 'candle'>('area');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [selectedIndicators, setSelectedIndicators] = useState<IndicatorType[]>(['sma']);
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null);
  const [showVolume, setShowVolume] = useState<boolean>(false);

  // Technical analysis signals
  const [signals, setSignals] = useState<{
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: 'strong' | 'moderate' | 'weak';
    support: number | null;
    resistance: number | null;
    signals: string[];
  }>({
    trend: 'neutral',
    strength: 'moderate',
    support: null,
    resistance: null,
    signals: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch technical indicators (includes historical data)
        const data = await getTechnicalIndicators(
          symbol, 
          selectedPeriod.value, 
          selectedPeriod.interval
        );
        
        if (!data.historicalData || data.historicalData.length === 0) {
          setError('No historical data available for this period');
          return;
        }
        
        setHistoricalData(data.historicalData);
        setTechnicalData(data);
        
        // Calculate price range for chart
        const prices = data.historicalData.map((item: StockHistoricalData) => item.close);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const padding = (max - min) * 0.1; // Add 10% padding
        setPriceRange({ 
          min: Math.max(0, min - padding), 
          max: max + padding 
        });
        
        // Generate technical analysis signals
        generateSignals(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, selectedPeriod]);

  // Generate technical analysis signals based on indicators
  const generateSignals = (data: TechnicalData) => {
    if (!data || !data.historicalData || data.historicalData.length === 0) return;
    
    const signals: string[] = [];
    let trendDirection: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let trendStrength: 'strong' | 'moderate' | 'weak' = 'moderate';
    let support: number | null = null;
    let resistance: number | null = null;
    
    const prices = data.historicalData.map((item: StockHistoricalData) => item.close);
    const lastPrice = prices[prices.length - 1];
    const lastIndex = prices.length - 1;
    
    // SMA signals
    if (data.sma20 && data.sma50 && data.sma200) {
      const sma20 = data.sma20[lastIndex];
      const sma50 = data.sma50[lastIndex];
      const sma200 = data.sma200[lastIndex];
      
      if (!isNaN(sma20) && !isNaN(sma50) && !isNaN(sma200)) {
        // Golden Cross (SMA 50 crosses above SMA 200)
        if (data.sma50[lastIndex] > data.sma200[lastIndex] && 
            data.sma50[lastIndex - 1] <= data.sma200[lastIndex - 1]) {
          signals.push("Golden Cross: SMA 50 crossed above SMA 200, suggesting a potential bullish trend");
          trendDirection = 'bullish';
          trendStrength = 'strong';
        }
        
        // Death Cross (SMA 50 crosses below SMA 200)
        if (data.sma50[lastIndex] < data.sma200[lastIndex] && 
            data.sma50[lastIndex - 1] >= data.sma200[lastIndex - 1]) {
          signals.push("Death Cross: SMA 50 crossed below SMA 200, suggesting a potential bearish trend");
          trendDirection = 'bearish';
          trendStrength = 'strong';
        }
        
        // Price above/below moving averages
        if (lastPrice > sma20 && lastPrice > sma50 && lastPrice > sma200) {
          signals.push("Price is above all major moving averages (20, 50, 200), indicating bullish momentum");
          trendDirection = 'bullish';
        } else if (lastPrice < sma20 && lastPrice < sma50 && lastPrice < sma200) {
          signals.push("Price is below all major moving averages (20, 50, 200), indicating bearish momentum");
          trendDirection = 'bearish';
        }
        
        // Moving average alignment
        if (sma20 > sma50 && sma50 > sma200) {
          signals.push("Moving averages are aligned bullishly (20 > 50 > 200)");
          if (trendDirection === 'bullish') trendStrength = 'strong';
        } else if (sma20 < sma50 && sma50 < sma200) {
          signals.push("Moving averages are aligned bearishly (20 < 50 < 200)");
          if (trendDirection === 'bearish') trendStrength = 'strong';
        }
        
        // Support and resistance levels
        support = Math.min(sma20, sma50, sma200);
        resistance = Math.max(sma20, sma50, sma200);
      }
    }
    
    // RSI signals
    if (data.rsi) {
      const lastRsi = data.rsi[lastIndex];
      if (!isNaN(lastRsi)) {
        if (lastRsi > 70) {
          signals.push(`RSI is overbought at ${lastRsi.toFixed(2)}, suggesting potential reversal or consolidation`);
          if (trendDirection === 'bullish') trendStrength = 'weak';
        } else if (lastRsi < 30) {
          signals.push(`RSI is oversold at ${lastRsi.toFixed(2)}, suggesting potential reversal or bounce`);
          if (trendDirection === 'bearish') trendStrength = 'weak';
        }
      }
    }
    
    // MACD signals
    if (data.macd) {
      const lastMacd = data.macd.macd[lastIndex];
      const lastSignal = data.macd.signal[lastIndex];
      const lastHistogram = data.macd.histogram[lastIndex];
      
      if (!isNaN(lastMacd) && !isNaN(lastSignal)) {
        // MACD crosses
        if (lastMacd > lastSignal && data.macd.macd[lastIndex - 1] <= data.macd.signal[lastIndex - 1]) {
          signals.push("MACD crossed above signal line, suggesting bullish momentum");
          if (trendDirection === 'bullish') trendStrength = 'moderate';
        } else if (lastMacd < lastSignal && data.macd.macd[lastIndex - 1] >= data.macd.signal[lastIndex - 1]) {
          signals.push("MACD crossed below signal line, suggesting bearish momentum");
          if (trendDirection === 'bearish') trendStrength = 'moderate';
        }
        
        // MACD histogram direction
        if (lastHistogram > 0 && data.macd.histogram[lastIndex - 1] < 0) {
          signals.push("MACD histogram turned positive, indicating increasing bullish momentum");
        } else if (lastHistogram < 0 && data.macd.histogram[lastIndex - 1] > 0) {
          signals.push("MACD histogram turned negative, indicating increasing bearish momentum");
        }
      }
    }
    
    // Bollinger Bands signals
    if (data.bollinger) {
      const lastUpper = data.bollinger.upper[lastIndex];
      const lastLower = data.bollinger.lower[lastIndex];
      const lastMiddle = data.bollinger.middle[lastIndex];
      
      if (!isNaN(lastUpper) && !isNaN(lastLower)) {
        if (lastPrice > lastUpper) {
          signals.push("Price is above the upper Bollinger Band, indicating potential overbought conditions");
          if (trendDirection === 'bullish') trendStrength = 'weak';
        } else if (lastPrice < lastLower) {
          signals.push("Price is below the lower Bollinger Band, indicating potential oversold conditions");
          if (trendDirection === 'bearish') trendStrength = 'weak';
        }
        
        // Bollinger Band squeeze (volatility contraction)
        const bandWidth = (lastUpper - lastLower) / lastMiddle;
        const prevBandWidth = (data.bollinger.upper[lastIndex - 20] - data.bollinger.lower[lastIndex - 20]) / data.bollinger.middle[lastIndex - 20];
        
        if (bandWidth < prevBandWidth * 0.7) {
          signals.push("Bollinger Bands are squeezing, suggesting a potential volatility expansion and breakout");
        }
      }
    }
    
    // If no signals were generated, add a default one
    if (signals.length === 0) {
      signals.push("No clear technical signals at this time. The market appears to be in consolidation.");
      trendDirection = 'neutral';
      trendStrength = 'weak';
    }
    
    setSignals({
      trend: trendDirection,
      strength: trendStrength,
      support,
      resistance,
      signals
    });
  };

  const handlePeriodChange = (e: RadioChangeEvent) => {
    const period = periodOptions.find(option => option.value === e.target.value);
    if (period) {
      setSelectedPeriod(period);
    }
  };

  const handleIndicatorChange = (type: IndicatorType, checked: boolean) => {
    if (checked) {
      setSelectedIndicators(prev => [...prev, type]);
    } else {
      setSelectedIndicators(prev => prev.filter(item => item !== type));
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
          
          {/* Technical indicators in tooltip */}
          {payload.length > 1 && (
            <>
              <Divider style={{ margin: '8px 0' }} />
              <div style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 4 }}>Indicators</div>
              {payload.slice(1).map((entry, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: entry.color }}>{entry.name}:</span>
                  <span style={{ fontWeight: 'bold' }}>
                    {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                  </span>
                </div>
              ))}
            </>
          )}
          
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

  // Prepare chart data with indicators
  const prepareChartData = () => {
    if (!historicalData.length || !technicalData) return historicalData;
    
    return historicalData.map((item, index) => {
      const enhancedData: Record<string, unknown> = { ...item };
      
      // Add SMA indicators
      if (selectedIndicators.includes('sma') && technicalData.sma20 && technicalData.sma50 && technicalData.sma200) {
        enhancedData.sma20 = technicalData.sma20[index];
        enhancedData.sma50 = technicalData.sma50[index];
        enhancedData.sma200 = technicalData.sma200[index];
      }
      
      // Add EMA indicators
      if (selectedIndicators.includes('ema') && technicalData.ema12 && technicalData.ema26) {
        enhancedData.ema12 = technicalData.ema12[index];
        enhancedData.ema26 = technicalData.ema26[index];
      }
      
      // Add Bollinger Bands
      if (selectedIndicators.includes('bollinger') && technicalData.bollinger) {
        enhancedData.bollingerUpper = technicalData.bollinger.upper[index];
        enhancedData.bollingerMiddle = technicalData.bollinger.middle[index];
        enhancedData.bollingerLower = technicalData.bollinger.lower[index];
      }
      
      // Add RSI
      if (selectedIndicators.includes('rsi') && technicalData.rsi) {
        enhancedData.rsi = technicalData.rsi[index];
      }
      
      // Add MACD
      if (selectedIndicators.includes('macd') && technicalData.macd) {
        enhancedData.macd = technicalData.macd.macd[index];
        enhancedData.macdSignal = technicalData.macd.signal[index];
        enhancedData.macdHistogram = technicalData.macd.histogram[index];
      }
      
      return enhancedData;
    });
  };

  // Render the main price chart
  const renderPriceChart = () => {
    const chartData = prepareChartData();
    
    return (
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
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
              yAxisId="price"
            />
            {showVolume && (
              <YAxis 
                dataKey="volume"
                orientation="right"
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                stroke="#bfbfbf"
                width={60}
                yAxisId="volume"
              />
            )}
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Price Line/Area */}
            {chartType === 'area' ? (
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke={getChartColor()} 
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Price"
                activeDot={{ r: 8, strokeWidth: 0 }}
                strokeWidth={2}
                yAxisId="price"
              />
            ) : (
              <Line 
                type="monotone" 
                dataKey="close" 
                stroke={getChartColor()} 
                name="Price" 
                dot={false}
                activeDot={{ r: 8 }}
                strokeWidth={2}
                yAxisId="price"
              />
            )}
            
            {/* Volume Bars */}
            {showVolume && (
              <Bar 
                dataKey="volume" 
                fill="#8884d8" 
                opacity={0.5} 
                name="Volume"
                yAxisId="volume"
              />
            )}
            
            {/* SMA Lines */}
            {selectedIndicators.includes('sma') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="sma20" 
                  stroke="#ff7300" 
                  dot={false} 
                  name="SMA 20"
                  strokeWidth={1.5}
                  yAxisId="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="sma50" 
                  stroke="#387908" 
                  dot={false} 
                  name="SMA 50"
                  strokeWidth={1.5}
                  yAxisId="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="sma200" 
                  stroke="#8884d8" 
                  dot={false} 
                  name="SMA 200"
                  strokeWidth={1.5}
                  yAxisId="price"
                />
              </>
            )}
            
            {/* EMA Lines */}
            {selectedIndicators.includes('ema') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="ema12" 
                  stroke="#ff4500" 
                  dot={false} 
                  name="EMA 12"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  yAxisId="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="ema26" 
                  stroke="#2196f3" 
                  dot={false} 
                  name="EMA 26"
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                  yAxisId="price"
                />
              </>
            )}
            
            {/* Bollinger Bands */}
            {selectedIndicators.includes('bollinger') && (
              <>
                <Line 
                  type="monotone" 
                  dataKey="bollingerUpper" 
                  stroke="#ff7300" 
                  dot={false} 
                  name="Upper Band"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  yAxisId="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerMiddle" 
                  stroke="#ff7300" 
                  dot={false} 
                  name="Middle Band"
                  strokeWidth={1}
                  yAxisId="price"
                />
                <Line 
                  type="monotone" 
                  dataKey="bollingerLower" 
                  stroke="#ff7300" 
                  dot={false} 
                  name="Lower Band"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  yAxisId="price"
                />
              </>
            )}
            
            {/* Reference Lines for Support/Resistance */}
            {signals.support && (
              <ReferenceLine 
                y={signals.support} 
                stroke="#52c41a" 
                strokeDasharray="3 3" 
                label={{ value: 'Support', position: 'insideBottomRight' }}
                yAxisId="price"
              />
            )}
            {signals.resistance && (
              <ReferenceLine 
                y={signals.resistance} 
                stroke="#f5222d" 
                strokeDasharray="3 3" 
                label={{ value: 'Resistance', position: 'insideTopRight' }}
                yAxisId="price"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render the RSI chart
  const renderRsiChart = () => {
    if (!technicalData || !technicalData.rsi) return null;
    
    const chartData = historicalData.map((item, index) => ({
      date: item.date,
      rsi: technicalData.rsi![index]
    }));
    
    return (
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              stroke="#bfbfbf"
            />
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => value.toFixed(0)}
              stroke="#bfbfbf"
              ticks={[0, 30, 50, 70, 100]}
            />
            <Tooltip />
            <ReferenceLine y={70} stroke="#f5222d" strokeDasharray="3 3" />
            <ReferenceLine y={30} stroke="#52c41a" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="rsi" 
              stroke="#8884d8" 
              dot={false}
              name="RSI"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render the MACD chart
  const renderMacdChart = () => {
    if (!technicalData || !technicalData.macd) return null;
    
    const chartData = historicalData.map((item, index) => ({
      date: item.date,
      macd: technicalData.macd!.macd[index],
      signal: technicalData.macd!.signal[index],
      histogram: technicalData.macd!.histogram[index]
    }));
    
    return (
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => {
                return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              stroke="#bfbfbf"
            />
            <YAxis 
              stroke="#bfbfbf"
            />
            <Tooltip />
            <ReferenceLine y={0} stroke="#000" strokeDasharray="3 3" />
            <Line 
              type="monotone" 
              dataKey="macd" 
              stroke="#1890ff" 
              dot={false}
              name="MACD"
            />
            <Line 
              type="monotone" 
              dataKey="signal" 
              stroke="#ff7300" 
              dot={false}
              name="Signal"
            />
            <Bar 
              dataKey="histogram" 
              fill="#8884d8"
              name="Histogram"
              // Use different colors for positive and negative values
              // We'll handle this with CSS since the dynamic function isn't working
              fillOpacity={0.7}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
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
        <>
          {renderPriceChart()}
          
          <Divider style={{ margin: '24px 0 16px' }} />
          
          <div style={{ marginBottom: 16 }}>
            <Space wrap>
              {indicatorOptions.map(option => (
                <AntTooltip key={option.key} title={option.description}>
                  <Checkbox
                    checked={selectedIndicators.includes(option.key)}
                    onChange={(e) => handleIndicatorChange(option.key, e.target.checked)}
                  >
                    {option.label}
                  </Checkbox>
                </AntTooltip>
              ))}
              <Checkbox
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
              >
                Show Volume
              </Checkbox>
            </Space>
          </div>
          
          {selectedIndicators.includes('rsi') && (
            <>
              <Divider orientation="left">RSI (14)</Divider>
              {renderRsiChart()}
            </>
          )}
          
          {selectedIndicators.includes('macd') && (
            <>
              <Divider orientation="left">MACD (12, 26, 9)</Divider>
              {renderMacdChart()}
            </>
          )}
          
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
        </>
      )}
    </Card>
  );
};
export default StockChart;
