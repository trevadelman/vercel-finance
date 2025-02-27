"use client";

import React from 'react';
import { StyleProvider } from '@ant-design/cssinjs';

interface AntdProviderProps {
  children: React.ReactNode;
}

const AntdProvider: React.FC<AntdProviderProps> = ({ children }) => {
  return (
    <StyleProvider hashPriority="high">
      {children}
    </StyleProvider>
  );
};

export default AntdProvider;
