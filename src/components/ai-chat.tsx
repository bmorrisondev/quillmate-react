import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Copy, FileDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  id: string
  content: string
  role: 'ai' | 'user'
  createdAt: string
  context?: string
}

interface AiChatProps {
  articleId: number
  onInsertText?: (text: string) => void
  context?: string
  onClearContext?: () => void
}

export function AiChat({ articleId, onInsertText, context, onClearContext }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

    const tempId = Date.now().toString()
    const userMessage = { 
      id: tempId, 
      content: input, 
      role: 'user' as const, 
      createdAt: new Date().toISOString(),
      context: context // Include context in the message
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    
    // Clear context after sending
    onClearContext?.()

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          articleId,
          context,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const { userMessage, aiMessage } = await response.json()
      
      // Update messages, replacing temp user message and adding AI response
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? userMessage : msg
      ).concat(aiMessage))
    } catch (error) {
      console.error('Error getting AI response:', error)
      setMessages(prev => {
        const withoutTemp = prev.filter(msg => msg.id !== tempId)
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
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex flex-col space-y-2 text-sm bg-gray-100 text-gray-900 rounded-lg p-4',
                message.role === 'ai' && 'bg-muted/50 text-gray-900'
              )}
            >
              {message.context && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded border mb-1">
                  <div className="font-medium mb-1">Context:</div>
                  <div className="line-clamp-4">{message.context}</div>
                </div>
              )}
              <div>{message.content}</div>
              {message.role === 'ai' && (
                <div className="flex gap-2 self-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      navigator.clipboard.writeText(message.content)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {onInsertText && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onInsertText(message.content)}
                    >
                      <FileDown className="h-4 w-4" />
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
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t bg-background">
        {context && (
          <div className="px-4 py-2 border-b">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-muted-foreground">
                  Asking about:
                </div>
                <div className="text-sm line-clamp-2 font-medium">
                  {context}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={onClearContext}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <div className="p-4">
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
    </div>
  )
}
