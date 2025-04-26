"use client";

import { useState, useEffect, useRef } from "react";
import { ModeToggle } from "../components/theme-toggle/ThemeToggle";
import { io, Socket } from "socket.io-client";
import { Send, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "support";
  timestamp: Date;
}

export default function ChatPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [userInactive, setUserInactive] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const INACTIVITY_TIMEOUT = 30000;

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth");
  };

  useEffect(() => {
    const resetInactivityTimer = () => {
      setUserInactive(false);
      setLastActivity(new Date());
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  useEffect(() => {
    const inactivityTimer = setInterval(() => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && !userInactive) {
        setUserInactive(true);
        const proactiveMessage: ChatMessage = {
          id: Date.now().toString(),
          content: "Is there anything else I can help you with today?",
          sender: "support",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, proactiveMessage]);
      }
    }, 5000);

    return () => clearInterval(inactivityTimer);
  }, [lastActivity, userInactive]);

  useEffect(() => {
    fetch("/api/socket/io")
      .then(() => {
        const socketInitializer = async () => {
          try {
            const socketInstance = io({
              path: "/api/socket/io",
              addTrailingSlash: false,
            });

            socketInstance.on("connect", () => {
              console.log("Connected to socket server");
              setConnected(true);
            });

            socketInstance.on("disconnect", () => {
              console.log("Disconnected from socket server");
              setConnected(false);
            });

            socketInstance.on("message", (message: ChatMessage) => {
              const chatMessage = {
                ...message,
                timestamp: new Date(message.timestamp),
              };

              setMessages((prevMessages) => [...prevMessages, chatMessage]);
              setLoading(false);
            });

            socketInstance.on(
              "processingStatus",
              (status: { status: string }) => {
                if (status.status === "processing") {
                  setLoading(true);
                } else {
                  setLoading(false);
                }
              },
            );

            socketInstance.on("connect_error", (err: any) => {
              console.error("Socket connection error:", err);
              setConnected(false);
            });

            setSocket(socketInstance);

            return () => {
              socketInstance.disconnect();
            };
          } catch (error) {
            console.error("Failed to connect to chat server:", error);
            setConnected(false);
          }
        };

        socketInitializer();
      })
      .catch((err) => {
        console.error("Error initializing socket connection:", err);
        setConnected(false);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !socket || !connected) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");
    setUserInactive(false);
    setLastActivity(new Date());

    socket.emit("userMessage", message);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gemini AI Chat
                </h1>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <ModeToggle />
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-md text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/40"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-800/40"
              >
                <LogOut className="h-4 w-4 mr-2 inline-block" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col h-[calc(100vh-10rem)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p
                    className={`text-xs mt-1 ${msg.sender === "user" ? "text-indigo-200" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSendMessage}
            className="border-t border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2"
              />
              <button
                type="submit"
                disabled={!message.trim() || loading || !connected}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </form>

          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-b-lg border-t border-gray-200 dark:border-gray-700 text-sm">
            <div className="flex items-center">
              <div
                className={`h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"} mr-2`}
              ></div>
              <span className="text-gray-500 dark:text-gray-400">
                {connected ? "Connected to Gemini API" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
