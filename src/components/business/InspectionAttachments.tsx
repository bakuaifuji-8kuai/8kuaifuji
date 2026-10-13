/**
 * 验收附件组件（现场照片 / 盖章资料 / 其他）
 * =========================================================
 * - 多文件多选、追加不覆盖
 * - 图片自动压缩后存 IndexedDB；idb 不可用降级压缩 base64
 * - 图片缩略图 + 全屏灯箱；PDF 在线预览；全部类型可下载
 * - readOnly 模式用于验收单详情
 *
 * 静态演示限制：附件只存在当前浏览器，清缓存/换设备会丢失。
 * =========================================================
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Camera, Stamp, Paperclip, X, ChevronLeft, ChevronRight,
  Download, Eye, Trash2, Loader2, AlertTriangle, FileText, Image as ImageIcon,
} from 'lucide-react';
import type { Attachment, InspectionAttachmentCategory } from '@/types';
import {
  genAttachmentId, toIdbRef, parseIdbKey, nowText, formatFileSize,
  isImageFile, isPdfFile, compressImageIfNeeded, compressImageForFallback, blobToDataURL,
} from '@/utils/fileHelper';
import { isAttachmentDbSupported, putAttachmentBlob, getAttachmentBlob, deleteAttachmentBlobs } from '@/utils/attachmentDB';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 单文件 20MB
const MAX_TOTAL = 20;                    // 单单据最多 20 个
const FALLBACK_BUDGET = 1_500_000;       // 降级 base64 总量预算（约 1.5MB 字符）

const GROUPS: Array<{
  key: InspectionAttachmentCategory;
  label: string;
  hint: string;
  accept: string;
  icon: typeof Camera;
}> = [
  { key: 'site_photo', label: '现场照片', hint: 'JPG / PNG，可多选，自动压缩', accept: 'image/*', icon: Camera },
  { key: 'stamped_doc', label: '盖章资料', hint: '盖章扫描件、照片、PDF 或 Word', accept: 'image/*,.pdf,.doc,.docx', icon: Stamp },
  { key: 'other', label: '其他附件', hint: '图片 / PDF / Word / Excel', accept: 'image/*,.pdf,.doc,.docx,.xls,.xlsx', icon: Paperclip },
];

interface PendingFile {
  tempId: string;
  name: string;
  size: number;
  category: InspectionAttachmentCategory;
  status: 'compressing' | 'storing';
}

/** 解析附件为可访问的 object/data URL */
function useAttachmentUrl(filePath?: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let revoked = false;
    let objectUrl: string | null = null;
    if (!filePath) return;
    if (filePath.startsWith('data:') || filePath.startsWith('http')) {
      setUrl(filePath);
      return;
    }
    const key = parseIdbKey(filePath);
    if (!key) return;
    getAttachmentBlob(key).then((blob) => {
      if (!blob || revoked) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    }).catch(() => setUrl(null));
    return () => {
      revoked = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [filePath]);
  return url;
}

/** 下载 / 预览通用：取到 Blob 后触发 */
async function openAttachment(att: Attachment, mode: 'preview' | 'download') {
  let url: string | null = null;
  let revokeAfter = false;
  if (att.filePath.startsWith('data:') || att.filePath.startsWith('http')) {
    url = att.filePath;
  } else {
    const key = parseIdbKey(att.filePath);
    const blob = key ? await getAttachmentBlob(key) : null;
    if (blob) {
      url = URL.createObjectURL(blob);
      revokeAfter = true;
    }
  }
  if (!url) return;
  if (mode === 'preview') {
    window.open(url, '_blank');
    if (revokeAfter) setTimeout(() => URL.revokeObjectURL(url!), 60_000);
    return;
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = att.fileName || '附件';
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revokeAfter) setTimeout(() => URL.revokeObjectURL(url!), 60_000);
}

