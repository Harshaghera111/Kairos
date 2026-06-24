<div align="center">
<img width="1200" height="475" alt="Kairos Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Kairos — Your Personal AI Execution Coach

**Kairos** is an empathetic, premium AI companion that structures roadmaps with built-in stress buffers to safeguard due dates and guide users through life blockades. It acts as an execution coach rather than a static project dashboard.

## 🚀 Core Features

- **Next Best Action Hero**: Prominently guides users to the single most critical task at any given moment to preserve momentum.
- **AI Extraction & Roadmap Building**: Translates goal descriptions written in plain language into actionable milestones, estimating workloads and creating timeline buffers.
- **Empathetic Narrative Coach Feed**: Structures AI decisions in a supportive diary style ("Coach's Diary"), detailing buffer reassessments and recovery steps.
- **Stress Test Simulator**: Simulates real-life disruptions (e.g., sick days, laptop crash, surprise exams) to project buffer stability, auto-drafting extension emails or recovery steps.
- **Firebase Auth & Firestore Sync**: Features seamless cloud database sync with fallback local sandbox storage for quick evaluation.

---

## 🛠️ Technology Stack

1. **Frontend**: React (v19) + Tailwind CSS (v4) + Lucide Icons + Motion (Animations)
2. **Backend**: Node.js Express API + ESBuild
3. **AI Orchestration**: Google GenAI SDK (Gemini 3.5 Flash Model)
4. **Database & Auth**: Firebase Authentication & Firestore Persistence

---

## 💻 Local Setup and Run

### Prerequisites
- Node.js (v18+)

### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file (copy from `.env.example`) and configure:
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
   - Firebase keys (automatically synced if running inside the AI Studio frame).

3. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to inspect.

4. **Verify Lints & Compile**:
   ```bash
   npm run lint
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```
├── assets/                       # UI visual assets
├── dist/                         # Compiled bundle (client + server.cjs)
├── src/
│   ├── components/
│   │   ├── Sidebar.tsx           # Empathetic side navigation
│   │   ├── CommitmentForm.tsx    # Conversational goal planner form
│   │   ├── ActivityLog.tsx       # AI narrative coaching log
│   │   └── WarpConsole.tsx       # Disruption simulator console
│   ├── lib/
│   │   └── firebase.ts           # Firebase Client initialization & mock sandbox fallback
│   ├── App.tsx                   # Main layout container & state coordinator
│   ├── types.ts                  # Type definitions
│   └── main.tsx                  # Client entrypoint
├── server.ts                     # Express server & Gemini API structured output middleware
├── firestore.rules               # Firestore security configuration rules
├── firebase-applet-config.json   # Firebase configurations schema
└── package.json                  # Dependencies and scripts
```
