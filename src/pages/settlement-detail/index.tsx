import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import classnames from 'classnames';
import type { SettlementItem } from '@/types';

const categoryIcon: Record<string, string> = {
  'service': '🛎️', '服务费': '🛎️',
  'material': '📦', '物资费': '📦',
  'staff': '👷', '人工费': '👷',
  'other': '📋', '其他费用': '📋', '其他': '📋'
};

const categoryName: Record<string, string> = {
  'service': '服务费', '服务费': '服务费',
  'material': '物资费', '物资费': '物资费',
  'staff': '人工费', '人工费': '人工费',
  'other': '其他费用', '其他费用': '其他费用', '其他': '其他费用'
};

const mockSettlement: SettlementItem[] = [
  { id: 'si1', category: 'service', name: '遗体接运费', spec: '专业接运车·单程50km内', quantity: 1, unitPrice: 800, subtotal: 800 },
  { id: 'si2', category: 'service', name: '遗容化妆整理', spec: '高级化妆师·专业服务', quantity: 1, unitPrice: 1200, subtotal: 1200 },
  { id: 'si3', category: 'service', name: '灵堂布置', spec: '标准型·含鲜花', quantity: 1, unitPrice: 3500, subtotal: 3500 },
  { id: 'si4', category: 'service', name: '告别仪式司仪', spec: '资深司仪·全程主持', quantity: 1, unitPrice: 2500, subtotal: 2500 },
  { id: 'si5', category: 'service', name: '火化服务', spec: '豪华炉·含入炉仪式', quantity: 1, unitPrice: 3800, subtotal: 3800 },
  { id: 'si6', category: 'material', name: '高档寿衣套装', spec: '七件套·真丝材质', quantity: 1, unitPrice: 3600, subtotal: 3600 },
  { id: 'si7', category: 'material', name: '红木骨灰盒', spec: '缅甸花梨·龙凤呈祥', quantity: 1, unitPrice: 5800, subtotal: 5800 },
  { id: 'si8', category: 'material', name: '祭奠用品套装', spec: '含香烛纸钱供品', quantity: 1, unitPrice: 580, subtotal: 580 },
  { id: 'si9', category: 'material', name: '鲜花花圈', spec: '白菊百合·直径1.2m', quantity: 4, unitPrice: 380, subtotal: 1520 },
  { id: 'si10', category: 'staff', name: '殡仪师全程服务', spec: '资深殡仪师王建国', quantity: 2, unitPrice: 600, subtotal: 1200 },
  { id: 'si11', category: 'staff', name: '礼仪服务人员', spec: '4人·全程引导', quantity: 4, unitPrice: 300, subtotal: 1200 },
];

const SettlementDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentOrderId, getOrderById, setCurrentOrder, completeOrder, setOrderSettlement } = useAppStore();
  const orderId = router.params.orderId || currentOrderId || '';

  useEffect(() => {
    if (orderId) setCurrentOrder(orderId);
  }, [orderId]);

  const order = getOrderById(orderId);

  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [items, setItems] = useState<SettlementItem[]>([]);

  useEffect(() => {
    if (order && order.settlement.length > 0) {
      setItems(order.settlement);
    } else {
      setItems(mockSettlement);
    }
  }, [orderId]);

  if (!order) {
    return (
      <View className={styles.page} style={{ padding: 100, textAlign: 'center' }}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
  const serviceFee = Math.floor(subtotal * 0.05);
  const discount = 500;
  const total = subtotal + serviceFee - discount;

  const groupedByCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SettlementItem[]>);

  const paymentOptions = [
    { key: 'wechat', name: '微信支付', desc: '推荐，支持电子凭证', icon: '💚' },
    { key: 'alipay', name: '支付宝', desc: '支持花呗分期', icon: '💙' },
    { key: 'bank', name: '银行卡', desc: '储蓄卡/信用卡', icon: '💳' },
    { key: 'cash', name: '现金支付', desc: '请到前台办理', icon: '💵' },
  ];

  const handlePay = () => {
    Taro.showModal({
      title: '确认支付',
      content: `应付金额: ¥${total.toLocaleString()}\n支付方式: ${paymentOptions.find(p => p.key === paymentMethod)?.name}`,
      confirmText: '确认支付',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '支付中...', mask: true });
          setTimeout(() => {
            Taro.hideLoading();
            setOrderSettlement(order.id, items);
            completeOrder(order.id);
            Taro.showToast({ title: '支付成功，订单已完成', icon: 'success' });
            setTimeout(() => Taro.navigateBack(), 1000);
          }, 1500);
        }
      }
    });
  };

  const handlePrint = () => {
    Taro.showModal({
      title: '报价单',
      content: `订单号: ${order.orderNo}\n服务项目: ${items.length}项\n应付金额: ¥${total.toLocaleString()}\n\n报价单已生成，可导出PDF。`,
      showCancel: false,
      confirmText: '查看'
    });
  };

  const handleAddItem = () => {
    Taro.showActionSheet({
      itemList: ['添加服务费', '添加物资费', '添加人工费', '添加其他费用'],
      success: () => {
        Taro.showToast({ title: '费用项已添加', icon: 'success' });
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerBadge}>报价单 BS-{order.orderNo}</View>
        <Text className={styles.headerLabel}>应付总金额</Text>
        <Text className={styles.totalAmount}>¥{total.toLocaleString()}</Text>
        <Text className={styles.totalLabel}>
          共 {items.length} 项收费
        </Text>
      </View>

      {Object.entries(groupedByCategory).map(([cat, catItems]) => {
        const catTotal = catItems.reduce((s, i) => s + i.subtotal, 0);
        return (
          <View key={cat} className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionTitleIcon}>{categoryIcon[cat]}</Text>
                {categoryName[cat]}
              </Text>
              <Text className={styles.sectionSubtitle}>
                {catItems.length}项 · ¥{catTotal.toLocaleString()}
              </Text>
            </View>
            <View className={styles.sectionBody}>
              {catItems.map((item, idx) => (
                <View key={item.id} className={styles.itemRow}>
                  <View className={styles.itemIcon}>
                    {idx + 1}
                  </View>
                  <View className={styles.itemInfo}>
                    <Text className={styles.itemName}>{item.name}</Text>
                    {item.spec && <Text className={styles.itemSpec}>{item.spec}</Text>}
                    <Text className={styles.itemQuantity}>
                      数量: {item.quantity} × ¥{item.unitPrice.toLocaleString()}
                    </Text>
                  </View>
                  <View className={styles.itemPrice}>
                    <Text className={styles.itemPriceValue}>
                      ¥{item.subtotal.toLocaleString()}
                    </Text>
                    <Text className={styles.itemUnitPrice}>小计</Text>
                  </View>
                </View>
              ))}
            </View>
            <View className={styles.addBtn} onClick={handleAddItem}>
              + 追加费用项
            </View>
          </View>
        );
      })}

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionTitleIcon}>📊</Text>
            费用合计
          </Text>
        </View>
        <View className={styles.sectionBody} style={{ paddingVertical: 16 }}>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>费用小计</Text>
            <Text className={styles.summaryValue}>¥{subtotal.toLocaleString()}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>服务费 (5%)</Text>
            <Text className={styles.summaryValue}>¥{serviceFee.toLocaleString()}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>
              套餐优惠
              <View className={styles.discountTag}>会员折扣</View>
            </Text>
            <Text className={styles.summaryValue} style={{ color: '#00B42A' }}>
              - ¥{discount.toLocaleString()}
            </Text>
          </View>
          <View className={classnames(styles.summaryRow, styles.highlight)}>
            <Text className={styles.summaryLabel}>应付总额</Text>
            <Text className={styles.summaryValue}>¥{total.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.paymentSection}>
          <Text className={styles.paymentTitle}>选择支付方式</Text>
          <View className={styles.paymentOptions}>
            {paymentOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(styles.paymentOption, {
                  [styles.paymentOptionActive]: paymentMethod === opt.key
                })}
                onClick={() => setPaymentMethod(opt.key)}
              >
                <View className={styles.paymentIcon}>{opt.icon}</View>
                <View className={styles.paymentInfo}>
                  <Text className={styles.paymentName}>{opt.name}</Text>
                  <Text className={styles.paymentDesc}>{opt.desc}</Text>
                </View>
                <View className={classnames(styles.paymentRadio, {
                  [styles.paymentRadioActive]: paymentMethod === opt.key
                })} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.footerTotal}>
          <Text className={styles.footerTotalLabel}>应付金额</Text>
          <Text className={styles.footerTotalValue}>¥{total.toLocaleString()}</Text>
        </View>
        <Button className={styles.btnPrint} onClick={handlePrint}>
          📄 报价单
        </Button>
        <Button className={styles.btnPay} onClick={handlePay}>
          💰 确认支付
        </Button>
      </View>
    </ScrollView>
  );
};

export default SettlementDetailPage;
