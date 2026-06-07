import { TrendingDown, Lightbulb, AlertTriangle } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export function ProductionForecast() {
  const { forecasts } = useOilFieldStore();

  const lowProductionWells = forecasts.filter(f => f.isLowProduction);

  const getForecastChartOption = (forecast: typeof forecasts[0]): EChartsOption => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: forecast.wellName,
        textStyle: { color: '#E4E7EC', fontSize: 13 },
        left: 10,
        top: 10,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(10, 22, 40, 0.95)',
        borderColor: 'rgba(0, 212, 255, 0.3)',
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['历史产量', '预测产量'],
        textStyle: { color: '#98A2B3', fontSize: 11 },
        right: 10,
        top: 10,
      },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '50px', containLabel: true },
      xAxis: {
        type: 'category',
        data: [
          ...forecast.historicalData.map(d => d.date.slice(5)),
          ...forecast.forecastData.map(d => d.date.slice(5)),
        ],
        axisLabel: { color: '#98A2B3', fontSize: 10, rotate: 45 },
        axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      },
      yAxis: {
        type: 'value',
        name: 'm³/d',
        axisLabel: { color: '#98A2B3', fontSize: 10 },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      },
      series: [
        {
          name: '历史产量',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: [...forecast.historicalData.map(d => d.value), ...Array(7).fill(null)],
          lineStyle: { color: '#00D4FF', width: 2 },
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                { offset: 1, color: 'rgba(0, 212, 255, 0.05)' },
              ],
            },
          },
        },
        {
          name: '预测产量',
          type: 'line',
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#A855F7', width: 2, type: 'dashed' },
          data: [...Array(14).fill(null), ...forecast.forecastData.map(d => d.value)],
          areaStyle: {
            color: {
              type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(168, 85, 247, 0.2)' },
                { offset: 1, color: 'rgba(168, 85, 247, 0.02)' },
              ],
            },
          },
        },
      ],
    };
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">产量预测</h2>
          <p className="text-gray-500 text-sm mt-1">基于历史数据预测未来7天单井产量</p>
        </div>
        {lowProductionWells.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-status-warning/20 border border-status-warning/40 rounded-lg">
            <AlertTriangle size={20} className="text-status-warning" />
            <span className="text-status-warning font-medium">
              发现 {lowProductionWells.length} 口低产井，建议采取增产措施
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingDown size={16} />
            总井数
          </div>
          <div className="font-display text-3xl text-white">
            {forecasts.length}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertTriangle size={16} />
            低产井
          </div>
          <div className="font-display text-3xl text-status-warning">
            {lowProductionWells.length}
            <span className="text-base ml-1 text-gray-400">口</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <TrendingDown size={16} />
            预测周期
          </div>
          <div className="font-display text-3xl text-tech-purple">
            7
            <span className="text-base ml-1 text-gray-400">天</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Lightbulb size={16} />
            增产建议
          </div>
          <div className="font-display text-3xl text-tech-cyan">
            {lowProductionWells.length}
            <span className="text-base ml-1 text-gray-400">条</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* 低产井高亮 */}
        {lowProductionWells.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display text-lg text-status-warning mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              低产井增产建议
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {lowProductionWells.map((forecast) => (
                <div key={forecast.wellId} className="tech-border p-4 border-status-warning/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-status-warning text-lg">{forecast.wellName}</h4>
                      <p className="text-gray-400 text-sm mt-2">
                        预测平均产量: {
                          (forecast.forecastData.reduce((s, d) => s + d.value, 0) / forecast.forecastData.length).toFixed(1)
                        } m³/d
                      </p>
                    </div>
                    <div className="bg-status-warning/20 text-status-warning px-3 py-1 rounded text-sm">
                      低产
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-dark-700/50 rounded">
                    <div className="flex items-start gap-2">
                      <Lightbulb size={16} className="text-status-warning mt-0.5 shrink-0" />
                      <p className="text-gray-300 text-sm">{forecast.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 所有井预测曲线 */}
        <h3 className="font-display text-lg text-tech-blue mb-4">全井产量预测</h3>
        <div className="grid grid-cols-2 gap-4">
          {forecasts.map((forecast) => (
            <div
              key={forecast.wellId}
              className={`tech-border overflow-hidden ${
                forecast.isLowProduction ? 'border-status-warning/40' : ''
              }`}
            >
              <ReactECharts
                option={getForecastChartOption(forecast)}
                style={{ height: '220px', width: '100%' }}
              />
              {forecast.isLowProduction && (
                <div className="px-4 pb-3">
                  <div className="text-xs text-status-warning flex items-center gap-1">
                    <Lightbulb size={12} />
                    建议: {forecast.suggestion}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
