import { useState } from 'react';
import { Search, Plus, Trash2, Save, X, Edit2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WorkOrderProductConfig, WorkOrderProductItem, Product } from '@/types';

export default function WorkOrderProductConfig() {
  const { products, workOrderConfigs, setWorkOrderConfigs } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WorkOrderProductConfig | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<{ id: string; name: string; category: string } | null>(null);
  const [productsList, setProductsList] = useState<WorkOrderProductItem[]>([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const workOrderItems = [
    { id: 'WI-PD-220V', code: 'WI-PD-220V', name: '配电箱220V 16A', category: '动力/电力/配电箱220V 16A' },
    { id: 'WI-DD', code: 'WI-DD', name: '吊点', category: '搭建/结构/吊点' },
  ];

  const filteredConfigs = workOrderConfigs.filter(
    config =>
      config.workOrderName.includes(searchKeyword) ||
      config.workOrderCode.includes(searchKeyword) ||
      config.category.includes(searchKeyword) ||
      config.exhibitionName?.includes(searchKeyword)
  );

  const filteredProducts = products.filter(
    product =>
      product.name.includes(productSearch) ||
      product.code.includes(productSearch) ||
      product.categoryName?.includes(productSearch)
  );

  const handleAddConfig = () => {
    setEditingConfig(null);
    setSelectedWorkOrder(null);
    setProductsList([]);
    setShowModal(true);
  };

  const handleEditConfig = (config: WorkOrderProductConfig) => {
    setEditingConfig(config);
    setSelectedWorkOrder({ id: config.workOrderId, name: config.workOrderName, category: config.category });
    setProductsList([...config.products]);
    setShowModal(true);
  };

  const handleDeleteConfig = (id: string) => {
    if (confirm('确定要删除该配置吗？')) {
      setWorkOrderConfigs(workOrderConfigs.filter(c => c.id !== id));
    }
  };

  const handleAddSingle = (product: Product) => {
    if (productsList.some(p => p.productId === product.id)) {
      alert('该物资已在配置中');
      return;
    }
    const newItem: WorkOrderProductItem = {
      id: `WP${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      productId: product.id,
      productCode: product.code,
      productName: product.name,
      categoryName: product.categoryName || '',
      specification: product.specification,
      unit: product.unit,
      ratio: 1, // 默认 1:1
    };
    setProductsList([...productsList, newItem]);
  };

  const handleConfirmSelection = () => {
    const selected = products.filter(p => selectedProductIds.includes(p.id));
    const existingIds = new Set(productsList.map(p => p.productId));
    selected.forEach(product => {
      if (existingIds.has(product.id)) return;
      const newItem: WorkOrderProductItem = {
        id: `WP${Date.now()}${Math.random().toString(36).substr(2, 9)}_${product.id}`,
        productId: product.id,
        productCode: product.code,
        productName: product.name,
        categoryName: product.categoryName || '',
        specification: product.specification,
        unit: product.unit,
        ratio: 1,
      };
      setProductsList(prev => [...prev, newItem]);
    });
    setSelectedProductIds([]);
    setProductPickerOpen(false);
  };

  const handleRemoveProduct = (id: string) => {
    setProductsList(productsList.filter(p => p.id !== id));
  };

  const handleRatioChange = (id: string, ratio: number) => {
    setProductsList(productsList.map(p => p.id === id ? { ...p, ratio: Math.max(0, ratio) } : p));
  };

  const handleSave = () => {
    if (!selectedWorkOrder) {
      alert('请选择作业项目');
      return;
    }
    const now = new Date().toISOString();
    const existingConfig = workOrderConfigs.find(c => c.workOrderId === selectedWorkOrder.id);
    const projectId = existingConfig?.projectId || '';
    const projectName = existingConfig?.projectName || '';

    const config: WorkOrderProductConfig = editingConfig
      ? {
          ...editingConfig,
          workOrderId: selectedWorkOrder.id,
          workOrderName: selectedWorkOrder.name,
          category: selectedWorkOrder.category,
          products: productsList,
          updateTime: now,
        }
      : {
          id: `WPC${Date.now()}`,
          workOrderId: selectedWorkOrder.id,
          workOrderCode: selectedWorkOrder.id,
          workOrderName: selectedWorkOrder.name,
          projectId,
          projectName,
          category: selectedWorkOrder.category,
          products: productsList,
          createTime: now,
        };

    if (editingConfig) {
      setWorkOrderConfigs(workOrderConfigs.map(c => c.id === config.id ? config : c));
    } else {
      setWorkOrderConfigs([...workOrderConfigs, config]);
    }
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#303133]">作业项物资配置</h2>
        <button
          onClick={handleAddConfig}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#2f54eb] text-white text-sm rounded hover:bg-[#1d4ed8]"
        >
          <Plus size={14} />
          新增配置
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909399]" />
          <input
            type="text"
            placeholder="搜索作业项目名称或编码"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
          />
        </div>
        <button
          onClick={() => setSearchKeyword('')}
          className="px-3 py-2 border border-[#dcdfe6] text-[#606266] text-sm rounded hover:bg-[#f5f7fa]"
        >
          重置
        </button>
      </div>

      <div className="border border-[#ebeef5] rounded overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#f5f7fa] text-[#606266]">
              <th className="px-3 py-2 text-left">作业项目编码</th>
              <th className="px-3 py-2 text-left">作业项目名称</th>
              <th className="px-3 py-2 text-left">展会名称</th>
              <th className="px-3 py-2 text-left">作业分类</th>
              <th className="px-3 py-2 text-left">物资种类</th>
              <th className="px-3 py-2 text-left">创建时间</th>
              <th className="px-3 py-2 text-left">更新时间</th>
              <th className="px-3 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map(config => (
              <tr key={config.id} className="border-t border-[#f0f2f5] hover:bg-[#f5f7fa]">
                <td className="px-3 py-2 text-[#303133]">{config.workOrderCode}</td>
                <td className="px-3 py-2 text-[#303133]">{config.workOrderName}</td>
                <td className="px-3 py-2 text-[#303133]">{config.exhibitionName || '-'}</td>
                <td className="px-3 py-2 text-[#303133]">{config.category}</td>
                <td className="px-3 py-2 text-[#303133]">{config.products.length}</td>
                <td className="px-3 py-2 text-[#303133]">{new Date(config.createTime).toLocaleString()}</td>
                <td className="px-3 py-2 text-[#303133]">{config.updateTime ? new Date(config.updateTime).toLocaleString() : '-'}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => handleEditConfig(config)} className="text-[#2f54eb] hover:text-[#1d4ed8] mx-1">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteConfig(config.id)} className="text-red-500 hover:text-red-700 mx-1">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredConfigs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-[#909399]">
                  暂无作业项物资配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 配置弹窗 */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ display: showModal ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebeef5]">
            <h3 className="text-base font-medium text-[#303133]">
              {editingConfig ? '编辑作业项物资配置' : '新增作业项物资配置'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-[#909399] hover:text-[#606266]">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="mb-4">
              <label className="block text-sm text-[#606266] mb-1">作业项目 *</label>
              <select
                value={selectedWorkOrder?.id || ''}
                onChange={(e) => {
                  const wo = workOrderItems.find(w => w.id === e.target.value);
                  setSelectedWorkOrder(wo || null);
                }}
                className="w-full px-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
              >
                <option value="">请选择作业项目</option>
                {workOrderItems.map(wo => (
                  <option key={wo.id} value={wo.id}>{wo.name} ({wo.category})</option>
                ))}
              </select>
            </div>

            {/* 合并后的单一物资表 */}
            <div className="mb-6 border border-[#ebeef5] rounded">
              <div className="flex items-center justify-between px-3 py-2 bg-[#f5f7fa] border-b border-[#ebeef5]">
                <h4 className="text-sm font-medium text-[#303133]">📦 物资清单（不分主辅 · 数量为比例系数）</h4>
                <button
                  onClick={() => setProductPickerOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#2f54eb] hover:text-[#1d4ed8]"
                >
                  <Plus size={12} />
                  添加物资
                </button>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[#606266]">
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">分类</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-center w-40">比例系数（默认 1:1）</th>
                    <th className="px-3 py-2 text-center w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {productsList.map(item => (
                    <tr key={item.id} className="border-t border-[#f0f2f5]">
                      <td className="px-3 py-2 text-[#303133]">{item.productCode}</td>
                      <td className="px-3 py-2 text-[#303133]">{item.productName}</td>
                      <td className="px-3 py-2 text-[#303133]">{item.categoryName}</td>
                      <td className="px-3 py-2 text-[#303133]">{item.specification || '-'}</td>
                      <td className="px-3 py-2 text-[#303133]">{item.unit}</td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={item.ratio}
                          onChange={(e) => handleRatioChange(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-[#dcdfe6] rounded text-center focus:outline-none focus:border-[#2f54eb]"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button onClick={() => handleRemoveProduct(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {productsList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                        暂无物资，请点击右上角添加
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-[#ebeef5] bg-[#f5f7fa]">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-[#606266] hover:text-[#303133]">
              取消
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-2 bg-[#2f54eb] text-white text-sm rounded hover:bg-[#1d4ed8]">
              <Save size={14} />
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 物资选择弹窗 */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ display: productPickerOpen ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg w-[600px] max-h-[70vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebeef5]">
            <h3 className="text-base font-medium text-[#303133]">选择物资</h3>
            <button onClick={() => { setProductPickerOpen(false); setSelectedProductIds([]); }} className="text-[#909399] hover:text-[#606266]">
              <X size={18} />
            </button>
          </div>

          <div className="p-4">
            <div className="relative mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#909399]" />
              <input
                type="text"
                placeholder="搜索物资名称、编码或分类"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
              />
            </div>

            <div className="border border-[#ebeef5] rounded overflow-y-auto max-h-[40vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">分类</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-center w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const disabled = productsList.some(p => p.productId === product.id);
                    return (
                      <tr key={product.id} className={`border-t border-[#f0f2f5] ${disabled ? 'bg-[#fafafa] opacity-50' : 'hover:bg-[#f5f7fa]'}`}>
                        <td className="px-3 py-2 text-[#303133]">{product.code}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.name}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.categoryName || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.unit}</td>
                        <td className="px-3 py-2 text-center">
                          {disabled ? (
                            <span className="text-xs text-[#909399]">已配置</span>
                          ) : (
                            <button
                              onClick={() => handleAddSingle(product)}
                              className="px-3 py-1 text-xs text-[#2f54eb] border border-[#2f54eb] rounded hover:bg-[#2f54eb] hover:text-white"
                            >
                              + 添加
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-[#909399]">
                        暂无物资
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
