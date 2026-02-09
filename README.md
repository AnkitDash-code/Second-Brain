<p align="center">
  <img src="https://img.shields.io/badge/Gemini-AI%20Powered-blue?style=for-the-badge&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/Convex-File%20Storage-FF6600?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
</p>

# 🧠 Second Brain

> **An AI-powered external memory system designed to help users—especially those with cognitive challenges like Alzheimer's—capture, organize, and recall their daily life through text, voice, images, and video.**

Second Brain is a full-stack web application that acts as a digital memory companion. It uses **Google Gemini** for multimodal AI analysis, **Firebase** for authentication and data storage, and **Convex** for scalable file storage.

---

## ✨ Features

### 🎤 Multimodal Memory Capture
Capture memories in four distinct formats, each analyzed by Gemini AI:

| Input Type | How It Works |
|---|---|
| **📝 Text** | Type a note → AI extracts tags, sentiment, entities, and action items |
| **🎙️ Audio** | Record voice → Gemini transcribes and analyzes the content |
| **📸 Image** | Take/upload a photo → AI describes the scene and extracts context |
| **🎬 Video** | Record/upload video → AI summarizes what happens in the clip |

### 🤖 AI-Powered Recall (Chat)
Ask your Second Brain questions in natural language:
- *"Where did I leave my keys?"*
- *"What did I discuss with Sarah last week?"*
- Uses all stored memories as context for accurate, cited answers.

### 🎙️ Live Voice Mode
Real-time conversational AI using **Gemini Live API**:
- Bidirectional audio streaming via WebSocket
- Speak naturally and get instant voice responses
- Built on `@google/genai` Live SDK

### 📖 Story Mode
Transform scattered memories into cohesive narratives:
- Select time ranges (Last 7 Days, 30 Days, All Time)
- Gemini weaves memories into a first-person story
- **Storyteller Avatar**: Generate a video avatar using **Veo 3.1**
- **Text-to-Speech**: Listen to your story via **Gemini TTS**

