// export const BACKEND_URL = "http://128.199.27.128/api";
// export const WEBSOCKET_URL = "ws://128.199.27.128/ws/";

const isLocal = process.env.NODE_ENV === "development";

export const BACKEND_URL = isLocal
  ? "http://localhost:8080" // Use localhost for development
  : "http://128.199.27.128/api"; // Use production URL for deployment

export const WEBSOCKET_URL = isLocal
  ? "ws://localhost:8081" // Use localhost for development
  : "ws://128.199.27.128/ws/"; // Use production URL for deployment
