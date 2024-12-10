import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { useEffect, useState, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { AiChat } from "@/components/ai-chat"
import { ArticleEditor } from '@/components/article-editor'
import { ArticleList } from '@/components/article-list'
import { Article } from "@/types"

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

  const handleInsertText = useCallback((text: string) => {
    if (!selectedArticle) return
    updateArticle(selectedArticle.id, selectedArticle.content + '\n\n' + text)
  }, [selectedArticle, updateArticle])

  return (
    <div className="h-screen w-full bg-purple-50/30">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Sidebar - Article List */}
        <ResizablePanel defaultSize={20} minSize={15}>
          <ArticleList
            articles={articles}
            selectedArticle={selectedArticle}
            onArticleSelect={setSelectedArticle}
            onNewArticle={createNewArticle}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Main Content - Editor */}
        <ResizablePanel defaultSize={55} className="bg-white">
          {selectedArticle ? (
            <ArticleEditor
              article={selectedArticle}
              onUpdate={updateArticle}
              onCopy={handleCopy}
              onCut={handleCut}
              onDelete={handleDelete}
              onAskAI={handleAskAI}
              onContextMenu={handleEditorContextMenu}
              selectedText={selectedText}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select an article or create a new one
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Sidebar - AI Chat */}
        <ResizablePanel defaultSize={25} minSize={20} data-panel="chat">
          <AiChat 
            articleId={selectedArticle?.id || 0} 
            context={aiContext} 
            onInsertText={handleInsertText}
            onClearContext={() => setAiContext('')}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
