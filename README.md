# Vercel Finance - Stock Market Tracking Application

A modern stock market tracking application built with Next.js, React, and Ant Design. This application allows users to track stock prices, save favorites to a watchlist, view historical data with charts, and simulate a portfolio.

## Features

- Real-time stock price tracking with Yahoo Finance API
- Watchlist for favorite stocks
- Portfolio simulation
- Responsive design with Ant Design
- Serverless architecture with Vercel deployment
- Advanced technical analysis with multiple indicators:
  - Simple Moving Averages (SMA)
  - Exponential Moving Averages (EMA)
  - Relative Strength Index (RSI)
  - Moving Average Convergence Divergence (MACD)
  - Bollinger Bands
  - Support and resistance levels
  - Automated trading signals

## Tech Stack

### Frontend
- Next.js with TypeScript
- Ant Design 5.x for UI components
- React Context API for state management
- Recharts for data visualization

### Backend
- Serverless functions (Vercel)
- Yahoo Finance API integration

## Live Demo

The application is deployed and available at:
[https://vercel-finance-five.vercel.app](https://vercel-finance-five.vercel.app)

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/trevadelman/vercel-finance.git
cd vercel-finance
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
vercel-finance/
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages
│   │   ├── api/        # API routes (serverless functions)
│   │   │   ├── stocks/ # Stock data API endpoints
│   │   │   │   ├── indicators/ # Technical indicators API
│   │   │   │   ├── history/    # Historical data API
│   │   ├── stocks/     # Stock search page
│   │   ├── watchlist/  # Watchlist page
│   │   ├── portfolio/  # Portfolio page
│   ├── components/     # React components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── layout/     # Layout components
│   │   ├── charts/     # Chart components
│   │   ├── providers/  # Provider components
│   ├── services/       # API services
│   └── types/          # TypeScript type definitions
├── .env.local          # Environment variables
├── next.config.ts      # Next.js configuration
├── vercel.json         # Vercel configuration
├── technical-analysis.md # Technical analysis documentation
└── package.json        # Project dependencies
```

## Technical Analysis

The application includes comprehensive technical analysis capabilities to help users make informed trading decisions. Key features include:

- Interactive charts with multiple timeframes (1D to 5Y)
- Multiple technical indicators that can be toggled on/off
- Automated trading signals based on indicator patterns
- Support and resistance level identification
- Detailed tooltips showing OHLC data and indicator values

For detailed information about each technical indicator and how to interpret them, see [technical-analysis.md](technical-analysis.md).

## Development Roadmap

See [roadmap.md](roadmap.md) for the detailed development plan and current progress.

## Deployment

This project is deployed on Vercel. The GitHub repository is connected to Vercel for automatic deployments.

## GitHub Repository

The code is available on GitHub:
[https://github.com/trevadelman/vercel-finance](https://github.com/trevadelman/vercel-finance)

## License

MIT
