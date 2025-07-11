# Swami Raaji Thase - BAPS Satsang AI Assistant

A beautiful, modern AI assistant specifically designed for BAPS Satsang questions, built with Next.js, Supabase, and OpenAI.

## 🚀 Features

- **BAPS-Specific Knowledge**: Deep understanding of BAPS (Bochasanwasi Akshar Purushottam Swaminarayan Sanstha) teachings
- **Sect Differentiation**: Clear explanations of BAPS vs other Swaminarayan sects
- **Scripture-Based Answers**: Grounded in authentic BAPS scriptures (Vachanamrut, Shikshapatri, etc.)
- **AI-Powered**: Advanced AI technology for comprehensive spiritual guidance
- **Instant Answers**: Get immediate responses to your spiritual questions
- **Beautiful Design**: Modern, accessible UI with dark/light theme support
- **Advanced RAG**: Hybrid retrieval with semantic and keyword search
- **Analytics Dashboard**: Track performance and usage metrics

## 🎯 BAPS-Specific Capabilities

### **Core Knowledge Areas**

- **BAPS History**: Founded by Shastriji Maharaj, current guru Mahant Swami Maharaj
- **Akshar-Purushottam Philosophy**: Central tenet distinguishing BAPS from other sects
- **Spiritual Practices**: Daily puja, scripture study, community service
- **Organizational Structure**: Systematic approach to spiritual development
- **Family Values**: Ghar Sabha (home assemblies) and family programs
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
- Supabase account (optional - app works with mock data)
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
   # Supabase Configuration (Optional)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

   # OpenAI Configuration (Optional)
   OPENAI_API_KEY=your_openai_api_key_here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Note**: The app works perfectly without these environment variables - it will use BAPS-specific mock data for demonstration purposes.

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

The application uses a comprehensive design system with:

- **Token-based CSS variables** for consistent theming
- **WCAG 4.5:1 contrast ratios** for accessibility
- **Fluid typography** using `clamp()` functions
- **Dark/light theme support** with smooth transitions
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
- **Supabase**: Database and vector storage
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

## 🚀 Deployment

The app is configured for deployment on Vercel:

1. **Connect your repository** to Vercel
2. **Add environment variables** in the Vercel dashboard
3. **Deploy automatically** on every push to main

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
