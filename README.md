# North

A calm, invite-only collaborative Kanban board built for small, focused teams.

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4
- **Database** — PostgreSQL via Prisma 6
- **Real-time** — Socket.io 4 (custom Node.js server)
- **State** — Zustand 5
- **Drag & Drop** — @dnd-kit
- **Auth** — Custom JWT (`jose` + `bcryptjs`)
- **Email** — Resend

## Features

- Multi-workspace support with role-based access (Owner, Admin, Member)
- Real-time collaborative boards — see changes from teammates instantly
- Drag-and-drop columns and cards
- Card details: priority, due date, assignees, description, activity feed
- Presence indicators showing who is viewing a board
- Email invite flow with expiring tokens
- Multiple UI themes (light, dark, and more)
- Keyboard shortcuts

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (e.g. [Supabase](https://supabase.com))
- [Resend](https://resend.com) API key (for invite emails)

### Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/FIZZYfizzz/North.git
   cd North
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   Create a `.env.local` file in the root:

   ```env
   DATABASE_URL="your-postgresql-connection-string"
   JWT_SECRET="your-secret-string"
   JWT_EXPIRES_IN="7d"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   RESEND_API_KEY="your-resend-api-key"
   ```

4. **Run database migrations**

   ```bash
   npm run db:migrate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/                  # Next.js App Router pages and API routes
  (auth)/             # Login and register
  (dashboard)/        # Workspace and board views
  api/                # REST API route handlers
  invite/             # Invite acceptance flow
  onboarding/         # New user workspace creation
components/
  board/              # Board, column, card, modal, activity
  layout/             # Sidebar, theme toggle
  ui/                 # Design system primitives
  workspace/          # Workspace-level components
hooks/                # useBoard, useSocket, useKeyboardShortcuts
lib/                  # Auth, db, email, utils
prisma/               # Database schema
server/               # Custom HTTP + Socket.io server
services/             # Business logic (board, card, workspace)
types/                # Shared TypeScript types and socket event contracts
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:push` | Push schema changes without migration |
| `npm run db:studio` | Open Prisma Studio |
