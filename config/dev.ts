import type { UserConfigExport } from "@tarojs/cli"
import path from 'path'

export default {
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '../src')
      }
    }
  },
  mini: {},
  h5: {}
} satisfies UserConfigExport<'vite'>
