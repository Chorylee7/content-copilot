'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sparkles, RefreshCw, Type, X, Loader2 } from 'lucide-react'

interface FloatingAIMenuProps {
  onAction: (action: string, text: string) => Promise<string>
  onApply: (text: string) => void
}

const actions = [
  { key: 'polish', label: '润色', icon: <Sparkles size={13} /> },
  { key: 'continue', label: '续写', icon: <RefreshCw size={13} /> },
  { key: 'expand', label: '扩写', icon: <Type size={13} /> },
]

export function FloatingAIMenu({ onAction, onApply }: FloatingAIMenuProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedText, setSelectedText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [showResult, setShowResult] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleSelection = useCallback(() => {
    const sel = window.getSelection()
    if (sel && sel.toString().trim().length > 0) {
      const text = sel.toString()
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      // Position menu above the selection
      const menuWidth = 220
      let x = rect.left + rect.width / 2 - menuWidth / 2
      x = Math.max(10, Math.min(x, window.innerWidth - menuWidth - 10))
      const y = rect.top - 50

      setPosition({ x, y: Math.max(10, y) })
      setSelectedText(text)
      setShowResult(false)
      setResult('')
    } else {
      setPosition(null)
      setSelectedText('')
    }
  }, [])

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelection)
    document.addEventListener('mouseup', handleSelection)
    return () => {
      document.removeEventListener('selectionchange', handleSelection)
      document.removeEventListener('mouseup', handleSelection)
    }
  }, [handleSelection])

  const handleAction = async (actionKey: string) => {
    if (!selectedText || loading) return
    setLoading(true)
    try {
      const text = await onAction(actionKey, selectedText)
      setResult(text)
      setShowResult(true)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    onApply(result)
    setShowResult(false)
    setPosition(null)
    setSelectedText('')
    window.getSelection()?.removeAllRanges()
  }

  const handleClose = () => {
    setPosition(null)
    setShowResult(false)
    setResult('')
    window.getSelection()?.removeAllRanges()
  }

  if (!position) return null

  return (
    <>
      {/* Floating action menu */}
      <div
        ref={menuRef}
        style={{ left: position.x, top: position.y }}
        className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl py-1.5 px-2 flex items-center gap-1"
      >
        {loading ? (
          <div className="flex items-center gap-2 px-3 py-1">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-xs">AI 思考中...</span>
          </div>
        ) : showResult ? (
          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 rounded transition-colors"
            >
              替换
            </button>
            <button
              onClick={() => setShowResult(false)}
              className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
            >
              重试
            </button>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            {actions.map((action) => (
              <button
                key={action.key}
                onClick={() => handleAction(action.key)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs rounded hover:bg-gray-700 transition-colors"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors ml-1"
            >
              <X size={14} />
            </button>
          </>
        )}
      </div>

      {/* Result preview tooltip */}
      {showResult && result && (
        <div
          style={{
            left: Math.max(10, Math.min(position.x, window.innerWidth - 320)),
            top: position.y + 45,
          }}
          className="fixed z-50 w-80 max-h-48 overflow-y-auto bg-white text-gray-700 rounded-lg shadow-xl border border-gray-200 p-3 text-xs leading-relaxed"
        >
          {result}
        </div>
      )}
    </>
  )
}
