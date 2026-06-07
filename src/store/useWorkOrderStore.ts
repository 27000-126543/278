import { create } from 'zustand';
import type { WorkOrder, WorkOrderType, WorkOrderStatus } from '@/types';

interface WorkOrderState {
  workOrders: WorkOrder[];
  createWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt' | 'status'>) => string;
  assignTeam: (id: string, team: string) => void;
  startWorkOrder: (id: string) => void;
  completeWorkOrder: (id: string) => void;
  getPendingCount: () => number;
}

const generateId = () => 'WO-' + Math.random().toString(36).substr(2, 7).toUpperCase();

const repairTeams = ['修井一队', '修井二队', '修井三队', '应急抢修队'];

export const useWorkOrderStore = create<WorkOrderState>((set, get) => ({
  workOrders: [],
  createWorkOrder: (order) => {
    const id = generateId();
    const newOrder: WorkOrder = {
      ...order,
      id,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    set((state) => ({
      workOrders: [newOrder, ...state.workOrders],
    }));
    return id;
  },
  assignTeam: (id, team) =>
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id ? { ...order, assignedTeam: team } : order
      ),
    })),
  startWorkOrder: (id) =>
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id ? { ...order, status: 'inProgress' as WorkOrderStatus } : order
      ),
    })),
  completeWorkOrder: (id) =>
    set((state) => ({
      workOrders: state.workOrders.map((order) =>
        order.id === id
          ? { ...order, status: 'completed' as WorkOrderStatus, completedAt: new Date().toISOString() }
          : order
      ),
    })),
  getPendingCount: () => {
    return get().workOrders.filter((o) => o.status === 'pending').length;
  },
}));

export { repairTeams };
