import {createApp} from 'vue'
// import './style.css'
import 'vant/lib/index.css'
import App from './App.vue'
import {Toast} from "vant";
import router from "./router/router.ts";
// import 'animate.css';

const app = createApp(App)

app.use(Toast)
app.use(router)
app.mount('#app')
