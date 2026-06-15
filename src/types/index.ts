export interface Package {
  id: string;
  name: string;
  level: 'basic' | 'standard' | 'premium';
  price: number;
  originalPrice?: number;
  description: string;
  imageUrl: string;
  services: PackageService[];
  features: string[];
  suitable: string;
}

export interface PackageService {
  name: string;
  included: boolean;
  remark?: string;
}

export interface Deceased {
  name: string;
  gender: 'male' | 'female';
  age: number;
  dateOfDeath: string;
  placeOfDeath: string;
  religion?: string;
  customs?: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  phone: string;
  isPrimary: boolean;
}

export interface ProcessNode {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledTime?: string;
  completedTime?: string;
  assignee?: string;
  remark?: string;
}

export interface Staff {
  id: string;
  name: string;
  role: '司仪' | '服务人员' | '接运员' | '化妆师' | '其他';
  phone: string;
  status: '空闲' | '工作中' | '休息';
  currentTask?: string;
  avatar: string;
  rating?: number;
  completedTasks?: number;
}

export interface DispatchTask {
  staffId: string;
  staffName: string;
  role: string;
  taskDesc: string;
  scheduledTime: string;
  status: '待开始' | '进行中' | '已完成';
}

export interface Material {
  id: string;
  name: string;
  category: '寿衣' | '骨灰盒' | '祭奠用品' | '其他';
  price: number;
  stock: number;
  warningStock: number;
  unit: string;
  imageUrl: string;
  description?: string;
  specifications?: string;
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ChatMessage {
  id: string;
  sender: 'staff' | 'family';
  senderName: string;
  content: string;
  time: string;
  type: 'text' | 'image' | 'system';
}

export interface SettlementItem {
  id: string;
  name: string;
  category: '服务费' | '物资费' | '其他';
  unitPrice: number;
  quantity: number;
  subtotal: number;
  remark?: string;
}

export interface Quotation {
  id: string;
  orderId: string;
  items: SettlementItem[];
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  status: '待确认' | '已确认' | '已支付';
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  overallRating: number;
  serviceRatings: {
    professionalism: number;
    attitude: number;
    timeliness: number;
  };
  content: string;
  images?: string[];
  createdAt: string;
  followUp?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  status: '待派工' | '进行中' | '已完成' | '已取消';
  urgency: '普通' | '紧急';
  packageId?: string;
  packageName?: string;
  deceased: Deceased;
  familyMembers: FamilyMember[];
  processNodes: ProcessNode[];
  dispatchTasks: DispatchTask[];
  materialUsages: MaterialUsage[];
  chatMessages: ChatMessage[];
  settlement: SettlementItem[];
  quotation?: Quotation;
  review?: Review;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
  serviceAddress: string;
}

export interface DashboardStats {
  todayOrders: number;
  pendingDispatch: number;
  inProgressOrders: number;
  completedToday: number;
  urgentOrders: number;
}
