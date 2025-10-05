import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import { locale } from '../../utils/locale';
import styles from './index.module.scss';

interface Props {
  visible: boolean;
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  loading?: boolean;
  showCancel?: boolean;
}

const ConfirmDialog: React.FC<Props> = ({
  visible,
  title = locale('提示'),
  content = '',
  confirmText = locale('确定'),
  cancelText = locale('取消'),
  confirmColor = '#007aff',
  onConfirm,
  onCancel,
  onClose,
  loading = false,
  showCancel = true,
}) => {
  if (!visible) return null;

  const handleMaskClick = () => {
    if (!loading) {
      onClose?.();
    }
  };

  const handleDialogClick = (e: any) => {
    e.stopPropagation();
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm?.();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onCancel?.();
      onClose?.();
    }
  };

  return (
    <View className={styles.mask} onClick={handleMaskClick}>
      <View className={styles.dialog} onClick={handleDialogClick}>
        {title && (
          <View className={styles.header}>
            <Text className={styles.title}>{title}</Text>
          </View>
        )}
        
        {content && (
          <View className={styles.content}>
            <Text className={styles.contentText}>{content}</Text>
          </View>
        )}
        
        <View className={styles.footer}>
          {showCancel && (
            <Button
              className={styles.cancelBtn}
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
          )}
          
          <Button
            className={styles.confirmBtn}
            style={{ color: confirmColor }}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmText}
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ConfirmDialog;
