'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { ImageIcon } from 'lucide-react'
import { FloatingAIMenu } from './FloatingAIMenu'

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  onApplyAI: (text: string) => void
  apiKey: string
}

export function TiptapEditor({ content, onChange, placeholder = '开始写作...', onApplyAI, apiKey }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-full px-6 py-4',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files) {
          const files = Array.from(event.dataTransfer.files)
          files.forEach((file) => {
            if (file.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const result = e.target?.result as string
                if (result) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: result })
                    )
                  )
                }
              }
              reader.readAsDataURL(file)
            }
          })
          return true
        }
        return false
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (items) {
          Array.from(items).forEach((item) => {
            if (item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                const reader = new FileReader()
                reader.onload = (e) => {
                  const result = e.target?.result as string
                  if (result) {
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({ src: result })
                      )
                    )
                  }
                }
                reader.readAsDataURL(file)
              }
            }
          })
        }
        return false
      },
    },
  })

  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file && editor) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          const result = ev.target?.result as string
          if (result) {
            editor.chain().focus().setImage({ src: result }).run()
          }
        }
        reader.readAsDataURL(file)
      }
    }
    input.click()
  }

  const handleAIAction = async (action: string, text: string): Promise<string> => {
    if (!apiKey) {
      return '请先配置 API Key'
    }

    const prompts: Record<string, string> = {
      polish: '请润色以下文字，使其表达更流畅、更有文采，但保持原意不变：',
      continue: '请根据以下内容续写，保持一致的语气和风格：',
      expand: '请扩写以下内容，增加细节和例子，使内容更丰富：',
    }

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
        system: '你是一位专业的中文写作助手，擅长公众号文章创作。',
        messages: [{ role: 'user', content: `${prompts[action]}\n\n${text}` }],
      }),
    })

    if (!response.ok) {
      throw new Error(`API 错误: ${response.status}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || '无返回内容'
  }

  const handleApplyAI = (text: string) => {
    if (editor) {
      editor.chain().focus().insertContent(text.replace(/\n/g, '<br>')).run()
    }
    onApplyAI(text)
  }

  if (!editor) {
    return <div className="flex-1 px-6 py-4 text-gray-400">加载编辑器...</div>
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 bg-white">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • 列表
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1. 列表
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          " 引用
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          — 分隔线
        </ToolbarButton>
        <ToolbarButton
          onClick={handleImageUpload}
        >
          <ImageIcon size={14} />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Floating AI Menu */}
      <FloatingAIMenu onAction={handleAIAction} onApply={handleApplyAI} />
    </div>
  )
}

function ToolbarButton({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-gray-900 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
