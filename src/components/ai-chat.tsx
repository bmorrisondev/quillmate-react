import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

interface Message {
  id: string
  content: string
  role: 'ai' | 'user'
}

export function AiChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const aiMessage: Message = await response.json()
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'ai'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4 bg-background">
        <h2 className="font-semibold">AI Assistant</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.role === 'ai' 
                    ? "bg-background ml-4" 
                    : "bg-primary text-primary-foreground mr-4"
                }`}
              >
                {message.role === 'ai' ? "AI: " : "You: "}
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-background ml-4 p-3 rounded-lg animate-pulse">
                AI is typing...
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI..."
            className="flex-1 rounded-md border bg-background px-3 py-2"
            disabled={isLoading}
          />
          <button 
            type="submit"
            className="rounded-md bg-primary px-3 py-2 text-primary-foreground disabled:opacity-50"
            disabled={isLoading}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
