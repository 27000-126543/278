import { useState } from 'react';
import { FileSpreadsheet, Download, Calendar, BarChart3 } from 'lucide-react';
import { useOilFieldStore } from '@/store/useOilFieldStore';
import { useAlarmStore } from '@/store/useAlarmStore';
import { useWorkOrderStore } from '@/store/useWorkOrderStore';
import { generateDailyReport, exportToExcel } from '@/utils/excel';

export function ReportCenter() {
  const { oilWells } = useOilFieldStore();
  const { alarms } = useAlarmStore();
  const { workOrders } = useWorkOrderStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const report = generateDailyReport(selectedDate, oilWells, alarms, workOrders);

  const handleExport = () => {
    exportToExcel(report);
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">报表中心</h2>
          <p className="text-gray-500 text-sm mt-1">生产日报查询与导出</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-dark-700 border border-gray-600 rounded text-white focus:outline-none focus:border-tech-blue"
            />
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-tech-blue to-tech-cyan text-dark-900 rounded-lg font-medium hover:shadow-lg hover:shadow-tech-blue/30 transition-all"
          >
            <Download size={18} />
            导出Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BarChart3 size={16} />
            总产液量
          </div>
          <div className="font-display text-3xl text-status-normal">
            {report.totalProduction.toFixed(1)}
            <span className="text-base ml-1 text-gray-400">m³/d</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BarChart3 size={16} />
            平均含水率
          </div>
          <div className="font-display text-3xl text-tech-cyan">
            {report.avgWaterCut.toFixed(1)}
            <span className="text-base ml-1 text-gray-400">%</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <FileSpreadsheet size={16} />
            设备故障
          </div>
          <div className="font-display text-3xl text-status-warning">
            {report.faultCount}
            <span className="text-base ml-1 text-gray-400">起</span>
          </div>
        </div>
        <div className="data-card">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <FileSpreadsheet size={16} />
            环保事件
          </div>
          <div className="font-display text-3xl text-status-alarm">
            {report.envEventCount}
            <span className="text-base ml-1 text-gray-400">起</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 overflow-hidden">
        {/* 油井数据 */}
        <div className="tech-border overflow-hidden flex flex-col">
          <div className="p-4 border-b border-tech-blue/20">
            <h3 className="font-display text-tech-blue">油井生产数据</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-dark-800">
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="text-left py-3 px-4">井号</th>
                  <th className="text-right py-3 px-4">产液量</th>
                  <th className="text-right py-3 px-4">含水率</th>
                  <th className="text-right py-3 px-4">泵效</th>
                  <th className="text-center py-3 px-4">状态</th>
                </tr>
              </thead>
              <tbody>
                {report.wellData.map((well, i) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-white/5">
                    <td className="py-3 px-4 font-medium text-white">{well.wellNumber}</td>
                    <td className="text-right py-3 px-4 text-status-normal">{well.production.toFixed(1)}</td>
                    <td className="text-right py-3 px-4 text-tech-cyan">{well.waterCut.toFixed(1)}%</td>
                    <td className={`text-right py-3 px-4 ${well.pumpEfficiency < 30 ? 'text-status-alarm' : 'text-white'}`}>
                      {well.pumpEfficiency.toFixed(1)}%
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        well.status === '正常' ? 'bg-status-normal/20 text-status-normal' :
                        well.status === '警告' ? 'bg-status-warning/20 text-status-warning' :
                        well.status === '报警' ? 'bg-status-alarm/20 text-status-alarm' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {well.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 故障和环保事件 */}
        <div className="space-y-6 flex flex-col overflow-hidden">
          {/* 设备故障 */}
          <div className="tech-border overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-tech-blue/20">
              <h3 className="font-display text-tech-blue">设备故障记录</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {report.faults.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  今日无设备故障
                </div>
              ) : (
                report.faults.map((fault, i) => (
                  <div key={i} className="bg-dark-700/50 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-status-warning text-xs px-2 py-0.5 rounded bg-status-warning/10">
                          {fault.type}
                        </span>
                        <span className="text-white ml-2">{fault.target}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{fault.time}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">{fault.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 环保事件 */}
          <div className="tech-border overflow-hidden flex flex-col flex-1">
            <div className="p-4 border-b border-tech-blue/20">
              <h3 className="font-display text-tech-blue">环保事件记录</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {report.environmentEvents.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  今日无环保事件
                </div>
              ) : (
                report.environmentEvents.map((event, i) => (
                  <div key={i} className="bg-dark-700/50 rounded p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          event.level === '严重' ? 'bg-status-alarm/20 text-status-alarm' :
                          'bg-status-warning/20 text-status-warning'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-white ml-2">{event.location}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{event.time}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">级别: {event.level}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
