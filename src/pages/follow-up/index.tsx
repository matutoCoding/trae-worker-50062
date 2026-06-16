import React, { useState, useMemo } from 'react';
import { View, Text, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useStore';
import { FollowUpTodo, FollowUpStatus } from '@/types';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';

const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [showModal, setShowModal] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<FollowUpTodo | null>(null);
  const [followContent, setFollowContent] = useState('');

  const getAllFollowUps = useAppStore(s => s.getAllFollowUps);
  const updateFollowUpTodo = useAppStore(s => s.updateFollowUpTodo);
  const getStats = useAppStore(s => s.getStats);

  const stats = getStats();
  const allTodos = getAllFollowUps();
  const completedCount = allTodos.filter(t => t.status === '已完成').length;

  const filteredTodos = useMemo(() => {
    if (activeTab === 'pending') {
      return allTodos.filter(t => t.status === '待处理');
    }
    return allTodos.filter(t => t.status === '已完成');
  }, [allTodos, activeTab]);

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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      '首七': '🕯️', '三七': '🕯️', '五七': '🕯️', '七七': '🕯️',
      '百日': '🌸', '周年': '🌿', '周年祭': '🌿',
      '清明': '🌼', '寒衣': '🧥'
    };
    return icons[type] || '📅';
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

      {filteredTodos.length === 0 ? (
        <View className={styles.empty}>
          <Text>暂无{activeTab === 'pending' ? '待回访' : '已完成'}记录</Text>
        </View>
      ) : (
        filteredTodos.map(todo => (
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
              <Text className={styles.orderNo}>订单号：{todo.orderNo}</Text>
              <Text className={styles.deceased}>逝者：{todo.deceasedName}</Text>
              <View className={styles.contactRow}>
                <Text>👤 {todo.familyContact}</Text>
                <Text
                  className={styles.phoneLink}
                  onClick={() => handleCall(todo.familyPhone)}
                >
                  📞 {todo.familyPhone}
                </Text>
              </View>
            </View>

            {todo.status === '已完成' && todo.followUpContent && (
              <View className={styles.completedInfo}>
                <Text className={styles.completedText}>回访内容：{todo.followUpContent}</Text>
                <Text className={styles.completedTime}>完成时间：{todo.completedAt}</Text>
              </View>
            )}

            {todo.status === '待处理' && (
              <View className={styles.todoActions}>
                <View
                  className={`${styles.actionBtn} ${styles.btnSecondary}`}
                  onClick={() => handleCall(todo.familyPhone)}
                >
                  拨打电话
                </View>
                <View
                  className={`${styles.actionBtn} ${styles.btnSuccess}`}
                  onClick={() => handleComplete(todo)}
                >
                  标记完成
                </View>
              </View>
            )}
          </View>
        ))
      )}

      {showModal && selectedTodo && (
        <View className={styles.modalMask}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>完成回访</Text>
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
