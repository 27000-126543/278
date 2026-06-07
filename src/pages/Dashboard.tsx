import { useState, useEffect } from 'react';
import { OilFieldScene } from '@/components/3d/OilFieldScene';
import { OverviewPanel } from '@/components/panels/OverviewPanel';
import { WellDetailPanel } from '@/components/panels/WellDetailPanel';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { AlertTriangle, Bell, X } from 'lucide-react';

export function Dashboard() {
  const { oilWells } = useOilFieldStore();
  const { alarms } = useAlarmStore();
  const [selectedWellId, setSelectedWellId] = useState<string | null>(null);
  const [showAlarmToast, setShowAlarmToast] = useState(false);
  const [latestAlarm, setLatestAlarm] = useState<typeof alarms[0] | null>(null);

  const selectedWell = oilWells.find(w => w.id === selectedWellId) || null;

  useEffect(() => {
    if (alarms.length > 0) {
      const latest = alarms[alarms.length - 1];
      if (latest.status === 'pending') {
        setLatestAlarm(latest);
        setShowAlarmToast(true);
        const timer = setTimeout(() => setShowAlarmToast(false), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [alarms]);

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* 3D场景 */}
      <div className="flex-1 relative">
        <OilFieldScene onWellClick={setSelectedWellId} />
        
        {/* 左下角概览面板 */}
        <div className="absolute left-4 top-4 w-72">
          <OverviewPanel />
        </div>

        {/* 右上角报警提示 */}
        {showAlarmToast && latestAlarm && (
          <div className="absolute top-4 right-4 z-20 max-w-sm">
            <div className="alarm-blink tech-border border-status-alarm/50 p-4 bg-dark-800/95 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-status-alarm/20 rounded-lg shrink-0">
                  <Bell size={20} className="text-status-alarm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-status-alarm font-medium">{latestAlarm.type}</span>
                    <span className="text-gray-500 text-xs">
                      {new Date(latestAlarm.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">{latestAlarm.message}</p>
                  <p className="text-gray-500 text-xs mt-1">位置: {latestAlarm.targetName}</p>
                </div>
                <button
                  onClick={() => setShowAlarmToast(false)}
                  className="text-gray-400 hover:text-white shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 操作提示 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="px-4 py-2 bg-dark-800/80 backdrop-blur-sm rounded-full border border-tech-blue/30 text-gray-400 text-sm">
            点击油井查看详细数据 | 鼠标拖拽旋转场景 | 滚轮缩放
          </div>
        </div>
      </div>

      {/* 右侧详情面板 */}
      {selectedWell && (
        <WellDetailPanel wellId={selectedWell.id} onClose={() => setSelectedWellId(null)} />
      )}
    </div>
  );
}
