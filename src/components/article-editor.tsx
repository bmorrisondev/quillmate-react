import MDEditor from '@uiw/react-md-editor'
import { EditorContextMenu } from '@/components/editor-context-menu'
import { Article } from '@/types'

interface ArticleEditorProps {
  article: Article
  onUpdate: (id: number, content: string) => void
  onCopy: () => void
  onCut: () => void
  onDelete: () => void
  onAskAI: () => void
  onContextMenu: (e: React.MouseEvent) => void
  selectedText: string
}

export function ArticleEditor({
  article,
  onUpdate,
  onCopy,
  onCut,
  onDelete,
  onAskAI,
  onContextMenu,
  selectedText
}: ArticleEditorProps) {
  return (
    <EditorContextMenu
      onCopy={onCopy}
      onCut={onCut}
      onDelete={onDelete}
      onAskAI={onAskAI}
      selectedText={selectedText}
    >
      <div 
        className="h-full" 
        data-color-mode="light"
        onContextMenu={onContextMenu}
      >
        <MDEditor
          value={article.content}
          onChange={(value) => value && onUpdate(article.id, value)}
          preview="edit"
          height="100%"
          style={{ height: '100%' }}
        />
      </div>
    </EditorContextMenu>
  )
}
