import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface SocketContextType {
  socket: WebSocket | null;
  isConnected: boolean;
  reconnect: () => void;
  sendMessage: (message: any) => void;
  lastMessage: any;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_URL = "wss://mock-socket-url.com";

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const { toast } = useToast();

  const mockData = {
    activeUsers: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      users: 50 + Math.floor(Math.random() * 100),
    })),
    activityCategories: [
      { category: "Page Views", value: 2500 + Math.floor(Math.random() * 1000) },
      { category: "Clicks", value: 1800 + Math.floor(Math.random() * 800) },
      { category: "Signups", value: 350 + Math.floor(Math.random() * 150) },
      { category: "Downloads", value: 780 + Math.floor(Math.random() * 400) },
      { category: "Purchases", value: 120 + Math.floor(Math.random() * 80) },
    ],
    liveUserCount: 120 + Math.floor(Math.random() * 50),
    recentActivities: Array.from({ length: 10 }, (_, i) => ({
      id: `activity-${i}`,
      userId: `user-${Math.floor(Math.random() * 100)}`,
      action: ["signed up", "made a purchase", "viewed a page", "downloaded a file", "left a comment"][Math.floor(Math.random() * 5)],
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    })),
  };

  const createSocketConnection = useCallback(() => {
    console.log("Creating WebSocket connection...");

    try {
      const mockSocket = {
        send: (data: string) => {
          console.log("Message sent:", data);
        },
        close: () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
        },
      } as unknown as WebSocket;

      setSocket(mockSocket as WebSocket);

      setTimeout(() => {
        setIsConnected(true);
        toast({
          title: "Connected to WebSocket",
          description: "Real-time data updates are now active",
        });

        startMockDataInterval();
      }, 5000);
    } catch (error) {
      console.error("WebSocket connection failed:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time service",
        variant: "destructive",
      });
    }
  }, []);

  const startMockDataInterval = () => {
    setLastMessage({
      type: "initial_data",
      data: mockData,
    });

    const interval = setInterval(() => {
      const updatedData = {
        ...mockData,
        liveUserCount: mockData.liveUserCount + Math.floor(Math.random() * 10) - 5,
        recentActivities: [
          {
            id: `activity-${Date.now()}`,
            userId: `user-${Math.floor(Math.random() * 100)}`,
            action: ["signed up", "made a purchase", "viewed a page", "downloaded a file", "left a comment"][Math.floor(Math.random() * 5)],
            timestamp: new Date().toISOString(),
          },
          ...mockData.recentActivities.slice(0, 9),
        ],
      };

      Object.assign(mockData, updatedData);

      setLastMessage({
        type: "data_update",
        data: updatedData,
      });
    }, 5000);

    window.mockDataInterval = interval;
  };

  const reconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
    createSocketConnection();
  }, [socket, createSocketConnection]);

  const sendMessage = useCallback(
    (message: any) => {
      if (socket && isConnected) {
        socket.send(JSON.stringify(message));
      } else {
        console.error("Cannot send message, socket not connected");
      }
    },
    [socket, isConnected]
  );

  useEffect(() => {
    createSocketConnection();

    return () => {
      if (socket) {
        socket.close();
      }

      if (window.mockDataInterval) {
        clearInterval(window.mockDataInterval);
      }
    };
  }, [createSocketConnection, socket]);

  return <SocketContext.Provider value={{ socket, isConnected, reconnect, sendMessage, lastMessage }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

declare global {
  interface Window {
    mockDataInterval: NodeJS.Timeout;
  }
}
