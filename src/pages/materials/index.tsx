import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import MaterialCard from '@/components/MaterialCard';
import classnames from 'classnames';

type CategoryType = '全部' | '寿衣' | '骨灰盒' | '祭奠用品' | '其他';

const MaterialsPage: React.FC = () => {
  const { materials } = useAppStore();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('全部');
  const [refreshing, setRefreshing] = useState(false);

  const categories: CategoryType[] = ['全部', '寿衣', '骨灰盒', '祭奠用品', '其他'];

  const lowStockItems = useMemo(() =>
    materials.filter(m => m.stock > 0 && m.stock <= m.warningStock),
    [materials]
  );
  const outOfStockItems = useMemo(() =>
    materials.filter(m => m.stock === 0),
    [materials]
  );

  const filteredMaterials = useMemo(() => {
    if (activeCategory === '全部') return materials;
    return materials.filter(m => m.category === activeCategory);
  }, [materials, activeCategory]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  };

  const handleMaterialClick = (materialId: string) => {
    Taro.showModal({
      title: '物资详情',
      content: `物资ID: ${materialId}\n(后续可跳转详情页)`,
      showCancel: false
    });
  };

  const handleAllocate = (materialName: string) => {
    Taro.showActionSheet({
      itemList: ['调配合订单', '登记出库', '申请补货'],
      success: (res) => {
        const actions = ['已选择调配至订单', '已登记出库', '已提交补货申请'];
        Taro.showToast({ title: actions[res.tapIndex], icon: 'success' });
      }
    });
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <View className={styles.warningBanner}>
            <Text className={styles.warningIcon}>⚠️</Text>
            <View className={styles.warningContent}>
              <Text className={styles.warningTitle}>库存预警提醒</Text>
              <Text className={styles.warningDesc}>
                {lowStockItems.length > 0 && `${lowStockItems.length}种物资库存偏低`}
                {outOfStockItems.length > 0 && `，${outOfStockItems.length}种物资缺货`}
                ，请及时补货
              </Text>
            </View>
          </View>
        )}

        <View className={styles.categorySection}>
          <ScrollView scrollX enhanced showScrollbar={false} className={styles.categoryTabs}>
            {categories.map(cat => (
              <View
                key={cat}
                className={classnames(styles.categoryTab, {
                  [styles.categoryActive]: activeCategory === cat
                })}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={`${styles.statValue} ${styles.normalText}`}>
              {materials.length}
            </Text>
            <Text className={styles.statLabel}>物资种类</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={`${styles.statValue} ${styles.warningText}`}>
              {lowStockItems.length}
            </Text>
            <Text className={styles.statLabel}>库存偏低</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={`${styles.statValue} ${styles.dangerText}`}>
              {outOfStockItems.length}
            </Text>
            <Text className={styles.statLabel}>已缺货</Text>
          </View>
        </View>
      </View>

      <View className={styles.materialsGrid}>
        <View className={styles.gridTitle}>
          <Text className={styles.titleText}>
            {activeCategory === '全部' ? '全部物资' : activeCategory}
          </Text>
          <Text className={styles.totalCount}>共 {filteredMaterials.length} 种</Text>
        </View>

        <View className={styles.listContainer}>
          {filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => handleMaterialClick(material.id)}
              onAllocate={() => handleAllocate(material.name)}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default MaterialsPage;
