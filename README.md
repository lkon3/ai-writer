# AI写作助手

一款功能完整的AI辅助写作工具，支持多家主流AI服务提供商，帮助作者提高创作效率。

## ✨ 功能特性

### 🤖 AI集成
- 支持多家主流AI服务提供商：
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - DeepSeek
  - 智谱AI (GLM)
  - 本地模型 (Ollama)
  - 自定义API端点
- 自定义API密钥和参数配置
- API连接测试功能

### 📝 提示词管理
- 预设提示词模板库
- 自定义提示词创建和编辑
- 提示词分类管理
- 变量插值支持（`{变量名}`格式）
- 提示词导入/导出功能
- 常用变量快速插入

### 📚 书籍管理
- **基础管理**
  - 创建/编辑/删除书籍
  - 书籍元数据（标题、作者、简介）
  - 字数统计
  - 多书籍项目管理

- **章节管理**
  - 章节CRUD操作
  - 章节排序
  - 实时字数统计
  - 章节拆分功能（按字数/段落/标记）

- **大纲功能**
  - 故事梗概
  - 章节大纲
  - 人物设定
  - 世界观设定
  - 树形结构可视化

### ✍️ 编辑器
- 左侧章节导航
- 中央Markdown编辑区
- 右侧AI助手面板
- 实时字数统计
- 自动保存
- 全屏模式
- 章节快速切换

### 🎯 AI助手功能
- 续写功能
- 改写/润色
- 风格转换
- 情节建议
- 对话生成
- 基于提示词的定制生成
- 流式响应显示

### 📊 AI拆书分析
- 开头三章分析
- 主线剧情分析
- 人物分析
- 世界设定分析
- 写作风格分析
- 支线剧情分析
- 分析报告导出
- 保存到书籍大纲

### 📤 导出功能
- 导出为TXT
- 导出为Markdown
- 导出为EPUB（计划中）
- 导出为PDF（计划中）

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **本地存储**: IndexedDB (Dexie.js)
- **AI SDK**: OpenAI SDK（兼容多家API）

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/lkon3/ai-writer-web.git

# 进入项目目录
cd ai-writer-web

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 🚀 使用指南

### 首次使用

1. **配置API**
   - 点击侧边栏"设置"
   - 添加API配置
   - 选择服务商（OpenAI/Claude/DeepSeek等）
   - 输入API密钥
   - 测试连接

2. **创建书籍**
   - 进入"书籍管理"
   - 点击"新建书籍"
   - 填写书名、作者、简介

3. **开始写作**
   - 打开编辑器
   - 创建章节
   - 使用AI助手辅助创作

### AI拆书分析

1. 点击侧边栏"AI拆书"
2. 粘贴要分析的书籍内容（建议5000-10000字）
3. 选择分析类型
4. 点击"开始分析"
5. 查看分析结果
6. 可导出报告或保存到书籍大纲

### 提示词使用

1. 进入"提示词管理"
2. 新建提示词
3. 使用常用变量或自定义变量（`{变量名}`格式）
4. 在编辑器中选择提示词并使用

## 📁 项目结构

```
ai-writer-web/
├── src/
│   ├── api/              # API调用封装
│   │   ├── providers/    # 各家API适配器
│   │   └── index.ts      # API服务
│   ├── components/       # 公共组件
│   ├── database/         # IndexedDB封装
│   ├── stores/           # Pinia状态管理
│   │   ├── book.ts       # 书籍状态
│   │   ├── prompt.ts     # 提示词状态
│   │   ├── api.ts        # API配置状态
│   │   └── settings.ts   # 应用设置
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   ├── views/            # 页面组件
│   │   ├── Home.vue           # 首页
│   │   ├── Editor.vue         # 编辑器
│   │   ├── BookManager.vue    # 书籍管理
│   │   ├── PromptManager.vue  # 提示词管理
│   │   ├── BookAnalysis.vue   # AI拆书
│   │   └── Settings.vue       # 设置
│   ├── router/           # 路由配置
│   ├── App.vue          # 主应用组件
│   └── main.ts          # 应用入口
├── public/              # 静态资源
└── package.json         # 项目配置
```

## 🔧 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🐳 Docker 部署

