import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Copy, Scissors, Trash2, Wand2 } from "lucide-react"

interface EditorContextMenuProps {
  children: React.ReactNode
  onCopy?: () => void
  onCut?: () => void
  onDelete?: () => void
  onAskAI?: () => void
  selectedText?: string
}

export function EditorContextMenu({
  children,
  onCopy,
  onCut,
  onDelete,
  onAskAI,
  selectedText
}: EditorContextMenuProps) {
  const hasSelection = selectedText && selectedText.length > 0

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onCopy}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onCut}
          className="gap-2"
        >
          <Scissors className="h-4 w-4" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onDelete}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          disabled={!hasSelection}
          onClick={onAskAI}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          Ask AI about selection
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
