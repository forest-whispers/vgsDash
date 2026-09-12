# Velozity — Real-Time Client Project Dashboard

Velozity is a full-stack project dashboard for an agency to manage clients, projects, tasks and team activity with role-based access.

The project focuses on more than CRUD — authorization, persistent activity, real-time updates, notifications and background processing work together as one system.

## Core Features

### ⚡ Authentication & Authorization

- [x] JWT authentication with access and refresh tokens
- [x] HttpOnly refresh token cookies with token rotation
- [x] Role-based access for Admin, Project Manager and Developer
- [x] Resource-level authorization for projects and tasks
- [x] Protected API routes independent of frontend visibility

### 📋 Project & Task Management

- [x] Client management
- [x] Project creation, assignment and abandonment
- [x] Task creation and assignment
- [x] Task status workflow
- [x] Priority and due-date management
- [x] Task filtering by status, priority and due-date range
- [x] Persistent task activity history

### 🔴 Real-Time Updates

- [x] Live activity feed with Socket.IO
- [x] Real-time task updates
- [x] Real-time notifications
- [x] Project-level online presence
- [x] Role-filtered realtime events
- [x] Database-backed activity catch-up after reconnect

### 🔔 Notifications

- [x] Task assignment notifications
- [x] Task review notifications
- [x] Overdue task notifications
- [x] Live unread notification count
- [x] Mark individual notifications as read
- [x] Mark all notifications as read

### 📊 Role-Specific Dashboards

- [x] Admin project and task overview
- [x] Project Manager project and task summaries
- [x] Developer assigned-task dashboard
- [x] Live active-user presence

### ⏱ Background Processing

- [x] Scheduled overdue-task detection
- [x] Persistent overdue state
- [x] Automatic overdue notifications
- [x] Idempotent processing with overlap protection

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Realtime | Socket.IO |
| Background Jobs | node-cron |
| Authentication | JWT |
| Local Database | Docker PostgreSQL |
| Production Database | Neon PostgreSQL |
| Hosting | Vercel + Render |

## Architecture

```mermaid
flowchart LR
    A[React Frontend] -->|REST| B[Express API]
    A -->|Socket.IO| C[Socket.IO]

    B --> D[Services]
    D --> E[Prisma]
    E --> F[(PostgreSQL)]

    G[node-cron] --> F
    F --> H[Notifications]
    H --> C
```

REST handles initial data loading and mutations.

Business rules live in services, PostgreSQL is the source of truth, and Socket.IO delivers realtime changes to connected clients.

The cron job runs independently of page loads and handles overdue tasks.

## Project Structure

```
client/
└── src/
    ├── app/
    ├── layouts/
    ├── features/
    ├── lib/
    └── shared/

server/
├── prisma/
└── src/
    ├── app/
    ├── modules/
    ├── shared/
    ├── socket/
    └── cron/

docker-compose.yml
package.json
```

The project follows a feature-based structure so related domain code stays together while shared concerns such as authorization, errors, configuration and middleware remain separate.

## Authentication & Authorization

**Access Token**
A short-lived JWT used as the Bearer credential for API requests.

**Refresh Token**
A longer-lived credential stored only in an HttpOnly cookie. Refresh tokens are hashed in PostgreSQL and rotated when used.

**Separate Secrets**
Access and refresh tokens use separate secrets because they have different purposes and lifetimes.

**Access Token Storage**
The access token is kept in frontend memory and localStorage so the client can restore the session after a page reload.

**Validated Configuration**
`env.ts` validates configuration once with Zod. `PORT` uses `z.coerce.number()` because environment variables arrive as strings while the application needs a number.

**Role + Resource Authorization**
Role middleware handles coarse permissions. Services additionally verify access to the specific project or task, preventing ID or token manipulation from bypassing authorization.

## Realtime

Socket.IO handles project collaboration and user-specific events.

**Main Rooms**

```
user:{userId}          → Personal notifications
project:{projectId}    → Project activity, tasks and presence
admin                  → Global activity for Admins
```

The frontend loads its initial state through HTTP and then receives incremental changes through Socket.IO.

Socket events reuse the same feature data models as HTTP responses, avoiding separate representations of the same data.

**Why Socket.IO?**
The project needs rooms, reconnection handling and acknowledgements in addition to basic WebSocket communication, making Socket.IO a better fit than building that infrastructure manually with raw WebSockets.

### Project Presence

Project presence is owned by `ProjectLayout` because presence is meaningful inside a project workspace.

The layout controls project room join/leave, so switching between projects also correctly switches the collaboration context.

```
Authenticate socket
        ↓
Authorize project access
        ↓
Join project room
        ↓
Update presence registry
        ↓
Broadcast presence change
        ↓
Acknowledge join
```

The presence registry tracks socket connections per user, so multiple tabs do not create duplicate presence or incorrectly mark a user offline.

