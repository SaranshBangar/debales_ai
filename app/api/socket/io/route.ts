import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server } from "socket.io";

let io: any;

const initGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

async function handleChatMessage(message: string, socket: any) {
  try {
    const genAI = initGeminiClient();

    if (!genAI) {
      socket.emit("message", {
        id: Date.now().toString(),
        content: "Sorry, there's an issue connecting to the AI service.",
        sender: "support",
        timestamp: new Date(),
      });
      return;
    }

    socket.emit("processingStatus", { status: "processing" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    socket.emit("message", {
      id: Date.now().toString(),
      content: text,
      sender: "support",
      timestamp: new Date(),
    });

    socket.emit("processingStatus", { status: "complete" });
  } catch (error) {
    console.error("Error processing message with Gemini:", error);
    socket.emit("message", {
      id: Date.now().toString(),
      content: "Sorry, I encountered an error processing your request.",
      sender: "support",
      timestamp: new Date(),
    });
    socket.emit("processingStatus", { status: "error" });
  }
}

export async function GET(request: NextRequest) {
  return new NextResponse("Socket.io server endpoint is ready", {
    status: 200,
  });
}

if (typeof window === "undefined") {
  if (!io) {
    const res = (global as any).res;
    if (res && !res.socket?.server?.io) {
      console.log("Setting up Socket.io");

      const httpServer = res.socket.server;
      io = new Server(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
      });

      res.socket.server.io = io;

      io.on("connection", (socket: any) => {
        console.log("Client connected:", socket.id);

        socket.emit("message", {
          id: "welcome",
          content: "Welcome to our AI-powered chat! How can I help you today?",
          sender: "support",
          timestamp: new Date(),
        });

        socket.on("userMessage", (message: string) => {
          console.log("Received message:", message);

          socket.emit("messageReceived", { status: "received" });

          handleChatMessage(message, socket);
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
        });
      });
    }
  }
}

export const dynamic = "force-dynamic";
