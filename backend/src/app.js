import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const url = process.env.FRONT_END_URL;

// Express middleware
app.use(cors({
  origin: "http://localhost:5173",  // Your React frontend URL (change port if different)
  credentials: true                  // IMPORTANT: Allow cookies
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

import userRouter from "./routes/user.routes.js"
import messageRoutes from "./routes/message.routes.js";
app.use("/api/v1/user", userRouter)
app.use("/api/v1/messages", messageRoutes);

export { app };
