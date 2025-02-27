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
  Divider,
  Tabs,
  Tag,
  List
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  StarOutlined, 
  StarFilled,
  LineChartOutlined,
  BarChartOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import AppLayout from '@/components/layout/AppLayout';
import StockChart from '@/components/charts/StockChart';
import { getStockQuote, getTechnicalIndicators } from '@/services/stockApi';
import { StockData, StockHistoricalData } from '@/types/stock';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params.symbol as string;
  
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [inWatchlist, setInWatchlist] = useState<boolean>(false);
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
  
  // We're not using technicalData directly, only passing it to generateSignals
  const [, setTechnicalData] = useState<TechnicalData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("chart");
  
  // Technical analysis signals
  const [signals, setSignals] = useState<{
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: 'strong' | 'moderate' | 'weak';
    support: number | null;
    resistance: number | null;
    signals: string[];
    rsi: number | null;
    macd: {
      value: number | null;
      signal: number | null;
      histogram: number | null;
    };
  }>({
    trend: 'neutral',
    strength: 'moderate',
    support: null,
    resistance: null,
    signals: [],
    rsi: null,
    macd: {
      value: null,
      signal: null,
      histogram: null
    }
  });

  // Generate technical analysis signals based on indicators
  const generateSignals = React.useCallback((data: TechnicalData) => {
    if (!data || !data.historicalData || data.historicalData.length === 0) return;
    
    const signals: string[] = [];
    let trendDirection: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let trendStrength: 'strong' | 'moderate' | 'weak' = 'moderate';
    let support: number | null = null;
    let resistance: number | null = null;
    let lastRsi: number | null = null;
    let lastMacd: number | null = null;
    let lastSignal: number | null = null;
    let lastHistogram: number | null = null;
    
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
      lastRsi = data.rsi[lastIndex];
      if (lastRsi !== null && !isNaN(lastRsi)) {
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
      lastMacd = data.macd.macd[lastIndex];
      lastSignal = data.macd.signal[lastIndex];
      lastHistogram = data.macd.histogram[lastIndex];
      
      if (lastMacd !== null && lastSignal !== null && !isNaN(lastMacd) && !isNaN(lastSignal)) {
        // MACD crosses
        if (lastMacd > lastSignal && data.macd.macd[lastIndex - 1] <= data.macd.signal[lastIndex - 1]) {
          signals.push("MACD crossed above signal line, suggesting bullish momentum");
          if (trendDirection === 'bullish') trendStrength = 'moderate';
        } else if (lastMacd < lastSignal && data.macd.macd[lastIndex - 1] >= data.macd.signal[lastIndex - 1]) {
          signals.push("MACD crossed below signal line, suggesting bearish momentum");
          if (trendDirection === 'bearish') trendStrength = 'moderate';
        }
        
        // MACD histogram direction
        if (lastHistogram !== null && !isNaN(lastHistogram)) {
          if (lastHistogram > 0 && data.macd.histogram[lastIndex - 1] < 0) {
            signals.push("MACD histogram turned positive, indicating increasing bullish momentum");
          } else if (lastHistogram < 0 && data.macd.histogram[lastIndex - 1] > 0) {
            signals.push("MACD histogram turned negative, indicating increasing bearish momentum");
          }
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
      signals,
      rsi: lastRsi,
      macd: {
        value: lastMacd,
        signal: lastSignal,
        histogram: lastHistogram
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch stock quote
        const data = await getStockQuote(symbol);
        setStockData(data);
        
        // Fetch technical indicators
        const technicalData = await getTechnicalIndicators(
          symbol, 
          '1y', // Default to 1 year for technical analysis
          '1d'  // Daily interval
        );
        
        setTechnicalData(technicalData);
        
        // Generate technical analysis signals
        generateSignals(technicalData);
        
        // Check if stock is in watchlist
        const { isInWatchlist } = await import('@/services/storageService');
        setInWatchlist(isInWatchlist(symbol));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchData();
    }
  }, [symbol, generateSignals]);

  const toggleWatchlist = async () => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { addToWatchlist, removeFromWatchlist } = await import('@/services/storageService');
      
      if (inWatchlist) {
        removeFromWatchlist(symbol);
      } else {
        addToWatchlist(symbol);
      }
      
      // Update state
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    }
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

  // Get trend tag color
  const getTrendColor = () => {
    if (signals.trend === 'bullish') return '#52c41a';
    if (signals.trend === 'bearish') return '#f5222d';
    return '#faad14';
  };

  // Get strength tag color
  const getStrengthColor = () => {
    if (signals.strength === 'strong') return '#722ed1';
    if (signals.strength === 'moderate') return '#1890ff';
    return '#faad14';
  };

  // Get RSI status
  const getRsiStatus = () => {
    if (!signals.rsi) return { text: 'Neutral', color: '#faad14' };
    if (signals.rsi > 70) return { text: 'Overbought', color: '#f5222d' };
    if (signals.rsi < 30) return { text: 'Oversold', color: '#52c41a' };
    return { text: 'Neutral', color: '#faad14' };
  };

  // Get MACD status
  const getMacdStatus = () => {
    if (!signals.macd.value || !signals.macd.signal) return { text: 'Neutral', color: '#faad14' };
    if (signals.macd.value > signals.macd.signal) return { text: 'Bullish', color: '#52c41a' };
    return { text: 'Bearish', color: '#f5222d' };
  };

  // Render technical analysis summary
  const renderTechnicalSummary = () => {
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <LineChartOutlined style={{ marginRight: 8 }} />
            <span>Technical Analysis Summary</span>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Trend" 
                value={signals.trend.charAt(0).toUpperCase() + signals.trend.slice(1)} 
                valueStyle={{ color: getTrendColor() }}
                prefix={signals.trend === 'bullish' ? <ArrowUpOutlined /> : signals.trend === 'bearish' ? <ArrowDownOutlined /> : <InfoCircleOutlined />}
              />
              <Tag color={getStrengthColor()} style={{ marginTop: 8 }}>
                {signals.strength.charAt(0).toUpperCase() + signals.strength.slice(1)}
              </Tag>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Support" 
                value={signals.support ? `$${signals.support.toFixed(2)}` : 'N/A'} 
                valueStyle={{ color: '#52c41a' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                Key level where price tends to find buying interest
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <Statistic 
                title="Resistance" 
                value={signals.resistance ? `$${signals.resistance.toFixed(2)}` : 'N/A'} 
                valueStyle={{ color: '#f5222d' }}
              />
              <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                Key level where price tends to find selling pressure
              </div>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>RSI (14)</Text>
                <Tag color={getRsiStatus().color}>{getRsiStatus().text}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 20 }}>{signals.rsi ? signals.rsi.toFixed(2) : 'N/A'}</Text>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                Relative Strength Index measures momentum on a scale of 0 to 100
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card size="small" bordered={false} style={{ background: '#f9f9f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>MACD</Text>
                <Tag color={getMacdStatus().color}>{getMacdStatus().text}</Tag>
              </div>
              <div style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 20 }}>
                  {signals.macd.value ? signals.macd.value.toFixed(2) : 'N/A'} / {signals.macd.signal ? signals.macd.signal.toFixed(2) : 'N/A'}
                </Text>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(0, 0, 0, 0.45)' }}>
                Moving Average Convergence Divergence (MACD / Signal)
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    );
  };

  // Render trading signals
  const renderTradingSignals = () => {
    return (
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            <span>Trading Signals</span>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <List
          itemLayout="horizontal"
          dataSource={signals.signals}
          renderItem={(item, index) => {
            // Determine icon based on signal content
            let icon = <InfoCircleOutlined style={{ color: '#1890ff' }} />;
            if (item.toLowerCase().includes('bullish') || item.toLowerCase().includes('positive')) {
              icon = <CheckCircleOutlined style={{ color: '#52c41a' }} />;
            } else if (item.toLowerCase().includes('bearish') || item.toLowerCase().includes('negative')) {
              icon = <CloseCircleOutlined style={{ color: '#f5222d' }} />;
            } else if (item.toLowerCase().includes('overbought') || item.toLowerCase().includes('oversold')) {
              icon = <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
            }
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <List.Item>
                  <List.Item.Meta
                    avatar={icon}
                    title={item}
                    description={
                      <div style={{ fontSize: 12, color: 'rgba(0, 0, 0, 0.45)', marginTop: 4 }}>
                        Based on technical analysis as of {new Date().toLocaleDateString()}
                      </div>
                    }
                  />
                </List.Item>
              </motion.div>
            );
          }}
        />
      </Card>
    );
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

          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            type="card"
            style={{ marginBottom: 16 }}
          >
            <TabPane 
              tab={
                <span>
                  <LineChartOutlined />
                  Chart
                </span>
              } 
              key="chart"
            >
              <StockChart 
                symbol={symbol} 
                name={stockData.name} 
                price={stockData.price}
                change={stockData.change}
                changePercent={stockData.changePercent}
              />
            </TabPane>
            <TabPane 
              tab={
                <span>
                  <InfoCircleOutlined />
                  Technical Analysis
                </span>
              } 
              key="technical"
            >
              {renderTechnicalSummary()}
              {renderTradingSignals()}
            </TabPane>
            <TabPane 
              tab={
                <span>
                  <BarChartOutlined />
                  Fundamentals
                </span>
              } 
              key="fundamentals"
            >
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
            </TabPane>
          </Tabs>
        </div>
      )}
    </AppLayout>
  );
}
