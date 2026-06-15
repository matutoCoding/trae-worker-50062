import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import classnames from 'classnames';
import type { Staff, DispatchTask } from '@/types';

const roleIconMap: Record<string, string> = {
  '司仪': '🎤',
  '接运员': '🚗',
  '化妆师': '💄',
  '殡仪师': '🕊️',
  '火化师': '🔥',
  '乐师': '🎵',
  '礼仪师': '💐',
  '管理员': '📋'
};

const DispatchDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId || '';
  const { orders, staffList, updateOrder, getOrderById } = useAppStore();
  const [tabActive, setTabActive] = useState<string>('all');

  const order = getOrderById(orderId);

  const [assignedStaff, setAssignedStaff] = useState<Record<string, Staff[]>>({});

  useEffect(() => {
    if (order) {
      const init: Record<string, Staff[]> = {};
      order.processNodes.forEach(node => {
        const task = order.dispatchTasks.find(t => t.processNodeId === node.id);
        if (task) {
          init[node.id] = task.staffIds
            .map(sid => staffList.find(s => s.id === sid))
            .filter(Boolean) as Staff[];
        }
      });
      setAssignedStaff(init);
    }
  }, [orderId]);

  if (!order) {
    return (
      <View className={styles.page} style={{ padding: 100, textAlign: 'center' }}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const filteredNodes = order.processNodes.filter(n => {
    if (tabActive === 'all') return true;
    if (tabActive === 'pending') return !assignedStaff[n.id] || assignedStaff[n.id].length === 0;
    if (tabActive === 'assigned') return assignedStaff[n.id] && assignedStaff[n.id].length > 0;
    return true;
  });

  const processIcons: Record<string, string> = {
    '遗体接运': '🚗',
    '遗容整理': '💄',
    '灵堂布置': '🏛️',
    '告别仪式': '🎤',
    '火化服务': '🔥',
    '骨灰安放': '⚱️'
  };

  const showStaffPicker = (nodeId: string, nodeName: string) => {
    const availableStaff = staffList.filter(s => s.status === 'available');
    const itemList = availableStaff.map(s => `${s.name} (${s.role}) ⭐${s.rating}`);
    Taro.showActionSheet({
      itemList,
      success: (res) => {
        const selected = availableStaff[res.tapIndex];
        const current = assignedStaff[nodeId] || [];
        if (current.find(s => s.id === selected.id)) {
          Taro.showToast({ title: '已派工', icon: 'none' });
          return;
        }
        const next = { ...assignedStaff, [nodeId]: [...current, selected] };
        setAssignedStaff(next);

        const newDispatchTasks: DispatchTask[] = order.processNodes.map(n => {
          const assigned = next[n.id] || [];
          return {
            id: `task-${n.id}`,
            processNodeId: n.id,
            taskName: `${nodeName}任务`,
            staffIds: assigned.map(s => s.id),
            startTime: assigned.length > 0 ? new Date().toISOString().slice(0, 16).replace('T', ' ') : undefined,
            status: assigned.length > 0 ? 'in_progress' : 'pending'
          };
        });

        updateOrder(order.id, { dispatchTasks: newDispatchTasks });
        Taro.showToast({ title: '派工成功', icon: 'success' });
      }
    });
  };

  const removeStaff = (nodeId: string, staffId: string) => {
    const current = assignedStaff[nodeId] || [];
    const next = { ...assignedStaff, [nodeId]: current.filter(s => s.id !== staffId) };
    setAssignedStaff(next);
    const newDispatchTasks = order.processNodes.map(n => {
      const assigned = next[n.id] || [];
      return {
        id: `task-${n.id}`,
        processNodeId: n.id,
        taskName: `${n.name}任务`,
        staffIds: assigned.map(s => s.id),
        startTime: assigned.length > 0 ? new Date().toISOString().slice(0, 16).replace('T', ' ') : undefined,
        status: assigned.length > 0 ? 'in_progress' : 'pending'
      };
    });
    updateOrder(order.id, { dispatchTasks: newDispatchTasks });
    Taro.showToast({ title: '已移除', icon: 'none' });
  };

  const totalAssigned = Object.values(assignedStaff).flat().length;
  const pendingCount = order.processNodes.filter(n => !assignedStaff[n.id] || assignedStaff[n.id].length === 0).length;

  const saveAndBack = () => {
    Taro.showToast({ title: '派工方案已保存', icon: 'success' });
    setTimeout(() => Taro.navigateBack(), 800);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>订单号 {order.orderNo}</Text>
        <Text className={styles.summarySubtitle}>人员派工管理</Text>
        <View className={styles.summaryStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{order.processNodes.length}</Text>
            <Text className={styles.statLabel}>待派工环节</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#D4A574' }}>{totalAssigned}</Text>
            <Text className={styles.statLabel}>已分配人员</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#FFB800' }}>{pendingCount}</Text>
            <Text className={styles.statLabel}>待分配</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>派工任务</Text>
        </View>
        <View className={styles.tabBar}>
          {[
            { key: 'all', label: '全部' },
            { key: 'pending', label: '待派工' },
            { key: 'assigned', label: '已派工' }
          ].map(tab => (
            <View
              key={tab.key}
              className={classnames(styles.tabItem, { [styles.tabActive]: tabActive === tab.key })}
              onClick={() => setTabActive(tab.key)}
            >
              {tab.label}
            </View>
          ))}
        </View>

        <View className={styles.taskList}>
          {filteredNodes.map(node => {
            const staffs = assignedStaff[node.id] || [];
            return (
              <View key={node.id} className={styles.taskItem}>
                <View className={styles.taskIcon}>
                  {processIcons[node.name] || '📋'}
                </View>
                <View className={styles.taskInfo}>
                  <Text className={styles.taskName}>{node.name}</Text>
                  <Text className={styles.taskDesc}>{node.description}</Text>
                  {staffs.length > 0 && (
                    <View style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {staffs.map(s => (
                        <View
                          key={s.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '4px 12px',
                            background: 'rgba(44,62,80,0.1)',
                            borderRadius: 20,
                            fontSize: 22,
                            color: '#2C3E50',
                            fontWeight: 500
                          }}
                          onClick={() => removeStaff(node.id, s.id)}
                        >
                          {roleIconMap[s.role] || '👷'} {s.name}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Button
                  className={classnames(styles.assignBtn, { [styles.btnAssigned]: staffs.length > 0 })}
                  onClick={() => showStaffPicker(node.id, node.name)}
                >
                  {staffs.length > 0 ? '添加' : '派工'}
                </Button>
              </View>
            );
          })}
          {filteredNodes.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>🎉</Text>
              <Text className={styles.emptyText}>所有环节均已派工完成</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>可用服务人员</Text>
        </View>
        {staffList.filter(s => s.status === 'available').map(staff => (
          <View key={staff.id} className={styles.staffCard}>
            <View className={styles.staffAvatar}>
              {staff.name.slice(0, 1)}
              <View className={classnames(
                styles.staffStatusDot,
                {
                  [styles.statusBusy]: staff.status === 'busy',
                  [styles.statusOff]: staff.status === 'off'
                }
              )} />
            </View>
            <View className={styles.staffInfo}>
              <View className={styles.staffNameRow}>
                <Text className={styles.staffName}>{staff.name}</Text>
                <View className={styles.staffRole}>{staff.role}</View>
              </View>
              <Text className={styles.staffMeta}>
                {staff.tasksToday}单今日 · 完成率{staff.completionRate}%
              </Text>
              <View className={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map(s => (
                  <Text key={s} className={s <= Math.floor(staff.rating) ? '' : styles.starEmpty}>★</Text>
                ))}
                <Text style={{ marginLeft: 8, color: '#86909C', fontSize: 22 }}>{staff.rating.toFixed(1)}</Text>
              </View>
            </View>
            <View style={{ fontSize: 36 }}>
              {roleIconMap[staff.role] || '👷'}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.footerBar}>
        <Button className={styles.btnSecondary} onClick={() => Taro.navigateBack()}>
          返回
        </Button>
        <Button className={styles.btnPrimary} onClick={saveAndBack}>
          保存派工方案
        </Button>
      </View>
    </ScrollView>
  );
};

export default DispatchDetailPage;
