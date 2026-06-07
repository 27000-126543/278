import { X, Droplets, Activity, Gauge, TrendingDown, AlertTriangle } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { ProductionChart } from '@/components/charts/ProductionChart';
import { DynamometerChart } from '@/components/charts/DynamometerChart';

interface WellDetailPanelProps {
  wellId: string;
  onClose: () => void;
}

export function WellDetailPanel({ wellId, onClose }: WellDetailPanelProps) {
  const well = useOilFieldStore((state) =>
    state.oilWells.find((w) => w.id === wellId)
  );

  if (!well) return null;

  const getStatusText = () => {
    switch (well.status) {
      case 'normal': return '正常运行';
      case 'warning': return '预警';
      case 'alarm': return '报警';
      case 'maintenance': return '维修中';
    }
  };

  const getStatusColor = () => {
    switch (well.status) {
      case 'normal': return 'text-status-normal';
      case 'warning': return 'text-status-warning';
      case 'alarm': return 'text-status-alarm';
      case 'maintenance': return 'text-gray-400';
    }
  };

  return (
    <div className="absolute right-4 top-20 bottom-4 w-96 tech-border overflow-hidden flex flex-col">
      <div className="p-4 border-b border-tech-blue/20 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl text-tech-blue glow-text">
            {well.wellNumber}
          </h3>
          <p className="text-sm text-gray-400">{well.name}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            well.status === 'normal' ? 'bg-status-normal/20 text-status-normal' :
            well.status === 'warning' ? 'bg-status-warning/20 text-status-warning' :
            well.status === 'alarm' ? 'bg-status-alarm/20 text-status-alarm' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            {getStatusText()}
          </span>
          {well.pumpEfficiency < 30 && (
            <span className="flex items-center gap-1 text-xs text-status-alarm bg-status-alarm/10 px-2 py-1 rounded">
              <AlertTriangle size={12} />
              泵效异常
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="data-card">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Droplets size={14} />
              产液量
            </div>
            <div className="text-2xl font-display text-status-normal">
              {well.productionRate.toFixed(1)}
              <span className="text-sm ml-1">m³/d</span>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Activity size={14} />
              含水率
            </div>
            <div className="text-2xl font-display text-tech-cyan">
              {well.waterCut.toFixed(1)}
              <span className="text-sm ml-1">%</span>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <TrendingDown size={14} />
              动液面
            </div>
            <div className="text-2xl font-display text-tech-purple">
              {well.dynamicFluidLevel.toFixed(0)}
              <span className="text-sm ml-1">m</span>
            </div>
          </div>

          <div className="data-card">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
              <Gauge size={14} />
              泵效
            </div>
            <div className={`text-2xl font-display ${well.pumpEfficiency < 30 ? 'text-status-alarm' : 'text-status-normal'}`}>
              {well.pumpEfficiency.toFixed(1)}
              <span className="text-sm ml-1">%</span>
            </div>
          </div>
        </div>

        <div className="data-card">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 text-gray-400 text-xs">
              <Activity size={14} />
              环保监测
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500 mb-1">硫化氢</div>
              <div className={`text-lg font-medium ${well.h2sLevel > 20 ? 'text-status-alarm' : 'text-gray-200'}`}>
                {well.h2sLevel.toFixed(1)} <span className="text-xs">ppm</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">甲烷</div>
              <div className={`text-lg font-medium ${well.ch4Level > 60 ? 'text-status-alarm' : 'text-gray-200'}`}>
                {well.ch4Level.toFixed(1)} <span className="text-xs">%LEL</span>
              </div>
            </div>
          </div>
        </div>

        <div className="data-card">
          <ProductionChart data={well.productionHistory} />
        </div>

        <div className="data-card">
          <DynamometerChart data={well.dynamometerCard} />
        </div>
      </div>
    </div>
  );
}
