import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Article } from "@/types"

interface ArticleListProps {
  articles: Article[]
  selectedArticle: Article | null
  onArticleSelect: (article: Article) => void
  onNewArticle: () => void
}

export function ArticleList({
  articles,
  selectedArticle,
  onArticleSelect,
  onNewArticle,
}: ArticleListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-purple-100 p-4 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Articles</h2>
          <Button onClick={onNewArticle} size="sm">New</Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {articles.map(article => (
            <div
              key={article.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedArticle?.id === article.id
                  ? 'bg-purple-100'
                  : 'hover:bg-purple-50'
              }`}
              onClick={() => onArticleSelect(article)}
            >
              <h3 className="font-medium mb-1">{article.title}</h3>
              <div className="text-sm text-gray-500">
                <p>By {article.user.name || article.user.email}</p>
                <p>Updated {new Date(article.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
