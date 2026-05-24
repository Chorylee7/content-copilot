'use client'

import { useState } from 'react'
import { Sparkles, Wand2, ListOrdered, Type, Key, ChevronDown, ChevronUp, RefreshCw, Send } from 'lucide-react'

type AIAction = 'polish' | 'continue' | 'expand' | 'outline' | 'title'

interface AIPanelProps {
  articleTitle: string
  articleContent: string
  selectedText: string
  onApply: (text: string) => void
}

const actions: { key: AIAction; label: string; icon: React.ReactNode; prompt: string }[] = [
  {
    key: 'polish',
    label: '润色',
    icon: <Sparkles size={14} />,
    prompt: '请润色以下文字，使其表达更流畅、更有文采，但保持原意不变：',
  },
  {
    key: 'continue',
    label: '续写',
    icon: <RefreshCw size={14} />,
    prompt: '请根据以下内容续写，保持一致的语气和风格：',
  },
  {
    key: 'expand',
    label: '扩写',
    icon: <Type size={14} />,
    prompt: '请扩写以下内容，增加细节和例子，使内容更丰富：',
  },
  {
    key: 'outline',
    label: '大纲',
    icon: <ListOrdered size={14} />,
    prompt: '请为以下主题生成一个详细的文章大纲：',
  },
  {
    key: 'title',
    label: '取标题',
    icon: <Wand2 size={14} />,
    prompt: '请为以下文章生成 5 个吸引人的标题：',
  },
]

export function AIPanel({ articleTitle, articleContent, selectedText, onApply }: AIPanelProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: (typeof actions)[0]) => {
    if (!apiKey) {
      setResult('请先配置 API Key')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const targetText = selectedText || articleContent.slice(0, 2000)
      const systemPrompt = '你是一位专业的中文写作助手，擅长公众号文章创作。'
      const userPrompt = `${action.prompt}\n\n${targetText}`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (!response.ok) {
        throw new Error(`API 错误: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content?.[0]?.text || '无返回内容'
      setResult(text)
    } catch (err) {
      setResult(`请求失败: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCustom = async () => {
    if (!apiKey || !customPrompt.trim()) return
    handleAction({
      key: 'polish',
      label: '自定义',
      icon: <Send size={14} />,
      prompt: customPrompt,
    } as any)
  }

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles size={16} className="text-purple-500" />
          AI 写作助手
        </h2>
      </div>

      {/* API Key */}
      <div className="px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setShowKey(!showKey)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Key size={12} />
          API Key 配置
          {showKey ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showKey && (
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="输入你的 Claude API Key"
            className="mt-2 w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400"
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-xs text-gray-400 mb-2">
          {selectedText ? `已选中 ${selectedText.length} 字` : '未选中文字，将使用全文'}
        </p>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleAction(action)}
              disabled={loading}
              className="flex items-center gap-1 px-2 py-1.5 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="输入自定义指令..."
            onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
            className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleCustom}
            disabled={loading}
            className="px-3 py-2 bg-gray-900 text-white text-xs rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center h-20 text-gray-400 text-xs">
            <RefreshCw size={16} className="animate-spin mr-2" />
            AI 思考中...
          </div>
        ) : result ? (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-100 whitespace-pre-wrap">
              {result}
            </div>
            <button
              onClick={() => onApply(result)}
              className="w-full py-2 bg-purple-50 text-purple-600 text-xs rounded border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              应用到编辑器
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-gray-300 text-xs">
            <Sparkles size={24} className="mb-2" />
            选择操作或输入自定义指令
          </div>
        )}
      </div>
    </div>
  )
}
