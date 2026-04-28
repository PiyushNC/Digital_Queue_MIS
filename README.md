# Digital Queue Management System

A complete, runnable queue management system for solo student demo. Built with Node.js, Express, React, and WebSocket.

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run install-all

# 2. Seed the database
npm run seed

# 3. Start both server and client
npm run dev
```

The app will open automatically on http://localhost:5173

## 📋 Features

- **Service Management**: Multiple service types (Loan, Cash, Support)
- **Counter Management**: Multiple counters per service
- **Token System**: Auto-generated tokens (A-001, B-002, etc.)
- **Auto-Assignment**: System automatically assigns tokens to available counters
- **Real-time Updates**: WebSocket broadcasts queue status to display boards
- **Staff Dashboard**: Simple interface to start/complete services
- **Kiosk**: Customer-facing page to generate tokens
- **Display Board**: Real-time queue status display
- **Admin Dashboard**: View stats and system status

## 🧪 Demo Flow

### 1. Open Kiosk (http://localhost:5173/kiosk)
- Select a service
- Get a token (e.g., A-001)
- See your position in queue

### 2. Login as Staff (http://localhost:5173/login)
- Email: `staff1@demo.com` or `staff2@demo.com`
- Password: `staff123`
- Select "Staff" tab

### 3. Staff Dashboard (http://localhost:5173/staff)
- Automatically shows next token when available
- Click "Start Service" → "Complete Service"
- Next token auto-assigns to counter

### 4. Open Display Board (http://localhost:5173/display)
- Real-time updates via WebSocket
- Shows "Now Serving" and "Next in Queue"

### 5. Admin Dashboard (http://localhost:5173/admin)
- Email: `admin@demo.com`
- Password: `admin123`
- View services, counters, and stats

## 📚 System Architecture

### Backend (Node.js + Express)
- **Models**: Admin, Service, Counter, Token, Staff
- **QueueManager**: FIFO queue logic + auto-assignment
- **WebSocket**: Real-time broadcast of queue updates
- **SQLite**: Single database file (`db.sqlite`)

### Frontend (React + Vite)
- **Pages**: Kiosk, Display, Staff, Admin, Login
- **Real-time**: WebSocket connection to display board
- **Styling**: Tailwind CSS

## 🔑 Key Logic

1. **One Queue Per Service**: Each service has its own FIFO queue
2. **Auto-Assignment**: When counter is AVAILABLE, next token is automatically assigned
3. **Token Lifecycle**: WAITING → CALLED → IN_PROGRESS → COMPLETED
4. **Multiple Counters**: Many counters can serve same service
5. **Real-time Broadcast**: All updates pushed to display boards via WebSocket

## 📂 Project Structure

```
prjt/
├── server/
│   ├── models/
│   │   ├── index.js (connections)
│   │   ├── Admin.js
│   │   ├── Service.js
│   │   ├── Counter.js
│   │   ├── Token.js
│   │   └── Staff.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── services.js
│   │   ├── counters.js
│   │   ├── tokens.js
│   │   ├── staff.js
│   │   └── admin.js
│   ├── middleware/
│   │   └── auth.js
│   ├── QueueManager.js
│   ├── websocket.js
│   └── server.js
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Kiosk.jsx
│   │   │   ├── Display.jsx
│   │   │   ├── Staff.jsx
│   │   │   └── Admin.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── api.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── seed.js
├── package.json
└── README.md
```

## 🔐 Login Credentials

### Admin
- Email: `admin@demo.com`
- Password: `admin123`

### Staff 1
- Email: `staff1@demo.com`
- Password: `staff123`
- Counter: #1 (Loan Services)

### Staff 2
- Email: `staff2@demo.com`
- Password: `staff123`
- Counter: #2 (Cash Withdrawal)

## 🛠️ Tech Stack

**Backend**
- Node.js + Express
- Sequelize ORM
- SQLite
- WebSocket (ws)
- JWT + bcryptjs
- dotenv

**Frontend**
- React + Vite
- Tailwind CSS
- Axios
- React Router v6

## 📝 Endpoints

### Auth
- `POST /api/auth/admin/login`
- `POST /api/auth/staff/login`

### Services
- `GET /api/services`
- `POST /api/services` (admin)

### Counters
- `GET /api/counters`
- `POST /api/counters` (admin)
- `PATCH /api/counters/:id` (admin)

### Tokens
- `POST /api/tokens/generate`
- `GET /api/tokens/:serviceId`
- `GET /api/tokens/:serviceId/queue`
- `PATCH /api/tokens/:id/start` (staff)
- `PATCH /api/tokens/:id/complete` (staff)

### Admin
- `GET /api/admin/dashboard`

### Staff
- `GET /api/staff`

## 🚦 WebSocket Events

Connect to `ws://localhost:5000` and receive real-time updates:

```json
{
  "nowServing": [
    { "counterNo": 1, "tokenNo": "A-001" }
  ],
  "waiting": [
    { "tokenNo": "A-002" },
    { "tokenNo": "A-003" }
  ]
}
```

## ⚙️ Running Individual Services

### Server Only
```bash
cd server
npm install
npm run dev
```

### Client Only
```bash
cd client
npm install
npm run dev
```

## 🎯 What Makes This Demo-Ready

✅ Complete working system (no TODOs or stubs)
✅ Real-time queue management
✅ Auto-assignment of tokens
✅ Responsive, mobile-friendly UI
✅ Simple but clean code logic
✅ Single SQLite database (no setup needed)
✅ Pre-seeded data
✅ Clear demo flow

Enjoy your Queue Management System! 🎉