### 🔍 Smart Dashboard
- **Semantic Search**: Search by content, tags, or entities
- **Caregiver Mode**: Toggle to verify memories for accuracy (designed for caregivers of Alzheimer's patients)
- **Task Filter**: View only actionable items (tasks and events)
- **Memory Cards**: Rich cards showing sentiment, tags, confidence scores, and media

### 👥 People Insights
Visual bubble map of people mentioned across your memories:
- Frequency-weighted sizing (more mentions = bigger bubble)
- Color-coded categories
- Auto-extracted from Gemini entity analysis

### ♿ Accessibility
- **High Contrast Mode**: WCAG-compliant color scheme with yellow text on black
- **Large Text**: Adjustable font sizes
- Custom scrollbars and touch-friendly elements
- Designed for elderly and cognitively impaired users

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (React 19)                │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌────────┐ │
│  │ Landing  │  │Capture │  │Dashboard │  │ Recall │ │
│  │  Page    │  │  Page  │  │   Page   │  │  Chat  │ │
│  └──────────┘  └───┬────┘  └────┬─────┘  └───┬────┘ │
│                    │            │             │       │
│  ┌─────────────────┴────────────┴─────────────┴────┐ │
│  │              Services Layer                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │ │
│  │  │firebase  │  │ gemini   │  │ convexClient │   │ │
│  │  │  .ts     │  │  .ts     │  │    .ts       │   │ │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │ │
│  │       │              │               │           │ │
│  └───────┼──────────────┼───────────────┼───────────┘ │
└──────────┼──────────────┼───────────────┼─────────────┘
           │              │               │
     ┌─────▼─────┐  ┌────▼─────┐   ┌─────▼──────┐
     │ Firebase  │  │  Gemini  │   │   Convex   │
     │ Auth +    │  │   API    │   │  Storage   │
     │ Firestore │  │(1.5 Pro) │   │  + HTTP    │
     └───────────┘  └──────────┘   └────────────┘
```

### Data Flow

1. **Capture**: User inputs text/audio/image/video → Gemini AI analyzes it → Metadata saved to Firestore → Media files uploaded to Convex
2. **Recall**: User asks a question → All memories fetched from Firestore → Sent as context to Gemini → AI responds with cited answer
3. **Stories**: Memories filtered by time range → Gemini generates narrative → Optional TTS/Video avatar generation

---

## 📁 Project Structure

```
second-brain/
├── index.html            # Entry HTML with Tailwind CDN & import maps
├── index.tsx             # React root with ConvexProvider
├── index.css             # Custom animations (float, fade-in, glow)
├── App.tsx               # Router setup (Landing → Auth → Dashboard)
├── types.ts              # TypeScript interfaces (Memory, ChatMessage, etc.)
├── vite.config.ts        # Vite configuration
│
├── pages/
│   ├── LandingPage.tsx   # Animated marketing page with scroll effects
│   ├── Onboarding.tsx    # Firebase Auth (Sign Up / Sign In)
│   ├── Dashboard.tsx     # Memory timeline with search & caregiver mode
│   ├── Capture.tsx       # Multi-modal memory input (text/audio/image/video)
│   ├── Recall.tsx        # AI chat interface for memory retrieval
│   ├── Insights.tsx      # People/entity visualization
│   └── Stories.tsx       # AI story generation with TTS & video avatar
│
├── components/
│   ├── Layout.tsx        # App shell with navigation
│   ├── Navigation.tsx    # Bottom nav bar
│   ├── MemoryCard.tsx    # Rich memory display card
│   └── LiveVoice.tsx     # Real-time voice chat (Gemini Live API)
│
├── services/
│   ├── firebase.ts       # Firebase init (Auth + Firestore)
│   ├── store.ts          # Firestore CRUD (addMemory, getAllMemories, etc.)
│   ├── gemini.ts         # Gemini API (analyze, chat, stories, TTS, Veo)
│   └── convexClient.ts   # Convex React client initialization
│
├── contexts/
│   └── AuthContext.tsx    # Firebase auth state provider
│
└── convex/
    ├── schema.ts         # Convex DB schema (files table)
    ├── files.ts          # Mutations/queries (upload URL, save, delete)
    └── http.ts           # HTTP action for serving stored files
```

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 | UI framework |
| **Build Tool** | Vite 6 | Dev server & bundling |
| **Styling** | Tailwind CSS (CDN) | Utility-first CSS |
| **Routing** | React Router v7 | Client-side routing |
| **Icons** | Lucide React | Icon library |
| **Auth** | Firebase Auth | Email/password authentication |
| **Database** | Cloud Firestore | Memory metadata storage |
| **File Storage** | Convex | Media file storage (images, audio, video) |
| **AI Model** | Gemini 3 Flash Preview | Text, image, audio, video analysis |
| **Live Voice** | Gemini Live API | Real-time bidirectional audio |
| **TTS** | Gemini 2.5 Flash TTS | Text-to-speech for stories |
| **Video Gen** | Veo 3.1 Fast | AI avatar video generation |
| **Language** | TypeScript | Type safety |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm**
- A **Firebase** project with Authentication and Firestore enabled
- A **Google AI Studio** API key (for Gemini)
- A **Convex** account (free tier available at [convex.dev](https://convex.dev))

### 1. Clone the Repository

```bash
git clone https://github.com/AnkitDash-code/Second-Brain.git
cd Second-Brain/code/second-brain
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Enable **Email/Password** authentication
4. Create a **Firestore** database
5. Get your web app config from Project Settings

### 4. Set Up Convex

```bash
npx convex dev
```

This will:
- Prompt you to log in with GitHub
- Create a new Convex project
- Auto-add `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL` to `.env.local`
- Generate the `convex/_generated/` folder
- Deploy your backend functions

> **Note**: Keep `npx convex dev` running during development. For production, use `npx convex deploy`.

### 5. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Gemini API Key (from Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key

# Firebase Config
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Convex (auto-populated by `npx convex dev`)
CONVEX_DEPLOYMENT=dev:your-deployment-name
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### 6. Create Firestore Index

Create a **composite index** on the `memories` collection:
- Field 1: `userId` (Ascending)
- Field 2: `timestamp` (Descending)

You can do this via the Firebase Console or by clicking the link in the browser console error when you first load the dashboard.

### 7. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 📸 Key Pages

### Landing Page
A premium animated page with floating UI cards, gradient text, and scroll-triggered animations. Introduces the product and drives sign-ups.

### Capture Page
Four-tab interface for capturing memories:
- **Text**: Type and submit
- **Audio**: Record via microphone (WebRTC)
- **Image**: Upload or capture via camera
- **Video**: Upload or record via camera

### Dashboard
Timeline view of all memories with:
- Full-text search across content, tags, and entities
- Caregiver mode toggle for memory verification
- Task filter to surface actionable items

### Recall Chat
Conversational AI interface:
- Type questions about your memories
- AI responds with contextual, cited answers
- Live Voice mode for hands-free interaction

---

## 🔐 Security & Privacy

- **Authentication**: All data is user-scoped via Firebase Auth
- **Data Isolation**: Each memory is stored with a `userId` field, queries are filtered by authenticated user
- **Caregiver Mode**: Designed for trusted caregivers to verify memory accuracy without modifying content
- **No External Data Sharing**: All AI processing is done via Google's Gemini API (your data, your API key)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is part of the Gemini API Developer Competition.

---

<p align="center">
  Built with ❤️ using <b>Gemini AI</b>, <b>Firebase</b>, and <b>Convex</b>
</p>
