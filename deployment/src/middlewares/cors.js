// src/middlewares/cors.js
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL, process.env.FRONTEND_URL2]
      : [
          "http://localhost:5173",
          "http://localhost:4173",
          "http://127.0.0.1:5173",
          "http://127.0.0.1:4173",
        ], // Allow all origins in development since Vite proxy handles this
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

export default corsOptions;
