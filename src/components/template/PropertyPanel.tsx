import React, { useState } from 'react';
import type { TemplateComponent, ComponentType, DataSourceMapping, DataSourceType } from '@/types';
import { BIDDING_FIELDS, DEMAND_FIELDS, SUPPLIER_FIELDS } from '@/types';
import { getComponentMeta, componentLibrary } from '@/utils/componentConfig';
import { Settings, Type, Hash, Calendar, FileText, Paperclip, Image, Plus, Trash2, GripVertical, Database, Link2 } from 'lucide-react';

interface Props {
  component: TemplateComponent | null;
  onChange: (props: Record<string, any>) => void;
  components?: TemplateComponent[];
  onUpdateComponent?: (id: string, props: Record<string, any>) => void;
  onAddChildToLayout?: (parentId: string, childType: ComponentType, slot?: string, tabIndex?: number) => void;
  onMoveChildWithinLayout?: (parentId: string, childId: string, direction: 'up' | 'down', slot?: string, tabIndex?: number) => void;
  onRemoveChildFromLayout?: (parentId: string, childId: string, slot?: string, tabIndex?: number) => void;
  getChildById?: (id: string) => TemplateComponent | undefined;
  dataSourceMappings?: DataSourceMapping[];
  onUpdateDataSourceMappings?: (mappings: DataSourceMapping[]) => void;
}

