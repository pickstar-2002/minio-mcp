# MinIO存储管理MCP工具使用示例

## 基本连接

### 连接到本地MinIO服务器
```json
{
  "tool": "connect_minio",
  "arguments": {
    "endPoint": "localhost",
    "port": 9000,
    "useSSL": false,
    "accessKey": "minioadmin",
    "secretKey": "minioadmin"
  }
}
```

### 连接到远程MinIO服务器（使用SSL）
```json
{
  "tool": "connect_minio",
  "arguments": {
    "endPoint": "minio.example.com",
    "port": 443,
    "useSSL": true,
    "accessKey": "your-access-key",
    "secretKey": "your-secret-key",
    "region": "us-west-2"
  }
}
```

## 存储桶管理

### 列出所有存储桶
```json
{
  "tool": "list_buckets",
  "arguments": {}
}
```

### 创建存储桶
```json
{
  "tool": "create_bucket",
  "arguments": {
    "bucketName": "my-documents",
    "region": "us-east-1"
  }
}
```

### 检查存储桶是否存在
```json
{
  "tool": "bucket_exists",
  "arguments": {
    "bucketName": "my-documents"
  }
}
```

### 删除存储桶
```json
{
  "tool": "delete_bucket",
  "arguments": {
    "bucketName": "old-bucket"
  }
}
```

## 文件操作

### 列出存储桶中的文件
```json
{
  "tool": "list_objects",
  "arguments": {
    "bucketName": "my-documents",
    "prefix": "photos/",
    "recursive": true
  }
}
```

### 上传单个文件
```json
{
  "tool": "upload_file",
  "arguments": {
    "bucketName": "my-documents",
    "objectName": "reports/2024/annual-report.pdf",
    "filePath": "C:/Users/Documents/annual-report.pdf",
    "metadata": {
      "Content-Type": "application/pdf",
      "Author": "John Doe"
    }
  }
}
```

### 下载文件
```json
{
  "tool": "download_file",
  "arguments": {
    "bucketName": "my-documents",
    "objectName": "reports/2024/annual-report.pdf",
    "filePath": "C:/Downloads/annual-report.pdf"
  }
}
```

### 获取文件信息
```json
{
  "tool": "get_object_info",
  "arguments": {
    "bucketName": "my-documents",
    "objectName": "reports/2024/annual-report.pdf"
  }
}
```

### 复制文件
```json
{
  "tool": "copy_object",
  "arguments": {
    "sourceBucket": "my-documents",
    "sourceObject": "reports/2024/annual-report.pdf",
    "destBucket": "backup-documents",
    "destObject": "reports/backup/annual-report-2024.pdf"
  }
}
```

### 删除文件
```json
{
  "tool": "delete_object",
  "arguments": {
    "bucketName": "my-documents",
    "objectName": "temp/old-file.txt"
  }
}
```

## 批量操作

### 批量上传文件
```json
{
  "tool": "upload_files",
  "arguments": {
    "bucketName": "my-photos",
    "files": [
      {
        "localPath": "C:/Photos/vacation1.jpg",
        "objectName": "2024/vacation/photo1.jpg",
        "metadata": {
          "Content-Type": "image/jpeg"
        }
      },
      {
        "localPath": "C:/Photos/vacation2.jpg",
        "objectName": "2024/vacation/photo2.jpg",
        "metadata": {
          "Content-Type": "image/jpeg"
        }
      }
    ]
  }
}
```

### 批量下载文件
```json
{
  "tool": "download_files",
  "arguments": {
    "bucketName": "my-photos",
    "files": [
      {
        "objectName": "2024/vacation/photo1.jpg",
        "localPath": "C:/Downloads/photo1.jpg"
      },
      {
        "objectName": "2024/vacation/photo2.jpg",
        "localPath": "C:/Downloads/photo2.jpg"
      }
    ]
  }
}
```

### 批量删除文件
```json
{
  "tool": "delete_objects",
  "arguments": {
    "bucketName": "my-documents",
    "objectNames": [
      "temp/file1.txt",
      "temp/file2.txt",
      "temp/old-backup.zip"
    ]
  }
}
```

## URL生成

### 生成下载链接（GET）
```json
{
  "tool": "generate_presigned_url",
  "arguments": {
    "bucketName": "my-documents",
    "objectName": "public/brochure.pdf",
    "method": "GET",
    "expires": 3600
  }
}
```

### 生成上传链接（PUT）
```json
{
  "tool": "generate_presigned_url",
  "arguments": {
    "bucketName": "uploads",
    "objectName": "user-uploads/new-file.pdf",
    "method": "PUT",
    "expires": 1800
  }
}
```

## 权限管理

### 设置存储桶为公开读取
```json
{
  "tool": "set_bucket_policy",
  "arguments": {
    "bucketName": "public-assets",
    "policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::public-assets/*\"}]}"
  }
}
```

### 获取存储桶策略
```json
{
  "tool": "get_bucket_policy",
  "arguments": {
    "bucketName": "public-assets"
  }
}
```

### 删除存储桶策略
```json
{
  "tool": "delete_bucket_policy",
  "arguments": {
    "bucketName": "public-assets"
  }
}
```

## 统计信息

### 获取存储使用统计
```json
{
  "tool": "get_storage_stats",
  "arguments": {}
}
```

## 常见使用场景

### 场景1：网站静态资源管理
1. 创建公开存储桶用于静态资源
2. 批量上传CSS、JS、图片文件
3. 设置公开读取策略
4. 生成CDN友好的URL

### 场景2：文档备份系统
1. 创建私有存储桶
2. 定期批量上传重要文档
3. 生成临时下载链接供授权用户访问
4. 监控存储使用情况

### 场景3：用户文件上传
1. 为用户生成预签名上传URL
2. 用户直接上传到MinIO
3. 应用程序验证上传完成
4. 生成下载链接供用户访问

### 场景4：数据归档
1. 创建归档存储桶
2. 批量移动旧数据
3. 压缩和整理文件结构
4. 定期清理临时文件