import { NextRequest, NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";
import { GoogleGenerativeAI } from "@google/generative-ai";

class SocketIOServer {
  private static instance: IOServer;
  private static isInitialized = false;

  static getInstance() {
    return this.instance;
  }

  static initialize(res: any) {
    if (!this.isInitialized && res?.socket?.server) {
      console.log("* Setting up Socket.io server");

      const httpServer = res.socket.server;

      this.instance = new IOServer(httpServer, {
        path: "/api/socket/io",
        addTrailingSlash: false,
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
        pingTimeout: 60000,
      });

      res.socket.server.io = this.instance;
      this.isInitialized = true;

      this.instance.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.emit("message", {
          id: "welcome",
          content: "Welcome to our AI-powered chat! How can I help you today?",
          sender: "support",
          timestamp: new Date(),
        });

        socket.on("userMessage", (message: string) => {
          console.log(`Received message from ${socket.id}:`, message);

          socket.emit("messageReceived", { status: "received" });

          handleChatMessage(message, socket);
        });

        socket.on("disconnect", () => {
          console.log("Client disconnected:", socket.id);
        });
      });
    }

    return this.instance;
  }
}

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
        content: "Sorry, there's an issue connecting to the AI service. Please make sure the GEMINI_API_KEY environment variable is set.",
        sender: "support",
        timestamp: new Date(),
      });
      return;
    }

    socket.emit("processingStatus", { status: "processing" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();

      socket.emit("message", {
        id: Date.now().toString(),
        content: text,
        sender: "support",
        timestamp: new Date(),
      });
    } catch (genAIError) {
      console.error("Error with Gemini API:", genAIError);
      socket.emit("message", {
        id: Date.now().toString(),
        content: "I'm having trouble processing your request. Please try again with a different question.",
        sender: "support",
        timestamp: new Date(),
      });
    }

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

export async function GET(req: NextRequest) {
  try {
    const res = (req as any)?.socket?.server?.res || {};

    if (res?.socket?.server) {
      SocketIOServer.initialize(res);
      return new NextResponse("Socket.io server is running", { status: 200 });
    }

    return new NextResponse("Socket.io initialization failed", { status: 500 });
  } catch (error) {
    console.error("Socket.io error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
