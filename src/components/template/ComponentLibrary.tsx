import React, { useState } from 'react';
import { componentLibrary } from '@/utils/componentConfig';
import type { ComponentMeta, ComponentCategory } from '@/types';
import {
  Type, AlignLeft, TextCursor, FileText, Hash, Calendar, ChevronDown,
  CheckSquare, CircleDot, CheckCircle, Paperclip, Image, Pen, Award,
  Table, Minus, AlertCircle, Columns, LayoutList, Layers,
  FileSignature, CalendarCheck, Building, User, Coins, Clock,
  CreditCard, Shield, Scale, Hand, Box
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Heading: Type,
  AlignLeft,
  TextCursor,
  FileText,
  Hash,
  Calendar,
  ChevronDown,
  CheckSquare,
  CircleDot,
  CheckCircle,
  Paperclip,
  Image,
  Pen,
  Award,
  Table,
  Minus,
  AlertCircle,
  Columns,
  LayoutList,
  Layers,
  FileSignature,
  CalendarCheck,
  Building,
  User,
  Coins,
  Clock,
  CreditCard,
  Shield,
  Scale,
  Hand,
  Box,
};

const iconNameMap: Record<string, string> = {
  Yen: 'Coins',
};

const categoryLabels: Record<ComponentCategory, string> = {
  basic: '基础组件',
  advanced: '高级组件',
  layout: '布局组件',
  contract: '合同专属',
};

const categoryIcons: Record<ComponentCategory, string> = {
  basic: '📝',
  advanced: '⚙️',
  layout: '📐',
  contract: '📄',
};

interface Props {
  onDragStart: (meta: ComponentMeta) => void;
  onAddToCanvas?: (meta: ComponentMeta) => void;
}

export function ComponentLibrary({ onDragStart, onAddToCanvas }: Props) {
  const [expanded, setExpanded] = useState<ComponentCategory[]>(['basic']);

  const toggleCategory = (cat: ComponentCategory) => {
    setExpanded((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  const groupedComponents = (Object.keys(categoryLabels) as ComponentCategory[]).map((cat) => ({
    category: cat,
    components: componentLibrary.filter((c) => c.category === cat),
  }));

  const handleDragStart = (e: React.DragEvent, meta: ComponentMeta) => {
    e.dataTransfer.setData('componentType', meta.type);
    onDragStart(meta);
  };

  return (
    <div className="w-60 bg-white border-r border-gray-200 overflow-y-auto h-full">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">组件库</h3>
        <p className="text-xs text-gray-500 mt-1">拖拽组件到右侧画布</p>
      </div>
      <div className="p-2">
        {groupedComponents.map(({ category, components }) => (
          <div key={category} className="mb-2">
            <button
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="flex items-center gap-2">
                <span>{categoryIcons[category]}</span>
                {categoryLabels[category]}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform ${expanded.includes(category) ? 'rotate-180' : ''}`}
              />
            </button>
            {expanded.includes(category) && (
              <div className="ml-2 space-y-1 mt-1">
                {components.map((comp) => {
                  const iconName = iconNameMap[comp.icon] || comp.icon;
                  const Icon = iconMap[iconName] || Type;
                  return (
                    <div
                      key={comp.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, comp)}
                      onClick={() => onAddToCanvas && onAddToCanvas(comp)}
                      className="flex items-center gap-2 px-2 py-2 text-xs text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 rounded cursor-grab active:cursor-grabbing transition-colors group"
                      title={onAddToCanvas ? `${comp.description}（点击添加到画布）` : comp.description}
                    >
                      <Icon size={14} className="text-gray-400 group-hover:text-indigo-500" />
                      <span>{comp.label}</span>
                      {onAddToCanvas && <span className="ml-auto text-gray-300 group-hover:text-indigo-400 text-[10px]">+</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
