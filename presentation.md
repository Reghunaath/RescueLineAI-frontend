---
marp: true
theme: default
paginate: true
backgroundColor: #0f1923
color: #ffffff
style: |
  section {
    font-family: 'Inter', sans-serif;
  }
  h1 {
    color: #135bec;
  }
  h2 {
    color: #22c55e;
  }
  strong {
    color: #135bec;
  }
  table {
    background-color: #1a1a2e;
    border-collapse: collapse;
  }
  th {
    background-color: #2a2a3e;
    color: #135bec;
    padding: 12px;
    border: 1px solid #3a3a4e;
  }
  td {
    background-color: #2a2a3e;
    padding: 10px;
    border: 1px solid #3a3a4e;
  }
  code {
    background-color: #1a1a2e;
    padding: 20px;
    border-radius: 8px;
    display: block;
    color: #e0e0e0;
  }
  pre {
    background-color: #1a1a2e;
    padding: 20px;
    border-radius: 8px;
  }
---

<!-- _class: lead -->

# RescueLine AI

### AI-Powered Emergency Call Triage System

**Saving Lives During Disasters**

---

## The Problem

During natural disasters, emergency helplines become **overwhelmed**

- **Call volume spikes** 10-50x normal capacity
- **Long wait times** → delayed response to critical emergencies
- **Human dispatchers** cannot scale instantly
- **Life-threatening cases** may wait behind non-urgent calls

---

## Our Solution

**RescueLine AI** uses conversational AI to instantly triage every incoming call

1. **AI Voice Agent** answers immediately (zero wait time)
2. **Natural conversation** assesses urgency, location, injuries
3. **Smart routing:**
   - P0/P1 (critical) → Human dispatcher
   - P2/P3 (non-urgent) → Waitlist with safety guidance

---

## Priority System

| Priority  | Type             | Response       |
| --------- | ---------------- | -------------- |
| **P0** 🔴 | Life-threatening | Human transfer |
| **P1** 🟠 | Urgent           | Human transfer |
| **P2** 🟡 | Semi-urgent      | Waitlist       |
| **P3** 🟢 | Non-urgent       | Waitlist       |

AI makes priority decisions in **under 30 seconds**

---

## Live Dashboard

**Real-time command center** for emergency dispatchers

- **2-column Kanban board**: Waitlist | Human Agent
- **WebSocket updates**: New calls appear instantly
- **Manual override**: "Assign to Agent" button for waitlist escalation
- **MongoDB change streams**: Zero-latency data synchronization

---

## System Architecture

![Architecture](./RescueLine%20AI%20Architecture.png)

---

## Tech Stack

**Frontend**

- React + Tailwind CSS
- WebSocket for real-time updates

**Backend**

- Node.js/Express + MongoDB Atlas
- MongoDB change streams for instant updates

**AI/Voice**

- ElevenLabs conversational AI
- Twilio telephony

---

## Key Features

✅ **Zero wait time** - AI answers instantly
✅ **Accurate triage** - Natural language understanding
✅ **Scales infinitely** - AI handles unlimited concurrent calls
✅ **Real-time dashboard** - Dispatchers see everything live
✅ **Manual control** - Override AI decisions when needed
✅ **Persistent data** - All calls logged in MongoDB

---

## Impact

**During a disaster affecting 10,000 people:**

- Traditional system: 9,900+ people waiting
- RescueLine AI: **0 people waiting**

**Only critical cases (P0/P1) reach human dispatchers**
All non-critical cases managed by AI with safety guidance

---

## Demo

**Live Dashboard**

- Cards update in real-time as calls come in
- Manual assignment moves calls between columns
- Priority-based color coding (red/orange/yellow/green)
- Full call details: location, summary, timestamp

**Try it:** Call the demo number to see AI triage in action

---

<!-- _class: lead -->

# Thank You

---
