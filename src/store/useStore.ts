import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { Order, Package, Staff, Material, DashboardStats, DispatchTask, SettlementItem, Review, PaymentRecord, FollowUpTodo, FollowUpType, PaymentMethod } from '@/types';
import { mockOrders, mockDashboardStats } from '@/data/orders';
import { mockPackages } from '@/data/packages';
import { mockStaffList } from '@/data/staff';
import { mockMaterials } from '@/data/materials';

const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
const todayStr = () => new Date().toISOString().slice(0, 10);

const taroStorage = {
  getItem: (name: string) => {
    try {
      return Promise.resolve(Taro.getStorageSync(name) || null);
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (name: string, value: string) => {
    try {
      Taro.setStorageSync(name, value);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  },
  removeItem: (name: string) => {
    try {
      Taro.removeStorageSync(name);
      return Promise.resolve();
    } catch {
      return Promise.resolve();
    }
  }
};

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
  getStaffTasksToday: (staffId: string) => DispatchTask[];
  isStaffAssignedToday: (staffId: string, excludeOrderId?: string) => boolean;
  updateOrder: (orderId: string, patch: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addDispatchTask: (orderId: string, task: DispatchTask) => void;
  replaceDispatchTasks: (orderId: string, tasks: DispatchTask[]) => void;
  setOrderSettlement: (orderId: string, settlement: SettlementItem[]) => void;
  setPaymentRecord: (orderId: string, record: Omit<PaymentRecord, 'id' | 'orderId' | 'orderNo' | 'deceasedName' | 'payTime'>) => void;
  getPaymentRecordById: (id: string) => PaymentRecord | undefined;
  completeOrder: (orderId: string) => void;
  setOrderReview: (orderId: string, review: Review) => void;
  addFollowUpTodos: (orderId: string, todos: Omit<FollowUpTodo, 'id' | 'orderId' | 'orderNo' | 'deceasedName' | 'createdAt' | 'status'>[]) => void;
  updateFollowUpTodo: (todoId: string, patch: Partial<FollowUpTodo>) => void;
  getAllFollowUps: () => FollowUpTodo[];
  getPendingFollowUps: () => FollowUpTodo[];
  getTodayPayments: () => PaymentRecord[];
  getPendingPayments: () => { order: Order; totalAmount: number }[];
  addOrder: (order: Order) => void;
  recomputeDashboard: () => void;
  getStats: () => {
    inService: number;
    completed: number;
    pendingSettlement: number;
    pendingReview: number;
    pendingFollowUp: number;
    todayPaid: number;
    pendingPayment: number;
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      getStaffTasksToday: (staffId) => {
        const today = todayStr();
        const seenNodes = new Set<string>();
        const tasks: DispatchTask[] = [];
        get().orders.forEach(o => {
          o.dispatchTasks.forEach(t => {
            if (t.staffId !== staffId) return;
            const nodeId = t.processNodeId || t.id || '';
            const key = `${o.id}-${nodeId}`;
            if (seenNodes.has(key)) return;
            seenNodes.add(key);
            const taskDate = (t.scheduledTime || t.startTime || '').slice(0, 10);
            if (taskDate === today) {
              tasks.push(t);
            }
          });
        });
        return tasks;
      },

      isStaffAssignedToday: (staffId, excludeOrderId) => {
        const today = todayStr();
        return get().orders.some(o => {
          if (excludeOrderId && o.id === excludeOrderId) return false;
          return o.dispatchTasks.some(t => {
            if (t.staffId !== staffId) return false;
            const taskDate = (t.scheduledTime || t.startTime || '').slice(0, 10);
            return taskDate === today;
          });
        });
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

      setPaymentRecord: (orderId, record) => {
        const order = get().getOrderById(orderId);
        if (!order) return;
        const paymentRecord: PaymentRecord = {
          ...record,
          id: `PAY${Date.now()}`,
          orderId,
          orderNo: order.orderNo,
          deceasedName: order.deceased.name,
          payTime: nowStr()
        };
        get().updateOrder(orderId, { paymentRecord });
      },

      getPaymentRecordById: (id) => {
        for (const o of get().orders) {
          if (o.paymentRecord?.id === id) return o.paymentRecord;
        }
        return undefined;
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

      addFollowUpTodos: (orderId, todos) => {
        const order = get().getOrderById(orderId);
        if (!order) return;
        const primary = order.familyMembers.find(f => f.isPrimary) || order.familyMembers[0];
        const newTodos: FollowUpTodo[] = todos.map(t => ({
          ...t,
          id: `FUP${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
          orderId,
          orderNo: order.orderNo,
          deceasedName: order.deceased.name,
          createdAt: nowStr(),
          status: '待处理',
          familyContact: primary?.name || t.familyContact || '',
          familyPhone: primary?.phone || t.familyPhone || ''
        }));
        const existing = order.followUpTodos || [];
        get().updateOrder(orderId, { followUpTodos: [...existing, ...newTodos] });
      },

      updateFollowUpTodo: (todoId, patch) => {
        const updated = get().orders.map(o => {
          if (!o.followUpTodos) return o;
          const todos = o.followUpTodos.map(t =>
            t.id === todoId ? { ...t, ...patch, ...(patch.status === '已完成' ? { completedAt: nowStr() } : {}) } : t
          );
          return { ...o, followUpTodos: todos, updatedAt: nowStr() };
        });
        set({ orders: updated });
      },

      getAllFollowUps: () => {
        const todos: FollowUpTodo[] = [];
        get().orders.forEach(o => {
          if (o.followUpTodos) todos.push(...o.followUpTodos);
        });
        return todos.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      },

      getPendingFollowUps: () => {
        return get().getAllFollowUps().filter(t => t.status === '待处理');
      },

      getTodayPayments: () => {
        const today = todayStr();
        const records: PaymentRecord[] = [];
        get().orders.forEach(o => {
          if (o.paymentRecord && o.paymentRecord.payTime.startsWith(today)) {
            records.push(o.paymentRecord);
          }
        });
        return records.sort((a, b) => b.payTime.localeCompare(a.payTime));
      },

      getPendingPayments: () => {
        const result: { order: Order; totalAmount: number }[] = [];
        get().orders.forEach(o => {
          if (o.status === '进行中' || o.status === '待派工') {
            if (!o.paymentRecord) {
              const total = o.settlement.length > 0
                ? o.settlement.reduce((sum, i) => sum + i.subtotal, 0)
                : 0;
              if (total > 0) {
                result.push({ order: o, totalAmount: total });
              }
            }
          }
        });
        return result;
      },

      addOrder: (order) => {
        set({ orders: [order, ...get().orders] });
        get().recomputeDashboard();
      },

      getStats: () => {
        const orders = get().orders;
        const today = todayStr();
        const todayPaid = orders.reduce((sum, o) => {
          if (o.paymentRecord && o.paymentRecord.payTime.startsWith(today)) {
            return sum + o.paymentRecord.payAmount;
          }
          return sum;
        }, 0);
        const pendingPayment = orders.reduce((sum, o) => {
          if ((o.status === '进行中' || o.status === '待派工') && !o.paymentRecord) {
            return sum + (o.settlement.length > 0 ? o.settlement.reduce((s, i) => s + i.subtotal, 0) : 0);
          }
          return sum;
        }, 0);
        return {
          inService: orders.filter(o => o.status === '进行中').length,
          completed: orders.filter(o => o.status === '已完成').length,
          pendingSettlement: orders.filter(o => (o.status === '进行中' || o.status === '待派工') && o.settlement.length === 0).length,
          pendingReview: orders.filter(o => o.status === '已完成' && !o.review).length,
          pendingFollowUp: orders.reduce((count, o) => {
            return count + (o.followUpTodos?.filter(t => t.status === '待处理').length || 0);
          }, 0),
          todayPaid,
          pendingPayment
        };
      }
    }),
    {
      name: 'funeral-app-storage',
      storage: createJSONStorage(() => taroStorage),
      partialize: (state) => ({
        orders: state.orders,
        dashboardStats: state.dashboardStats,
        currentOrderId: state.currentOrderId
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.recomputeDashboard();
        }
      }
    }
  )
);
