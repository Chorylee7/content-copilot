# Content Copilot

AI辅助写作工具，支持微信公众号、小红书等多平台内容创作。

## 项目目标

构建一个智能写作助手，帮助创作者高效完成从选题、构思、撰写到多平台发布的内容创作全流程。

## 参考开源项目

本项目参考并学习了以下优秀的开源项目：

| 项目 | 说明 | 参考点 |
|------|------|--------|
| [Topic_Writer_Flow](https://github.com/whotto/Topic_Writer_Flow) | AI智能写作辅助工具 | 话题分析、思维导图、大纲生成 |
| [deep_search_write](https://github.com/liangdabiao/deep_search_write) | 双Agent协作写作 | 写作Agent+知识库Agent协作架构 |
| [Xiaohongshu-Content-Generator](https://github.com/shaozheng0503/Xiaohongshu-Content-Generator) | 小红书内容生成 | 多模板渲染、图片导出、风格转换 |
| [xhs_ai_publisher](https://github.com/BetaStreetOmnis/xhs_ai_publisher) | 小红书AI发布助手 | 热点采集、自动发布、多账号管理 |
| [AIWriteX](https://github.com/iniwap/AIWriteX) | 微信公众号AI工具 | 多Agent系统、反AI检测、一键排版 |
| [auto-claude-writing-agent-pub](https://github.com/MapleShaw/auto-claude-writing-agent-pub) | Claude多平台写作 | 平台特定规则、写作风格匹配 |

## 核心功能规划

### 阶段一：写作辅助
- [ ] 热点话题追踪与选题推荐
- [ ] AI辅助大纲生成
- [ ] Markdown编辑器（支持实时预览）
- [ ] AI续写/润色/改写
- [ ] 个人写作风格学习

### 阶段二：多平台适配
- [ ] 微信公众号排版预览
- [ ] 小红书风格转换（图片+文案）
- [ ] 多平台格式一键导出
- [ ] 内容合规性检查

### 阶段三：发布与数据
- [ ] 内容发布接口（微信公众号、小红书等）
- [ ] 发布历史管理
- [ ] 基础数据分析

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **AI**: Vercel AI SDK v6 + Claude
- **数据库**: 待定
- **部署**: Vercel

## 开发计划

见项目 Issues 和 Roadmap。
