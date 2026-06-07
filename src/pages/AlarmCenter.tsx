import { AlertTriangle, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useAlarmStore } from '@/store/useAlarmStore';

export function AlarmCenter() {
  const { alarms, confirmAlarm, resolveAlarm } = useAlarmStore();

  const getAlarmTypeText = (type: string) => {
    const types: Record<string, string> = {
      pump: '泵效异常',
      waterCut: '含水率异常',
      leak: '管线泄漏',
      pressure: '压力异常',
      h2s: '硫化氢超标',
      ch4: '甲烷超标',
      level: '液位超限',
      injection: '注水异常',
    };
    return types[type] || type;
  };

  const getLevelStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-status-alarm/20 border-status-alarm/50 text-status-alarm';
      case 'danger':
        return 'bg-status-alarm/10 border-status-alarm/30 text-status-alarm';
      case 'warning':
        return 'bg-status-warning/10 border-status-warning/30 text-status-warning';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'critical': return '严重';
      case 'danger': return '危险';
      case 'warning': return '警告';
      default: return level;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-status-alarm/20 text-status-alarm';
      case 'confirmed':
        return 'bg-status-warning/20 text-status-warning';
      case 'resolved':
        return 'bg-status-normal/20 text-status-normal';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待处理';
      case 'confirmed': return '已确认';
      case 'resolved': return '已解决';
      default: return status;
    }
  };

  const stats = {
    total: alarms.length,
    pending: alarms.filter(a => a.status === 'pending').length,
    critical: alarms.filter(a => a.level === 'critical' && a.status !== 'resolved').length,
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">报警中心</h2>
          <p className="text-gray-500 text-sm mt-1">实时监控所有异常报警信息</p>
        </div>
        <div className="flex gap-4">
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">总报警数</div>
            <div className="font-display text-xl text-white">{stats.total}</div>
          </div>
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">待处理</div>
            <div className="font-display text-xl text-status-alarm">{stats.pending}</div>
          </div>
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">严重级别</div>
            <div className="font-display text-xl text-status-alarm">{stats.critical}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {alarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle size={48} className="mb-4 text-status-normal/50" />
            <p className="text-lg">暂无报警信息</p>
            <p className="text-sm mt-1">系统运行正常</p>
          </div>
        ) : (
          alarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`tech-border p-4 transition-all hover:scale-[1.01] ${
                alarm.status === 'pending' && alarm.level === 'critical' ? 'alarm-blink' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg border ${getLevelStyle(alarm.level)}`}>
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">{alarm.targetName}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getLevelStyle(alarm.level)}`}>
                        {getLevelText(alarm.level)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(alarm.status)}`}>
                        {getStatusText(alarm.status)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">{alarm.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(alarm.timestamp).toLocaleString('zh-CN')}
                      </span>
                      <span>类型: {getAlarmTypeText(alarm.type)}</span>
                      {alarm.workOrderId && (
                        <span>工单: {alarm.workOrderId}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {alarm.status === 'pending' && (
                    <button
                      onClick={() => confirmAlarm(alarm.id)}
                      className="px-3 py-1.5 text-sm bg-status-warning/20 text-status-warning border border-status-warning/40 rounded hover:bg-status-warning/30 transition-colors"
                    >
                      确认
                    </button>
                  )}
                  {alarm.status !== 'resolved' && (
                    <button
                      onClick={() => resolveAlarm(alarm.id)}
                      className="px-3 py-1.5 text-sm bg-status-normal/20 text-status-normal border border-status-normal/40 rounded hover:bg-status-normal/30 transition-colors"
                    >
                      解决
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
