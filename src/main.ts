import {createApp} from 'vue'
// import './style.css'
import 'vant/lib/index.css'
import App from './App.vue'
import {Toast} from "vant";

const app = createApp(App)

app.use(Toast)
app.mount('#app')
