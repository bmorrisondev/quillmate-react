import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import MDEditor from '@uiw/react-md-editor'
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import { AiChat } from "@/components/ai-chat"
import { EditorContextMenu } from "@/components/editor-context-menu"

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
  const [selectedText, setSelectedText] = useState('')
  const [aiContext, setAiContext] = useState('')

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

  const handleEditorContextMenu = (e: React.MouseEvent) => {
    const selection = window.getSelection()?.toString() || ''
    setSelectedText(selection)
  }

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(selectedText)
  }, [selectedText])

  const handleCut = useCallback(() => {
    if (!selectedArticle) return
    navigator.clipboard.writeText(selectedText)
    const content = selectedArticle.content
    const start = content.indexOf(selectedText)
    if (start === -1) return
    const newContent = content.slice(0, start) + content.slice(start + selectedText.length)
    updateArticle(selectedArticle.id, newContent)
  }, [selectedArticle, selectedText])

  const handleDelete = useCallback(() => {
    if (!selectedArticle) return
    const content = selectedArticle.content
    const start = content.indexOf(selectedText)
    if (start === -1) return
    const newContent = content.slice(0, start) + content.slice(start + selectedText.length)
    updateArticle(selectedArticle.id, newContent)
  }, [selectedArticle, selectedText])

  const handleAskAI = useCallback(() => {
    setAiContext(selectedText)
    // Scroll chat into view on mobile
    const chatPanel = document.querySelector('[data-panel="chat"]')
    chatPanel?.scrollIntoView({ behavior: 'smooth' })
  }, [selectedText])

  return (
    <div className="h-screen w-full bg-purple-50/30">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Sidebar - Article List */}
        <ResizablePanel defaultSize={20} minSize={15} className="bg-white border-r border-purple-100">
          <div className="flex h-full flex-col">
            <div className="border-b border-purple-100 p-4 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-purple-900">Articles</h2>
                <Button
                  onClick={createNewArticle}
                  size="sm"
                  className="px-3 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  New
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="text-center text-purple-500">Loading...</div>
                ) : error ? (
                  <div className="text-center text-red-500">{error}</div>
                ) : articles.length === 0 ? (
                  <div className="text-center text-purple-400">No articles yet</div>
                ) : (
                  articles.map((article) => (
                    <div
                      key={article.id}
                      className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        selectedArticle?.id === article.id 
                          ? 'border-purple-400 bg-purple-50 text-purple-900' 
                          : 'border-purple-100 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50/50'
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

        <ResizableHandle className="bg-purple-100 hover:bg-purple-200 transition-colors" />

        {/* Center - Editor */}
        <ResizablePanel defaultSize={50} minSize={30} className="bg-white">
            <div className="h-full p-4">
              {selectedArticle ? (
                <EditorContextMenu
                  selectedText={selectedText}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  onDelete={handleDelete}
                  onAskAI={handleAskAI}
                >
                  <div onContextMenu={handleEditorContextMenu} className="h-full">
                    <MDEditor
                      value={selectedArticle.content}
                      onChange={(value) => {
                        if (value !== undefined) {
                          updateArticle(selectedArticle.id, value)
                        }
                      }}
                      height="100%"
                      preview="edit"
                      className="h-full [&_.w-md-editor-content]:h-full [&_.w-md-editor]:!bg-white [&_.w-md-editor]:!border-purple-100 [&_.w-md-editor-toolbar]:!border-purple-100 [&_.w-md-editor-toolbar]:!bg-purple-50/50"
                    />
                  </div>
                </EditorContextMenu>
              ) : (
                <div className="h-full flex items-center justify-center text-purple-400">
                  Select an article to start editing
                </div>
              )}
            </div>
        </ResizablePanel>

        <ResizableHandle className="bg-purple-100 hover:bg-purple-200 transition-colors" />

        {/* Right Sidebar - AI Chat */}
        <ResizablePanel defaultSize={25} data-panel="chat" className="bg-white border-l border-purple-100">
          {selectedArticle ? (
            <AiChat 
              articleId={selectedArticle.id} 
              onInsertText={(text) => updateArticle(selectedArticle.id, selectedArticle.content + '\n\n' + text)}
              context={aiContext}
              onClearContext={() => setAiContext('')}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-purple-400">
              Select an article to start chatting
            </div>
          )}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
