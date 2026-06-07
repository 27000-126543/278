import { useState, useEffect } from 'react';
import { Wind, AlertTriangle, Bell, Siren, PhoneCall, X } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export function EnvironmentMonitor() {
  const { oilWells } = useOilFieldStore();
  const { addNotification } = useNotificationStore();
  const [alarmState, setAlarmState] = useState({ hasH2S: false, hasCH4: false });
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [prevAlarms, setPrevAlarms] = useState<Set<string>>(new Set());

  const h2sData = oilWells.map(w => ({ name: w.wellNumber, value: w.h2sLevel }));
  const ch4Data = oilWells.map(w => ({ name: w.wellNumber, value: w.ch4Level }));

  useEffect(() => {
    const h2sAlerts = oilWells.filter(w => w.h2sLevel > 20);
    const ch4Alerts = oilWells.filter(w => w.ch4Level > 60);
    const hasH2S = h2sAlerts.length > 0;
    const hasCH4 = ch4Alerts.length > 0;

    setAlarmState({ hasH2S, hasCH4 });

    const currentAlertIds = new Set([
      ...h2sAlerts.map(w => `h2s-${w.id}`),
      ...ch4Alerts.map(w => `ch4-${w.id}`),
    ]);

    const newAlerts = [...currentAlertIds].filter(id => !prevAlarms.has(id));
    if (newAlerts.length > 0 && (hasH2S || hasCH4)) {
      setShowEmergencyModal(true);
    }

    setPrevAlarms(currentAlertIds);
  }, [oilWells, prevAlarms]);

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
        data: [{ yAxis: 20, lineStyle: { color: '#FF3B30' }, label: { formatter: '阈值20ppm', color: '#FF3B30' } }],
      },
    }],
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
        data: [{ yAxis: 60, lineStyle: { color: '#FF3B30' }, label: { formatter: '阈值60%LEL', color: '#FF3B30' } }],
      },
    }],
  };

  const avgH2s = h2sData.reduce((sum, d) => sum + d.value, 0) / h2sData.length;
  const avgCh4 = ch4Data.reduce((sum, d) => sum + d.value, 0) / ch4Data.length;
  const h2sAlerts = oilWells.filter(w => w.h2sLevel > 20).length;
  const ch4Alerts = oilWells.filter(w => w.ch4Level > 60).length;
  const hasAlert = h2sAlerts > 0 || ch4Alerts > 0;

  const handleNotifyEmergency = () => {
    addNotification({
      type: 'danger',
      title: '应急组已通知',
      message: '已通过语音、短信、APP推送多渠道通知应急响应小组',
      duration: 5000,
    });
    setShowEmergencyModal(false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">环保监测</h2>
          <p className="text-gray-500 text-sm mt-1">硫化氢与甲烷浓度实时监测</p>
        </div>
        {hasAlert && (
          <div className="alarm-blink flex items-center gap-3 px-5 py-3 bg-status-alarm/20 border border-status-alarm/40 rounded-lg">
            <Siren size={24} className="text-status-alarm animate-pulse" />
            <div>
              <div className="text-status-alarm font-bold">
                ⚠️ 检测到 {h2sAlerts + ch4Alerts} 处环保超标
              </div>
              <div className="text-status-alarm/70 text-xs">
                声光报警已启动，请立即处理
              </div>
            </div>
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
          <div className={`font-display text-3xl ${h2sAlerts > 0 ? 'text-status-alarm alarm-blink' : 'text-status-normal'}`}>
            {h2sAlerts}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertTriangle size={16} />
            CH₄超标井数
          </div>
          <div className={`font-display text-3xl ${ch4Alerts > 0 ? 'text-status-alarm alarm-blink' : 'text-status-normal'}`}>
            {ch4Alerts}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="tech-border overflow-hidden" style={{ height: '280px' }}>
          <ReactECharts option={h2sChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="tech-border overflow-hidden" style={{ height: '280px' }}>
          <ReactECharts option={ch4ChartOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>

      <div className="tech-border p-4 flex-1 overflow-y-auto">
        <h3 className="font-display text-tech-blue mb-3">各井详细数据</h3>
        <div className="grid grid-cols-4 gap-3">
          {oilWells.map((well) => {
            const isH2SOver = well.h2sLevel > 20;
            const isCH4Over = well.ch4Level > 60;
            const isOver = isH2SOver || isCH4Over;
            return (
              <div
                key={well.id}
                className={`p-3 rounded border transition-all ${
                  isOver
                    ? 'bg-status-alarm/15 border-status-alarm/40 alarm-blink'
                    : 'bg-dark-700/50 border-gray-700'
                }`}
              >
                <div className="text-white font-medium mb-2 flex items-center justify-between">
                  {well.wellNumber}
                  {isOver && <span className="w-2 h-2 rounded-full bg-status-alarm animate-pulse" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">H₂S</div>
                    <div className={isH2SOver ? 'text-status-alarm font-medium' : 'text-gray-200'}>
                      {well.h2sLevel.toFixed(1)} ppm
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">CH₄</div>
                    <div className={isCH4Over ? 'text-status-alarm font-medium' : 'text-gray-200'}>
                      {well.ch4Level.toFixed(1)} %LEL
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showEmergencyModal && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="tech-border border-status-alarm/50 bg-dark-800 p-8 max-w-lg w-full mx-4 alarm-blink">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-status-alarm/20 rounded-full shrink-0">
                <Siren size={32} className="text-status-alarm animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-status-alarm mb-2">
                  🚨 环保超标紧急报警
                </h3>
                <p className="text-gray-300 mb-4">
                  检测到井口硫化氢或甲烷浓度超标，请立即启动应急预案！
                </p>
                <div className="bg-dark-900/50 rounded p-3 mb-4 space-y-2">
                  {h2sAlerts > 0 && (
                    <div className="text-status-alarm text-sm">
                      • H₂S超标: {oilWells.filter(w => w.h2sLevel > 20).map(w => w.wellNumber).join('、')}
                    </div>
                  )}
                  {ch4Alerts > 0 && (
                    <div className="text-status-alarm text-sm">
                      • CH₄超标: {oilWells.filter(w => w.ch4Level > 60).map(w => w.wellNumber).join('、')}
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleNotifyEmergency}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-status-alarm text-white rounded-lg font-medium hover:bg-status-alarm/80 transition-colors"
                  >
                    <PhoneCall size={18} />
                    一键通知应急组
                  </button>
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    稍后处理
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="text-gray-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
