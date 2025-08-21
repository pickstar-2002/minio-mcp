# 🗄️ MinIO Storage MCP

[![npm version](https://badge.fury.io/js/@pickstar-2002%2Fminio-storage-mcp.svg)](https://badge.fury.io/js/@pickstar-2002%2Fminio-storage-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

一个功能完善的 MinIO 对象存储管理 MCP（Model Context Protocol）工具，让您通过 AI 助手轻松管理 MinIO 存储服务。

## ✨ 功能特性

### 🔗 连接管理
- ✅ 连接到 MinIO 服务器
- ✅ 支持 SSL/非SSL 连接
- ✅ 灵活的认证配置

### 🗂️ 存储桶管理
- ✅ 创建、删除存储桶
- ✅ 列出所有存储桶
- ✅ 检查存储桶是否存在
- ✅ 存储桶策略管理

### 📁 文件操作
- ✅ 上传单个文件或批量上传
- ✅ 下载单个文件或批量下载
- ✅ 删除单个对象或批量删除
- ✅ 复制对象
- ✅ 获取对象详细信息

### 🔐 权限管理
- ✅ 设置存储桶访问策略
- ✅ 查看当前策略配置
- ✅ 删除策略设置

### 🔗 URL 生成
- ✅ 生成预签名 URL（GET/PUT/DELETE）
- ✅ 自定义过期时间
- ✅ 支持临时访问链接

### 📊 统计信息
- ✅ 查看存储使用统计
- ✅ 各存储桶详细信息
- ✅ 对象数量和大小统计

## 🚀 快速开始

### 安装

```bash
npm install -g @pickstar-2002/minio-storage-mcp@latest
```

### 在 IDE 中配置

#### Cursor IDE

在 Cursor 设置中添加 MCP 服务器配置：

```json
{
  "mcpServers": {
    "minio-storage": {
      "command": "npx",
      "args": ["@pickstar-2002/minio-storage-mcp@latest"]
    }
  }
}
```

#### Claude Desktop

在 `claude_desktop_config.json` 中添加：

```json
{
  "mcpServers": {
    "minio-storage": {
      "command": "npx",
      "args": ["@pickstar-2002/minio-storage-mcp@latest"]
    }
  }
}
```

#### 其他 MCP 兼容的 IDE

使用以下命令启动 MCP 服务器：

```bash
npx @pickstar-2002/minio-storage-mcp@latest
```

## 📖 使用指南

### 1. 连接到 MinIO 服务器

首先需要连接到您的 MinIO 服务器：

```
请帮我连接到 MinIO 服务器，地址是 localhost:9000，访问密钥是 minioadmin，秘密密钥是 minioadmin
```

### 2. 基本操作示例

```
# 创建存储桶
请创建一个名为 "my-documents" 的存储桶

# 上传文件
请将本地文件 "/path/to/file.pdf" 上传到 "my-documents" 存储桶中，对象名为 "documents/file.pdf"

# 列出对象
请列出 "my-documents" 存储桶中的所有对象

# 下载文件
请从 "my-documents" 存储桶下载 "documents/file.pdf" 到本地 "/path/to/download/file.pdf"

# 生成预签名 URL
请为 "my-documents/documents/file.pdf" 生成一个有效期为 1 小时的下载链接
```

## 🛠️ 可用工具

### 连接管理
- `connect_minio` - 连接到 MinIO 服务器

### 存储桶操作
- `list_buckets` - 列出所有存储桶
- `create_bucket` - 创建存储桶
- `delete_bucket` - 删除存储桶
- `bucket_exists` - 检查存储桶是否存在

### 对象操作
- `list_objects` - 列出存储桶中的对象
- `upload_file` - 上传文件
- `download_file` - 下载文件
- `delete_object` - 删除对象
- `copy_object` - 复制对象
- `get_object_info` - 获取对象信息

### 批量操作
- `upload_files` - 批量上传文件
- `download_files` - 批量下载文件
- `delete_objects` - 批量删除对象

### 权限管理
- `set_bucket_policy` - 设置存储桶策略
- `get_bucket_policy` - 获取存储桶策略
- `delete_bucket_policy` - 删除存储桶策略

### 其他功能
- `generate_presigned_url` - 生成预签名 URL
- `get_storage_stats` - 获取存储统计信息

## 🔧 技术架构

- **语言**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **MinIO 客户端**: minio
- **类型验证**: zod
- **Node.js 版本**: >= 18.0.0

## 📝 配置示例

### 环境变量配置

您可以通过环境变量预设 MinIO 连接信息：

```bash
export MINIO_ENDPOINT=localhost
export MINIO_PORT=9000
export MINIO_USE_SSL=false
export MINIO_ACCESS_KEY=your-access-key
export MINIO_SECRET_KEY=your-secret-key
export MINIO_REGION=us-east-1
```

### MCP 配置文件示例

```json
{
  "mcpServers": {
    "minio-storage": {
      "command": "npx",
      "args": ["@pickstar-2002/minio-storage-mcp@latest"],
      "env": {
        "MINIO_ENDPOINT": "localhost",
        "MINIO_PORT": "9000",
        "MINIO_USE_SSL": "false",
        "MINIO_ACCESS_KEY": "your-access-key",
        "MINIO_SECRET_KEY": "your-secret-key"
      }
    }
  }
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 📞 联系方式

如有问题或建议，欢迎联系：

**微信**: pickstar_loveXX

---

⭐ 如果这个项目对您有帮助，请给个 Star！