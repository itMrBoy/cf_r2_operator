import { NextRequest, NextResponse } from 'next/server';
import { S3 } from '@/utils/cfr2';
import { GetObjectCommand } from '@aws-sdk/client-s3';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bucketName = searchParams.get('bucket');
        const key = searchParams.get('key');
        const download = searchParams.get('download') === 'true';

        if (!bucketName || !key) {
            return NextResponse.json(
                { success: false, message: '缺少必要参数：bucket 或 key' },
                { status: 400 }
            );
        }

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const result = await S3.send(command);
        
        if (!result.Body) {
            return NextResponse.json(
                { success: false, message: '文件不存在' },
                { status: 404 }
            );
        }

        // 将流转换为Buffer
        const chunks: Uint8Array[] = [];
        const reader = result.Body.transformToWebStream().getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
        }

        const buffer = Buffer.concat(chunks);
        
        // 设置响应头
        const headers: Record<string, string> = {
            'Content-Type': result.ContentType || 'application/octet-stream',
            'Content-Length': buffer.length.toString(),
        };

        if (download) {
            headers['Content-Disposition'] = `attachment; filename="${key.split('/').pop()}"`;
        }

        return new NextResponse(buffer, { headers });
    } catch (error) {
        console.error('下载API错误:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}` 
            },
            { status: 500 }
        );
    }
} 