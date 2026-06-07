import { Droplets, Gauge, Activity, AlertTriangle, Clock } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useAlarmStore } from '@/store/useAlarmStore';

export function OverviewPanel() {
  const { oilWells, meteringStations, pipelines, injectionWells } = useOilFieldStore();
  const { alarms } = useAlarmStore();

  const normalWells = oilWells.filter(w => w.status === 'normal').length;
  const alarmWells = oilWells.filter(w => w.status === 'alarm').length;
  const warningWells = oilWells.filter(w => w.status === 'warning').length;
  const totalProduction = oilWells.reduce((sum, w) => sum + w.productionRate, 0);
  const avgWaterCut = oilWells.length > 0 ? oilWells.reduce((sum, w) => sum + w.waterCut, 0) / oilWells.length : 0;
  const avgPumpEfficiency = oilWells.length > 0 ? oilWells.reduce((sum, w) => sum + w.pumpEfficiency, 0) / oilWells.length : 0;
  const criticalAlarms = alarms.filter(a => a.level === 'critical' && a.status !== 'resolved').length;

  return (
    <div className="absolute left-4 top-20 w-72 space-y-4 z-10">
      {/* 生产概览 */}
      <div className="tech-border p-4">
        <h3 className="font-display text-sm text-tech-blue mb-3 flex items-center gap-2">
          <Activity size={16} />
          生产概览
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">总产液量</span>
            <span className="text-status-normal font-display text-lg">
              {totalProduction.toFixed(1)} <span className="text-xs">m³/d</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">平均含水率</span>
            <span className="text-tech-cyan font-display text-lg">
              {avgWaterCut.toFixed(1)} <span className="text-xs">%</span>
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">平均泵效</span>
            <span className={`font-display text-lg ${avgPumpEfficiency < 40 ? 'text-status-warning' : 'text-status-normal'}`}>
              {avgPumpEfficiency.toFixed(1)} <span className="text-xs">%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 设备状态 */}
      <div className="tech-border p-4">
        <h3 className="font-display text-sm text-tech-blue mb-3 flex items-center gap-2">
          <Gauge size={16} />
          设备状态
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-dark-700/50 rounded p-2 text-center">
            <div className="text-2xl font-display text-status-normal">{normalWells}</div>
            <div className="text-xs text-gray-500">正常运行</div>
          </div>
          <div className="bg-dark-700/50 rounded p-2 text-center">
            <div className="text-2xl font-display text-status-warning">{warningWells}</div>
            <div className="text-xs text-gray-500">预警</div>
          </div>
          <div className="bg-dark-700/50 rounded p-2 text-center">
            <div className="text-2xl font-display text-status-alarm">{alarmWells}</div>
            <div className="text-xs text-gray-500">报警</div>
          </div>
          <div className="bg-dark-700/50 rounded p-2 text-center">
            <div className="text-2xl font-display text-tech-purple">{oilWells.length}</div>
            <div className="text-xs text-gray-500">油井总数</div>
          </div>
        </div>
      </div>

      {/* 设施统计 */}
      <div className="tech-border p-4">
        <h3 className="font-display text-sm text-tech-blue mb-3 flex items-center gap-2">
          <Droplets size={16} />
          设施统计
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">计量站</span>
            <span className="text-white">{meteringStations.length} 座</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">联合站</span>
            <span className="text-white">1 座</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">输油管线</span>
            <span className="text-white">{pipelines.length} 条</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">注水井</span>
            <span className="text-white">{injectionWells.length} 口</span>
          </div>
        </div>
      </div>

      {/* 最新报警 */}
      {criticalAlarms > 0 && (
        <div className="alarm-blink tech-border p-4">
          <h3 className="font-display text-sm text-status-alarm mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            紧急报警
          </h3>
          <div className="text-status-alarm text-sm">
            当前有 {criticalAlarms} 条紧急报警需要处理
          </div>
        </div>
      )}

      {/* 系统时间 */}
      <div className="tech-border p-4">
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Clock size={14} />
          <span>实时数据更新中...</span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          数据每 3 秒自动刷新
        </div>
      </div>
    </div>
  );
}
