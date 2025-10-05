import React from 'react';
import { useLaunch } from '@tarojs/taro';
import './app.less';

const App: React.FC<React.PropsWithChildren> = ({ children }) => {
  useLaunch(() => {
    console.log('App launched.');
  });

  // children 是将要会渲染的页面
  return children;
};

export default App;
