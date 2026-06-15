import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { ProcessNode } from '@/types';

interface ProcessTimelineProps {
  nodes: ProcessNode[];
  className?: string;
}

const statusConfig = {
  completed: { dotClass: 'dotCompleted', lineClass: 'lineCompleted', textClass: 'textCompleted' },
  in_progress: { dotClass: 'dotProgress', lineClass: 'lineProgress', textClass: 'textProgress' },
  pending: { dotClass: 'dotPending', lineClass: 'linePending', textClass: 'textPending' }
};

const ProcessTimeline: React.FC<ProcessTimelineProps> = ({ nodes, className }) => {
  return (
    <View className={classnames(styles.timeline, className)}>
      {nodes.map((node, index) => {
        const config = statusConfig[node.status];
        const isLast = index === nodes.length - 1;

        return (
          <View key={node.id} className={styles.timelineItem}>
            <View className={styles.timelineLeft}>
              <View className={classnames(styles.dot, styles[config.dotClass])}>
                {node.status === 'completed' && <Text className={styles.checkMark}>✓</Text>}
                {node.status === 'in_progress' && <View className={styles.pulseRing}></View>}
              </View>
              {!isLast && (
                <View className={classnames(styles.line, styles[config.lineClass])}></View>
              )}
            </View>

            <View className={styles.timelineContent}>
              <View className={styles.header}>
                <Text className={classnames(styles.nodeName, styles[config.textClass])}>
                  {node.name}
                </Text>
                <View
                  className={classnames(styles.statusBadge, {
                    [styles.badgeCompleted]: node.status === 'completed',
                    [styles.badgeProgress]: node.status === 'in_progress',
                    [styles.badgePending]: node.status === 'pending'
                  })}
                >
                  {node.status === 'completed' ? '已完成' : node.status === 'in_progress' ? '进行中' : '待处理'}
                </View>
              </View>

              <Text className={styles.nodeDesc}>{node.description}</Text>

              {node.assignee && (
                <View className={styles.nodeMeta}>
                  <Text className={styles.metaLabel}>负责人:</Text>
                  <Text className={styles.metaValue}>{node.assignee}</Text>
                </View>
              )}

              {node.scheduledTime && node.status !== 'completed' && (
                <View className={styles.nodeMeta}>
                  <Text className={styles.metaLabel}>计划时间:</Text>
                  <Text className={styles.metaValue}>{node.scheduledTime}</Text>
                </View>
              )}

              {node.completedTime && node.status === 'completed' && (
                <View className={styles.nodeMeta}>
                  <Text className={styles.metaLabel}>完成时间:</Text>
                  <Text className={styles.metaValueSuccess}>{node.completedTime}</Text>
                </View>
              )}

              {node.remark && (
                <View className={styles.nodeRemark}>
                  <Text className={styles.remarkText}>{node.remark}</Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default ProcessTimeline;
