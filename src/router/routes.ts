const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../views/UserLogin.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('../views/UserRegister.vue')
    }
]

export default routes;