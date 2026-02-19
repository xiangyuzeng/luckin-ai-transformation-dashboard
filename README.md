# Luckin Coffee USA — AI Transformation Dashboard

**41个AI用例 · 7大部门 · 18个月路线图**

管理层演示主仪表板，覆盖完整AI转型计划、用例详情、部门视图、已完成项目演示链接和投资回报分析。

## 🚀 部署到 Vercel

```bash
# 方法一: CLI
npm install
vercel

# 方法二: GitHub → Vercel 自动部署
git init && git add . && git commit -m "init"
git remote add origin <your-repo-url>
git push -u origin main
# → vercel.com/new → Import → Deploy
```

## 📁 项目结构

```
├── src/
│   ├── Dashboard.jsx    # 主仪表板组件 (41个用例完整数据)
│   └── main.jsx         # React入口
├── public/favicon.svg
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## 📊 仪表板功能

| 标签页 | 内容 |
|--------|------|
| 总览 | 核心KPI、数据就绪度、6个已部署AI系统、基础设施规模 |
| 用例矩阵 | 41个用例完整表格，支持搜索/部门/数据/优先级过滤 |
| IT/营销/财务/产品/运营/供应链/高管 | 各部门专属视图，可展开用例详情 |
| 演示链接 | 已部署的Vercel/Netlify交互式仪表板集合 |
| 路线图 | 4阶段18个月实施计划 + 里程碑时间线 |
| 投资回报 | 投资摘要、招聘计划、TOP5高价值用例 |

## 技术栈

- React 18 + Vite 5
- Recharts (图表)
- DM Sans + Noto Sans SC (字体)

---
Luckin Coffee USA · DevOps DBA · 2026年2月
