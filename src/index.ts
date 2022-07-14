import { App } from 'vue'
import Sticky from './sticky'

const install = (app: App) => {
  app.directive('Sticky', Sticky)
}

/* @ts-ignore */
Sticky.install = install

export default {
   install: (app: App) => {
      app.directive('Sticky', Sticky)
   }
}
