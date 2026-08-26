import React, { useState, useRef } from 'react';
import type { TemplateComponent, ComponentType } from '@/types';
import { GripVertical, Trash2, Copy, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Plus, X } from 'lucide-react';
import { createComponent } from '@/utils/componentConfig';

interface Props {
  components: TemplateComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (component: TemplateComponent) => void;
  onUpdate: (id: string, props: Record<string, any>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onDuplicate: (id: string) => void;
  onLock: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAddChildToLayout: (parentId: string, childType: ComponentType, slot?: string, tabIndex?: number) => void;
  onMoveChildWithinLayout: (parentId: string, childId: string, direction: 'up' | 'down', slot?: string, tabIndex?: number) => void;
  onRemoveChildFromLayout: (parentId: string, childId: string, slot?: string, tabIndex?: number) => void;
  onMoveChildToLayout: (sourceId: string, targetParentId: string, slot?: string, tabIndex?: number) => void;
  getChildById: (id: string) => TemplateComponent | undefined;
  getChildIds: (comp: TemplateComponent) => string[];
  isPreview?: boolean;
}

export function EditorCanvas({
  components,
  selectedId,
  onSelect,
  onAdd,
  onUpdate,
  onDelete,
  onMove,
  onDuplicate,
  onLock,
  onToggleVisibility,
  onAddChildToLayout,
  onMoveChildWithinLayout,
  onRemoveChildFromLayout,
  onMoveChildToLayout,
  getChildById,
  getChildIds,
  isPreview = false,
}: Props) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverLayout, setDragOverLayout] = useState<{ parentId: string; slot?: string; tabIndex?: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isPreview) return;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOverComponent = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
    setDragOverLayout(null);
  };

  const handleDragOverLayout = (e: React.DragEvent, parentId: string, slot?: string, tabIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLayout({ parentId, slot, tabIndex });
    setDragOverIndex(null);
  };

  const handleDropOnLayout = (e: React.DragEvent, parentId: string, slot?: string, tabIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLayout(null);
    setDragOverIndex(null);

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (componentType) {
      onAddChildToLayout(parentId, componentType, slot, tabIndex);
      setDraggedId(null);
      return;
    }

    const draggedCompId = e.dataTransfer.getData('text/plain');
    if (draggedCompId) {
      const sourceComp = getChildById(draggedCompId) || components.find((c) => c.id === draggedCompId);
      if (!sourceComp) {
        setDraggedId(null);
        return;
      }

      const targetParent = components.find((c) => c.id === parentId);
      if (targetParent && draggedCompId !== parentId) {
        const childIds = getChildIds(targetParent);
        if (!childIds.includes(draggedCompId)) {
          onMoveChildToLayout(draggedCompId, parentId, slot, tabIndex);
        }
      }
      setDraggedId(null);
    }
  };

  const handleDropRoot = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
    setDragOverLayout(null);

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (componentType) {
      const newComponent = createComponent(componentType);
      if (newComponent) {
        onAdd(newComponent);
      }
      setDraggedId(null);
      return;
    }

    const draggedCompId = e.dataTransfer.getData('text/plain');
    if (draggedCompId) {
      const currentIndex = components.findIndex((c) => c.id === draggedCompId);
      if (currentIndex === -1 || currentIndex === index) {
        setDraggedId(null);
        return;
      }

      const newComponents = [...components];
      const [moved] = newComponents.splice(currentIndex, 1);
      const insertIndex = currentIndex < index ? index - 1 : index;
      newComponents.splice(insertIndex, 0, moved);

      components.forEach((c, i) => {
        if (c.id !== newComponents[i].id) {
          onUpdate(c.id, { ...c.props });
        }
      });

      setDraggedId(null);
    }
  };

  const handleDropOnCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(components.length);
    setDragOverLayout(null);

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    if (componentType) {
      const newComponent = createComponent(componentType);
      if (newComponent) {
        onAdd(newComponent);
      }
    }
  };

  const renderChildComponent = (childId: string) => {
    const child = getChildById(childId);
    if (!child) return null;

    return (
      <div
        key={child.id}
        className={`relative bg-white rounded-lg border transition-all ${
          selectedId === child.id
            ? 'border-indigo-500 shadow-md'
            : 'border-transparent hover:border-gray-300'
        } ${child.props.locked ? 'opacity-70' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(child.id);
        }}
      >
        {child.props.visible === false ? (
          <div className="p-3 text-center text-gray-400 text-xs bg-gray-50 rounded">
            <EyeOff size={12} className="inline mr-1" /> 已隐藏
          </div>
        ) : (
          <div className="p-3">
            <InlineRenderer component={child} isEditing={true} components={components} getChildById={getChildById} onSelect={onSelect} />
          </div>
        )}
      </div>
    );
  };

  const renderCol2Component = (comp: TemplateComponent, index: number) => {
    const leftChildren = comp.props.leftChildren || [];
    const rightChildren = comp.props.rightChildren || [];
    const isOverLeft = dragOverLayout?.parentId === comp.id && dragOverLayout?.slot !== 'right';
    const isOverRight = dragOverLayout?.parentId === comp.id && dragOverLayout?.slot === 'right';

    return (
      <div
        key={comp.id}
        className={`relative bg-white rounded-lg border-2 transition-all ${
          selectedId === comp.id
            ? 'border-indigo-500 shadow-lg'
            : 'border-dashed border-indigo-300 hover:border-indigo-400'
        } ${comp.props.locked ? 'opacity-70' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(comp.id);
        }}
      >
        {selectedId === comp.id && !isPreview && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center gap-0.5 bg-indigo-600 rounded shadow-lg z-10">
            <button
              className="p-1 text-white hover:bg-indigo-700 rounded-l"
              onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'up'); }}
              title="上移"
            >
              <ArrowUp size={12} />
            </button>
            <button
              className="p-1 text-white hover:bg-indigo-700"
              onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'down'); }}
              title="下移"
            >
              <ArrowDown size={12} />
            </button>
            <button
              className="p-1 text-white hover:bg-indigo-700"
              onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }}
              title="复制"
            >
              <Copy size={12} />
            </button>
            <button
              className="p-1 text-white hover:bg-indigo-700"
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(comp.id); }}
              title={comp.props.visible === false ? '显示' : '隐藏'}
            >
              {comp.props.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button
              className="p-1 text-white hover:bg-indigo-700"
              onClick={(e) => { e.stopPropagation(); onLock(comp.id); }}
              title={comp.props.locked ? '解锁' : '锁定'}
            >
              {comp.props.locked ? <Unlock size={12} /> : <Lock size={12} />}
            </button>
            <button
              className="p-1 text-white hover:bg-red-500 rounded-r"
              onClick={(e) => { e.stopPropagation(); if (confirm('确认删除此布局组件及其所有子组件？')) onDelete(comp.id); }}
              title="删除"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}

        <div className="p-2">
          <div className="flex gap-4">
            <div
              className={`flex-1 min-h-[80px] rounded-lg transition-all ${
                isOverLeft ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'bg-gray-50/50'
              }`}
              onDragOver={(e) => handleDragOverLayout(e, comp.id, 'left')}
              onDragLeave={() => setDragOverLayout(null)}
              onDrop={(e) => handleDropOnLayout(e, comp.id, 'left')}
            >
              <div className="px-2 py-1 text-xs text-gray-400 border-b border-dashed border-gray-200 mb-2">左侧区域</div>
              <div className="space-y-1 p-1">
                {leftChildren.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">拖拽组件到此</div>
                )}
                {leftChildren.map((childId: string) => {
                  const child = getChildById(childId);
                  if (!child) return null;
                  return (
                    <div
                      key={childId}
                      draggable={!comp.props.locked}
                      onDragStart={(e) => handleDragStart(e, childId)}
                      className="group relative"
                    >
                      {renderChildWithActions(child, comp.id, 'left', leftChildren, onMoveChildWithinLayout, onRemoveChildFromLayout, onSelect, selectedId, getChildById, components)}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`flex-1 min-h-[80px] rounded-lg transition-all ${
                isOverRight ? 'bg-indigo-50 ring-2 ring-indigo-400' : 'bg-gray-50/50'
              }`}
              onDragOver={(e) => handleDragOverLayout(e, comp.id, 'right')}
              onDragLeave={() => setDragOverLayout(null)}
              onDrop={(e) => handleDropOnLayout(e, comp.id, 'right')}
            >
              <div className="px-2 py-1 text-xs text-gray-400 border-b border-dashed border-gray-200 mb-2">右侧区域</div>
              <div className="space-y-1 p-1">
                {rightChildren.length === 0 && (
                  <div className="text-center text-xs text-gray-400 py-4">拖拽组件到此</div>
                )}
                {rightChildren.map((childId: string) => {
                  const child = getChildById(childId);
                  if (!child) return null;
                  return (
                    <div
                      key={childId}
                      draggable={!comp.props.locked}
                      onDragStart={(e) => handleDragStart(e, childId)}
                      className="group relative"
                    >
                      {renderChildWithActions(child, comp.id, 'right', rightChildren, onMoveChildWithinLayout, onRemoveChildFromLayout, onSelect, selectedId, getChildById, components)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSectionComponent = (comp: TemplateComponent, index: number) => {
    const children = comp.props.children || [];
    const isOver = dragOverLayout?.parentId === comp.id;

    return (
      <div
        key={comp.id}
        className={`relative bg-white rounded-lg border-2 transition-all overflow-hidden ${
          selectedId === comp.id
            ? 'border-indigo-500 shadow-lg'
            : 'border-dashed border-indigo-300 hover:border-indigo-400'
        } ${comp.props.locked ? 'opacity-70' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(comp.id);
        }}
      >
        {selectedId === comp.id && !isPreview && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center gap-0.5 bg-indigo-600 rounded shadow-lg z-10">
            <button className="p-1 text-white hover:bg-indigo-700 rounded-l" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'up'); }} title="上移"><ArrowUp size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'down'); }} title="下移"><ArrowDown size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }} title="复制"><Copy size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onToggleVisibility(comp.id); }} title={comp.props.visible === false ? '显示' : '隐藏'}>
              {comp.props.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onLock(comp.id); }} title={comp.props.locked ? '解锁' : '锁定'}>
              {comp.props.locked ? <Unlock size={12} /> : <Lock size={12} />}
            </button>
            <button className="p-1 text-white hover:bg-red-500 rounded-r" onClick={(e) => { e.stopPropagation(); if (confirm('确认删除此布局组件及其所有子组件？')) onDelete(comp.id); }} title="删除"><Trash2 size={12} /></button>
          </div>
        )}

        <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
          {comp.props.title || '章节'}
        </div>
        <div
          className={`p-3 min-h-[80px] transition-all ${
            isOver ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''
          }`}
          onDragOver={(e) => handleDragOverLayout(e, comp.id)}
          onDragLeave={() => setDragOverLayout(null)}
          onDrop={(e) => handleDropOnLayout(e, comp.id)}
        >
          {children.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-6">拖拽组件到此</div>
          )}
          <div className="space-y-2">
            {children.map((childId: string) => {
              const child = getChildById(childId);
              if (!child) return null;
              return (
                <div
                  key={childId}
                  draggable={!comp.props.locked}
                  onDragStart={(e) => handleDragStart(e, childId)}
                  className="group relative"
                >
                  {renderChildWithActions(child, comp.id, undefined, children, onMoveChildWithinLayout, onRemoveChildFromLayout, onSelect, selectedId, getChildById, components)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTabComponent = (comp: TemplateComponent, index: number) => {
    const tabs = comp.props.tabs || [];
    const activeTab = comp.props.activeTab || 0;
    const isOver = dragOverLayout?.parentId === comp.id;
    const isOverTab = dragOverLayout?.parentId === comp.id && dragOverLayout?.tabIndex === activeTab;

    return (
      <div
        key={comp.id}
        className={`relative bg-white rounded-lg border-2 transition-all ${
          selectedId === comp.id
            ? 'border-indigo-500 shadow-lg'
            : 'border-dashed border-indigo-300 hover:border-indigo-400'
        } ${comp.props.locked ? 'opacity-70' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(comp.id);
        }}
      >
        {selectedId === comp.id && !isPreview && (
          <div className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center gap-0.5 bg-indigo-600 rounded shadow-lg z-10">
            <button className="p-1 text-white hover:bg-indigo-700 rounded-l" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'up'); }} title="上移"><ArrowUp size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'down'); }} title="下移"><ArrowDown size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }} title="复制"><Copy size={12} /></button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onToggleVisibility(comp.id); }} title={comp.props.visible === false ? '显示' : '隐藏'}>
              {comp.props.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
            <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onLock(comp.id); }} title={comp.props.locked ? '解锁' : '锁定'}>
              {comp.props.locked ? <Unlock size={12} /> : <Lock size={12} />}
            </button>
            <button className="p-1 text-white hover:bg-red-500 rounded-r" onClick={(e) => { e.stopPropagation(); if (confirm('确认删除此布局组件及其所有子组件？')) onDelete(comp.id); }} title="删除"><Trash2 size={12} /></button>
          </div>
        )}

        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map((tab: any, tabIdx: number) => (
              <button
                key={tabIdx}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tabIdx
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(comp.id, { ...comp.props, activeTab: tabIdx });
                }}
              >
                {tab.label || `页签${tabIdx + 1}`}
              </button>
            ))}
          </div>
        </div>

        <div
          className={`p-3 min-h-[80px] transition-all ${
            isOverTab ? 'bg-indigo-50 ring-2 ring-indigo-400' : ''
          }`}
          onDragOver={(e) => handleDragOverLayout(e, comp.id, undefined, activeTab)}
          onDragLeave={() => setDragOverLayout(null)}
          onDrop={(e) => handleDropOnLayout(e, comp.id, undefined, activeTab)}
        >
          {tabs[activeTab]?.children?.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-6">拖拽组件到此</div>
          )}
          <div className="space-y-2">
            {(tabs[activeTab]?.children || []).map((childId: string) => {
              const child = getChildById(childId);
              if (!child) return null;
              return (
                <div
                  key={childId}
                  draggable={!comp.props.locked}
                  onDragStart={(e) => handleDragStart(e, childId)}
                  className="group relative"
                >
                  {renderChildWithActions(child, comp.id, undefined, tabs[activeTab]?.children || [], 
                    onMoveChildWithinLayout, onRemoveChildFromLayout, onSelect, selectedId, getChildById, components, activeTab)}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderChildWithActions = (
    child: TemplateComponent,
    parentId: string,
    slot: string | undefined,
    siblings: string[],
    onMoveChild: (parentId: string, childId: string, direction: 'up' | 'down', slot?: string, tabIndex?: number) => void,
    onRemoveChild: (parentId: string, childId: string, slot?: string, tabIndex?: number) => void,
    onSelect: (id: string | null) => void,
    selectedId: string | null,
    getChildById: (id: string) => TemplateComponent | undefined,
    components: TemplateComponent[],
    tabIndex?: number,
  ) => {
    const currentIdx = siblings.indexOf(child.id);
    const canMoveUp = currentIdx > 0;
    const canMoveDown = currentIdx < siblings.length - 1;

    return (
      <div
        className={`relative bg-white rounded-lg border transition-all ${
          selectedId === child.id
            ? 'border-indigo-500 shadow-sm'
            : 'border-transparent hover:border-gray-300'
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(child.id);
        }}
      >
        <div className="absolute -top-1 right-0 flex items-center gap-0.5 bg-indigo-500 rounded shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          {canMoveUp && (
            <button
              className="p-0.5 text-white hover:bg-indigo-600 rounded-l"
              onClick={(e) => { e.stopPropagation(); onMoveChild(parentId, child.id, 'up', slot, tabIndex); }}
              title="上移"
            >
              <ArrowUp size={10} />
            </button>
          )}
          {canMoveDown && (
            <button
              className="p-0.5 text-white hover:bg-indigo-600"
              onClick={(e) => { e.stopPropagation(); onMoveChild(parentId, child.id, 'down', slot, tabIndex); }}
              title="下移"
            >
              <ArrowDown size={10} />
            </button>
          )}
          <button
            className="p-0.5 text-white hover:bg-red-500 rounded-r"
            onClick={(e) => { e.stopPropagation(); onRemoveChild(parentId, child.id, slot, tabIndex); }}
            title="移除"
          >
            <X size={10} />
          </button>
        </div>
        <div className="p-2">
          <InlineRenderer component={child} isEditing={true} components={components} getChildById={getChildById} onSelect={onSelect} />
        </div>
      </div>
    );
  };

  if (isPreview) {
    return (
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-sm min-h-full">
          <h1 className="text-2xl font-bold text-center mb-6">合同预览</h1>
          <div className="space-y-4">
            {components.map((comp) =>
              comp.props.visible === false ? null : (
                <InlineRenderer
                  key={comp.id}
                  component={comp}
                  isEditing={false}
                  components={components}
                  getChildById={getChildById}
                  onSelect={onSelect}
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-y-auto bg-gray-100 p-6"
      onDrop={handleDropOnCanvas}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOverIndex(components.length);
      }}
    >
      <div className="max-w-3xl mx-auto">
        {components.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-white">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-gray-500 text-sm">从左侧拖拽组件到此处开始设计合同模板</p>
          </div>
        )}
        <div className="space-y-2">
          {components.map((comp, index) => (
            <React.Fragment key={comp.id}>
              {dragOverIndex === index && (
                <div className="h-1 bg-indigo-500 rounded mb-2 animate-pulse" />
              )}
              {comp.type === 'col2' ? (
                renderCol2Component(comp, index)
              ) : comp.type === 'section' ? (
                renderSectionComponent(comp, index)
              ) : comp.type === 'tab' ? (
                renderTabComponent(comp, index)
              ) : (
                <div
                  className={`group relative bg-white rounded-lg border-2 transition-all ${
                    selectedId === comp.id
                      ? 'border-indigo-500 shadow-lg'
                      : 'border-transparent hover:border-gray-300 hover:shadow-sm'
                  } ${comp.props.locked ? 'opacity-70' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(comp.id);
                  }}
                  draggable={!comp.props.locked}
                  onDragStart={(e) => handleDragStart(e, comp.id)}
                  onDragOver={(e) => handleDragOverComponent(e, index)}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => handleDropRoot(e, index)}
                >
                  {selectedId === comp.id && (
                    <div className="absolute top-0 right-0 -mt-1 -mr-1 flex items-center gap-0.5 bg-indigo-600 rounded shadow-lg z-10">
                      <button className="p-1 text-white hover:bg-indigo-700 rounded-l" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'up'); }} title="上移"><ArrowUp size={12} /></button>
                      <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onMove(comp.id, 'down'); }} title="下移"><ArrowDown size={12} /></button>
                      <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onDuplicate(comp.id); }} title="复制"><Copy size={12} /></button>
                      <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onToggleVisibility(comp.id); }} title={comp.props.visible === false ? '显示' : '隐藏'}>
                        {comp.props.visible === false ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button className="p-1 text-white hover:bg-indigo-700" onClick={(e) => { e.stopPropagation(); onLock(comp.id); }} title={comp.props.locked ? '解锁' : '锁定'}>
                        {comp.props.locked ? <Unlock size={12} /> : <Lock size={12} />}
                      </button>
                      <button className="p-1 text-white hover:bg-red-500 rounded-r" onClick={(e) => { e.stopPropagation(); if (confirm('确认删除此组件？')) onDelete(comp.id); }} title="删除"><Trash2 size={12} /></button>
                    </div>
                  )}
                  {comp.props.visible === false ? (
                    <div className="p-4 text-center text-gray-400 text-sm bg-gray-50 rounded">
                      <EyeOff size={16} className="inline mr-1" /> 已隐藏
                    </div>
                  ) : (
                    <div className="p-4">
                      <InlineRenderer component={comp} isEditing={true} components={components} getChildById={getChildById} onSelect={onSelect} />
                    </div>
                  )}
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gray-50 rounded-l-lg border-r border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                    <GripVertical size={16} className="text-gray-400" />
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
          {dragOverIndex === components.length && (
            <div className="h-1 bg-indigo-500 rounded mt-2 animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}

function InlineRenderer({
  component,
  isEditing,
  components,
  getChildById,
  onSelect,
}: {
  component: TemplateComponent;
  isEditing: boolean;
  components: TemplateComponent[];
  getChildById: (id: string) => TemplateComponent | undefined;
  onSelect: (id: string | null) => void;
}) {
  const { type, props } = component;

  const renderChild = (childId: string) => {
    const child = getChildById(childId);
    if (!child) return null;
    return <InlineRenderer key={child.id} component={child} isEditing={isEditing} components={components} getChildById={getChildById} onSelect={onSelect} />;
  };

  switch (type) {
    case 'heading': {
      const Tag = `h${props.level || 2}` as keyof JSX.IntrinsicElements;
      return <Tag className="font-bold">{props.content || props.label || '标题'}</Tag>;
    }
    case 'paragraph':
      return <p className="text-gray-700">{props.content || '段落文本'}</p>;
    case 'text':
    case 'contractNo':
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-600">{props.label}:</span>
          <span className="text-gray-400 text-sm">[{props.placeholder || '请输入'}]</span>
        </div>
      );
    case 'textarea':
      return (
        <div>
          <span className="text-sm font-medium text-gray-600 block mb-1">{props.label}:</span>
          <div className="bg-gray-50 rounded p-2 text-gray-400 text-sm min-h-[40px]">[{props.placeholder || '请输入详细内容'}]</div>
        </div>
      );
    case 'number':
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-600">{props.label}:</span>
          <span className="text-gray-400 text-sm">[{props.placeholder || '0.00'}] {props.unit || ''}</span>
        </div>
      );
    case 'date':
    case 'signDate':
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-600">{props.label}:</span>
          <span className="text-gray-400 text-sm">[年-月-日]</span>
        </div>
      );
    case 'select':
      return (
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium text-gray-600">{props.label}:</span>
          <span className="text-gray-400 text-sm">[请选择]</span>
        </div>
      );
    case 'checkbox':
      return (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" disabled className="rounded" />
          <span className="text-gray-600">{props.label}</span>
        </label>
      );
    case 'radio':
    case 'checkboxGroup':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600">{props.label}:</span>
          <div className="text-gray-400 ml-2">[选项1] [选项2] [选项3]</div>
        </div>
      );
    case 'attachment':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
          📎 {props.label} - 点击上传
        </div>
      );
    case 'image':
      return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-sm">
          🖼️ {props.label} - 点击上传
        </div>
      );
    case 'signature':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600">{props.label}:</span>
          <div className="border border-gray-300 rounded h-16 mt-1 bg-gray-50 flex items-center justify-center text-gray-400 text-xs">[请签名]</div>
        </div>
      );
    case 'stamp':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600">{props.label}:</span>
          <div className="inline-block w-16 h-16 border-2 border-red-400 rounded-full text-center leading-16 text-red-400 text-xs transform rotate-[-8deg] opacity-60 mt-1">盖章处</div>
        </div>
      );
    case 'table':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600 block mb-2">{props.label}:</span>
          <div className="border rounded overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-100">
                <tr>
                  {(props.columns || []).map((col: any) => (
                    <th key={col.key} className="px-2 py-1 text-left">{col.title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(1, props.minRows || 1) }).map((_, i) => (
                  <tr key={i} className="border-t">
                    {(props.columns || []).map((col: any) => (
                      <td key={col.key} className="px-2 py-1 text-gray-400">---</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case 'divider':
      return <hr className="border-dashed border-gray-300 my-2" />;
    case 'alert':
      const alertColors: Record<string, string> = {
        info: 'bg-blue-50 border-blue-400 text-blue-700',
        warning: 'bg-amber-50 border-amber-400 text-amber-700',
        success: 'bg-green-50 border-green-400 text-green-700',
        error: 'bg-red-50 border-red-400 text-red-700',
      };
      return (
        <div className={`p-3 border-l-4 rounded text-sm ${alertColors[props.alertType] || alertColors.info}`}>
          {props.content}
        </div>
      );
    case 'partyA':
    case 'partyB':
      return (
        <div className="bg-gray-50 rounded p-3 text-sm">
          <span className="font-semibold">{props.partyRole || '甲方'}信息:</span>
          <div className="text-gray-400 text-xs mt-1">[名称] [地址] [联系人] [电话]</div>
        </div>
      );
    case 'contractAmount':
      return (
        <div className="bg-indigo-50 border border-indigo-200 rounded p-3 text-center">
          <div className="text-2xl font-bold text-indigo-600">¥ [金额]</div>
          {props.amountInWords && <div className="text-xs text-gray-500 mt-1">（人民币：[大写金额]）</div>}
        </div>
      );
    case 'contractPeriod':
      return (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-600">{props.label}:</span>
          <span className="text-gray-400">[开始日期] 至 [结束日期]</span>
        </div>
      );
    case 'paymentTerms':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600 block mb-2">{props.label}:</span>
          <div className="space-y-1">
            {(props.paymentNodes || []).map((node: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="w-20 text-gray-500">{node.label}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${node.ratio}%` }}></div>
                </div>
                <span className="w-10 text-right text-gray-500">{node.ratio}%</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'liquidatedDamages':
      return <p className="text-gray-700 text-sm">{props.content}</p>;
    case 'disputeResolution':
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-600">{props.label}:</span>
          <p className="text-gray-500 text-xs mt-1">
            {props.disputeType === 'arbitration' ? '提交仲裁委员会仲裁。' : '向有管辖权的人民法院提起诉讼。'}
          </p>
        </div>
      );
    case 'signArea':
      return (
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm mb-2">甲方（盖章）:</p>
            <div className="w-24 h-16 border-b border-gray-300"></div>
            <p className="text-xs text-gray-400 mt-1">日期:_____</p>
          </div>
          <div className="text-center">
            <p className="text-sm mb-2">乙方（盖章）:</p>
            <div className="w-24 h-16 border-b border-gray-300"></div>
            <p className="text-xs text-gray-400 mt-1">日期:_____</p>
          </div>
        </div>
      );
    case 'col2': {
      const leftChildren = props.leftChildren || [];
      const rightChildren = props.rightChildren || [];
      const leftWidth = props.leftWidth || '50%';
      const rightWidth = props.rightWidth || '50%';
      const gap = props.gap || '16px';
      return (
        <div className="flex" style={{ gap }}>
          <div style={{ width: leftWidth, minWidth: 0 }}>
            {leftChildren.length === 0 ? (
              <div className="text-xs text-gray-400 p-2 text-center bg-gray-50 rounded">左侧空区域</div>
            ) : (
              <div className="space-y-2">
                {leftChildren.map((childId: string) => renderChild(childId))}
              </div>
            )}
          </div>
          <div style={{ width: rightWidth, minWidth: 0 }}>
            {rightChildren.length === 0 ? (
              <div className="text-xs text-gray-400 p-2 text-center bg-gray-50 rounded">右侧空区域</div>
            ) : (
              <div className="space-y-2">
                {rightChildren.map((childId: string) => renderChild(childId))}
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'section': {
      const children = props.children || [];
      return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">{props.title || '章节'}</div>
          <div className="p-4">
            {children.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">空章节</div>
            ) : (
              <div className="space-y-2">
                {children.map((childId: string) => renderChild(childId))}
              </div>
            )}
          </div>
        </div>
      );
    }
    case 'tab': {
      const tabs = props.tabs || [];
      const activeTab = props.activeTab || 0;
      const activeTabData = tabs[activeTab] || tabs[0];
      return (
        <div>
          <div className="flex border-b border-gray-200 mb-2">
            {tabs.map((tab: any, tabIdx: number) => (
              <button
                key={tabIdx}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === tabIdx
                    ? 'text-indigo-600 border-indigo-600'
                    : 'text-gray-500 border-transparent'
                }`}
              >
                {tab.label || `页签${tabIdx + 1}`}
              </button>
            ))}
          </div>
          <div className="p-3 bg-gray-50/30 rounded">
            {activeTabData?.children?.length === 0 ? (
              <div className="text-xs text-gray-400 text-center py-4">空页签</div>
            ) : (
              <div className="space-y-2">
                {(activeTabData?.children || []).map((childId: string) => renderChild(childId))}
              </div>
            )}
          </div>
        </div>
      );
    }
    default:
      return <span className="text-gray-400 text-sm">未知组件类型: {type}</span>;
  }
}
