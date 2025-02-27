"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Typography, Table, Button, Empty, Card } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function WatchlistPage() {
  return (
    <AppLayout>
      <div>
        <Title level={2}>Your Watchlist</Title>
        <Paragraph>
          Track your favorite stocks in one place. Add stocks to your watchlist to monitor their performance.
        </Paragraph>
        
        <Card style={{ marginBottom: 24, textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Your watchlist is empty"
          >
            <Button type="primary" icon={<PlusOutlined />}>
              Add Stocks
            </Button>
          </Empty>
        </Card>
        
        <Title level={3}>Recommended Stocks</Title>
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
                  Add to Watchlist
                </Button>
              ),
            },
          ]}
          dataSource={[
            {
              key: '1',
              symbol: 'AAPL',
              name: 'Apple Inc.',
              price: 182.52,
              change: 1.23,
            },
            {
              key: '2',
              symbol: 'MSFT',
              name: 'Microsoft Corporation',
              price: 417.88,
              change: -2.45,
            },
            {
              key: '3',
              symbol: 'GOOGL',
              name: 'Alphabet Inc.',
              price: 152.19,
              change: 0.87,
            },
          ]}
          pagination={false}
        />
      </div>
    </AppLayout>
  );
}
