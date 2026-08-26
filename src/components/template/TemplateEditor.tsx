import React, { useState, useCallback, useMemo } from 'react';
import type { TemplateComponent, ComponentType, DataSourceMapping } from '@/types';
import { ComponentLibrary } from './ComponentLibrary';
import { EditorCanvas } from './EditorCanvas';
import { PropertyPanel } from './PropertyPanel';
import {
  Undo2, Redo2, Eye, EyeOff, Save, Download, FileJson,
  ZoomIn, ZoomOut
} from 'lucide-react';
import { createComponent, generateId } from '@/utils/componentConfig';
import { CONTRACT_CATEGORIES } from '@/constants/contractCategories';

interface Props {
  initialComponents?: TemplateComponent[];
  templateName?: string;
  templateCategory?: string;
  initialDataSourceMappings?: DataSourceMapping[];
  onSave: (data: {
    name: string;
    category: string;
    components: TemplateComponent[];
    dataSourceMappings: DataSourceMapping[];
  }) => void;
  onExport?: (format: 'json' | 'html' | 'word' | 'pdf') => void;
}

export function TemplateEditor({
  initialComponents = [],
  templateName = '',
  templateCategory = 'exhibition_service',
  initialDataSourceMappings = [],
  onSave,
  onExport,
}: Props) {
  const [components, setComponents] = useState<TemplateComponent[]>(initialComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [name, setName] = useState(templateName);
  const [category, setCategory] = useState(templateCategory);
  const [dataSourceMappings, setDataSourceMappings] = useState<DataSourceMapping[]>(initialDataSourceMappings);

  const [history, setHistory] = useState<TemplateComponent[][]>([initialComponents]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const isUndoDisabled = historyIndex <= 0;
  const isRedoDisabled = historyIndex >= history.length - 1;

  const pushHistory = useCallback(
    (newComponents: TemplateComponent[]) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newComponents)));
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  const updateComponents = useCallback(
    (newComponents: TemplateComponent[]) => {
      setComponents(newComponents);
      pushHistory(newComponents);
    },
    [pushHistory]
  );

  const handleAdd = useCallback(
    (component: TemplateComponent) => {
      const newComponents = [...components, { ...component, order: components.length }];
      updateComponents(newComponents);
      setSelectedId(component.id);
    },
    [components, updateComponents]
  );

  const handleUpdate = useCallback(
    (id: string, props: Record<string, any>) => {
      const newComponents = components.map((c) =>
        c.id === id ? { ...c, props } : c
      );
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

      let idsToDelete = [id];

      if (component.type === 'col2') {
        const leftChildren = component.props.leftChildren || [];
        const rightChildren = component.props.rightChildren || [];
        idsToDelete = [...idsToDelete, ...leftChildren, ...rightChildren];
      } else if (component.type === 'section') {
        const children = component.props.children || [];
        idsToDelete = [...idsToDelete, ...children];
      } else if (component.type === 'tab') {
        const tabs = component.props.tabs || [];
        const allTabChildren = tabs.flatMap((t: any) => t.children || []);
        idsToDelete = [...idsToDelete, ...allTabChildren];
      }

      idsToDelete = [...new Set(idsToDelete)];

      const newComponents = components.filter((c) => !idsToDelete.includes(c.id));
      updateComponents(newComponents);
      if (selectedId && idsToDelete.includes(selectedId)) setSelectedId(null);
    },
    [components, selectedId, updateComponents]
  );

  const handleMove = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = components.findIndex((c) => c.id === id);
      if (index === -1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= components.length) return;

      const newComponents = [...components];
      [newComponents[index], newComponents[targetIndex]] = [
        newComponents[targetIndex],
        newComponents[index],
      ];
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const component = components.find((c) => c.id === id);
      if (!component) return;

      const oldToNewIds: Record<string, string> = {};

      const deepDuplicate = (comp: TemplateComponent): TemplateComponent => {
        const newId = generateId();
        oldToNewIds[comp.id] = newId;
        return {
          ...JSON.parse(JSON.stringify(comp)),
          id: newId,
          order: components.length,
        };
      };

      const duplicates: TemplateComponent[] = [deepDuplicate(component)];

      if (component.type === 'col2') {
        const allChildren = [...(component.props.leftChildren || []), ...(component.props.rightChildren || [])];
        for (const childId of allChildren) {
          const child = components.find((c) => c.id === childId);
          if (child) duplicates.push(deepDuplicate(child));
        }
        duplicates[0].props.leftChildren = (component.props.leftChildren || []).map((id: string) => oldToNewIds[id]).filter(Boolean);
        duplicates[0].props.rightChildren = (component.props.rightChildren || []).map((id: string) => oldToNewIds[id]).filter(Boolean);
      } else if (component.type === 'section') {
        const children = component.props.children || [];
        for (const childId of children) {
          const child = components.find((c) => c.id === childId);
          if (child) duplicates.push(deepDuplicate(child));
        }
        duplicates[0].props.children = children.map((id: string) => oldToNewIds[id]).filter(Boolean);
      } else if (component.type === 'tab') {
        const tabs = component.props.tabs || [];
        for (const tab of tabs) {
          for (const childId of (tab.children || [])) {
            const child = components.find((c) => c.id === childId);
            if (child) duplicates.push(deepDuplicate(child));
          }
        }
        duplicates[0].props.tabs = tabs.map((tab: any) => ({
          ...tab,
          children: (tab.children || []).map((id: string) => oldToNewIds[id]).filter(Boolean),
        }));
      }

      const newComponents = [...components, ...duplicates];
      updateComponents(newComponents);
      setSelectedId(duplicates[0].id);
    },
    [components, updateComponents]
  );

  const handleLock = useCallback(
    (id: string) => {
      const newComponents = components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, locked: !c.props.locked } } : c
      );
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const newComponents = components.map((c) =>
        c.id === id ? { ...c, props: { ...c.props, visible: c.props.visible === false } } : c
      );
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleAddChildToLayout = useCallback(
    (parentId: string, childType: ComponentType, slot?: string, tabIndex?: number) => {
      const newComponent = createComponent(childType);
      if (!newComponent) return;

      let newComponents = [...components, { ...newComponent, order: components.length }];

      const parentIndex = newComponents.findIndex((c) => c.id === parentId);
      if (parentIndex === -1) return;

      const parent = newComponents[parentIndex];
      const updatedParent = { ...parent, props: { ...parent.props } };

      if (parent.type === 'col2') {
        const targetSlot = slot === 'right' ? 'rightChildren' : 'leftChildren';
        updatedParent.props[targetSlot] = [...(updatedParent.props[targetSlot] || []), newComponent.id];
      } else if (parent.type === 'section') {
        updatedParent.props.children = [...(updatedParent.props.children || []), newComponent.id];
      } else if (parent.type === 'tab') {
        const idx = tabIndex ?? updatedParent.props.activeTab ?? 0;
        const tabs = [...(updatedParent.props.tabs || [])];
        if (tabs[idx]) {
          tabs[idx] = { ...tabs[idx], children: [...(tabs[idx].children || []), newComponent.id] };
          updatedParent.props.tabs = tabs;
        }
      }

      newComponents[parentIndex] = updatedParent;
      updateComponents(newComponents);
      setSelectedId(newComponent.id);
    },
    [components, updateComponents]
  );

  const handleMoveChildWithinLayout = useCallback(
    (parentId: string, childId: string, direction: 'up' | 'down', slot?: string, tabIndex?: number) => {
      const parent = components.find((c) => c.id === parentId);
      if (!parent) return;

      const updatedParent = { ...parent, props: { ...parent.props } };

      let targetArray: string[] = [];
      if (parent.type === 'col2') {
        const key = slot === 'right' ? 'rightChildren' : 'leftChildren';
        targetArray = [...(updatedParent.props[key] || [])];
        const idx = targetArray.indexOf(childId);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= targetArray.length) return;
        [targetArray[idx], targetArray[swapIdx]] = [targetArray[swapIdx], targetArray[idx]];
        updatedParent.props[key] = targetArray;
      } else if (parent.type === 'section') {
        targetArray = [...(updatedParent.props.children || [])];
        const idx = targetArray.indexOf(childId);
        if (idx === -1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= targetArray.length) return;
        [targetArray[idx], targetArray[swapIdx]] = [targetArray[swapIdx], targetArray[idx]];
        updatedParent.props.children = targetArray;
      } else if (parent.type === 'tab') {
        const idx = tabIndex ?? updatedParent.props.activeTab ?? 0;
        const tabs = [...(updatedParent.props.tabs || [])];
        if (tabs[idx]) {
          targetArray = [...(tabs[idx].children || [])];
          const childIdx = targetArray.indexOf(childId);
          if (childIdx === -1) return;
          const swapIdx = direction === 'up' ? childIdx - 1 : childIdx + 1;
          if (swapIdx < 0 || swapIdx >= targetArray.length) return;
          [targetArray[childIdx], targetArray[swapIdx]] = [targetArray[swapIdx], targetArray[childIdx]];
          tabs[idx] = { ...tabs[idx], children: targetArray };
          updatedParent.props.tabs = tabs;
        }
      }

      const newComponents = components.map((c) => c.id === parentId ? updatedParent : c);
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleRemoveChildFromLayout = useCallback(
    (parentId: string, childId: string, slot?: string, tabIndex?: number) => {
      const parent = components.find((c) => c.id === parentId);
      if (!parent) return;

      const updatedParent = { ...parent, props: { ...parent.props } };

      if (parent.type === 'col2') {
        const leftChildren = (updatedParent.props.leftChildren || []).filter((id: string) => id !== childId);
        const rightChildren = (updatedParent.props.rightChildren || []).filter((id: string) => id !== childId);
        updatedParent.props.leftChildren = leftChildren;
        updatedParent.props.rightChildren = rightChildren;
      } else if (parent.type === 'section') {
        updatedParent.props.children = (updatedParent.props.children || []).filter((id: string) => id !== childId);
      } else if (parent.type === 'tab') {
        const idx = tabIndex ?? updatedParent.props.activeTab ?? 0;
        const tabs = [...(updatedParent.props.tabs || [])];
        if (tabs[idx]) {
          tabs[idx] = { ...tabs[idx], children: (tabs[idx].children || []).filter((id: string) => id !== childId) };
          updatedParent.props.tabs = tabs;
        }
      }

      const newComponents = components
        .map((c) => c.id === parentId ? updatedParent : c)
        .filter((c) => c.id !== childId);
      updateComponents(newComponents);
      if (selectedId === childId) setSelectedId(null);
    },
    [components, selectedId, updateComponents]
  );

  const handleMoveChildToLayout = useCallback(
    (sourceId: string, targetParentId: string, slot?: string, tabIndex?: number) => {
      const source = components.find((c) => c.id === sourceId);
      if (!source) return;

      let newComponents = [...components];

      for (let i = 0; i < newComponents.length; i++) {
        const comp = newComponents[i];
        if (comp.type === 'col2') {
          const left = (comp.props.leftChildren || []).filter((id: string) => id !== sourceId);
          const right = (comp.props.rightChildren || []).filter((id: string) => id !== sourceId);
          if (left.length !== (comp.props.leftChildren || []).length || right.length !== (comp.props.rightChildren || []).length) {
            newComponents[i] = { ...comp, props: { ...comp.props, leftChildren: left, rightChildren: right } };
          }
        } else if (comp.type === 'section') {
          const children = (comp.props.children || []).filter((id: string) => id !== sourceId);
          if (children.length !== (comp.props.children || []).length) {
            newComponents[i] = { ...comp, props: { ...comp.props, children } };
          }
        } else if (comp.type === 'tab') {
          let changed = false;
          const tabs = (comp.props.tabs || []).map((tab: any) => {
            const filtered = (tab.children || []).filter((id: string) => id !== sourceId);
            if (filtered.length !== (tab.children || []).length) {
              changed = true;
              return { ...tab, children: filtered };
            }
            return tab;
          });
          if (changed) {
            newComponents[i] = { ...comp, props: { ...comp.props, tabs } };
          }
        }
      }

      const targetIndex = newComponents.findIndex((c) => c.id === targetParentId);
      if (targetIndex === -1) return;

      const target = newComponents[targetIndex];
      const updatedTarget = { ...target, props: { ...target.props } };

      if (target.type === 'col2') {
        const key = slot === 'right' ? 'rightChildren' : 'leftChildren';
        updatedTarget.props[key] = [...(updatedTarget.props[key] || []), sourceId];
      } else if (target.type === 'section') {
        updatedTarget.props.children = [...(updatedTarget.props.children || []), sourceId];
      } else if (target.type === 'tab') {
        const idx = tabIndex ?? updatedTarget.props.activeTab ?? 0;
        const tabs = [...(updatedTarget.props.tabs || [])];
        if (tabs[idx]) {
          tabs[idx] = { ...tabs[idx], children: [...(tabs[idx].children || []), sourceId] };
          updatedTarget.props.tabs = tabs;
        }
      }

      newComponents[targetIndex] = updatedTarget;
      updateComponents(newComponents);
    },
    [components, updateComponents]
  );

  const handleUndo = useCallback(() => {
    if (isUndoDisabled) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setComponents(JSON.parse(JSON.stringify(history[newIndex])));
  }, [history, historyIndex, isUndoDisabled]);

  const handleRedo = useCallback(() => {
    if (isRedoDisabled) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setComponents(JSON.parse(JSON.stringify(history[newIndex])));
  }, [history, historyIndex, isRedoDisabled]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      alert('请输入模板名称');
      return;
    }
    onSave({ name, category, components, dataSourceMappings });
  }, [name, category, components, dataSourceMappings, onSave]);

  const handleExport = useCallback(
    (format: 'json' | 'html' | 'word' | 'pdf') => {
      if (onExport) {
        onExport(format);
        return;
      }

      switch (format) {
        case 'json': {
          const data = JSON.stringify({ name, category, components }, null, 2);
          const blob = new Blob([data], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name || 'template'}.json`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }
        case 'html': {
          const html = generateHTML(name, components);
          const blob = new Blob([html], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name || 'template'}.html`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }
        case 'word': {
          const html = generateWordDocument(name, components);
          const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${name || 'template'}.doc`;
          a.click();
          URL.revokeObjectURL(url);
          break;
        }
        case 'pdf': {
          const html = generateHTML(name, components);
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.onload = () => {
              printWindow.print();
            };
          }
          break;
        }
      }
    },
    [name, category, components, onExport]
  );

  const handleZoomIn = () => setZoom((z) => Math.min(z + 10, 150));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  const getAllChildIds = useCallback((comp: TemplateComponent): string[] => {
    if (comp.type === 'col2') {
      return [...(comp.props.leftChildren || []), ...(comp.props.rightChildren || [])];
    } else if (comp.type === 'section') {
      return comp.props.children || [];
    } else if (comp.type === 'tab') {
      return (comp.props.tabs || []).flatMap((t: any) => t.children || []);
    }
    return [];
  }, []);

  const childComponentsMap = useMemo(() => {
    const map: Record<string, TemplateComponent> = {};
    for (const c of components) {
      map[c.id] = c;
    }
    return map;
  }, [components]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* 工具栏 */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            className="px-3 py-1.5 border border-gray-300 rounded text-sm w-48"
            placeholder="模板名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CONTRACT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-1 mr-2">
          <button
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleUndo}
            disabled={isUndoDisabled}
            title="撤销"
          >
            <Undo2 size={16} />
          </button>
          <button
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            onClick={handleRedo}
            disabled={isRedoDisabled}
            title="重做"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="flex items-center gap-1 mr-2">
          <button
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            onClick={handleZoomOut}
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-gray-500 w-10 text-center">{zoom}%</span>
          <button
            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            onClick={handleZoomIn}
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          className={`px-3 py-1.5 rounded text-sm transition-colors ${
            isPreview
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? (
            <span className="flex items-center gap-1">
              <EyeOff size={14} /> 编辑模式
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Eye size={14} /> 预览模式
            </span>
          )}
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1" />

        <div className="flex items-center gap-1">
          <button
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            onClick={() => handleExport('json')}
            title="导出JSON"
          >
            <FileJson size={16} />
          </button>
          <button
            className="px-2 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded text-xs flex items-center gap-1"
            onClick={() => handleExport('html')}
            title="导出HTML"
          >
            <Download size={14} /> HTML
          </button>
          <button
            className="px-2 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded text-xs flex items-center gap-1"
            onClick={() => handleExport('word')}
            title="导出Word"
          >
            <Download size={14} /> Word
          </button>
          <button
            className="px-2 py-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded text-xs flex items-center gap-1"
            onClick={() => handleExport('pdf')}
            title="导出PDF"
          >
            <Download size={14} /> PDF
          </button>
        </div>

        <button
          className="px-4 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 flex items-center gap-1"
          onClick={handleSave}
        >
          <Save size={14} /> 保存模板
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!isPreview && (
          <ComponentLibrary
            onDragStart={() => {}}
            onAddToCanvas={(meta) => {
              const newComponent = createComponent(meta.type);
              if (newComponent) {
                handleAdd(newComponent);
              }
            }}
          />
        )}

        <div className="flex-1 overflow-hidden" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
          <EditorCanvas
            components={components}
            selectedId={selectedId}
            onSelect={handleSelect}
            onAdd={handleAdd}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onMove={handleMove}
            onDuplicate={handleDuplicate}
            onLock={handleLock}
            onToggleVisibility={handleToggleVisibility}
            onAddChildToLayout={handleAddChildToLayout}
            onMoveChildWithinLayout={handleMoveChildWithinLayout}
            onRemoveChildFromLayout={handleRemoveChildFromLayout}
            onMoveChildToLayout={handleMoveChildToLayout}
            getChildById={(id: string) => childComponentsMap[id]}
            getChildIds={getAllChildIds}
            isPreview={isPreview}
          />
        </div>

        {!isPreview && (
          <PropertyPanel
            component={selectedComponent}
            onChange={(props) => selectedComponent && handleUpdate(selectedComponent.id, props)}
            components={components}
            onUpdateComponent={handleUpdate}
            onAddChildToLayout={handleAddChildToLayout}
            onMoveChildWithinLayout={handleMoveChildWithinLayout}
            onRemoveChildFromLayout={handleRemoveChildFromLayout}
            getChildById={(id: string) => childComponentsMap[id]}
            dataSourceMappings={dataSourceMappings}
            onUpdateDataSourceMappings={setDataSourceMappings}
          />
        )}
      </div>
    </div>
  );
}

function generateHTML(name: string, components: TemplateComponent[]): string {
  const styles = `
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    h1 { font-size: 24px; margin-bottom: 20px; }
    h2 { font-size: 20px; margin-bottom: 16px; }
    h3 { font-size: 16px; margin-bottom: 12px; }
    p { margin-bottom: 12px; }
    .form-group { margin-bottom: 16px; }
    .form-label { display: block; margin-bottom: 4px; font-weight: 500; }
    .form-input { width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px; }
    .form-input[readonly] { background: #f9fafb; }
    .divider { border-top: 1px dashed #d1d5db; margin: 24px 0; }
    .alert { padding: 12px 16px; border-left: 4px solid; margin-bottom: 16px; }
    .alert-info { background: #eff6ff; border-color: #3b82f6; color: #1e40af; }
    .alert-warning { background: #fef3c7; border-color: #f59e0b; color: #92400e; }
    .sign-area { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 32px; border-top: 1px solid #e5e7eb; }
    .sign-area > div { text-align: center; }
    .party-info { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
    .amount-box { background: #f0f9ff; border: 2px solid #818cf8; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 16px; }
    .amount { font-size: 32px; font-weight: bold; color: #4f46e5; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
    .table th, .table td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
    .table th { background: #f3f4f6; }
    .col2-layout { display: flex; gap: 16px; margin-bottom: 16px; }
    .col2-layout > div { flex: 1; }
    .section-box { border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
    .section-header { background: #f3f4f6; padding: 8px 16px; font-weight: 600; }
    .section-content { padding: 16px; }
  `;

  const renderComponent = (comp: TemplateComponent): string => {
    const { type, props } = comp;

    switch (type) {
      case 'heading':
        return `<h${props.level || 2}>${props.content || props.label || ''}</h${props.level || 2}>`;
      case 'paragraph':
      case 'liquidatedDamages':
        return `<p>${props.content || ''}</p>`;
      case 'text':
      case 'contractNo':
        return `<div class="form-group"><label class="form-label">${props.label}</label><input class="form-input" readonly placeholder="${props.placeholder || ''}"/></div>`;
      case 'textarea':
        return `<div class="form-group"><label class="form-label">${props.label}</label><textarea class="form-input" readonly placeholder="${props.placeholder || ''}"></textarea></div>`;
      case 'number':
        return `<div class="form-group"><label class="form-label">${props.label}</label><input class="form-input" type="text" readonly placeholder="${props.placeholder || ''} ${props.unit || ''}"/></div>`;
      case 'date':
      case 'signDate':
        return `<div class="form-group"><label class="form-label">${props.label}</label><input class="form-input" readonly placeholder="____-__-__"/></div>`;
      case 'select':
      case 'radio':
      case 'checkboxGroup':
        return `<div class="form-group"><label class="form-label">${props.label}</label><input class="form-input" readonly placeholder="请选择"/></div>`;
      case 'checkbox':
        return `<div class="form-group"><label><input type="checkbox" disabled/> ${props.label}</label></div>`;
      case 'attachment':
        return `<div class="form-group"><label class="form-label">${props.label}</label><div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; color: #9ca3af;">请上传附件</div></div>`;
      case 'image':
        return `<div class="form-group"><label class="form-label">${props.label}</label><div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 24px; text-align: center; color: #9ca3af;">请上传图片</div></div>`;
      case 'signature':
        return `<div class="form-group"><label class="form-label">${props.label}</label><div style="border: 2px solid #d1d5db; border-radius: 8px; height: 100px; display: flex; align-items: center; justify-content: center; color: #9ca3af;">请签名</div></div>`;
      case 'stamp':
        return `<div style="display: inline-block; width: 80px; height: 80px; border: 2px solid #dc2626; border-radius: 50%; text-align: center; line-height: 80px; color: #dc2626; font-size: 12px; transform: rotate(-8deg); opacity: 0.6;">${props.label || '盖章处'}</div>`;
      case 'table':
        return renderTableHTML(props);
      case 'divider':
        return '<div class="divider"></div>';
      case 'alert':
        return `<div class="alert alert-${props.alertType || 'info'}">${props.content || ''}</div>`;
      case 'partyA':
      case 'partyB':
        return renderPartyHTML(props);
      case 'contractAmount':
        return `<div class="amount-box"><div class="amount">¥ 0.00</div>${props.amountInWords ? '<div style="margin-top: 8px; color: #6b7280;">（人民币：零元整）</div>' : ''}</div>`;
      case 'contractPeriod':
        return `<div class="form-group"><label class="form-label">${props.label}</label><div style="display: flex; gap: 12px;"><input class="form-input" readonly placeholder="开始日期" style="flex: 1;"/><span style="align-self: center;">至</span><input class="form-input" readonly placeholder="结束日期" style="flex: 1;"/></div></div>`;
      case 'paymentTerms':
        return renderPaymentTermsHTML(props);
      case 'disputeResolution':
        return `<div class="form-group"><label class="form-label">${props.label}</label><p>${props.disputeType === 'arbitration' ? '提交仲裁委员会仲裁。' : '向有管辖权的人民法院提起诉讼。'}</p></div>`;
      case 'signArea':
        return `
          <div class="sign-area">
            <div>
              <p style="margin-bottom: 16px;">甲方（盖章）：</p>
              <div style="border-bottom: 1px solid #d1d5db; height: 60px; display: flex; align-items: flex-end; justify-content: center; color: #9ca3af; padding-bottom: 8px;">（盖章处）</div>
              <p style="margin-top: 16px;">日期：______________</p>
            </div>
            <div>
              <p style="margin-bottom: 16px;">乙方（盖章）：</p>
              <div style="border-bottom: 1px solid #d1d5db; height: 60px; display: flex; align-items: flex-end; justify-content: center; color: #9ca3af; padding-bottom: 8px;">（盖章处）</div>
              <p style="margin-top: 16px;">日期：______________</p>
            </div>
          </div>
        `;
      default:
        return '';
    }
  };

  function renderTableHTML(props: any): string {
    const columns = props.columns || [];
    let rows = '';
    for (let i = 0; i < (props.minRows || 1); i++) {
      const cells = columns.map((col: any) => `<td></td>`).join('');
      rows += `<tr>${cells}</tr>`;
    }
    const headers = columns.map((col: any) => `<th>${col.title}${col.required ? ' *' : ''}</th>`).join('');
    return `<table class="table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  function renderPartyHTML(props: any): string {
    const role = props.partyRole || '甲方';
    let contactFields = '';
    if (props.contactFields !== false) {
      contactFields = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group"><label class="form-label">统一社会信用代码</label><input class="form-input" readonly/></div>
          <div class="form-group"><label class="form-label">地址</label><input class="form-input" readonly/></div>
          <div class="form-group"><label class="form-label">联系人</label><input class="form-input" readonly/></div>
          <div class="form-group"><label class="form-label">联系电话</label><input class="form-input" readonly/></div>
        </div>
      `;
    }
    return `
      <div class="party-info">
        <h3>${role}：</h3>
        <div class="form-group"><label class="form-label">名称 *</label><input class="form-input" readonly placeholder="${role}名称"/></div>
        ${contactFields}
      </div>
    `;
  }

  function renderPaymentTermsHTML(props: any): string {
    const nodes = props.paymentNodes || [];
    const items = nodes.map((node: any) => `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="width: 100px;">${node.label}</span>
        <div style="flex: 1; background: #e5e7eb; border-radius: 999px; height: 8px;">
          <div style="background: #6366f1; height: 8px; border-radius: 999px; width: ${node.ratio}%;"></div>
        </div>
        <span style="width: 50px; text-align: right;">${node.ratio}%</span>
      </div>
    `).join('');
    return `<div class="form-group"><label class="form-label">${props.label || '付款条件'}</label>${items}</div>`;
  }

  const content = components
    .filter((c) => c.props.visible !== false)
    .map(renderComponent)
    .join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${name || '合同模板'}</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;
}

