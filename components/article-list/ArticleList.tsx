'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, FileText } from 'lucide-react'
import { Article } from '@/types'
import { getAllArticles, createArticle, deleteArticle } from '@/lib/storage/db'

interface ArticleListProps {
  selectedId: string | null
  onSelect: (article: Article) => void
  onCreate: (article: Article) => void
  refreshKey: number
}

export function ArticleList({ selectedId, onSelect, onCreate, refreshKey }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])

  const loadArticles = useCallback(async () => {
    const list = await getAllArticles()
    setArticles(list)
  }, [])

  useEffect(() => {
    loadArticles()
  }, [loadArticles, refreshKey])

  const handleCreate = async () => {
    const article = await createArticle('未命名文章', '<p></p>')
    setArticles(prev => [article, ...prev])
    onCreate(article)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await deleteArticle(id)
    setArticles(prev => prev.filter(a => a.id !== id))
    if (selectedId === id) {
      const remaining = articles.filter(a => a.id !== id)
      if (remaining.length > 0) {
        onSelect(remaining[0])
      }
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700">我的文章</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors"
        >
          <Plus size={14} />
          新建
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <FileText size={24} className="mb-2" />
            暂无文章
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {articles.map(article => {
              const isSelected = article.id === selectedId
              const plainText = article.content.replace(/<[^>]+>/g, '').slice(0, 60)

              return (
                <div
                  key={article.id}
                  onClick={() => onSelect(article)}
                  className={`group relative px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                        {article.title || '未命名文章'}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1 truncate">
                        {plainText || '暂无内容'}
                      </p>
                      <p className="text-xs text-gray-300 mt-1">{formatDate(article.updatedAt)}</p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, article.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
