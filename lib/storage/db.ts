import Dexie, { Table } from 'dexie'
import { Article } from '@/types'

class ArticleDatabase extends Dexie {
  articles!: Table<Article, string>

  constructor() {
    super('ContentCopilotDB')
    this.version(1).stores({
      articles: 'id, createdAt, updatedAt',
    })
  }
}

export const db = new ArticleDatabase()

export async function createArticle(title: string, content: string): Promise<Article> {
  const now = Date.now()
  const article: Article = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: now,
    updatedAt: now,
  }
  await db.articles.add(article)
  return article
}

export async function updateArticle(id: string, updates: Partial<Pick<Article, 'title' | 'content'>>): Promise<void> {
  await db.articles.update(id, {
    ...updates,
    updatedAt: Date.now(),
  })
}

export async function deleteArticle(id: string): Promise<void> {
  await db.articles.delete(id)
}

export async function getArticle(id: string): Promise<Article | undefined> {
  return db.articles.get(id)
}

export async function getAllArticles(): Promise<Article[]> {
  return db.articles.orderBy('updatedAt').reverse().toArray()
}
