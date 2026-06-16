import { create } from 'zustand';
import { Order, Package, Staff, Material, DashboardStats, DispatchTask, SettlementItem, Review } from '@/types';
import { mockOrders, mockDashboardStats } from '@/data/orders';
import { mockPackages } from '@/data/packages';
import { mockStaffList } from '@/data/staff';
import { mockMaterials } from '@/data/materials';

const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ');

interface AppState {
  orders: Order[];
  packages: Package[];
  staffList: Staff[];
  materials: Material[];
  dashboardStats: DashboardStats;
  currentOrderId: string | null;
  currentPackageId: string | null;
  setCurrentOrder: (id: string | null) => void;
  setCurrentPackage: (id: string | null) => void;
  getOrderById: (id: string) => Order | undefined;
  getPackageById: (id: string) => Package | undefined;
  getStaffById: (id: string) => Staff | undefined;
  getMaterialById: (id: string) => Material | undefined;
  isStaffAvailable: (staff: Staff) => boolean;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addDispatchTask: (orderId: string, task: DispatchTask) => void;
  replaceDispatchTasks: (orderId: string, tasks: DispatchTask[]) => void;
  setOrderSettlement: (orderId: string, settlement: SettlementItem[]) => void;
  completeOrder: (orderId: string) => void;
  setOrderReview: (orderId: string, review: Review) => void;
  addOrder: (order: Order) => void;
  recomputeDashboard: () => void;
  getStats: () => {
    inService: number;
    completed: number;
    pendingSettlement: number;
    pendingReview: number;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  orders: mockOrders,
  packages: mockPackages,
  staffList: mockStaffList,
  materials: mockMaterials,
  dashboardStats: mockDashboardStats,
  currentOrderId: null,
  currentPackageId: null,

  setCurrentOrder: (id) => set({ currentOrderId: id }),
  setCurrentPackage: (id) => set({ currentPackageId: id }),

  getOrderById: (id) => get().orders.find(o => o.id === id),
  getPackageById: (id) => get().packages.find(p => p.id === id),
  getStaffById: (id) => get().staffList.find(s => s.id === id),
  getMaterialById: (id) => get().materials.find(m => m.id === id),

  isStaffAvailable: (staff) => {
    const s = String(staff.status);
    return s === '空闲' || s === 'available' || s === 'free';
  },

  recomputeDashboard: () => {
    const orders = get().orders;
    const today = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter(o => o.createdAt.startsWith(today));
    set({
      dashboardStats: {
        todayOrders: todayOrders.length,
        pendingDispatch: orders.filter(o => o.status === '待派工').length,
        inProgressOrders: orders.filter(o => o.status === '进行中').length,
        completedToday: todayOrders.filter(o => o.status === '已完成').length,
        urgentOrders: orders.filter(o => o.urgency === '紧急' && o.status !== '已完成').length
      }
    });
  },

  updateOrder: (orderId, patch) => {
    const updated = get().orders.map(o =>
      o.id === orderId ? { ...o, ...patch, updatedAt: nowStr() } : o
    );
    set({ orders: updated });
    get().recomputeDashboard();
  },

  updateOrderStatus: (orderId, status) => {
    get().updateOrder(orderId, { status });
  },

  addDispatchTask: (orderId, task) => {
    const updated = get().orders.map(o => {
      if (o.id !== orderId) return o;
      const newTasks = [...o.dispatchTasks, task];
      const newStatus = newTasks.length > 0 && o.status === '待派工' ? '进行中' as const : o.status;
      return { ...o, dispatchTasks: newTasks, status: newStatus, updatedAt: nowStr() };
    });
    set({ orders: updated });
    get().recomputeDashboard();
  },

  replaceDispatchTasks: (orderId, tasks) => {
    const updated = get().orders.map(o => {
      if (o.id !== orderId) return o;
      const newStatus = tasks.length > 0 && o.status === '待派工' ? '进行中' as const : o.status;
      return { ...o, dispatchTasks: tasks, status: newStatus, updatedAt: nowStr() };
    });
    set({ orders: updated });
    get().recomputeDashboard();
  },

  setOrderSettlement: (orderId, settlement) => {
    get().updateOrder(orderId, { settlement });
  },

  completeOrder: (orderId) => {
    const updated = get().orders.map(o => {
      if (o.id !== orderId) return o;
      const nodes = o.processNodes.map(n => ({ ...n, status: 'completed' as const, completedTime: n.completedTime || nowStr() }));
      const tasks = o.dispatchTasks.map(t => ({ ...t, status: '已完成' as const }));
      return { ...o, status: '已完成', processNodes: nodes, dispatchTasks: tasks, updatedAt: nowStr() };
    });
    set({ orders: updated });
    get().recomputeDashboard();
  },

  setOrderReview: (orderId, review) => {
    get().updateOrder(orderId, { review });
  },

  addOrder: (order) => {
    set({ orders: [order, ...get().orders] });
    get().recomputeDashboard();
  },

  getStats: () => {
    const orders = get().orders;
    return {
      inService: orders.filter(o => o.status === '进行中').length,
      completed: orders.filter(o => o.status === '已完成').length,
      pendingSettlement: orders.filter(o => (o.status === '进行中' || o.status === '待派工') && o.settlement.length === 0).length,
      pendingReview: orders.filter(o => o.status === '已完成' && !o.review).length
    };
  }
}));
