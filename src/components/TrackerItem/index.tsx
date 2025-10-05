import React, { useCallback } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Tracker } from '../../types/api';
import { locale, formatTime } from '../../utils/locale';
import { navigateTo, PAGES } from '../../utils/navigation';
import styles from './index.module.scss';

interface Props {
  tracker: Tracker;
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selected?: boolean;
  selectionMode?: boolean;
  showActions?: boolean;
}

const TrackerItem: React.FC<Props> = ({
  tracker,
  onStart,
  onStop,
  onDelete,
  onSelect,
  selected = false,
  selectionMode = false,
  showActions = true,
}) => {
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

  // 获取状态显示文本和样式
  const getStatusInfo = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return {
          text: locale('追踪中'),
          className: styles.statusActive,
        };
      case 'stopped':
        return {
          text: locale('已停止'),
          className: styles.statusStopped,
        };
      default:
        return {
          text: status,
          className: styles.statusDefault,
        };
    }
  }, []);

  // 处理点击事件
  const handleClick = useCallback(() => {
    if (selectionMode && onSelect) {
      onSelect(tracker.id, !selected);
    } else {
      // 跳转到详情页
      navigateTo(PAGES.TRACKER_DETAIL, { id: tracker.id });
    }
  }, [selectionMode, selected, tracker.id, onSelect]);

  // 处理启动/停止
  const handleToggleStatus = useCallback((e: any) => {
    e.stopPropagation();
    
    if (tracker.status === 'active') {
      onStop?.(tracker.id);
    } else {
      onStart?.(tracker.id);
    }
  }, [tracker.status, tracker.id, onStart, onStop]);

  // 处理删除
  const handleDelete = useCallback((e: any) => {
    e.stopPropagation();
    
    Taro.showModal({
      title: locale('确认删除'),
      content: locale('删除后无法恢复，确定要删除这个追踪器吗？'),
      confirmText: locale('删除'),
      confirmColor: '#ff4757',
      cancelText: locale('取消'),
      success: (res) => {
        if (res.confirm) {
          onDelete?.(tracker.id);
        }
      },
    });
  }, [tracker.id, onDelete]);

  // 处理更多操作
  const handleMore = useCallback((e: any) => {
    e.stopPropagation();
    
    const actions = [
      tracker.status === 'active' ? locale('停止追踪') : locale('启动追踪'),
      locale('查看详情'),
      locale('删除'),
    ];
    
    Taro.showActionSheet({
      itemList: actions,
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            handleToggleStatus(e);
            break;
          case 1:
            navigateTo(PAGES.TRACKER_DETAIL, { id: tracker.id });
            break;
          case 2:
            handleDelete(e);
            break;
        }
      },
    });
  }, [tracker.status, tracker.id, handleToggleStatus, handleDelete]);

  const statusInfo = getStatusInfo(tracker.status);

  return (
    <View 
      className={`${styles.container} ${selected ? styles.selected : ''}`}
      onClick={handleClick}
    >
      {selectionMode && (
        <View className={styles.checkbox}>
          <View className={`${styles.checkboxInner} ${selected ? styles.checked : ''}`}>
            {selected && <View className={styles.checkmark}>✓</View>}
          </View>
        </View>
      )}
      
      <View className={styles.content}>
        <View className={styles.header}>
          <View className={styles.title}>{tracker.title}</View>
          <View className={`${styles.status} ${statusInfo.className}`}>
            {statusInfo.text}
          </View>
        </View>
        
        <View className={styles.meta}>
          <View className={styles.platform}>
            {getPlatformName(tracker.platform)}
          </View>
          <View className={styles.frequency}>
            {locale('每{frequency}分钟检查', { frequency: tracker.frequency })}
          </View>
          <View className={styles.coins}>
            {locale('消耗{coins}金币', { coins: tracker.coinsCost })}
          </View>
        </View>
        
        <View className={styles.time}>
          <Text className={styles.timeLabel}>{locale('创建时间：')}</Text>
          <Text className={styles.timeValue}>{formatTime(tracker.createdAt)}</Text>
          
          {tracker.lastChecked && (
            <>
              <Text className={styles.timeLabel}> • {locale('最后检查：')}</Text>
              <Text className={styles.timeValue}>{formatTime(tracker.lastChecked)}</Text>
            </>
          )}
        </View>
      </View>
      
      {showActions && !selectionMode && (
        <View className={styles.actions}>
          <Button
            className={`${styles.actionBtn} ${
              tracker.status === 'active' ? styles.stopBtn : styles.startBtn
            }`}
            size='mini'
            onClick={handleToggleStatus}
          >
            {tracker.status === 'active' ? locale('停止') : locale('启动')}
          </Button>
          
          <Button
            className={styles.moreBtn}
            size='mini'
            onClick={handleMore}
          >
            {locale('更多')}
          </Button>
        </View>
      )}
    </View>
  );
};

export default TrackerItem;
