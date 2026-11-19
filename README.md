# CodeM 快速上手 Demo

## 项目简介

本项目是一个基于 **Vite + TypeScript** 构建的轻量前端示例仓库,用于演示 **CodeM（飞书 AI 研发智能体）** 的自动化研发闭环能力。仓库本身即为一个可运行的小型 Web 应用:页面中预埋了若干功能 bug,可作为 CodeM 自动定位、修复并重新部署的演练对象。你可以直接 fork 本仓库快速搭建自己的演示环境,无需额外业务代码。

一个用于体验 **CodeM** 自动改 bug 闭环的开箱即用示例站点。页面里预埋了若干功能 bug,你可以:

1. 部署这份带 bug 的版本到自己的 GitHub Pages;
2. 在群聊 / 飞书项目中把问题反馈给 CodeM,由其在本地/云端沙箱自动定位、修复并重新部署到**同一地址**;
3. 部署完成后（约 30s-2min）刷新页面,即可看到修复效果。


## 在线预览

- 原始示例站点:https://codem-bd.github.io/codem-demo/
- 你 fork 后的地址:`https://<你的账号>.github.io/<你的仓库名>/`

## 本地运行

需要 Node.js `>=20.0.0`。

```bash
npm install
npm run dev      # 本地开发服务器
npm run build    # 生产构建,产物在 dist/
npm run preview  # 预览生产产物
```

## 一键部署
```bash
npm run deploy
```