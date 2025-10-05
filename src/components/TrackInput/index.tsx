import React, { useState, useCallback } from 'react';
import { View, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { locale } from '../../utils/locale';
import styles from './index.module.scss';

interface Props {
  onSubmit: (url: string) => void;
  loading?: boolean;
  placeholder?: string;
}

const TrackInput: React.FC<Props> = ({ 
  onSubmit, 
  loading = false, 
  placeholder = locale('请输入微博或小红书分享链接') 
}) => {
  const [url, setUrl] = useState('');
  const [focused, setFocused] = useState(false);

  // 处理输入变化
  const handleInput = useCallback((e: any) => {
    setUrl(e.detail.value);
  }, []);

  // 处理焦点
  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setFocused(false);
  }, []);

  // 处理提交
  const handleSubmit = useCallback(() => {
    const trimmedUrl = url.trim();
    
    if (!trimmedUrl) {
      Taro.showToast({
        title: locale('请输入链接'),
        icon: 'none',
      });
      return;
    }

    // 简单的URL格式验证
    if (!trimmedUrl.startsWith('http')) {
      Taro.showToast({
        title: locale('请输入有效的链接'),
        icon: 'none',
      });
      return;
    }

    onSubmit(trimmedUrl);
  }, [url, onSubmit]);

  // 粘贴剪贴板内容
  const handlePaste = useCallback(async () => {
    try {
      const clipboardData = await Taro.getClipboardData();
      const clipboardText = clipboardData.data;
      
      if (clipboardText && clipboardText.startsWith('http')) {
        setUrl(clipboardText);
        Taro.showToast({
          title: locale('已粘贴链接'),
          icon: 'success',
        });
      } else {
        Taro.showToast({
          title: locale('剪贴板中没有有效链接'),
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('Paste error:', error);
      Taro.showToast({
        title: locale('粘贴失败'),
        icon: 'none',
      });
    }
  }, []);

  // 清空输入
  const handleClear = useCallback(() => {
    setUrl('');
  }, []);

  return (
    <View className={styles.container}>
      <View className={`${styles.inputWrapper} ${focused ? styles.focused : ''}`}>
        <Input
          className={styles.input}
          value={url}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
          onInput={handleInput}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={loading}
        />
        
        {url && (
          <View className={styles.clearBtn} onClick={handleClear}>
            <View className={styles.clearIcon}>×</View>
          </View>
        )}
      </View>
      
      <View className={styles.actions}>
        <Button 
          className={styles.pasteBtn}
          size='mini'
          onClick={handlePaste}
          disabled={loading}
        >
          {locale('粘贴')}
        </Button>
        
        <Button
          className={styles.submitBtn}
          type='primary'
          onClick={handleSubmit}
          loading={loading}
          disabled={!url.trim() || loading}
        >
          {loading ? locale('解析中...') : locale('开始追影')}
        </Button>
      </View>
      
      <View className={styles.tips}>
        <View className={styles.tipItem}>
          • {locale('支持微博和小红书分享链接')}
        </View>
        <View className={styles.tipItem}>
          • {locale('每次追踪需要消耗10金币')}
        </View>
        <View className={styles.tipItem}>
          • {locale('可通过观看广告获得金币')}
        </View>
      </View>
    </View>
  );
};

export default TrackInput;
