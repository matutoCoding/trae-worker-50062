import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import SectionHeader from '@/components/SectionHeader';

const ProfilePage: React.FC = () => {
  const { orders, getStats, setCurrentOrder } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const stats = useMemo(() => getStats(), [orders]);

  const completedOrders = useMemo(() => orders.filter(o => o.status === '已完成'), [orders]);
  const inProgressOrders = useMemo(() => orders.filter(o => o.status === '进行中'), [orders]);
  const pendingSettlementOrders = useMemo(() =>
    orders.filter(o => (o.status === '待派工' || o.status === '进行中') && o.settlement.length === 0)
  , [orders]);
  const pendingReviewOrders = useMemo(() =>
    completedOrders.filter(o => !o.review)
  , [completedOrders]);

  const pendingReview = pendingReviewOrders.length;
  const unsettledOrders = pendingSettlementOrders.length;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleMenuClick = (key: string) => {
    switch (key) {
      case 'myWork':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'settlement':
        if (pendingSettlementOrders.length > 0) {
          const first = pendingSettlementOrders[0];
          setCurrentOrder(first.id);
          Taro.navigateTo({ url: `/pages/settlement-detail/index?orderId=${first.id}` });
        } else {
          Taro.switchTab({ url: '/pages/orders/index' });
          Taro.showToast({ title: '暂无待结算订单', icon: 'none' });
        }
        break;
      case 'review':
        if (pendingReviewOrders.length > 0) {
          const first = pendingReviewOrders[0];
          setCurrentOrder(first.id);
          Taro.navigateTo({ url: `/pages/review/index?orderId=${first.id}` });
        } else {
          Taro.showToast({ title: '暂无待评价订单', icon: 'none' });
        }
        break;
      case 'follow':
        Taro.navigateTo({ url: '/pages/follow-up/index' });
        break;
      case 'todayPaid':
        Taro.navigateTo({ url: '/pages/finance-list/index?mode=today' });
        break;
      case 'pendingPayment':
        Taro.navigateTo({ url: '/pages/finance-list/index?mode=pending' });
        break;
      case 'customer':
        Taro.showToast({ title: '客户沟通记录', icon: 'none' });
        break;
      case 'religion':
        Taro.showActionSheet({
          itemList: ['佛教仪式', '道教仪式', '基督教仪式', '伊斯兰教仪式', '传统汉族习俗']
        });
        break;
      case 'help':
        Taro.showModal({
          title: '帮助中心',
          content: '24小时服务热线：400-888-8888\n工作时间：全天候服务',
          showCancel: false
        });
        break;
      case 'setting':
        Taro.showToast({ title: '系统设置', icon: 'none' });
        break;
    }
  };

  const recentReviews = [
    {
      id: 1,
      name: '王志强',
      order: 'BS20260605008',
      stars: 5,
      content: '服务非常专业，司仪张老师全程主持得体，家属都很满意。感谢团队的耐心和细心。',
      time: '2026-06-06'
    },
    {
      id: 2,
      name: '张卫国',
      order: 'BS20260602003',
      stars: 5,
      content: '灵堂布置素雅庄重，符合母亲生前的喜好。物资调配及时，没有任何差错。',
      time: '2026-06-03'
    }
  ];

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>李</Text>
          </View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>李文博</Text>
            <Text className={styles.userRole}>客户经理 · 高级殡葬策划师</Text>
            <Text className={styles.userPhone}>工号：FS20230108 · 138****8888</Text>
          </View>
        </View>
      </View>

      <View className={styles.quickStats}>
        <View className={styles.quickStatItem}>
          <Text className={styles.quickStatNumber}>{stats.inService}</Text>
          <Text className={styles.quickStatLabel}>服务中</Text>
        </View>
        <View className={styles.quickStatItem}>
          <Text className={styles.quickStatNumber}>{stats.completed}</Text>
          <Text className={styles.quickStatLabel}>已完成</Text>
        </View>
        <View className={styles.quickStatItem}>
          <Text className={`${styles.quickStatNumber} ${styles.goldText}`}>{stats.pendingSettlement}</Text>
          <Text className={styles.quickStatLabel}>待结算</Text>
        </View>
        <View className={styles.quickStatItem}>
          <Text className={styles.quickStatNumber} style={{ color: '#FF7D00' }}>{stats.pendingReview}</Text>
          <Text className={styles.quickStatLabel}>待评价</Text>
        </View>
        <View className={styles.quickStatItem}>
          <Text className={styles.quickStatNumber} style={{ color: '#D35400' }}>{stats.pendingFollowUp}</Text>
          <Text className={styles.quickStatLabel}>待回访</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.financeCard}>
          <Text className={styles.financeTitle}>📊 财务速览</Text>
          <View style={{ display: 'flex', gap: 16 }}>
            <View
              style={{ flex: 1, padding: 20, background: '#ECFDF5', borderRadius: 16 }}
              onClick={() => handleMenuClick('todayPaid')}
            >
              <Text style={{ fontSize: 24, color: '#27AE60', display: 'block', marginBottom: 8 }}>
                💰 今日收款
              </Text>
              <Text style={{ fontSize: 36, color: '#27AE60', fontWeight: 700 }}>
                ¥{stats.todayPaid.toFixed(0)}
              </Text>
            </View>
            <View
              style={{ flex: 1, padding: 20, background: '#FEF3E2', borderRadius: 16 }}
              onClick={() => handleMenuClick('pendingPayment')}
            >
              <Text style={{ fontSize: 24, color: '#D35400', display: 'block', marginBottom: 8 }}>
                ⏳ 待收款
              </Text>
              <Text style={{ fontSize: 36, color: '#D35400', fontWeight: 700 }}>
                ¥{stats.pendingPayment.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuClick('myWork')}>
            <View className={`${styles.menuIcon} ${styles.iconWork}`}>📋</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>我的派工任务</Text>
              <Text className={styles.menuDesc}>查看分配给我的所有服务任务</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('settlement')}>
            <View className={`${styles.menuIcon} ${styles.iconSettle}`}>💰</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>费用结算</Text>
              <Text className={styles.menuDesc}>收费项目明细 · 报价单生成</Text>
            </View>
            {stats.pendingSettlement > 0 && (
              <View className={styles.menuBadge}>{stats.pendingSettlement}单</View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('review')}>
            <View className={`${styles.menuIcon} ${styles.iconReview}`}>⭐</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>服务评价管理</Text>
              <Text className={styles.menuDesc}>客户评价 · 回访关怀</Text>
            </View>
            {stats.pendingReview > 0 && (
              <View className={styles.menuBadge}>{stats.pendingReview}</View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('follow')}>
            <View className={`${styles.menuIcon} ${styles.iconFollow}`}>🤝</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>回访关怀</Text>
              <Text className={styles.menuDesc}>七期、百日、周年祭回访提醒</Text>
            </View>
            {stats.pendingFollowUp > 0 && (
              <View className={styles.menuBadge}>{stats.pendingFollowUp}</View>
            )}
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader title="最近好评" subtitle="客户反馈" />
        <View className={styles.reviewCard}>
          {recentReviews.map(review => (
            <View key={review.id} className={styles.reviewItem}>
              <View className={styles.reviewHeader}>
                <Text className={styles.reviewerName}>
                  {review.name} · {review.order}
                </Text>
                <Text className={styles.stars}>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</Text>
              </View>
              <Text className={styles.reviewContent}>{review.content}</Text>
              <Text className={styles.reviewTime}>{review.time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.menuCard}>
          <View className={styles.menuItem} onClick={() => handleMenuClick('customer')}>
            <View className={`${styles.menuIcon} ${styles.iconCustomer}`}>💬</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>客户沟通记录</Text>
              <Text className={styles.menuDesc}>家属需求沟通历史</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('religion')}>
            <View className={`${styles.menuIcon} ${styles.iconReligion}`}>🕊️</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>宗教习俗适配</Text>
              <Text className={styles.menuDesc}>佛教、道教、基督教等仪式配置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('help')}>
            <View className={`${styles.menuIcon} ${styles.iconHelp}`}>❓</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>帮助中心</Text>
              <Text className={styles.menuDesc}>常见问题 · 24小时客服热线</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>

          <View className={styles.menuItem} onClick={() => handleMenuClick('setting')}>
            <View className={`${styles.menuIcon} ${styles.iconSetting}`}>⚙️</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>系统设置</Text>
              <Text className={styles.menuDesc}>消息通知 · 隐私设置</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
