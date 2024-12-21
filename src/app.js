import express from "express" ;
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import { createServer } from 'node:http';
import dotenv from "dotenv" ;
dotenv.config()

const app = express()

const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? false 
    : "http://localhost:5173", 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  credentials: true,
};
app.use(cors((corsOptions)))




const server = createServer(app);
const io = new Server(server, {
  cors: process.env.NODE_ENV === "production" 
    ? false 
    : {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
      },
});


export function getReceiverSocketId(userId) {
    return usersSocketMap[userId];
  }
const usersSocketMap = {}

io.on('connection', (socket) => {
    console.log('a user connected',socket.id);

    const userId = socket.handshake.query.userId ;
    if(userId) usersSocketMap[userId] = socket.id ;

    io.emit("getUsers", Object.keys(usersSocketMap))


    socket.on("disconnected",() => {
        console.log("A user disconnected", socket.id)
        delete usersSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(usersSocketMap));
    })
  });





app.use(express.json({ limit: '500mb' }))
app.use(cookieParser())
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

import authRouth from "./routes/auth.routes.js";
app.use("/v1/api/auth", authRouth)

import messageRoutes from "../src/routes/message.routes.js"
app.use("/v1/api/messages", messageRoutes)


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

export  {app , io , server }
