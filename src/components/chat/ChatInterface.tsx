import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, UserCircle } from "lucide-react";
import Image from "next/image";

const mockConversations = [
  { id: '1', name: 'John Doe', lastMessage: 'Is the villa still available?', unread: 2, avatar: 'https://picsum.photos/50/50?random=user1' },
  { id: '2', name: 'Jane Smith', lastMessage: 'Great, I will schedule a visit.', unread: 0, avatar: 'https://picsum.photos/50/50?random=user2' },
  { id: '3', name: 'Broker Bob', lastMessage: 'Regarding your offer...', unread: 1, avatar: 'https://picsum.photos/50/50?random=user3' },
];

const mockMessages = [
    { id: 'm1', sender: 'John Doe', text: 'Hi, I am interested in the Spacious Modern Villa. Is it still available?', time: '10:00 AM', self: false },
    { id: 'm2', sender: 'You', text: 'Hello John, yes it is!', time: '10:02 AM', self: true },
    { id: 'm3', sender: 'John Doe', text: 'Great! Could I get more details about the neighborhood?', time: '10:05 AM', self: false },
];


export default function ChatInterface() {
  const selectedConversation = mockConversations[0]; // Mock selected conversation

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
      {/* Conversations List */}
      <Card className="w-full md:w-1/3 h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <MessageSquare className="mr-2 h-6 w-6 text-primary" /> Conversations
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-grow">
          <CardContent className="p-0">
            {mockConversations.map(convo => (
              <div key={convo.id} className="flex items-center p-3 hover:bg-accent/10 cursor-pointer border-b last:border-b-0">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={convo.avatar} alt={convo.name} data-ai-hint="person avatar"/>
                  <AvatarFallback>{convo.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{convo.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                </div>
                {convo.unread > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                    {convo.unread}
                  </span>
                )}
              </div>
            ))}
             {mockConversations.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No conversations yet.</p>
            )}
          </CardContent>
        </ScrollArea>
      </Card>

      {/* Chat Window */}
      <Card className="w-full md:w-2/3 h-full flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                   <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} data-ai-hint="person avatar"/>
                   <AvatarFallback>{selectedConversation.name.substring(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{selectedConversation.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">Online</p> {/* Placeholder status */}
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-grow p-4 space-y-4">
              {mockMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.self ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.self ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground text-left'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
            <CardFooter className="p-4 border-t">
              <form className="flex w-full space-x-2">
                <Input type="text" placeholder="Type your message..." className="flex-1" aria-label="Chat message input"/>
                <Button type="submit" variant="default">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center h-full">
            <UserCircle className="h-24 w-24 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Select a conversation to start chatting.</p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
