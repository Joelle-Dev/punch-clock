# 头部文案远程 API 约定（方案2：自建 API + WebSocket）

前端已实现：打开时 GET 当前文案、建立 WebSocket、管理员 POST 更新；收到 `banner_updated` 时更新展示。  
自建后端需实现以下约定。

## 环境变量（前端）

- `VITE_API_BASE`：API 根地址，如 `https://your-api.example.com`
- `VITE_BANNER_ADMIN_TOKEN`：可选，POST 时以 `Authorization: Bearer <token>` 鉴权

## 1. GET 当前文案

- **URL**：`GET {VITE_API_BASE}/api/banner`
- **响应**：JSON `{ "text": "当前头部文案" }`
  - 无文案时可返回 `{}` 或 404，前端会退回按星期展示

## 2. POST 更新文案（管理员）

- **URL**：`POST {VITE_API_BASE}/api/banner`
- **请求头**：`Content-Type: application/json`，若配置了 token 则带 `Authorization: Bearer <token>`
- **请求体**：`{ "text": "新文案" }`
- **响应**：成功 2xx，失败 4xx/5xx；成功后向所有已连接的 WebSocket 客户端广播更新（见下）

## 3. WebSocket 实时推送

- **URL**：`wss://{host}/api/banner/ws`（由前端根据 VITE_API_BASE 的 host 自动拼接）
- **服务端**：在 POST 更新文案成功后，向当前所有连接的 WS 客户端发送一条 JSON 消息：
  - 推荐：`{ "type": "banner_updated", "text": "新文案" }`
  - 或仅通知：`{ "type": "banner_updated" }`，前端会再请求一次 GET 取最新文案

前端在收到 `type === 'banner_updated'` 时更新顶部文案，实现对方无需刷新即可看到新内容。
