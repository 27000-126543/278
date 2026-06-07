import { create } from 'zustand';
import type { User, UserRole, OperationLog } from '@/types';

interface UserState {
  currentUser: User | null;
  operationLogs: OperationLog[];
  isLoggedIn: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  addLog: (action: string, details: string) => void;
}

const users: Record<UserRole, User> = {
  worker: {
    id: 'user-001',
    name: '张工',
    role: 'worker',
    lastLogin: '',
  },
  leader: {
    id: 'user-002',
    name: '李队长',
    role: 'leader',
    lastLogin: '',
  },
  manager: {
    id: 'user-003',
    name: '王厂长',
    role: 'manager',
    lastLogin: '',
  },
};

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  operationLogs: [],
  isLoggedIn: false,
  login: (role) => {
    const user = { ...users[role], lastLogin: new Date().toISOString() };
    set({ currentUser: user, isLoggedIn: true });
    get().addLog('登录系统', `角色: ${role === 'worker' ? '采油工' : role === 'leader' ? '队长' : '厂长'}`);
  },
  logout: () => {
    get().addLog('退出系统', '');
    set({ currentUser: null, isLoggedIn: false });
  },
  addLog: (action, details) => {
    const { currentUser } = get();
    if (!currentUser) return;
    const log: OperationLog = {
      id: generateId(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      timestamp: new Date().toISOString(),
      details,
    };
    set((state) => ({
      operationLogs: [log, ...state.operationLogs].slice(0, 200),
    }));
  },
}));
