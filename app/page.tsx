'use client'

import { useState, useCallback, useEffect } from 'react'
import { Article } from '@/types'
import { ArticleList } from '@/components/article-list/ArticleList'
import { TiptapEditor } from '@/components/editor/TiptapEditor'
import { WechatPreview } from '@/components/preview/WechatPreview'
import { AIPanel } from '@/components/ai-panel/AIPanel'
import { ExportPanel } from '@/components/export/ExportPanel'
import { getArticle, updateArticle, createArticle } from '@/lib/storage/db'
import { Save, Eye, EyeOff } from 'lucide-react'

type RightPanelTab = 'preview' | 'ai'

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedText, setSelectedText] = useState('')
  const [rightTab, setRightTab] = useState<RightPanelTab>('ai')
  const [showPreview, setShowPreview] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Create a default article on first load if none exists
    const init = async () => {
      // Will be handled by ArticleList
    }
    init()
  }, [])

  const handleSelectArticle = useCallback(async (a: Article) => {
    const fresh = await getArticle(a.id)
    if (fresh) {
      setArticle(fresh)
      setTitle(fresh.title)
      setContent(fresh.content)
    }
  }, [])

  const handleCreateArticle = useCallback((a: Article) => {
    setArticle(a)
    setTitle(a.title)
    setContent(a.content)
  }, [])

  const handleSave = async () => {
    if (!article) return
    setSaving(true)
    await updateArticle(article.id, { title, content })
    setSaving(false)
    setRefreshKey(k => k + 1)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleApplyAI = (text: string) => {
    // Simple append for now - could be smarter about insertion
    setContent(prev => {
      if (selectedText) {
        return prev.replace(selectedText, text)
      }
      return prev + '<p>' + text.replace(/\n/g, '</p><p>') + '</p>'
    })
  }

  const handleSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.toString()) {
      setSelectedText(sel.toString())
    } else {
      setSelectedText('')
    }
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [handleSelection])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left: Article List */}
      <div className="w-64 flex-shrink-0">
        <ArticleList
          selectedId={article?.id || null}
          onSelect={handleSelectArticle}
          onCreate={handleCreateArticle}
          refreshKey={refreshKey}
        />
      </div>

      {/* Center: Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Header */}
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="输入文章标题..."
            className="flex-1 text-lg font-semibold text-gray-900 placeholder-gray-300 bg-transparent border-none outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                showPreview
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? '关闭预览' : '快速预览'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !article}
              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <Save size={14} />
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>

        {/* Editor or Preview */}
        {showPreview ? (
          <div className="flex-1 overflow-y-auto bg-[#f5f5f5]">
            <WechatPreview title={title} content={content} />
          </div>
        ) : (
          <TiptapEditor
            content={content}
            onChange={handleContentChange}
            placeholder="开始写作..."
          />
        )}
      </div>

      {/* Right: AI + Export */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-l border-gray-200">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setRightTab('ai')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              rightTab === 'ai'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            AI 助手
          </button>
          <button
            onClick={() => setRightTab('preview')}
            className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
              rightTab === 'preview'
                ? 'text-gray-900 border-b-2 border-gray-900'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            导出
          </button>
        </div>

        {rightTab === 'ai' ? (
          <>
            <div className="flex-1 overflow-hidden">
              <AIPanel
                articleTitle={title}
                articleContent={content}
                selectedText={selectedText}
                onApply={handleApplyAI}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 overflow-hidden">
              <ExportPanel title={title} content={content} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
