# Vercel Finance - Stock Market Tracking Application

A modern stock market tracking application built with Next.js, React, and Ant Design. This application allows users to track stock prices, save favorites to a watchlist, view historical data with charts, and simulate a portfolio.

## Features

- Real-time stock price tracking
- Watchlist for favorite stocks
- Historical price charts with Recharts
- Basic financial metrics
- Portfolio simulation
- Responsive design with Ant Design

## Tech Stack

### Frontend
- Next.js with TypeScript
- Ant Design 5.x for UI components
- React Context API for state management
- Recharts for data visualization

### Backend
- Serverless functions (Vercel)
- Stock market data API integration

## Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/vercel-finance.git
cd vercel-finance
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your API keys:
```
NEXT_PUBLIC_STOCK_API_KEY=your_api_key_here
```

4. Start the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
vercel-finance/
├── public/             # Static assets
├── src/
│   ├── app/            # App router pages
│   ├── components/     # React components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   ├── services/       # API services
│   └── types/          # TypeScript type definitions
├── .env.local          # Environment variables (create this file)
├── next.config.ts      # Next.js configuration
└── package.json        # Project dependencies
```

## Development Roadmap

See [roadmap.md](roadmap.md) for the detailed development plan.

## Deployment

This project is configured for easy deployment on Vercel. Connect your GitHub repository to Vercel for automatic deployments.

## License

MIT
