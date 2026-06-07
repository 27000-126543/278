import { useState } from 'react';
import { Camera, User, Shield, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import type { UserRole } from '@/types';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const login = useUserStore((state) => state.login);

  const roles = [
    { id: 'worker' as UserRole, name: '采油工', desc: '查看油井数据，接收工单', icon: User },
    { id: 'leader' as UserRole, name: '队长', desc: '管辖区域数据，工单分派', icon: Shield },
    { id: 'manager' as UserRole, name: '厂长', desc: '全油田总览，报表审批', icon: Shield },
  ];

  const handleLogin = () => {
    if (!selectedRole) return;
    setIsScanning(true);
    setTimeout(() => {
      login(selectedRole);
      setIsScanning(false);
      onLogin();
    }, 2000);
  };

  return (
    <div className="w-full h-full grid-bg flex items-center justify-center relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-tech-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tech-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-2 gap-12 items-center px-8">
        {/* 左侧信息 */}
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-5xl text-tech-blue glow-text tracking-wider">
              智慧油田
            </h1>
            <p className="font-display text-2xl text-tech-cyan mt-2">
              采油与管网调度可视化平台
            </p>
          </div>
          <p className="text-gray-400 text-lg leading-relaxed">
            基于3D可视化技术的智能油田生产监控系统，
            集成智能预警、故障诊断、产量预测、环保监测等功能，
            为油田生产管理提供全方位智能化决策支持。
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: '油井监控', value: '8口' },
              { label: '实时更新', value: '3秒' },
              { label: '智能预警', value: '7×24h' },
            ].map((item, i) => (
              <div key={i} className="tech-border p-3 text-center">
                <div className="font-display text-2xl text-tech-blue">{item.value}</div>
                <div className="text-xs text-gray-500 mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧登录框 */}
        <div className="tech-border p-8">
          <h2 className="font-display text-xl text-white mb-6 flex items-center gap-2">
            <Camera className="text-tech-blue" />
            人脸识别登录
          </h2>

          {/* 模拟摄像头区域 */}
          <div className="aspect-video bg-dark-900 rounded-lg border-2 border-dashed border-tech-blue/30 flex items-center justify-center mb-6 relative overflow-hidden">
            {isScanning ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-tech-blue/50 relative">
                  <div className="absolute inset-0 rounded-full border-4 border-tech-blue animate-ping opacity-30" />
                  <div className="absolute inset-4 rounded-full border-2 border-tech-cyan/50" />
                  <Camera className="absolute inset-0 m-auto w-12 h-12 text-tech-blue" />
                </div>
                <p className="text-tech-blue mt-4 text-sm animate-pulse">正在识别中...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-tech-blue/10 flex items-center justify-center mx-auto mb-3">
                  <Camera size={32} className="text-tech-blue/50" />
                </div>
                <p className="text-gray-500 text-sm">请选择角色后点击登录</p>
              </div>
            )}
            {/* 扫描线动画 */}
            {isScanning && (
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-tech-blue to-transparent animate-bounce" />
            )}
          </div>

          {/* 角色选择 */}
          <div className="space-y-3 mb-6">
            <p className="text-gray-400 text-sm">选择登录角色：</p>
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-4 rounded-lg border transition-all flex items-center gap-4 ${
                  selectedRole === role.id
                    ? 'border-tech-blue bg-tech-blue/10 glow-box'
                    : 'border-gray-700 hover:border-gray-600 bg-dark-700/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedRole === role.id ? 'bg-tech-blue/20' : 'bg-gray-700/50'
                }`}>
                  <role.icon size={20} className={selectedRole === role.id ? 'text-tech-blue' : 'text-gray-500'} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-medium ${selectedRole === role.id ? 'text-tech-blue' : 'text-white'}`}>
                    {role.name}
                  </div>
                  <div className="text-xs text-gray-500">{role.desc}</div>
                </div>
                {selectedRole === role.id && (
                  <ChevronRight size={20} className="text-tech-blue" />
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedRole || isScanning}
            className={`w-full py-3 rounded-lg font-medium text-lg transition-all ${
              selectedRole && !isScanning
                ? 'bg-gradient-to-r from-tech-blue to-tech-cyan text-dark-900 hover:shadow-lg hover:shadow-tech-blue/30 active:scale-[0.98]'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isScanning ? '识别中...' : '登录系统'}
          </button>

          <p className="text-center text-gray-600 text-xs mt-4">
            本系统仅供演示使用，模拟人脸识别登录
          </p>
        </div>
      </div>
    </div>
  );
}