export function PropertyPanel({
  component,
  onChange,
  components = [],
  onUpdateComponent,
  onAddChildToLayout,
  onMoveChildWithinLayout,
  onRemoveChildFromLayout,
  getChildById,
  dataSourceMappings = [],
  onUpdateDataSourceMappings,
}: Props) {
  const [addingSlot, setAddingSlot] = useState<string | null>(null);
  const [addingTabIndex, setAddingTabIndex] = useState<number | null>(null);

  if (!component) {
    return (
      <div className="w-64 bg-white border-l border-gray-200 h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Settings size={32} className="mx-auto mb-2" />
          <p className="text-sm">选择组件查看属性</p>
        </div>
      </div>
    );
  }

  const meta = getComponentMeta(component.type);
  const props = component.props;

  const updateProp = (key: string, value: any) => {
    onChange({ ...props, [key]: value });
  };

  const renderLayoutChildItem = (
    childId: string,
    parentId: string,
    slot?: string,
    tabIndex?: number,
    siblingsCount?: number,
    currentIdx?: number,
  ) => {
    const child = getChildById?.(childId) || components.find((c) => c.id === childId);
    if (!child) return null;
    const childMeta = getComponentMeta(child.type);

    return (
      <div key={childId} className="flex items-center gap-1 bg-gray-50 rounded p-1.5 text-xs">
        <GripVertical size={12} className="text-gray-400" />
        <span className="flex-1 truncate">{childMeta?.label || child.type}</span>
        {currentIdx !== undefined && currentIdx > 0 && (
          <button
            className="p-0.5 hover:bg-gray-200 rounded text-gray-400"
            onClick={() => onMoveChildWithinLayout?.(parentId, childId, 'up', slot, tabIndex)}
            title="上移"
          >
            ▲
          </button>
        )}
        {siblingsCount !== undefined && currentIdx !== undefined && currentIdx < siblingsCount - 1 && (
          <button
            className="p-0.5 hover:bg-gray-200 rounded text-gray-400"
            onClick={() => onMoveChildWithinLayout?.(parentId, childId, 'down', slot, tabIndex)}
            title="下移"
          >
            ▼
          </button>
        )}
        <button
          className="p-0.5 hover:bg-red-100 rounded text-red-400"
          onClick={() => {
            if (confirm(`确认移除子组件"${childMeta?.label}"？`)) {
              onRemoveChildFromLayout?.(parentId, childId, slot, tabIndex);
            }
          }}
          title="移除"
        >
          <Trash2 size={10} />
        </button>
      </div>
    );
  };

  const renderLayoutChildrenManager = () => {
    if (!onAddChildToLayout || !getChildById) return null;

    switch (component.type) {
      case 'col2': {
        const leftChildren = props.leftChildren || [];
        const rightChildren = props.rightChildren || [];

        return (
          <Section title="子组件管理" icon={<Settings size={14} />}>
            <Field label="左侧区域">
              <div className="space-y-1">
                {leftChildren.map((id: string, idx: number) =>
                  renderLayoutChildItem(id, component.id, 'left', undefined, leftChildren.length, idx)
                )}
                {leftChildren.length === 0 && <div className="text-xs text-gray-400 text-center py-1">暂无组件</div>}
                <button
                  className="w-full text-xs text-indigo-600 hover:text-indigo-700 py-1 border border-dashed border-indigo-300 rounded"
                  onClick={() => { setAddingSlot('left'); setAddingTabIndex(null); }}
                >
                  + 添加组件到左侧
                </button>
                {addingSlot === 'left' && (
                  <ComponentSelector
                    onSelect={(type) => {
                      onAddChildToLayout(component.id, type, 'left');
                      setAddingSlot(null);
                    }}
                    onCancel={() => setAddingSlot(null)}
                  />
                )}
              </div>
            </Field>
            <Field label="右侧区域">
              <div className="space-y-1">
                {rightChildren.map((id: string, idx: number) =>
                  renderLayoutChildItem(id, component.id, 'right', undefined, rightChildren.length, idx)
                )}
                {rightChildren.length === 0 && <div className="text-xs text-gray-400 text-center py-1">暂无组件</div>}
                <button
                  className="w-full text-xs text-indigo-600 hover:text-indigo-700 py-1 border border-dashed border-indigo-300 rounded"
                  onClick={() => { setAddingSlot('right'); setAddingTabIndex(null); }}
                >
                  + 添加组件到右侧
                </button>
                {addingSlot === 'right' && (
                  <ComponentSelector
                    onSelect={(type) => {
                      onAddChildToLayout(component.id, type, 'right');
                      setAddingSlot(null);
                    }}
                    onCancel={() => setAddingSlot(null)}
                  />
                )}
              </div>
            </Field>
          </Section>
        );
      }

      case 'section': {
        const children = props.children || [];
        return (
          <Section title="子组件管理" icon={<Settings size={14} />}>
            <Field label="内部组件">
              <div className="space-y-1">
                {children.map((id: string, idx: number) =>
                  renderLayoutChildItem(id, component.id, undefined, undefined, children.length, idx)
                )}
                {children.length === 0 && <div className="text-xs text-gray-400 text-center py-1">暂无组件</div>}
                <button
                  className="w-full text-xs text-indigo-600 hover:text-indigo-700 py-1 border border-dashed border-indigo-300 rounded"
                  onClick={() => { setAddingSlot('section'); setAddingTabIndex(null); }}
                >
                  + 添加组件
                </button>
                {addingSlot === 'section' && (
                  <ComponentSelector
                    onSelect={(type) => {
                      onAddChildToLayout(component.id, type);
                      setAddingSlot(null);
                    }}
                    onCancel={() => setAddingSlot(null)}
                  />
                )}
              </div>
            </Field>
          </Section>
        );
      }

      case 'tab': {
        const tabs = props.tabs || [];
        return (
          <Section title="页签管理" icon={<Settings size={14} />}>
            <Field label="页签列表">
              <div className="space-y-2">
                {tabs.map((tab: any, tabIdx: number) => (
                  <div key={tabIdx} className="border border-gray-200 rounded p-2">
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        className="prop-input flex-1"
                        value={tab.label}
                        placeholder="页签名称"
                        onChange={(e) => {
                          const newTabs = [...tabs];
                          newTabs[tabIdx] = { ...tab, label: e.target.value };
                          updateProp('tabs', newTabs);
                        }}
                      />
                      <button
                        className="px-1.5 py-1 text-red-500 hover:bg-red-50 rounded text-xs"
                        onClick={() => {
                          if (tabs.length <= 1) {
                            alert('至少保留一个页签');
                            return;
                          }
                          if (confirm(`确认删除页签"${tab.label}"？`)) {
                            const newTabs = tabs.filter((_: any, i: number) => i !== tabIdx);
                            updateProp('tabs', newTabs);
                          }
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {(tab.children || []).map((id: string, childIdx: number) =>
                        renderLayoutChildItem(id, component.id, undefined, tabIdx, tab.children.length, childIdx)
                      )}
                      {(!tab.children || tab.children.length === 0) && (
                        <div className="text-xs text-gray-400 text-center py-1">暂无组件</div>
                      )}
                      <button
                        className="w-full text-xs text-indigo-600 hover:text-indigo-700 py-1 border border-dashed border-indigo-300 rounded"
                        onClick={() => { setAddingTabIndex(tabIdx); setAddingSlot(null); }}
                      >
                        + 添加组件
                      </button>
                      {addingTabIndex === tabIdx && (
                        <ComponentSelector
                          onSelect={(type) => {
                            onAddChildToLayout(component.id, type, undefined, tabIdx);
                            setAddingTabIndex(null);
                          }}
                          onCancel={() => setAddingTabIndex(null)}
                        />
                      )}
                    </div>
                  </div>
                ))}
                <button
                  className="w-full text-xs text-indigo-600 hover:text-indigo-700 py-1 border border-dashed border-indigo-300 rounded"
                  onClick={() => {
                    updateProp('tabs', [...tabs, { label: `页签${tabs.length + 1}`, children: [] }]);
                  }}
                >
                  + 添加页签
                </button>
              </div>
            </Field>
          </Section>
        );
      }

      default:
        return null;
    }
  };

  const renderCommonProps = () => (
    <>
      <Section title="基础属性" icon={<Settings size={14} />}>
        <Field label="标签名称">
          <input
            type="text"
            className="prop-input"
            value={props.label || ''}
            onChange={(e) => updateProp('label', e.target.value)}
          />
        </Field>
        <Field label="字段标识">
          <input
            type="text"
            className="prop-input font-mono"
            value={props.fieldName || ''}
            onChange={(e) => updateProp('fieldName', e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">用于数据存储，只能是英文字母、数字、下划线</p>
        </Field>
        <Field label="占位提示">
          <input
            type="text"
            className="prop-input"
            value={props.placeholder || ''}
            onChange={(e) => updateProp('placeholder', e.target.value)}
          />
        </Field>
        <Field label="字段说明">
          <textarea
            className="prop-input min-h-[60px]"
            value={props.description || ''}
            onChange={(e) => updateProp('description', e.target.value)}
          />
        </Field>
      </Section>

      <Section title="显示设置" icon={<Type size={14} />}>
        <Field label="宽度">
          <select
            className="prop-input"
            value={props.width || 'full'}
            onChange={(e) => updateProp('width', e.target.value)}
          >
            <option value="full">全宽</option>
            <option value="half">半宽</option>
            <option value="third">三分之一宽</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-2">
          <CheckboxField
            label="必填"
            checked={props.required || false}
            onChange={(v) => updateProp('required', v)}
          />
          <CheckboxField
            label="禁用"
            checked={props.disabled || false}
            onChange={(v) => updateProp('disabled', v)}
          />
        </div>
        {props.required && (
          <Field label="必填提示">
            <input
              type="text"
              className="prop-input"
              value={props.requiredMessage || ''}
              onChange={(e) => updateProp('requiredMessage', e.target.value)}
              placeholder="请填写此字段"
            />
          </Field>
        )}
      </Section>

      {/* 数据源映射 - 仅对字段类型组件显示 */}
      {isFieldComponent(component.type) && (
        <Section title="数据源映射" icon={<Database size={14} />}>
          <DataSourceMappingConfig
            componentId={component.id}
            componentFieldName={props.fieldName || ''}
            mappings={dataSourceMappings.filter(m => m.componentId === component.id)}
            onUpdate={(newMapping) => {
              if (!onUpdateDataSourceMappings) return;
              const otherMappings = dataSourceMappings.filter(m => m.componentId !== component.id);
              if (newMapping) {
                onUpdateDataSourceMappings([...otherMappings, newMapping]);
              } else {
                onUpdateDataSourceMappings(otherMappings);
              }
            }}
          />
        </Section>
      )}
    </>
  );

  const renderTypeSpecificProps = () => {
    switch (component.type) {
      case 'heading':
        return (
          <Section title="标题设置" icon={<Type size={14} />}>
            <Field label="标题级别">
              <select
                className="prop-input"
                value={props.level || 2}
                onChange={(e) => updateProp('level', parseInt(e.target.value))}
              >
                <option value={1}>一级标题</option>
                <option value={2}>二级标题</option>
                <option value={3}>三级标题</option>
              </select>
            </Field>
            <Field label="标题内容">
              <input
                type="text"
                className="prop-input"
                value={props.content || ''}
                onChange={(e) => updateProp('content', e.target.value)}
              />
            </Field>
          </Section>
        );

      case 'paragraph':
      case 'liquidatedDamages':
        return (
          <Section title="文本设置" icon={<FileText size={14} />}>
            <Field label="段落内容">
              <textarea
                className="prop-input min-h-[100px]"
                value={props.content || ''}
                onChange={(e) => updateProp('content', e.target.value)}
              />
            </Field>
          </Section>
        );

      case 'number':
        return (
          <Section title="数字设置" icon={<Hash size={14} />}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="最小值">
                <input
                  type="number"
                  className="prop-input"
                  value={props.min ?? ''}
                  onChange={(e) => updateProp('min', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </Field>
              <Field label="最大值">
                <input
                  type="number"
                  className="prop-input"
                  value={props.max ?? ''}
                  onChange={(e) => updateProp('max', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="小数位数">
                <input
                  type="number"
                  className="prop-input"
                  min="0"
                  max="6"
                  value={props.decimal ?? 2}
                  onChange={(e) => updateProp('decimal', parseInt(e.target.value))}
                />
              </Field>
              <Field label="单位">
                <input
                  type="text"
                  className="prop-input"
                  value={props.unit || ''}
                  onChange={(e) => updateProp('unit', e.target.value)}
                />
              </Field>
            </div>
            <Field label="显示格式">
              <select
                className="prop-input"
                value={props.format || 'number'}
                onChange={(e) => updateProp('format', e.target.value)}
              >
                <option value="number">普通数字</option>
                <option value="currency">货币</option>
                <option value="percent">百分比</option>
              </select>
            </Field>
            <CheckboxField
              label="允许负数"
              checked={props.allowNegative || false}
              onChange={(v) => updateProp('allowNegative', v)}
            />
          </Section>
        );

      case 'date':
      case 'signDate':
        return (
          <Section title="日期设置" icon={<Calendar size={14} />}>
            <Field label="日期格式">
              <select
                className="prop-input"
                value={props.dateFormat || 'YYYY-MM-DD'}
                onChange={(e) => updateProp('dateFormat', e.target.value)}
              >
                <option value="YYYY-MM-DD">2024-01-01</option>
                <option value="YYYY/MM/DD">2024/01/01</option>
                <option value="YYYY年MM月DD日">2024年01月01日</option>
              </select>
            </Field>
            <CheckboxField
              label="默认当天"
              checked={props.defaultToday || false}
              onChange={(v) => updateProp('defaultToday', v)}
            />
          </Section>
        );

      case 'select':
      case 'radio':
      case 'checkboxGroup':
        return (
          <Section title="选项设置" icon={<Settings size={14} />}>
            <Field label="选项列表">
              <div className="space-y-1">
                {(props.options || []).map((opt: any, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      className="prop-input flex-1"
                      value={opt.label}
                      placeholder="显示文本"
                      onChange={(e) => {
                        const newOptions = [...(props.options || [])];
                        newOptions[idx] = { ...opt, label: e.target.value };
                        updateProp('options', newOptions);
                      }}
                    />
                    <input
                      type="text"
                      className="prop-input w-24"
                      value={opt.value}
                      placeholder="值"
                      onChange={(e) => {
                        const newOptions = [...(props.options || [])];
                        newOptions[idx] = { ...opt, value: e.target.value };
                        updateProp('options', newOptions);
                      }}
                    />
                    <button
                      className="px-2 text-red-500 hover:bg-red-50 rounded"
                      onClick={() => {
                        const newOptions = (props.options || []).filter((_: any, i: number) => i !== idx);
                        updateProp('options', newOptions);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                onClick={() => {
                  const newOptions = [...(props.options || []), { label: '新选项', value: `option${(props.options || []).length + 1}` }];
                  updateProp('options', newOptions);
                }}
              >
                + 添加选项
              </button>
            </Field>
            {component.type === 'select' && (
              <>
                <CheckboxField
                  label="支持多选"
                  checked={props.multiple || false}
                  onChange={(v) => updateProp('multiple', v)}
                />
                <CheckboxField
                  label="可搜索"
                  checked={props.searchable || false}
                  onChange={(v) => updateProp('searchable', v)}
                />
                <CheckboxField
                  label="可清空"
                  checked={props.clearable || false}
                  onChange={(v) => updateProp('clearable', v)}
                />
              </>
            )}
          </Section>
        );

      case 'attachment':
        return (
          <Section title="附件设置" icon={<Paperclip size={14} />}>
            <Field label="允许的文件类型">
              <input
                type="text"
                className="prop-input"
                value={(props.acceptTypes || []).join(', ')}
                placeholder="pdf, doc, xlsx"
                onChange={(e) =>
                  updateProp('acceptTypes', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
                }
              />
              <p className="text-xs text-gray-400 mt-1">用逗号分隔</p>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="单文件大小(MB)">
                <input
                  type="number"
                  className="prop-input"
                  value={props.maxFileSize ?? 10}
                  onChange={(e) => updateProp('maxFileSize', parseFloat(e.target.value))}
                />
              </Field>
              <Field label="最大文件数">
                <input
                  type="number"
                  className="prop-input"
                  value={props.maxFileCount ?? 5}
                  onChange={(e) => updateProp('maxFileCount', parseInt(e.target.value))}
                />
              </Field>
            </div>
          </Section>
        );

      case 'image':
        return (
          <Section title="图片设置" icon={<Image size={14} />}>
            <Field label="最大文件大小(MB)">
              <input
                type="number"
                className="prop-input"
                value={props.maxFileSize ?? 5}
                onChange={(e) => updateProp('maxFileSize', parseFloat(e.target.value))}
              />
            </Field>
            <CheckboxField
              label="允许裁剪"
              checked={props.allowCrop || false}
              onChange={(v) => updateProp('allowCrop', v)}
            />
          </Section>
        );

      case 'signature':
        return (
          <Section title="签字设置" icon={<Settings size={14} />}>
            <div className="grid grid-cols-2 gap-2">
              <Field label="笔触颜色">
                <input
                  type="color"
                  className="prop-input h-8"
                  value={props.penColor || '#000000'}
                  onChange={(e) => updateProp('penColor', e.target.value)}
                />
              </Field>
              <Field label="笔触粗细">
                <input
                  type="number"
                  className="prop-input"
                  min="1"
                  max="10"
                  value={props.penWidth ?? 2}
                  onChange={(e) => updateProp('penWidth', parseInt(e.target.value))}
                />
              </Field>
            </div>
            <CheckboxField
              label="允许清除"
              checked={props.allowClear !== false}
              onChange={(v) => updateProp('allowClear', v)}
            />
          </Section>
        );

      case 'table':
        return (
          <Section title="表格设置" icon={<Hash size={14} />}>
            <Field label="表格列">
              <div className="space-y-1">
                {(props.columns || []).map((col: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="prop-input flex-1"
                      value={col.title}
                      placeholder="列名"
                      onChange={(e) => {
                        const newCols = [...(props.columns || [])];
                        newCols[idx] = { ...col, title: e.target.value };
                        updateProp('columns', newCols);
                      }}
                    />
                    <select
                      className="prop-input w-20"
                      value={col.type}
                      onChange={(e) => {
                        const newCols = [...(props.columns || [])];
                        newCols[idx] = { ...col, type: e.target.value };
                        updateProp('columns', newCols);
                      }}
                    >
                      <option value="text">文本</option>
                      <option value="number">数字</option>
                      <option value="date">日期</option>
                    </select>
                    <button
                      className="px-2 text-red-500 hover:bg-red-50 rounded"
                      onClick={() => {
                        const newCols = (props.columns || []).filter((_: any, i: number) => i !== idx);
                        updateProp('columns', newCols);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                onClick={() => {
                  const newCols = [
                    ...(props.columns || []),
                    { key: `col_${Date.now()}`, title: '新列', type: 'text', required: false },
                  ];
                  updateProp('columns', newCols);
                }}
              >
                + 添加列
              </button>
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="最少行数">
                <input
                  type="number"
                  className="prop-input"
                  min="1"
                  value={props.minRows ?? 1}
                  onChange={(e) => updateProp('minRows', parseInt(e.target.value))}
                />
              </Field>
              <Field label="最多行数">
                <input
                  type="number"
                  className="prop-input"
                  value={props.maxRows ?? ''}
                  placeholder="不限制"
                  onChange={(e) =>
                    updateProp('maxRows', e.target.value === '' ? undefined : parseInt(e.target.value))
                  }
                />
              </Field>
            </div>
            <Field label="汇总列（选填）">
              <select
                className="prop-input"
                value={props.sumColumn || ''}
                onChange={(e) => updateProp('sumColumn', e.target.value)}
              >
                <option value="">不汇总</option>
                {(props.columns || [])
                  .filter((c: any) => c.type === 'number')
                  .map((c: any) => (
                    <option key={c.key} value={c.key}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </Field>
          </Section>
        );

      case 'alert':
        return (
          <Section title="提示框设置" icon={<FileText size={14} />}>
            <Field label="提示类型">
              <select
                className="prop-input"
                value={props.alertType || 'info'}
                onChange={(e) => updateProp('alertType', e.target.value)}
              >
                <option value="info">信息</option>
                <option value="warning">警告</option>
                <option value="success">成功</option>
                <option value="error">错误</option>
              </select>
            </Field>
            <Field label="提示内容">
              <textarea
                className="prop-input min-h-[60px]"
                value={props.content || ''}
                onChange={(e) => updateProp('content', e.target.value)}
              />
            </Field>
          </Section>
        );

      case 'partyA':
      case 'partyB':
        return (
          <Section title={`${props.partyRole || '甲方'}信息设置`} icon={<Settings size={14} />}>
            <CheckboxField
              label="显示联系字段"
              checked={props.contactFields !== false}
              onChange={(v) => updateProp('contactFields', v)}
            />
          </Section>
        );

      case 'contractAmount':
        return (
          <Section title="金额设置" icon={<Hash size={14} />}>
            <CheckboxField
              label="显示大写金额"
              checked={props.amountInWords !== false}
              onChange={(v) => updateProp('amountInWords', v)}
            />
          </Section>
        );

      case 'col2':
        return (
          <>
            <Section title="布局设置" icon={<Type size={14} />}>
              <Field label="左列宽度">
                <select
                  className="prop-input"
                  value={props.leftWidth || '50%'}
                  onChange={(e) => {
                    const left = e.target.value;
                    const right = left === '33%' ? '67%' : left === '67%' ? '33%' : '50%';
                    updateProp('leftWidth', left);
                    updateProp('rightWidth', right);
                  }}
                >
                  <option value="33%">33%</option>
                  <option value="50%">50%</option>
                  <option value="67%">67%</option>
                </select>
              </Field>
              <Field label="间距">
                <select
                  className="prop-input"
                  value={props.gap || '16px'}
                  onChange={(e) => updateProp('gap', e.target.value)}
                >
                  <option value="8px">小 (8px)</option>
                  <option value="16px">中 (16px)</option>
                  <option value="24px">大 (24px)</option>
                </select>
              </Field>
            </Section>
            {renderLayoutChildrenManager()}
          </>
        );

      case 'section':
        return (
          <>
            <Section title="布局设置" icon={<Type size={14} />}>
              <Field label="章节标题">
                <input
                  type="text"
                  className="prop-input"
                  value={props.title || ''}
                  onChange={(e) => updateProp('title', e.target.value)}
                />
              </Field>
            </Section>
            {renderLayoutChildrenManager()}
          </>
        );

      case 'tab':
        return (
          <>
            <Section title="布局设置" icon={<Type size={14} />}>
              <Field label="默认激活页签">
                <select
                  className="prop-input"
                  value={props.activeTab || 0}
                  onChange={(e) => updateProp('activeTab', parseInt(e.target.value))}
                >
                  {(props.tabs || []).map((tab: any, idx: number) => (
                    <option key={idx} value={idx}>{tab.label || `页签${idx + 1}`}</option>
                  ))}
                </select>
              </Field>
            </Section>
            {renderLayoutChildrenManager()}
          </>
        );

      case 'paymentTerms':
        return (
          <Section title="付款条件设置" icon={<Settings size={14} />}>
            <Field label="付款节点">
              <div className="space-y-1">
                {(props.paymentNodes || []).map((node: any, idx: number) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      className="prop-input flex-1"
                      value={node.label}
                      placeholder="节点名称"
                      onChange={(e) => {
                        const newNodes = [...(props.paymentNodes || [])];
                        newNodes[idx] = { ...node, label: e.target.value };
                        updateProp('paymentNodes', newNodes);
                      }}
                    />
                    <input
                      type="number"
                      className="prop-input w-16"
                      value={node.ratio}
                      placeholder="%"
                      onChange={(e) => {
                        const newNodes = [...(props.paymentNodes || [])];
                        newNodes[idx] = { ...node, ratio: parseFloat(e.target.value) };
                        updateProp('paymentNodes', newNodes);
                      }}
                    />
                    <button
                      className="px-2 text-red-500 hover:bg-red-50 rounded"
                      onClick={() => {
                        const newNodes = (props.paymentNodes || []).filter((_: any, i: number) => i !== idx);
                        updateProp('paymentNodes', newNodes);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                className="text-sm text-indigo-600 hover:text-indigo-700 mt-1"
                onClick={() => {
                  const newNodes = [
                    ...(props.paymentNodes || []),
                    { label: '新节点', ratio: 0 },
                  ];
                  updateProp('paymentNodes', newNodes);
                }}
              >
                + 添加节点
              </button>
            </Field>
          </Section>
        );

      case 'disputeResolution':
        return (
          <Section title="争议解决设置" icon={<Settings size={14} />}>
            <Field label="解决方式">
              <select
                className="prop-input"
                value={props.disputeType || 'litigation'}
                onChange={(e) => updateProp('disputeType', e.target.value)}
              >
                <option value="litigation">诉讼</option>
                <option value="arbitration">仲裁</option>
              </select>
            </Field>
          </Section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">属性配置</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          组件类型：{meta?.label || component.type}
        </p>
      </div>
      <div className="p-3 space-y-4">
        {renderCommonProps()}
        {renderTypeSpecificProps()}
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
        {icon}
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-xs text-gray-700">{label}</span>
    </label>
  );
}

function ComponentSelector({
  onSelect,
  onCancel,
}: {
  onSelect: (type: ComponentType) => void;
  onCancel: () => void;
}) {
  const basicComponents = componentLibrary.filter((c) => c.category === 'basic');
  const advancedComponents = componentLibrary.filter((c) => c.category === 'advanced');
  const contractComponents = componentLibrary.filter((c) => c.category === 'contract');

  return (
    <div className="border border-gray-200 rounded p-2 bg-white max-h-48 overflow-y-auto">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-gray-600">选择组件类型</span>
        <button className="text-gray-400 hover:text-gray-600" onClick={onCancel}>×</button>
      </div>
      {basicComponents.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-gray-400 mb-1">基础组件</div>
          <div className="grid grid-cols-2 gap-1">
            {basicComponents.map((c) => (
              <button
                key={c.type}
                className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-indigo-50 hover:text-indigo-600 text-left"
                onClick={() => onSelect(c.type)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {advancedComponents.length > 0 && (
        <div className="mb-2">
          <div className="text-[10px] text-gray-400 mb-1">高级组件</div>
          <div className="grid grid-cols-2 gap-1">
            {advancedComponents.map((c) => (
              <button
                key={c.type}
                className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-indigo-50 hover:text-indigo-600 text-left"
                onClick={() => onSelect(c.type)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {contractComponents.length > 0 && (
        <div>
          <div className="text-[10px] text-gray-400 mb-1">合同专属</div>
          <div className="grid grid-cols-2 gap-1">
            {contractComponents.map((c) => (
              <button
                key={c.type}
                className="text-xs px-2 py-1 border border-gray-200 rounded hover:bg-indigo-50 hover:text-indigo-600 text-left"
                onClick={() => onSelect(c.type)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 判断是否是字段类型组件（有fieldName的组件）
function isFieldComponent(type: ComponentType): boolean {
  const fieldTypes: ComponentType[] = [
    'text', 'textarea', 'number', 'date', 'select', 'checkbox', 'radio', 'checkboxGroup',
    'attachment', 'image', 'signature', 'stamp', 'table',
    'contractNo', 'signDate', 'partyA', 'partyB', 'contractAmount',
    'contractPeriod', 'paymentTerms', 'liquidatedDamages', 'disputeResolution', 'signArea',
  ];
  return fieldTypes.includes(type);
}

// 数据源映射配置子组件
interface DataSourceMappingConfigProps {
  componentId: string;
  componentFieldName: string;
  mappings: DataSourceMapping[];
  onUpdate: (mapping: DataSourceMapping | null) => void;
}

function DataSourceMappingConfig({ componentId, componentFieldName, mappings, onUpdate }: DataSourceMappingConfigProps) {
  const [sourceType, setSourceType] = useState<DataSourceType>('bidding');
  const [sourceField, setSourceField] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

  const existing = mappings[0];

  const getFieldOptions = () => {
    switch (sourceType) {
      case 'bidding': return BIDDING_FIELDS;
      case 'demand': return DEMAND_FIELDS;
      case 'supplier': return SUPPLIER_FIELDS;
      default: return [];
    }
  };

  const handleSave = () => {
    if (!sourceField) {
      alert('请选择数据源字段');
      return;
    }
    const fieldOptions = getFieldOptions();
    const fieldLabel = fieldOptions.find(f => f.key === sourceField)?.label || sourceField;
    
    const mapping: DataSourceMapping = {
      id: existing?.id || 'DSM' + Date.now(),
      componentId,
      dataSource: sourceType,
      sourceField,
      sourceFieldLabel: fieldLabel,
      targetField: componentFieldName,
      defaultValue: defaultValue || undefined,
    };
    onUpdate(mapping);
  };

  const handleRemove = () => {
    onUpdate(null);
    setSourceField('');
    setDefaultValue('');
  };

  const handleEdit = () => {
    if (existing) {
      setSourceType(existing.dataSource);
      setSourceField(existing.sourceField);
      setDefaultValue(existing.defaultValue || '');
    }
  };

  if (existing && !sourceField) {
    // 已配置状态显示
    const dataSourceLabels: Record<DataSourceType, string> = {
      bidding: '采购工单',
      demand: '采购需求',
      supplier: '供应商',
      custom: '自定义',
    };

    return (
      <div className="space-y-2">
        <div className="p-2 border border-green-200 bg-green-50 rounded">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-green-700">
              <Link2 size={10} className="inline mr-1" />已配置数据源
            </span>
          </div>
          <div className="text-xs text-gray-600">
            数据源：{dataSourceLabels[existing.dataSource]}
          </div>
          <div className="text-xs text-gray-600">
            映射字段：{existing.sourceFieldLabel} → {existing.targetField}
          </div>
          <div className="flex gap-2 mt-2">
            <button
              className="text-xs text-indigo-600 hover:text-indigo-700"
              onClick={handleEdit}
            >
              编辑
            </button>
            <button
              className="text-xs text-red-500 hover:text-red-600"
              onClick={handleRemove}
            >
              移除
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fieldOptions = getFieldOptions();

  return (
    <div className="space-y-2">
      <Field label="数据源类型">
        <select
          className="prop-input"
          value={sourceType}
          onChange={(e) => {
            setSourceType(e.target.value as DataSourceType);
            setSourceField('');
          }}
        >
          <option value="bidding">采购工单</option>
          <option value="demand">采购需求</option>
          <option value="supplier">供应商</option>
        </select>
      </Field>
      <Field label="映射字段">
        <select
          className="prop-input"
          value={sourceField}
          onChange={(e) => setSourceField(e.target.value)}
        >
          <option value="">-- 请选择 --</option>
          {fieldOptions.map((f) => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </Field>
      <Field label="默认值（可选）">
        <input
          type="text"
          className="prop-input"
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value)}
          placeholder="数据源无值时使用"
        />
      </Field>
      <button
        className="w-full text-xs text-white bg-indigo-500 hover:bg-indigo-600 py-1.5 rounded"
        onClick={handleSave}
      >
        保存映射
      </button>
      <p className="text-xs text-gray-400">
        当选择数据源后，选择工单/需求单时此字段将自动填入对应数据
      </p>
    </div>
  );
}
