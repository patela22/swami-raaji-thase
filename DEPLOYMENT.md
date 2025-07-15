# 🚀 Deployment Guide

## Quick Start: Deploy to Vercel

### Step 1: Prepare Your Code

1. **Ensure your code is ready**:

   ```bash
   npm run build
   ```

   This should complete without errors.

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository** from GitHub
5. **Configure project** (optional):
   - Framework Preset: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
6. **Add Environment Variables** (optional):
   ```
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX=your_pinecone_index_name
   ```
7. **Click "Deploy"**

### Step 3: Get Your URL

- You'll receive a URL like: `https://your-app-name.vercel.app`
- The app will automatically redeploy when you push to GitHub
- You can add a custom domain later

## Alternative Platforms

### Netlify

1. Go to [netlify.com](https://netlify.com)
2. Connect your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `.next`

### Railway

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Add environment variables
4. Deploy automatically

### Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Build command: `npm run build`
5. Start command: `npm start`

## Environment Variables

### **Environment Variables for Production**

If you want to use real data instead of mock data, add these to your deployment platform:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX=your_pinecone_index_name
```

**Note**: Make sure your Pinecone index is configured with 1536 dimensions for the text-embedding-3-small model.

### Optional (App works with mock data without these)

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Troubleshooting

### Build Errors

- Ensure all dependencies are in `package.json`
- Check that `next.config.js` is properly configured
- Verify TypeScript compilation passes

### Runtime Errors

- Check environment variables are set correctly
- Ensure API keys are valid
- Verify Pinecone connection (if using)

### Performance Issues

- Enable Vercel Analytics
- Use CDN for static assets
- Optimize images and fonts

## Custom Domain

### Vercel

1. Go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

### SSL Certificate

- Automatically handled by Vercel
- Custom domains get free SSL certificates

## Monitoring

### Vercel Analytics

- Built-in analytics dashboard
- Performance monitoring
- Error tracking

### Custom Analytics

- Google Analytics
- Plausible Analytics
- Simple Analytics

## Cost Considerations

### Free Tiers

- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month
- **Railway**: $5/month after free trial
- **Render**: Free tier available

### Paid Plans

- **Vercel Pro**: $20/month
- **Netlify Pro**: $19/month
- **Railway**: Pay-as-you-use
- **Render**: $7/month

## Security

### Environment Variables

- Never commit API keys to GitHub
- Use environment variables for all secrets
- Rotate keys regularly

### HTTPS

- All platforms provide free SSL certificates
- Force HTTPS redirects

### CORS

- Configure CORS for your API routes
- Restrict origins in production

## Performance Optimization

### Build Optimization

- Enable Next.js optimizations
- Use dynamic imports for large components
- Optimize images with Next.js Image component

### Runtime Optimization

- Enable caching strategies
- Use CDN for static assets
- Implement proper error boundaries

## Support

### Documentation

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)

### Community

- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Discord](https://discord.gg/nextjs)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nextjs)
