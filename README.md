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

```bash
git clone https://github.com/your-username/chalk.git
cd chalk
```bash
git clone https://github.com/your-username/chalk.git
cd chalk
