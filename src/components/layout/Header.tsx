import { Bell, Settings, User, LogOut, BarChart3 } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export function Header({ onNavigate, currentPage }: HeaderProps) {
  const { currentUser, logout } = useUserStore();
  const unresolvedCount = useAlarmStore((state) => state.getUnresolvedCount());
  const pendingWorkOrders = useWorkOrderStore((state) => state.getPendingCount());

  const getRoleText = () => {
    switch (currentUser?.role) {
      case 'worker': return '采油工';
      case 'leader': return '队长';
      case 'manager': return '厂长';
    }
  };

  return (
    <header className="h-16 bg-dark-800/90 backdrop-blur-md border-b border-tech-blue/20 flex items-center justify-between px-6 relative z-50">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-tech-blue to-tech-cyan flex items-center justify-center">
            <BarChart3 size={24} className="text-dark-900" />
          </div>
          <div>
            <h1 className="font-display text-xl text-tech-blue glow-text tracking-wider">
              智慧油田
            </h1>
            <p className="text-xs text-gray-500">采油与管网调度可视化平台</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 ml-6">
          {[
            { id: 'scene', label: '3D场景' },
            { id: 'alarms', label: '报警中心' },
            { id: 'dispatch', label: '调度中心' },
            { id: 'reports', label: '报表中心' },
            { id: 'environment', label: '环保监测' },
            { id: 'forecast', label: '产量预测' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                currentPage === item.id
                  ? 'bg-tech-blue/20 text-tech-blue border border-tech-blue/40'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
          <Bell size={20} className="text-gray-400" />
          {unresolvedCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-status-alarm rounded-full text-xs flex items-center justify-center text-white font-medium">
              {unresolvedCount}
            </span>
          )}
        </button>

        {pendingWorkOrders > 0 && (
          <button className="relative px-3 py-1.5 bg-status-warning/20 border border-status-warning/40 rounded-lg text-status-warning text-sm font-medium hover:bg-status-warning/30 transition-colors">
            待处理工单: {pendingWorkOrders}
          </button>
        )}

        <div className="h-6 w-px bg-gray-700" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-tech-purple to-tech-blue flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{currentUser?.name}</div>
            <div className="text-xs text-gray-500">{getRoleText()}</div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <LogOut size={20} className="text-gray-400" />
        </button>
      </div>
    </header>
  );
}
