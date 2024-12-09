import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import MDEditor from '@uiw/react-md-editor'
import { useState } from "react"

export default function App() {
  const [markdown, setMarkdown] = useState("# Hello World")

  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        {/* Left Sidebar - Article List */}
        <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/50">
          <div className="flex h-full flex-col">
            <div className="border-b p-4 bg-background">
              <h2 className="font-semibold">Articles</h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {/* Placeholder articles */}
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border bg-background hover:bg-accent cursor-pointer"
                  >
                    Article {i + 1}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Center - Markdown Editor */}
        <ResizablePanel defaultSize={50} className="bg-background">
          <div className="h-full p-4">
            <MDEditor
              value={markdown}
              onChange={(val) => setMarkdown(val || "")}
              height="100%"
              preview="edit"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle />

        {/* Right Sidebar - AI Chat */}
        <ResizablePanel defaultSize={30} className="bg-muted/50">
          <div className="flex h-full flex-col">
            <div className="border-b p-4 bg-background">
              <h2 className="font-semibold">AI Assistant</h2>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                {/* Placeholder chat messages */}
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        i % 2 === 0 ? "bg-background ml-4" : "bg-primary text-primary-foreground mr-4"
                      }`}
                    >
                      {i % 2 === 0 ? "AI: " : "You: "}
                      Message {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
            <div className="border-t p-4 bg-background">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask the AI..."
                  className="flex-1 rounded-md border bg-background px-3 py-2"
                />
                <button className="rounded-md bg-primary px-3 py-2 text-primary-foreground">
                  Send
                </button>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
