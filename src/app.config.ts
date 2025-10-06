export default defineAppConfig({
  pages: ['pages/home/index', 'pages/tracker-list/index', 'pages/tracker-detail/index'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '追影',
    navigationBarTextStyle: 'black'
  }
  // permission 和 requiredPrivateInfos 在新版本中已不需要
  // 如需要特殊权限，请在使用时动态申请
})
