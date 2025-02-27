"use client";

import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography, Button, Drawer, Badge } from 'antd';
import { 
  HomeOutlined, 
  LineChartOutlined, 
  StarOutlined, 
  WalletOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileView, setMobileView] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { token } = theme.useToken();
  const pathname = usePathname();

  // Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      setMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get current active menu key based on pathname
  const getActiveKey = () => {
    if (pathname === '/') return '1';
    if (pathname.startsWith('/stocks')) return '2';
    if (pathname === '/watchlist') return '3';
    if (pathname === '/portfolio') return '4';
    return '1';
  };

  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link href="/">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <LineChartOutlined />,
      label: <Link href="/stocks">Stocks</Link>,
    },
    {
      key: '3',
      icon: <StarOutlined />,
      label: <Link href="/watchlist">Watchlist</Link>,
    },
    {
      key: '4',
      icon: <WalletOutlined />,
      label: <Link href="/portfolio">Portfolio</Link>,
    },
  ];

  const sidebarContent = (
    <>
      <div 
        className="logo" 
        style={{ 
          height: 64, 
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0 24px' : '0 24px',
          color: 'white',
          fontSize: collapsed ? 18 : 20,
          fontWeight: 'bold',
          background: 'rgba(255, 255, 255, 0.04)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          transition: 'all 0.3s'
        }}
      >
        {collapsed ? 'TF' : 'Trend Friendly'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[getActiveKey()]}
        mode="inline"
        items={menuItems}
        style={{ 
          borderRight: 0,
          fontWeight: 500
        }}
      />
      <div 
        style={{ 
          position: 'absolute', 
          bottom: 0, 
          width: '100%',
          padding: '16px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: collapsed ? 'none' : 'block'
        }}
      >
        <div style={{ color: 'rgba(255, 255, 255, 0.65)', marginBottom: '8px', fontSize: '12px' }}>
          Market data provided by Yahoo Finance
        </div>
        <div style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '12px' }}>
          © 2025 Trend Friendly
        </div>
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {mobileView ? (
        <Drawer
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={250}
          bodyStyle={{ padding: 0, background: '#001529' }}
          headerStyle={{ display: 'none' }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value) => setCollapsed(value)}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
            zIndex: 100
          }}
          width={250}
          theme="dark"
        >
          {sidebarContent}
        </Sider>
      )}
      <Layout style={{ 
        marginLeft: mobileView ? 0 : (collapsed ? 80 : 250), 
        transition: 'all 0.2s',
        background: token.colorBgContainer
      }}>
        <Header style={{ 
          padding: 0, 
          background: token.colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 99,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          height: 64
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {mobileView ? (
              <Button 
                type="text" 
                icon={<MenuUnfoldOutlined />} 
                onClick={() => setDrawerVisible(true)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
            ) : (
              <Button 
                type="text" 
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} 
                onClick={() => setCollapsed(!collapsed)}
                style={{ fontSize: '16px', width: 64, height: 64 }}
              />
            )}
            <Title level={4} style={{ margin: 0, fontSize: mobileView ? '16px' : '18px' }}>
              {pathname === '/' && 'Dashboard'}
              {pathname.startsWith('/stocks') && (pathname === '/stocks' ? 'Stocks' : 'Stock Details')}
              {pathname === '/watchlist' && 'Watchlist'}
              {pathname === '/portfolio' && 'Portfolio'}
            </Title>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
            <Badge count={3} dot>
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                style={{ fontSize: '16px' }}
              />
            </Badge>
            <Button 
              type="text" 
              icon={<SettingOutlined />} 
              style={{ fontSize: '16px', margin: '0 8px' }}
            />
            <Button 
              type="primary" 
              icon={<UserOutlined />} 
              style={{ 
                marginLeft: 8,
                background: 'linear-gradient(90deg, #1677ff 0%, #4096ff 100%)',
                border: 'none'
              }}
            >
              {mobileView ? '' : 'Account'}
            </Button>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px', 
          padding: 24, 
          background: token.colorBgContainer,
          borderRadius: token.borderRadiusLG,
          minHeight: 280,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
