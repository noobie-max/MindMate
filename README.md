# 🧠 MindMate - AI-Powered Mental Wellness Companion

MindMate is a comprehensive mental health and wellness application that combines AI-powered chat support, mood tracking, mindfulness exercises, and wellness analytics to help users maintain their mental well-being.

## ✨ Features

### 🤖 AI Chatbot
- **Intelligent Fallback System**: Works with or without Gemini AI integration
- **Mental Health Support**: Specialized responses for anxiety, depression, stress, and wellness
- **Context-Aware Conversations**: Remembers conversation history for better support
- **24/7 Availability**: Always available mental health companion

### 📊 Dashboard & Analytics
- **Mood Tracking**: Log and visualize mood trends over time
- **Exercise Monitoring**: Track physical activity and set custom goals
- **Sleep Analysis**: Monitor sleep patterns and quality
- **Wellness Insights**: AI-generated insights based on your data

### 🧘 Mindfulness & Exercise
- **Guided Meditation**: Multiple meditation exercises with timer
- **Breathing Exercises**: Structured breathing techniques
- **Mindful Activities**: Various wellness activities and practices
- **Progress Tracking**: Monitor your mindfulness journey

### 🎯 Goal Setting
- **Custom Goals**: Set personalized weekly exercise and sleep targets
- **WHO Recommendations**: Built-in health guidelines
- **Progress Visualization**: Track goal achievement with charts

### 🎨 User Experience
- **Dark/Light Mode**: Comfortable viewing in any environment
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Custom Dialogs**: Beautiful, non-intrusive notifications
- **Smooth Animations**: Engaging and calming user interface

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **React Hooks**: Modern state management

### Backend & Database
- **Firebase Auth**: Secure user authentication
- **Firestore**: Real-time NoSQL database
- **Gemini AI**: Advanced AI language model (optional)
- **Node.js**: Server-side JavaScript runtime

### Architecture
- **Hybrid Approach**: Both Next.js app and vanilla HTML/JS versions
- **Progressive Enhancement**: Works with or without JavaScript
- **Fallback Systems**: Graceful degradation for all features

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase project set up
- Gemini AI API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mindmate.git
   cd mindmate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Configure Firebase**
   - Update Firebase configuration in `src/lib/firebase.ts`
   - Update HTML Firebase config in auth.html, dashboard.html, etc.

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   - Next.js app: http://localhost:3000
   - HTML version: Open `index.html` in browser

## 📁 Project Structure

```
mindmate/
├── src/app/                 # Next.js App Router pages
│   ├── auth/               # Authentication page
│   ├── dashboard/          # Main dashboard
│   ├── chat/               # AI chatbot interface
│   ├── activities/         # Activity logging
│   ├── exercise/           # Mindfulness exercises
│   ├── features/           # Feature showcase
│   └── api/chat/           # Chat API endpoint
├── js/                     # Vanilla JavaScript files
├── css/                    # Stylesheets
├── public/                 # Static assets
├── *.html                  # HTML pages (standalone version)
└── README.md              # This file
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update the configuration in both:
   - `src/lib/firebase.ts` (Next.js)
   - HTML files (vanilla JS)

### Gemini AI Setup (Optional)
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env.local`:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Restart the development server

## 🎯 Usage

### For Users
1. **Sign up/Login**: Create an account or sign in
2. **Dashboard**: View your wellness overview and insights
3. **Log Activities**: Track mood, exercise, sleep, and work stress
4. **Chat Support**: Get AI-powered mental health support
5. **Mindfulness**: Practice guided meditation and breathing exercises
6. **Set Goals**: Customize weekly wellness targets

### For Developers
- **Fallback System**: Chat works even without Gemini AI
- **Error Handling**: Comprehensive error handling throughout
- **Type Safety**: Full TypeScript support
- **Responsive Design**: Mobile-first approach
- **Performance**: Optimized loading and caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the `CHATBOT_SETUP.md` for detailed setup
- **Issues**: Report bugs on GitHub Issues
- **Community**: Join our discussions

## 🙏 Acknowledgments

- **Firebase**: For backend infrastructure
- **Google Gemini**: For AI capabilities
- **Tailwind CSS**: For beautiful styling
- **Next.js**: For the amazing framework
- **Mental Health Community**: For inspiration and feedback

---

**Made with ❤️ for mental wellness and better living**

*Remember: MindMate is a supportive tool and not a replacement for professional mental health care. If you're experiencing severe mental health issues, please consult with a healthcare professional.*
    -   **Work:** Monitor hours, stress levels, and productivity.
    -   **Sleep & Wellness:** Record sleep duration, quality, and overall mood.
-   **Health Analytics Dashboard:** A comprehensive dashboard that visualizes user data through charts and graphs. It provides:
    -   **AI-Powered Insights:** Personalized recommendations and pattern recognition based on user data.
    -   **Mood Trends:** A 7-day overview of the user's mood.
    -   **Activity Overview:** A summary of the user's activities.
-   **Mindful Exercises:** A collection of guided exercises to help users relax and recenter themselves, including:
    -   4-7-8 Breathing
    -   Body Scan Meditation
    -   Mindful Breathing
    -   Gratitude Meditation

## Technologies Used

-   **Frontend:**
    -   HTML
    -   CSS with [Tailwind CSS](https://tailwindcss.com/)
    -   JavaScript
-   **Backend & Database:**
    -   [Firebase Authentication](https://firebase.google.com/docs/auth) for secure user management.
    -   [Firestore](https://firebase.google.com/docs/firestore) for storing user data like chat history and activities.
-   **APIs:**
    -   [Google Gemini API](https://ai.google.dev/) for the AI chatbot's conversational capabilities.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You will need a modern web browser to run this application.

### Installation

1.  Clone the repo or download the source code.
2.  You will need to configure your own Firebase project and API keys. Open `auth.html`, `chat.html`, and `index.html` and replace the placeholder `firebaseConfig` with your own Firebase project configuration.
3.  Similarly, in `js/chat.js`, replace the placeholder `GEMINI_API_KEY` with your own Gemini API key.
4.  Open the `index.html` file in your web browser.

## Usage

1.  **Sign Up:** Create a new account using your email and a secure password.
2.  **Log In:** Access your personalized dashboard and features.
3.  **Chat:** Interact with the MindMate AI chatbot for support and guidance.
4.  **Track Activities:** Log your daily exercise, work, sleep, and mood to monitor your progress.
5.  **View Dashboard:** Get a comprehensive overview of your wellness journey and AI-driven insights.
6.  **Practice Mindfulness:** Use the guided exercises to relax and improve your mental well-being.
