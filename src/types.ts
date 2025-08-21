import { z } from 'zod';

// MinIO连接配置
export const MinIOConfigSchema = z.object({
  endPoint: z.string().describe('MinIO服务器地址'),
  port: z.number().min(1).max(65535).describe('MinIO服务器端口'),
  useSSL: z.boolean().default(false).describe('是否使用SSL连接'),
  accessKey: z.string().describe('访问密钥'),
  secretKey: z.string().describe('秘密密钥'),
  region: z.string().optional().describe('区域设置（可选）')
});

export type MinIOConfig = z.infer<typeof MinIOConfigSchema>;

// 存储桶信息
export interface BucketInfo {
  name: string;
  creationDate: Date;
}

// 文件对象信息
export interface ObjectInfo {
  name: string;
  size: number;
  lastModified: Date;
  etag: string;
  contentType?: string;
  isDir: boolean;
}

// 存储统计信息
export interface StorageStats {
  totalBuckets: number;
  totalObjects: number;
  totalSize: number;
  bucketStats: Array<{
    bucketName: string;
    objectCount: number;
    totalSize: number;
  }>;
}

// 批量操作结果
export interface BatchOperationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  errors: Array<{
    item: string;
    error: string;
  }>;
}

// 预签名URL选项
export interface PresignedUrlOptions {
  expires?: number; // 过期时间（秒）
  reqParams?: Record<string, string>; // 请求参数
  requestDate?: Date; // 请求日期
}