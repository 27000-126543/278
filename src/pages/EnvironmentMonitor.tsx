import { useState, useEffect, useRef } from 'react';
import { Wind, AlertTriangle, Bell, Siren, PhoneCall, X, Volume2 } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export function EnvironmentMonitor() {
  const { oilWells } = useOilFieldStore();
  const { addNotification } = useNotificationStore();
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [notifiedWells, setNotifiedWells] = useState<Set<string>>(new Set());
  const audioContextRef = useRef<AudioContext | null>(null);

  const h2sData = oilWells.map(w => ({ name: w.wellNumber, value: w.h2sLevel, wellId: w.id }));
  const ch4Data = oilWells.map(w => ({ name: w.wellNumber, value: w.ch4Level, wellId: w.id }));

  const h2sOverWells = oilWells.filter(w => w.h2sLevel > 20);
  const ch4OverWells = oilWells.filter(w => w.ch4Level > 60);
  const hasH2SAlert = h2sOverWells.length > 0;
  const hasCH4Alert = ch4OverWells.length > 0;
  const hasAlert = hasH2SAlert || hasCH4Alert;

  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.log('音频播放失败');
    }
  };

  useEffect(() => {
    const newOverWells: string[] = [];
    
    h2sOverWells.forEach(w => {
      if (!notifiedWells.has(`h2s-${w.id}`)) {
        newOverWells.push(`${w.wellNumber} H₂S超标`);
        setNotifiedWells(prev => new Set([...prev, `h2s-${w.id}`]));
      }
    });
    
    ch4OverWells.forEach(w => {
      if (!notifiedWells.has(`ch4-${w.id}`)) {
        newOverWells.push(`${w.wellNumber} CH₄超标`);
        setNotifiedWells(prev => new Set([...prev, `ch4-${w.id}`]));
      }
    });

    if (newOverWells.length > 0) {
      setShowEmergencyModal(true);
      playAlertSound();
    }
  }, [h2sOverWells.length, ch4OverWells.length]);

  useEffect(() => {
    if (!hasAlert) {
      setNotifiedWells(new Set());
    }
  }, [hasAlert]);

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
        data: [{ yAxis: 20, lineStyle: { color: '#FF3B30', type: 'dashed' }, label: { formatter: '阈值20ppm', color: '#FF3B30' } }],
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
        data: [{ yAxis: 60, lineStyle: { color: '#FF3B30', type: 'dashed' }, label: { formatter: '阈值60%LEL', color: '#FF3B30' } }],
      },
    }],
  };

  const avgH2s = h2sData.reduce((sum, d) => sum + d.value, 0) / h2sData.length;
  const avgCh4 = ch4Data.reduce((sum, d) => sum + d.value, 0) / ch4Data.length;

  const handleNotifyEmergency = () => {
    playAlertSound();
    addNotification({
      type: 'danger',
      title: '应急响应通知已发送',
      message: '已通过语音、短信、APP推送多渠道通知应急响应小组，预计10分钟内到达现场',
      duration: 6000,
    });
    setShowEmergencyModal(false);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden relative">
      {hasAlert && (
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-status-alarm to-transparent z-30">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-status-alarm/80 to-transparent animate-pulse" />
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">环保监测</h2>
          <p className="text-gray-500 text-sm mt-1">硫化氢与甲烷浓度实时监测</p>
        </div>
        {hasAlert && (
          <div className="emergency-flash border-2 px-6 py-3 rounded-lg flex items-center gap-4 shake-animation">
            <div className="relative">
              <Siren size={28} className="text-status-alarm" />
              <div className="absolute inset-0 rounded-full bg-status-alarm/30 pulse-ring" />
              <div className="absolute inset-0 rounded-full bg-status-alarm/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
            </div>
            <div>
              <div className="text-status-alarm font-bold text-lg flex items-center gap-2">
                <Volume2 size={18} className="animate-pulse" />
                声光报警已启动
              </div>
              <div className="text-status-alarm/80 text-sm">
                检测到 {h2sOverWells.length + ch4OverWells.length} 处环保超标，请立即处理
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className={`data-card ${hasH2SAlert ? 'emergency-flash border-status-alarm/50' : ''}`}>
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Wind size={16} />
            平均H₂S浓度
          </div>
          <div className={`font-display text-3xl ${avgH2s > 15 ? 'text-status-warning' : 'text-status-normal'}`}>
            {avgH2s.toFixed(1)}
            <span className="text-base ml-1 text-gray-400">ppm</span>
          </div>
        </div>
        <div className={`data-card ${hasCH4Alert ? 'emergency-flash border-status-alarm/50' : ''}`}>
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
          <div className={`font-display text-3xl ${hasH2SAlert ? 'text-status-alarm alarm-blink' : 'text-status-normal'}`}>
            {h2sOverWells.length}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertTriangle size={16} />
            CH₄超标井数
          </div>
          <div className={`font-display text-3xl ${hasCH4Alert ? 'text-status-alarm alarm-blink' : 'text-status-normal'}`}>
            {ch4OverWells.length}
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
                    ? 'bg-status-alarm/15 border-status-alarm/50 emergency-flash'
                    : 'bg-dark-700/50 border-gray-700'
                }`}
              >
                <div className="text-white font-medium mb-2 flex items-center justify-between">
                  {well.wellNumber}
                  {isOver && (
                    <div className="relative">
                      <Bell size={14} className="text-status-alarm animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs">H₂S</div>
                    <div className={`font-medium ${isH2SOver ? 'text-status-alarm' : 'text-gray-200'}`}>
                      {well.h2sLevel.toFixed(1)} ppm
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs">CH₄</div>
                    <div className={`font-medium ${isCH4Over ? 'text-status-alarm' : 'text-gray-200'}`}>
                      {well.ch4Level.toFixed(1)} %LEL
                    </div>
                  </div>
                </div>
                {isOver && (
                  <div className="mt-2 pt-2 border-t border-status-alarm/20">
                    <span className="text-xs text-status-alarm font-medium">
                      ⚠️ {isH2SOver ? '硫化氢超标 ' : ''}{isCH4Over ? '甲烷超标' : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showEmergencyModal && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="tech-border border-status-alarm/50 bg-dark-800 p-8 max-w-lg w-full mx-4 emergency-flash">
            <div className="flex items-start gap-4">
              <div className="relative p-4 bg-status-alarm/20 rounded-full shrink-0">
                <Siren size={40} className="text-status-alarm shake-animation" />
                <div className="absolute inset-0 rounded-full bg-status-alarm/30 pulse-ring" />
                <div className="absolute inset-0 rounded-full bg-status-alarm/20 pulse-ring" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-status-alarm mb-2">
                  🚨 环保超标紧急报警
                </h3>
                <p className="text-gray-300 mb-4">
                  检测到井口硫化氢或甲烷浓度超标，请立即启动应急预案！
                </p>
                <div className="bg-dark-900/70 rounded-lg p-4 mb-4 space-y-2">
                  {h2sOverWells.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-status-alarm animate-pulse" />
                      <span className="text-status-alarm text-sm">
                        <strong>H₂S超标:</strong> {h2sOverWells.map(w => w.wellNumber).join('、')}
                      </span>
                    </div>
                  )}
                  {ch4OverWells.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-status-alarm animate-pulse" />
                      <span className="text-status-alarm text-sm">
                        <strong>CH₄超标:</strong> {ch4OverWells.map(w => w.wellNumber).join('、')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-3 mb-6">
                  <p className="text-status-warning text-sm">
                    <strong>⚠️ 安全提示:</strong> 请立即疏散现场人员，佩戴防毒面具，切断现场电源，禁止明火，等待应急组到达。
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleNotifyEmergency}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-status-alarm text-white rounded-lg font-bold hover:bg-status-alarm/80 transition-colors shake-animation"
                  >
                    <PhoneCall size={20} />
                    一键通知应急组
                  </button>
                  <button
                    onClick={() => setShowEmergencyModal(false)}
                    className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
