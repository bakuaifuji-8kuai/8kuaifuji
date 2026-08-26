import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Calendar, Save, Eye } from 'lucide-react';
import Button, { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import type { MeetingNote, MeetingNoteItem } from '@/types';

const STORAGE_KEY = 'meeting_notes_data';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const initialData: MeetingNote[] = [
  {
    id: '2026-08-21-001',
    meetingDate: '2026-08-21',
    title: '固定资产管理业务规则确认会议',
    items: [
      { id: '1', content: '固定资产档案中不可编辑金额' },
      { id: '2', content: '调拨单1 A-B,调拨单2 B-C。2可以反确认，1不可以反确认。' },
      { id: '3', content: '归还后，被领用，归还单不可以反确认。' },
      { id: '4', content: '报损后，被归还，报损单不可以反确认。确认/反确认逻辑。已确认入库/已确认出库后，才可反确认。反确认后，单据回滚到待提交状态。可以编辑，重新提交流程审批。流水记录是反向流水记录。' },
      { id: '5', content: '固定资产管理的库存/流水记录与库存管理数据互通。' },
      { id: '6', content: '固定资产报废与报损单据，选择领用中状态的物资。' },
      { id: '7', content: '同一个产品ID，在一个仓库中，仅会存在一个仓位。' },
    ],
    images: [],
    createdAt: '2026-08-21 10:00:00',
    updatedAt: '2026-08-21 10:00:00',
  },
];

function loadNotes(): MeetingNote[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }
  return initialData;
}

function saveNotes(notes: MeetingNote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export default function MeetingNotes() {
  const [notes, setNotes] = useState<MeetingNote[]>(loadNotes());
  const [filterDate, setFilterDate] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<MeetingNote | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formDate, setFormDate] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formItems, setFormItems] = useState<MeetingNoteItem[]>([]);
  const [formImages, setFormImages] = useState<string[]>([]);

  const filteredNotes = useMemo(() => {
    if (!filterDate) return notes;
    return notes.filter((n) => n.meetingDate === filterDate);
  }, [notes, filterDate]);

  const openAddModal = () => {
    setEditingNote(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTitle('');
    setFormItems([{ id: generateId(), content: '' }]);
    setFormImages([]);
    setModalOpen(true);
  };

  const openEditModal = (note: MeetingNote) => {
    setEditingNote(note);
    setFormDate(note.meetingDate);
    setFormTitle(note.title || '');
    setFormItems(note.items.map((item) => ({ ...item })));
    setFormImages([...note.images]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingNote(null);
  };

  const addItem = () => {
    setFormItems([...formItems, { id: generateId(), content: '' }]);
  };

  const removeItem = (id: string) => {
    setFormItems(formItems.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, content: string) => {
    setFormItems(formItems.map((item) => (item.id === id ? { ...item, content } : item)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        alert(`图片 ${file.name} 超过 2MB，无法上传`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormImages(formImages.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formDate) {
      alert('请选择会议日期');
      return;
    }
    const validItems = formItems.filter((item) => item.content.trim());
    if (validItems.length === 0) {
      alert('请至少填写一条会议纪要内容');
      return;
    }

    const now = new Date().toLocaleString('zh-CN', { hour12: false });

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              meetingDate: formDate,
              title: formTitle,
              items: validItems,
              images: formImages,
              updatedAt: now,
            }
          : n
      );
      setNotes(updated);
      saveNotes(updated);
    } else {
      const newNote: MeetingNote = {
        id: generateId(),
        meetingDate: formDate,
        title: formTitle,
        items: validItems,
        images: formImages,
        createdAt: now,
        updatedAt: now,
      };
      const updated = [newNote, ...notes];
      setNotes(updated);
      saveNotes(updated);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这条会议纪要吗？')) return;
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const resetData = () => {
    if (!confirm('确定要重置所有数据吗？将恢复为初始演示数据，您编辑的内容将丢失。')) return;
    setNotes(initialData);
    saveNotes(initialData);
  };

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-800">会议纪要</h2>
          <Badge variant="info" className="ml-2">
            共 {notes.length} 条
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="text" size="small" onClick={resetData} title="重置为初始数据">
            <span>重置数据</span>
          </Button>
          <PrimaryButton onClick={openAddModal}>
            <Plus size={16} />
            <span>新增纪要</span>
          </PrimaryButton>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-9 px-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {filterDate && (
            <TextButton size="small" onClick={() => setFilterDate('')}>
              清除筛选
            </TextButton>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotes.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar size={48} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">暂无会议纪要，点击右上角"新增纪要"添加</p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden"
            >
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-slate-800">
                        {note.title || `${note.meetingDate} 会议纪要`}
                      </div>
                      <div className="text-xs text-slate-500">
                        {note.meetingDate} · 更新于 {note.updatedAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <TextButton size="small" onClick={() => openEditModal(note)}>
                      <Edit2 size={14} />
                      <span>编辑</span>
                    </TextButton>
                    <TextButton
                      size="small"
                      onClick={() => handleDelete(note.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                      <span>删除</span>
                    </TextButton>
                  </div>
                </div>
              </div>

              <div className="px-5 py-4">
                <ol className="space-y-2">
                  {note.items.map((item, idx) => (
                    <li key={item.id} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{item.content}</span>
                    </li>
                  ))}
                </ol>

                {note.images.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <ImageIcon size={14} className="text-slate-400" />
                      <span className="text-xs text-slate-500">附件图片 ({note.images.length}张)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors"
                          onClick={() => setPreviewImage(img)}
                        >
                          <img src={img} alt={`图片${idx + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Eye size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editingNote ? '编辑会议纪要' : '新增会议纪要'}
        onClose={closeModal}
        size="lg"
        footer={
          <>
            <DefaultButton onClick={closeModal}>取消</DefaultButton>
            <PrimaryButton onClick={handleSubmit}>
              <Save size={16} />
              <span>保存</span>
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                会议日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full h-10 px-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">会议标题</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="可选，留空则使用日期作为标题"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              会议纪要内容 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {formItems.map((item, idx) => (
                <div key={item.id} className="flex gap-2">
                  <span className="flex-shrink-0 w-8 h-10 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <textarea
                    value={item.content}
                    onChange={(e) => updateItem(item.id, e.target.value)}
                    placeholder={`第${idx + 1}条内容...`}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={formItems.length === 1}
                    className="flex-shrink-0 w-10 h-10 rounded-lg border border-slate-200 hover:border-red-300 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <Button variant="text" size="small" onClick={addItem} className="mt-1">
                <Plus size={14} />
                <span>添加一条</span>
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">附件图片</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-indigo-400 transition-colors">
              <div className="flex flex-wrap gap-3 mb-3">
                {formImages.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-slate-200">
                    <img src={img} alt={`图片${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex flex-col items-center justify-center cursor-pointer py-2 text-slate-400 hover:text-indigo-500 transition-colors">
                <ImageIcon size={24} className="mb-1" />
                <span className="text-xs">点击上传图片（支持多选，单张不超过2MB）</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </Modal>

      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)} size="full">
        <div className="flex items-center justify-center p-4">
          {previewImage && (
            <img
              src={previewImage}
              alt="预览"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
