import { createApp } from 'vue'
import Sticky from '../src/index'
import Basic from './Basic.vue'

const app = createApp(Basic)
app.use(Sticky)
app.mount('#app')
