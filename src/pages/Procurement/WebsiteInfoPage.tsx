import { useMemo, useState } from 'react';
import { PrimaryButton, DefaultButton, TextButton } from '@/components/common/Button';
import { SearchBar, SearchField } from '@/components/common/SearchField';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import { useStore } from '@/store/useStore';
import type { WebsiteInfo } from '@/types';

// 常用选项
const PROVIDE_FORM_OPTIONS = ['文字', '图片', '图文', '视频', '文件'];
const INFO_CATEGORY_OPTIONS = ['新闻动态', '展会通知', '企业宣传', '行业资讯', '其他'];
const SUBMIT_COLUMN_OPTIONS = ['首页', '展会新闻', '采购信息', '企业介绍', '联系我们'];

// 初始测试数据
const MOCK_DATA: WebsiteInfo[] = (() => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const dateStr = `${y}-${m}-${d}`;

  return [
    {
      id: 'W001', infoNo: 'WS20260620001', submitTime: `${dateStr} 09:12:00`,
      submitUnit: '展览集团有限公司', submitDepartment: '市场宣传部门',
      submitColumn: '展会新闻', infoCategory: '新闻动态',
      applicant: '王芳', contactPhone: '13812345678',
      title: '2026 春季国际展览会开幕仪式',
      provideForm: '图文', validityType: 'short',
      validityStartDate: `${y}-06-20`, validityEndDate: `${y}-07-20`,
      approvalNodes: [],
      receiveTime: `${dateStr} 10:00:00`, receiver: '李雷',
      publishTime: `${dateStr} 14:30:00`, publishColumn: '展会新闻',
      archived: 'yes', publisherConfirm: '韩梅梅',
      status: 'published', creator: '王芳', createTime: `${dateStr} 09:12:00`,
    },
    {
      id: 'W002', infoNo: 'WS20260620002', submitTime: `${dateStr} 10:25:00`,
      submitUnit: '展览集团有限公司', submitDepartment: '采购部门',
      submitColumn: '采购信息', infoCategory: '展会通知',
      applicant: '赵强', contactPhone: '13987654321',
      title: '2026 夏季展会供应商报名通知',
      provideForm: '文字', validityType: 'long',
      approvalNodes: [],
      receiver: '', archived: 'no', publisherConfirm: '',
      status: 'in_approval', creator: '赵强', createTime: `${dateStr} 10:25:00`,
    },
  ];
})();

