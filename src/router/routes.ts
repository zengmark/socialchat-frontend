const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/post/PostHome.vue'),
    },
    {
        path: '/post/:id',
        name: 'PostDetail',
        component: () => import('../views/post/PostDetail.vue'),
        props: true, // 允许通过路由参数传递帖子 ID
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/user/UserLogin.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/user/UserRegister.vue')
    },
]

export default routes;