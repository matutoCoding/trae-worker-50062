import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import SectionHeader from '@/components/SectionHeader';
import PackageCard from '@/components/PackageCard';

const HomePage: React.FC = () => {
  const { dashboardStats, packages, orders, setCurrentPackage, setCurrentOrder } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const urgentOrders = orders.filter(o => o.urgency === '紧急' && o.status !== '已完成').slice(0, 3);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'order':
        Taro.navigateTo({ url: '/pages/order-create/index' });
        break;
      case 'dispatch':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'material':
        Taro.switchTab({ url: '/pages/materials/index' });
        break;
      case 'track':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'settle':
        Taro.showToast({ title: '请在订单详情中操作', icon: 'none' });
        break;
      case 'review':
        Taro.showToast({ title: '请在订单完成后评价', icon: 'none' });
        break;
      case 'chat':
        Taro.showToast({ title: '请在订单详情中沟通', icon: 'none' });
        break;
      case 'more':
        Taro.showActionSheet({
          itemList: ['宗教习俗说明', '服务流程介绍', '常见问题', '联系客服']
        });
        break;
    }
  };

  const handlePackageView = (pkgId: string) => {
    setCurrentPackage(pkgId);
    Taro.navigateTo({ url: '/pages/package-detail/index' });
  };

  const handlePackageSelect = (pkgId: string) => {
    setCurrentPackage(pkgId);
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  const handleUrgentOrderClick = (orderId: string) => {
    setCurrentOrder(orderId);
    Taro.navigateTo({ url: '/pages/order-detail/index' });
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <View className={styles.brand}>
            <View className={styles.brandLogo}>
              <Text style={{ color: '#fff', fontSize: '32rpx', fontWeight: 'bold' }}>福</Text>
            </View>
            <View className={styles.brandText}>
              <Text className={styles.brandName}>福寿园殡葬</Text>
              <Text className={styles.brandSlogan}>用心服务 · 让逝者安息 · 让家属安心</Text>
            </View>
          </View>
          <View className={styles.notification}>
            <Text className={styles.notificationIcon}>🔔</Text>
            {dashboardStats.pendingDispatch > 0 && (
              <View className={styles.notificationBadge}>
                {dashboardStats.pendingDispatch}
              </View>
            )}
          </View>
        </View>

        <View
          className={styles.searchBar}
          onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
        >
          <Text className={styles.searchIcon}>🔍</Text>
          <Text className={styles.searchPlaceholder}>搜索订单号 / 逝者姓名 / 家属电话</Text>
        </View>
      </View>

      <View className={styles.statsContainer}>
        <Text className={styles.statsTitle}>今日工作概览</Text>
        <View className={styles.statsGrid}>
          <View className={styles.statsItem}>
            <Text className={styles.statsNumber}>{dashboardStats.todayOrders}</Text>
            <Text className={styles.statsLabel}>今日接单</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={`${styles.statsNumber} ${styles.warning}`}>
              {dashboardStats.pendingDispatch}
            </Text>
            <Text className={styles.statsLabel}>待派工</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={styles.statsNumber}>{dashboardStats.inProgressOrders}</Text>
            <Text className={styles.statsLabel}>进行中</Text>
          </View>
          <View className={styles.statsItem}>
            <Text className={`${styles.statsNumber} ${styles.success}`}>
              {dashboardStats.completedToday}
            </Text>
            <Text className={styles.statsLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <SectionHeader title="快捷操作" />
        <View className={styles.quickActions}>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('order')}>
            <View className={`${styles.quickActionIcon} ${styles.iconOrder}`}>
              <Text>📝</Text>
            </View>
            <Text className={styles.quickActionLabel}>24H接单</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('dispatch')}>
            <View className={`${styles.quickActionIcon} ${styles.iconDispatch}`}>
              <Text>👥</Text>
            </View>
            <Text className={styles.quickActionLabel}>人员派工</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('material')}>
            <View className={`${styles.quickActionIcon} ${styles.iconMaterial}`}>
              <Text>📦</Text>
            </View>
            <Text className={styles.quickActionLabel}>物资调配</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('track')}>
            <View className={`${styles.quickActionIcon} ${styles.iconTrack}`}>
              <Text>📍</Text>
            </View>
            <Text className={styles.quickActionLabel}>流程跟踪</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('settle')}>
            <View className={`${styles.quickActionIcon} ${styles.iconSettle}`}>
              <Text>💰</Text>
            </View>
            <Text className={styles.quickActionLabel}>费用结算</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('review')}>
            <View className={`${styles.quickActionIcon} ${styles.iconReview}`}>
              <Text>⭐</Text>
            </View>
            <Text className={styles.quickActionLabel}>服务评价</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('chat')}>
            <View className={`${styles.quickActionIcon} ${styles.iconChat}`}>
              <Text>💬</Text>
            </View>
            <Text className={styles.quickActionLabel}>家属沟通</Text>
          </View>
          <View className={styles.quickActionItem} onClick={() => handleQuickAction('more')}>
            <View className={`${styles.quickActionIcon} ${styles.iconMore}`}>
              <Text>➕</Text>
            </View>
            <Text className={styles.quickActionLabel}>更多</Text>
          </View>
        </View>
      </View>

      {urgentOrders.length > 0 && (
        <View className={styles.section}>
          <SectionHeader title="紧急处理" subtitle="需优先关注" />
          <View className={styles.urgentOrdersCard}>
            <View className={styles.urgentOrdersHeader}>
              <View className={styles.urgentOrdersTitle}>
                <View className={styles.urgentIcon}>!</View>
                <Text className={styles.urgentTitleText}>紧急订单</Text>
              </View>
              <View className={styles.urgentCount}>{urgentOrders.length}单</View>
            </View>
            {urgentOrders.map(order => (
              <View
                key={order.id}
                className={styles.urgentOrderItem}
                onClick={() => handleUrgentOrderClick(order.id)}
              >
                <View className={styles.urgentOrderRow}>
                  <Text className={styles.urgentOrderName}>{order.deceased.name}</Text>
                  <Text className={styles.urgentOrderNo}>{order.orderNo}</Text>
                </View>
                <Text className={styles.urgentOrderInfo}>
                  {order.status} · {order.deceased.dateOfDeath} · {order.deceased.placeOfDeath}
                </Text>
                {order.specialRequirements && (
                  <Text className={styles.urgentOrderInfo} style={{ color: '#E74C3C', marginTop: '8rpx' }}>
                    ⚠️ {order.specialRequirements.substring(0, 30)}...
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.section}>
        <SectionHeader
          title="服务套餐"
          subtitle="专业贴心"
          showMore
          moreText="查看全部"
          onMoreClick={() => Taro.showToast({ title: '请下滑查看更多套餐', icon: 'none' })}
        />
        <View className={styles.packagesList}>
          {packages.map(pkg => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              onView={() => handlePackageView(pkg.id)}
              onSelect={() => handlePackageSelect(pkg.id)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
