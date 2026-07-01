import { ChevronDown, User } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-[56px] bg-[#1f3a5f] text-white flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#2f54eb] rounded flex items-center justify-center text-sm font-bold">
            仓
          </div>
          <span className="text-base font-semibold">长沙国际会展仓库管理系统</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 cursor-pointer">
          <User size={16} />
          <span>会展系统管理员</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}
