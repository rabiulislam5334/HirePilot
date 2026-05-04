# 🚀 HirePilot — AI-Powered Career OS

<div align="center">

![HirePilot Banner](https://img.shields.io/badge/HirePilot-AI%20Career%20OS-10a37f?style=for-the-badge&logo=rocket&logoColor=white)

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=flat-square&logo=socket.io)](https://socket.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**HirePilot helps job seekers optimize resumes with AI, practice realistic mock interviews, and track applications — all in one unified dashboard.**

[Live Demo](https://hirepilot-a0rh.onrender.com) · [Report Bug](https://github.com/rabiulislam5334/HirePilot/issues) · [Request Feature](https://github.com/rabiulislam5334/HirePilot/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Database ERD](#database-erd)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Setup](#docker-setup)
- [API Routes](#api-routes)
- [Deployment](#deployment)
- [Screenshots](#screenshots)

---

## 🎯 Overview

HirePilot is a full-stack SaaS platform built with **Next.js 16**, **Prisma 7**, **PostgreSQL**, **Redis**, and **Socket.io**. It uses **Groq AI (LLaMA 3.3)** for intelligent resume analysis, mock interview generation, and career coaching.

Key differentiators:
- 🤖 **AI-first** — every feature is powered by LLaMA 3.3 via Groq
- ⚡ **Real-time** — Socket.io + BullMQ for live leaderboard, chat, and notifications
- 🎮 **Gamified** — XP, levels, badges, weekly leaderboard
- 📊 **Data-driven** — ATS scores, interview analytics, match percentages

---

## ✨ Features

| Feature | Description | Status |
|---|---|---|
| **Resume Optimizer** | PDF upload → AI ATS scoring, bullet rewriting, keyword gaps | ✅ |
| **Mock Interviews** | Adaptive AI questions, timer, STAR method guide, voice input | ✅ |
| **Interview Results** | Radar chart, filler word analysis, STAR scoring, transcript review | ✅ |
| **Job Search** | Adzuna API integration, AI match score, one-click tracker | ✅ |
| **Job Tracker** | Kanban board (Wishlist → Applied → Interview → Offer → Rejected) | ✅ |
| **AI Career Coach** | Persistent chat with context-aware career advice | ✅ |
| **Cover Letter AI** | Personalized cover letters with tone & template selection | ✅ |
| **Leaderboard** | Real-time global ranking with Socket.io | ✅ |
| **Community Chat** | Multi-room peer chat with real-time messaging | ✅ |
| **Notifications** | Real-time notification system | ✅ |
| **Billing** | Stripe subscription integration (Free / Pro / Team) | ✅ |
| **Profile** | Career goals, skills, target roles, social links | ✅ |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.2 | React framework with App Router |
| TypeScript | 5.0 | Type safety |
| Tailwind CSS | 4.2 | Styling |
| Lucide React | 1.7 | Icons |
| Sonner | 2.0 | Toast notifications |
| Socket.io Client | 4.8 | Real-time UI updates |
| Clerk | 7.0 | Authentication |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22 | Runtime |
| Prisma | 7.8 | ORM |
| PostgreSQL | 16 | Primary database |
| pgvector | — | Semantic job matching embeddings |
| Redis | 7 | Caching, BullMQ, leaderboard sorted sets |
| BullMQ | 5.5 | Background job processing |
| Socket.io | 4.8 | Real-time communication |
| ioredis | 5.10 | Redis client |

### AI & External APIs
| Service | Purpose |
|---|---|
| **Groq (LLaMA 3.3-70b)** | Resume analysis, interview questions, coach, cover letters |
| **Adzuna API** | Real job listings |
| **Stripe** | Subscription billing |
| **Clerk** | Auth, user management |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local development |
| Render | Production deployment |
| esbuild | Custom server compilation |

---

## 🏗 Project Architecture

```
hirepilot/
│
├── app/                          # Next.js App Router
│   ├── (landing)/                # Public pages
│   │   └── page.tsx              # Landing page
│   ├── api/                      # API Routes
│   │   ├── jobs/search/          # Adzuna job search
│   │   └── stripe/               # Stripe webhooks & checkout
│   ├── dashboard/                # Protected dashboard
│   │   ├── page.tsx              # Dashboard home
│   │   ├── resumes/              # Resume management
│   │   ├── mock-interviews/      # Interview system
│   │   │   ├── page.tsx          # Setup + history
│   │   │   ├── session/          # Active interview
│   │   │   └── result/           # Results & feedback
│   │   ├── jobs/                 # Job search
│   │   ├── tracker/              # Kanban job tracker
│   │   ├── coach/                # AI career coach
│   │   ├── cover-letter/         # Cover letter generator
│   │   ├── leaderboard/          # Global rankings
│   │   ├── chat/                 # Community chat
│   │   ├── notifications/        # Notifications
│   │   ├── profile/              # User profile
│   │   ├── billing/              # Stripe billing
│   │   └── settings/             # App settings
│   └── actions/                  # Server Actions
│       ├── resume-actions.ts
│       ├── resume-ai-actions.ts
│       ├── interview-actions.ts
│       ├── job-actions.ts
│       ├── coach-actions.ts
│       ├── cover-letter-actions.ts
│       ├── notification-actions.ts
│       ├── chat-actions.ts
│       ├── billing-actions.ts
│       └── profile-actions.ts
│
├── components/
│   ├── landing/                  # Landing page sections
│   ├── layout/                   # Sidebar, Navbar, Shell
│   ├── resume/                   # Resume components
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── prisma.ts                 # Prisma client (PrismaPg adapter)
│   ├── redis.ts                  # ioredis client
│   ├── stripe.ts                 # Stripe client
│   ├── utils.ts                  # Utilities
│   └── services/                 # Business logic layer
│       ├── aiService.ts          # Groq AI (generateText + JSON.parse)
│       ├── resumeService.ts      # Resume CRUD + AI analysis
│       ├── interviewService.ts   # Interview sessions + leaderboard
│       └── jobMatchService.ts    # Job matching + Kanban
│
├── lib/queues/
│   └── index.ts                  # BullMQ queue definitions
│
├── workers/
│   └── interviewWorker.ts        # BullMQ workers
│       # - interview-evaluation
│       # - resume-analysis
│       # - leaderboard-update
│
├── hooks/
│   └── useSocket.ts              # Socket.io client hooks
│
├── types/
│   └── global.d.ts               # Global type declarations
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
│
├── server.ts                     # Custom Next.js server
│                                 # (Socket.io + BullMQ workers)
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Local dev environment
└── prisma.config.ts              # Prisma 7 config
```

### Request Flow

```
Browser
  │
  ├─► Next.js App Router (SSR/Client Components)
  │     │
  │     ├─► Server Actions (app/actions/)
  │     │     │
  │     │     ├─► Service Layer (lib/services/)
  │     │     │     │
  │     │     │     ├─► Prisma ORM → PostgreSQL
  │     │     │     ├─► ioredis → Redis
  │     │     │     ├─► BullMQ Queues → Background Jobs
  │     │     │     └─► Groq AI API
  │     │     │
  │     │     └─► Stripe API
  │     │
  │     └─► API Routes (app/api/)
  │           ├─► Adzuna Job Search API
  │           └─► Stripe Webhooks
  │
  └─► Socket.io (server.ts)
        ├─► Leaderboard room (real-time rank updates)
        ├─► Interview session room (evaluation progress)
        ├─► Chat rooms (peer messaging)
        └─► Notifications (personal events)
```

---

## 🗄 Database ERD

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATABASE SCHEMA                              │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│       Account        │
├──────────────────────┤
│ id          (PK)     │◄──────────────────────────────────────┐
│ clerkId     (UQ)     │                                       │
│ email       (UQ)     │                                       │
│ name                 │                                       │
│ image                │                                       │
│ subscription         │  "free" | "pro" | "team"             │
│ stripeCustomerId     │                                       │
│ createdAt            │                                       │
│ updatedAt            │                                       │
└──────────────────────┘                                       │
         │ 1                                                   │
         │                                                     │
    ┌────┴──────────────────────────────────────┐              │
    │                                           │              │
    ▼ N                                         ▼ N            │
┌──────────────────┐               ┌────────────────────┐     │
│     Resume       │               │  InterviewSession  │     │
├──────────────────┤               ├────────────────────┤     │
│ id        (PK)   │               │ id         (PK)    │     │
│ userId    (FK)───┼───────────────┤ userId     (FK)────┼─────┘
│ name             │               │ jobTitle           │
│ originalFileName │               │ company            │
│ parsedText       │               │ category           │
│ atsScore         │               │ difficulty         │
│ skills    []     │               │ questions  Json[]  │
│ feedback         │               │ transcript Json?   │
│ jsonData         │               │ score              │
│ embedding vector │               │ feedback           │
│ createdAt        │               │ fillerWordCount    │
│ updatedAt        │               │ speakingPaceWpm    │
└──────────────────┘               │ confidenceScore    │
         │ 1                       │ clarityScore       │
         │                         │ status             │
         ▼ N                       │ startedAt          │
┌──────────────────┐               │ completedAt        │
│   Application    │               └────────────────────┘
├──────────────────┤
│ id        (PK)   │               ┌────────────────────┐
│ userId    (FK)   │               │    Leaderboard     │
│ jobId     (FK)───┼──┐            ├────────────────────┤
│ resumeId  (FK)   │  │            │ id         (PK)    │
│ status           │  │            │ userId     (FK,UQ) │
│ matchScore       │  │            │ totalScore         │
│ notes            │  │            │ xp                 │
│ appliedAt        │  │            │ level              │
│ interviewDate    │  │            │ rank               │
│ nextStep         │  │            │ weeklyScore        │
└──────────────────┘  │            │ badges    []       │
                      │            │ updatedAt          │
                      ▼            └────────────────────┘
             ┌─────────────────┐
             │   JobPosting    │   ┌────────────────────┐
             ├─────────────────┤   │     CoachChat      │
             │ id       (PK)   │   ├────────────────────┤
             │ title           │   │ id         (PK)    │
             │ company         │   │ userId     (FK)    │
             │ description     │   │ role               │
             │ requirements    │   │ content            │
             │ location        │   │ createdAt          │
             │ salaryRange     │   └────────────────────┘
             │ embedding vector│
             │ createdAt       │   ┌────────────────────┐
             └─────────────────┘   │   Notification     │
                                   ├────────────────────┤
                                   │ id         (PK)    │
             ┌─────────────────┐   │ userId     (FK)    │
             │   ChatMessage   │   │ type               │
             ├─────────────────┤   │ title              │
             │ id       (PK)   │   │ message            │
             │ roomId          │   │ isRead             │
             │ content         │   │ link               │
             │ senderId  (FK)  │   │ createdAt          │
             │ createdAt       │   └────────────────────┘
             └─────────────────┘

Redis Data Structures:
  hirepilot:leaderboard:global          → ZSET (score → userId)
  hirepilot:leaderboard:weekly:{year}:{week} → ZSET (score → userId)

BullMQ Queues:
  interview-evaluation    → AI scoring after interview
  resume-analysis         → Background ATS analysis
  leaderboard-update      → Score update + socket broadcast
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Git

### 1. Clone the repository

```bash
git clone https://github.com/rabiulislam5334/HirePilot.git
cd HirePilot
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all required values (see [Environment Variables](#environment-variables)).

### 4. Start Docker services

```bash
docker-compose up -d db redis
```

### 5. Initialize database

```bash
npx prisma generate
npx prisma db push
```

### 6. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hirepilot

# Redis
REDIS_URL=redis://localhost:6380
REDIS_HOST=localhost
REDIS_PORT=6380

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL=/

# AI
GROQ_API_KEY=gsk_xxxxx

# Job Search
NEXT_PUBLIC_ADZUNA_APP_ID=xxxxx
NEXT_PUBLIC_ADZUNA_APP_KEY=xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PORT=3000
```

---

## 🐳 Docker Setup

### Local Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Rebuild after changes
docker-compose up --build
```

### Services

| Service | Port | Description |
|---|---|---|
| `app` | 3000 | Next.js + Socket.io + BullMQ |
| `db` | 5432 | PostgreSQL 16 with pgvector |
| `redis` | 6380 | Redis 7 (BullMQ + leaderboard) |

### Docker Architecture

```
docker-compose
├── app (hirepilot-app)
│   ├── Next.js server
│   ├── Socket.io server
│   └── BullMQ workers
├── db (pgvector/pgvector:pg16)
└── redis (redis:7-alpine)
```

---

## 📡 API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/jobs/search` | Search jobs via Adzuna API |
| `POST` | `/api/stripe/checkout` | Create Stripe checkout session |
| `POST` | `/api/stripe/portal` | Open Stripe customer portal |
| `POST` | `/api/stripe/webhook` | Handle Stripe events |

### Socket.io Events

| Event (Client → Server) | Description |
|---|---|
| `join_leaderboard` | Join leaderboard room |
| `leave_leaderboard` | Leave leaderboard room |
| `join_session` | Join interview session room |
| `join_chat_room` | Join a chat channel |
| `send_chat_message` | Broadcast chat message |
| `join_notifications` | Subscribe to personal notifications |

| Event (Server → Client) | Description |
|---|---|
| `leaderboard_updated` | New score on leaderboard |
| `online_count` | Viewers count update |
| `session_evaluated` | Interview evaluation complete |
| `chat_message` | New chat message |
| `room_count` | Chat room member count |
| `new_notification` | Personal notification |

---

## 🌐 Deployment

### Render (Production)

1. Connect GitHub repository to Render
2. Select **Docker** environment
3. Add all environment variables
4. Deploy

**Build:** Dockerfile (multi-stage, esbuild compiled)
**Start:** `node server.js`
**Region:** Singapore (Southeast Asia)

### Post-deployment

```bash
# Run database migrations
npx prisma db push

# Set up Clerk domain
# clerk.com/dashboard → Domains → Add your Render URL

# Set up Stripe webhook
# dashboard.stripe.com → Webhooks → Add endpoint
# URL: https://your-app.onrender.com/api/stripe/webhook
```

---

## 📸 Screenshots

| Page | Description |
|---|---|
| Landing | AI-powered career platform homepage |
| Dashboard | Stats, quick actions, performance chart |
| Resume Optimizer | ATS score, strengths, improved bullets |
| Mock Interview | Adaptive questions, timer, STAR guide |
| Interview Results | Radar chart, AI feedback, transcript |
| Job Search | Adzuna integration, AI match score |
| Job Tracker | Kanban board with drag & drop |
| Leaderboard | Real-time global rankings |
| AI Coach | Persistent career coaching chat |
| Cover Letter | AI-generated personalized letters |
| Community Chat | Multi-room peer messaging |
| Billing | Stripe subscription plans |

---

## 🗺 Roadmap

- [x] Resume AI optimization
- [x] Mock interviews with AI evaluation
- [x] Real-time leaderboard (Socket.io)
- [x] Job search + tracker
- [x] AI career coach
- [x] Cover letter generator
- [x] Community peer chat
- [x] Stripe billing
- [ ] Video interview analysis
- [ ] LinkedIn profile optimizer
- [ ] Company research AI
- [ ] Mobile app (React Native)

---

## 👨‍💻 Author

**Rabiul Islam**
- GitHub: [@rabiulislam5334](https://github.com/rabiulislam5334)
- LinkedIn: [linkedin.com/in/rabiul](https://linkedin.com/in/rabiul)
- Email: rabiulislam5334@gmail.com

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using Next.js, Prisma, Groq AI, and Socket.io</p>
  <p>⭐ Star this repo if you found it helpful!</p>
</div>
