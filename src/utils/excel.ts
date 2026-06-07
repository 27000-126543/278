import * as XLSX from 'xlsx';
import type { DailyReportData, OilWell, Alarm, WorkOrder } from '@/types';

export const generateDailyReport = (
  date: string,
  wells: OilWell[],
  alarms: Alarm[],
  workOrders: WorkOrder[]
): DailyReportData => {
  const wellData = wells.map((well) => ({
    wellNumber: well.wellNumber,
    production: well.productionRate,
    waterCut: well.waterCut,
    pumpEfficiency: well.pumpEfficiency,
    status: well.status === 'normal' ? '正常' : well.status === 'warning' ? '警告' : well.status === 'alarm' ? '报警' : '维修中',
  }));

  const faults = workOrders
    .filter((wo) => new Date(wo.createdAt).toISOString().split('T')[0] === date)
    .map((wo) => ({
      time: new Date(wo.createdAt).toLocaleTimeString('zh-CN'),
      type: wo.type === 'maintenance' ? '检修' : wo.type === 'repair' ? '维修' : '应急',
      target: wo.targetName,
      description: wo.description,
    }));

  const environmentEvents = alarms
    .filter((a) => (a.type === 'h2s' || a.type === 'ch4') && new Date(a.timestamp).toISOString().split('T')[0] === date)
    .map((a) => ({
      time: new Date(a.timestamp).toLocaleTimeString('zh-CN'),
      type: a.type === 'h2s' ? '硫化氢超标' : '甲烷超标',
      location: a.targetName,
      level: a.level === 'warning' ? '警告' : a.level === 'danger' ? '危险' : '严重',
    }));

  const totalProduction = wellData.reduce((sum, w) => sum + w.production, 0);
  const avgWaterCut = wellData.length > 0 ? wellData.reduce((sum, w) => sum + w.waterCut, 0) / wellData.length : 0;

  return {
    date,
    wellData,
    faults,
    environmentEvents,
    totalProduction,
    avgWaterCut,
    faultCount: faults.length,
    envEventCount: environmentEvents.length,
  };
};

export const exportToExcel = (report: DailyReportData) => {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['生产日报'],
    ['日期', report.date],
    ['总产液量 (m³/d)', report.totalProduction.toFixed(2)],
    ['平均含水率 (%)', report.avgWaterCut.toFixed(2)],
    ['设备故障数', report.faultCount],
    ['环保事件数', report.envEventCount],
    [],
  ];

  const wellHeader = ['井号', '产液量 (m³/d)', '含水率 (%)', '泵效 (%)', '状态'];
  const wellRows = report.wellData.map((w) => [w.wellNumber, w.production.toFixed(2), w.waterCut.toFixed(2), w.pumpEfficiency.toFixed(2), w.status]);
  const wellSheetData = [...summaryData, wellHeader, ...wellRows];
  const ws1 = XLSX.utils.aoa_to_sheet(wellSheetData);
  XLSX.utils.book_append_sheet(wb, ws1, '油井生产数据');

  if (report.faults.length > 0) {
    const faultHeader = ['时间', '类型', '目标', '描述'];
    const faultRows = report.faults.map((f) => [f.time, f.type, f.target, f.description]);
    const ws2 = XLSX.utils.aoa_to_sheet([faultHeader, ...faultRows]);
    XLSX.utils.book_append_sheet(wb, ws2, '设备故障');
  }

  if (report.environmentEvents.length > 0) {
    const envHeader = ['时间', '类型', '位置', '级别'];
    const envRows = report.environmentEvents.map((e) => [e.time, e.type, e.location, e.level]);
    const ws3 = XLSX.utils.aoa_to_sheet([envHeader, ...envRows]);
    XLSX.utils.book_append_sheet(wb, ws3, '环保事件');
  }

  XLSX.writeFile(wb, `生产日报_${report.date}.xlsx`);
};
