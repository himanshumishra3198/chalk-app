const isLocal = process.env.NODE_ENV === "development";

export const BACKEND_URL = isLocal
  ? "http://localhost:8080" // Use localhost for development
  : "https://api.chalk.hm0.org"; // Use production URL for deployment

export const WEBSOCKET_URL = isLocal
  ? "ws://localhost:8081" // Use localhost for development
  : "ws://ws.chalk.hm0.org"; // Use WS (secure WebSocket) in
