import React from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';

const levelLabelMap = {
  basic: '基础款',
  standard: '标准款',
  premium: '尊享款'
};

const PackageDetailPage: React.FC = () => {
  const { currentPackageId, getPackageById, setCurrentPackage } = useAppStore();
  const pkg = currentPackageId ? getPackageById(currentPackageId) : null;

  if (!pkg) {
    return (
      <View style={{ padding: 100, textAlign: 'center' }}>
        <Text>套餐不存在</Text>
      </View>
    );
  }

  const handleContact = () => {
    Taro.showModal({
      title: '咨询热线',
      content: '24小时服务热线：400-888-8888\n是否立即拨打？',
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({ phoneNumber: '4008888888' });
        }
      }
    });
  };

  const handleOrder = () => {
    setCurrentPackage(pkg.id);
    Taro.navigateTo({ url: '/pages/order-create/index' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.banner}>
        <Image className={styles.bannerImage} src={pkg.imageUrl} mode="aspectFill" />
        <View className={styles.bannerOverlay}>
          <View className={styles.levelTag}>{levelLabelMap[pkg.level]}</View>
          <Text className={styles.packageName}>{pkg.name}</Text>
          <Text className={styles.packageDesc}>{pkg.description}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.priceCard}>
          <View className={styles.priceLeft}>
            <Text className={styles.priceSymbol}>¥</Text>
            <Text className={styles.priceValue}>{pkg.price.toLocaleString()}</Text>
            {pkg.originalPrice && (
              <Text className={styles.originalPrice}>¥{pkg.originalPrice.toLocaleString()}</Text>
            )}
          </View>
          {pkg.originalPrice && (
            <View className={styles.discountTag}>
              立省 ¥{(pkg.originalPrice - pkg.price).toLocaleString()}
            </View>
          )}
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>套餐特色</Text>
          <View className={styles.featuresList}>
            {pkg.features.map((f, i) => (
              <View key={i} className={styles.featureItem}>
                {f}
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>服务项目明细</Text>
          <View className={styles.servicesList}>
            {pkg.services.map((svc, i) => (
              <View key={i} className={styles.serviceItem}>
                <View className={`${styles.serviceCheck} ${svc.included ? styles.checkIncluded : styles.checkNotIncluded}`}>
                  {svc.included ? '✓' : '×'}
                </View>
                <View className={styles.serviceInfo}>
                  <Text
                    className={styles.serviceName}
                    style={{ color: svc.included ? '#1D2129' : '#86909C' }}
                  >
                    {svc.name}
                  </Text>
                  {svc.remark && (
                    <Text className={styles.serviceRemark}>{svc.remark}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.sectionCard}>
          <Text className={styles.sectionTitle}>适用说明</Text>
          <Text className={styles.suitableText}>{pkg.suitable}</Text>
        </View>
      </View>

      <View className={styles.footerBar}>
        <Button className={styles.btnSecondary} onClick={handleContact}>
          电话咨询
        </Button>
        <Button className={styles.btnPrimary} onClick={handleOrder}>
          立即下单
        </Button>
      </View>
    </ScrollView>
  );
};

export default PackageDetailPage;
