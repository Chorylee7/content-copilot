'use client'

import { useMemo } from 'react'

interface WechatPreviewProps {
  title: string
  content: string
}

export function WechatPreview({ title, content }: WechatPreviewProps) {
  const wechatHtml = useMemo(() => {
    // Convert Tiptap HTML to WeChat-friendly HTML with inline styles
    return convertToWechatHtml(content)
  }, [content])

  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f5] p-4">
      <div className="max-w-[375px] mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
        {/* WeChat article header */}
        <div className="px-4 pt-5 pb-3">
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title || '未命名文章'}</h1>
          <div className="flex items-center gap-2 mt-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
              公
            </div>
            <div>
              <p className="text-xs text-blue-600">公众号名称</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('zh-CN')}</p>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div
          className="px-4 pb-6 wechat-content"
          dangerouslySetInnerHTML={{ __html: wechatHtml }}
        />

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">阅读 100+</span>
          <div className="flex gap-3">
            <span className="text-xs text-gray-400">👍 点赞</span>
            <span className="text-xs text-gray-400">💬 在看</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function convertToWechatHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html

  // Apply WeChat-specific styles
  const elements = div.querySelectorAll('*')
  elements.forEach((el) => {
    const element = el as HTMLElement
    const tag = element.tagName.toLowerCase()

    switch (tag) {
      case 'h1':
        element.style.cssText = 'font-size: 20px; font-weight: bold; margin: 20px 0 12px; line-height: 1.4; color: #333;'
        break
      case 'h2':
        element.style.cssText = 'font-size: 18px; font-weight: bold; margin: 18px 0 10px; line-height: 1.4; color: #333;'
        break
      case 'h3':
        element.style.cssText = 'font-size: 16px; font-weight: bold; margin: 16px 0 8px; line-height: 1.4; color: #333;'
        break
      case 'p':
        element.style.cssText = 'margin: 12px 0; line-height: 1.75; color: #333; font-size: 15px;'
        break
      case 'blockquote':
        element.style.cssText = 'border-left: 4px solid #07c160; padding: 8px 16px; margin: 16px 0; background: #f7f7f7; color: #666; font-style: italic;'
        break
      case 'ul':
        element.style.cssText = 'margin: 12px 0; padding-left: 20px;'
        break
      case 'ol':
        element.style.cssText = 'margin: 12px 0; padding-left: 20px;'
        break
      case 'li':
        element.style.cssText = 'margin: 6px 0; line-height: 1.6; color: #333; font-size: 15px;'
        break
      case 'a':
        element.style.cssText = 'color: #576b95; text-decoration: underline;'
        break
      case 'code':
        element.style.cssText = 'background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace; color: #e83e8c;'
        break
      case 'hr':
        element.style.cssText = 'border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;'
        break
      case 'strong':
        element.style.fontWeight = 'bold'
        break
      case 'em':
        element.style.fontStyle = 'italic'
        break
    }
  })

  return div.innerHTML
}

export function generateWechatExportHtml(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || '未命名文章'}</title>
  <style>
    body { max-width: 680px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; }
    h1 { font-size: 22px; font-weight: bold; margin: 24px 0 16px; line-height: 1.4; color: #333; }
    h2 { font-size: 19px; font-weight: bold; margin: 20px 0 12px; line-height: 1.4; color: #333; }
    h3 { font-size: 17px; font-weight: bold; margin: 16px 0 10px; line-height: 1.4; color: #333; }
    p { margin: 14px 0; line-height: 1.75; color: #333; font-size: 16px; }
    blockquote { border-left: 4px solid #07c160; padding: 10px 18px; margin: 18px 0; background: #f7f7f7; color: #666; font-style: italic; }
    ul, ol { margin: 14px 0; padding-left: 24px; }
    li { margin: 6px 0; line-height: 1.6; color: #333; font-size: 16px; }
    a { color: #576b95; text-decoration: underline; }
    code { background: #f4f4f5; padding: 2px 6px; border-radius: 4px; font-size: 14px; font-family: monospace; color: #e83e8c; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 24px 0; }
  </style>
</head>
<body>
  <h1>${title || '未命名文章'}</h1>
  ${convertToWechatHtml(content)}
</body>
</html>`
}
