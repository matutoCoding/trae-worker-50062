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
  const orderId = router.params.orderId || '';
  const { orders, getOrderById, setCurrentOrder } = useAppStore();

  useEffect(() => {
    setCurrentOrder(orderId);
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

  const goChat = () => {
    Taro.showToast({ title: '客户沟通功能', icon: 'none' });
  };

  const goReview = () => {
    Taro.navigateTo({ url: `/pages/review/index?orderId=${order.id}` });
  };

  const completeOrder = () => {
    Taro.showModal({
      title: '确认完成',
      content: '确认该订单已全部服务完成？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '订单已完成', icon: 'success' });
        }
      }
    });
  };

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
        <View style={{ display: 'flex', gap: 16 }}>
          <View
            style={{ flex: 1, padding: 16, background: '#F5F7FA', borderRadius: 12 }}
            onClick={goDispatch}
          >
            <Text style={{ fontSize: 24, color: '#86909C', display: 'block', marginBottom: 8 }}>
              👷 派工任务
            </Text>
            <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
              {order.dispatchTasks.length} 项
            </Text>
          </View>
          <View style={{ flex: 1, padding: 16, background: '#F5F7FA', borderRadius: 12 }}>
            <Text style={{ fontSize: 24, color: '#86909C', display: 'block', marginBottom: 8 }}>
              📦 物资使用
            </Text>
            <Text style={{ fontSize: 28, color: '#1D2129', fontWeight: 600 }}>
              {order.materialUsages.length} 件
            </Text>
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <Button className={classnames(styles.footerBtn, styles.btnLight)} onClick={goChat}>
          💬 沟通
        </Button>
        <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goDispatch}>
          👷 派工
        </Button>
        <Button className={classnames(styles.footerBtn, styles.btnPrimary)} onClick={goSettlement}>
          💰 结算
        </Button>
        {order.status === '进行中' && (
          <Button className={classnames(styles.footerBtn, styles.btnDanger)} onClick={completeOrder}>
            ✅ 完成
          </Button>
        )}
        {order.status === '已完成' && (
          <Button className={classnames(styles.footerBtn, styles.btnOutline)} onClick={goReview}>
            ⭐ 评价
          </Button>
        )}
      </View>
    </ScrollView>
  );
};

export default OrderDetailPage;
