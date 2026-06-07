import { create } from 'zustand';
import type { Alarm, AlarmLevel, AlarmType, AlarmStatus } from '@/types';

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, 'id' | 'timestamp' | 'status'>) => void;
  confirmAlarm: (id: string) => void;
  resolveAlarm: (id: string) => void;
  setWorkOrderId: (alarmId: string, workOrderId: string) => void;
  getUnresolvedCount: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAlarmStore = create<AlarmState>((set, get) => ({
  alarms: [],
  addAlarm: (alarm) =>
    set((state) => ({
      alarms: [
        {
          ...alarm,
          id: generateId(),
          timestamp: new Date().toISOString(),
          status: 'pending' as const,
        },
        ...state.alarms,
      ].slice(0, 100),
    })),
  confirmAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, status: 'confirmed' as AlarmStatus } : alarm
      ),
    })),
  resolveAlarm: (id) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === id ? { ...alarm, status: 'resolved' as AlarmStatus } : alarm
      ),
    })),
  setWorkOrderId: (alarmId, workOrderId) =>
    set((state) => ({
      alarms: state.alarms.map((alarm) =>
        alarm.id === alarmId ? { ...alarm, workOrderId } : alarm
      ),
    })),
  getUnresolvedCount: () => {
    return get().alarms.filter((a) => a.status !== 'resolved').length;
  },
}));
