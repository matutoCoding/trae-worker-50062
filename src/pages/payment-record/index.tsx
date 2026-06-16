import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/useStore';
import { PaymentMethod } from '@/types';
import styles from './index.module.scss';

const getMethodLabel = (method: PaymentMethod): string => {
  const map: Record<string, string> = {
    wechat: '微信支付',
    alipay: '支付宝',
    bank: '银行转账',
    cash: '现金',
    '微信': '微信支付',
    '支付宝': '支付宝',
    '银行转账': '银行转账',
    '现金': '现金'
  };
  return map[String(method)] || String(method);
};

const PaymentRecordPage: React.FC = () => {
  const router = useRouter();
  const recordId = router.params.recordId;
  const orderId = router.params.orderId;

  const getPaymentRecordById = useAppStore(s => s.getPaymentRecordById);
  const getOrderById = useAppStore(s => s.getOrderById);

  const record = useMemo(() => {
    if (recordId) return getPaymentRecordById(recordId);
    if (orderId) {
      const order = getOrderById(orderId);
      return order?.paymentRecord;
    }
    return undefined;
  }, [recordId, orderId, getPaymentRecordById, getOrderById]);

  if (!record) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <Text className={styles.title}>收款记录</Text>
        </View>
        <View className={styles.empty}>
          <View className={styles.emptyIcon}>📄</View>
          <Text>暂无收款记录</Text>
        </View>
      </View>
    );
  }

  const handleBackToDetail = () => {
    Taro.redirectTo({ url: `/pages/order-detail/index?orderId=${record.orderId}` });
  };

  const handleBackToHome = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>收款成功</Text>
        <Text className={styles.subtitle}>费用已结清</Text>
      </View>

      <View className={styles.successCard}>
        <View className={styles.successIcon}>✓</View>
        <Text className={styles.successText}>支付成功</Text>
        <Text className={styles.amount}>¥{record.payAmount.toFixed(2)}</Text>
        <Text className={styles.payTime}>支付时间：{record.payTime}</Text>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>订单信息</Text>
        <View className={styles.infoRow}>
          <Text className={styles.label}>订单编号</Text>
          <Text className={styles.value}>{record.orderNo}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>逝者姓名</Text>
          <Text className={styles.value}>{record.deceasedName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>支付方式</Text>
          <View className={styles.methodTag}>{getMethodLabel(record.payMethod)}</View>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>付款人</Text>
          <Text className={styles.value}>{record.payerName || '家属'}</Text>
        </View>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>收费明细</Text>
        <View className={styles.itemsList}>
          {record.items.map((item, idx) => (
            <View key={item.id || idx} className={styles.itemRow}>
              <View className={styles.itemInfo}>
                <Text className={styles.itemName}>{item.name}</Text>
                {item.spec && <Text className={styles.itemSpec}>{item.spec}</Text>}
                <Text className={styles.itemSpec}>¥{item.unitPrice.toFixed(2)} × {item.quantity}</Text>
              </View>
              <Text className={styles.itemAmount}>¥{item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>¥{record.finalAmount.toFixed(2)}</Text>
        </View>
      </View>

      {record.remark && (
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>备注</Text>
          <Text className={styles.value}>{record.remark}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <View className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleBackToHome}>
          返回首页
        </View>
        <View className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleBackToDetail}>
          查看订单
        </View>
      </View>
    </View>
  );
};

export default PaymentRecordPage;
