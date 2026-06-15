import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Package } from '@/types';

interface PackageCardProps {
  pkg: Package;
  className?: string;
  onView?: () => void;
  onSelect?: () => void;
}

const levelConfig = {
  basic: { label: '基础款', bg: '$color-tag-basic', color: '#165DFF' },
  standard: { label: '标准款', bg: '$color-tag-standard', color: '#FF7D00' },
  premium: { label: '尊享款', bg: '$color-tag-premium', color: '#722ED1' }
};

const PackageCard: React.FC<PackageCardProps> = ({ pkg, className, onView, onSelect }) => {
  const config = levelConfig[pkg.level];

  const handleClick = () => {
    if (onView) {
      onView();
    }
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect();
    }
  };

  return (
    <View className={classnames(styles.packageCard, className)} onClick={handleClick}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={pkg.imageUrl} mode="aspectFill" />
        <View
          className={classnames(styles.levelTag, {
            [styles.levelBasic]: pkg.level === 'basic',
            [styles.levelStandard]: pkg.level === 'standard',
            [styles.levelPremium]: pkg.level === 'premium'
          })}
        >
          {config.label}
        </View>
        {pkg.originalPrice && (
          <View className={styles.discountTag}>
            省¥{(pkg.originalPrice - pkg.price).toLocaleString()}
          </View>
        )}
      </View>

      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.name}>{pkg.name}</Text>
        </View>

        <Text className={styles.desc}>{pkg.description}</Text>

        <View className={styles.features}>
          {pkg.features.slice(0, 4).map((f, i) => (
            <View key={i} className={styles.featureItem}>
              <Text className={styles.featureDot}>●</Text>
              <Text className={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>

        <View className={styles.footer}>
          <View className={styles.priceWrap}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.price}>{pkg.price.toLocaleString()}</Text>
            {pkg.originalPrice && (
              <Text className={styles.originalPrice}>¥{pkg.originalPrice.toLocaleString()}</Text>
            )}
          </View>
          <Button className={styles.selectBtn} onClick={handleSelect}>
            选择
          </Button>
        </View>
      </View>
    </View>
  );
};

export default PackageCard;
