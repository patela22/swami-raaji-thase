# Swami Raaji Thase - BAPS AI Assistant

A beautiful, modern AI assistant specifically designed for BAPS Satsang questions, built with Next.js, Pinecone, and OpenAI.

## 🎯 Purpose

This AI assistant provides accurate, well-cited answers about BAPS (Bochasanwasi Akshar Purushottam Swaminarayan Sanstha) Satsang, including:

- **Core Philosophy**: Akshar-Purushottam philosophy and spiritual principles
- **Scripture Knowledge**: Vachanamrut, Shikshapatri, and other BAPS texts
- **Guru Lineage**: Shastriji Maharaj → Pramukh Swami Maharaj → Mahant Swami Maharaj
- **Satsang Practices**: Daily worship, scripture study, and community service
- **Temple Activities**: Youth programs, educational initiatives, and cultural preservation
- **Humanitarian Work**: Global community service and educational programs

### **Key Distinctions**

- **BAPS vs Other Sects**: Clear explanations of philosophical and organizational differences
- **Guru Lineage**: Shastriji Maharaj → Pramukh Swami Maharaj → Mahant Swami Maharaj
- **Scripture Focus**: Vachanamrut and Shikshapatri as primary texts
- **Community Programs**: Bal/Kishore/Yuvak/Mahila/Senani Sabhas

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Pinecone account (optional - app works with mock data)
- OpenAI API key (optional - app works with mock data)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd swami-raaji-thase
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)

   Create a `.env.local` file in the root directory:

   ```env
   # Pinecone Configuration (Optional)
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_INDEX=your_pinecone_index_name_here

   # OpenAI Configuration (Optional)
   OPENAI_API_KEY=your_openai_api_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Note**: The app works perfectly without these environment variables - it will use BAPS-specific mock data for demonstration purposes.

4. **Pinecone Index Setup**

   Create a Pinecone index with these settings:

   - **Dimensions**: `1536` (for text-embedding-3-small model)
   - **Metric**: `cosine`
   - **Pod Type**: `p1.x1` (free tier)

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment

### **Recommended: Vercel (Easiest)**

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:

   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your repository
   - Add environment variables (optional)
   - Deploy!

3. **Get your URL**: You'll receive a URL like `https://your-app.vercel.app`

### **Alternative Platforms**

- **Netlify**: Similar to Vercel, great for static sites
- **Railway**: Good for full-stack apps with database
- **Render**: Simple deployment for Node.js apps

### **Environment Variables for Production**

If you want to use real data instead of mock data, add these to your deployment platform:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
```

## 🎨 Design System

The application uses a comprehensive design system with:

- **Token-based CSS variables** for consistent theming
- **WCAG 4.5:1 contrast ratios** for accessibility
- **Fluid typography** using `clamp()` functions
- **Dark mode** with smooth transitions
- **Responsive design** that works on all devices

## 🤖 AI Features

### Advanced RAG System

- **Hybrid Search**: Combines semantic and keyword retrieval
- **Cross-Encoder Reranking**: Improved relevance scoring
- **Sentence-Level Distillation**: Extracts most relevant content
- **Caching**: In-memory cache for performance
- **Query Guardrails**: Safety filters and length limits

### BAPS-Specific Enhancements

- **Enhanced Query Expansion**: BAPS-specific terms and synonyms
- **Sect Differentiation**: Clear explanations of BAPS vs other organizations
- **Guru Lineage Knowledge**: Accurate information about spiritual succession
- **Scripture Citations**: References to Vachanamrut, Shikshapatri, and other BAPS texts

### Robust Citation System

- **"Cite or Say I Don't Know"**: Strict citation requirements
- **Relevance Scoring**: Shows match percentages
- **Collapsible Citations**: Clean UI for source management

## 📊 Analytics

The app includes a comprehensive analytics dashboard showing:

- Total queries and success rates
- Average response times
- Top queries and recent activity
- Performance metrics

## 🔧 Development

### Project Structure

```
├── app/
│   ├── components/     # React components
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout
├── lib/               # Utility functions
├── scripts/           # Build and deployment scripts
└── data/              # Static data files
```

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Pinecone**: Vector database for semantic search
- **OpenAI**: AI model integration

## 🧪 Testing

Test BAPS-specific responses:

```bash
node scripts/test-baps-responses.js
```

This will test key BAPS questions:

- "What is BAPS Satsang?"
- "What is the difference between BAPS and other Swaminarayan sects?"
- "Who is the current guru of BAPS?"
- "What are the core principles of BAPS?"
- "What is Akshar Purushottam philosophy?"

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For questions or support, please open an issue on GitHub.

---

**Note**: This application is designed for spiritual guidance and education. Always consult with qualified spiritual teachers for personal spiritual matters.
