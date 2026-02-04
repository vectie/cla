# OpenClaw 项目分析报告

## 1. 项目概述

OpenClaw 是一个个人 AI 助手，您可以在自己的设备上运行。它可以在您已经使用的各种渠道上回答您的问题，包括 WhatsApp、Telegram、Slack、Discord、Google Chat、Signal、iMessage、Microsoft Teams、WebChat 等，还支持扩展渠道如 BlueBubbles、Matrix、Zalo 等。

主要特点：
- 本地优先的网关控制平面
- 多渠道收件箱
- 多代理路由
- 语音唤醒和通话模式
- 实时画布
- 一流工具支持
- 配套应用

## 2. 代码库结构分析

### 2.1 主要目录结构

```
├── .github/         # GitHub 配置文件
├── Swabble/         # 相关项目
├── apps/            # 移动应用（iOS、Android、macOS）
├── docs/            # 文档
├── extensions/      # 扩展渠道
├── git-hooks/       # Git 钩子
├── patches/         # 补丁文件
├── scripts/         # 脚本工具
├── skills/          # 技能模块
├── src/             # 核心源代码
├── test/            # 测试文件
├── ui/              # Web UI
├── project-anaylsis/ # 项目分析文档（本文档）
└── 配置文件         # 如 package.json、tsconfig.json 等
```

### 2.2 核心源代码目录 (src/)

| 目录/文件 | 功能描述 |
|---------|--------|
| acp/    | Agent Client Protocol 相关 |
| agents/ | 代理相关功能 |
| auto-reply/ | 自动回复功能 |
| browser/ | 浏览器控制 |
| canvas-host/ | 画布主机 |
| channels/ | 消息渠道 |
| cli/ | 命令行工具 |
| commands/ | 命令实现 |
| config/ | 配置管理 |
| cron/ | 定时任务 |
| daemon/ | 守护进程 |
| discord/ | Discord 集成 |
| gateway/ | 网关服务 |
| hooks/ | 钩子系统 |
| imessage/ | iMessage 集成 |
| infra/ | 基础设施 |
| line/ | LINE 集成 |
| logging/ | 日志系统 |
| macos/ | macOS 相关功能 |
| media/ | 媒体处理 |
| memory/ | 内存管理 |
| node-host/ | 节点主机 |
| plugin-sdk/ | 插件 SDK |
| plugins/ | 插件系统 |
| process/ | 进程管理 |
| routing/ | 路由系统 |
| security/ | 安全相关 |
| signal/ | Signal 集成 |
| slack/ | Slack 集成 |
| telegram/ | Telegram 集成 |
| terminal/ | 终端相关 |
| tts/ | 文本转语音 |
| tui/ | 终端用户界面 |
| utils/ | 工具函数 |
| web/ | Web 相关功能 |
| wizard/ | 向导功能 |
| index.ts | 主入口文件 |

## 3. 核心功能模块

### 3.1 网关 (Gateway)
- WebSocket 网络控制平面
- 客户端、工具和事件的统一管理
- 支持 Tailscale 暴露和 SSH 隧道

### 3.2 多渠道集成
- WhatsApp (Baileys)
- Telegram (grammY)
- Slack (Bolt)
- Discord (discord.js)
- Google Chat
- Signal
- iMessage
- 以及其他扩展渠道

### 3.3 代理系统
- Pi 代理运行时
- 会话模型
- 多代理路由

### 3.4 工具系统
- 浏览器控制
- 画布 + A2UI
- 节点（相机、屏幕录制、位置等）
- 定时任务 + 唤醒
- 会话管理

### 3.5 语音和视觉
- 语音唤醒
- 通话模式
- 实时画布

## 4. 技术栈

- **主要语言**: TypeScript
- **运行时**: Node.js ≥ 22
- **包管理器**: pnpm (推荐)
- **依赖库**: 
  - @agentclientprotocol/sdk
  - @aws-sdk/client-bedrock
  - @grammyjs/runner
  - @whiskeysockets/baileys
  - express
  - hono
  - playwright-core
  - ws
  - 等

## 5. 安装和配置指南

### 5.1 系统要求
- Node.js ≥ 22.12.0
- 支持的操作系统: macOS、Linux、Windows (via WSL2)

### 5.2 安装方法

**推荐方法**: 使用 onboarding 向导

```bash
# 使用 npm
npm install -g openclaw@latest

# 或使用 pnpm
pnpm add -g openclaw@latest

# 运行向导
openclaw onboard --install-daemon
```

