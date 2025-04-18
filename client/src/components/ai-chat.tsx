import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const AiChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "user",
      content: "I want to visit Tokyo for 5 days in April with a budget of $1500. I love anime, food, and nature.",
      timestamp: new Date()
    },
    {
      id: "2",
      role: "assistant",
      content: `I've created two itineraries for your Tokyo trip:

Budget-Friendly Itinerary:
• Stay at a capsule hotel near Shinjuku (~$40/night)
• Visit free Anime museums and Akihabara district
• Day trip to Mount Takao for nature
• Food tour of affordable ramen shops and street food

Experience-Focused Itinerary:
• Mid-range hotel in Shibuya (~$120/night)
• Ghibli Museum visit and anime shopping tour
• Day trip to Hakone for Mt. Fuji views and onsen
• Food tour including a Michelin-starred ramen experience`,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setNewMessage("");

    // In a real app, this would send the message to the Gemini API
    // and get a response, then add the assistant message
    // For now, we'll just simulate a response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'll help you plan that trip! This is a simulated response. In the actual app, this would be generated by Google Gemini AI with personalized suggestions based on your request.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-transparent dark:border-gray-700 ai-chat-animation">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-[#40A9BC]/10 dark:bg-[#40A9BC]/20 flex items-center justify-center text-[#40A9BC] mr-4 float-animation">
          <i className="fas fa-robot"></i>
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-white">
            {APP_NAME.split("AI")[0]}<span className="text-[#40A9BC]">AI</span> Assistant
          </h3>
          <p className="text-sm text-neutral-500 dark:text-gray-400">Powered by Google Gemini</p>
        </div>
      </div>
      
      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`${
              message.role === "user" 
                ? "bg-neutral-50 dark:bg-gray-700" 
                : "bg-[#40A9BC]/5 dark:bg-[#40A9BC]/10 border-l-4 border-[#40A9BC]"
            } rounded-lg p-4 transition-all duration-300`}
          >
            <p className="text-neutral-600 dark:text-gray-200 mb-2 whitespace-pre-line">{message.content}</p>
            <p className="text-xs text-neutral-500 dark:text-gray-400">
              {message.role === "user" ? "You" : "Assistant"}, {formatTime(message.timestamp)}
            </p>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Ask MAPA AI a question..."
          className="pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
        />
        <Button 
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-auto text-[#40A9BC] bg-transparent hover:bg-transparent dark:text-[#40A9BC] dark:hover:bg-gray-600/20 animate-pulse-slow"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </Button>
      </div>
    </div>
  );
};

export default AiChat;
