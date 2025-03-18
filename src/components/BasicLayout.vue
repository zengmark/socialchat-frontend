<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed z-index="100">
      <template #left>
        <!-- 清空左侧内容，使导航项能居中 -->
      </template>
      <template #title>
        <div v-if="isHomePage" class="nav-tabs">
          <span :class="{ active: activeTab === 'friend' }" @click="activeTab = 'friend'">朋友</span>
          <span :class="{ active: activeTab === 'discover' }" @click="activeTab = 'discover'">发现</span>
          <span :class="{ active: activeTab === 'chat' }" @click="activeTab = 'chat'">聊天</span>
        </div>
        <div v-else>
          <h3>论坛社交交友平台</h3>
        </div>
      </template>
      <template v-if="isHomePage" #right>
        <van-icon name="search" class="search-icon" @click="goToSearchPage" />
      </template>
    </van-nav-bar>

    <!-- 动态路由内容 -->
    <div class="layout-content">
      <router-view />
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar fixed active-color="#07c160" v-model="activeTabBar">
      <van-tabbar-item @click="goTo('')" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item @click="goTo('follow')" icon="friends-o">关注</van-tabbar-item>
      <van-tabbar-item @click="goTo('postEdit')" icon="plus" />
      <van-tabbar-item @click="goTo('message')" icon="chat-o" :badge="sseStore.unreadMessagesCount > 0 ? sseStore.unreadMessagesCount : ''">消息</van-tabbar-item>
      <van-tabbar-item @click="goTo('my')" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from "../stores/user.ts";
import { showToast } from 'vant';
import { useSseStore } from "../stores/sse.ts";
import axios from '../api/axios.ts';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const sseStore = useSseStore();

// 定义路由与tab之间的映射关系
const routeToTab = {
  '/': 'discover',
  '/chat': 'chat',
  '/friend': 'friend'
};
const tabToRoute = {
  'discover': '/',
  'chat': '/chat',
  'friend': '/friend'
};

// 双向 computed，根据路由自动决定激活项
const activeTab = computed({
  get() {
    // 默认地址为 '/' 则返回 'discover'
    return routeToTab[route.path] || 'discover';
  },
  set(val) {
    router.push(tabToRoute[val] || '/');
  }
});

// 根据当前路由 path 自动计算底部导航栏的激活项
const activeTabBar = computed(() => {
  switch (route.path) {
    case '/':
      return 0;
    case '/follow':
      return 1;
    case '/postEdit':
      return 2;
    case '/message':
      return 3;
    case '/my':
      return 4;
    default:
      return 0;
  }
});

// 判断当前路径是否为首页
const isHomePage = computed(() => (route.path === '/' || route.path === '/chat' || route.path === '/friend'));

// 底部导航栏跳转逻辑
const goTo = async (path) => {
  const isLogin = userStore.isLoggedIn;
  if (!isLogin && (path === 'follow' || path === 'postEdit' || path === 'message')) {
    showToast('请输入正确的URL');
    return;
  }
  router.push(`/${path}`);
};

// 搜索页面跳转
const goToSearchPage = () => {
  router.push('/search');
};

const initUnReadMessageCount = async () => {
  const resp = await axios.post('/api/like_collect/message/getUnReadCount');
  const messageCount = resp.data;
  sseStore.initMessageCount(messageCount);
};

onMounted(() => {
  initUnReadMessageCount();
});
</script>

<style scoped>
/* 顶部导航栏样式 */
.van-nav-bar {
  border-bottom: 1px solid #f0f0f0;
}

/* 居中的导航项容器 */
.nav-tabs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

/* 导航项样式 */
.nav-tabs span {
  font-size: 16px;
  color: #666;
  cursor: pointer;
}

.nav-tabs .active {
  color: #07c160;
  font-weight: bold;
}

/* 搜索按钮样式 */
.search-icon {
  font-size: 20px;
  color: #666;
}

/* 路由内容区域 */
.layout-content {
  margin-top: 50px;
  margin-bottom: 50px;
  padding: 1px;
  overflow-y: auto;
  height: calc(100vh - 100px);
}

/* 底部导航栏 */
.van-tabbar-item {
  font-size: 14px;
}

/* 发帖、消息、我的菜单 */
.van-action-sheet-item {
  text-align: center;
  font-size: 16px;
}
</style>
