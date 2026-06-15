import { Package } from '@/types';

export const mockPackages: Package[] = [
  {
    id: 'pkg-001',
    name: '温馨安宁套餐',
    level: 'basic',
    price: 8800,
    originalPrice: 12800,
    description: '基础治丧服务，让逝者体面走完最后一程',
    imageUrl: 'https://picsum.photos/id/103/750/500',
    services: [
      { name: '遗体接运（市区内）', included: true },
      { name: '遗体冷藏（3天内）', included: true },
      { name: '遗容整理', included: true },
      { name: '简易灵堂布置', included: true },
      { name: '寿衣一套（基础款）', included: true },
      { name: '骨灰盒（檀木标准）', included: true },
      { name: '告别仪式（小厅）', included: true, remark: '限50人以内' },
      { name: '火化服务代办', included: true },
      { name: '司仪服务', included: false },
      { name: '鲜花灵车', included: false },
      { name: '豪华灵堂布置', included: false },
      { name: '安葬服务', included: false }
    ],
    features: ['24小时响应', '专业团队', '透明收费', '市区免费接运'],
    suitable: '适合追求实用、预算适中的家庭'
  },
  {
    id: 'pkg-002',
    name: '尊贵永念套餐',
    level: 'standard',
    price: 18800,
    originalPrice: 25800,
    description: '标准治丧服务，全方位贴心陪伴',
    imageUrl: 'https://picsum.photos/id/1015/750/500',
    services: [
      { name: '遗体接运（市区内）', included: true },
      { name: '遗体冷藏（5天内）', included: true },
      { name: '遗容整理（专业化妆）', included: true },
      { name: '标准灵堂布置', included: true },
      { name: '寿衣一套（高档款）', included: true },
      { name: '骨灰盒（紫檀精工）', included: true },
      { name: '告别仪式（中厅）', included: true, remark: '限100人以内' },
      { name: '火化服务代办', included: true },
      { name: '司仪服务（全程主持）', included: true },
      { name: '鲜花灵车', included: true },
      { name: '骨灰寄存（1年）', included: true },
      { name: '豪华灵堂布置', included: false },
      { name: '安葬服务', included: false }
    ],
    features: ['24小时专属顾问', '司仪全程主持', '鲜花布置', '专业摄影'],
    suitable: '适合需要完善服务、希望告别仪式庄重体面的家庭'
  },
  {
    id: 'pkg-003',
    name: '尊享永恒套餐',
    level: 'premium',
    price: 38800,
    originalPrice: 52800,
    description: '至尊治丧服务，奢华定制尊贵告别',
    imageUrl: 'https://picsum.photos/id/787/750/500',
    services: [
      { name: '遗体接运（全市区）', included: true },
      { name: '遗体冷藏（7天内）', included: true },
      { name: '遗容整理（特级化妆师）', included: true },
      { name: '豪华灵堂布置', included: true },
      { name: '寿衣一套（定制款）', included: true },
      { name: '骨灰盒（红木雕刻）', included: true },
      { name: '告别仪式（大厅）', included: true, remark: '限200人以内' },
      { name: '火化服务VIP通道', included: true },
      { name: '金牌司仪服务', included: true },
      { name: '鲜花灵车（豪车）', included: true },
      { name: '骨灰寄存（3年）', included: true },
      { name: '安葬服务（含墓碑）', included: true },
      { name: '追思视频制作', included: true },
      { name: '七期祭祀代办', included: true }
    ],
    features: ['VIP专属顾问一对一对接', '金牌司仪', '豪华鲜花布置', '全程跟拍摄影', '宗教习俗适配', '七期祭祀服务'],
    suitable: '适合追求品质、需要定制化高端服务的家庭'
  },
  {
    id: 'pkg-004',
    name: '生态环保套餐',
    level: 'basic',
    price: 5800,
    originalPrice: 8800,
    description: '绿色环保，简约而不简单',
    imageUrl: 'https://picsum.photos/id/1039/750/500',
    services: [
      { name: '遗体接运（市区内）', included: true },
      { name: '遗体冷藏（2天内）', included: true },
      { name: '遗容整理', included: true },
      { name: '简约告别厅', included: true, remark: '限30人以内' },
      { name: '寿衣一套（环保款）', included: true },
      { name: '可降解骨灰盒', included: true },
      { name: '火化服务代办', included: true },
      { name: '树葬/海葬咨询', included: true },
      { name: '司仪服务', included: false },
      { name: '豪华灵堂布置', included: false },
      { name: '骨灰寄存', included: false }
    ],
    features: ['环保理念', '简约仪式', '惠民价格', '生态安葬咨询'],
    suitable: '适合注重环保、选择生态安葬方式的家庭'
  }
];
