import React, { useState, useMemo } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useStore';
import { FollowUpTodo, FollowUpType } from '@/types';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';

const ALL_TYPES: FollowUpType[] = ['首七', '三七', '五七', '七七', '百日', '周年', '清明', '寒衣', '周年祭'];

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    '首七': '🕯️', '三七': '🕯️', '五七': '🕯️', '七七': '🕯️',
    '百日': '🌸', '周年': '🌿', '周年祭': '🌿',
    '清明': '🌼', '寒衣': '🧥'
  };
  return icons[type] || '📅';
};

const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [activeType, setActiveType] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<FollowUpTodo | null>(null);
  const [followContent, setFollowContent] = useState('');

  const orders = useAppStore(s => s.orders);
  const getAllFollowUps = useAppStore(s => s.getAllFollowUps);
  const updateFollowUpTodo = useAppStore(s => s.updateFollowUpTodo);
  const getStats = useAppStore(s => s.getStats);
  const getOrderById = useAppStore(s => s.getOrderById);

  const stats = getStats();
  const allTodos = getAllFollowUps();
  const completedCount = allTodos.filter(t => t.status === '已完成').length;

  const usedTypes = useMemo(() => {
    const typeSet = new Set<string>();
    allTodos.forEach(t => typeSet.add(t.type));
    return ALL_TYPES.filter(t => typeSet.has(t));
  }, [allTodos]);

  const filteredTodos = useMemo(() => {
    let list = activeTab === 'pending'
      ? allTodos.filter(t => t.status === '待处理')
      : allTodos.filter(t => t.status === '已完成');
    if (activeType !== 'all') {
      list = list.filter(t => t.type === activeType);
    }
    return list;
  }, [allTodos, activeTab, activeType]);

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  const handleComplete = (todo: FollowUpTodo) => {
    setSelectedTodo(todo);
    setFollowContent('');
    setShowModal(true);
  };

  const confirmComplete = () => {
    if (!selectedTodo) return;
    if (!followContent.trim()) {
      Taro.showToast({ title: '请填写回访内容', icon: 'none' });
      return;
    }
    updateFollowUpTodo(selectedTodo.id, {
      status: '已完成',
      followUpContent: followContent.trim()
    });
    setShowModal(false);
    setSelectedTodo(null);
    Taro.showToast({ title: '回访已完成', icon: 'success' });
  };

  const handleCancel = () => {
    setShowModal(false);
    setSelectedTodo(null);
  };

  const goOrderDetail = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/order-detail/index?orderId=${orderId}` });
  };

  const getOrderLastRecord = (orderId: string) => {
    const order = getOrderById(orderId);
    if (!order || !order.followUpTodos) return null;
    const completed = order.followUpTodos
      .filter(t => t.status === '已完成' && t.followUpContent)
      .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || ''));
    return completed[0] || null;
  };

  if (allTodos.length === 0) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <View className={styles.emptyIcon}>📋</View>
          <Text>暂无回访待办</Text>
          <Text style={{ fontSize: '24rpx', marginTop: '16rpx', opacity: 0.7 }}>
            服务评价后将自动生成回访计划
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.tabs}>
        <View
          className={`${styles.tab} ${activeTab === 'pending' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          待回访 {stats.pendingFollowUp > 0 && `(${stats.pendingFollowUp})`}
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          已完成 {completedCount > 0 && `(${completedCount})`}
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={`${styles.statValue} ${styles.statValueOrange}`}>
            {stats.pendingFollowUp}
          </Text>
          <Text className={styles.statLabel}>待回访</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={`${styles.statValue} ${styles.statValueGreen}`}>
            {completedCount}
          </Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{allTodos.length}</Text>
          <Text className={styles.statLabel}>总计</Text>
        </View>
      </View>

      <View className={styles.typeFilter}>
        <View
          className={`${styles.typeChip} ${activeType === 'all' ? styles.typeChipActive : ''}`}
          onClick={() => setActiveType('all')}
        >
          全部
        </View>
        {usedTypes.map(type => {
          const count = allTodos.filter(t =>
            t.type === type && (activeTab === 'pending' ? t.status === '待处理' : t.status === '已完成')
          ).length;
          return (
            <View
              key={type}
              className={`${styles.typeChip} ${activeType === type ? styles.typeChipActive : ''}`}
              onClick={() => setActiveType(type)}
            >
              {getTypeIcon(type)} {type}
              {count > 0 && <View className={styles.typeCount}>{count}</View>}
            </View>
          );
        })}
      </View>

      {filteredTodos.length === 0 ? (
        <View className={styles.empty}>
          <Text>暂无{activeTab === 'pending' ? '待回访' : '已完成'}记录</Text>
        </View>
      ) : (
        filteredTodos.map(todo => {
          const lastRecord = getOrderLastRecord(todo.orderId);
          return (
            <View key={todo.id} className={styles.todoCard}>
              <View className={styles.todoHeader}>
                <View className={`${styles.typeTag} ${
                  todo.status === '待处理' ? styles.typePending : styles.typeCompleted
                }`}>
                  {getTypeIcon(todo.type)} {todo.type}
                </View>
                <View className={styles.dateBadge}>📅 {todo.scheduledDate}</View>
              </View>

              <View className={styles.todoInfo}>
                <Text
                  className={styles.orderNo}
                  onClick={() => goOrderDetail(todo.orderId)}
                >
                  📋 订单号：{todo.orderNo}
                </Text>
                <Text className={styles.deceased}>🕊️ 逝者：{todo.deceasedName}</Text>
                <View className={styles.contactRow}>
                  <Text>👤 {todo.familyContact || '家属'}</Text>
                  {todo.familyPhone && (
                    <Text
                      className={styles.phoneLink}
                      onClick={() => handleCall(todo.familyPhone)}
                    >
                      📞 {todo.familyPhone}
                    </Text>
                  )}
                </View>
              </View>

              {lastRecord && lastRecord.id !== todo.id && (
                <View className={styles.lastRecord}>
                  <Text className={styles.lastRecordTitle}>📝 最近回访记录</Text>
                  <Text className={styles.lastRecordType}>
                    {getTypeIcon(lastRecord.type)} {lastRecord.type}
                  </Text>
                  <Text className={styles.lastRecordContent}>
                    {lastRecord.followUpContent}
                  </Text>
                  <Text className={styles.lastRecordTime}>
                    {lastRecord.completedAt}
                  </Text>
                </View>
              )}

              {todo.status === '已完成' && todo.followUpContent && (
                <View className={styles.completedInfo}>
                  <Text className={styles.completedText}>回访内容：{todo.followUpContent}</Text>
                  <Text className={styles.completedTime}>完成时间：{todo.completedAt}</Text>
                </View>
              )}

              {todo.remark && (
                <View className={styles.remarkInfo}>
                  <Text className={styles.remarkText}>备注：{todo.remark}</Text>
                </View>
              )}

              <View className={styles.todoActions}>
                {todo.status === '待处理' && (
                  <>
                    {todo.familyPhone && (
                      <View
                        className={`${styles.actionBtn} ${styles.btnSecondary}`}
                        onClick={() => handleCall(todo.familyPhone)}
                      >
                        📞 拨打电话
                      </View>
                    )}
                    <View
                      className={`${styles.actionBtn} ${styles.btnSuccess}`}
                      onClick={() => handleComplete(todo)}
                    >
                      ✅ 标记完成
                    </View>
                  </>
                )}
                <View
                  className={`${styles.actionBtn} ${styles.btnOutline}`}
                  onClick={() => goOrderDetail(todo.orderId)}
                >
                  📋 查看订单
                </View>
              </View>
            </View>
          );
        })
      )}

      {showModal && selectedTodo && (
        <View className={styles.modalMask}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>完成回访</Text>
            <View className={styles.modalOrderInfo}>
              <Text style={{ fontSize: '24rpx', color: '#86909C' }}>
                {getTypeIcon(selectedTodo.type)} {selectedTodo.type} · {selectedTodo.deceasedName}
              </Text>
            </View>
            <Textarea
              className={styles.modalInput}
              placeholder="请输入回访内容，如家属情绪、需求反馈等..."
              value={followContent}
              onInput={(e) => setFollowContent(e.detail.value)}
              maxlength={500}
            />
            <View className={styles.modalActions}>
              <View
                className={`${styles.modalBtn} ${styles.btnSecondary}`}
                onClick={handleCancel}
              >
                取消
              </View>
              <View
                className={`${styles.modalBtn} ${styles.btnSuccess}`}
                onClick={confirmComplete}
              >
                确认完成
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FollowUpPage;
