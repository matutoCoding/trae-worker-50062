import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Order } from '@/types';

interface OrderCardProps {
  order: Order;
  className?: string;
  onClick?: () => void;
  onDispatch?: () => void;
  onTrack?: () => void;
}

const statusConfig = {
  '待派工': { color: '#FF7D00', bg: '$color-tag-warning' },
  '进行中': { color: '#165DFF', bg: '$color-tag-basic' },
  '已完成': { color: '#00B42A', bg: '$color-tag-success' },
  '已取消': { color: '#86909C', bg: '$color-bg-hover' }
};

const OrderCard: React.FC<OrderCardProps> = ({ order, className, onClick, onDispatch, onTrack }) => {
  const status = statusConfig[order.status];

  const handleDispatch = (e) => {
    e.stopPropagation();
    if (onDispatch) onDispatch();
  };

  const handleTrack = (e) => {
    e.stopPropagation();
    if (onTrack) onTrack();
  };

  const completedNodes = order.processNodes.filter(n => n.status === 'completed').length;
  const totalNodes = order.processNodes.length;
  const progress = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const primaryContact = order.familyMembers.find(f => f.isPrimary) || order.familyMembers[0];

  return (
    <View className={classnames(styles.orderCard, className)} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.orderNoWrap}>
          <Text className={styles.orderNo}>订单号: {order.orderNo}</Text>
        </View>
        <View className={styles.tags}>
          {order.urgency === '紧急' && (
            <View className={styles.urgentTag}>
              紧急
            </View>
          )}
          <View
            className={classnames(styles.statusTag, {
              [styles.statusPending]: order.status === '待派工',
              [styles.statusProgress]: order.status === '进行中',
              [styles.statusDone]: order.status === '已完成',
              [styles.statusCancel]: order.status === '已取消'
            })}
          >
            {order.status}
          </View>
        </View>
      </View>

      <View className={styles.deceasedInfo}>
        <View className={styles.avatar}>
          <Text className={styles.avatarText}>
            {order.deceased.gender === 'male' ? '男' : '女'}
          </Text>
        </View>
        <View className={styles.info}>
          <View className={styles.nameRow}>
            <Text className={styles.name}>{order.deceased.name}</Text>
            <Text className={styles.age}>享年 {order.deceased.age} 岁</Text>
          </View>
          <View className={styles.detailRow}>
            <Text className={styles.detailText}>离世时间: {order.deceased.dateOfDeath}</Text>
          </View>
          <View className={styles.detailRow}>
            <Text className={styles.detailText}>地点: {order.deceased.placeOfDeath}</Text>
          </View>
        </View>
      </View>

      {order.packageName && (
        <View className={styles.packageRow}>
          <Text className={styles.label}>服务套餐:</Text>
          <Text className={styles.packageName}>{order.packageName}</Text>
        </View>
      )}

      {order.status === '进行中' && (
        <View className={styles.progressWrap}>
          <View className={styles.progressHeader}>
            <Text className={styles.progressLabel}>服务进度</Text>
            <Text className={styles.progressPercent}>{progress}%</Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            ></View>
          </View>
          <View className={styles.progressText}>
            <Text>{completedNodes}/{totalNodes} 个节点已完成</Text>
          </View>
        </View>
      )}

      <View className={styles.contactRow}>
        <Text className={styles.contactLabel}>联系人:</Text>
        <Text className={styles.contactName}>{primaryContact?.name}</Text>
        <Text className={styles.contactRelation}>({primaryContact?.relation})</Text>
        <Text className={styles.contactPhone}>{primaryContact?.phone}</Text>
      </View>

      <View className={styles.timeRow}>
        <Text className={styles.timeText}>创建于 {order.createdAt}</Text>
      </View>

      <View className={styles.actions}>
        {order.status === '待派工' && (
          <Button className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handleDispatch}>
            立即派工
          </Button>
        )}
        {order.status === '进行中' && (
          <Button className={classnames(styles.actionBtn, styles.primaryBtn)} onClick={handleTrack}>
            跟踪流程
          </Button>
        )}
        <Button className={classnames(styles.actionBtn, styles.secondaryBtn)} onClick={onClick}>
          查看详情
        </Button>
      </View>
    </View>
  );
};

export default OrderCard;
