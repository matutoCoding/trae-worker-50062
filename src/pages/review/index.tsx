import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import classnames from 'classnames';

const ratingTexts = ['', '很差', '较差', '一般', '满意', '非常满意'];

const defaultRatings = [
  { key: 'transport', label: '遗体接运服务' },
  { key: 'makeup', label: '遗容化妆整理' },
  { key: 'hall', label: '灵堂布置' },
  { key: 'ceremony', label: '告别仪式' },
  { key: 'cremation', label: '火化服务' },
  { key: 'staff', label: '服务人员态度' },
];

const positiveTags = [
  '服务专业', '态度热情', '流程顺畅', '环境整洁',
  '价格透明', '响应及时', '仪式庄重', '家属安抚到位',
  '宗教习俗尊重', '全程贴心', '细致周到', '值得推荐'
];

const negativeTags = [
  '等待时间长', '沟通不畅', '价格偏高', '设施一般',
  '流程混乱', '态度冷淡'
];

const ReviewPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.orderId || '';
  const { getOrderById } = useAppStore();
  const order = getOrderById(orderId);

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    defaultRatings.forEach(r => { init[r.key] = 5; });
    return init;
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [followUps, setFollowUps] = useState([
    { key: 'week7', name: '7天回访', desc: '首七慰问电话', icon: '📞', enabled: true },
    { key: 'week49', name: '七七回访', desc: '七七四十九天慰问', icon: '💐', enabled: true },
    { key: 'year1', name: '周年纪念', desc: '一周年纪念提醒', icon: '🕯️', enabled: false },
    { key: 'qingming', name: '清明提醒', desc: '清明祭扫提醒', icon: '🌸', enabled: true },
  ]);

  const overallScore = useMemo(() => {
    const values = Object.values(ratings);
    if (values.length === 0) return 5;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 10) / 10;
  }, [ratings]);

  const overallRating = Math.round(overallScore);

  if (!order) {
    return (
      <View className={styles.page} style={{ padding: 100, textAlign: 'center' }}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  const setRating = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleFollowUp = (key: string) => {
    setFollowUps(prev =>
      prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f)
    );
  };

  const handleSubmit = () => {
    if (overallScore < 1) {
      Taro.showToast({ title: '请完成评分', icon: 'none' });
      return;
    }
    Taro.showLoading({ title: '提交中...', mask: true });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '评价提交成功', icon: 'success' });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 1000);
  };

  const handleSkip = () => {
    Taro.showModal({
      title: '提示',
      content: '跳过评价后可在"我的-待评价"中继续评价，是否跳过？',
      success: (res) => {
        if (res.confirm) Taro.navigateBack();
      }
    });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.orderInfo}>
        <View className={styles.orderRow}>
          <Text className={styles.orderLabel}>订单号</Text>
          <Text className={styles.orderValue}>{order.orderNo}</Text>
        </View>
        <View className={styles.orderRow}>
          <Text className={styles.orderLabel}>逝者姓名</Text>
          <Text className={styles.orderValue}>{order.deceased.name}</Text>
        </View>
        <View className={styles.orderRow}>
          <Text className={styles.orderLabel}>服务套餐</Text>
          <Text className={styles.orderValue} style={{ color: '#D4A574' }}>
            {order.packageName || '自定义服务'}
          </Text>
        </View>
        <View className={styles.orderRow}>
          <Text className={styles.orderLabel}>完成时间</Text>
          <Text className={styles.orderValue}>{order.updatedAt}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.overallRating}>
          <View className={styles.overallStars}>
            {[1, 2, 3, 4, 5].map(s => (
              <Text
                key={s}
                className={classnames(styles.overallStar, {
                  [styles.overallStarActive]: s <= overallRating
                })}
              >★</Text>
            ))}
          </View>
          <Text className={styles.overallScore}>{overallScore} 分</Text>
          <Text className={styles.overallLabel}>综合评分</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>分项评分</Text>
        {defaultRatings.map(item => {
          const value = ratings[item.key] || 0;
          return (
            <View key={item.key} className={styles.ratingBlock}>
              <View className={styles.ratingRow}>
                <Text className={styles.ratingLabel}>{item.label}</Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <View className={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Text
                        key={s}
                        className={classnames(styles.star, { [styles.starActive]: s <= value })}
                        onClick={() => setRating(item.key, s)}
                      >★</Text>
                    ))}
                  </View>
                  <Text className={classnames(styles.ratingText, {
                    [styles.ratingTextActive]: value > 0
                  })}>
                    {ratingTexts[value]}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>标签评价</Text>
        <View className={styles.tagsSection}>
          <Text className={styles.tagsTitle}>
            👍 优点 (点击选择)
          </Text>
          <View className={styles.tagsGrid}>
            {positiveTags.map(tag => (
              <View
                key={tag}
                className={classnames(styles.tagItem, {
                  [styles.tagActive]: selectedTags.includes(tag)
                })}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>评价内容</Text>
        <View className={styles.commentSection}>
          <View className={styles.commentTitle}>
            <Text>文字评价</Text>
            <Text className={styles.commentCount}>{comment.length}/500</Text>
          </View>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您的服务体验，您的建议对我们非常重要..."
            value={comment}
            onInput={(e) => setComment(e.detail.value)}
            maxlength={500}
          />
          <View className={styles.imageUpload}>
            <View className={styles.uploadItem}>
              <Text className={styles.uploadIcon}>📷</Text>
              <Text>上传图片</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>回访关怀设置</Text>
        <View className={styles.followUpSection}>
          <Text className={styles.followUpTitle}>
            我们将按以下计划进行回访和关怀：
          </Text>
          {followUps.map(item => (
            <View key={item.key} className={styles.followUpItem}>
              <View className={styles.followUpIcon}>{item.icon}</View>
              <View className={styles.followUpInfo}>
                <Text className={styles.followUpName}>{item.name}</Text>
                <Text className={styles.followUpDesc}>{item.desc}</Text>
              </View>
              <View
                className={classnames(styles.followUpSwitch, { [styles.switchOn]: item.enabled })}
                onClick={() => toggleFollowUp(item.key)}
              />
            </View>
          ))}
        </View>
      </View>

      <View className={styles.footerBar}>
        <View className={styles.footerText}>
          已选择 <strong>{selectedTags.length}</strong> 个标签
        </View>
        <Button className={styles.btnSkip} onClick={handleSkip}>
          稍后评价
        </Button>
        <Button className={styles.btnSubmit} onClick={handleSubmit}>
          提交评价
        </Button>
      </View>
    </ScrollView>
  );
};

export default ReviewPage;
