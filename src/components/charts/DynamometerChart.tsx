import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface DynamometerChartProps {
  data: number[];
  title?: string;
}

export function DynamometerChart({ data, title = '示功图' }: DynamometerChartProps) {
  const points = data.map((value, index) => {
    const angle = (index / (data.length - 1)) * 360;
    const rad = (angle * Math.PI) / 180;
    return [value * Math.cos(rad), value * Math.sin(rad)];
  });

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    title: {
      text: title,
      textStyle: {
        color: '#E4E7EC',
        fontSize: 14,
        fontWeight: 500,
      },
      left: 10,
      top: 10,
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '10%',
      top: '50px',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      show: true,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      axisLabel: { color: '#98A2B3', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      show: true,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      axisLabel: { color: '#98A2B3', fontSize: 10 },
    },
    series: [
      {
        type: 'line',
        data: points,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: '#00F5D4',
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 245, 212, 0.3)' },
              { offset: 1, color: 'rgba(0, 245, 212, 0.05)' },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '200px', width: '100%' }} />;
}
