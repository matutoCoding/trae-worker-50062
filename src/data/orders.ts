import { Order, DashboardStats } from '@/types';

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    orderNo: 'BS20260616001',
    status: '进行中',
    urgency: '紧急',
    packageId: 'pkg-002',
    packageName: '尊贵永念套餐',
    deceased: {
      name: '王建国',
      gender: 'male',
      age: 78,
      dateOfDeath: '2026-06-16 03:20',
      placeOfDeath: '市第一人民医院',
      religion: '佛教',
      customs: '传统汉族葬礼'
    },
    familyMembers: [
      { name: '王志强', relation: '长子', phone: '138****1234', isPrimary: true },
      { name: '王志芳', relation: '女儿', phone: '139****5678', isPrimary: false }
    ],
    processNodes: [
      { id: 'pn1', name: '遗体接运', description: '从医院接运至殡仪馆', status: 'completed', completedTime: '2026-06-16 04:30', assignee: '接运组张师傅' },
      { id: 'pn2', name: '遗容整理', description: '专业化妆师进行遗容整理', status: 'completed', completedTime: '2026-06-16 06:00', assignee: '化妆师李姐' },
      { id: 'pn3', name: '灵堂布置', description: '标准灵堂鲜花布置', status: 'in_progress', scheduledTime: '2026-06-16 08:00-10:00', assignee: '布置组' },
      { id: 'pn4', name: '守灵仪式', description: '家属守灵及祭奠', status: 'pending', scheduledTime: '2026-06-16 14:00起' },
      { id: 'pn5', name: '告别仪式', description: '中厅告别仪式', status: 'pending', scheduledTime: '2026-06-17 09:00-10:00' },
      { id: 'pn6', name: '火化', description: '火化及骨灰整理', status: 'pending', scheduledTime: '2026-06-17 10:30' },
      { id: 'pn7', name: '骨灰寄存', description: '骨灰寄存服务', status: 'pending' }
    ],
    dispatchTasks: [
      { staffId: 's001', staffName: '张文博', role: '司仪', taskDesc: '全程主持告别仪式', scheduledTime: '2026-06-17 09:00', status: '待开始' },
      { staffId: 's002', staffName: '李美丽', role: '化妆师', taskDesc: '遗容整理化妆', scheduledTime: '2026-06-16 06:00', status: '已完成' },
      { staffId: 's003', staffName: '王大勇', role: '接运员', taskDesc: '医院接运遗体', scheduledTime: '2026-06-16 03:40', status: '已完成' },
      { staffId: 's004', staffName: '陈静静', role: '服务人员', taskDesc: '家属接待与服务', scheduledTime: '2026-06-16 全天', status: '进行中' }
    ],
    materialUsages: [
      { materialId: 'm001', materialName: '高档寿衣（男款）', quantity: 1, unitPrice: 1800, subtotal: 1800 },
      { materialId: 'm005', materialName: '紫檀骨灰盒', quantity: 1, unitPrice: 3800, subtotal: 3800 },
      { materialId: 'm010', materialName: '鲜花花圈', quantity: 4, unitPrice: 280, subtotal: 1120 }
    ],
    chatMessages: [
      { id: 'c1', sender: 'staff', senderName: '客服小吴', content: '您好，请问有什么需要帮助的？', time: '2026-06-16 03:25', type: 'text' },
      { id: 'c2', sender: 'family', senderName: '王志强', content: '我父亲刚刚在市人民医院去世，我们需要安排治丧服务', time: '2026-06-16 03:26', type: 'text' },
      { id: 'c3', sender: 'staff', senderName: '客服小吴', content: '非常抱歉听到这个消息。请您节哀顺变。请问您希望选择哪个服务套餐？', time: '2026-06-16 03:27', type: 'text' },
      { id: 'c4', sender: 'family', senderName: '王志强', content: '我们选尊贵永念套餐吧，价格18800的那个。另外有什么特别需要注意的佛教仪式吗？', time: '2026-06-16 03:30', type: 'text' },
      { id: 'c5', sender: 'system', senderName: '系统', content: '客户选择尊贵永念套餐，需要佛教仪式适配', time: '2026-06-16 03:31', type: 'system' }
    ],
    settlement: [
      { id: 'st1', name: '尊贵永念套餐服务费', category: '服务费', unitPrice: 18800, quantity: 1, subtotal: 18800, remark: '含遗体接运、冷藏、灵堂布置等' },
      { id: 'st2', name: '高档寿衣（男款）', category: '物资费', unitPrice: 1800, quantity: 1, subtotal: 1800 },
      { id: 'st3', name: '紫檀骨灰盒', category: '物资费', unitPrice: 3800, quantity: 1, subtotal: 3800 },
      { id: 'st4', name: '鲜花花圈', category: '物资费', unitPrice: 280, quantity: 4, subtotal: 1120 },
      { id: 'st5', name: '佛教仪式定制', category: '其他', unitPrice: 2000, quantity: 1, subtotal: 2000, remark: '含诵经、法事等' }
    ],
    specialRequirements: '1. 需要佛教诵经法事 2. 守灵期间准备素食 3. 遗体接运需在30分钟内到达',
    createdAt: '2026-06-16 03:25',
    updatedAt: '2026-06-16 08:15',
    serviceAddress: '市殡仪馆 · 中厅 · 莲花厅'
  },
  {
    id: 'ord-002',
    orderNo: 'BS20260615003',
    status: '进行中',
    urgency: '普通',
    packageId: 'pkg-001',
    packageName: '温馨安宁套餐',
    deceased: {
      name: '李秀英',
      gender: 'female',
      age: 85,
      dateOfDeath: '2026-06-15 18:40',
      placeOfDeath: '家中（安详离世）'
    },
    familyMembers: [
      { name: '张卫国', relation: '儿子', phone: '136****9876', isPrimary: true }
    ],
    processNodes: [
      { id: 'pn1', name: '遗体接运', description: '从家中接运至殡仪馆', status: 'completed', completedTime: '2026-06-15 19:30', assignee: '接运组刘师傅' },
      { id: 'pn2', name: '遗容整理', description: '基础遗容整理', status: 'completed', completedTime: '2026-06-15 20:30', assignee: '化妆师王姐' },
      { id: 'pn3', name: '灵堂布置', description: '简易灵堂布置', status: 'completed', completedTime: '2026-06-15 22:00', assignee: '布置组' },
      { id: 'pn4', name: '守灵仪式', description: '家属守灵', status: 'completed', completedTime: '2026-06-16 上午' },
      { id: 'pn5', name: '告别仪式', description: '小厅告别仪式', status: 'completed', completedTime: '2026-06-16 08:30', assignee: '司仪周老师' },
      { id: 'pn6', name: '火化', description: '火化及骨灰整理', status: 'in_progress', scheduledTime: '2026-06-16 10:00', assignee: '火化组' },
      { id: 'pn7', name: '家属送别', description: '领取骨灰与送别', status: 'pending', scheduledTime: '2026-06-16 12:00' }
    ],
    dispatchTasks: [
      { staffId: 's006', staffName: '周文华', role: '司仪', taskDesc: '主持告别仪式', scheduledTime: '2026-06-16 08:30', status: '已完成' },
      { staffId: 's007', staffName: '王淑华', role: '化妆师', taskDesc: '遗容整理', scheduledTime: '2026-06-15 20:30', status: '已完成' },
      { staffId: 's005', staffName: '刘建军', role: '接运员', taskDesc: '家中接运', scheduledTime: '2026-06-15 19:00', status: '已完成' }
    ],
    materialUsages: [
      { materialId: 'm002', materialName: '基础寿衣（女款）', quantity: 1, unitPrice: 880, subtotal: 880 },
      { materialId: 'm004', materialName: '檀木骨灰盒', quantity: 1, unitPrice: 1800, subtotal: 1800 }
    ],
    chatMessages: [
      { id: 'c1', sender: 'family', senderName: '张卫国', content: '母亲在家中安详离世，需要安排治丧', time: '2026-06-15 18:45', type: 'text' },
      { id: 'c2', sender: 'staff', senderName: '客服小吴', content: '非常抱歉，请节哀。我们马上安排接运车辆，请告知详细地址', time: '2026-06-15 18:46', type: 'text' }
    ],
    settlement: [
      { id: 'st1', name: '温馨安宁套餐服务费', category: '服务费', unitPrice: 8800, quantity: 1, subtotal: 8800 },
      { id: 'st2', name: '基础寿衣（女款）', category: '物资费', unitPrice: 880, quantity: 1, subtotal: 880 },
      { id: 'st3', name: '檀木骨灰盒', category: '物资费', unitPrice: 1800, quantity: 1, subtotal: 1800 }
    ],
    specialRequirements: '母亲生前喜欢素雅，灵堂布置以白色为主',
    createdAt: '2026-06-15 18:45',
    updatedAt: '2026-06-16 10:15',
    serviceAddress: '市殡仪馆 · 小厅 · 梅香厅'
  },
  {
    id: 'ord-003',
    orderNo: 'BS20260614007',
    status: '待派工',
    urgency: '紧急',
    deceased: {
      name: '赵厚德',
      gender: 'male',
      age: 62,
      dateOfDeath: '2026-06-16 07:50',
      placeOfDeath: '市中医院',
      religion: '道教'
    },
    familyMembers: [
      { name: '赵明轩', relation: '儿子', phone: '137****4321', isPrimary: true },
      { name: '赵雅琴', relation: '女儿', phone: '135****8765', isPrimary: false }
    ],
    processNodes: [
      { id: 'pn1', name: '遗体接运', description: '从医院接运至殡仪馆', status: 'pending' },
      { id: 'pn2', name: '遗容整理', description: '遗容整理', status: 'pending' },
      { id: 'pn3', name: '灵堂布置', description: '灵堂布置', status: 'pending' },
      { id: 'pn4', name: '治丧仪式', description: '道教仪式及告别', status: 'pending' },
      { id: 'pn5', name: '火化', description: '火化', status: 'pending' }
    ],
    dispatchTasks: [],
    materialUsages: [],
    chatMessages: [
      { id: 'c1', sender: 'family', senderName: '赵明轩', content: '父亲刚刚离世，需要加急服务，道教仪式', time: '2026-06-16 07:52', type: 'text' }
    ],
    settlement: [],
    specialRequirements: '需要道教法事，加急安排！',
    createdAt: '2026-06-16 07:52',
    updatedAt: '2026-06-16 07:55',
    serviceAddress: '待确认'
  },
  {
    id: 'ord-004',
    orderNo: 'BS20260610012',
    status: '已完成',
    urgency: '普通',
    packageId: 'pkg-003',
    packageName: '尊享永恒套餐',
    deceased: {
      name: '孙德华',
      gender: 'male',
      age: 92,
      dateOfDeath: '2026-06-10 11:30',
      placeOfDeath: '市养老中心'
    },
    familyMembers: [
      { name: '孙家栋', relation: '孙子', phone: '138****1111', isPrimary: true }
    ],
    processNodes: [
      { id: 'pn1', name: '遗体接运', description: '接运遗体', status: 'completed', completedTime: '2026-06-10 12:30' },
      { id: 'pn2', name: '遗容整理', description: '特级化妆师', status: 'completed', completedTime: '2026-06-10 14:00' },
      { id: 'pn3', name: '豪华灵堂布置', description: '鲜花布置', status: 'completed', completedTime: '2026-06-10 17:00' },
      { id: 'pn4', name: '守灵与告别', description: '大厅告别仪式', status: 'completed', completedTime: '2026-06-11 10:00' },
      { id: 'pn5', name: 'VIP火化', description: 'VIP通道', status: 'completed', completedTime: '2026-06-11 11:00' },
      { id: 'pn6', name: '安葬服务', description: '墓园安葬含墓碑', status: 'completed', completedTime: '2026-06-12 09:00' }
    ],
    dispatchTasks: [],
    materialUsages: [],
    chatMessages: [],
    settlement: [
      { id: 'st1', name: '尊享永恒套餐', category: '服务费', unitPrice: 38800, quantity: 1, subtotal: 38800 },
      { id: 'st2', name: '定制寿衣', category: '物资费', unitPrice: 3800, quantity: 1, subtotal: 3800 },
      { id: 'st3', name: '红木骨灰盒', category: '物资费', unitPrice: 6800, quantity: 1, subtotal: 6800 },
      { id: 'st4', name: '追思视频制作', category: '其他', unitPrice: 3000, quantity: 1, subtotal: 3000 }
    ],
    specialRequirements: '追思视频需要包含爷爷生前照片',
    createdAt: '2026-06-10 11:35',
    updatedAt: '2026-06-12 15:00',
    serviceAddress: '市殡仪馆 · 大厅 · 永安厅'
  },
  {
    id: 'ord-005',
    orderNo: 'BS20260616002',
    status: '待派工',
    urgency: '普通',
    deceased: {
      name: '陈慧芳',
      gender: 'female',
      age: 72,
      dateOfDeath: '2026-06-16 06:15',
      placeOfDeath: '家中'
    },
    familyMembers: [
      { name: '陈志远', relation: '儿子', phone: '139****2222', isPrimary: true }
    ],
    processNodes: [
      { id: 'pn1', name: '遗体接运', status: 'pending' },
      { id: 'pn2', name: '遗容整理', status: 'pending' },
      { id: 'pn3', name: '灵堂布置', status: 'pending' },
      { id: 'pn4', name: '告别仪式', status: 'pending' },
      { id: 'pn5', name: '火化', status: 'pending' }
    ],
    dispatchTasks: [],
    materialUsages: [],
    chatMessages: [],
    settlement: [],
    createdAt: '2026-06-16 06:20',
    updatedAt: '2026-06-16 06:25',
    serviceAddress: '待确认'
  }
];

export const mockDashboardStats: DashboardStats = {
  todayOrders: 5,
  pendingDispatch: 2,
  inProgressOrders: 2,
  completedToday: 1,
  urgentOrders: 2
};
