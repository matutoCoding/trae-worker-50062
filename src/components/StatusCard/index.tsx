import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatusCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  type?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
  className?: string;
  onClick?: () => void;
}

const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  subtitle,
  type = 'default',
  className,
  onClick
}) => {
  return (
    <View
      className={classnames(styles.statusCard, className, {
        [styles.typePrimary]: type === 'primary',
        [styles.typeWarning]: type === 'warning',
        [styles.typeDanger]: type === 'danger',
        [styles.typeSuccess]: type === 'success'
      })}
      onClick={onClick}
    >
      <Text className={styles.value}>{value}</Text>
      <Text className={styles.title}>{title}</Text>
      {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

export default StatusCard;
