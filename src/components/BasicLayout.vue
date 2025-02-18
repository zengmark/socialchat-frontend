<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar  fixed z-index="100">
      <template #left>
        <!-- 清空左侧内容，使导航项能居中 -->
      </template>
      <template #title>
        <div v-if="isHomePage" class="nav-tabs">
          <span :class="{ active: activeTab === 'follow' }" @click="switchTab('follow')">关注</span>
          <span :class="{ active: activeTab === 'discover' }" @click="switchTab('discover')">发现</span>
          <span :class="{ active: activeTab === 'chat' }" @click="switchTab('chat')">聊天</span>
        </div>
        <div v-else>
          <h3>论坛社交交友平台</h3>
        </div>
      </template>
      <template v-if="isHomePage" #right>
        <van-icon name="search" class="search-icon" @click="goToSearchPage"/>
      </template>
    </van-nav-bar>

    <!-- 动态路由内容 -->
    <div class="layout-content">
      <router-view/>
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar fixed active-color="#07c160" v-model="activeTabBar">
      <van-tabbar-item @click="goTo('')" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item @click="goTo('friend')" icon="friends-o">朋友</van-tabbar-item>
      <van-tabbar-item @click="goTo('postEdit')" icon="plus"/>
      <van-tabbar-item @click="goTo('message')" icon="chat-o" :badge="sseStore.unreadMessagesCount > 0 ? sseStore.unreadMessagesCount : ''">消息</van-tabbar-item>
      <van-tabbar-item @click="goTo('my')" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from "../stores/user.ts";
import { showToast } from 'vant';
import {useSseStore} from "../stores/sse.ts";
import axios from '../api/axios.ts'

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const sseStore = useSseStore();

const activeTab = ref('discover'); // 顶部导航栏选中项

// 根据当前路由 path 自动计算底部导航栏的激活项
const activeTabBar = computed(() => {
  switch (route.path) {
    case '/':
      return 0;
    case '/friend':
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

// 监听 route.path 变化时，更新 activeTabBar 的值
watch(() => route.path, () => {
  // 触发 activeTabBar 的计算，确保底部导航栏更新
}, { immediate: true });

// 判断当前路径是否为首页
const isHomePage = computed(() => route.path === '/');

// 切换顶部导航栏的选项（示例逻辑）
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 底部导航栏跳转
const goTo = async (path) => {
  // 登录校验逻辑
  const isLogin = userStore.isLoggedIn;
  if (!isLogin && (path === 'friend' || path === 'postEdit' || path === 'message')) {
    showToast('请输入正确的URL');
    return;
  }
  // 跳转到对应的路径
  router.push(`/${path}`);
};

// 跳转到搜索页面
const goToSearchPage = () => {
  router.push('/search');
};

const initUnReadMessageCount = async () => {
  const resp = await axios.post('/api/like_collect/message/getUnReadCount');
  const messageCount = resp.data;
  sseStore.initMessageCount(messageCount);
}

onMounted(() => {
  initUnReadMessageCount();
})

/* ========== 新增：SSE 消息通信机制 ========== */
// let eventSource = null;
//
// const initSSE = async () => {
//   console.log('建立SSE连接')
//   // 请根据实际情况修改 URL
//   const userInfo = await userStore.getUserInfo();
//   const isLogin = userStore.isLoggedIn;
//   console.log(isLogin)
//   if (!isLogin) {
//     return;
//   }
//   const userId = userInfo.id;
//   eventSource = new EventSource(`http://192.168.1.2:8100/api/like_collect/sse/stream/${userId}`);
//
//   // 接收消息事件
//   eventSource.onmessage = (event) => {
//     console.log("Received SSE message:", event.data);
//     // 收到新消息时增加未读消息计数
//     unreadMessagesCount.value++;
//   };
//
//   eventSource.onerror = (error) => {
//     console.error("SSE connection error:", error);
//   };
// }
//
// onMounted(() => {
//   initSSE();
// });

// onUnmounted(() => {
//   if (eventSource) {
//     eventSource.close();
//   }
// });
</script>

<style scoped>
/* 顶部导航栏样式 */
.van-nav-bar {
  border-bottom: 1px solid #f0f0f0;
}

/* 居中的导航项容器 */
.nav-tabs {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
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
  margin-top: 50px; /* 顶部导航栏高度 */
  margin-bottom: 50px; /* 底部导航栏高度 */
  padding: 1px;
  overflow-y: auto; /* 可滚动 */
  height: calc(100vh - 100px); /* 可见区域高度，减去顶部和底部导航栏 */
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
