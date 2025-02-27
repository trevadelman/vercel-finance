"use client";

import AppLayout from '@/components/layout/AppLayout';
import { Typography, Card, Input, Button, Table, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function StocksPage() {
  return (
    <AppLayout>
      <div>
        <Title level={2}>Stock Search</Title>
        <Paragraph>
          Search for stocks by company name or symbol. View detailed information and add to your watchlist.
        </Paragraph>
        
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Input 
              size="large"
              placeholder="Search for a stock (e.g., AAPL, Apple, MSFT, Microsoft)"
              prefix={<SearchOutlined />}
              suffix={
                <Button type="primary">
                  Search
                </Button>
              }
            />
            <Paragraph type="secondary">
              Enter a company name or stock symbol to search. Results will appear below.
            </Paragraph>
          </Space>
        </Card>
        
        <Title level={3}>Popular Stocks</Title>
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
              title: 'Sector',
              dataIndex: 'sector',
              key: 'sector',
              render: (sector) => (
                <Tag color="blue">{sector}</Tag>
              ),
            },
            {
              title: 'Action',
              key: 'action',
              render: () => (
                <Button type="link">
                  View Details
                </Button>
              ),
            },
          ]}
          dataSource={[
            {
              key: '1',
              symbol: 'AAPL',
              name: 'Apple Inc.',
              sector: 'Technology',
            },
            {
              key: '2',
              symbol: 'MSFT',
              name: 'Microsoft Corporation',
              sector: 'Technology',
            },
            {
              key: '3',
              symbol: 'GOOGL',
              name: 'Alphabet Inc.',
              sector: 'Technology',
            },
            {
              key: '4',
              symbol: 'AMZN',
              name: 'Amazon.com Inc.',
              sector: 'Consumer Cyclical',
            },
            {
              key: '5',
              symbol: 'META',
              name: 'Meta Platforms Inc.',
              sector: 'Technology',
            },
          ]}
          pagination={false}
        />
      </div>
    </AppLayout>
  );
}
