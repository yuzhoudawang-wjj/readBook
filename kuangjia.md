# 追影小程序整体框架（伪代码）

> 说明：以下为 **Taro + React18 + TypeScript** 技术栈的目录与文件示例，仅含类型与函数签名，便于后续使用 cc 模型快速生成真实代码实现。

---

## 1. 目录结构

```text
src/
├─app.tsx            # 入口文件
├─app.config.ts      # 小程序路由配置
├─types/             # 全局类型声明
│  └─api.d.ts
├─utils/             # 工具函数
│  ├─request.ts
│  ├─locale.ts
│  └─navigation.ts
├─stores/            # Zustand 全局状态
│  ├─trackerStore.ts
│  └─userStore.ts
├─services/          # 后端接口调用
│  ├─trackerService.ts
│  └─userService.ts
├─hooks/             # 自定义 Hooks
│  └─useTracker.ts
├─components/        # 通用组件
│  ├─TrackInput/
│  │  ├─index.tsx
│  │  └─index.module.scss
│  ├─TrackerItem/
│  │  ├─index.tsx
│  │  └─index.module.scss
│  └─ConfirmDialog/
│     ├─index.tsx
│     └─index.module.scss
└─pages/             # 页面级组件
   ├─home/
   │  ├─index.tsx
   │  └─index.module.scss
   ├─tracker-list/
   │  ├─index.tsx
   │  └─index.module.scss
   └─tracker-detail/
      ├─index.tsx
      └─index.module.scss
```

---

## 2. 关键文件伪代码

### 2.1 app.tsx

```tsx
import { FC } from 'react'
import { Provider } from 'react-redux' // 若使用 Zustand 可忽略
import { locale } from '@/utils/locale'

const App: FC = () => {
  // TODO: 全局异常捕获、主题 Provider 等
  return <>{/* 入口渲染，由路由控制页面 */}</>
}
export default App
```

### 2.2 app.config.ts

```ts
export default defineAppConfig({
  pages: ['pages/home/index'],
  subPackages: [
    {
      root: 'pages',
      pages: ['tracker-list/index', 'tracker-detail/index']
    }
  ],
  window: {
    navigationBarTitleText: '追影'
  }
})
```

### 2.3 utils/request.ts

```ts
export const request = <T>(opts: Taro.request.Option): Promise<T> => {
  // TODO: 注入 token，统一错误处理
  return Taro.request<T>(opts).then((res) => res.data)
}
```

### 2.4 utils/locale.ts

```ts
export const locale = (text: string): string => text
```

### 2.5 stores/trackerStore.ts

```ts
import create from 'zustand'

interface TrackerState {
  list: Tracker[]
  actions: {
    add: (t: Tracker) => void
    remove: (id: string) => void
  }
}
export const useTrackerStore = create<TrackerState>()((set) => ({
  list: [],
  actions: {
    add: (t) => set((s) => ({ list: [...s.list, t] })),
    remove: (id) => set((s) => ({ list: s.list.filter((i) => i.id !== id) }))
  }
}))
```

### 2.6 hooks/useTracker.ts

```ts
import { useEffect } from 'react'
import { useTrackerStore } from '@/stores/trackerStore'

export const useTracker = () => {
  const { list, actions } = useTrackerStore()
  useEffect(() => {
    // TODO: 同步云端数据
  }, [])
  return { list, ...actions }
}
```

### 2.7 services/trackerService.ts

```ts
import { request } from '@/utils/request'

export const getTrackerList = () => request<Tracker[]>({ url: '/tracker/list' })
export const createTracker = (payload: any) =>
  request({ url: '/tracker', method: 'POST', data: payload })
```

### 2.8 components/TrackInput/index.tsx

```tsx
import { FC } from 'react'
import { locale } from '@/utils/locale'

interface Props {
  onSubmit: (link: string) => void
}
export const TrackInput: FC<Props> = ({ onSubmit }) => {
  // TODO: 输入框状态管理
  return <View>{/* 输入框 & 按钮 */}</View>
}
```

> 其余组件、页面文件以类似结构占位，后续可根据业务需求补充细节。

---

## 3. 下一步建议

1. 根据 `readme.md` 功能需求，为每个页面补充组件拆分与路由跳转逻辑。
2. 使用 `vitest --ui` 持续编写单元测试，确保核心逻辑可靠。
3. 逐步替换 `// TODO` 占位为真实实现，同时遵循 `rules.md` 中编码规范。

---

> 若需增加或调整文件，请告诉我，我将继续完善。
