# Vercel Deployment Guide for Vercel Finance

This document provides all the information you need to know about the Vercel deployment for the Vercel Finance application.

## Deployment Overview

The Vercel Finance application is deployed on Vercel, a cloud platform for static sites and serverless functions. The deployment is connected to the GitHub repository, allowing for automatic deployments when changes are pushed to the main branch.

## Deployment URL

The application is deployed and accessible at:
[https://vercel-finance-lkfszpmuy-trevors-projects-feab3da9.vercel.app](https://vercel-finance-lkfszpmuy-trevors-projects-feab3da9.vercel.app)

## Deployment Configuration

The deployment is configured using the `vercel.json` file in the root of the project:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "production"
  }
}
```

This configuration specifies:
- The build, development, and installation commands
- The framework (Next.js)
- The deployment region (San Francisco)
- Environment variables

## Deployment Process

The deployment process follows these steps:

1. **Code Push**: Changes are pushed to the GitHub repository
2. **Build Trigger**: Vercel automatically detects the changes and triggers a build
3. **Build Process**: Vercel runs the build command (`npm run build`)
4. **Deployment**: The built application is deployed to Vercel's global CDN
5. **Preview/Production**: Depending on the branch, the deployment is either a preview or production deployment

## Environment Variables

The following environment variables are configured in the Vercel deployment:

- `NEXT_PUBLIC_VERCEL_ENV`: Set to "production" for the production environment

No API keys are currently required for the application as it uses the Yahoo Finance API without authentication.

## Serverless Functions

The application uses serverless functions to proxy API requests to Yahoo Finance. These functions are located in the `src/app/api` directory:

- `src/app/api/stocks/route.ts`: Handles stock data requests

Vercel automatically deploys these functions as serverless endpoints.

## Deployment Commands

The following commands are available for deployment:

- `npm run deploy`: Deploys the application to Vercel (requires Vercel CLI to be installed and authenticated)
- `npx vercel`: Deploys a preview version of the application
- `npx vercel --prod`: Deploys to production

## Vercel Dashboard

The Vercel dashboard provides additional features and information:

- **Analytics**: View traffic and performance metrics
- **Logs**: Access build and function logs
- **Environment Variables**: Manage environment variables
- **Domains**: Configure custom domains
- **Deployments**: View deployment history and rollback if needed

Access the dashboard by logging in to [Vercel](https://vercel.com) with the account used for deployment.

## Automatic Deployments

The repository is connected to Vercel for automatic deployments:

- **Production Deployments**: Pushes to the `main` branch trigger production deployments
- **Preview Deployments**: Pull requests trigger preview deployments

## Custom Domain Setup

To set up a custom domain:

1. Go to the Vercel dashboard
2. Navigate to the project settings
3. Click on "Domains"
4. Add your custom domain
5. Follow the instructions to configure DNS settings

## Troubleshooting

If you encounter issues with the deployment:

1. **Check Build Logs**: Review the build logs in the Vercel dashboard
2. **Verify Environment Variables**: Ensure all required environment variables are set
3. **Local Testing**: Test the application locally before deploying
4. **Rollback**: Use the Vercel dashboard to rollback to a previous working deployment

## Monitoring and Performance

Vercel provides built-in monitoring and performance analytics:

- **Real User Monitoring**: Track actual user experiences
- **Web Vitals**: Monitor Core Web Vitals metrics
- **Function Execution**: Track serverless function performance

## Security Considerations

- **Environment Variables**: Sensitive information is stored as environment variables
- **HTTPS**: All Vercel deployments use HTTPS by default
- **Headers**: Security headers are automatically applied

## Scaling

Vercel automatically scales the application based on traffic:

- **Static Assets**: Served from a global CDN
- **Serverless Functions**: Automatically scale based on demand
- **Edge Network**: Content is served from the closest edge location

## Cost Management

The current deployment uses Vercel's free tier, which includes:

- Basic analytics
- Unlimited personal projects
- Serverless function execution (with limits)
- Automatic HTTPS
- Global CDN

For production applications with higher traffic, consider upgrading to a paid plan.
