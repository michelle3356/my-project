import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import 'vant/lib/index.css'
import './style.css'

import { Button, Dialog, Toast, Pagination, Icon, Popup, Tabs, Tab, ImagePreview } from 'vant'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(Button)
app.use(Dialog)
app.use(Popup)
app.use(Toast)
app.use(Tabs)
app.use(Tab)
app.use(ImagePreview)
app.use(Pagination)
app.use(Icon)

app.mount('#app')