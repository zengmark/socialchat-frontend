import {createRouter, createWebHistory} from "vue-router";
import routes from "./routes.ts";
// import {setLoading} from "../common/loading.ts";

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    // setLoading(true); // 开启加载状态
    next();
})

router.afterEach((to, from, next) => {
    // setLoading(false);
})

export default router;