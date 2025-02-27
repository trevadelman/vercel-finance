"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Typography, Table, Button, Card, Row, Col, Statistic, Progress, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function PortfolioPage() {
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
                value={0}
                precision={2}
                prefix="$"
                suffix=""
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Today's Change"
                value={0}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowDownOutlined />}
                suffix="$0.00 (0.00%)"
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Total Return"
                value={0}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix="$0.00 (0.00%)"
              />
            </Card>
          </Col>
        </Row>
        
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Your portfolio is empty"
          >
            <Button type="primary" icon={<PlusOutlined />}>
              Add Stocks
            </Button>
          </Empty>
        </Card>
        
        <Title level={3}>Portfolio Allocation</Title>
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Paragraph>Sector Allocation</Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Technology</span>
                    <span>0%</span>
                  </div>
                  <Progress percent={0} showInfo={false} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Financial</span>
                    <span>0%</span>
                  </div>
                  <Progress percent={0} showInfo={false} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Healthcare</span>
                    <span>0%</span>
                  </div>
                  <Progress percent={0} showInfo={false} />
                </div>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <Paragraph>Top Holdings</Paragraph>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>No holdings yet</span>
                    <span>0%</span>
                  </div>
                  <Progress percent={0} showInfo={false} />
                </div>
              </div>
            </Col>
          </Row>
        </Card>
        
        <Title level={3}>Recommended for Your Portfolio</Title>
        <Table 
          columns={[
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
              title: 'Action',
              key: 'action',
              render: () => (
                <Button type="primary" size="small">
                  Add to Portfolio
                </Button>
              ),
            },
          ]}
          dataSource={[
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
          ]}
          pagination={false}
        />
      </div>
    </AppLayout>
  );
}
