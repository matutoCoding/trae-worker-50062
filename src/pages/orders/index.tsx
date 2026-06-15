import React, { useState, useMemo } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import OrderCard from '@/components/OrderCard';
import classnames from 'classnames';

type TabType = 'all' | 'pending' | 'progress' | 'completed';

const OrdersPage: React.FC = () => {
  const { orders, setCurrentOrder } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const tabCounts = useMemo(() => ({
    all: orders.length,
    pending: orders.filter(o => o.status === '待派工').length,
    progress: orders.filter(o => o.status === '进行中').length,
    completed: orders.filter(o => o.status === '已完成').length
  }), [orders]);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待派工' },
    { key: 'progress', label: '进行中' },
    { key: 'completed', label: '已完成' }
  ];

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (activeTab !== 'all') {
      const statusMap = {
        pending: '待派工',
        progress: '进行中',
        completed: '已完成'
      } as const;
      result = result.filter(o => o.status === statusMap[activeTab]);
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      result = result.filter(o =>
        o.orderNo.toLowerCase().includes(keyword) ||
        o.deceased.name.includes(searchText) ||
        o.familyMembers.some(f => f.name.includes(searchText) || f.phone.includes(searchText))
      );
    }

    return result.sort((a, b) => {
      const urgencyOrder = { '紧急': 0, '普通': 1 };
      const statusOrder = { '待派工': 0, '进行中': 1, '已完成': 2, '已取消': 3 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [orders, activeTab, searchText]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleOrderClick = (orderId: string) => {
    setCurrentOrder(orderId);
    Taro.navigateTo({ url: '/pages/order-detail/index' });
  };

  const handleDispatch = (orderId: string) => {
    setCurrentOrder(orderId);
    Taro.navigateTo({ url: '/pages/dispatch-detail/index' });
  };

  const handleTrack = (orderId: string) => {
    setCurrentOrder(orderId);
    Taro.navigateTo({ url: '/pages/order-detail/index' });
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchSection}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索订单号/姓名/电话"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            confirmType="search"
          />
        </View>
        <ScrollView scrollX className={styles.tabs} enhanced showScrollbar={false}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, {
                [styles.tabActive]: activeTab === tab.key
              })}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
              <Text className={styles.tabCount}>({tabCounts[tab.key]})</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        scrollY
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        style={{ height: 'calc(100vh - 280rpx)' }}
      >
        <View className={styles.ordersList}>
          <View className={styles.listHeader}>
            <Text className={styles.listTitle}>
              共 {filteredOrders.length} 条订单
            </Text>
            <Button
              className={styles.sortBtn}
              onClick={() => Taro.showToast({ title: '已按紧急程度排序', icon: 'none' })}
            >
              排序 ⇅
            </Button>
          </View>

          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => handleOrderClick(order.id)}
                onDispatch={() => handleDispatch(order.id)}
                onTrack={() => handleTrack(order.id)}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <View className={styles.emptyIcon}>📋</View>
              <Text className={styles.emptyText}>暂无订单</Text>
              <Text className={styles.emptyHint}>
                {searchText ? '请尝试其他搜索条件' : '点击下方按钮创建新订单'}
              </Text>
              {!searchText && (
                <Button className={styles.emptyBtn} onClick={handleCreate}>
                  新建订单
                </Button>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
