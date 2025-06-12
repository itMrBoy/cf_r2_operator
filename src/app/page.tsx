'use client';

import { useState, useRef } from 'react';
import { App } from 'antd';
import { 
    uploadFileToR2, 
    uploadTextToR2, 
    uploadJsonToR2,
    getR2Buckets,
    getR2Objects,
    getFilePreviewUrl,
    downloadFileFromR2
} from '@/app/apiFunc/r2-client';
import { ThemeToggle } from '@/components/theme-toggle';

function R2DemoContent() {
    const { message } = App.useApp();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [bucketName, setBucketName] = useState('public');
    const [objectKey, setObjectKey] = useState('');
    const [textContent, setTextContent] = useState('');
    const [jsonContent, setJsonContent] = useState('{"example": "data"}');
    const [result, setResult] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Loading 状态管理
    const [loading, setLoading] = useState({
        fileUpload: false,
        textUpload: false,
        jsonUpload: false,
        getBuckets: false,
        getObjects: false,
        download: false,
    });

    const setButtonLoading = (button: keyof typeof loading, isLoading: boolean) => {
        setLoading(prev => ({ ...prev, [button]: isLoading }));
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            if (!objectKey) {
                setObjectKey(file.name);
            }
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile || !bucketName || !objectKey) {
            message.warning('请选择文件并填写存储桶名称和对象键');
            return;
        }

        setButtonLoading('fileUpload', true);
        const hide = message.loading('上传中...', 0);
        try {
            const response = await uploadFileToR2(bucketName, objectKey, selectedFile);
            hide();
            message.success('文件上传成功！');
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            hide();
            message.error(`上传失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('fileUpload', false);
        }
    };

    const handleTextUpload = async () => {
        if (!textContent || !bucketName || !objectKey) {
            message.warning('请填写文本内容、存储桶名称和对象键');
            return;
        }

        setButtonLoading('textUpload', true);
        const hide = message.loading('上传中...', 0);
        try {
            const response = await uploadTextToR2(bucketName, objectKey, textContent);
            hide();
            message.success('文本上传成功！');
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            hide();
            message.error(`上传失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('textUpload', false);
        }
    };

    const handleJsonUpload = async () => {
        if (!jsonContent || !bucketName || !objectKey) {
            message.warning('请填写JSON内容、存储桶名称和对象键');
            return;
        }

        setButtonLoading('jsonUpload', true);
        const hide = message.loading('上传中...', 0);
        try {
            const jsonData = JSON.parse(jsonContent);
            const response = await uploadJsonToR2(bucketName, objectKey, jsonData);
            hide();
            message.success('JSON上传成功！');
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            hide();
            message.error(`上传失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('jsonUpload', false);
        }
    };

    const handleGetBuckets = async () => {
        setButtonLoading('getBuckets', true);
        const hide = message.loading('获取存储桶列表中...', 0);
        try {
            const response = await getR2Buckets();
            hide();
            message.success('获取存储桶列表成功！');
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            hide();
            message.error(`获取失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('getBuckets', false);
        }
    };

    const handleGetObjects = async () => {
        if (!bucketName) {
            message.warning('请填写存储桶名称');
            return;
        }

        setButtonLoading('getObjects', true);
        const hide = message.loading('获取对象列表中...', 0);
        try {
            const response = await getR2Objects(bucketName);
            hide();
            message.success('获取对象列表成功！');
            setResult(JSON.stringify(response, null, 2));
        } catch (error) {
            hide();
            message.error(`获取失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('getObjects', false);
        }
    };

    const handleDownload = async () => {
        if (!bucketName || !objectKey) {
            message.warning('请填写存储桶名称和对象键');
            return;
        }

        setButtonLoading('download', true);
        const hide = message.loading('下载中...', 0);
        try {
            const response = await downloadFileFromR2(bucketName, objectKey, true);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = objectKey.split('/').pop() || 'download';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                hide();
                message.success(`下载 ${objectKey} 成功！`);
                setResult(`下载 ${objectKey} 成功`);
            } else {
                hide();
                message.error(`下载失败: ${response.statusText}`);
                setResult(`下载失败: ${response.statusText}`);
            }
        } catch (error) {
            hide();
            message.error(`下载失败: ${error}`);
            setResult(`错误: ${error}`);
        } finally {
            setButtonLoading('download', false);
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'var(--background)' }}>
            <div className="container mx-auto p-6 max-w-4xl">
                {/* 页面头部和主题切换 */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
                        R2 存储演示
                    </h1>
                    <ThemeToggle />
                </div>
                
                <div className="space-y-6">
                    {/* 基本配置 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">基本配置</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="存储桶名称"
                                value={bucketName}
                                onChange={(e) => setBucketName(e.target.value)}
                                className="theme-input px-3 py-2"
                            />
                            <input
                                type="text"
                                placeholder="对象键 (文件路径)"
                                value={objectKey}
                                onChange={(e) => setObjectKey(e.target.value)}
                                className="theme-input px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* 文件上传 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">文件上传</h2>
                        <div className="space-y-4">
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="theme-input px-3 py-2 w-full"
                            />
                            {selectedFile && (
                                <p className="text-sm theme-text-muted">
                                    已选择: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                            <button
                                onClick={handleFileUpload}
                                disabled={loading.fileUpload}
                                className={`theme-button-primary px-6 py-3 font-medium ${loading.fileUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading.fileUpload ? '上传中...' : '上传文件'}
                            </button>
                        </div>
                    </div>

                    {/* 文本上传 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">文本上传</h2>
                        <div className="space-y-4">
                            <textarea
                                placeholder="输入文本内容"
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                                className="theme-input px-3 py-2 w-full h-32 resize-none"
                            />
                            <button
                                onClick={handleTextUpload}
                                disabled={loading.textUpload}
                                className={`theme-button-success px-6 py-3 font-medium ${loading.textUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading.textUpload ? '上传中...' : '上传文本'}
                            </button>
                        </div>
                    </div>

                    {/* JSON上传 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">JSON上传</h2>
                        <div className="space-y-4">
                            <textarea
                                placeholder="输入JSON内容"
                                value={jsonContent}
                                onChange={(e) => setJsonContent(e.target.value)}
                                className="theme-input px-3 py-2 w-full h-32 font-mono resize-none"
                            />
                            <button
                                onClick={handleJsonUpload}
                                disabled={loading.jsonUpload}
                                className={`theme-button-warning px-6 py-3 font-medium ${loading.jsonUpload ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading.jsonUpload ? '上传中...' : '上传JSON'}
                            </button>
                        </div>
                    </div>

                    {/* 列表操作 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">存储桶管理</h2>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleGetBuckets}
                                    disabled={loading.getBuckets}
                                    className={`theme-button-secondary px-6 py-3 font-medium ${loading.getBuckets ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading.getBuckets ? '📁 获取中...' : '📁 获取存储桶列表'}
                                </button>
                                <button
                                    onClick={handleGetObjects}
                                    disabled={loading.getObjects}
                                    className={`theme-button-secondary px-6 py-3 font-medium ${loading.getObjects ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading.getObjects ? '📋 获取中...' : '📋 获取对象列表'}
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={loading.download}
                                    className={`theme-button-primary px-6 py-3 font-medium ${loading.download ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading.download ? '⬇️ 下载中...' : '⬇️ 下载文件'}
                                </button>
                            </div>

                            {bucketName && objectKey && (
                                <div className="mt-6 p-4" style={{ background: 'var(--muted)' }}>
                                    <p className="text-sm theme-text-muted mb-2">文件预览链接:</p>
                                    <a
                                        href={getFilePreviewUrl(bucketName, objectKey)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-600 break-all text-sm underline transition-colors"
                                    >
                                        {getFilePreviewUrl(bucketName, objectKey)}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 结果显示 */}
                    <div className="theme-card p-6">
                        <h2 className="text-xl font-semibold mb-4">操作结果</h2>
                        <div 
                            className="p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono"
                            style={{ 
                                background: 'var(--muted)',
                                border: '1px solid var(--border)'
                            }}
                        >
                            {result || (
                                <span className="theme-text-muted">暂无结果</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function R2DemoPage() {
    return <R2DemoContent />;
} 