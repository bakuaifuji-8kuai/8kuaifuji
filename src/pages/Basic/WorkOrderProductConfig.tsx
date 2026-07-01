import { useState } from 'react';
import { Search, Plus, Trash2, Save, RefreshCw, X, Edit2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { WorkOrderProductConfig, WorkOrderProductItem, Product } from '@/types';

export default function WorkOrderProductConfig() {
  const { products, workOrderConfigs, setWorkOrderConfigs } = useStore();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WorkOrderProductConfig | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<{ id: string; name: string; category: string } | null>(null);
  const [exhibitionName, setExhibitionName] = useState('');
  const [mainProducts, setMainProducts] = useState<WorkOrderProductItem[]>([]);
  const [auxiliaryProducts, setAuxiliaryProducts] = useState<WorkOrderProductItem[]>([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [productPickerType, setProductPickerType] = useState<'main' | 'auxiliary'>('main');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const workOrderItems = [
    { id: 'WI2606110003', code: 'WI2606110003', name: '停车作业项', category: '其他/停车/停车' },
    { id: 'WI2606110002', code: 'WI2606110002', name: '会议室-会议室延时业项', category: '会议室/会议室/会议室延时' },
    { id: 'WI2606110001', code: 'WI2606110001', name: '会议室-场租作业项', category: '会议室/会议室/场租' },
    { id: 'WI2606100001', code: 'WI2606100001', name: '给排水作业', category: '水/气/水气作业/给排水' },
    { id: 'WI2606040001', code: 'WI2606040001', name: '作业项_设备押金', category: '设备押金/设备押金/设备押金' },
    { id: 'WI2605270021', code: 'WI2605270021', name: '搭建押金/搭建押金/搭建押金', category: '搭建押金/搭建押金/搭建押金' },
    { id: 'WI2605270020', code: 'WI2605270020', name: '搭建押金/搭建押金/安全清洁押金', category: '搭建押金/搭建押金/安全清洁押金' },
    { id: 'WI2605270019', code: 'WI2605270019', name: '管理费/管理费/地毯管理费', category: '管理费/管理费/地毯管理费' },
    { id: 'WI2605270018', code: 'WI2605270018', name: '管理费/管理费/特装管理费', category: '管理费/管理费/特装管理费' },
    { id: 'WI2605270017', code: 'WI2605270017', name: '管理费/管理费/管理费', category: '管理费/管理费/管理费' },
    { id: 'WI2605270016', code: 'WI2605270016', name: '保洁/物业安保/布撤展-保洁加班', category: '保洁/物业安保/布撤展-保洁加班' },
    { id: 'WI2605270015', code: 'WI2605270015', name: '保洁/物业安保/布撤展-保洁', category: '保洁/物业安保/布撤展-保洁' },
    { id: 'WI2605270014', code: 'WI2605270014', name: '保洁/物业安保/展期-保洁加班', category: '保洁/物业安保/展期-保洁加班' },
    { id: 'WI2605270013', code: 'WI2605270013', name: '保洁/物业安保/展期-保洁', category: '保洁/物业安保/展期-保洁' },
    { id: 'WI2605270012', code: 'WI2605270012', name: '安保/物业安保/展期-安保加班', category: '安保/物业安保/展期-安保加班' },
    { id: 'WI2605270011', code: 'WI2605270011', name: '安保/物业安保/布撤展--安保加班', category: '安保/物业安保/布撤展--安保加班' },
    { id: 'WI2605270010', code: 'WI2605270010', name: '安保/物业安保/展期-物业安保', category: '安保/物业安保/展期-物业安保' },
    { id: 'WI2605270009', code: 'WI2605270009', name: '安保/物业安保/布撤展-物业安保', category: '安保/物业安保/布撤展-物业安保' },
    { id: 'WI2605270008', code: 'WI2605270008', name: '水/气/水气作业/给排水', category: '水/气/水气作业/给排水' },
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
    setExhibitionName('');
    setMainProducts([]);
    setAuxiliaryProducts([]);
    setShowModal(true);
  };

  const handleEditConfig = (config: WorkOrderProductConfig) => {
    setEditingConfig(config);
    setSelectedWorkOrder({ id: config.workOrderId, name: config.workOrderName, category: config.category });
    setExhibitionName(config.exhibitionName || '');
    setMainProducts([...config.mainProducts]);
    setAuxiliaryProducts([...config.auxiliaryProducts]);
    setShowModal(true);
  };

  const handleDeleteConfig = (id: string) => {
    if (confirm('确定要删除该配置吗？')) {
      setWorkOrderConfigs(workOrderConfigs.filter(c => c.id !== id));
    }
  };

  const handleSelectProduct = (product: Product) => {
    const existingItem: WorkOrderProductItem | undefined = productPickerType === 'main'
      ? mainProducts.find(p => p.productId === product.id)
      : auxiliaryProducts.find(p => p.productId === product.id);

    if (existingItem) {
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
      quantity: 1,
    };

    if (productPickerType === 'main') {
      setMainProducts([...mainProducts, newItem]);
    } else {
      setAuxiliaryProducts([...auxiliaryProducts, newItem]);
    }
  };

  const handleToggleProduct = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const availableProducts = filteredProducts.filter(p => {
      const existingMain = mainProducts.find(mp => mp.productId === p.id);
      const existingAux = auxiliaryProducts.find(ap => ap.productId === p.id);
      return !existingMain && !existingAux;
    });
    setSelectedProductIds(availableProducts.map(p => p.id));
  };

  const handleClearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleConfirmSelection = () => {
    const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));
    
    selectedProducts.forEach(product => {
      const existingItem: WorkOrderProductItem | undefined = productPickerType === 'main'
        ? mainProducts.find(p => p.productId === product.id)
        : auxiliaryProducts.find(p => p.productId === product.id);

      if (!existingItem) {
        const newItem: WorkOrderProductItem = {
          id: `WP${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          categoryName: product.categoryName || '',
          specification: product.specification,
          unit: product.unit,
          quantity: 1,
        };

        if (productPickerType === 'main') {
          setMainProducts(prev => [...prev, newItem]);
        } else {
          setAuxiliaryProducts(prev => [...prev, newItem]);
        }
      }
    });

    setSelectedProductIds([]);
    setProductPickerOpen(false);
  };

  const handleRemoveProduct = (type: 'main' | 'auxiliary', id: string) => {
    if (type === 'main') {
      setMainProducts(mainProducts.filter(p => p.id !== id));
    } else {
      setAuxiliaryProducts(auxiliaryProducts.filter(p => p.id !== id));
    }
  };

  const handleQuantityChange = (type: 'main' | 'auxiliary', id: string, quantity: number) => {
    if (type === 'main') {
      setMainProducts(mainProducts.map(p => p.id === id ? { ...p, quantity } : p));
    } else {
      setAuxiliaryProducts(auxiliaryProducts.map(p => p.id === id ? { ...p, quantity } : p));
    }
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
          exhibitionName,
          category: selectedWorkOrder.category,
          mainProducts,
          auxiliaryProducts,
          updateTime: now,
        }
      : {
          id: `WPC${Date.now()}`,
          workOrderId: selectedWorkOrder.id,
          workOrderCode: selectedWorkOrder.id,
          workOrderName: selectedWorkOrder.name,
          projectId,
          projectName,
          exhibitionName,
          category: selectedWorkOrder.category,
          mainProducts,
          auxiliaryProducts,
          createTime: now,
        };

    if (editingConfig) {
      setWorkOrderConfigs(workOrderConfigs.map(c => c.id === config.id ? config : c));
    } else {
      setWorkOrderConfigs([...workOrderConfigs, config]);
    }

    setShowModal(false);
  };

  const renderProductTable = (type: 'main' | 'auxiliary', items: WorkOrderProductItem[]) => (
    <div className="border border-[#ebeef5] rounded">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-[#f5f7fa] text-[#606266]">
            <th className="px-3 py-2 text-left">物资编码</th>
            <th className="px-3 py-2 text-left">物资名称</th>
            <th className="px-3 py-2 text-left">分类</th>
            <th className="px-3 py-2 text-left">规格</th>
            <th className="px-3 py-2 text-left">单位</th>
            <th className="px-3 py-2 text-center">数量</th>
            <th className="px-3 py-2 text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-t border-[#f0f2f5]">
              <td className="px-3 py-2 text-[#303133]">{item.productCode}</td>
              <td className="px-3 py-2 text-[#303133]">{item.productName}</td>
              <td className="px-3 py-2 text-[#303133]">{item.categoryName}</td>
              <td className="px-3 py-2 text-[#303133]">{item.specification || '-'}</td>
              <td className="px-3 py-2 text-[#303133]">{item.unit}</td>
              <td className="px-3 py-2 text-center">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(type, item.id, parseInt(e.target.value) || 1)}
                  className="w-20 px-2 py-1 border border-[#dcdfe6] rounded text-center focus:outline-none focus:border-[#2f54eb]"
                />
              </td>
              <td className="px-3 py-2 text-center">
                <button
                  onClick={() => handleRemoveProduct(type, item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                暂无{type === 'main' ? '主料' : '辅料'}，请点击右上角添加
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[#303133]">工单物资配置</h2>
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
              <th className="px-3 py-2 text-left">主料数量</th>
              <th className="px-3 py-2 text-left">辅料数量</th>
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
                <td className="px-3 py-2 text-[#303133]">{config.mainProducts.length}</td>
                <td className="px-3 py-2 text-[#303133]">{config.auxiliaryProducts.length}</td>
                <td className="px-3 py-2 text-[#303133]">{new Date(config.createTime).toLocaleString()}</td>
                <td className="px-3 py-2 text-[#303133]">{config.updateTime ? new Date(config.updateTime).toLocaleString() : '-'}</td>
                <td className="px-3 py-2 text-center">
                  <button
                    onClick={() => handleEditConfig(config)}
                    className="text-[#2f54eb] hover:text-[#1d4ed8] mx-1"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteConfig(config.id)}
                    className="text-red-500 hover:text-red-700 mx-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredConfigs.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-[#909399]">
                  暂无工单物资配置
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ display: showModal ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg w-[900px] max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebeef5]">
            <h3 className="text-base font-medium text-[#303133]">
              {editingConfig ? '编辑工单物资配置' : '新增工单物资配置'}
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
              {selectedWorkOrder && (
                <div className="mt-2 text-xs text-[#909399]">
                  作业分类：{selectedWorkOrder.category}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm text-[#606266] mb-1">展会名称 *</label>
              <input
                type="text"
                value={exhibitionName}
                onChange={(e) => setExhibitionName(e.target.value)}
                placeholder="请输入展会名称"
                className="w-full px-3 py-2 border border-[#dcdfe6] rounded text-sm focus:outline-none focus:border-[#2f54eb]"
              />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-[#303133]">主料</h4>
                <button
                  onClick={() => {
                    setProductPickerType('main');
                    setProductPickerOpen(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#2f54eb] hover:text-[#1d4ed8]"
                >
                  <Plus size={12} />
                  添加主料
                </button>
              </div>
              {renderProductTable('main', mainProducts)}
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-[#303133]">辅料</h4>
                <button
                  onClick={() => {
                    setProductPickerType('auxiliary');
                    setProductPickerOpen(true);
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-[#2f54eb] hover:text-[#1d4ed8]"
                >
                  <Plus size={12} />
                  添加辅料
                </button>
              </div>
              {renderProductTable('auxiliary', auxiliaryProducts)}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-[#ebeef5] bg-[#f5f7fa]">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm text-[#606266] hover:text-[#303133]"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-2 bg-[#2f54eb] text-white text-sm rounded hover:bg-[#1d4ed8]"
            >
              <Save size={14} />
              保存
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" style={{ display: productPickerOpen ? 'flex' : 'none' }}>
        <div className="bg-white rounded-lg w-[600px] max-h-[70vh] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#ebeef5]">
            <h3 className="text-base font-medium text-[#303133]">
              选择{productPickerType === 'main' ? '主料' : '辅料'}
            </h3>
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

            <div className="flex items-center justify-between mb-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-[#2f54eb] hover:text-[#1d4ed8]"
              >
                全选
              </button>
              <button
                onClick={handleClearSelection}
                className="text-xs text-[#909399] hover:text-[#606266]"
              >
                清除选择
              </button>
            </div>

            <div className="border border-[#ebeef5] rounded overflow-y-auto max-h-[40vh]">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#f5f7fa] text-[#606266]">
                    <th className="px-3 py-2 text-center w-8">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.length === filteredProducts.filter(p => {
                          const existingMain = mainProducts.find(mp => mp.productId === p.id);
                          const existingAux = auxiliaryProducts.find(ap => ap.productId === p.id);
                          return !existingMain && !existingAux;
                        }).length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="px-3 py-2 text-left">物资编码</th>
                    <th className="px-3 py-2 text-left">物资名称</th>
                    <th className="px-3 py-2 text-left">分类</th>
                    <th className="px-3 py-2 text-left">规格</th>
                    <th className="px-3 py-2 text-left">单位</th>
                    <th className="px-3 py-2 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => {
                    const existingMain = mainProducts.find(mp => mp.productId === product.id);
                    const existingAux = auxiliaryProducts.find(ap => ap.productId === product.id);
                    const isDisabled = existingMain || existingAux;
                    const isSelected = selectedProductIds.includes(product.id);
                    
                    return (
                      <tr key={product.id} className={`border-t border-[#f0f2f5] ${isDisabled ? 'bg-[#fafafa] opacity-50' : 'hover:bg-[#f5f7fa]'}`}>
                        <td className="px-3 py-2 text-center">
                          {!isDisabled && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleProduct(product.id)}
                            />
                          )}
                        </td>
                        <td className="px-3 py-2 text-[#303133]">{product.code}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.name}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.categoryName || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.specification || '-'}</td>
                        <td className="px-3 py-2 text-[#303133]">{product.unit}</td>
                        <td className="px-3 py-2 text-center">
                          {isDisabled ? (
                            <span className="text-xs text-[#909399]">已配置</span>
                          ) : (
                            <button
                              onClick={() => handleSelectProduct(product)}
                              className="px-3 py-1 text-xs text-[#2f54eb] border border-[#2f54eb] rounded hover:bg-[#2f54eb] hover:text-white"
                            >
                              选择
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-3 py-8 text-center text-[#909399]">
                        暂无物资
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => { setProductPickerOpen(false); setSelectedProductIds([]); }}
                className="px-4 py-2 text-sm text-[#606266] hover:text-[#303133]"
              >
                取消
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedProductIds.length === 0}
                className="px-4 py-2 bg-[#2f54eb] text-white text-sm rounded hover:bg-[#1d4ed8] disabled:bg-[#c0c4cc] disabled:cursor-not-allowed"
              >
                确认选择 ({selectedProductIds.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
