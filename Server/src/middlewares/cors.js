// src/middlewares/cors.js
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [
          process.env.FRONTEND_URL,
          process.env.FRONTEND_URL2,
          process.env.FRONTEND_URL3,
          process.env.FRONTEND_URL4
        ]
      : [
          "http://localhost:5173",
          "http://localhost:4173",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:4173",
          "https://petrogenetic-danae-inexact.ngrok-free.dev", // Your permanent ngrok domain
          "https://ngs4kwk0gg0o0sog8w4wkwg8.mehariberaki.com", //coolify depoyment
          /^https:\/\/.*\.ngrok-free\.app$/, // Allow any ngrok-free.app subdomain
          /^https:\/\/.*\.ngrok-free\.dev$/, // Allow any ngrok-free.dev subdomain
        ], // Allow all origins in development since Vite proxy handles this
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

export default corsOptions;
