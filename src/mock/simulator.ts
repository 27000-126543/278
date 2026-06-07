import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';

const randomInRange = (min: number, max: number) => min + Math.random() * (max - min);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const startDataSimulation = () => {
  const interval = setInterval(() => {
    const { oilWells, meteringStations, unionStations, pipelines, injectionWells, updateOilWell, updateMeteringStation, updateUnionStation, updatePipeline, updateInjectionWell } = useOilFieldStore.getState();
    const { addAlarm } = useAlarmStore.getState();
    const { createWorkOrder } = useWorkOrderStore.getState();

    oilWells.forEach((well) => {
      const newProduction = clamp(well.productionRate + randomInRange(-2, 2), 10, 80);
      const newWaterCut = clamp(well.waterCut + randomInRange(-1, 1), 10, 70);
      const newDynamicFluidLevel = clamp(well.dynamicFluidLevel + randomInRange(-10, 10), 500, 1500);
      let newPumpEfficiency = clamp(well.pumpEfficiency + randomInRange(-1, 1), 20, 95);
      const newH2s = clamp(well.h2sLevel + randomInRange(-2, 2), 0, 50);
      const newCh4 = clamp(well.ch4Level + randomInRange(-3, 3), 0, 100);

      if (Math.random() < 0.03) {
        newPumpEfficiency = randomInRange(15, 28);
      }

      let newStatus = well.status;
      const waterCutChange = Math.abs(newWaterCut - well.lastWaterCut);

      if (newPumpEfficiency < 30) {
        newStatus = 'alarm';
        if (well.status !== 'alarm') {
          const alarmId = addAlarm({
            type: 'pump',
            level: 'danger',
            targetId: well.id,
            targetName: well.name,
            message: `泵效过低: ${newPumpEfficiency.toFixed(1)}%，低于阈值30%`,
          });
          const woId = createWorkOrder({
            type: 'maintenance',
            targetId: well.id,
            targetName: well.name,
            description: `泵效过低 (${newPumpEfficiency.toFixed(1)}%)，需要检修`,
            assignedTeam: '修井一队',
          });
        }
      } else if (waterCutChange > 5) {
        newStatus = 'warning';
        if (well.status !== 'warning') {
          addAlarm({
            type: 'waterCut',
            level: 'warning',
            targetId: well.id,
            targetName: well.name,
            message: `含水率突增: 变化${waterCutChange.toFixed(1)}%，建议调参`,
          });
        }
      } else if (newH2s > 20 || newCh4 > 60) {
        newStatus = 'alarm';
        if (newH2s > 20 && well.status !== 'alarm') {
          addAlarm({
            type: 'h2s',
            level: 'critical',
            targetId: well.id,
            targetName: well.name,
            message: `硫化氢浓度超标: ${newH2s.toFixed(1)}ppm，请注意安全`,
          });
        }
        if (newCh4 > 60 && well.status !== 'alarm') {
          addAlarm({
            type: 'ch4',
            level: 'critical',
            targetId: well.id,
            targetName: well.name,
            message: `甲烷浓度超标: ${newCh4.toFixed(1)}%LEL，请注意安全`,
          });
        }
      } else {
        newStatus = 'normal';
      }

      const newHistory = [...well.productionHistory.slice(1), {
        time: new Date().toISOString(),
        value: newProduction,
      }];

      updateOilWell(well.id, {
        productionRate: newProduction,
        waterCut: newWaterCut,
        dynamicFluidLevel: newDynamicFluidLevel,
        pumpEfficiency: newPumpEfficiency,
        h2sLevel: newH2s,
        ch4Level: newCh4,
        status: newStatus,
        lastWaterCut: well.waterCut,
        productionHistory: newHistory,
      });
    });

    meteringStations.forEach((station) => {
      const newTotal = clamp(station.totalLiquid + randomInRange(-5, 5), 80, 200);
      const newWaterCut = clamp(station.avgWaterCut + randomInRange(-0.5, 0.5), 20, 50);
      let newStatus = station.status;
      const waterCutChange = Math.abs(newWaterCut - station.lastWaterCut);

      if (waterCutChange > 5) {
        newStatus = 'warning';
        if (station.status !== 'warning') {
          addAlarm({
            type: 'waterCut',
            level: 'warning',
            targetId: station.id,
            targetName: station.name,
            message: `计量站含水率突增: 变化${waterCutChange.toFixed(1)}%`,
          });
        }
      } else {
        newStatus = 'normal';
      }

      updateMeteringStation(station.id, {
        totalLiquid: newTotal,
        avgWaterCut: newWaterCut,
        lastWaterCut: station.avgWaterCut,
        status: newStatus,
      });
    });

    unionStations.forEach((station) => {
      const newSeparators = station.separators.map((sep) => {
        if (!sep.isActive) return sep;
        const newLevel = clamp(sep.liquidLevel + randomInRange(-3, 3), 20, 95);
        const newPressure = clamp(sep.pressure + randomInRange(-0.05, 0.05), 0.5, 1.5);
        return { ...sep, liquidLevel: newLevel, pressure: newPressure };
      });

      let newStatus = station.status;
      const activeSep = newSeparators.find((s) => s.isActive && !s.isStandby);
      if (activeSep && activeSep.liquidLevel > activeSep.maxLevel) {
        newStatus = 'alarm';
        if (station.status !== 'alarm') {
          addAlarm({
            type: 'level',
            level: 'danger',
            targetId: station.id,
            targetName: station.name,
            message: `分离器液位超限，已自动切换备用分离器`,
          });
        }
        const updatedSeps = newSeparators.map((s) => {
          if (s.id === activeSep.id) return { ...s, isActive: false };
          if (s.isStandby) return { ...s, isActive: true, liquidLevel: 30, pressure: 0.6 };
          return s;
        });
        updateUnionStation(station.id, { separators: updatedSeps, status: 'warning' });
        return;
      } else {
        newStatus = 'normal';
      }

      updateUnionStation(station.id, { separators: newSeparators, status: newStatus });
    });

    pipelines.forEach((pipeline) => {
      const newPoints = pipeline.pressurePoints.map((point) => {
        let newPressure = clamp(point.pressure + randomInRange(-0.03, 0.03), 0.8, 1.5);
        let isLeak = point.isLeak;
        const pressureDrop = point.lastPressure - newPressure;

        if (Math.random() < 0.01 && !point.isLeak) {
          isLeak = true;
          newPressure = clamp(newPressure * 0.6, 0.3, 0.8);
        }

        if (isLeak && point.isLeak === false) {
          addAlarm({
            type: 'leak',
            level: 'critical',
            targetId: pipeline.id,
            targetName: pipeline.name,
            message: `管线泄漏，位置: 距起点${point.position}km处`,
          });
          createWorkOrder({
            type: 'emergency',
            targetId: pipeline.id,
            targetName: pipeline.name,
            description: `管线泄漏抢修，位置: 距起点${point.position}km`,
            assignedTeam: '应急抢修队',
          });
        }

        return { ...point, pressure: newPressure, lastPressure: point.pressure, isLeak };
      });

      const hasLeak = newPoints.some((p) => p.isLeak);
      updatePipeline(pipeline.id, {
        pressurePoints: newPoints,
        status: hasLeak ? 'leak' : 'normal',
      });
    });

    injectionWells.forEach((well) => {
      let newPressure = clamp(well.injectionPressure + randomInRange(-0.5, 0.5), 10, 25);
      let newRate = clamp(well.injectionRate + randomInRange(-3, 3), 50, 150);
      let newStatus = well.status;

      if (Math.random() < 0.02) {
        newPressure = randomInRange(22, 28);
      }

      if (newPressure > 22) {
        newStatus = 'warning';
        if (well.status !== 'warning') {
          addAlarm({
            type: 'injection',
            level: 'warning',
            targetId: well.id,
            targetName: well.name,
            message: `注水压力异常: ${newPressure.toFixed(1)}MPa，建议洗井`,
          });
        }
      } else {
        newStatus = 'normal';
      }

      if (newPressure > 20) {
        newRate = newRate * 0.9;
      }

      updateInjectionWell(well.id, {
        injectionPressure: newPressure,
        injectionRate: newRate,
        status: newStatus,
        lastPressure: well.injectionPressure,
      });
    });
  }, 3000);

  return () => clearInterval(interval);
};