function AttachmentTile({ att, readOnly, onDelete, onPreview }: {
  att: Attachment;
  readOnly: boolean;
  onDelete: (id: string) => void;
  onPreview: (att: Attachment) => void;
}) {
  const url = useAttachmentUrl(att.filePath);
  const isImg = isImageFile(att.fileType, att.fileName);
  const canPreview = isImg || isPdfFile(att.fileType, att.fileName);

  return (
    <div className="group relative w-[112px] border border-slate-200 rounded-lg bg-white overflow-hidden hover:border-indigo-300 hover:shadow-sm transition-all">
      <button
        type="button"
        onClick={() => canPreview && onPreview(att)}
        className={`block w-full h-[84px] flex items-center justify-center bg-slate-50 ${canPreview ? 'cursor-zoom-in' : 'cursor-default'}`}
        title={att.fileName}
      >
        {isImg ? (
          url ? (
            <img src={url} alt={att.fileName} className="w-full h-full object-cover" />
          ) : (
            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
          )
        ) : (
          <FileText className="w-8 h-8 text-indigo-300" />
        )}
      </button>
      <div className="px-1.5 py-1">
        <div className="text-[11px] text-slate-700 truncate" title={att.fileName}>{att.fileName}</div>
        <div className="text-[10px] text-slate-400">{formatFileSize(att.fileSize)}</div>
      </div>
      {/* 悬浮操作 */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canPreview && (
          <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/60 text-white cursor-pointer" onClick={() => onPreview(att)}>
            <Eye className="w-3 h-3" />
          </span>
        )}
        <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-900/60 text-white cursor-pointer" onClick={() => openAttachment(att, 'download')}>
          <Download className="w-3 h-3" />
        </span>
        {!readOnly && (
          <span className="w-5 h-5 flex items-center justify-center rounded bg-rose-500/80 text-white cursor-pointer" onClick={() => onDelete(att.id)}>
            <Trash2 className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function InspectionAttachments({
  attachments,
  onChange,
  readOnly = false,
}: {
  attachments: Attachment[];
  onChange?: (list: Attachment[]) => void;
  readOnly?: boolean;
}) {
  const [idbSupported, setIdbSupported] = useState<boolean>(true);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [error, setError] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    isAttachmentDbSupported().then(setIdbSupported);
  }, []);

  // 灯箱只放图片
  const images = useMemo(() => attachments.filter((a) => isImageFile(a.fileType, a.fileName)), [attachments]);

  const grouped = useMemo(() => {
    const map: Record<InspectionAttachmentCategory, Attachment[]> = {
      site_photo: [], stamped_doc: [], other: [],
    };
    attachments.forEach((a) => {
      const key: InspectionAttachmentCategory = a.category && a.category in map ? a.category : 'other';
      map[key].push(a);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments]);

  const handlePreview = useCallback((att: Attachment) => {
    if (isImageFile(att.fileType, att.fileName)) {
      const idx = images.findIndex((a) => a.id === att.id);
      setLightboxIndex(idx >= 0 ? idx : null);
    } else {
      openAttachment(att, 'preview');
    }
  }, [images]);

  // Esc 关闭灯箱
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, images.length]);

  const handleFiles = async (category: InspectionAttachmentCategory, fileList: FileList | null) => {
    if (!fileList || !onChange) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setError('');

    // 总量限制
    if (attachments.length + pending.length + files.length > MAX_TOTAL) {
      setError(`单张验收单最多上传 ${MAX_TOTAL} 个附件，当前已有 ${attachments.length} 个`);
      return;
    }
    // 单文件限制
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE);
    if (oversized) {
      setError(`「${oversized.name}」超过 20MB 限制，请压缩后再传`);
      return;
    }

    const warnings: string[] = [];
    const added: Attachment[] = []; // 本地累积，循环结束一次性 append，避免闭包旧数组互相覆盖

    for (const file of files) {
      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setPending((p) => [...p, { tempId, name: file.name, size: file.size, category, status: 'compressing' }]);
      try {
        // 1. 图片压缩（idb 降级时压得更狠）
        const cr = idbSupported
          ? await compressImageIfNeeded(file)
          : await compressImageForFallback(file);
        if (cr.warning) warnings.push(cr.warning);

        const id = genAttachmentId();
        let filePath: string;

        if (idbSupported) {
          // 2a. 存 IndexedDB
          setPending((p) => p.map((x) => x.tempId === tempId ? { ...x, status: 'storing' } : x));
          await putAttachmentBlob(id, cr.blob);
          filePath = toIdbRef(id);
        } else {
          // 2b. 降级：压缩后转 base64，做总量预算控制（含本次批次已加入的）
          const dataUrl = await blobToDataURL(cr.blob);
          const used = attachments
            .concat(added)
            .filter((a) => a.filePath.startsWith('data:'))
            .reduce((s, a) => s + a.filePath.length, 0);
          if (used + dataUrl.length > FALLBACK_BUDGET) {
            setError('当前浏览器不支持 IndexedDB（隐私模式？），本地存储容量已不足，请改用常规浏览器或减少附件数量');
            continue;
          }
          filePath = dataUrl;
        }

        added.push({
          id,
          fileName: cr.fileName,
          filePath,
          fileSize: cr.blob.size,
          fileType: cr.fileType,
          uploadTime: nowText(),
          category,
        });
      } catch (e) {
        setError(`「${file.name}」上传失败：${(e as Error)?.message || '未知错误'}`);
      }
    }

    // 本批次全部处理完，一次性合并到父级列表
    if (added.length > 0) onChange([...attachments, ...added]);
    if (warnings.length > 0) setError(warnings[0]);
  };

  const handleDelete = async (id: string) => {
    const att = attachments.find((a) => a.id === id);
    onChange?.(attachments.filter((a) => a.id !== id));
    const key = parseIdbKey(att?.filePath);
    if (key) await deleteAttachmentBlobs([key]).catch(() => undefined);
  };

  const current = lightboxIndex !== null ? images[lightboxIndex] : null;

  return (
    <div className="space-y-3">
      {/* 错误/警告条 */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2 text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError('')} className="text-rose-400 hover:text-rose-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {GROUPS.map((g) => {
        const Icon = g.icon;
        const groupPending = pending.filter((p) => p.category === g.key);
        const list = grouped[g.key];
        return (
          <div key={g.key}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-xs font-medium text-slate-700">{g.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{list.length}</span>
              <span className="text-[10px] text-slate-400">{g.hint}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {list.map((att) => (
                <AttachmentTile
                  key={att.id}
                  att={att}
                  readOnly={readOnly}
                  onDelete={handleDelete}
                  onPreview={handlePreview}
                />
              ))}
              {/* 处理中的占位卡 */}
              {groupPending.map((pf) => (
                <div key={pf.tempId} className="w-[112px] h-[118px] border border-dashed border-indigo-200 rounded-lg bg-indigo-50/40 flex flex-col items-center justify-center text-indigo-500">
                  <Loader2 className="w-5 h-5 animate-spin mb-1" />
                  <span className="text-[10px]">{pf.status === 'compressing' ? '压缩中…' : '保存中…'}</span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{pf.name}</span>
                </div>
              ))}
              {!readOnly && (
                <label className="w-[112px] h-[118px] border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all">
                  <input
                    type="file"
                    multiple
                    accept={g.accept}
                    className="hidden"
                    onChange={(e) => {
                      handleFiles(g.key, e.target.files);
                      e.target.value = ''; // 允许重复选择同一文件
                    }}
                  />
                  {g.key === 'site_photo' ? <ImageIcon className="w-6 h-6 mb-1" /> : <Paperclip className="w-6 h-6 mb-1" />}
                  <span className="text-[11px]">+ 添加{g.label}</span>
                </label>
              )}
            </div>
          </div>
        );
      })}

      {/* 静态托管限制说明 */}
      <div className="text-[10px] text-slate-400 leading-4 flex items-start gap-1">
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-amber-400" />
        <span>
          本系统为静态演示环境，附件仅保存在当前浏览器本地（{idbSupported ? 'IndexedDB' : '本地缓存（兼容模式）'}），刷新不丢；
          清除浏览器数据会丢失，更换浏览器/设备不可见，不能替代正式档案系统。
        </span>
      </div>

      {/* 图片灯箱 */}
      {current && (
        <Lightbox
          att={current}
          index={lightboxIndex!}
          total={images.length}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))}
          onNext={() => setLightboxIndex((i) => (i === null ? null : (i + 1) % images.length))}
          onDownload={() => openAttachment(current, 'download')}
        />
      )}
    </div>
  );
}

function Lightbox({ att, index, total, onClose, onPrev, onNext, onDownload }: {
  att: Attachment;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onDownload: () => void;
}) {
  const url = useAttachmentUrl(att.filePath);
  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center" onClick={onClose}>
      <button
        type="button"
        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); onNext(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
      <div className="max-w-[86vw] max-h-[86vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {url
          ? <img src={url} alt={att.fileName} className="max-w-[86vw] max-h-[76vh] object-contain rounded shadow-2xl" />
          : <Loader2 className="w-8 h-8 text-white animate-spin" />}
        <div className="mt-3 flex items-center gap-3 text-xs text-white/80">
          <span className="max-w-[60vw] truncate">{att.fileName}</span>
          <span>{formatFileSize(att.fileSize)}</span>
          <span>{index + 1} / {total}</span>
          <button type="button" className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20" onClick={onDownload}>
            <Download className="w-3.5 h-3.5" /> 下载
          </button>
        </div>
      </div>
    </div>
  );
}