function generateWordDocument(name: string, components: TemplateComponent[]): string {
  const wordStyles = `
    body { font-family: '宋体', SimSun, serif; font-size: 12pt; line-height: 1.8; }
    h1 { font-size: 18pt; text-align: center; margin: 24pt 0 18pt; }
    h2 { font-size: 16pt; margin: 18pt 0 12pt; }
    h3 { font-size: 14pt; margin: 14pt 0 10pt; }
    p { margin: 6pt 0; }
    .form-group { margin: 10pt 0; }
    .form-label { font-weight: bold; margin-bottom: 4pt; display: block; }
    .form-input { border: 1px solid #999; padding: 6pt 10pt; min-height: 24pt; }
    .divider { border-top: 1pt dashed #999; margin: 24pt 0; }
    .alert { padding: 8pt 12pt; border: 1pt solid #999; margin: 10pt 0; }
    .sign-area { display: flex; justify-content: space-between; margin-top: 36pt; }
    .sign-area > div { width: 45%; }
    .party-info { border: 1pt solid #999; padding: 12pt; margin: 10pt 0; }
    .amount-box { background: #f0f9ff; border: 2pt solid #818cf8; padding: 20pt; text-align: center; margin: 12pt 0; }
    .amount { font-size: 24pt; font-weight: bold; color: #4f46e5; }
    table { width: 100%; border-collapse: collapse; margin: 10pt 0; }
    table th, table td { border: 1pt solid #999; padding: 6pt 10pt; }
    table th { background: #f0f0f0; }
    .stamp { display: inline-block; width: 80pt; height: 80pt; border: 2pt solid #dc2626; border-radius: 50%; text-align: center; line-height: 80pt; color: #dc2626; font-size: 10pt; transform: rotate(-8deg); opacity: 0.6; }
  `;

  const html = generateHTML(name, components);
  const bodyContent = html.match(/<body[^>]*>([\s\S]*?)<\/body>/)?.[1] || '';
  
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                xmlns:w="urn:schemas-microsoft-com:office:word"
                xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <title>${name || '合同模板'}</title>
  <style>${wordStyles}</style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}
