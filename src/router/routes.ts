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
                path: '/message',
                name: 'message',
                component: () => import('../views/message/MessageHome.vue'),
            },
            {
                path: '/chat',
                name: 'chat',
                component: () => import('../views/message/ChatHome.vue'),
            },
            {
                path: '/friend',
                name: 'friend',
                component: () => import('../views/friend/FriendPage.vue'),
            },
            {
                path: '/follow',
                name: 'follow',
                component: () => import('../views/friend/FollowPage.vue'),
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
        path: '/search',
        name: 'PostSearch',
        component: () => import('../views/post/PostSearch.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/searchResult',
        name: 'PostSearchResult',
        component: () => import('../views/post/PostSearchResult.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/myPosts',
        name: 'myPosts',
        component: () => import('../views/post/PostUserHome.vue'),
    },
    {
        path: '/mySetting',
        name: 'mySetting',
        component: () => import('../views/user/UserSetting.vue'),
    },
    {
        path: '/favorites',
        name: 'favorites',
        component: () => import('../views/post/PostCollect.vue'),
    },
    {
        path: '/chat/:id',
        name: 'ChatPage',
        component: () => import('../views/message/ChatPage.vue'),
        props: true,  // 允许组件通过 `props` 方式接收 `id`
    },
    {
        path: '/notifications',
        name: 'notifications',
        component: () => import('../views/message/MessageNotifications.vue'),
    },
    {
        path: '/test',
        name: 'test',
        component: () => import('../views/test.vue'),
    }
]

export default routes;