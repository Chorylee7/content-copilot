import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  UnderlineType,
  convertInchesToTwip,
  Packer,
} from 'docx'
import { saveAs } from 'file-saver'

function parseHtmlToDocxElements(html: string): Paragraph[] {
  const paragraphs: Paragraph[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function processNode(node: Node): Paragraph[] {
    const result: Paragraph[] = []

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim()
      if (text) {
        return [new Paragraph({ children: [new TextRun({ text, size: 24 })] })]
      }
      return []
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return []

    const element = node as HTMLElement
    const tag = element.tagName.toLowerCase()

    switch (tag) {
      case 'h1':
        result.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          })
        )
        break

      case 'h2':
        result.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        )
        break

      case 'h3':
        result.push(
          new Paragraph({
            text: element.textContent || '',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 160, after: 80 },
          })
        )
        break

      case 'p':
        result.push(...processParagraph(element))
        break

      case 'blockquote':
        result.push(
          new Paragraph({
            text: element.textContent || '',
            spacing: { before: 120, after: 120 },
            indent: { left: convertInchesToTwip(0.3) },
            border: {
              left: {
                color: '07C160',
                space: 8,
                style: 'single',
                size: 12,
              },
            },
            shading: { fill: 'F7F7F7' },
          })
        )
        break

      case 'ul':
      case 'ol':
        Array.from(element.children).forEach((li) => {
          result.push(
            new Paragraph({
              text: `• ${li.textContent || ''}`,
              spacing: { before: 60, after: 60 },
              indent: { left: convertInchesToTwip(0.3) },
            })
          )
        })
        break

      case 'hr':
        result.push(
          new Paragraph({
            text: '',
            border: {
              bottom: {
                color: 'E5E5E5',
                space: 1,
                style: 'single',
                size: 6,
              },
            },
            spacing: { before: 120, after: 120 },
          })
        )
        break

      case 'br':
        break

      default:
        Array.from(element.childNodes).forEach((child) => {
          result.push(...processNode(child))
        })
    }

    return result
  }

  function processParagraph(element: HTMLElement): Paragraph[] {
    const children: (TextRun | Paragraph)[] = []

    element.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        if (text) {
          children.push(new TextRun({ text, size: 24 }))
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()

        switch (tag) {
          case 'strong':
          case 'b':
            children.push(
              new TextRun({ text: el.textContent || '', bold: true, size: 24 })
            )
            break
          case 'em':
          case 'i':
            children.push(
              new TextRun({ text: el.textContent || '', italics: true, size: 24 })
            )
            break
          case 'u':
            children.push(
              new TextRun({
                text: el.textContent || '',
                underline: { type: UnderlineType.SINGLE },
                size: 24,
              })
            )
            break
          case 'a':
            children.push(
              new TextRun({
                text: el.textContent || '',
                color: '576B95',
                underline: { type: UnderlineType.SINGLE },
                size: 24,
              })
            )
            break
          case 'code':
            children.push(
              new TextRun({
                text: el.textContent || '',
                font: 'Courier New',
                size: 22,
                color: 'E83E8C',
              })
            )
            break
          case 'br':
            break
          default:
            children.push(new TextRun({ text: el.textContent || '', size: 24 }))
        }
      }
    })

    if (children.length === 0) {
      return [new Paragraph({ text: '', spacing: { before: 120, after: 120 } })]
    }

    const textRuns = children.filter((c) => c instanceof TextRun) as TextRun[]

    return [
      new Paragraph({
        children: textRuns.length > 0 ? textRuns : [new TextRun({ text: '', size: 24 })],
        spacing: { before: 120, after: 120, line: 360 },
      }),
    ]
  }

  Array.from(doc.body.childNodes).forEach((node) => {
    paragraphs.push(...processNode(node))
  })

  return paragraphs
}

export async function exportToDocx(title: string, htmlContent: string) {
  const paragraphs = parseHtmlToDocxElements(htmlContent)

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          new Paragraph({
            text: title || '未命名文章',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          ...paragraphs,
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${title || '未命名文章'}.docx`)
}
