import { ChevronDown, User, Package } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-[56px] bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-between px-5 shadow-md shadow-slate-200/50 border-b border-slate-100 z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
            <Package size={18} />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              长沙国际会展
            </span>
            <span className="text-xs text-slate-500 font-medium">仓库管理系统</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-all duration-200 group border border-transparent hover:border-slate-200">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            <User size={14} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-700">会展系统管理员</span>
            <span className="text-[11px] text-slate-400">管理员</span>
          </div>
          <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
