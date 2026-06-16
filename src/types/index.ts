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

export type StaffStatus = '空闲' | '工作中' | '休息' | 'available' | 'busy' | 'off';

export interface Staff {
  id: string;
  name: string;
  role: '司仪' | '服务人员' | '接运员' | '化妆师' | '殡仪师' | '火化师' | '乐师' | '礼仪师' | '管理员' | '其他';
  phone: string;
  status: StaffStatus;
  currentTask?: string;
  avatar: string;
  rating?: number;
  ratingValue?: number;
  completedTasks?: number;
  tasksToday?: number;
  completionRate?: number;
}

export interface DispatchTask {
  id?: string;
  staffId?: string;
  staffIds?: string[];
  staffName?: string;
  role?: string;
  taskDesc?: string;
  taskName?: string;
  processNodeId?: string;
  scheduledTime?: string;
  startTime?: string;
  status: '待开始' | '进行中' | '已完成' | 'pending' | 'in_progress' | 'completed';
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

export type SettlementCategory = 'service' | 'material' | 'staff' | 'other' | '服务费' | '物资费' | '人工费' | '其他';

export interface SettlementItem {
  id: string;
  name: string;
  category: SettlementCategory;
  spec?: string;
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

export type FollowUpKey = 'week7' | 'week49' | 'year1' | 'qingming';

export interface FollowUpPlan {
  key: FollowUpKey | string;
  name: string;
  desc: string;
  icon?: string;
  enabled: boolean;
}

export type PaymentMethod = 'wechat' | 'alipay' | 'bank' | 'cash' | '微信' | '支付宝' | '银行转账' | '现金';

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNo: string;
  deceasedName: string;
  payMethod: PaymentMethod;
  payAmount: number;
  items: SettlementItem[];
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  payerName?: string;
  payTime: string;
  remark?: string;
}

export type FollowUpStatus = '待处理' | '已完成' | '已取消';
export type FollowUpType = '首七' | '三七' | '五七' | '七七' | '百日' | '周年' | '清明' | '寒衣' | '周年祭';

export interface FollowUpTodo {
  id: string;
  orderId: string;
  orderNo: string;
  deceasedName: string;
  familyContact: string;
  familyPhone: string;
  type: FollowUpType;
  scheduledDate: string;
  status: FollowUpStatus;
  remark?: string;
  completedAt?: string;
  followUpContent?: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  overallRating: number;
  serviceRatings: Record<string, number>;
  content: string;
  tags: string[];
  images?: string[];
  createdAt: string;
  followUpPlan?: FollowUpPlan[];
  reviewerName?: string;
  followUp?: string;
  professionalism?: number;
  attitude?: number;
  timeliness?: number;
}

export type OrderStatus = '待派工' | '进行中' | '已完成' | '已取消';

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
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
  paymentRecord?: PaymentRecord;
  followUpTodos?: FollowUpTodo[];
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
