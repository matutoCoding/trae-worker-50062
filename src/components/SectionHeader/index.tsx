import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  showMore?: boolean;
  moreText?: string;
  onMoreClick?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  showMore = false,
  moreText = '更多',
  onMoreClick,
  className
}) => {
  const handleMore = () => {
    if (onMoreClick) {
      onMoreClick();
    }
  };

  return (
    <View className={classnames(styles.sectionHeader, className)}>
      <View className={styles.left}>
        <View className={styles.titleBar}></View>
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showMore && (
        <Button className={styles.moreBtn} onClick={handleMore}>
          {moreText}
          <Text className={styles.arrow}>›</Text>
        </Button>
      )}
    </View>
  );
};

export default SectionHeader;
