import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Send, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
};

const MOCK_RESPONSES: Record<string, string[]> = {
  greeting: [
    "👋 Hi there! How can I help you today?",
    "Hello! Welcome to our support chat. What can I assist you with?",
    "Welcome to our support channel! What brings you here today?",
  ],
  fallback: [
    "I understand. Could you provide more details about your issue so I can help you better?",
    "Thanks for sharing that. Let me see how I can assist you with this matter.",
    "I see. Is there anything specific about this that you're having trouble with?",
    "I'd be happy to help with that. Could you tell me more about what you're trying to accomplish?",
  ],
  proactive: [
    "I noticed you've been quiet for a moment. Is there something specific you're looking for help with?",
    "Are you still there? Feel free to ask any questions you might have about our platform.",
    "Just checking in - is there anything else you'd like to know about our services?",
    "While you're thinking, would you like me to explain some of our most popular features?",
  ],
};

const Support = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem("support-chat-history");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as Message[];
        setMessages(
          parsed.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error parsing saved messages:", error);
      }
    } else {
      setTimeout(() => {
        sendBotResponse(getRandomResponse("greeting"));
      }, 5000);
    }

    document.title = "Support Chat";

    if (inputRef.current) {
      inputRef.current.focus();
    }

    startInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("support-chat-history", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    startInactivityTimer();
  };

  const startInactivityTimer = () => {
    inactivityTimerRef.current = window.setTimeout(() => {
      if (messages.length > 0 && messages[messages.length - 1].role !== "bot") {
        sendBotResponse(getRandomResponse("proactive"));
      }
    }, 60000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getRandomResponse = (type: keyof typeof MOCK_RESPONSES): string => {
    const responses = MOCK_RESPONSES[type];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    resetInactivityTimer();

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      sendBotResponse(getRandomResponse("fallback"));
    }, 5000);
  };

  const sendBotResponse = (content: string) => {
    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      role: "bot",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Support Chat</h1>
            <p className="text-xs text-muted-foreground">Get help with your questions</p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isTyping ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Need Help?</h2>
            <p className="text-muted-foreground mb-6">Send a message and our AI assistant will help you with your questions.</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex max-w-[80%] animate-fade-in", message.role === "user" ? "ml-auto flex-row-reverse space-x-reverse" : "mr-auto")}
              >
                <Avatar className="h-8 w-8">
                  {message.role === "user" ? (
                    <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
                  ) : (
                    <AvatarImage src="/placeholder.svg" />
                  )}
                  <AvatarFallback className={message.role === "user" ? "bg-primary" : "bg-secondary"}>
                    {message.role === "user" ? "U" : "AI"}
                  </AvatarFallback>
                </Avatar>

                <div className={cn("mx-2 rounded-xl px-4 py-2 text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                  {message.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex mr-auto">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-secondary">AI</AvatarFallback>
                </Avatar>
                <div className="mx-2 rounded-xl bg-muted px-4 py-2 text-sm">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current delay-75"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current delay-150"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <Card className="border-t rounded-none border-x-0 border-b-0">
        <CardContent className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex space-x-2"
          >
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1"
              disabled={isTyping}
              onFocus={resetInactivityTimer}
              onKeyPress={resetInactivityTimer}
            />
            <Button type="submit" size="icon" disabled={isTyping || !inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 text-xs text-center text-muted-foreground">
            This is a demo chatbot. In a real app, it would be powered by Gemini API.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Support;
