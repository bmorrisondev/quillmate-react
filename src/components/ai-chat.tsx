import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, FileDown } from "lucide-react"

interface Message {
  id: string
  content: string
  role: 'ai' | 'user'
  createdAt: string
}

interface AiChatProps {
  articleId: number
  onInsertText?: (text: string) => void
}

export function AiChat({ articleId, onInsertText }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/ai/messages/${articleId}`)
        if (!response.ok) throw new Error('Failed to fetch messages')
        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error('Error fetching messages:', error)
      }
    }

    fetchMessages()
  }, [articleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Create a temporary user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: input,
      role: 'user',
      createdAt: new Date().toISOString()
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, tempUserMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`/api/ai/chat/${articleId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: input
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const { userMessage, aiMessage } = await response.json()
      
      // Update messages, replacing temp user message and adding AI response
      setMessages(prev => prev.map(msg => 
        msg.id === tempUserMessage.id ? userMessage : msg
      ).concat(aiMessage))
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== tempUserMessage.id)
        return [...withoutTemp, {
          id: Date.now().toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'ai',
          createdAt: new Date().toISOString()
        }]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text:', err)
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
                    ? "bg-muted/50 ml-4 border" 
                    : "bg-primary text-primary-foreground mr-4"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span>{message.role === 'ai' ? "AI: " : "You: "}</span>
                  <span className="flex-1">{message.content}</span>
                </div>
                {message.role === 'ai' && (
                  <div className="mt-2 flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleCopy(message.content)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    {onInsertText && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => onInsertText(message.content)}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Insert
                      </Button>
                    )}
                  </div>
                )}
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
            placeholder="Ask about this article..."
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
