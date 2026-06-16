import React, { useState, useMemo } from 'react';
import { View, Text, Textarea, Checkbox } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAppStore } from '@/store/useStore';
import { FollowUpTodo, FollowUpType } from '@/types';
import styles from './index.module.scss';

type TabType = 'pending' | 'completed';
type ScheduleType = 'today' | 'week' | 'overdue' | 'all';

const ALL_TYPES: FollowUpType[] = ['首七', '三七', '五七', '七七', '百日', '周年', '清明', '寒衣', '周年祭'];

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    '首七': '🕯️', '三七': '🕯️', '五七': '🕯️', '七七': '🕯️',
    '百日': '🌸', '周年': '🌿', '周年祭': '🌿',
    '清明': '🌼', '寒衣': '🧥'
  };
  return icons[type] || '📅';
};

const isToday = (dateStr: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
};

const isThisWeek = (dateStr: string) => {
  const today = new Date();
  const target = new Date(dateStr);
  const day = today.getDay() || 7;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - day + 1);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return target >= weekStart && target <= weekEnd;
};

const isOverdue = (dateStr: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
};

const FollowUpPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [activeSchedule, setActiveSchedule] = useState<ScheduleType>('all');
  const [activeType, setActiveType] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchContent, setBatchContent] = useState('');

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

  const pendingTodos = useMemo(() => allTodos.filter(t => t.status === '待处理'), [allTodos]);

  const scheduleStats = useMemo(() => {
    let today = 0, week = 0, overdue = 0;
    pendingTodos.forEach(t => {
      if (isToday(t.scheduledDate)) today++;
      if (isThisWeek(t.scheduledDate)) week++;
      if (isOverdue(t.scheduledDate)) overdue++;
    });
    return { today, week, overdue, total: pendingTodos.length };
  }, [pendingTodos]);

  const filteredTodos = useMemo(() => {
    let list = activeTab === 'pending'
      ? allTodos.filter(t => t.status === '待处理')
      : allTodos.filter(t => t.status === '已完成');

    if (activeTab === 'pending') {
      switch (activeSchedule) {
        case 'today':
          list = list.filter(t => isToday(t.scheduledDate));
          break;
        case 'week':
          list = list.filter(t => isThisWeek(t.scheduledDate));
          break;
        case 'overdue':
          list = list.filter(t => isOverdue(t.scheduledDate));
          break;
      }
    }

    if (activeType !== 'all') {
      list = list.filter(t => t.type === activeType);
    }

    return list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [allTodos, activeTab, activeSchedule, activeType]);

  const handleCall = (phone: string) => {
    Taro.makePhoneCall({ phoneNumber: phone }).catch(() => {});
  };

  const handleComplete = (todo: FollowUpTodo) => {
    Taro.showModal({
      title: '完成回访',
      editable: true,
      placeholderText: '请输入回访内容...',
      confirmText: '确认完成',
      success: (res) => {
        if (res.confirm) {
          const content = res.content || '已完成回访';
          updateFollowUpTodo(todo.id, {
            status: '已完成',
            followUpContent: content
          });
          Taro.showToast({ title: '回访已完成', icon: 'success' });
        }
      }
    });
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTodos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTodos.map(t => t.id)));
    }
  };

  const openBatchModal = () => {
    if (selectedIds.size === 0) {
      Taro.showToast({ title: '请先选择待办', icon: 'none' });
      return;
    }
    setBatchContent('');
    setBatchMode(true);
    setShowModal(true);
  };

  const confirmBatch = () => {
    if (!batchContent.trim()) {
      Taro.showToast({ title: '请填写回访内容', icon: 'none' });
      return;
    }
    selectedIds.forEach(id => {
      updateFollowUpTodo(id, {
        status: '已完成',
        followUpContent: batchContent.trim()
      });
    });
    setShowModal(false);
    setBatchMode(false);
    setSelectedIds(new Set());
    Taro.showToast({ title: `已批量完成 ${selectedIds.size} 条`, icon: 'success' });
  };

  const handleCancel = () => {
    setShowModal(false);
    setBatchMode(false);
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

  const scheduleOptions: { key: ScheduleType; label: string; count: number; color: string }[] = [
    { key: 'all', label: '全部', count: scheduleStats.total, color: '#2C3E50' },
    { key: 'today', label: '今天', count: scheduleStats.today, color: '#27AE60' },
    { key: 'week', label: '本周', count: scheduleStats.week, color: '#2563EB' },
    { key: 'overdue', label: '逾期', count: scheduleStats.overdue, color: '#DC2626' }
  ];

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
          onClick={() => { setActiveTab('pending'); setSelectedIds(new Set()); }}
        >
          待回访 {stats.pendingFollowUp > 0 && `(${stats.pendingFollowUp})`}
        </View>
        <View
          className={`${styles.tab} ${activeTab === 'completed' ? styles.tabActive : ''}`}
          onClick={() => { setActiveTab('completed'); setSelectedIds(new Set()); }}
        >
          已完成 {completedCount > 0 && `(${completedCount})`}
        </View>
      </View>

      {activeTab === 'pending' && (
        <View className={styles.scheduleRow}>
          {scheduleOptions.map(opt => (
            <View
              key={opt.key}
              className={`${styles.scheduleItem} ${activeSchedule === opt.key ? styles.scheduleActive : ''}`}
              style={{ borderColor: activeSchedule === opt.key ? opt.color : 'transparent' }}
              onClick={() => setActiveSchedule(opt.key)}
            >
              <Text className={styles.scheduleCount} style={{ color: opt.color }}>
                {opt.count}
              </Text>
              <Text className={styles.scheduleLabel}>{opt.label}</Text>
            </View>
          ))}
        </View>
      )}

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
          全部类型
        </View>
        {usedTypes.map(type => {
          const count = filteredTodos.filter(t => t.type === type).length;
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

      {activeTab === 'pending' && filteredTodos.length > 0 && (
        <View className={styles.batchBar}>
          <View className={styles.batchLeft}>
            <Checkbox
              checked={selectedIds.size === filteredTodos.length && filteredTodos.length > 0}
              onChange={toggleSelectAll}
            />
            <Text className={styles.batchText}>全选 ({selectedIds.size}/{filteredTodos.length})</Text>
          </View>
          <View className={styles.batchBtn} onClick={openBatchModal}>
            批量完成
          </View>
        </View>
      )}

      {filteredTodos.length === 0 ? (
        <View className={styles.empty}>
          <Text>暂无{activeTab === 'pending' ? '待回访' : '已完成'}记录</Text>
        </View>
      ) : (
        filteredTodos.map(todo => {
          const lastRecord = getOrderLastRecord(todo.orderId);
          const isSelected = selectedIds.has(todo.id);
          const overdue = activeTab === 'pending' && isOverdue(todo.scheduledDate);

          return (
            <View key={todo.id} className={`${styles.todoCard} ${isSelected ? styles.todoSelected : ''}`}>
              {activeTab === 'pending' && batchMode === false && selectedIds.size > 0 ? null : activeTab === 'pending' ? null : null}
              {activeTab === 'pending' && (
                <View className={styles.todoCheckbox} onClick={() => toggleSelect(todo.id)}>
                  <Checkbox checked={isSelected} />
                </View>
              )}

              <View style={{ flex: 1 }}>
                <View className={styles.todoHeader}>
                  <View className={`${styles.typeTag} ${
                    todo.status === '待处理' ? styles.typePending : styles.typeCompleted
                  } ${overdue ? styles.typeOverdue : ''}`}>
                    {getTypeIcon(todo.type)} {todo.type}
                    {overdue && <Text style={{ marginLeft: 8, fontSize: 20 }}>⚠️ 已逾期</Text>}
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
            </View>
          );
        })
      )}

      {showModal && (
        <View className={styles.modalMask}>
          <View className={styles.modal}>
            <Text className={styles.modalTitle}>
              {batchMode ? `批量完成 (${selectedIds.size}条)` : '完成回访'}
            </Text>
            {batchMode && (
              <Text style={{ textAlign: 'center', fontSize: 24, color: '#86909C', marginBottom: 20 }}>
                将统一填写以下回访内容
              </Text>
            )}
            <Textarea
              className={styles.modalInput}
              placeholder="请输入回访内容，如家属情绪、需求反馈等..."
              value={batchContent}
              onInput={(e) => setBatchContent(e.detail.value)}
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
                onClick={batchMode ? confirmBatch : handleCancel}
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
