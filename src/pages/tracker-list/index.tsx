import React, { useState, useCallback, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useTracker } from '../../hooks/useTracker'
import { useUser } from '../../hooks/useUser'
import TrackerItem from '../../components/TrackerItem'
import ConfirmDialog from '../../components/ConfirmDialog'
import { locale } from '../../utils/locale'
import { navigateBack, navigateTo, PAGES } from '../../utils/navigation'
import styles from './index.module.scss'

const TrackerListPage: React.FC = () => {
  const {
    list,
    loading,
    stats,
    startTracking,
    stopTracking,
    removeTracker,
    batchStart,
    batchStop,
    batchRemove,
    loadTrackers
  } = useTracker()

  const { userInfo } = useUser()

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [batchAction, setBatchAction] = useState<'start' | 'stop' | 'delete'>('start')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'stopped'>('all')

  // 过滤后的列表
  const filteredList = useMemo(() => {
    if (filterStatus === 'all') return list
    return list.filter((tracker) => tracker.status === filterStatus)
  }, [list, filterStatus])

  // 处理下拉刷新
  const handleRefresh = useCallback(async () => {
    try {
      await loadTrackers()
      Taro.showToast({
        title: locale('刷新成功'),
        icon: 'success'
      })
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [loadTrackers])

  // 处理选择模式切换
  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode(!selectionMode)
    setSelectedIds([])
  }, [selectionMode])

  // 处理单项选择
  const handleSelect = useCallback((id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id])
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id))
    }
  }, [])

  // 处理全选
  const handleSelectAll = useCallback(() => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredList.map((tracker) => tracker.id))
    }
  }, [selectedIds.length, filteredList])

  // 处理批量操作
  const handleBatchAction = useCallback(
    (action: 'start' | 'stop' | 'delete') => {
      if (selectedIds.length === 0) {
        Taro.showToast({
          title: locale('请先选择要操作的项目'),
          icon: 'none'
        })
        return
      }

      setBatchAction(action)
      setShowBatchDialog(true)
    },
    [selectedIds.length]
  )

  // 确认批量操作
  const handleConfirmBatchAction = useCallback(async () => {
    try {
      switch (batchAction) {
        case 'start':
          await batchStart(selectedIds)
          break
        case 'stop':
          await batchStop(selectedIds)
          break
        case 'delete':
          await batchRemove(selectedIds)
          break
      }

      setSelectedIds([])
      setSelectionMode(false)
      setShowBatchDialog(false)
    } catch (error) {
      // 错误已在hook中处理
    }
  }, [batchAction, selectedIds, batchStart, batchStop, batchRemove])

  // 获取批量操作文本
  const getBatchActionText = useCallback(() => {
    switch (batchAction) {
      case 'start':
        return locale('批量启动')
      case 'stop':
        return locale('批量停止')
      case 'delete':
        return locale('批量删除')
      default:
        return locale('批量操作')
    }
  }, [batchAction])

  // 获取批量操作确认内容
  const getBatchActionContent = useCallback(() => {
    const count = selectedIds.length
    switch (batchAction) {
      case 'start':
        return locale('确定要启动选中的{count}个追踪器吗？', { count })
      case 'stop':
        return locale('确定要停止选中的{count}个追踪器吗？', { count })
      case 'delete':
        return locale('确定要删除选中的{count}个追踪器吗？删除后无法恢复。', { count })
      default:
        return ''
    }
  }, [batchAction, selectedIds.length])

  return (
    <View className={styles.container}>
      {/* 头部 */}
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Button className={styles.backBtn} size='mini' onClick={navigateBack}>
            ← {locale('返回')}
          </Button>

          <Text className={styles.title}>{locale('我的追踪')}</Text>

          <Button className={styles.modeBtn} size='mini' onClick={handleToggleSelectionMode}>
            {selectionMode ? locale('取消') : locale('管理')}
          </Button>
        </View>

        {/* 统计信息 */}
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>{locale('总数')}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.active}</Text>
            <Text className={styles.statLabel}>{locale('追踪中')}</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.stopped}</Text>
            <Text className={styles.statLabel}>{locale('已停止')}</Text>
          </View>

          {userInfo && (
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{userInfo.coins}</Text>
              <Text className={styles.statLabel}>{locale('金币')}</Text>
            </View>
          )}
        </View>

        {/* 筛选器 */}
        <View className={styles.filters}>
          <Button
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.active : ''}`}
            size='mini'
            onClick={() => setFilterStatus('all')}
          >
            {locale('全部')}
          </Button>
          <Button
            className={`${styles.filterBtn} ${filterStatus === 'active' ? styles.active : ''}`}
            size='mini'
            onClick={() => setFilterStatus('active')}
          >
            {locale('追踪中')}
          </Button>
          <Button
            className={`${styles.filterBtn} ${filterStatus === 'stopped' ? styles.active : ''}`}
            size='mini'
            onClick={() => setFilterStatus('stopped')}
          >
            {locale('已停止')}
          </Button>
        </View>
      </View>

      {/* 列表内容 */}
      <ScrollView
        className={styles.content}
        scrollY
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        {filteredList.length === 0 ? (
          <View className={styles.empty}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>
              {filterStatus === 'all'
                ? locale('暂无追踪器，去首页创建一个吧')
                : locale('暂无{status}的追踪器', {
                    status: filterStatus === 'active' ? locale('追踪中') : locale('已停止')
                  })}
            </Text>
            {filterStatus === 'all' && (
              <Button
                className={styles.emptyBtn}
                type='primary'
                onClick={() => navigateTo(PAGES.HOME)}
              >
                {locale('去创建')}
              </Button>
            )}
          </View>
        ) : (
          <View className={styles.list}>
            {filteredList.map((tracker) => (
              <TrackerItem
                key={tracker.id}
                tracker={tracker}
                onStart={startTracking}
                onStop={stopTracking}
                onDelete={removeTracker}
                onSelect={handleSelect}
                selected={selectedIds.includes(tracker.id)}
                selectionMode={selectionMode}
                showActions={!selectionMode}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 批量操作栏 */}
      {selectionMode && (
        <View className={styles.batchBar}>
          <View className={styles.batchInfo}>
            <Button className={styles.selectAllBtn} size='mini' onClick={handleSelectAll}>
              {selectedIds.length === filteredList.length ? locale('取消全选') : locale('全选')}
            </Button>
            <Text className={styles.selectedCount}>
              {locale('已选择{count}项', { count: selectedIds.length })}
            </Text>
          </View>

          <View className={styles.batchActions}>
            <Button
              className={styles.batchBtn}
              size='mini'
              onClick={() => handleBatchAction('start')}
              disabled={selectedIds.length === 0}
            >
              {locale('启动')}
            </Button>
            <Button
              className={styles.batchBtn}
              size='mini'
              onClick={() => handleBatchAction('stop')}
              disabled={selectedIds.length === 0}
            >
              {locale('停止')}
            </Button>
            <Button
              className={`${styles.batchBtn} ${styles.deleteBtn}`}
              size='mini'
              onClick={() => handleBatchAction('delete')}
              disabled={selectedIds.length === 0}
            >
              {locale('删除')}
            </Button>
          </View>
        </View>
      )}

      {/* 批量操作确认弹窗 */}
      <ConfirmDialog
        visible={showBatchDialog}
        title={getBatchActionText()}
        content={getBatchActionContent()}
        confirmText={locale('确定')}
        cancelText={locale('取消')}
        confirmColor={batchAction === 'delete' ? '#ff4757' : '#007aff'}
        onConfirm={handleConfirmBatchAction}
        onCancel={() => setShowBatchDialog(false)}
        onClose={() => setShowBatchDialog(false)}
      />
    </View>
  )
}

export default TrackerListPage
