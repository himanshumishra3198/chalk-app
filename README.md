# 🖊️ Chalk – Real-Time Collaborative Whiteboard

Chalk is a real-time collaborative whiteboard app where users can draw, write, and brainstorm together in a shared space — all powered by WebSockets, Redis, and PostgreSQL.

Built with **Next.js**, **Node.js**, **WebSockets**, **Redis**, and **PostgreSQL**, Chalk delivers a fast and seamless real-time canvas experience.

---

## 🚀 Features

- 🎨 Real-time collaborative drawing
- 🧠 Multi-user whiteboard rooms
- 🖼️ Excalidraw-style canvas
- 💾 Persistent canvas state via Redis
- 🔒 Room-based architecture
- ⚡ Powered by WebSockets

---

## 🛠️ Getting Started

Follow these steps to run the project locally:

### 1. Clone the repository

```bash
git clone repo
cd chalk
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up PostgreSQL

You can use either:

Option A: Local PostgreSQL via Docker
Update your .env file with the connection string:

```bash
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/postgres
```

Option B: Use an online PostgreSQL provider like Neon
Create a database and copy the connection string into your .env file:

```ini
DATABASE_URL=your_neon_database_url
```

### 4. Set up Redis (Required)

Use Docker to run Redis, and make sure to name the container redis_server:

```bash
docker run --name redis_server -p 6379:6379 -d redis
```

### 5. Run the development server

```bash
pnpm run dev
```

# Your app should now be running at http://localhost:3000

## 📸 Screenshots

### 🏠 Home Page

![Home Page](./assets/home.png)

---

### ✏️ Drawing Room

![Drawing Room](./assets/drawing-room.png)

---

### 🔄 Real-time Dashboard (GIF)

![Real-time Collab](./assets/dashboard.png)
