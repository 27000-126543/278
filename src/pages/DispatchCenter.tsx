import { Wrench, Truck, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useWorkOrderStore, repairTeams } from '@/store/useWorkOrderStore';

export function DispatchCenter() {
  const { workOrders, startWorkOrder, completeWorkOrder, assignTeam } = useWorkOrderStore();

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      maintenance: '检修',
      repair: '维修',
      emergency: '应急',
    };
    return types[type] || type;
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'bg-status-alarm/20 text-status-alarm border-status-alarm/40';
      case 'repair':
        return 'bg-status-warning/20 text-status-warning border-status-warning/40';
      case 'maintenance':
        return 'bg-tech-blue/20 text-tech-blue border-tech-blue/40';
      default:
        return '';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-status-warning/20 text-status-warning';
      case 'inProgress':
        return 'bg-tech-blue/20 text-tech-blue';
      case 'completed':
        return 'bg-status-normal/20 text-status-normal';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待派工';
      case 'inProgress': return '处理中';
      case 'completed': return '已完成';
      default: return status;
    }
  };

  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(o => o.status === 'pending').length,
    inProgress: workOrders.filter(o => o.status === 'inProgress').length,
    completed: workOrders.filter(o => o.status === 'completed').length,
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-tech-blue glow-text">调度中心</h2>
          <p className="text-gray-500 text-sm mt-1">工单管理与修井队调度</p>
        </div>
        <div className="flex gap-4">
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">总工单</div>
            <div className="font-display text-xl text-white">{stats.total}</div>
          </div>
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">待派工</div>
            <div className="font-display text-xl text-status-warning">{stats.pending}</div>
          </div>
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">处理中</div>
            <div className="font-display text-xl text-tech-blue">{stats.inProgress}</div>
          </div>
          <div className="data-card px-4 py-2">
            <div className="text-xs text-gray-500">已完成</div>
            <div className="font-display text-xl text-status-normal">{stats.completed}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {repairTeams.map((team, i) => (
          <div key={i} className="data-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">{team}</span>
              <Truck size={16} className="text-tech-blue" />
            </div>
            <div className="text-xs text-gray-500">
              当前任务: {workOrders.filter(o => o.assignedTeam === team && o.status === 'inProgress').length} 个
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {workOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <CheckCircle2 size={48} className="mb-4 text-status-normal/50" />
            <p className="text-lg">暂无工单</p>
            <p className="text-sm mt-1">所有设备运行正常</p>
          </div>
        ) : (
          workOrders.map((order) => (
            <div key={order.id} className="tech-border p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg border ${getTypeStyle(order.type)}`}>
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-lg text-tech-blue">{order.id}</span>
                      <span className={`px-2 py-0.5 rounded text-xs border ${getTypeStyle(order.type)}`}>
                        {getTypeText(order.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusStyle(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                    <p className="text-white font-medium">{order.targetName}</p>
                    <p className="text-gray-400 text-sm mt-1">{order.description}</p>
                    <div className="flex items-center gap-6 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        创建时间: {new Date(order.createdAt).toLocaleString('zh-CN')}
                      </span>
                      <span>负责队伍: {order.assignedTeam || '未指派'}</span>
                      {order.completedAt && (
                        <span>完成时间: {new Date(order.completedAt).toLocaleString('zh-CN')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <>
                      <select
                        value={order.assignedTeam}
                        onChange={(e) => assignTeam(order.id, e.target.value)}
                        className="px-2 py-1.5 text-sm bg-dark-700 border border-gray-600 rounded text-white"
                      >
                        <option value="">选择队伍</option>
                        {repairTeams.map((team) => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                      {order.assignedTeam && (
                        <button
                          onClick={() => startWorkOrder(order.id)}
                          className="px-3 py-1.5 text-sm bg-tech-blue/20 text-tech-blue border border-tech-blue/40 rounded hover:bg-tech-blue/30 transition-colors"
                        >
                          开始处理
                        </button>
                      )}
                    </>
                  )}
                  {order.status === 'inProgress' && (
                    <button
                      onClick={() => completeWorkOrder(order.id)}
                      className="px-3 py-1.5 text-sm bg-status-normal/20 text-status-normal border border-status-normal/40 rounded hover:bg-status-normal/30 transition-colors"
                    >
                      完成工单
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
