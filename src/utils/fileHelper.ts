/**
 * 附件处理工具（纯静态站点用）
 * =========================================================
 * - 图片压缩（canvas，最长边限制 + JPEG 质量）
 * - 文件类型 / 大小工具
 * - 附件 id 与 IndexedDB 引用键
 *
 * 说明：本系统为 COS/GitHub Pages 纯静态托管，无后端上传接口。
 * 附件保存在当前浏览器（IndexedDB，降级 localStorage），
 * 清除浏览器数据会丢失，换设备不可见，不能作为正式档案系统。
 * =========================================================
 */

export const IDB_REF_PREFIX = 'idb://';

/** 生成附件 id */
export function genAttachmentId(): string {
  return `ATT${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
}

/** 附件 id → IndexedDB 引用键 */
export function toIdbRef(attachmentId: string): string {
  return `${IDB_REF_PREFIX}${attachmentId}`;
}

/** 判断 filePath 是否为 idb 引用 */
export function isIdbRef(filePath?: string): boolean {
  return !!filePath && filePath.startsWith(IDB_REF_PREFIX);
}

/** 从 idb 引用键中取出存储 key（即附件 id） */
export function parseIdbKey(filePath?: string): string | null {
  if (!isIdbRef(filePath)) return null;
  return filePath!.slice(IDB_REF_PREFIX.length);
}

/** 当前时间字符串 YYYY-MM-DD HH:mm:ss */
export function nowText(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

/** 字节大小格式化 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/** 是否为浏览器可预览图片 */
export function isImageFile(fileType?: string, fileName?: string): boolean {
  if (fileType && fileType.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|bmp|svg)$/i.test(fileName || '');
}

/** 是否为 PDF */
export function isPdfFile(fileType?: string, fileName?: string): boolean {
  return fileType === 'application/pdf' || /\.pdf$/i.test(fileName || '');
}

export interface CompressOptions {
  /** 最长边像素，默认 1920 */
  maxEdge?: number;
  /** JPEG 质量 0~1，默认 0.75 */
  quality?: number;
}

export interface CompressResult {
  blob: Blob;
  fileType: string;
  fileName: string;
  /** 是否实际发生了压缩/转换 */
  compressed: boolean;
  /** 压缩失败但不致命（如 HEIC 无法解码），此时返回原文件 */
  warning?: string;
}

function loadImageElement(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('图片解码失败'));
    };
    img.src = url;
  });
}

/**
 * 压缩图片文件：等比缩放到最长边 maxEdge，统一输出 JPEG（PNG 透明图会转成白底 JPEG）。
 * 非图片、SVG、动图（GIF）不压缩，原样返回。
 * 解码失败（常见于 HEIC）时原样返回并带 warning。
 */
export async function compressImageIfNeeded(file: File, opts: CompressOptions = {}): Promise<CompressResult> {
  const maxEdge = opts.maxEdge ?? 1920;
  const quality = opts.quality ?? 0.75;

  if (!isImageFile(file.type, file.name)) {
    return { blob: file, fileType: file.type || 'application/octet-stream', fileName: file.name, compressed: false };
  }
  // SVG/GIF 不做 canvas 压缩（保真/保动画）
  if (file.type === 'image/svg+xml' || file.type === 'image/gif' || /\.(svg|gif)$/i.test(file.name)) {
    return { blob: file, fileType: file.type, fileName: file.name, compressed: false };
  }

  try {
    const img = await loadImageElement(file);
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) throw new Error('图片尺寸无效');

    const scale = Math.min(1, maxEdge / Math.max(w, h));
    const targetW = Math.max(1, Math.round(w * scale));
    const targetH = Math.max(1, Math.round(h * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas 不可用');
    // 白底，避免 PNG 透明区域转 JPEG 后变黑
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const jpegName = file.name.replace(/\.[^.]+$/, '') + '.jpg';
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('图片编码失败'))),
        'image/jpeg',
        quality,
      );
    });
    return { blob, fileType: 'image/jpeg', fileName: jpegName, compressed: true };
  } catch (err) {
    return {
      blob: file,
      fileType: file.type || 'application/octet-stream',
      fileName: file.name,
      compressed: false,
      warning: '该图片格式可能无法在线预览，建议转换为 JPG 后上传',
    };
  }
}

/** 降级模式下的更小压缩（idb 不可用，走 localStorage base64） */
export async function compressImageForFallback(file: File): Promise<CompressResult> {
  return compressImageIfNeeded(file, { maxEdge: 1280, quality: 0.6 });
}

/** Blob → base64 dataURL（仅降级路径使用） */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('文件读取失败'));
    reader.readAsDataURL(blob);
  });
}
