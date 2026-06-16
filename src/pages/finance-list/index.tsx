import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store/useStore';
import { PaymentMethod, PaymentType, FinanceStatus } from '@/types';
import styles from './index.module.scss';

type PageMode = 'today' | 'pending' | 'all';

const METHOD_OPTIONS: { key: PaymentMethod; name: string }[] = [
  { key: 'wechat', name: '微信' },
  { key: 'alipay', name: '支付宝' },
  { key: 'bank', name: '银行卡' },
  { key: 'cash', name: '现金' }
];

const STATUS_MAP: Record<FinanceStatus, { label: string; className: string }> = {
  '已结清': { label: '已结清', className: 'statusPaid' },
  '待收款': { label: '待收款', className: 'statusPending' },
  '部分收款': { label: '部分收款', className: 'statusPartial' },
  '需退款': { label: '需退款', className: 'statusRefund' },
  '待补收': { label: '待补收', className: 'statusPending' },
  '未报价': { label: '未报价', className: 'statusPending' }
};

const FinanceListPage: React.FC = () => {
  const router = useRouter();
  const mode = (router.params.mode as PageMode) || 'pending';

  const getAllPayments = useAppStore(s => s.getAllPayments);
  const getPendingPayments = useAppStore(s => s.getPendingPayments);
  const getTodayPayments = useAppStore(s => s.getTodayPayments);
  const getOrderSettlementTotal = useAppStore(s => s.getOrderSettlementTotal);
  const getOrderPaidAmount = useAppStore(s => s.getOrderPaidAmount);
  const getOrderFinanceStatus = useAppStore(s => s.getOrderFinanceStatus);
  const getOrderById = useAppStore(s => s.getOrderById);
  const addPaymentRecord = useAppStore(s => s.addPaymentRecord);
  const getStats = useAppStore(s => s.getStats);

  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'supplement' | 'refund'>('supplement');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [inputMethod, setInputMethod] = useState<PaymentMethod>('wechat');
  const [inputRemark, setInputRemark] = useState('');

  const stats = getStats();

  const { orders, totalAmount, totalPaid, totalRemaining } = useMemo(() => {
    let orderList: { orderId: string; orderNo: string; deceasedName: string; status: FinanceStatus; total: number; paid: number; remaining: number; payTime?: string }[] = [];
    let t = 0, p = 0, r = 0;

    if (mode === 'today') {
      const records = getTodayPayments();
      const orderMap = new Map<string, { total: number; paid: number; payTime: string }>();
      records.forEach(rec => {
        const existing = orderMap.get(rec.orderId) || { total: 0, paid: 0, payTime: rec.payTime };
        if (rec.type === 'refund' || rec.type === '退款') {
          existing.paid -= rec.payAmount;
        } else {
          existing.paid += rec.payAmount;
        }
        orderMap.set(rec.orderId, existing);
      });
      orderMap.forEach((val, orderId) => {
        const order = getOrderById(orderId);
        if (!order) return;
        const total = getOrderSettlementTotal(orderId);
        const status = getOrderFinanceStatus(orderId);
        orderList.push({
          orderId,
          orderNo: order.orderNo,
          deceasedName: order.deceased.name,
          status,
          total,
          paid: val.paid,
          remaining: total - val.paid,
          payTime: val.payTime
        });
        t += total;
        p += val.paid;
        r += (total - val.paid);
      });
    } else if (mode === 'pending') {
      const pendings = getPendingPayments();
      pendings.forEach(p => {
        orderList.push({
          orderId: p.order.id,
          orderNo: p.order.orderNo,
          deceasedName: p.order.deceased.name,
          status: p.status,
          total: p.totalAmount,
          paid: p.paidAmount,
          remaining: p.remaining
        });
        t += p.totalAmount;
        p += p.paidAmount;
        r += p.remaining;
      });
    } else {
      const allPayments = getAllPayments();
      const orderMap = new Map<string, { paid: number }>();
      allPayments.forEach(rec => {
        const existing = orderMap.get(rec.orderId) || { paid: 0 };
        if (rec.type === 'refund' || rec.type === '退款') {
          existing.paid -= rec.payAmount;
        } else {
          existing.paid += rec.payAmount;
        }
        orderMap.set(rec.orderId, existing);
      });
      const allOrders = useAppStore.getState().orders;
      allOrders.forEach(order => {
        if (order.settlement.length === 0) return;
        const paid = orderMap.get(order.id)?.paid || 0;
        const total = getOrderSettlementTotal(order.id);
        const status = getOrderFinanceStatus(order.id);
        orderList.push({
          orderId: order.id,
          orderNo: order.orderNo,
          deceasedName: order.deceased.name,
          status,
          total,
          paid,
          remaining: total - paid
        });
        t += total;
        p += paid;
        r += (total - paid);
      });
    }

    return {
      orders: orderList.sort((a, b) => (b.payTime || '').localeCompare(a.payTime || '')),
      totalAmount: t,
      totalPaid: p,
      totalRemaining: r
    };
  }, [mode, getTodayPayments, getPendingPayments, getAllPayments, getOrderById, getOrderSettlementTotal, getOrderFinanceStatus]);

  const filteredOrders = useMemo(() => {
    let list = orders;
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(o =>
        o.orderNo.toLowerCase().includes(kw) ||
        o.deceasedName.toLowerCase().includes(kw)
      );
    }
    if (statusFilter !== 'all') {
      list = list.filter(o => o.status === statusFilter);
    }
    return list;
  }, [orders, keyword, statusFilter]);

  const pageTitle = mode === 'today' ? '今日收款' : mode === 'pending' ? '待收款' : '财务对账';

  const goOrderDetail = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` });
  };

  const goSettlement = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/settlement-detail/index?orderId=${orderId}` });
  };

  const openSupplementModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalType('supplement');
    setInputAmount('');
    setInputRemark('');
    setInputMethod('wechat');
    setShowModal(true);
  };

  const openRefundModal = (orderId: string) => {
    setSelectedOrderId(orderId);
    setModalType('refund');
    setInputAmount('');
    setInputRemark('');
    setInputMethod('wechat');
    setShowModal(true);
  };

  const confirmPayment = () => {
    const amount = parseFloat(inputAmount);
    if (!amount || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' });
      return;
    }
    const type: PaymentType = modalType === 'supplement' ? '补收' : '退款';
    const result = addPaymentRecord(selectedOrderId, {
      type,
      payMethod: inputMethod,
      payAmount: amount,
      items: [],
      totalAmount: amount,
      finalAmount: amount,
      remark: inputRemark || undefined,
      payerName: '家属'
    });
    if (result) {
      setShowModal(false);
      Taro.showToast({ title: modalType === 'supplement' ? '补收登记成功' : '退款登记成功', icon: 'success' });
    }
  };

  const statusOptions = ['all', '待收款', '部分收款', '已结清', '需退款'];

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.title}>{pageTitle}</Text>
      </View>

      <View className={styles.summaryCard}>
        <View className={styles.summaryRow}>
          <Text className={styles.summaryLabel}>
            {mode === 'today' ? '今日已收' : mode === 'pending' ? '待收总额' : '应收总额'}
          </Text>
          <Text className={styles.summaryAmount}>
            ¥{(mode === 'pending' ? totalRemaining : totalPaid).toFixed(2)}
          </Text>
        </View>
        <View className={styles.summaryDetails}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>{filteredOrders.length}</Text>
            <Text className={styles.summaryItemLabel}>订单数</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>¥{totalAmount.toFixed(0)}</Text>
            <Text className={styles.summaryItemLabel}>应收总额</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryItemValue}>¥{totalPaid.toFixed(0)}</Text>
            <Text className={styles.summaryItemLabel}>已收金额</Text>
          </View>
        </View>
      </View>

      <View className={styles.searchSection}>
        <Input
          className={styles.searchInput}
          placeholder="搜索订单号、逝者姓名..."
          value={keyword}
          onInput={(e) => setKeyword(e.detail.value)}
        />
        <View className={styles.filterRow}>
          {statusOptions.map(s => (
            <View
              key={s}
              className={`${styles.filterChip} ${statusFilter === s ? styles.filterChipActive : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === 'all' ? '全部状态' : s}
            </View>
          ))}
        </View>
      </View>

      {filteredOrders.length === 0 ? (
        <View className={styles.empty}>
          <View className={styles.emptyIcon}>📊</View>
          <Text>暂无相关订单</Text>
        </View>
      ) : (
        filteredOrders.map(item => {
          const statusInfo = STATUS_MAP[item.status] || STATUS_MAP['待收款'];
          return (
            <View key={item.orderId} className={styles.orderCard}>
              <View className={styles.cardHeader}>
                <View>
                  <Text className={styles.orderNo}>{item.orderNo}</Text>
                  <Text className={styles.deceased}>逝者：{item.deceasedName}</Text>
                </View>
                <View className={`${styles.statusTag} ${styles[statusInfo.className]}`}>
                  {statusInfo.label}
                </View>
              </View>

              <View className={styles.cardBody}>
                <View className={styles.amountSection}>
                  <View className={styles.amountRow}>
                    <Text className={styles.amountLabel}>应收金额</Text>
                    <Text className={styles.amountValue}>¥{item.total.toFixed(2)}</Text>
                  </View>
                  <View className={styles.amountRow}>
                    <Text className={styles.amountLabel}>已收金额</Text>
                    <Text className={styles.amountValue}>¥{item.paid.toFixed(2)}</Text>
                  </View>
                  <View className={styles.totalRow}>
                    <Text className={styles.totalLabel}>
                      {item.remaining > 0 ? '待收金额' : item.remaining < 0 ? '应退金额' : '差额'}
                    </Text>
                    <Text className={`${styles.totalValue} ${item.remaining > 0 ? styles.totalValueRed : item.remaining < 0 ? styles.totalValueGreen : ''}`}>
                      ¥{Math.abs(item.remaining).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>

              <View className={styles.cardActions}>
                <View
                  className={`${styles.actionBtn} ${styles.btnOutline}`}
                  onClick={() => goOrderDetail(item.orderId)}
                >
                  📋 订单详情
                </View>
                {item.status !== '已结清' && item.total > 0 && (
                  <>
                    <View
                      className={`${styles.actionBtn} ${styles.btnSuccess}`}
                      onClick={() => openSupplementModal(item.orderId)}
                    >
                      💰 补收
                    </View>
                    {item.paid > item.total && (
                      <View
                        className={`${styles.actionBtn} ${styles.btnDanger}`}
                        onClick={() => openRefundModal(item.orderId)}
                      >
                        💸 退款
                      </View>
                    )}
                  </>
                )}
                {item.total === 0 && (
                  <View
                    className={`${styles.actionBtn} ${styles.btnPrimary}`}
                    onClick={() => goSettlement(item.orderId)}
                  >
                    📝 去结算
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}

      {showModal && (
        <View className={styles.modalMask}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>
              {modalType === 'supplement' ? '登记补收' : '登记退款'}
            </Text>

            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>金额（元）</Text>
              <Input
                className={styles.modalInput}
                type="digit"
                placeholder="请输入金额"
                value={inputAmount}
                onInput={(e) => setInputAmount(e.detail.value)}
              />
            </View>

            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>支付方式</Text>
              <View className={styles.methodTabs}>
                {METHOD_OPTIONS.map(opt => (
                  <View
                    key={opt.key}
                    className={`${styles.methodTab} ${inputMethod === opt.key ? styles.methodTabActive : ''}`}
                    onClick={() => setInputMethod(opt.key as PaymentMethod)}
                  >
                    {opt.name}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalRow}>
              <Text className={styles.modalLabel}>备注</Text>
              <Textarea
                className={styles.modalTextarea}
                placeholder="请输入备注信息（选填）"
                value={inputRemark}
                onInput={(e) => setInputRemark(e.detail.value)}
                maxlength={200}
              />
            </View>

            <View className={styles.modalActions}>
              <View
                className={`${styles.modalBtn} ${styles.btnOutline}`}
                onClick={() => setShowModal(false)}
              >
                取消
              </View>
              <View
                className={`${styles.modalBtn} ${modalType === 'supplement' ? styles.btnSuccess : styles.btnDanger}`}
                onClick={confirmPayment}
              >
                确认{modalType === 'supplement' ? '补收' : '退款'}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FinanceListPage;
