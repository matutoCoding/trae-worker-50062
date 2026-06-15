import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Material } from '@/types';

interface MaterialCardProps {
  material: Material;
  className?: string;
  onClick?: () => void;
  onAllocate?: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, className, onClick, onAllocate }) => {
  const isLowStock = material.stock <= material.warningStock;
  const isOutOfStock = material.stock === 0;

  const handleAllocate = (e) => {
    e.stopPropagation();
    if (onAllocate) onAllocate();
  };

  return (
    <View className={classnames(styles.materialCard, className)} onClick={onClick}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={material.imageUrl} mode="aspectFill" />
        {isOutOfStock && (
          <View className={styles.outOfStockOverlay}>
            <Text className={styles.outOfStockText}>缺货</Text>
          </View>
        )}
      </View>

      <View className={styles.content}>
        <View className={styles.categoryTag}>{material.category}</View>

        <Text className={styles.name}>{material.name}</Text>

        {material.description && (
          <Text className={styles.desc}>{material.description}</Text>
        )}

        {material.specifications && (
          <Text className={styles.specs}>{material.specifications}</Text>
        )}

        <View className={styles.meta}>
          <View className={styles.priceWrap}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.price}>{material.price}</Text>
            <Text className={styles.unit}>/{material.unit}</Text>
          </View>

          <View
            className={classnames(styles.stockWrap, {
              [styles.stockLow]: isLowStock && !isOutOfStock,
              [styles.stockOut]: isOutOfStock
            })}
          >
            <Text className={styles.stockLabel}>库存:</Text>
            <Text className={styles.stockValue}>{material.stock}</Text>
            <Text className={styles.stockUnit}>{material.unit}</Text>
            {isLowStock && !isOutOfStock && (
              <View className={styles.warningDot}></View>
            )}
          </View>
        </View>

        <View className={styles.footer}>
          <Button
            className={classnames(styles.actionBtn, {
              [styles.btnDisabled]: isOutOfStock
            })}
            disabled={isOutOfStock}
            onClick={handleAllocate}
          >
            {isOutOfStock ? '已售罄' : '调配出库'}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default MaterialCard;
