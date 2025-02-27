"use client";

import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { 
  Typography, 
  Table, 
  Button, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Empty, 
  Spin, 
  Alert, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  message 
} from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  LineChartOutlined 
} from '@ant-design/icons';
import Link from 'next/link';
import { getStockQuote } from '@/services/stockApi';
import { StockData } from '@/types/stock';
import { PortfolioItem } from '@/services/storageService';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<(PortfolioItem & { currentPrice?: number; currentValue?: number; gain?: number; gainPercent?: number })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);
  const [currentStock, setCurrentStock] = useState<string>('');
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [stockLoading, setStockLoading] = useState<boolean>(false);
  const [portfolioStats, setPortfolioStats] = useState({
    totalValue: 0,
    totalCost: 0,
    totalReturn: 0,
    totalReturnPercent: 0,
    dailyChange: 0,
    dailyChangePercent: 0
  });

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        // Import storage service dynamically to avoid SSR issues
        const { getPortfolio } = await import('@/services/storageService');
        const portfolioData = getPortfolio();
        
        // If portfolio is empty, return
        if (portfolioData.length === 0) {
          setPortfolio([]);
          setLoading(false);
          return;
        }
        
        // Fetch current prices for all stocks in portfolio
        const symbols = portfolioData.map(item => item.symbol);
        const stockPromises = symbols.map(symbol => getStockQuote(symbol));
        const stocksData = await Promise.all(stockPromises);
        
        // Create a map of symbol to current price
        const priceMap: Record<string, number> = {};
        stocksData.forEach(stock => {
          priceMap[stock.symbol] = stock.price;
        });
        
        // Calculate portfolio statistics
        const { getPortfolioStats } = await import('@/services/storageService');
        const stats = getPortfolioStats(priceMap);
        setPortfolioStats(stats);
        
        // Enhance portfolio data with current prices and calculations
        const enhancedPortfolio = portfolioData.map(item => {
          const currentPrice = priceMap[item.symbol] || 0;
          const currentValue = item.shares * currentPrice;
          const cost = item.shares * item.purchasePrice;
          const gain = currentValue - cost;
          const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
          
          return {
            ...item,
            currentPrice,
            currentValue,
            gain,
            gainPercent
          };
        });
        
        setPortfolio(enhancedPortfolio);
      } catch (err) {
        console.error('Error fetching portfolio:', err);
        setError('Failed to load portfolio data');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // Remove stock from portfolio
  const removeFromPortfolio = async (symbol: string) => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { removeFromPortfolio } = await import('@/services/storageService');
      removeFromPortfolio(symbol);
      
      // Update state
      setPortfolio(prev => prev.filter(item => item.symbol !== symbol));
      message.success(`${symbol} removed from portfolio`);
      
      // Recalculate portfolio statistics
      const priceMap: Record<string, number> = {};
      portfolio.forEach(item => {
        if (item.symbol !== symbol && item.currentPrice) {
          priceMap[item.symbol] = item.currentPrice;
        }
      });
      
      const { getPortfolioStats } = await import('@/services/storageService');
      const stats = getPortfolioStats(priceMap);
      setPortfolioStats(stats);
    } catch (error) {
      console.error('Error removing from portfolio:', error);
      message.error('Failed to remove from portfolio');
    }
  };

  // Add stock to portfolio
  const addToPortfolio = async (values: any) => {
    try {
      // Import storage service dynamically to avoid SSR issues
      const { addToPortfolio } = await import('@/services/storageService');
      
      const portfolioItem: PortfolioItem = {
        symbol: values.symbol.toUpperCase(),
        name: stockData?.name || values.symbol.toUpperCase(),
        shares: values.shares,
        purchasePrice: values.purchasePrice,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD')
      };
      
      addToPortfolio(portfolioItem);
      
      // Refresh portfolio
      const { getPortfolio } = await import('@/services/storageService');
      const portfolioData = getPortfolio();
      
      // Fetch current prices for all stocks in portfolio
      const symbols = portfolioData.map(item => item.symbol);
      const stockPromises = symbols.map(symbol => getStockQuote(symbol));
      const stocksData = await Promise.all(stockPromises);
      
      // Create a map of symbol to current price
      const priceMap: Record<string, number> = {};
      stocksData.forEach(stock => {
        priceMap[stock.symbol] = stock.price;
      });
      
      // Calculate portfolio statistics
      const { getPortfolioStats } = await import('@/services/storageService');
      const stats = getPortfolioStats(priceMap);
      setPortfolioStats(stats);
      
      // Enhance portfolio data with current prices and calculations
      const enhancedPortfolio = portfolioData.map(item => {
        const currentPrice = priceMap[item.symbol] || 0;
        const currentValue = item.shares * currentPrice;
        const cost = item.shares * item.purchasePrice;
        const gain = currentValue - cost;
        const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
        
        return {
          ...item,
          currentPrice,
          currentValue,
          gain,
          gainPercent
        };
      });
      
      setPortfolio(enhancedPortfolio);
      
      // Close modal and reset form
      setAddModalVisible(false);
      form.resetFields();
      setStockData(null);
      
      message.success(`${portfolioItem.symbol} added to portfolio`);
    } catch (error) {
      console.error('Error adding to portfolio:', error);
      message.error('Failed to add to portfolio');
    }
  };

  // Edit portfolio item
  const editPortfolioItem = async (values: any) => {
    try {
      if (!editingItem) return;
      
      // Import storage service dynamically to avoid SSR issues
      const { updatePortfolioItem } = await import('@/services/storageService');
      
      const updates: Partial<PortfolioItem> = {
        shares: values.shares,
        purchasePrice: values.purchasePrice,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD')
      };
      
      updatePortfolioItem(editingItem.symbol, updates);
      
      // Refresh portfolio
      const { getPortfolio } = await import('@/services/storageService');
      const portfolioData = getPortfolio();
      
      // Fetch current prices for all stocks in portfolio
      const symbols = portfolioData.map(item => item.symbol);
      const stockPromises = symbols.map(symbol => getStockQuote(symbol));
      const stocksData = await Promise.all(stockPromises);
      
      // Create a map of symbol to current price
      const priceMap: Record<string, number> = {};
      stocksData.forEach(stock => {
        priceMap[stock.symbol] = stock.price;
      });
      
      // Calculate portfolio statistics
      const { getPortfolioStats } = await import('@/services/storageService');
      const stats = getPortfolioStats(priceMap);
      setPortfolioStats(stats);
      
      // Enhance portfolio data with current prices and calculations
      const enhancedPortfolio = portfolioData.map(item => {
        const currentPrice = priceMap[item.symbol] || 0;
        const currentValue = item.shares * currentPrice;
        const cost = item.shares * item.purchasePrice;
        const gain = currentValue - cost;
        const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
        
        return {
          ...item,
          currentPrice,
          currentValue,
          gain,
          gainPercent
        };
      });
      
      setPortfolio(enhancedPortfolio);
      
      // Close modal and reset form
      setEditModalVisible(false);
      editForm.resetFields();
      setEditingItem(null);
      
      message.success(`${editingItem.symbol} updated in portfolio`);
    } catch (error) {
      console.error('Error updating portfolio item:', error);
      message.error('Failed to update portfolio item');
    }
  };

  // Fetch stock data when symbol changes
  const handleSymbolChange = async (value: string) => {
    if (!value) {
      setStockData(null);
      return;
    }
    
    setStockLoading(true);
    setCurrentStock(value.toUpperCase());
    
    try {
      const data = await getStockQuote(value.toUpperCase());
      setStockData(data);
      
      // Update form with current price
      form.setFieldsValue({
        purchasePrice: data.price
      });
    } catch (error) {
      console.error('Error fetching stock data:', error);
      message.error('Failed to fetch stock data');
    } finally {
      setStockLoading(false);
    }
  };

  // Open edit modal
  const handleEdit = (item: PortfolioItem & { currentPrice?: number }) => {
    setEditingItem(item);
    editForm.setFieldsValue({
      shares: item.shares,
      purchasePrice: item.purchasePrice,
      purchaseDate: dayjs(item.purchaseDate)
    });
    setEditModalVisible(true);
  };

  // Recommended stocks
  const recommendedStocks = [
    {
      key: '1',
      symbol: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      price: 467.25,
      change: 2.34,
    },
    {
      key: '2',
      symbol: 'QQQ',
      name: 'Invesco QQQ Trust',
      price: 438.27,
      change: 1.56,
    },
    {
      key: '3',
      symbol: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      price: 252.86,
      change: 1.12,
    },
  ];

  // Add recommended stock to portfolio
  const addRecommendedStock = async (stock: any) => {
    setCurrentStock(stock.symbol);
    setStockData({
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: (stock.change / stock.price) * 100,
      volume: 0,
      marketCap: 0
    });
    
    form.setFieldsValue({
      symbol: stock.symbol,
      purchasePrice: stock.price,
      shares: 1,
      purchaseDate: dayjs()
    });
    
    setAddModalVisible(true);
  };

  // Define columns for portfolio table
  const portfolioColumns = [
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
      title: 'Shares',
      dataIndex: 'shares',
      key: 'shares',
      render: (shares: number) => shares.toFixed(2),
    },
    {
      title: 'Avg. Price',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price: number) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Market Value',
      dataIndex: 'currentValue',
      key: 'currentValue',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Gain/Loss',
      key: 'gain',
      render: (_: any, record: any) => (
        <div>
          <div style={{ color: record.gain >= 0 ? '#3f8600' : '#cf1322' }}>
            {record.gain >= 0 ? '+' : ''}${record.gain.toFixed(2)}
          </div>
          <div style={{ color: record.gainPercent >= 0 ? '#3f8600' : '#cf1322', fontSize: 12 }}>
            {record.gainPercent >= 0 ? '+' : ''}{record.gainPercent.toFixed(2)}%
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={`/stocks/${record.symbol}`}>
            <Button type="default" icon={<LineChartOutlined />} size="small">
              Chart
            </Button>
          </Link>
          <Button 
            type="default" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => removeFromPortfolio(record.symbol)}
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
          icon={<PlusOutlined />}
          onClick={() => addRecommendedStock(record)}
        >
          Add
        </Button>
      ),
    },
  ];

  // Calculate sector allocation
  const calculateSectorAllocation = () => {
    const sectors: Record<string, number> = {};
    let totalValue = 0;
    
    portfolio.forEach(item => {
      const value = item.currentValue || 0;
      totalValue += value;
      
      // For simplicity, we're using a placeholder sector
      // In a real app, you would get the sector from the API
      const sector = 'Technology';
      sectors[sector] = (sectors[sector] || 0) + value;
    });
    
    return Object.entries(sectors).map(([sector, value]) => ({
      sector,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0
    }));
  };

  // Calculate top holdings
  const calculateTopHoldings = () => {
    const totalValue = portfolio.reduce((sum, item) => sum + (item.currentValue || 0), 0);
    
    return portfolio
      .map(item => ({
        symbol: item.symbol,
        value: item.currentValue || 0,
        percentage: totalValue > 0 ? ((item.currentValue || 0) / totalValue) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const sectorAllocation = calculateSectorAllocation();
  const topHoldings = calculateTopHoldings();

  return (
    <AppLayout>
      <div>
        <Title level={2}>Your Portfolio</Title>
        <Paragraph>
          Track your investments and monitor your portfolio performance over time.
        </Paragraph>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Value"
                value={portfolioStats.totalValue}
                precision={2}
                prefix="$"
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Today's Change"
                value={portfolioStats.dailyChange}
                precision={2}
                valueStyle={{ color: portfolioStats.dailyChange >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={portfolioStats.dailyChange >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`(${portfolioStats.dailyChangePercent.toFixed(2)}%)`}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Return"
                value={portfolioStats.totalReturn}
                precision={2}
                valueStyle={{ color: portfolioStats.totalReturn >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={portfolioStats.totalReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix={`(${portfolioStats.totalReturnPercent.toFixed(2)}%)`}
              />
            </Card>
          </Col>
        </Row>
        
        {loading ? (
          <div style={{ textAlign: 'center', margin: '50px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />
        ) : portfolio.length === 0 ? (
          <Card style={{ marginBottom: 24, textAlign: 'center' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Your portfolio is empty"
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Add Stocks
              </Button>
            </Empty>
          </Card>
        ) : (
          <Card 
            style={{ marginBottom: 24 }}
            title="Holdings"
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => setAddModalVisible(true)}
              >
                Add Stock
              </Button>
            }
          >
            <Table 
              columns={portfolioColumns}
              dataSource={portfolio}
              pagination={false}
              rowKey="symbol"
              scroll={{ x: true }}
            />
          </Card>
        )}
        
        {portfolio.length > 0 && (
          <>
            <Title level={3}>Portfolio Allocation</Title>
            <Card style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Paragraph>Sector Allocation</Paragraph>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sectorAllocation.length > 0 ? (
                      sectorAllocation.map((item, index) => (
                        <div key={index}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.sector}</span>
                            <span>{item.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress percent={item.percentage} showInfo={false} />
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No sector data available</Text>
                    )}
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <Paragraph>Top Holdings</Paragraph>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {topHoldings.length > 0 ? (
                      topHoldings.map((item, index) => (
                        <div key={index}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.symbol}</span>
                            <span>{item.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress percent={item.percentage} showInfo={false} />
                        </div>
                      ))
                    ) : (
                      <Text type="secondary">No holdings data available</Text>
                    )}
                  </div>
                </Col>
              </Row>
            </Card>
          </>
        )}
        
        <Title level={3}>Recommended for Your Portfolio</Title>
        <Table 
          columns={recommendedColumns}
          dataSource={recommendedStocks}
          pagination={false}
          rowKey="symbol"
        />
        
        {/* Add Stock Modal */}
        <Modal
          title="Add Stock to Portfolio"
          open={addModalVisible}
          onCancel={() => {
            setAddModalVisible(false);
            form.resetFields();
            setStockData(null);
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={addToPortfolio}
            initialValues={{
              purchaseDate: dayjs(),
              shares: 1
            }}
          >
            <Form.Item
              name="symbol"
              label="Stock Symbol"
              rules={[{ required: true, message: 'Please enter a stock symbol' }]}
            >
              <Input 
                placeholder="e.g. AAPL" 
                onChange={(e) => handleSymbolChange(e.target.value)}
                style={{ textTransform: 'uppercase' }}
              />
            </Form.Item>
            
            {stockLoading && <Spin />}
            
            {stockData && (
              <div style={{ marginBottom: 16 }}>
                <Card size="small">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <Text strong>{stockData.symbol}</Text>
                      <div>{stockData.name}</div>
                    </div>
                    <div>
                      <Text strong>${stockData.price.toFixed(2)}</Text>
                      <div style={{ 
                        color: stockData.change >= 0 ? '#3f8600' : '#cf1322',
                        fontSize: 12
                      }}>
                        {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            
            <Form.Item
              name="shares"
              label="Number of Shares"
              rules={[{ required: true, message: 'Please enter number of shares' }]}
            >
              <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: '100%' }}
                placeholder="Enter number of shares"
              />
            </Form.Item>
            
            <Form.Item
              name="purchasePrice"
              label="Purchase Price"
              rules={[{ required: true, message: 'Please enter purchase price' }]}
            >
              <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: '100%' }}
                prefix="$"
                placeholder="Enter purchase price"
              />
            </Form.Item>
            
            <Form.Item
              name="purchaseDate"
              label="Purchase Date"
              rules={[{ required: true, message: 'Please select purchase date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Add to Portfolio
              </Button>
            </Form.Item>
          </Form>
        </Modal>
        
        {/* Edit Stock Modal */}
        <Modal
          title={`Edit ${editingItem?.symbol}`}
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
            setEditingItem(null);
          }}
          footer={null}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={editPortfolioItem}
          >
            <Form.Item
              name="shares"
              label="Number of Shares"
              rules={[{ required: true, message: 'Please enter number of shares' }]}
            >
              <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: '100%' }}
                placeholder="Enter number of shares"
              />
            </Form.Item>
            
            <Form.Item
              name="purchasePrice"
              label="Purchase Price"
              rules={[{ required: true, message: 'Please enter purchase price' }]}
            >
              <InputNumber 
                min={0.01} 
                step={0.01} 
                style={{ width: '100%' }}
                prefix="$"
                placeholder="Enter purchase price"
              />
            </Form.Item>
            
            <Form.Item
              name="purchaseDate"
              label="Purchase Date"
              rules={[{ required: true, message: 'Please select purchase date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Update Portfolio
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AppLayout>
  );
}
