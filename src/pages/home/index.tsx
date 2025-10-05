import React, { useState, useCallback } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTracker } from '../../hooks/useTracker';
import { useUser } from '../../hooks/useUser';
import TrackInput from '../../components/TrackInput';
import ConfirmDialog from '../../components/ConfirmDialog';
import { locale } from '../../utils/locale';
import { navigateTo, PAGES } from '../../utils/navigation';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const { addTracker, parseUrl, loading: trackerLoading } = useTracker();
  const { userInfo, isLoggedIn, loginUser, watchAd, stats } = useUser();
  
  const [showIntroDialog, setShowIntroDialog] = useState(false);
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showCoinsDialog, setShowCoinsDialog] = useState(false);

  // 处理链接提交
  const handleSubmit = useCallback(async (url: string) => {
    try {
      // 检查登录状态
      if (!isLoggedIn) {
        await loginUser();
      }

      // 检查金币余额
      if (!stats?.coins || stats.coins < 10) {
        setShowCoinsDialog(true);
        return;
      }

      // 解析链接
      const parseResult = await parseUrl(url);
      
      if (!parseResult.valid) {
        Taro.showToast({
          title: locale('链接格式不正确'),
          icon: 'none',
        });
        return;
      }

      // 创建追踪器
      await addTracker({
        url,
        frequency: 30, // 默认30分钟检查一次
      });

      Taro.showToast({
        title: locale('追踪器创建成功'),
        icon: 'success',
      });

      // 跳转到追踪列表页
      setTimeout(() => {
        navigateTo(PAGES.TRACKER_LIST);
      }, 1500);

    } catch (error: any) {
      console.error('Submit error:', error);
      Taro.showToast({
        title: error.message || locale('操作失败'),
        icon: 'none',
      });
    }
  }, [isLoggedIn, loginUser, stats, parseUrl, addTracker]);

  // 显示功能介绍
  const handleShowIntro = useCallback(() => {
    setShowIntroDialog(true);
  }, []);

  // 显示订阅消息
  const handleShowSubscribe = useCallback(() => {
    setShowSubscribeDialog(true);
  }, []);

  // 观看广告获得金币
  const handleWatchAd = useCallback(async () => {
    try {
      await watchAd();
      setShowCoinsDialog(false);
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [watchAd]);

  // 跳转到追踪列表
  const handleGoToList = useCallback(() => {
    navigateTo(PAGES.TRACKER_LIST);
  }, []);

  return (
    <View className={styles.container}>
      {/* 头部区域 */}
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <View className={styles.logo}>
            <Text className={styles.logoIcon}>🎯</Text>
            <Text className={styles.logoText}>{locale('追影')}</Text>
          </View>
          
          {isLoggedIn && userInfo && (
            <View className={styles.userInfo}>
              <View className={styles.coins}>
                <Text className={styles.coinsIcon}>💰</Text>
                <Text className={styles.coinsText}>{userInfo.coins}</Text>
              </View>
              
              <View className={styles.stats}>
                <Text className={styles.statsText}>
                  {locale('追踪中: {count}', { count: stats?.active || 0 })}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 主要内容区域 */}
      <View className={styles.main}>
        {/* 输入区域 */}
        <TrackInput 
          onSubmit={handleSubmit}
          loading={trackerLoading}
        />

        {/* 功能入口 */}
        <View className={styles.features}>
          <Button 
            className={styles.featureBtn}
            onClick={handleShowIntro}
          >
            <View className={styles.featureBtnContent}>
              <Text className={styles.featureBtnIcon}>📖</Text>
              <Text className={styles.featureBtnText}>{locale('功能介绍')}</Text>
            </View>
          </Button>

          <Button 
            className={styles.featureBtn}
            onClick={handleShowSubscribe}
          >
            <View className={styles.featureBtnContent}>
              <Text className={styles.featureBtnIcon}>🔔</Text>
              <Text className={styles.featureBtnText}>{locale('订阅消息')}</Text>
            </View>
          </Button>

          {isLoggedIn && (
            <Button 
              className={styles.featureBtn}
              onClick={handleGoToList}
            >
              <View className={styles.featureBtnContent}>
                <Text className={styles.featureBtnIcon}>📋</Text>
                <Text className={styles.featureBtnText}>{locale('我的追踪')}</Text>
              </View>
            </Button>
          )}
        </View>

        {/* 底部说明 */}
        <View className={styles.footer}>
          <Text className={styles.footerText}>
            {locale('追影小程序帮助您追踪微博和小红书内容更新')}
          </Text>
          <Text className={styles.footerSubText}>
            {locale('及时获取您关注内容的最新动态')}
          </Text>
        </View>
      </View>

      {/* 功能介绍弹窗 */}
      <ConfirmDialog
        visible={showIntroDialog}
        title={locale('功能介绍')}
        content={locale('追影小程序可以帮助您追踪微博和小红书的内容更新。只需输入分享链接，即可开始追踪。当内容有更新时，会及时通知您。每次追踪需要消耗10金币，您可以通过观看广告获得金币。')}
        confirmText={locale('我知道了')}
        showCancel={false}
        onConfirm={() => setShowIntroDialog(false)}
        onClose={() => setShowIntroDialog(false)}
      />

      {/* 订阅消息弹窗 */}
      <ConfirmDialog
        visible={showSubscribeDialog}
        title={locale('订阅消息提醒')}
        content={locale('开启订阅消息后，当您追踪的内容有更新时，我们会及时通知您。请点击确定开启订阅。')}
        confirmText={locale('开启订阅')}
        cancelText={locale('暂不开启')}
        onConfirm={() => {
          // TODO: 实现订阅逻辑
          setShowSubscribeDialog(false);
          Taro.showToast({
            title: locale('订阅设置成功'),
            icon: 'success',
          });
        }}
        onCancel={() => setShowSubscribeDialog(false)}
        onClose={() => setShowSubscribeDialog(false)}
      />

      {/* 金币不足弹窗 */}
      <ConfirmDialog
        visible={showCoinsDialog}
        title={locale('金币不足')}
        content={locale('创建追踪器需要10金币，您当前金币不足。可以通过观看广告获得金币。')}
        confirmText={locale('观看广告')}
        cancelText={locale('取消')}
        onConfirm={handleWatchAd}
        onCancel={() => setShowCoinsDialog(false)}
        onClose={() => setShowCoinsDialog(false)}
      />
    </View>
  );
};

export default HomePage;
