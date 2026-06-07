import type {
  OilWell,
  MeteringStation,
  UnionStation,
  Pipeline,
  InjectionWell,
  ProductionForecast,
} from '@/types';
import { forecastProduction } from '@/utils/forecast';
import type { ForecastPoint } from '@/utils/forecast';

const wellNames = ['Y1-1', 'Y1-2', 'Y1-3', 'Y2-1', 'Y2-2', 'Y2-3', 'Y3-1', 'Y3-2'];

const generateProductionHistory = (baseValue: number) => {
  const history = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    history.push({
      time: time.toISOString(),
      value: baseValue + (Math.random() - 0.5) * baseValue * 0.2,
    });
  }
  return history;
};

const generateDynamometerCard = () => {
  const points = [];
  for (let i = 0; i <= 360; i += 10) {
    const rad = (i * Math.PI) / 180;
    points.push(50 + 30 * Math.sin(rad) + 10 * Math.sin(2 * rad));
  }
  return points;
};

const generate30DayHistoricalData = (baseValue: number, declineRate: number = 0.003): ForecastPoint[] => {
  const data: ForecastPoint[] = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000);
    const dayFactor = 1 - i * declineRate;
    const weeklyVariation = 1 + 0.05 * Math.sin(i * 0.5);
    const randomNoise = 1 + (Math.random() - 0.5) * 0.08;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.max(10, baseValue * dayFactor * weeklyVariation * randomNoise),
    });
  }
  
  return data;
};

export const generateInitialData = () => {
  const oilWells: OilWell[] = wellNames.map((name, index) => {
    const row = Math.floor(index / 3);
    const col = index % 3;
    const baseProduction = 30 + Math.random() * 50;
    return {
      id: `well-${index + 1}`,
      wellNumber: name,
      name: `${name}号井`,
      position: {
        x: (col - 1) * 15 + (Math.random() - 0.5) * 3,
        y: 0,
        z: (row - 1) * 12 + (Math.random() - 0.5) * 2,
      },
      productionRate: baseProduction,
      waterCut: 20 + Math.random() * 40,
      dynamicFluidLevel: 800 + Math.random() * 400,
      pumpEfficiency: 50 + Math.random() * 40,
      status: 'normal',
      h2sLevel: Math.random() * 15,
      ch4Level: Math.random() * 30,
      productionHistory: generateProductionHistory(baseProduction),
      dynamometerCard: generateDynamometerCard(),
      lastWaterCut: 20 + Math.random() * 40,
    };
  });

  const meteringStations: MeteringStation[] = [
    {
      id: 'station-1',
      name: '1号计量站',
      position: { x: -8, y: 0, z: -5 },
      totalLiquid: 120 + Math.random() * 50,
      avgWaterCut: 30 + Math.random() * 20,
      lastWaterCut: 30 + Math.random() * 20,
      connectedWells: ['well-1', 'well-2', 'well-3'],
      status: 'normal',
    },
    {
      id: 'station-2',
      name: '2号计量站',
      position: { x: 8, y: 0, z: 5 },
      totalLiquid: 100 + Math.random() * 40,
      avgWaterCut: 28 + Math.random() * 18,
      lastWaterCut: 28 + Math.random() * 18,
      connectedWells: ['well-4', 'well-5', 'well-6'],
      status: 'normal',
    },
  ];

  const unionStations: UnionStation[] = [
    {
      id: 'union-1',
      name: '中心联合站',
      position: { x: 0, y: 0, z: -18 },
      separators: [
        { id: 'sep-1', name: '1号分离器', liquidLevel: 60 + Math.random() * 20, pressure: 0.8 + Math.random() * 0.4, maxLevel: 90, isActive: true, isStandby: false },
        { id: 'sep-2', name: '2号分离器', liquidLevel: 55 + Math.random() * 20, pressure: 0.75 + Math.random() * 0.3, maxLevel: 90, isActive: true, isStandby: false },
        { id: 'sep-3', name: '备用分离器', liquidLevel: 20, pressure: 0.3, maxLevel: 90, isActive: false, isStandby: true },
      ],
      status: 'normal',
    },
  ];

  const pipelines: Pipeline[] = [
    {
      id: 'pipe-1',
      name: '1号集输管线',
      startPoint: { x: -8, y: 0.5, z: -5 },
      endPoint: { x: 0, y: 0.5, z: -18 },
      length: 15,
      pressurePoints: [
        { id: 'pp-1-1', position: 0, pressure: 1.2, lastPressure: 1.2, isLeak: false },
        { id: 'pp-1-2', position: 5, pressure: 1.15, lastPressure: 1.15, isLeak: false },
        { id: 'pp-1-3', position: 10, pressure: 1.1, lastPressure: 1.1, isLeak: false },
      ],
      status: 'normal',
    },
    {
      id: 'pipe-2',
      name: '2号集输管线',
      startPoint: { x: 8, y: 0.5, z: 5 },
      endPoint: { x: 0, y: 0.5, z: -18 },
      length: 18,
      pressurePoints: [
        { id: 'pp-2-1', position: 0, pressure: 1.3, lastPressure: 1.3, isLeak: false },
        { id: 'pp-2-2', position: 6, pressure: 1.25, lastPressure: 1.25, isLeak: false },
        { id: 'pp-2-3', position: 12, pressure: 1.2, lastPressure: 1.2, isLeak: false },
      ],
      status: 'normal',
    },
  ];

  const injectionWells: InjectionWell[] = [
    {
      id: 'inject-1',
      name: '注水井Z1',
      position: { x: -12, y: 0, z: 8 },
      injectionPressure: 15 + Math.random() * 5,
      injectionRate: 80 + Math.random() * 40,
      status: 'normal',
      lastPressure: 15 + Math.random() * 5,
    },
    {
      id: 'inject-2',
      name: '注水井Z2',
      position: { x: 12, y: 0, z: -8 },
      injectionPressure: 14 + Math.random() * 6,
      injectionRate: 75 + Math.random() * 35,
      status: 'normal',
      lastPressure: 14 + Math.random() * 6,
    },
  ];

  const forecasts: ProductionForecast[] = oilWells.map((well, idx) => {
    const declineRates = [0.002, 0.004, 0.006, 0.003, 0.005, 0.002, 0.007, 0.004];
    const baseValue = well.productionRate;
    
    const historicalData = generate30DayHistoricalData(baseValue, declineRates[idx] || 0.003);
    const forecastData = forecastProduction(historicalData, 7);

    const avgForecast = forecastData.reduce((sum, d) => sum + d.value, 0) / forecastData.length;
    const isLowProduction = avgForecast < 25;

    const suggestions = [
      '建议进行压裂增产措施，可提高产能15-25%',
      '建议优化抽油参数，调整冲次和冲程',
      '建议检查泵况，必要时进行检泵作业',
      '建议进行酸化处理，改善渗流条件',
      '建议调整工作制度，优化生产参数',
      '建议进行深部调剖，改善吸水剖面',
    ];

    return {
      wellId: well.id,
      wellName: well.name,
      historicalData,
      forecastData,
      isLowProduction,
      suggestion: isLowProduction ? suggestions[Math.floor(Math.random() * suggestions.length)] : '产量稳定，继续观察',
    };
  });

  return {
    oilWells,
    meteringStations,
    unionStations,
    pipelines,
    injectionWells,
    forecasts,
  };
};
