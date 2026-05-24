'use client'

import { useMemo } from 'react'

interface XiaohongshuPreviewProps {
  title: string
  content: string
}

const EMOJIS = ['✨', '💡', '📌', '🔥', '💯', '🌟', '👇', '⬇️', '❗', '❓', '⭐', '📍', '💪', '🎯', '🚀']

function insertEmojis(text: string): string {
  const sentences = text.split(/([。！？.!?]\s*)/)
  let result = ''
  let emojiIndex = 0

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i]
    const punctuation = sentences[i + 1] || ''
    if (sentence && sentence.trim()) {
      // Add emoji every 2-3 sentences
      if (i > 0 && i % 4 === 0) {
        const emoji = EMOJIS[emojiIndex % EMOJIS.length]
        result += emoji + ' '
        emojiIndex++
      }
      result += sentence.trim() + punctuation
    }
  }

  return result
}

function compressToXiaohongshu(content: string): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

  // If already short, just emoji-fy it
  if (plainText.length < 800) {
    return insertEmojis(plainText)
  }

  // Extract key sentences (first sentence of each paragraph, and sentences with numbers/bullet points)
  const sentences = plainText.split(/([。！？.!?]\s*)/)
  const keyPoints: string[] = []

  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i]
    if (!sentence) continue

    const trimmed = sentence.trim()
    if (!trimmed) continue

    // Keep sentences with numbers, key markers, or first sentence
    if (
      /\d/.test(trimmed) ||
      /[一二三四五六七八九十]./.test(trimmed) ||
      /^(首先|其次|最后|总结|建议|注意|关键|核心)/.test(trimmed) ||
      keyPoints.length === 0
    ) {
      keyPoints.push(trimmed)
    }
  }

  // Limit to ~600 characters
  let result = keyPoints.join('。')
  if (result.length > 900) {
    result = result.slice(0, 900) + '...'
  }

  return insertEmojis(result)
}

export function XiaohongshuPreview({ title, content }: XiaohongshuPreviewProps) {
  const xhsContent = useMemo(() => compressToXiaohongshu(content), [content])

  const hashtags = useMemo(() => {
    const tags: string[] = []
    const plainText = content.replace(/<[^>]+>/g, '')

    // Extract potential hashtags from headings and keywords
    const headings = plainText.match(/^(#{1,3}\s+.+)$/gm) || []
    headings.forEach((h) => {
      const tag = h.replace(/^#+\s+/, '').trim().slice(0, 10)
      if (tag) tags.push(tag)
    })

    // Default tags based on content length
    if (tags.length < 3) {
      tags.push('干货分享', '经验总结', '自我提升')
    }

    return tags.slice(0, 6)
  }, [content])

  return (
    <div className="h-full overflow-y-auto bg-[#f5f5f5] p-4">
      <div className="max-w-[375px] mx-auto">
        {/* XHS Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* User header */}
          <div className="flex items-center gap-3 px-4 pt-4 pb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              我
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">我的小红书</p>
              <p className="text-xs text-gray-400">{new Date().toLocaleDateString('zh-CN')}</p>
            </div>
            <button className="ml-auto px-3 py-1 text-xs bg-red-500 text-white rounded-full">
              + 关注
            </button>
          </div>

          {/* Content */}
          <div className="px-4 pb-3">
            {/* Title */}
            {title && (
              <h2 className="text-base font-bold text-gray-900 mb-2 leading-snug">
                {title}
              </h2>
            )}

            {/* Body text */}
            <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
              {xhsContent}
            </div>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mt-3">
              {hashtags.map((tag, i) => (
                <span key={i} className="text-sm text-blue-500">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Image placeholder grid */}
          <div className="px-4 pb-4">
            <div className="grid grid-cols-2 gap-1 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-pink-100 to-red-50 flex items-center justify-center text-gray-300 text-xs">
                封面图
              </div>
              <div className="aspect-square bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-gray-300 text-xs">
                配图 2
              </div>
            </div>
          </div>

          {/* Interaction bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <span className="text-lg">❤️</span>
              <span className="text-xs text-gray-500">128</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span className="text-xs text-gray-500">收藏</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">💬</span>
              <span className="text-xs text-gray-500">评论</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-white rounded-lg shadow-sm">
          <p className="text-xs text-gray-500 font-medium mb-1">小红书优化建议</p>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• 建议配 3-9 张精美图片</li>
            <li>• 文案控制在 300-1000 字</li>
            <li>• 多用 emoji 和短句分段</li>
            <li>• 添加 3-6 个相关话题标签</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
