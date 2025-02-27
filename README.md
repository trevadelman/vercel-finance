# Vercel Finance - Stock Market Tracking Application

A modern stock market tracking application built with Next.js, React, and Ant Design. This application allows users to track stock prices, save favorites to a watchlist, view historical data with charts, and simulate a portfolio.

## Features

- Real-time stock price tracking with Yahoo Finance API
- Watchlist for favorite stocks
- Portfolio simulation
- Responsive design with Ant Design
- Serverless architecture with Vercel deployment

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
[https://vercel-finance-lkfszpmuy-trevors-projects-feab3da9.vercel.app](https://vercel-finance-lkfszpmuy-trevors-projects-feab3da9.vercel.app)

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
│   │   ├── stocks/     # Stock search page
│   │   ├── watchlist/  # Watchlist page
│   │   ├── portfolio/  # Portfolio page
│   ├── components/     # React components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── layout/     # Layout components
│   │   ├── providers/  # Provider components
│   ├── services/       # API services
│   └── types/          # TypeScript type definitions
├── .env.local          # Environment variables
├── next.config.ts      # Next.js configuration
├── vercel.json         # Vercel configuration
└── package.json        # Project dependencies
```

## Development Roadmap

See [roadmap.md](roadmap.md) for the detailed development plan and current progress.

## Deployment

This project is deployed on Vercel. The GitHub repository is connected to Vercel for automatic deployments.

## GitHub Repository

The code is available on GitHub:
[https://github.com/trevadelman/vercel-finance](https://github.com/trevadelman/vercel-finance)

## License

MIT
