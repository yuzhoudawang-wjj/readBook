import React from 'react'
import { useLaunch } from '@tarojs/taro'
import { TrackerProvider } from './contexts/TrackerContext'
import { UserProvider } from './contexts/UserContext'
import './app.less'

const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  useLaunch(() => {
    console.log('App launched.')
  })

  // children 是将要会渲染的页面
  return (
    <UserProvider>
      <TrackerProvider>{children}</TrackerProvider>
    </UserProvider>
  )
}

export default App