export default function WebsiteInfoPage() {
  const websiteInfos = useStore((s) => s.websiteInfos);
  const addWebsiteInfo = useStore((s) => s.addWebsiteInfo);
  const updateWebsiteInfo = useStore((s) => s.updateWebsiteInfo);
  const deleteWebsiteInfo = useStore((s) => s.deleteWebsiteInfo);
  const currentUser = useStore((s) => s.currentUser);

  // 初始化测试数据（仅首次）
  if (websiteInfos.length === 0 && addWebsiteInfo) {
    MOCK_DATA.forEach((w) => addWebsiteInfo(w));
  }

  const [filterNo, setFilterNo] = useState('');
  const [filterTitle, setFilterTitle] = useState('');
  const [filterUnit, setFilterUnit] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [applied, setApplied] = useState({ no: '', title: '', unit: '', applicant: '', status: '' });

  const filteredData = useMemo(() => {
    return websiteInfos.filter((w) => {
      if (applied.no && !w.infoNo.includes(applied.no)) return false;
      if (applied.title && !w.title.includes(applied.title)) return false;
      if (applied.unit && !w.submitUnit.includes(applied.unit)) return false;
      if (applied.applicant && !w.applicant.includes(applied.applicant)) return false;
      if (applied.status && w.status !== applied.status) return false;
      return true;
    });
  }, [websiteInfos, applied]);

  const columns: ColumnDef<WebsiteInfo>[] = [
    { key: 'infoNo', title: '登记编号' },
    { key: 'title', title: '标题' },
    { key: 'submitUnit', title: '报送单位' },
    { key: 'submitDepartment', title: '报送部门' },
    { key: 'submitColumn', title: '报送栏目' },
    { key: 'infoCategory', title: '信息类别' },
    { key: 'applicant', title: '申请人' },
    { key: 'contactPhone', title: '联系电话' },
    { key: 'submitTime', title: '报送时间' },
    {
      key: 'status', title: '状态',
      render: (row) => {
        const map: Record<string, { label: string; color: string }> = {
          draft: { label: '草稿', color: 'text-[#909399]' },
          submitted: { label: '已提交', color: 'text-[#e6a23c]' },
          in_approval: { label: '审核中', color: 'text-[#409eff]' },
          approved: { label: '审核通过', color: 'text-[#67c23a]' },
          rejected: { label: '审核驳回', color: 'text-[#f56c6c]' },
          published: { label: '已发布', color: 'text-[#67c23a]' },
        };
        const v = map[row.status] || map.draft;
        return <span className={v.color}>{v.label}</span>;
      },
    },
    {
      key: 'op', title: '操作',
      render: (row) => (
        <div className="flex items-center gap-3">
          <TextButton onClick={() => setEditItem(row)}>编辑</TextButton>
          <TextButton onClick={() => setViewItem(row)}>查看详情</TextButton>
          <TextButton
            type="danger"
            onClick={() => {
              if (confirm(`确认删除登记 ${row.infoNo}？`)) deleteWebsiteInfo?.(row.id);
            }}
          >删除</TextButton>
        </div>
      ),
    },
  ];

  // 编辑 / 新增
  const [editItem, setEditItem] = useState<WebsiteInfo | null>(null);

  const openAdd = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    setEditItem({
      id: 'W_' + Date.now(),
      infoNo: `WS${y}${m}${d}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      submitTime: `${dateStr} ${hh}:${mm}:${ss}`,
      submitUnit: '', submitDepartment: '', submitColumn: '', infoCategory: '',
      applicant: currentUser?.name || '', contactPhone: '',
      title: '', provideForm: '', validityType: 'short',
      validityStartDate: dateStr, validityEndDate: '',
      receiver: '', archived: 'no', publisherConfirm: '',
      status: 'submitted',
      creator: currentUser?.name || '',
      createTime: `${dateStr} ${hh}:${mm}:${ss}`,
    });
  };

  const handleSave = () => {
    if (!editItem) return;
    if (!editItem.title.trim()) { alert('请填写标题'); return; }
    if (!editItem.submitUnit.trim()) { alert('请填写报送单位'); return; }
    if (!editItem.applicant.trim()) { alert('请填写申请人'); return; }

    const existing = websiteInfos.find((w) => w.id === editItem.id);
    if (existing) updateWebsiteInfo?.(editItem.id, editItem);
    else addWebsiteInfo?.(editItem);
    setEditItem(null);
  };

  // 详情
  const [viewItem, setViewItem] = useState<WebsiteInfo | null>(null);

  // 字段变更助手
  const updateEdit = (patch: Partial<WebsiteInfo>) => {
    if (!editItem) return;
    setEditItem({ ...editItem, ...patch });
  };



  return (
    <div className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#303133]">网站（宣传）信息报送审核发布管理</h2>
        <div className="flex items-center gap-2">
          <DefaultButton onClick={openAdd}>+ 新增登记</DefaultButton>
        </div>
      </div>

      <SearchBar
        onSearch={() => setApplied({ no: filterNo, title: filterTitle, unit: filterUnit, applicant: filterApplicant, status: filterStatus })}
        onReset={() => {
          setFilterNo(''); setFilterTitle(''); setFilterUnit(''); setFilterApplicant(''); setFilterStatus('');
          setApplied({ no: '', title: '', unit: '', applicant: '', status: '' });
        }}
      >
        <SearchField label="登记编号" placeholder="请输入" value={filterNo} onChange={setFilterNo} />
        <SearchField label="标题" placeholder="请输入" value={filterTitle} onChange={setFilterTitle} />
        <SearchField label="报送单位" placeholder="请输入" value={filterUnit} onChange={setFilterUnit} />
        <SearchField label="申请人" placeholder="请输入" value={filterApplicant} onChange={setFilterApplicant} />
        <SearchField
          label="状态" type="select" value={filterStatus} onChange={setFilterStatus}
          options={[
            { value: '', label: '全部' },
            { value: 'draft', label: '草稿' },
            { value: 'submitted', label: '已提交' },
            { value: 'in_approval', label: '审核中' },
            { value: 'approved', label: '审核通过' },
            { value: 'rejected', label: '审核驳回' },
            { value: 'published', label: '已发布' },
          ]}
        />
      </SearchBar>

      <DataTable data={filteredData} columns={columns} />

      {/* 新增 / 编辑弹窗 */}
      <Modal
        open={!!editItem}
        title={editItem?.infoNo.startsWith('W_') ? '新增登记表' : `编辑登记表 - ${editItem?.infoNo}`}
        onClose={() => setEditItem(null)}
        footer={
          <>
            <DefaultButton onClick={() => setEditItem(null)}>取消</DefaultButton>
            <PrimaryButton onClick={handleSave}>保存</PrimaryButton>
          </>
        }
        width="1100px"
      >
        {editItem && (
          <div className="space-y-4 text-sm">
            {/* 区块一：信息报送单位填写 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">
                信息报送单位填写
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">报送时间</div>
                    <input
                      type="text" readOnly
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm bg-[#f5f7fa] text-[#606266]"
                      value={editItem.submitTime}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">报送单位</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.submitUnit}
                      onChange={(e) => updateEdit({ submitUnit: e.target.value })}
                      placeholder="请输入报送单位"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">报送部门</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.submitDepartment}
                      onChange={(e) => updateEdit({ submitDepartment: e.target.value })}
                      placeholder="请输入报送部门"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">报送栏目</div>
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.submitColumn}
                      onChange={(e) => updateEdit({ submitColumn: e.target.value })}
                    >
                      <option value="">请选择</option>
                      {SUBMIT_COLUMN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">信息类别</div>
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.infoCategory}
                      onChange={(e) => updateEdit({ infoCategory: e.target.value })}
                    >
                      <option value="">请选择</option>
                      {INFO_CATEGORY_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">申请人</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.applicant}
                      onChange={(e) => updateEdit({ applicant: e.target.value })}
                      placeholder="请输入申请人"
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">联系电话</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.contactPhone}
                      onChange={(e) => updateEdit({ contactPhone: e.target.value })}
                      placeholder="请输入联系电话"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-3">
                    <div className="mb-1 text-xs text-[#606266]">标题</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.title}
                      onChange={(e) => updateEdit({ title: e.target.value })}
                      placeholder="请输入信息标题"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">提供形式</div>
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.provideForm}
                      onChange={(e) => updateEdit({ provideForm: e.target.value })}
                    >
                      <option value="">请选择</option>
                      {PROVIDE_FORM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">信息有效期</div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio" name="validityType"
                          checked={editItem.validityType === 'short'}
                          onChange={() => updateEdit({ validityType: 'short' })}
                        />
                        1. 短期
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio" name="validityType"
                          checked={editItem.validityType === 'long'}
                          onChange={() => updateEdit({ validityType: 'long' })}
                        />
                        2. 长期
                      </label>
                    </div>
                  </div>
                  {editItem.validityType === 'short' && (
                    <>
                      <div>
                        <div className="mb-1 text-xs text-[#606266]">开始日期</div>
                        <input
                          type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                          value={editItem.validityStartDate || ''}
                          onChange={(e) => updateEdit({ validityStartDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <div className="mb-1 text-xs text-[#606266]">结束日期</div>
                        <input
                          type="date" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                          value={editItem.validityEndDate || ''}
                          onChange={(e) => updateEdit({ validityEndDate: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>


            {/* 区块三：签收与发布单位填写 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">
                签收与发布单位填写
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">接收时间</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.receiveTime || ''}
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      onChange={(e) => updateEdit({ receiveTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">接收人</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.receiver}
                      onChange={(e) => updateEdit({ receiver: e.target.value })}
                      placeholder="接收人"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">上网时间</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.publishTime || ''}
                      placeholder="YYYY-MM-DD HH:mm:ss"
                      onChange={(e) => updateEdit({ publishTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">上网栏目</div>
                    <select
                      className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.publishColumn || ''}
                      onChange={(e) => updateEdit({ publishColumn: e.target.value })}
                    >
                      <option value="">请选择</option>
                      {SUBMIT_COLUMN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">是否存档</div>
                    <div className="flex items-center gap-6 h-8">
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio" name="archived"
                          checked={editItem.archived === 'yes'}
                          onChange={() => updateEdit({ archived: 'yes' })}
                        />
                        是
                      </label>
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="radio" name="archived"
                          checked={editItem.archived === 'no'}
                          onChange={() => updateEdit({ archived: 'no' })}
                        />
                        否
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 text-xs text-[#606266]">信息发布人确认</div>
                    <input
                      type="text" className="w-full h-8 px-2 border border-[#dcdfe6] rounded text-sm"
                      value={editItem.publisherConfirm}
                      onChange={(e) => updateEdit({ publisherConfirm: e.target.value })}
                      placeholder="发布人签字"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        open={!!viewItem}
        title={`登记表详情 - ${viewItem?.infoNo}`}
        onClose={() => setViewItem(null)}
        footer={<DefaultButton onClick={() => setViewItem(null)}>关闭</DefaultButton>}
        width="1100px"
      >
        {viewItem && (
          <div className="space-y-4 text-sm">
            {/* 区块一：信息报送单位填写 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">
                信息报送单位填写
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#909399]">报送时间：</span>{viewItem.submitTime}</div>
                  <div><span className="text-[#909399]">报送单位：</span>{viewItem.submitUnit}</div>
                  <div><span className="text-[#909399]">报送部门：</span>{viewItem.submitDepartment}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#909399]">报送栏目：</span>{viewItem.submitColumn}</div>
                  <div><span className="text-[#909399]">信息类别：</span>{viewItem.infoCategory}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#909399]">申请人：</span>{viewItem.applicant}</div>
                  <div><span className="text-[#909399]">联系电话：</span>{viewItem.contactPhone}</div>
                </div>
                <div className="text-xs"><span className="text-[#909399]">标题：</span>{viewItem.title}</div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><span className="text-[#909399]">提供形式：</span>{viewItem.provideForm}</div>
                  <div>
                    <span className="text-[#909399]">信息有效期：</span>
                    {viewItem.validityType === 'short'
                      ? `短期（${viewItem.validityStartDate || ''} 至 ${viewItem.validityEndDate || ''}）`
                      : '长期'}
                  </div>
                </div>
              </div>
            </div>



            {/* 区块三：签收与发布单位填写 */}
            <div className="border border-[#dcdfe6] rounded">
              <div className="bg-[#f5f7fa] px-3 py-2 text-[#303133] font-bold text-xs border-b border-[#dcdfe6]">
                签收与发布单位填写
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3">
                  <div><span className="text-[#909399]">接收时间：</span>{viewItem.receiveTime || '-'}</div>
                  <div><span className="text-[#909399]">接收人：</span>{viewItem.receiver || '-'}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div><span className="text-[#909399]">上网时间：</span>{viewItem.publishTime || '-'}</div>
                  <div><span className="text-[#909399]">上网栏目：</span>{viewItem.publishColumn || '-'}</div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#909399]">是否存档：</span>
                    {viewItem.archived === 'yes' ? '是' : '否'}
                  </div>
                  <div><span className="text-[#909399]">信息发布人确认：</span>{viewItem.publisherConfirm || '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