### 方式一：使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone https://github.com/lkon3/ai-writer-web.git
cd ai-writer-web

# 构建并启动容器
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止容器
docker-compose down
```

访问地址：http://localhost:8080

### 方式二：使用 Docker 命令

```bash
# 构建镜像
docker build -t ai-writer:latest .

# 运行容器
docker run -d -p 8080:80 --name ai-writer ai-writer:latest

# 查看日志
docker logs -f ai-writer

# 停止容器
docker stop ai-writer

# 删除容器
docker rm ai-writer
```

### 自定义端口

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "你的端口:80"
```

或使用 Docker 命令：

```bash
docker run -d -p 你的端口:80 --name ai-writer ai-writer:latest
```

### 生产环境部署建议

1. **使用反向代理**（如 Nginx）配置 HTTPS
2. **设置环境变量**管理敏感信息
3. **配置日志收集**和监控
4. **定期更新**镜像以获取安全补丁
5. **使用多阶段构建**减小镜像体积

## 🔧 常见问题

### Docker 镜像拉取失败

**问题现象：**
```
ERROR [internal] load metadata for docker.io/library/nginx:alpine
failed to fetch oauth token: dial tcp: connect: connection timed out
```

**原因：** 无法访问 Docker Hub（`docker.io`）

**解决方案一：配置代理（推荐，如有代理）**

如果你有代理，这是最稳定的方案：

**Windows Docker Desktop：**
1. 打开 Docker Desktop
2. 点击设置 → **Resources** → **Proxies**
3. 启用 **Manual proxy configuration**
4. 填写代理地址和端口（例如：`127.0.0.1:7890`）
5. 选择代理协议（HTTP/SOCKS5）
6. 点击 **Apply & Restart**

**Linux 系统：**
```bash
# 创建或编辑 systemd 目录
sudo mkdir -p /etc/systemd/system/docker.service.d

# 配置代理
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf <<-'EOF'
[Service]
Environment="HTTP_PROXY=http://127.0.0.1:7890"
Environment="HTTPS_PROXY=http://127.0.0.1:7890"
Environment="NO_PROXY=localhost,127.0.0.1"
EOF

# 重启 Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**解决方案二：配置镜像加速器**

**Windows Docker Desktop：**
1. 打开 Docker Desktop
2. 点击设置图标 ⚙️ → **Docker Engine**
3. 在配置 JSON 中添加：
```json
{
  "registry-mirrors": [
    "https://docker.1panel.live",
    "https://docker.unsee.tech",
    "https://docker.ckyl.me"
  ],
  "dns": ["8.8.8.8", "114.114.114.114"]
}
```
4. 点击 **Apply & Restart** 重启 Docker

**Linux 系统：**
```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": [
    "https://docker.1panel.live",
    "https://docker.unsee.tech",
    "https://docker.ckyl.me"
  ],
  "dns": ["8.8.8.8", "114.114.114.114"]
}
EOF

sudo systemctl daemon-reload
sudo systemctl restart docker
```

**解决方案三：手动拉取镜像**

```bash
# 先手动拉取所需镜像
docker pull nginx:alpine
docker pull node:20-alpine

# 然后再运行 docker-compose
docker-compose up -d
```

### 容器启动失败

**查看日志：**
```bash
docker-compose logs -f
```

**重启容器：**
```bash
docker-compose restart
```

**重新构建：**
```bash
docker-compose up -d --build
```

### 端口冲突

如果 8080 端口被占用，修改 `docker-compose.yml`：
```yaml
ports:
  - "你的端口:80"
```

## 🌟 功能截图

### 主页
显示项目统计和快速操作入口

### 编辑器
左侧章节导航、中央编辑区、右侧AI助手面板

### 书籍管理
书籍卡片式展示、章节管理、大纲编辑

### 提示词管理
提示词列表、分类筛选、变量编辑

### AI拆书
内容输入、分析类型选择、结果展示

## 📝 开发计划

- [ ] EPUB/PDF导出功能
- [ ] 更多AI写作模板
- [ ] 云同步功能
- [ ] 协作编辑功能
- [ ] 版本历史管理

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/)
- [Dexie.js](https://dexie.org/)
