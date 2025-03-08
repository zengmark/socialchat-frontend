const routes = [
    // 带布局的页面（统一布局）
    {
        path: '/',
        component: () => import('../components/BasicLayout.vue'), // 统一布局组件
        children: [
            {
                path: '', // 默认子路由
                name: 'PostHome',
                component: () => import('../views/post/PostHome.vue'),
            },
            {
                path: '/my',
                name: 'My',
                component: () => import('../views/user/UserMy.vue')
            },
            {
                path: '/message',  // 动态路由，匹配帖子 ID
                name: 'message',
                component: () => import('../views/message/MessageHome.vue'),
            },
            {
                path: '/chat',  // 动态路由，匹配帖子 ID
                name: 'chat',
                component: () => import('../views/message/ChatHome.vue'),
            },
        ],
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
    {
        path: '/postEdit', // 默认子路由
        name: 'PostEdit',
        component: () => import('../views/post/PostEdit.vue'),
    },
    {
        path: '/post/:id',  // 动态路由，匹配帖子 ID
        name: 'PostDetail',
        component: () => import('../views/post/PostDetail.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/search',  // 动态路由，匹配帖子 ID
        name: 'PostSearch',
        component: () => import('../views/post/PostSearch.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/searchResult',  // 动态路由，匹配帖子 ID
        name: 'PostSearchResult',
        component: () => import('../views/post/PostSearchResult.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/myPosts',  // 动态路由，匹配帖子 ID
        name: 'myPosts',
        component: () => import('../views/post/PostUserHome.vue'),
    },
    {
        path: '/mySetting',  // 动态路由，匹配帖子 ID
        name: 'mySetting',
        component: () => import('../views/user/UserSetting.vue'),
    },
    {
        path: '/chat/:id',  // 动态路由，匹配帖子 ID
        name: 'ChatPage',
        component: () => import('../views/message/ChatPage.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/notifications',  // 动态路由，匹配帖子 ID
        name: 'notifications',
        component: () => import('../views/message/MessageNotifications.vue'),
    },
    {
        path: '/test',  // 动态路由，匹配帖子 ID
        name: 'test',
        component: () => import('../views/test.vue'),
    },

]

export default routes;