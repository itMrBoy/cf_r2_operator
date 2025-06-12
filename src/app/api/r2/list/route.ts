import { NextRequest, NextResponse } from 'next/server';
import { listBuckets, listObjects } from '@/utils/cfr2';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bucketName = searchParams.get('bucket');

        let result;
        
        if (bucketName) {
            // 获取指定存储桶中的对象列表
            result = await listObjects(bucketName);
        } else {
            // 获取所有存储桶列表
            result = await listBuckets();
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('列表API错误:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: `获取列表失败: ${error instanceof Error ? error.message : '未知错误'}` 
            },
            { status: 500 }
        );
    }
} 