import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, Input, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useTracker } from '../../hooks/useTracker';
import ConfirmDialog from '../../components/ConfirmDialog';
import { Tracker } from '../../types/api';
import { locale, formatTime } from '../../utils/locale';
import { navigateBack } from '../../utils/navigation';
import styles from './index.module.scss';

const TrackerDetailPage: React.FC = () => {
  const router = useRouter();
  const trackerId = router.params.id as string;
  
  const { 
    list, 
    updateTracker, 
    removeTracker, 
    startTracking, 
    stopTracking,
    loading 
  } = useTracker();
  
  const [tracker, setTracker] = useState<Tracker | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editFrequency, setEditFrequency] = useState(30);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // 频率选项
  const frequencyOptions = [
    { label: locale('5分钟'), value: 5 },
    { label: locale('10分钟'), value: 10 },
    { label: locale('15分钟'), value: 15 },
    { label: locale('30分钟'), value: 30 },
    { label: locale('1小时'), value: 60 },
    { label: locale('2小时'), value: 120 },
    { label: locale('6小时'), value: 360 },
    { label: locale('12小时'), value: 720 },
    { label: locale('24小时'), value: 1440 },
  ];

  // 根据ID查找追踪器
  useEffect(() => {
    if (trackerId && list.length > 0) {
      const foundTracker = list.find(t => t.id === trackerId);
      if (foundTracker) {
        setTracker(foundTracker);
        setEditFrequency(foundTracker.frequency);
      } else {
        Taro.showToast({
          title: locale('追踪器不存在'),
          icon: 'none',
        });
        navigateBack();
      }
    }
  }, [trackerId, list]);

  // 获取平台显示名称
  const getPlatformName = useCallback((platform: string) => {
    switch (platform) {
      case 'weibo':
        return locale('微博');
      case 'xiaohongshu':
        return locale('小红书');
      default:
        return platform;
    }
  }, []);

  // 获取状态显示信息
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return {
          text: locale('追踪中'),
          color: '#52c41a',
          bgColor: '#e8f5e8',
        };
      case 'stopped':
        return {
          text: locale('已停止'),
          color: '#fa8c16',
          bgColor: '#fff2e8',
        };
      default:
        return {
          text: status,
          color: '#666',
          bgColor: '#f0f0f0',
        };
    }
  }, []);

  // 处理启动/停止
  const handleToggleStatus = useCallback(async () => {
    if (!tracker) return;
    
    try {
      if (tracker.status === 'active') {
        await stopTracking(tracker.id);
      } else {
        await startTracking(tracker.id);
      }
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [tracker, startTracking, stopTracking]);

  // 处理编辑模式切换
  const handleToggleEditMode = useCallback(() => {
    if (editMode) {
      // 取消编辑，恢复原值
      if (tracker) {
        setEditFrequency(tracker.frequency);
      }
    }
    setEditMode(!editMode);
  }, [editMode, tracker]);

  // 处理频率选择
  const handleFrequencyChange = useCallback((e: any) => {
    const index = e.detail.value;
    setEditFrequency(frequencyOptions[index].value);
  }, []);

  // 保存编辑
  const handleSaveEdit = useCallback(async () => {
    if (!tracker) return;
    
    try {
      await updateTracker({
        id: tracker.id,
        frequency: editFrequency,
      });
      
      setEditMode(false);
      
      Taro.showToast({
        title: locale('保存成功'),
        icon: 'success',
      });
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [tracker, editFrequency, updateTracker]);

  // 处理删除
  const handleDelete = useCallback(async () => {
    if (!tracker) return;
    
    try {
      await removeTracker(tracker.id);
      
      Taro.showToast({
        title: locale('删除成功'),
        icon: 'success',
      });
      
      setTimeout(() => {
        navigateBack();
      }, 1500);
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [tracker, removeTracker]);

  // 复制链接
  const handleCopyUrl = useCallback(() => {
    if (!tracker) return;
    
    Taro.setClipboardData({
      data: tracker.url,
      success: () => {
        Taro.showToast({
          title: locale('链接已复制'),
          icon: 'success',
        });
      },
    });
  }, [tracker]);

  if (!tracker) {
    return (
      <View className={styles.container}>
        <View className={styles.loading}>
          <Text>{locale('加载中...')}</Text>
        </View>
      </View>
    );
  }

  const statusInfo = getStatusInfo(tracker.status);
  const currentFrequencyIndex = frequencyOptions.findIndex(
    option => option.value === editFrequency
  );

  return (
    <View className={styles.container}>
      {/* 头部 */}
      <View className={styles.header}>
        <Button 
          className={styles.backBtn}
          size='mini'
          onClick={navigateBack}
        >
          ← {locale('返回')}
        </Button>
        
        <Text className={styles.title}>{locale('追踪详情')}</Text>
        
        <Button 
          className={styles.editBtn}
          size='mini'
          onClick={handleToggleEditMode}
        >
          {editMode ? locale('取消') : locale('编辑')}
        </Button>
      </View>

      {/* 内容 */}
      <View className={styles.content}>
        {/* 基本信息 */}
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>{locale('基本信息')}</Text>
            <View 
              className={styles.status}
              style={{ 
                color: statusInfo.color, 
                backgroundColor: statusInfo.bgColor 
              }}
            >
              {statusInfo.text}
            </View>
          </View>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('标题')}</Text>
            <Text className={styles.infoValue}>{tracker.title}</Text>
          </View>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('平台')}</Text>
            <Text className={styles.infoValue}>{getPlatformName(tracker.platform)}</Text>
          </View>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('链接')}</Text>
            <View className={styles.urlContainer}>
              <Text className={styles.urlText} numberOfLines={2}>
                {tracker.url}
              </Text>
              <Button 
                className={styles.copyBtn}
                size='mini'
                onClick={handleCopyUrl}
              >
                {locale('复制')}
              </Button>
            </View>
          </View>
        </View>

        {/* 追踪设置 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>{locale('追踪设置')}</Text>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('检查频率')}</Text>
            {editMode ? (
              <Picker
                mode='selector'
                range={frequencyOptions.map(option => option.label)}
                value={currentFrequencyIndex}
                onChange={handleFrequencyChange}
              >
                <View className={styles.pickerValue}>
                  {frequencyOptions[currentFrequencyIndex]?.label || locale('选择频率')}
                </View>
              </Picker>
            ) : (
              <Text className={styles.infoValue}>
                {locale('每{frequency}分钟', { frequency: tracker.frequency })}
              </Text>
            )}
          </View>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('消耗金币')}</Text>
            <Text className={styles.infoValue}>
              {locale('{coins}金币', { coins: tracker.coinsCost })}
            </Text>
          </View>
        </View>

        {/* 时间信息 */}
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>{locale('时间信息')}</Text>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('创建时间')}</Text>
            <Text className={styles.infoValue}>{formatTime(tracker.createdAt)}</Text>
          </View>
          
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>{locale('更新时间')}</Text>
            <Text className={styles.infoValue}>{formatTime(tracker.updatedAt)}</Text>
          </View>
          
          {tracker.lastChecked && (
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>{locale('最后检查')}</Text>
              <Text className={styles.infoValue}>{formatTime(tracker.lastChecked)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 操作按钮 */}
      <View className={styles.actions}>
        {editMode ? (
          <Button 
            className={styles.saveBtn}
            type='primary'
            onClick={handleSaveEdit}
            loading={loading}
          >
            {locale('保存修改')}
          </Button>
        ) : (
          <>
            <Button 
              className={`${styles.actionBtn} ${
                tracker.status === 'active' ? styles.stopBtn : styles.startBtn
              }`}
              onClick={handleToggleStatus}
              loading={loading}
            >
              {tracker.status === 'active' ? locale('停止追踪') : locale('启动追踪')}
            </Button>
            
            <Button 
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => setShowDeleteDialog(true)}
            >
              {locale('删除追踪器')}
            </Button>
          </>
        )}
      </View>

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title={locale('确认删除')}
        content={locale('删除后无法恢复，确定要删除这个追踪器吗？')}
        confirmText={locale('删除')}
        cancelText={locale('取消')}
        confirmColor='#ff4757'
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        onClose={() => setShowDeleteDialog(false)}
        loading={loading}
      />
    </View>
  );
};

export default TrackerDetailPage;