**从源码安装**:

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw

pnpm install
pnpm ui:build
pnpm build

pnpm openclaw onboard --install-daemon
```

### 5.3 配置文件

配置文件位置: `~/.openclaw/openclaw.json`

最小配置示例:

```json5
{
  agent: {
    model: "anthropic/claude-opus-4-5"
  }
}
```

## 6. 一步一步的操作流程

### 6.1 首次设置

1. **安装 OpenClaw**
   ```bash
   npm install -g openclaw@latest
   ```

2. **运行 onboarding 向导**
   ```bash
   openclaw onboard --install-daemon
   ```
   - 按照提示完成网关设置
   - 配置工作区
   - 设置消息渠道
   - 配置技能

3. **启动网关**
   ```bash
   openclaw gateway --port 18789 --verbose
   ```

4. **发送测试消息**
   ```bash
   openclaw message send --to +1234567890 --message "Hello from OpenClaw"
   ```

5. **与助手对话**
   ```bash
   openclaw agent --message "Ship checklist" --thinking high
   ```

### 6.2 日常使用

1. **检查状态**
   ```bash
   openclaw status
   ```

2. **发送消息**
   ```bash
   openclaw message send --to <channel>:<recipient> --message "你的消息"
   ```

3. **使用浏览器工具**
   ```bash
   openclaw browser --url "https://example.com"
   ```

4. **管理会话**
   ```bash
   openclaw sessions list
   ```

5. **使用技能**
   ```bash
   openclaw skills list
   ```

### 6.3 聊天命令

在 WhatsApp/Telegram/Slack/Google Chat/Microsoft Teams/WebChat 中发送：

- `/status` - 紧凑会话状态
- `/new` 或 `/reset` - 重置会话
- `/compact` - 压缩会话上下文
- `/think <level>` - 设置思考级别
- `/verbose on|off` - 详细模式
- `/usage off|tokens|full` - 使用情况
- `/restart` - 重启网关
- `/activation mention|always` - 群组激活模式

## 7. 安全模型

- **默认**：工具在主机上运行，主会话具有完全访问权限
- **群组/渠道安全**：设置 `agents.defaults.sandbox.mode: "non-main"` 为非主会话启用 Docker 沙箱
- **沙箱默认**：允许 `bash`、`process`、`read`、`write`、`edit` 等，拒绝 `browser`、`canvas`、`nodes` 等

## 8. 故障排除

### 8.1 常见问题

1. **端口被占用**
   - 检查端口使用情况：`openclaw doctor ports`
   - 选择不同端口：`openclaw gateway --port <新端口>`

2. **消息渠道连接问题**
   - 检查渠道配置：`openclaw channels status`
   - 重新登录渠道：`openclaw channels login <渠道>`

3. **模型连接问题**
   - 检查 API 密钥：`openclaw models test`
   - 查看日志：`openclaw logs`

### 8.2 日志和诊断

- 查看日志：`openclaw logs`
- 运行诊断：`openclaw doctor`
- 健康检查：`openclaw health`

## 9. 高级功能

### 9.1 远程访问

- **Tailscale Serve/Funnel**：配置 `gateway.tailscale.mode`
- **SSH 隧道**：用于远程访问

### 9.2 节点系统

- **macOS 节点**：系统命令、通知、画布
- **iOS 节点**：语音触发、画布
- **Android 节点**：画布、相机、屏幕捕获

### 9.3 技能平台

- **ClawdHub**：技能注册表
- **自定义技能**：在 `~/.openclaw/workspace/skills/` 创建

## 10. 总结

OpenClaw 是一个功能强大的个人 AI 助手，具有以下优势：

- **本地优先**：在您自己的设备上运行，保护隐私
- **多渠道**：支持各种消息平台
- **多功能**：浏览器控制、画布、节点等工具
- **可扩展**：技能平台和插件系统
- **安全**：沙箱和权限控制

通过本指南，您应该能够：
1. 理解 OpenClaw 的架构和功能
2. 成功安装和配置 OpenClaw
3. 开始使用 OpenClaw 作为您的个人 AI 助手
4. 排查常见问题

## 11. 资源链接

- [官方网站](https://openclaw.ai)
- [文档](https://docs.openclaw.ai)
- [GitHub 仓库](https://github.com/openclaw/openclaw)
- [Discord 社区](https://discord.gg/clawd)
- [ClawdHub](https://ClawdHub.com)
