import type { App, Plugin } from 'vue'
import Sticky from './sticky'

export const StickyPlugin: Plugin = {
   install(app: App) {
      app.directive('Sticky', Sticky)
   }
}

export default StickyPlugin