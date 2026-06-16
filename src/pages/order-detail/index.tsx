import React, { useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import ProcessTimeline from '@/components/ProcessTimeline';
import classnames from 'classnames';

const genderMap = { male: '男', female: '女' };

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { currentOrderId, getOrderById, setCurrentOrder, completeOrder: completeStoreOrder,
    getOrderFinanceStatus, getOrderSettlementTotal, getOrderPaidAmount,
    getOrderRemainingAmount, getOrderRefundAmount
  } = useAppStore();
  const orderId = router.params.orderId || currentOrderId || '';

  useEffect(() => {
    if (orderId) setCurrentOrder(orderId);
  }, [orderId]);

  const order = getOrderById(orderId);

  if (!order) {
    return (
      <View className={styles.page} style={{ padding: 100, textAlign: 'center' }}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const callPhone = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone });
  };

  const goDispatch = () => {
    Taro.navigateTo({ url: `/pages/dispatch-detail/index?orderId=${order.id}` });
  };

  const goSettlement = () => {
    Taro.navigateTo({ url: `/pages/settlement-detail/index?orderId=${order.id}` });
  };

  const goPaymentRecord = () => {
    Taro.navigateTo({ url: `/pages/payment-record/index?orderId=${order.id}` });
  };

  const goChat = () => {
    Taro.showToast({ title: '客户沟通功能', icon: 'none' });
  };

  const goReview = () => {
    Taro.navigateTo({ url: `/pages/review/index?orderId=${order.id}` });
  };

  const goFollowUp = () => {
    Taro.navigateTo({ url: `/pages/follow-up/index` });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成',
      content: '确认该订单已全部服务完成？确认后订单状态将变为"已完成"，并可进行服务评价。',
      success: (res) => {
        if (res.confirm) {
          completeStoreOrder(order.id);
          Taro.showToast({ title: '订单已完成', icon: 'success' });
        }
      }
    });
  };

  const pendingFollowUps = order.followUpTodos?.filter(t => t.status === '待处理').length || 0;
  const hasPayment = !!order.paymentRecord;
  const hasFollowUps = (order.followUpTodos?.length || 0) > 0;
  const hasSettlement = order.settlement.length > 0;
  const financeStatus = getOrderFinanceStatus(order.id);
  const settlementTotal = getOrderSettlementTotal(order.id);
  const paidAmount = getOrderPaidAmount(order.id);
  const remainingAmount = getOrderRemainingAmount(order.id);
  const refundAmount = getOrderRefundAmount(order.id);
  const discountAmount = order.paymentRecord?.discount || 0;

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.orderHeader}>
        <Text className={styles.orderNo}>订单号: {order.orderNo}</Text>
        <View className={styles.orderStatusWrap}>
          <View className={styles.orderStatus}>
            <View className={styles.statusDot} />
            {order.status}
          </View>
          {order.urgency === '紧急' && (
            <View className={styles.urgencyTag}>🚨 加急</View>
          )}
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 24 }}>
          创建于 {order.createdAt}
        </Text>
      </View>

      <View className={styles.deceasedSection}>
        <View className={styles.deceasedHeader}>
          <View className={styles.deceasedAvatar}>🕊️</View>
          <View className={styles.deceasedInfo}>
            <Text className={styles.deceasedName}>
              {order.deceased.name} · {genderMap[order.deceased.gender] || order.deceased.gender}
              {order.deceased.age > 0 && ` · ${order.deceased.age}岁`}
            </Text>
            <Text className={styles.deceasedMeta}>
              {order.deceased.religion && (
                <View className={styles.tagItem} style={{ marginRight: 12 }}>
                  ⛩️ {order.deceased.religion}
                </View>
              )}
              {order.deceased.customs}
            </Text>
          </View>
        </View>
        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>离世时间</Text>
            <Text className={styles.infoValue}>{order.deceased.dateOfDeath}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>离世地点</Text>
            <Text className={styles.infoValue}>{order.deceased.placeOfDeath || '-'}</Text>
          </View>
          <View className={`${styles.infoItem} ${styles.infoFull}`}>
            <Text className={styles.infoLabel}>服务地址</Text>
            <Text className={styles.infoValue}>{order.serviceAddress || '-'}</Text>
          </View>
          {order.packageName && (
            <View className={`${styles.infoItem} ${styles.infoFull}`}>
              <Text className={styles.infoLabel}>服务套餐</Text>
              <Text className={styles.infoValue} style={{ color: '#D4A574' }}>
                🎁 {order.packageName}
              </Text>
            </View>
          )}
          {order.specialRequirements && (
            <View className={`${styles.infoItem} ${styles.infoFull}`}>
              <Text className={styles.infoLabel}>特殊需求</Text>
              <Text className={styles.infoValue} style={{ color: '#86909C', fontWeight: 'normal' }}>
                📝 {order.specialRequirements}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          家属信息
          <Text className={styles.sectionAction}>共{order.familyMembers.length}人</Text>
        </Text>
        <View className={styles.familyList}>
          {order.familyMembers.map((f, i) => (
            <View key={i} className={styles.familyItem}>
              <View className={styles.familyAvatar}>
                {f.name.slice(0, 1)}
              </View>
              <View className={styles.familyInfo}>
                <Text className={styles.familyName}>
                  {f.name}
                  <View className={styles.familyName}>
                    <Text style={{ fontSize: 24, color: '#86909C', fontWeight: 'normal', marginLeft: 8 }}>
                      {f.relation}
                    </Text>
                    {f.isPrimary && <View className={styles.primaryBadge}>主要联系人</View>}
                  </View>
                </Text>
                <Text className={styles.familyPhone}>{f.phone}</Text>
              </View>
              <View className={styles.phoneBtn} onClick={() => callPhone(f.phone)}>
                📞
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          服务流程跟踪
          <Text className={styles.sectionAction}>
            {order.processNodes.filter(n => n.status === 'completed').length}/{order.processNodes.length}
          </Text>
        </Text>
        <ProcessTimeline nodes={order.processNodes} />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          派工与物资
        </Text>
        <View style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <View
            style={{ flex: 1, minWidth: '30%', padding: 16, background: '#F5F7FA', borderRadius: 12 }}
            onClick={goDispatch}
          >
            <Text style={{ fontSize: 24, color: '#86909C', display: 'block', marginBottom: 8 }}>
              👷 派工任务
            </Text>
            <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
              {order.dispatchTasks.length} 项
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: '30%', padding: 16, background: '#F5F7FA', borderRadius: 12 }}>
            <Text style={{ fontSize: 24, color: '#86909C', display: 'block', marginBottom: 8 }}>
              📦 物资使用
            </Text>
            <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
              {order.materialUsages.length} 件
            </Text>
          </View>
          {hasPayment && (
            <View
              style={{ flex: 1, minWidth: '30%', padding: 16, background: '#ECFDF5', borderRadius: 12 }}
              onClick={goPaymentRecord}
            >
              <Text style={{ fontSize: 24, color: '#27AE60', display: 'block', marginBottom: 8 }}>
                💳 收款记录
              </Text>
              <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
                ¥{order.paymentRecord?.finalAmount.toFixed(2)}
              </Text>
            </View>
          )}
          {hasFollowUps && (
            <View
              style={{ flex: 1, minWidth: '30%', padding: 16, background: pendingFollowUps > 0 ? '#FEF3E2' : '#F5F7FA', borderRadius: 12 }}
              onClick={goFollowUp}
            >
              <Text style={{ fontSize: 24, color: pendingFollowUps > 0 ? '#D35400' : '#86909C', display: 'block', marginBottom: 8 }}>
                🤝 回访关怀
              </Text>
              <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
                {pendingFollowUps > 0 ? `${pendingFollowUps} 项待处理` : `${order.followUpTodos?.length} 项已安排`}
              </Text>
            </View>
          )}
        </View>
      </View>

      {hasSettlement && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用状态</Text>
          <View className={styles.financeStatusRow}>
            <View className={styles.financeStatusTag} style={{
              background: financeStatus === '已结清' ? '#ECFDF5'
                : financeStatus === '部分收款' ? '#EFF6FF'
                : financeStatus === '待补收' ? '#FEF3E2'
                : financeStatus === '需退款' ? '#FEF2F2'
                : '#FEF3E2',
              color: financeStatus === '已结清' ? '#27AE60'
                : financeStatus === '部分收款' ? '#2563EB'
                : financeStatus === '待补收' ? '#D35400'
                : financeStatus === '需退款' ? '#DC2626'
                : '#D35400'
            }}>
              {financeStatus === '已结清' && '✅ '}
              {financeStatus === '部分收款' && '💰 '}
              {financeStatus === '待补收' && '⏳ '}
              {financeStatus === '需退款' && '↩️ '}
              {financeStatus === '待收款' && '⏳ '}
              {financeStatus}
            </View>
          </View>

          <View className={styles.financeGrid}>
            <View className={styles.financeCard}>
              <Text className={styles.financeCardLabel}>📊 应收金额</Text>
              <Text className={styles.financeCardValue}>¥{settlementTotal.toFixed(2)}</Text>
            </View>
            <View className={styles.financeCard} style={{ background: '#ECFDF5' }}>
              <Text className={styles.financeCardLabel} style={{ color: '#27AE60' }}>💰 已收金额</Text>
              <Text className={styles.financeCardValue} style={{ color: '#27AE60' }}>¥{paidAmount.toFixed(2)}</Text>
            </View>
            {discountAmount > 0 && (
              <View className={styles.financeCard} style={{ background: '#FFF7E6' }}>
                <Text className={styles.financeCardLabel} style={{ color: '#D35400' }}>🏷️ 优惠金额</Text>
                <Text className={styles.financeCardValue} style={{ color: '#D35400' }}>-¥{discountAmount.toFixed(2)}</Text>
              </View>
            )}
            {refundAmount > 0 && (
              <View className={styles.financeCard} style={{ background: '#FEF2F2' }}>
                <Text className={styles.financeCardLabel} style={{ color: '#DC2626' }}>↩️ 退款金额</Text>
                <Text className={styles.financeCardValue} style={{ color: '#DC2626' }}>-¥{refundAmount.toFixed(2)}</Text>
              </View>
            )}
            {remainingAmount > 0 && (
              <View className={styles.financeCard} style={{ background: '#FEF3E2' }}>
                <Text className={styles.financeCardLabel} style={{ color: '#D35400' }}>⏳ 待收金额</Text>
                <Text className={styles.financeCardValue} style={{ color: '#D35400' }}>¥{remainingAmount.toFixed(2)}</Text>
              </View>
            )}
            <View
              className={styles.financeCard}
              style={{ cursor: 'pointer', border: '2rpx dashed #D1D5DB' }}
              onClick={goPaymentRecord}
            >
              <Text className={styles.financeCardLabel} style={{ color: '#6B7280' }}>📄 收款明细</Text>
              <Text className={styles.financeCardValue} style={{ fontSize: 26, color: '#2C3E50' }}>查看详情 ›</Text>
            </View>
          </View>

          {financeStatus === '已结清' && order.paymentRecord && (
            <View className={styles.financeSummary}>
              <Text style={{ fontSize: 24, color: '#27AE60' }}>
                ✅ 费用已结清 · {order.paymentRecord.payMethod === 'wechat' ? '微信支付' : order.paymentRecord.payMethod === 'alipay' ? '支付宝' : order.paymentRecord.payMethod === 'bank' ? '银行转账' : '现金支付'}
              </Text>
            </View>
          )}
        </View>
      )}

      {!hasSettlement && (order.status === '进行中' || order.status === '待派工') && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>费用状态</Text>
          <View style={{ padding: 16, background: '#F5F7FA', borderRadius: 12, textAlign: 'center' }}>
            <Text style={{ fontSize: 26, color: '#86909C' }}>
              📝 暂未生成报价单，请先完成派工后进行结算
            </Text>
          </View>
        </View>
      )}

      <View className={styles.footerBar}>
        <Button className={classnames(styles.footerBtn, styles.btnLight)} onClick={goChat}>
          💬 沟通
        </Button>
        {!hasPayment && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goDispatch}>
            👷 派工
          </Button>
        )}
        {!hasPayment && (
          <Button className={classnames(styles.footerBtn, styles.btnPrimary)} onClick={goSettlement}>
            💰 结算
          </Button>
        )}
        {hasPayment && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goPaymentRecord}>
            💳 收款单
          </Button>
        )}
        {order.status === '进行中' && (
          <Button className={classnames(styles.footerBtn, styles.btnDanger)} onClick={handleComplete}>
            ✅ 完成
          </Button>
        )}
        {order.status === '待派工' && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goDispatch}>
            👷 立即派工
          </Button>
        )}
        {order.status === '已完成' && !order.review && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goReview}>
            ⭐ 评价
          </Button>
        )}
        {order.status === '已完成' && order.review && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goFollowUp}>
            🤝 回访
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
