"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Mic, Bot } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { demoFarm, zoneCrop } from "@/lib/farm-config";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function AgroBot() {
  const cropA = zoneCrop(demoFarm.zones[0]);
  const cropB = zoneCrop(demoFarm.zones[1]);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm AgroBot. I have access to your live farm telemetry. How can I assist?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
        const response = await fetch("http://localhost:8000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: userMsg,
                farm_context: {
                    state: demoFarm.state,
                    weather: "Partly cloudy, 31C",
                    zone_a: {
                      crop: cropA.name_en,
                      crop_hi: cropA.name_hi,
                      area: demoFarm.zones[0].areaSqm,
                      soil: demoFarm.zones[0].soilType,
                      moisture: demoFarm.zones[0].moisture,
                    },
                    zone_b: {
                      crop: cropB.name_en,
                      crop_hi: cropB.name_hi,
                      area: demoFarm.zones[1].areaSqm,
                      soil: demoFarm.zones[1].soilType,
                      moisture: demoFarm.zones[1].moisture,
                    }
                }
            })
        });
        const data = await response.json();
        setMessages(prev => [...prev, { role: "bot", content: data.reply || "No response received." }]);
    } catch {
        setMessages(prev => [...prev, { role: "bot", content: "Sorry, I am unable to reach the intelligence core right now." }]);
    } finally {
        setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-green-600 hover:bg-green-700 p-0"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 max-h-[600px] shadow-2xl border-2 border-green-100 dark:border-green-900 flex flex-col overflow-hidden z-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white flex flex-row items-center justify-between p-3">
        <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-md font-bold m-0 flex items-center">AgroBot</CardTitle>
            <Badge variant="secondary" className="bg-green-800 text-white border-none text-[10px] ml-1">GPT-4o</Badge>
        </div>
        <Button variant="ghost" size="icon" className="text-white hover:bg-green-800/50 hover:text-white h-8 w-8" onClick={() => setIsOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user" 
                    ? "bg-blue-600 text-white rounded-br-none" 
                    : "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 rounded-bl-none"
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-none px-4 py-2 text-sm max-w-[80%] flex gap-1 items-center">
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.2s"}}></div>
                     <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: "0.4s"}}></div>
                  </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <div className="px-4 py-2 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar border-t">
           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setInput("How much water does Zone A need today?")}>Zone A water need</Badge>
           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setInput("Compare my two crops water needs")}>Compare zones</Badge>
           <Badge variant="outline" className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800" onClick={() => setInput("Which zone needs attention first?")}>Priority zone</Badge>
        </div>
      </CardContent>
      <CardFooter className="p-3 border-t bg-gray-50 dark:bg-zinc-950">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full items-center gap-2">
          <Input 
            placeholder="Ask AgroBot..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800"
          />
          <Button type="button" size="icon" variant="ghost" className="text-gray-500">
             <Mic className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
