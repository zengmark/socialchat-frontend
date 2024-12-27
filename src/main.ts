import {createApp} from 'vue'
// import './style.css'
import 'vant/lib/index.css'
import App from './App.vue'
import {Toast} from "vant";
import router from "./router/router.ts";
import {createPinia} from "pinia";
// import 'animate.css';

const app = createApp(App)
const pinia = createPinia()

app.use(Toast)
app.use(router)
app.use(pinia)
app.mount('#app')
