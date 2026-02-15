# RescueLine AI Dashboard

Real-time emergency call triage dashboard for disaster response coordination.

## Details

- **Problem:** Emergency helplines get overwhelmed during disasters. RescueLine AI uses an AI voice agent to instantly triage incoming calls, prioritize life-threatening emergencies, and route them to human responders while managing non-critical cases on a waitlist.

- **Tech Stack:**

  - Frontend: React + Tailwind CSS with WebSocket for real-time updates
  - Backend: Node.js/Express with MongoDB Atlas
  - AI Integration: ElevenLabs conversational AI agent for call triage
  - Infrastructure: Twilio for telephony, ngrok for webhook handling

- **Extension Type:** Full-stack dashboard with real-time data synchronization using MongoDB change streams

- **Future Improvements:**
  - Add call recording playback
  - Implement dispatcher assignment workflow
  - Build analytics dashboard for call volume trends
  - Add manual status override with drag-and-drop

## Set Up Instructions

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- ElevenLabs account (for AI agent)
- Twilio account (for phone number)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Reghunaath/RescueLineAI-frontend.git
cd RescueLineAI-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Update MongoDB connection string in `server/index.js`:

```javascript
const MONGO_URI = "your-mongodb-atlas-connection-string";
```

4. Start the backend server:

```bash
npm run server
```

5. In a new terminal, start the frontend:

```bash
npm run dev
```

6. Open `http://localhost:5173` in your browser

### Configuration

Toggle between mock data and live backend in `src/config.js`:

```javascript
export const USE_MOCK_DATA = false; // false = live data, true = mock data
```

## Architecture

```
ElevenLabs AI Agent → Twilio → ngrok Backend → MongoDB Atlas
                                                     ↓
                                          MongoDB Change Stream
                                                     ↓
                                            Local Express Server
                                                     ↓
                                              WebSocket
                                                     ↓
                                            React Dashboard
```

- **Call Flow:** Caller → Twilio number → ElevenLabs AI → Priority assignment (P0-P3)
- **Data Flow:** AI agent → webhook → MongoDB → change stream → dashboard (real-time)
- **Priority Logic:** P0/P1 calls route to human agents, P2/P3 go to waitlist

## Collaborators

- Reghunaath
- Naga Pavithra Lagisetty
