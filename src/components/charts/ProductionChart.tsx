import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface ProductionChartProps {
  data: { time: string; value: number }[];
  title?: string;
  color?: string;
}

export function ProductionChart({ data, title = '产液量趋势', color = '#00D4FF' }: ProductionChartProps) {
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
      trigger: 'axis',
      backgroundColor: 'rgba(10, 22, 40, 0.95)',
      borderColor: 'rgba(0, 212, 255, 0.3)',
      textStyle: { color: '#fff' },
      formatter: (params: any) => {
        const param = params[0];
        const time = new Date(param.name).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        return `${time}<br/>产液量: ${param.value.toFixed(2)} m³/d`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '50px',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.time),
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      axisLabel: {
        color: '#98A2B3',
        fontSize: 10,
        formatter: (value: string) => {
          return new Date(value).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.2)' } },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.1)' } },
      axisLabel: { color: '#98A2B3', fontSize: 10 },
    },
    series: [
      {
        name: '产液量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: data.map(d => d.value),
        lineStyle: {
          color: color,
          width: 2,
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: color + '40' },
              { offset: 1, color: color + '05' },
            ],
          },
        },
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '200px', width: '100%' }} />;
}
