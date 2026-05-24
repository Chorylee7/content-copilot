'use client'

import { useState } from 'react'
import { Download, FileText, Code, Copy, Check } from 'lucide-react'
import { exportToDocx } from '@/lib/export/docx'
import { generateWechatExportHtml } from '@/components/preview/WechatPreview'

interface ExportPanelProps {
  title: string
  content: string
}

export function ExportPanel({ title, content }: ExportPanelProps) {
  const [copied, setCopied] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleExportHtml = () => {
    const html = generateWechatExportHtml(title, content)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || '未命名文章'}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportDocx = async () => {
    setExporting(true)
    try {
      await exportToDocx(title, content)
    } finally {
      setExporting(false)
    }
  }

  const handleCopyHtml = async () => {
    const html = generateWechatExportHtml(title, content)
    await navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="px-4 py-3 border-b border-gray-200">
      <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
        <Download size={12} />
        导出
      </p>
      <div className="flex flex-col gap-2">
        <button
          onClick={handleExportHtml}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <Code size={14} />
          下载 HTML 文件
        </button>
        <button
          onClick={handleCopyHtml}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? '已复制 HTML' : '复制 HTML 代码'}
        </button>
        <button
          onClick={handleExportDocx}
          disabled={exporting}
          className="flex items-center gap-2 px-3 py-2 text-xs bg-gray-50 text-gray-600 rounded border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
        >
          <FileText size={14} />
          {exporting ? '生成中...' : '下载 Word 文档'}
        </button>
      </div>
    </div>
  )
}
