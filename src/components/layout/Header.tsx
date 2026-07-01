import { Bell, User, Settings } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-6 shadow-sm shadow-slate-200/30">
      <div className="text-sm text-slate-500 font-medium">
        欢迎使用仓库管理系统
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 relative group">
          <Bell size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full ring-2 ring-white"></span>
        </button>
        <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 group">
          <Settings size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
            <User size={16} className="text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-700">管理员</span>
            <span className="text-[11px] text-slate-400">系统管理员</span>
          </div>
        </div>
      </div>
    </header>
  );
}
