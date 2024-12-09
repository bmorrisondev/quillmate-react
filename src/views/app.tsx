import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { AiChat } from "@/components/ai-chat"

interface Article {
  id: number
  title: string
  content: string
  summary?: string
  createdAt: string
  updatedAt: string
}

export default function App() {
  const [articles, setArticles] = useState<Article[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (!response.ok) throw new Error('Failed to fetch articles')
      const data = await response.json()
      setArticles(data)
      setError(null)
    } catch (err) {
      setError('Failed to load articles')
      console.error('Error fetching articles:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const createNewArticle = async () => {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'New Article',
          content: '# New Article\n\nStart writing here...',
        }),
      })
      if (!response.ok) throw new Error('Failed to create article')
      const newArticle = await response.json()
      setArticles(prev => [...prev, newArticle])
      setSelectedArticle(newArticle)
    } catch (err) {
      console.error('Error creating article:', err)
    }
  }

  const extractTitleFromContent = (content: string): string | null => {
    const h1Match = content.match(/^#\s+(.+)$/m)
    return h1Match ? h1Match[1].trim() : null
  }

  const updateArticleRequest = useCallback(async (id: number, content: string, title?: string) => {
    if (!selectedArticle) return

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedArticle,
          content,
          ...(title && { title }),
        }),
      })
      if (!response.ok) throw new Error('Failed to update article')
      const updatedArticle = await response.json()
      setArticles(prev => prev.map(article => 
        article.id === id ? updatedArticle : article
      ))
      setSelectedArticle(updatedArticle)
    } catch (err) {
      console.error('Error updating article:', err)
    }
  }, [selectedArticle])

  const debouncedUpdate = useDebounce(updateArticleRequest, 500)

  const updateArticle = (id: number, content: string) => {
    // Update the local state immediately for a smoother UX
    if (selectedArticle) {
      const newTitle = extractTitleFromContent(content)
      const immediateUpdate = { 
        ...selectedArticle, 
        content,
        ...(newTitle && { title: newTitle })
      }
      setSelectedArticle(immediateUpdate)
      setArticles(prev => prev.map(article => 
        article.id === id ? immediateUpdate : article
      ))
    }
    // Debounced API call with title if found
    const title = extractTitleFromContent(content)
    debouncedUpdate(id, content, title || undefined)
  }

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Sidebar - Article List */}
        <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/50">
          <div className="flex h-full flex-col">
            <div className="border-b p-4 bg-background">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">Articles</h2>
                <Button
                  onClick={createNewArticle}
                  size="sm"
                  className="px-2"
                >
                  New
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : error ? (
                  <div className="text-center text-destructive">{error}</div>
                ) : articles.length === 0 ? (
                  <div className="text-center text-muted-foreground">No articles yet</div>
                ) : (
                  articles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-3 rounded-lg border bg-background hover:bg-accent cursor-pointer ${
                        selectedArticle?.id === article.id ? 'border-primary' : ''
                      }`}
                      onClick={() => setSelectedArticle(article)}
                    >
                      {article.title}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center - Markdown Editor */}
        <ResizablePanel defaultSize={50} className="bg-background">
          <div className="h-full p-4">
            <MDEditor
              value={selectedArticle?.content || '# Select or create an article'}
              onChange={(val) => {
                if (selectedArticle) {
                  updateArticle(selectedArticle.id, val || '')
                }
              }}
              height="100%"
              preview="edit"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Sidebar - AI Chat */}
        <ResizablePanel defaultSize={25}>
          <AiChat />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
