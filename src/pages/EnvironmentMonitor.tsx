import { Wind, AlertTriangle, Activity, Bell } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export function EnvironmentMonitor() {
  const { oilWells } = useOilFieldStore();

  const h2sData = oilWells.map(w => ({ name: w.wellNumber, value: w.h2sLevel }));
  const ch4Data = oilWells.map(w => ({ name: w.wellNumber, value: w.ch4Level }));

  const h2sChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    title: { text: '硫化氢浓度分布', textStyle: { color: '#E4E7EC', fontSize: 14 }, left: 10, top: 10 },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '50px', containLabel: true },
    xAxis: { type: 'category', data: h2sData.map(d => d.name), axisLabel: { color: '#98A2B3' } },
    yAxis: { type: 'value', name: 'ppm', axisLabel: { color: '#98A2B3' }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } } },
    series: [{
      type: 'bar',
      data: h2sData.map(d => ({
        value: d.value,
        itemStyle: { color: d.value > 20 ? '#FF3B30' : d.value > 10 ? '#FF8C00' : '#34C759' }
      })),
      markLine: {
        data: [{ yAxis: 20, lineStyle: { color: '#FF3B30' }, label: { formatter: '阈值20ppm', color: '#FF3B30' } }]
      }
    }]
  };

  const ch4ChartOption: EChartsOption = {
    backgroundColor: 'transparent',
    title: { text: '甲烷浓度分布', textStyle: { color: '#E4E7EC', fontSize: 14 }, left: 10, top: 10 },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '50px', containLabel: true },
    xAxis: { type: 'category', data: ch4Data.map(d => d.name), axisLabel: { color: '#98A2B3' } },
    yAxis: { type: 'value', name: '%LEL', axisLabel: { color: '#98A2B3' }, splitLine: { lineStyle: { color: 'rgba(0,212,255,0.1)' } } },
    series: [{
      type: 'bar',
      data: ch4Data.map(d => ({
        value: d.value,
        itemStyle: { color: d.value > 60 ? '#FF3B30' : d.value > 40 ? '#FF8C00' : '#A855F7' }
      })),
      markLine: {
        data: [{ yAxis: 60, lineStyle: { color: '#FF3B30' }, label: { formatter: '阈值60%LEL', color: '#FF3B30' } }]
      }
    }]
  };

  const avgH2s = h2sData.reduce((sum, d) => sum + d.value, 0) / h2sData.length;
  const avgCh4 = ch4Data.reduce((sum, d) => sum + d.value, 0) / ch4Data.length;
  const h2sAlerts = oilWells.filter(w => w.h2sLevel > 20).length;
  const ch4Alerts = oilWells.filter(w => w.ch4Level > 60).length;
  const hasAlert = h2sAlerts > 0 || ch4Alerts > 0;

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">环保监测</h2>
          <p className="text-gray-500 text-sm mt-1">硫化氢与甲烷浓度实时监测</p>
        </div>
        {hasAlert && (
          <div className="alarm-blink flex items-center gap-2 px-4 py-2 bg-status-alarm/20 border border-status-alarm/40 rounded-lg">
            <Bell size={20} className="text-status-alarm" />
            <span className="text-status-alarm font-medium">
              检测到 {h2sAlerts + ch4Alerts} 处环保超标
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Wind size={16} />
            平均H₂S浓度
          </div>
          <div className={`font-display text-3xl ${avgH2s > 15 ? 'text-status-warning' : 'text-status-normal'}`}>
            {avgH2s.toFixed(1)}
            <span className="text-base ml-1 text-gray-400">ppm</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Wind size={16} />
            平均CH₄浓度
          </div>
          <div className={`font-display text-3xl ${avgCh4 > 40 ? 'text-status-warning' : 'text-tech-purple'}`}>
            {avgCh4.toFixed(1)}
            <span className="text-base ml-1 text-gray-400">%LEL</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <AlertTriangle size={16} />
            H₂S超标井数
          </div>
          <div className={`font-display text-3xl ${h2sAlerts > 0 ? 'text-status-alarm' : 'text-status-normal'}`}>
            {h2sAlerts}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <AlertTriangle size={16} />
            CH₄超标井数
          </div>
          <div className={`font-display text-3xl ${ch4Alerts > 0 ? 'text-status-alarm' : 'text-status-normal'}`}>
            {ch4Alerts}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
        <div className="tech-border overflow-hidden">
          <ReactECharts option={h2sChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="tech-border overflow-hidden">
          <ReactECharts option={ch4ChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      <div className="mt-6 tech-border p-4">
        <h3 className="font-display text-tech-blue mb-3">各井详细数据</h3>
        <div className="grid grid-cols-4 gap-3">
          {oilWells.map((well) => (
            <div key={well.id} className={`p-3 rounded border ${
              well.h2sLevel > 20 || well.ch4Level > 60
                ? 'bg-status-alarm/10 border-status-alarm/30'
                : 'bg-dark-700/50 border-gray-700'
            }`}>
              <div className="text-white font-medium mb-2">{well.wellNumber}</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">H₂S</div>
                  <div className={well.h2sLevel > 20 ? 'text-status-alarm' : 'text-gray-200'}>
                    {well.h2sLevel.toFixed(1)} ppm
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">CH₄</div>
                  <div className={well.ch4Level > 60 ? 'text-status-alarm' : 'text-gray-200'}>
                    {well.ch4Level.toFixed(1)} %LEL
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
