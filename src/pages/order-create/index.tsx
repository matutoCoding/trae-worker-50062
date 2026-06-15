import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button, ScrollView, Radio } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import classnames from 'classnames';
import type { Order } from '@/types';

const OrderCreatePage: React.FC = () => {
  const { currentPackageId, packages, addOrder } = useAppStore();
  const selectedPkg = currentPackageId ? packages.find(p => p.id === currentPackageId) : null;

  const [form, setForm] = useState({
    deceasedName: '',
    gender: 'male' as 'male' | 'female',
    age: '',
    dateOfDeath: '',
    placeOfDeath: '',
    religion: '',
    customs: '',
    familyName: '',
    relation: '',
    phone: '',
    address: '',
    specialRequirements: '',
    urgency: '普通' as '普通' | '紧急',
    packageId: currentPackageId || ''
  });

  const updateForm = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleSubmit = () => {
    if (!form.deceasedName.trim()) {
      Taro.showToast({ title: '请填写逝者姓名', icon: 'none' });
      return;
    }
    if (!form.familyName.trim()) {
      Taro.showToast({ title: '请填写家属姓名', icon: 'none' });
      return;
    }
    if (!form.phone.trim()) {
      Taro.showToast({ title: '请填写联系电话', icon: 'none' });
      return;
    }

    const timestamp = Date.now();
    const dateStr = new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, '');
    const newOrder: Order = {
      id: `ord-${timestamp}`,
      orderNo: `BS${dateStr}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      status: '待派工',
      urgency: form.urgency,
      packageId: form.packageId || undefined,
      packageName: selectedPkg?.name || undefined,
      deceased: {
        name: form.deceasedName,
        gender: form.gender,
        age: parseInt(form.age) || 0,
        dateOfDeath: form.dateOfDeath || new Date().toISOString().slice(0, 16).replace('T', ' '),
        placeOfDeath: form.placeOfDeath,
        religion: form.religion || undefined,
        customs: form.customs || undefined
      },
      familyMembers: [
        {
          name: form.familyName,
          relation: form.relation || '家属',
          phone: form.phone,
          isPrimary: true
        }
      ],
      processNodes: [
        { id: 'pn1', name: '遗体接运', description: '从指定地点接运至殡仪馆', status: 'pending' },
        { id: 'pn2', name: '遗容整理', description: '专业化妆师进行遗容整理', status: 'pending' },
        { id: 'pn3', name: '灵堂布置', description: '灵堂鲜花及设施布置', status: 'pending' },
        { id: 'pn4', name: '告别仪式', description: '告别仪式及祭奠', status: 'pending' },
        { id: 'pn5', name: '火化服务', description: '火化及骨灰整理', status: 'pending' }
      ],
      dispatchTasks: [],
      materialUsages: [],
      chatMessages: [],
      settlement: [],
      specialRequirements: form.specialRequirements || undefined,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      serviceAddress: form.address || '待确认'
    };

    addOrder(newOrder);
    Taro.showToast({ title: '订单创建成功', icon: 'success' });
    setTimeout(() => {
      Taro.redirectTo({ url: `/pages/order-detail/index?orderId=${newOrder.id}` });
    }, 1000);
  };

  const selectPackage = () => {
    Taro.navigateTo({ url: '/pages/package-detail/index' });
  };

  const religionOptions = ['佛教', '道教', '基督教', '伊斯兰教', '无宗教信仰', '其他'];

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.urgencySection}>
        <Text className={styles.urgencyTitle}>
          ⚠️ 订单紧急程度
        </Text>
        <View className={styles.radioGroup}>
          <View
            className={classnames(styles.radioItem, { [styles.radioActive]: form.urgency === '普通' })}
            onClick={() => updateForm('urgency', '普通')}
          >
            普通服务（30分钟内响应）
          </View>
          <View
            className={classnames(styles.radioItem, { [styles.radioActive]: form.urgency === '紧急' })}
            onClick={() => updateForm('urgency', '紧急')}
          >
            🔥 加急服务（15分钟内响应）
          </View>
        </View>
        <Text className={styles.urgencyTip}>
          加急服务将优先调度人员和车辆，确保第一时间到达现场。
        </Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formHeader}>
          <View className={styles.formHeaderIcon}>🕊️</View>
          <Text className={styles.formHeaderTitle}>逝者信息</Text>
        </View>
        <View className={styles.formBody}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>姓名
            </Text>
            <View className={styles.formInput}>
              <Input
                placeholder="请输入逝者姓名"
                value={form.deceasedName}
                onInput={(e) => updateForm('deceasedName', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>性别
            </Text>
            <View className={styles.radioGroup}>
              <View
                className={classnames(styles.radioItem, { [styles.radioActive]: form.gender === 'male' })}
                onClick={() => updateForm('gender', 'male')}
              >
                男
              </View>
              <View
                className={classnames(styles.radioItem, { [styles.radioActive]: form.gender === 'female' })}
                onClick={() => updateForm('gender', 'female')}
              >
                女
              </View>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>年龄</Text>
            <View className={styles.formInput}>
              <Input
                type="number"
                placeholder="请输入年龄"
                value={form.age}
                onInput={(e) => updateForm('age', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>离世时间</Text>
            <View className={styles.formInput}>
              <Input
                placeholder="例: 2026-06-16 08:30"
                value={form.dateOfDeath}
                onInput={(e) => updateForm('dateOfDeath', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>离世地点</Text>
            <View className={styles.formInput}>
              <Input
                placeholder="医院/家中/养老中心等"
                value={form.placeOfDeath}
                onInput={(e) => updateForm('placeOfDeath', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>宗教信仰</Text>
            <View className={styles.radioGroup}>
              {religionOptions.map(opt => (
                <View
                  key={opt}
                  className={classnames(styles.radioItem, { [styles.radioActive]: form.religion === opt })}
                  onClick={() => updateForm('religion', opt)}
                >
                  {opt}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>习俗要求</Text>
            <View className={styles.formInput}>
              <Input
                placeholder="如: 传统汉族葬礼、简化仪式等"
                value={form.customs}
                onInput={(e) => updateForm('customs', e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formHeader}>
          <View className={styles.formHeaderIcon}>👨‍👩‍👧</View>
          <Text className={styles.formHeaderTitle}>家属信息</Text>
        </View>
        <View className={styles.formBody}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>姓名
            </Text>
            <View className={styles.formInput}>
              <Input
                placeholder="请输入家属姓名"
                value={form.familyName}
                onInput={(e) => updateForm('familyName', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>与逝者关系</Text>
            <View className={styles.radioGroup}>
              {['配偶', '子女', '父母', '兄弟姐妹', '其他'].map(opt => (
                <View
                  key={opt}
                  className={classnames(styles.radioItem, { [styles.radioActive]: form.relation === opt })}
                  onClick={() => updateForm('relation', opt)}
                >
                  {opt}
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>联系电话
            </Text>
            <View className={styles.formInput}>
              <Input
                type="number"
                placeholder="请输入手机号"
                value={form.phone}
                onInput={(e) => updateForm('phone', e.detail.value)}
              />
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>服务地址</Text>
            <View className={styles.formInput}>
              <Input
                placeholder="殡仪馆/家中详细地址"
                value={form.address}
                onInput={(e) => updateForm('address', e.detail.value)}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formHeader}>
          <View className={styles.formHeaderIcon}>🎁</View>
          <Text className={styles.formHeaderTitle}>服务选择</Text>
        </View>
        <View className={styles.formBody}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>服务套餐</Text>
            <View className={styles.formSelect} onClick={selectPackage}>
              {selectedPkg ? (
                <Text className={styles.selectValue}>{selectedPkg.name} (¥{selectedPkg.price.toLocaleString()})</Text>
              ) : (
                <Text className={styles.selectPlaceholder}>请选择服务套餐（可选）</Text>
              )}
              <Text className={styles.selectArrow}>›</Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>特殊需求</Text>
            <View className={styles.formInput}>
              <Textarea
                placeholder="如: 需要佛教法事、守灵素食、指定日期等特殊要求"
                value={form.specialRequirements}
                onInput={(e) => updateForm('specialRequirements', e.detail.value)}
                style={{ width: '100%', minHeight: 150, fontSize: 28 }}
                maxlength={500}
              />
            </View>
          </View>
        </View>
      </View>

      <View className={styles.footerBar}>
        <Button className={styles.btnCancel} onClick={handleCancel}>
          取消
        </Button>
        <Button
          className={classnames(styles.btnSubmit, { [styles.urgent]: form.urgency === '紧急' })}
          onClick={handleSubmit}
        >
          {form.urgency === '紧急' ? '🚨 提交加急订单' : '创建订单'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default OrderCreatePage;
