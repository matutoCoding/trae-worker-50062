import { create } from 'zustand';
import { Order, Package, Staff, Material, DashboardStats } from '@/types';
import { mockOrders, mockDashboardStats } from '@/data/orders';
import { mockPackages } from '@/data/packages';
import { mockStaffList } from '@/data/staff';
import { mockMaterials } from '@/data/materials';

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
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addDispatchTask: (orderId: string, task: Order['dispatchTasks'][0]) => void;
  addOrder: (order: Order) => void;
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

  updateOrderStatus: (orderId, status) => {
    const updated = get().orders.map(o =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o
    );
    set({ orders: updated });
  },

  addDispatchTask: (orderId, task) => {
    const updated = get().orders.map(o =>
      o.id === orderId ? { ...o, dispatchTasks: [...o.dispatchTasks, task] } : o
    );
    set({ orders: updated });
  },

  addOrder: (order) => {
    set({ orders: [order, ...get().orders] });
  }
}));