### Offline Catch-Up

Activities are persisted in PostgreSQL before realtime delivery. After reconnecting, recent activities are fetched from the database instead of depending on an in-memory socket buffer.

## Background Job

`node-cron` runs every minute and checks for tasks whose due date has passed, are not completed and have not already been marked overdue.

The job:

1. Marks the task as `isOverdue`
2. Creates notifications for the assigned Developer and Project Manager
3. Commits the transaction
4. Sends realtime notification events

**Separate Overdue State**
`isOverdue` is separate from `TaskStatus` because workflow state and time-based state represent different concepts. A task can be `IN_PROGRESS` and overdue at the same time.

**Why node-cron?**
The requirement only needs a periodic overdue scan, so Bull/BullMQ would add durable queue infrastructure that is unnecessary for the current scope.

`noOverlap` and the persisted `isOverdue` flag prevent repeated processing.

## Database Design

```
User
├── Projects
├── Tasks
├── Activities
├── Notifications
└── Refresh Tokens

Client
└── Projects

Project
├── Client
├── Tasks
├── Activities
└── Notifications

Task
├── Project
├── Developer
├── Activities
└── Notifications
```

**Client as a Relational Entity**
Client is a separate table instead of JSON inside Project because one client can have multiple projects while keeping the relationship queryable and protected by foreign keys.

Clients are organization resources rather than authenticated application users, so there is no client registration flow.

**Project Creator vs Manager**
Projects keep both `createdById` and `managerId` because creation and management are different responsibilities.

**Project Abandonment**
Projects are abandoned instead of deleted so their tasks and activity history remain available.

**Restrictive Foreign Keys**
Client and User records cannot be deleted while existing projects still depend on them, preventing accidental loss of project history.

**Database Indexes**
Indexes support project manager/client lookups, developer task queries, status/priority/due-date filtering, time-ordered activity feeds and unread-notification queries.

## Local Setup

### Prerequisites

- Node.js
- Docker Desktop
- Git

### Environment Variables

Create `server/.env`:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/velozity
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=your-access-secret
REFRESH_TOKEN_SECRET=your-refresh-secret
```

Create `client/.env`:

```
VITE_API_URL=http://localhost:3000/api/v1
```

### Run

From the project root:

```bash
npm run install:all
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

### Local Services

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| PostgreSQL | localhost:5433 |

### Useful Commands

```bash
npm run db:down
npm run db:logs
npm run db:flush
```

### Demo Accounts

All seeded accounts use:

```
Password123!
```

| Email | Role |
| --- | --- |
| admin@demo.com | Admin |
| pm1@demo.com | Project Manager |
| pm2@demo.com | Project Manager |
| dev1@demo.com | Developer |
| dev2@demo.com | Developer |
| dev3@demo.com | Developer |
| dev4@demo.com | Developer |

The seed contains 3 clients, 3 projects, 18 tasks, overdue tasks, activity history and notifications.

## Deployment

| Service | Platform |
| --- | --- |
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Local Database | Docker PostgreSQL |

In production, `VITE_API_URL` points to the Render API and the backend allows the deployed Vercel frontend origins.

Socket.IO and the cron job run with the backend service.

## API Overview

| Module | Main Operations |
| --- | --- |
| Auth | Register, Login, Refresh, Logout, Current User |
| Users | List Users, Update Role |
| Clients | Create, List, Update, Delete |
| Projects | Create, List, Update, Abandon |
| Tasks | Create, List, Update, Assign, Status |
| Activities | Activity Feed |
| Notifications | List, Unread Count, Mark Read |
| Dashboard | Role-Specific Dashboard Data |

Base API path:

```
/api/v1
```

## Known Limitations

- Presence is stored in backend memory. A horizontally scaled deployment would need shared Socket.IO/presence infrastructure.
- `node-cron` runs with the backend process. A larger system could move scheduled work to a durable worker.
- Activity and notification side effects currently happen in the request/transaction flow. At larger scale, an outbox/worker architecture would provide stronger decoupling.

## Technical Explanation

The hardest part of this project was not building CRUD operations. It was keeping authorization, database state and realtime updates consistent. Every change needs to respect the user's role and resource access, persist the correct activity, and then reach only the users who should see it.

For the realtime feed, PostgreSQL remains the source of truth. Admins receive global activity, Project Managers receive activity from projects they manage, and Developers receive activity related to their assigned tasks. Socket.IO handles live delivery while the backend continues to enforce authorization.

The frontend loads initial state through HTTP and uses socket events for incremental updates. After reconnecting, recent activities are fetched from the database so missed events do not depend on server memory.

If this needed to scale horizontally, I would introduce Redis-backed Socket.IO coordination and move background and side-effect processing toward a durable worker or outbox pattern.

## License

No license is currently specified.