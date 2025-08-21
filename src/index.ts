#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { MinIOStorageClient } from './minio-client.js';
import { MinIOConfigSchema } from './types.js';

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const config: any = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--endpoint=')) {
      config.endPoint = arg.split('=')[1];
    } else if (arg.startsWith('--port=')) {
      config.port = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--access-key=')) {
      config.accessKey = arg.split('=')[1];
    } else if (arg.startsWith('--secret-key=')) {
      config.secretKey = arg.split('=')[1];
    } else if (arg.startsWith('--use-ssl=')) {
      config.useSSL = arg.split('=')[1] === 'true';
    } else if (arg.startsWith('--region=')) {
      config.region = arg.split('=')[1];
    }
  }
  
  return config;
}

class MinIOStorageMCPServer {
  private server: Server;
  private minioClient: MinIOStorageClient;
  private autoConnectConfig: any;

  constructor() {
    this.server = new Server(
      {
        name: 'minio-storage-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.minioClient = new MinIOStorageClient();
    this.autoConnectConfig = parseArgs();
    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'connect_minio',
            description: '连接到MinIO服务器',
            inputSchema: {
              type: 'object',
              properties: {
                endPoint: { type: 'string', description: 'MinIO服务器地址' },
                port: { type: 'number', description: 'MinIO服务器端口' },
                useSSL: { type: 'boolean', description: '是否使用SSL连接', default: false },
                accessKey: { type: 'string', description: '访问密钥' },
                secretKey: { type: 'string', description: '秘密密钥' },
                region: { type: 'string', description: '区域设置（可选）' }
              },
              required: ['endPoint', 'port', 'accessKey', 'secretKey']
            }
          },
          {
            name: 'list_buckets',
            description: '列出所有存储桶',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'create_bucket',
            description: '创建存储桶',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                region: { type: 'string', description: '区域设置（可选）' }
              },
              required: ['bucketName']
            }
          },
          {
            name: 'delete_bucket',
            description: '删除存储桶',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' }
              },
              required: ['bucketName']
            }
          },
          {
            name: 'bucket_exists',
            description: '检查存储桶是否存在',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' }
              },
              required: ['bucketName']
            }
          },
          {
            name: 'list_objects',
            description: '列出存储桶中的对象',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                prefix: { type: 'string', description: '对象名前缀（可选）' },
                recursive: { type: 'boolean', description: '是否递归列出', default: false }
              },
              required: ['bucketName']
            }
          },
          {
            name: 'upload_file',
            description: '上传文件到存储桶',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectName: { type: 'string', description: '对象名称' },
                filePath: { type: 'string', description: '本地文件路径' },
                metadata: { type: 'object', description: '文件元数据（可选）' }
              },
              required: ['bucketName', 'objectName', 'filePath']
            }
          },
          {
            name: 'download_file',
            description: '从存储桶下载文件',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectName: { type: 'string', description: '对象名称' },
                filePath: { type: 'string', description: '本地保存路径' }
              },
              required: ['bucketName', 'objectName', 'filePath']
            }
          },
          {
            name: 'delete_object',
            description: '删除存储桶中的对象',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectName: { type: 'string', description: '对象名称' }
              },
              required: ['bucketName', 'objectName']
            }
          },
          {
            name: 'delete_objects',
            description: '批量删除存储桶中的对象',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectNames: { type: 'array', items: { type: 'string' }, description: '对象名称列表' }
              },
              required: ['bucketName', 'objectNames']
            }
          },
          {
            name: 'copy_object',
            description: '复制对象',
            inputSchema: {
              type: 'object',
              properties: {
                sourceBucket: { type: 'string', description: '源存储桶名称' },
                sourceObject: { type: 'string', description: '源对象名称' },
                destBucket: { type: 'string', description: '目标存储桶名称' },
                destObject: { type: 'string', description: '目标对象名称' }
              },
              required: ['sourceBucket', 'sourceObject', 'destBucket', 'destObject']
            }
          },
          {
            name: 'get_object_info',
            description: '获取对象信息',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectName: { type: 'string', description: '对象名称' }
              },
              required: ['bucketName', 'objectName']
            }
          },
          {
            name: 'generate_presigned_url',
            description: '生成预签名URL',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                objectName: { type: 'string', description: '对象名称' },
                method: { type: 'string', enum: ['GET', 'PUT', 'DELETE'], description: 'HTTP方法', default: 'GET' },
                expires: { type: 'number', description: '过期时间（秒）', default: 3600 }
              },
              required: ['bucketName', 'objectName']
            }
          },
          {
            name: 'get_storage_stats',
            description: '获取存储统计信息',
            inputSchema: { type: 'object', properties: {} }
          },
          {
            name: 'upload_files',
            description: '批量上传文件',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      localPath: { type: 'string', description: '本地文件路径' },
                      objectName: { type: 'string', description: '对象名称' },
                      metadata: { type: 'object', description: '文件元数据（可选）' }
                    },
                    required: ['localPath', 'objectName']
                  },
                  description: '文件列表'
                }
              },
              required: ['bucketName', 'files']
            }
          },
          {
            name: 'download_files',
            description: '批量下载文件',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                files: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      objectName: { type: 'string', description: '对象名称' },
                      localPath: { type: 'string', description: '本地保存路径' }
                    },
                    required: ['objectName', 'localPath']
                  },
                  description: '文件列表'
                }
              },
              required: ['bucketName', 'files']
            }
          },
          {
            name: 'set_bucket_policy',
            description: '设置存储桶策略',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' },
                policy: { type: 'string', description: 'JSON格式的策略' }
              },
              required: ['bucketName', 'policy']
            }
          },
          {
            name: 'get_bucket_policy',
            description: '获取存储桶策略',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' }
              },
              required: ['bucketName']
            }
          },
          {
            name: 'delete_bucket_policy',
            description: '删除存储桶策略',
            inputSchema: {
              type: 'object',
              properties: {
                bucketName: { type: 'string', description: '存储桶名称' }
              },
              required: ['bucketName']
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'connect_minio': {
            const config = MinIOConfigSchema.parse(args);
            await this.minioClient.connect(config);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功连接到MinIO服务器 ${config.endPoint}:${config.port}`
                }
              ]
            };
          }

          case 'list_buckets': {
            const buckets = await this.minioClient.listBuckets();
            return {
              content: [
                {
                  type: 'text',
                  text: `找到 ${buckets.length} 个存储桶:\n${buckets.map(b => `- ${b.name} (创建时间: ${b.creationDate.toISOString()})`).join('\n')}`
                }
              ]
            };
          }

          case 'create_bucket': {
            const { bucketName, region } = z.object({
              bucketName: z.string(),
              region: z.string().optional()
            }).parse(args);
            
            await this.minioClient.createBucket(bucketName, region);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功创建存储桶: ${bucketName}`
                }
              ]
            };
          }

          case 'delete_bucket': {
            const { bucketName } = z.object({
              bucketName: z.string()
            }).parse(args);
            
            await this.minioClient.deleteBucket(bucketName);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功删除存储桶: ${bucketName}`
                }
              ]
            };
          }

          case 'bucket_exists': {
            const { bucketName } = z.object({
              bucketName: z.string()
            }).parse(args);
            
            const exists = await this.minioClient.bucketExists(bucketName);
            return {
              content: [
                {
                  type: 'text',
                  text: `存储桶 ${bucketName} ${exists ? '存在' : '不存在'}`
                }
              ]
            };
          }

          case 'list_objects': {
            const { bucketName, prefix, recursive } = z.object({
              bucketName: z.string(),
              prefix: z.string().optional(),
              recursive: z.boolean().default(false)
            }).parse(args);
            
            const objects = await this.minioClient.listObjects(bucketName, prefix, recursive);
            return {
              content: [
                {
                  type: 'text',
                  text: `存储桶 ${bucketName} 中找到 ${objects.length} 个对象:\n${objects.map(obj => 
                    `- ${obj.name} (大小: ${obj.size} 字节, 修改时间: ${obj.lastModified.toISOString()})`
                  ).join('\n')}`
                }
              ]
            };
          }

          case 'upload_file': {
            const { bucketName, objectName, filePath, metadata } = z.object({
              bucketName: z.string(),
              objectName: z.string(),
              filePath: z.string(),
              metadata: z.record(z.string()).optional()
            }).parse(args);
            
            await this.minioClient.uploadFile(bucketName, objectName, filePath, metadata);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功上传文件 ${filePath} 到 ${bucketName}/${objectName}`
                }
              ]
            };
          }

          case 'download_file': {
            const { bucketName, objectName, filePath } = z.object({
              bucketName: z.string(),
              objectName: z.string(),
              filePath: z.string()
            }).parse(args);
            
            await this.minioClient.downloadFile(bucketName, objectName, filePath);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功下载文件 ${bucketName}/${objectName} 到 ${filePath}`
                }
              ]
            };
          }

          case 'delete_object': {
            const { bucketName, objectName } = z.object({
              bucketName: z.string(),
              objectName: z.string()
            }).parse(args);
            
            await this.minioClient.deleteObject(bucketName, objectName);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功删除对象: ${bucketName}/${objectName}`
                }
              ]
            };
          }

          case 'delete_objects': {
            const { bucketName, objectNames } = z.object({
              bucketName: z.string(),
              objectNames: z.array(z.string())
            }).parse(args);
            
            const result = await this.minioClient.deleteObjects(bucketName, objectNames);
            return {
              content: [
                {
                  type: 'text',
                  text: `批量删除完成: 成功 ${result.successCount} 个, 失败 ${result.failureCount} 个${result.errors.length > 0 ? '\n错误:\n' + result.errors.map(e => `- ${e.item}: ${e.error}`).join('\n') : ''}`
                }
              ]
            };
          }

          case 'copy_object': {
            const { sourceBucket, sourceObject, destBucket, destObject } = z.object({
              sourceBucket: z.string(),
              sourceObject: z.string(),
              destBucket: z.string(),
              destObject: z.string()
            }).parse(args);
            
            await this.minioClient.copyObject(sourceBucket, sourceObject, destBucket, destObject);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功复制对象从 ${sourceBucket}/${sourceObject} 到 ${destBucket}/${destObject}`
                }
              ]
            };
          }

          case 'get_object_info': {
            const { bucketName, objectName } = z.object({
              bucketName: z.string(),
              objectName: z.string()
            }).parse(args);
            
            const info = await this.minioClient.getObjectInfo(bucketName, objectName);
            return {
              content: [
                {
                  type: 'text',
                  text: `对象信息:\n- 名称: ${info.name}\n- 大小: ${info.size} 字节\n- 最后修改: ${info.lastModified.toISOString()}\n- ETag: ${info.etag}\n- 内容类型: ${info.contentType || '未知'}`
                }
              ]
            };
          }

          case 'generate_presigned_url': {
            const { bucketName, objectName, method, expires } = z.object({
              bucketName: z.string(),
              objectName: z.string(),
              method: z.enum(['GET', 'PUT', 'DELETE']).default('GET'),
              expires: z.number().default(3600)
            }).parse(args);
            
            const url = await this.minioClient.generatePresignedUrl(bucketName, objectName, method, { expires });
            return {
              content: [
                {
                  type: 'text',
                  text: `预签名URL (${method}, 有效期${expires}秒):\n${url}`
                }
              ]
            };
          }

          case 'get_storage_stats': {
            const stats = await this.minioClient.getStorageStats();
            return {
              content: [
                {
                  type: 'text',
                  text: `存储统计信息:\n- 总存储桶数: ${stats.totalBuckets}\n- 总对象数: ${stats.totalObjects}\n- 总大小: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB\n\n各存储桶详情:\n${stats.bucketStats.map(b => `- ${b.bucketName}: ${b.objectCount} 个对象, ${(b.totalSize / 1024 / 1024).toFixed(2)} MB`).join('\n')}`
                }
              ]
            };
          }

          case 'upload_files': {
            const { bucketName, files } = z.object({
              bucketName: z.string(),
              files: z.array(z.object({
                localPath: z.string(),
                objectName: z.string(),
                metadata: z.record(z.string()).optional()
              }))
            }).parse(args);
            
            const result = await this.minioClient.uploadFiles(bucketName, files);
            return {
              content: [
                {
                  type: 'text',
                  text: `批量上传完成: 成功 ${result.successCount} 个, 失败 ${result.failureCount} 个${result.errors.length > 0 ? '\n错误:\n' + result.errors.map(e => `- ${e.item}: ${e.error}`).join('\n') : ''}`
                }
              ]
            };
          }

          case 'download_files': {
            const { bucketName, files } = z.object({
              bucketName: z.string(),
              files: z.array(z.object({
                objectName: z.string(),
                localPath: z.string()
              }))
            }).parse(args);
            
            const result = await this.minioClient.downloadFiles(bucketName, files);
            return {
              content: [
                {
                  type: 'text',
                  text: `批量下载完成: 成功 ${result.successCount} 个, 失败 ${result.failureCount} 个${result.errors.length > 0 ? '\n错误:\n' + result.errors.map(e => `- ${e.item}: ${e.error}`).join('\n') : ''}`
                }
              ]
            };
          }

          case 'set_bucket_policy': {
            const { bucketName, policy } = z.object({
              bucketName: z.string(),
              policy: z.string()
            }).parse(args);
            
            await this.minioClient.setBucketPolicy(bucketName, policy);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功设置存储桶 ${bucketName} 的策略`
                }
              ]
            };
          }

          case 'get_bucket_policy': {
            const { bucketName } = z.object({
              bucketName: z.string()
            }).parse(args);
            
            const policy = await this.minioClient.getBucketPolicy(bucketName);
            return {
              content: [
                {
                  type: 'text',
                  text: `存储桶 ${bucketName} 的策略:\n${policy}`
                }
              ]
            };
          }

          case 'delete_bucket_policy': {
            const { bucketName } = z.object({
              bucketName: z.string()
            }).parse(args);
            
            await this.minioClient.deleteBucketPolicy(bucketName);
            return {
              content: [
                {
                  type: 'text',
                  text: `成功删除存储桶 ${bucketName} 的策略`
                }
              ]
            };
          }

          default:
            throw new McpError(ErrorCode.MethodNotFound, `未知工具: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `执行工具 ${name} 时出错: ${errorMessage}`);
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    // 如果提供了连接参数，自动连接
    if (this.autoConnectConfig.endPoint && this.autoConnectConfig.accessKey && this.autoConnectConfig.secretKey) {
      try {
        const config = MinIOConfigSchema.parse(this.autoConnectConfig);
        await this.minioClient.connect(config);
        console.error(`MinIO存储管理MCP服务器已启动并连接到 ${config.endPoint}:${config.port || 9000}`);
      } catch (error) {
        console.error('自动连接MinIO失败:', error instanceof Error ? error.message : String(error));
        console.error('MinIO存储管理MCP服务器已启动（未连接）');
      }
    } else {
      console.error('MinIO存储管理MCP服务器已启动（未连接）');
    }
  }
}

const server = new MinIOStorageMCPServer();
server.run().catch(console.error);