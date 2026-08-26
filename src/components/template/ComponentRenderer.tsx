import React from 'react';
import type { TemplateComponent } from '@/types';

interface Props {
  component: TemplateComponent;
  isEditing?: boolean;
  onChange?: (props: Record<string, any>) => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function ComponentRenderer({ component, isEditing = true, onChange, onSelect, isSelected }: Props) {
  const { type, props } = component;

  const updateProps = (newProps: Record<string, any>) => {
    if (onChange) {
      onChange({ ...props, ...newProps });
    }
  };

  const renderComponent = () => {
    switch (type) {
      case 'heading':
        return renderHeading(props, isEditing);
      case 'paragraph':
        return renderParagraph(props, isEditing);
      case 'text':
        return renderText(props, isEditing, updateProps);
      case 'textarea':
        return renderTextarea(props, isEditing, updateProps);
      case 'number':
        return renderNumber(props, isEditing, updateProps);
      case 'date':
        return renderDate(props, isEditing, updateProps);
      case 'select':
        return renderSelect(props, isEditing, updateProps);
      case 'checkbox':
        return renderCheckbox(props, isEditing, updateProps);
      case 'radio':
        return renderRadio(props, isEditing, updateProps);
      case 'checkboxGroup':
        return renderCheckboxGroup(props, isEditing, updateProps);
      case 'attachment':
        return renderAttachment(props, isEditing);
      case 'image':
        return renderImage(props, isEditing);
      case 'signature':
        return renderSignature(props, isEditing);
      case 'stamp':
        return renderStamp(props);
      case 'table':
        return renderTable(props, isEditing);
      case 'divider':
        return <div className="border-t-2 border-dashed border-gray-300 my-4" />;
      case 'alert':
        return renderAlert(props, isEditing);
      case 'col2':
        return renderCol2(component, isEditing, onChange);
      case 'section':
        return renderSection(component, isEditing, onChange);
      case 'tab':
        return renderTab(component, isEditing, onChange);
      case 'contractNo':
        return renderText(props, isEditing, updateProps);
      case 'signDate':
        return renderDate(props, isEditing, updateProps);
      case 'partyA':
      case 'partyB':
        return renderParty(props, isEditing, updateProps);
      case 'contractAmount':
        return renderAmount(props, isEditing, updateProps);
      case 'contractPeriod':
        return renderPeriod(props, isEditing, updateProps);
      case 'paymentTerms':
        return renderPaymentTerms(props, isEditing);
      case 'liquidatedDamages':
        return renderParagraph(props, isEditing);
      case 'disputeResolution':
        return renderDispute(props, isEditing, updateProps);
      case 'signArea':
        return renderSignArea(props);
      default:
        return <div>未知组件类型: {type}</div>;
    }
  };

  return (
    <div
      className={`relative group ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect();
      }}
    >
      {renderComponent()}
    </div>
  );
}

function renderHeading(props: any, isEditing: boolean) {
  const { level = 2, content = '标题' } = props;
  const sizes = { 1: 'text-2xl', 2: 'text-xl', 3: 'text-lg' };
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <Tag className={`${sizes[level as 1 | 2 | 3]} font-bold text-gray-800 mb-2`}>
      {isEditing ? (
        <input
          className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 px-1"
          value={content}
          onChange={(e) => {}}
        />
      ) : (
        content
      )}
    </Tag>
  );
}

function renderParagraph(props: any, isEditing: boolean) {
  const { content = '' } = props;
  return (
    <p className="text-gray-700 leading-relaxed mb-2">
      {isEditing ? (
        <textarea
          className="w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 px-1 resize-none"
          value={content}
          onChange={(e) => {}}
          rows={2}
        />
      ) : (
        content
      )}
    </p>
  );
}

function renderText(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className={props.width === 'full' ? 'w-full' : props.width === 'half' ? 'w-1/2 pr-2' : 'w-1/3 pr-2'}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          isEditing ? 'bg-white' : 'bg-gray-50'
        }`}
        placeholder={props.placeholder}
        disabled={!isEditing && props.disabled}
        readOnly={!isEditing && props.readOnly}
      />
      {props.description && <p className="text-xs text-gray-500 mt-1">{props.description}</p>}
    </div>
  );
}

function renderTextarea(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] ${
          isEditing ? 'bg-white' : 'bg-gray-50'
        }`}
        placeholder={props.placeholder}
        disabled={!isEditing && props.disabled}
        readOnly={!isEditing && props.readOnly}
      />
      {props.description && <p className="text-xs text-gray-500 mt-1">{props.description}</p>}
    </div>
  );
}

function renderNumber(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className={props.width === 'full' ? 'w-full' : 'w-1/2 pr-2 mb-2'}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex">
        <input
          type="number"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={props.decimal ? Math.pow(0.1, props.decimal) : 1}
          disabled={!isEditing && props.disabled}
        />
        {props.unit && (
          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600 text-sm">
            {props.unit}
          </span>
        )}
      </div>
    </div>
  );
}

function renderDate(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className={props.width === 'full' ? 'w-full mb-2' : 'w-1/2 pr-2 mb-2'}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type="date"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={!isEditing && props.disabled}
      />
    </div>
  );
}

function renderSelect(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className={props.width === 'full' ? 'w-full mb-2' : 'w-1/2 pr-2 mb-2'}>
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        disabled={!isEditing && props.disabled}
        multiple={props.multiple}
      >
        <option value="">请选择</option>
        {(props.options || []).map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function renderCheckbox(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <label className="flex items-center gap-2 mb-2 cursor-pointer">
      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
      <span className="text-sm text-gray-700">
        {props.label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
  );
}

function renderRadio(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="mb-2">
      {props.label && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {(props.options || []).map((opt: any) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={props.fieldName} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function renderCheckboxGroup(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="mb-2">
      {props.label && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        {(props.options || []).map((opt: any) => (
          <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-gray-700">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function renderAttachment(props: any, isEditing: boolean) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
        <div className="text-gray-400 text-sm">
          <span className="text-lg">📎</span> 点击或拖拽上传文件
        </div>
        <div className="text-xs text-gray-500 mt-1">
          支持 {props.acceptTypes?.join(', ')} 格式，单个文件不超过 {props.maxFileSize}MB，最多 {props.maxFileCount} 个
        </div>
      </div>
    </div>
  );
}

function renderImage(props: any, isEditing: boolean) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
        <div className="text-4xl mb-2">🖼️</div>
        <div className="text-gray-400 text-sm">点击或拖拽上传图片</div>
        <div className="text-xs text-gray-500 mt-1">支持 JPG/PNG 格式，不超过 {props.maxFileSize}MB</div>
      </div>
    </div>
  );
}

function renderSignature(props: any, isEditing: boolean) {
  return (
    <div className="mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{props.label}</label>
      )}
      <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-32 flex items-center justify-center">
        <span className="text-gray-400 text-sm">请在此处签名</span>
      </div>
    </div>
  );
}

function renderStamp(props: any) {
  return (
    <div className="inline-flex items-center justify-center w-20 h-20 border-2 border-red-500 rounded-full text-red-500 text-xs font-bold transform rotate-[-8deg] opacity-60 mb-2">
      {props.label || '盖章处'}
    </div>
  );
}

function renderTable(props: any, isEditing: boolean) {
  const columns = props.columns || [];
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{props.label}</label>
      )}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col: any) => (
                <th key={col.key} className="px-3 py-2 text-left text-sm font-medium text-gray-700 border-b border-gray-200">
                  {col.title}
                  {col.required && <span className="text-red-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: props.minRows || 1 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-100">
                {columns.map((col: any) => (
                  <td key={col.key} className="px-3 py-2">
                    <input
                      type={col.type === 'number' ? 'number' : 'text'}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {props.allowAddRow && (
          <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
            <button className="text-sm text-indigo-600 hover:text-indigo-700">+ 添加行</button>
          </div>
        )}
      </div>
    </div>
  );
}

function renderAlert(props: any, isEditing: boolean) {
  const typeColors: Record<string, string> = {
    info: 'bg-blue-50 border-blue-400 text-blue-700',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-700',
    success: 'bg-green-50 border-green-400 text-green-700',
    error: 'bg-red-50 border-red-400 text-red-700',
  };
  return (
    <div className={`border-l-4 p-4 mb-2 ${typeColors[props.alertType || 'info']}`}>
      <p className="text-sm">{props.content}</p>
    </div>
  );
}

function renderCol2(component: TemplateComponent, isEditing: boolean, onChange?: (p: any) => void) {
  return (
    <div className="flex gap-4 mb-2 border border-dashed border-gray-200 rounded-lg p-3 bg-gray-50/30">
      <div className="flex-1 min-h-[60px] border-r border-dashed border-gray-200 pr-3">
        <span className="text-xs text-gray-400">左侧区域</span>
      </div>
      <div className="flex-1 min-h-[60px]">
        <span className="text-xs text-gray-400">右侧区域</span>
      </div>
    </div>
  );
}

function renderSection(component: TemplateComponent, isEditing: boolean, onChange?: (p: any) => void) {
  const props = component.props;
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">{props.title || '章节'}</div>
      <div className="p-4 min-h-[60px]">
        {props.children?.length ? (
          <div className="space-y-2">
            {props.children.map((childId: string) => (
              <div key={childId} className="text-xs text-gray-400">子组件区域</div>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400">拖拽组件到此</span>
        )}
      </div>
    </div>
  );
}

function renderTab(component: TemplateComponent, isEditing: boolean, onChange?: (p: any) => void) {
  return (
    <div className="mb-2">
      <div className="flex border-b border-gray-200 mb-2">
        <button className="px-4 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">页签1</button>
        <button className="px-4 py-2 text-sm font-medium text-gray-500">页签2</button>
      </div>
      <div className="p-4 bg-gray-50/30 min-h-[60px] rounded">
        <span className="text-xs text-gray-400">拖拽组件到此</span>
      </div>
    </div>
  );
}

function renderParty(props: any, isEditing: boolean, onChange: (p: any) => void) {
  const role = props.partyRole || '甲方';
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-2">
      <div className="font-medium text-gray-800 mb-3">{role}：</div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">名称 *</label>
          <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder={`${role}名称`} />
        </div>
        {props.contactFields && (
          <>
            <div>
              <label className="block text-xs text-gray-600 mb-1">统一社会信用代码</label>
              <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="信用代码" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">地址</label>
              <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="地址" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">联系人</label>
              <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="联系人" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">联系电话</label>
              <input type="text" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" placeholder="联系电话" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function renderAmount(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/30">
        <div className="text-3xl font-bold text-indigo-700 text-center">¥ 0.00</div>
        {props.amountInWords && (
          <div className="text-sm text-gray-600 text-center mt-2">（人民币：零元整）</div>
        )}
      </div>
    </div>
  );
}

function renderPeriod(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {props.label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
        <span className="text-gray-500">至</span>
        <input type="date" className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>
    </div>
  );
}

function renderPaymentTerms(props: any, isEditing: boolean) {
  const nodes = props.paymentNodes || [];
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{props.label}</label>
      )}
      <div className="space-y-2">
        {nodes.map((node: any, idx: number) => (
          <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded px-3 py-2">
            <span className="text-sm text-gray-700">{node.label}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${node.ratio}%` }}></div>
            </div>
            <span className="text-sm font-medium text-gray-700">{node.ratio}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderDispute(props: any, isEditing: boolean, onChange: (p: any) => void) {
  return (
    <div className="w-full mb-2">
      {props.label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{props.label}</label>
      )}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={props.fieldName}
            className="w-4 h-4 text-indigo-600"
            defaultChecked={props.disputeType === 'litigation'}
          />
          <span className="text-sm text-gray-700">向有管辖权的人民法院提起诉讼</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={props.fieldName}
            className="w-4 h-4 text-indigo-600"
            defaultChecked={props.disputeType === 'arbitration'}
          />
          <span className="text-sm text-gray-700">提交仲裁委员会仲裁</span>
        </label>
      </div>
    </div>
  );
}

function renderSignArea(props: any) {
  return (
    <div className="grid grid-cols-2 gap-8 mt-6 pt-6 border-t border-gray-200">
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-4">甲方（盖章）：</div>
        <div className="h-20 border-b border-gray-300 flex items-end justify-center pb-2 text-gray-400 text-sm">
          （盖章处）
        </div>
        <div className="text-sm text-gray-600 mt-4">日期：______________</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-600 mb-4">乙方（盖章）：</div>
        <div className="h-20 border-b border-gray-300 flex items-end justify-center pb-2 text-gray-400 text-sm">
          （盖章处）
        </div>
        <div className="text-sm text-gray-600 mt-4">日期：______________</div>
      </div>
    </div>
  );
}
