<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <van-nav-bar fixed z-index="100">
      <template #left>
        <!-- 清空左侧内容，使导航项能居中 -->
      </template>
      <template #title>
        <div class="nav-tabs">
          <span :class="{ active: activeTab === 'follow' }" @click="switchTab('follow')">关注</span>
          <span :class="{ active: activeTab === 'discover' }" @click="switchTab('discover')">发现</span>
          <span :class="{ active: activeTab === 'chat' }" @click="switchTab('chat')">聊天</span>
        </div>
      </template>
      <template #right>
        <van-icon name="search" class="search-icon" @click="goToSearchPage"/>
      </template>
    </van-nav-bar>

    <!-- 动态路由内容 -->
    <div class="layout-content">
      <router-view/>
    </div>

    <!-- 底部导航栏 -->
    <van-tabbar fixed active-color="#07c160" :active="activeTabBar">
      <van-tabbar-item @click="goTo('')" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item @click="goTo('friend')" icon="friends-o">朋友</van-tabbar-item>
      <van-tabbar-item @click="goTo('postEdit')" icon="plus"/>
      <van-tabbar-item @click="goTo('message')" icon="chat-o" badge="99+">消息</van-tabbar-item>
      <van-tabbar-item @click="goTo('my')" icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {useUserStore} from "../stores/user.ts";

const router = useRouter();
const activeTab = ref('discover'); // 顶部导航栏选中项
const activeTabBar = ref(0); // 底部导航栏选中项

const userStore = useUserStore();

// 切换顶部导航栏的选项
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 底部导航栏的跳转
const goTo = async (path) => {
  const activeTarBarTmp = activeTabBar.value;
  console.log(activeTarBarTmp)
  console.log(path);
  const isLogin = userStore.isLoggedIn;
  console.log(isLogin)
  if (!isLogin && (path === 'friend' || path === 'postEdit' || path === 'message')) {
    console.log('进来')
    activeTabBar.value = activeTarBarTmp;
    showToast('输入url有问题');
    return;
  }
  console.log('跳转');
  router.push(`/${path}`);
};

// 跳转到搜索页面
const goToSearchPage = () => {
  router.push('/search'); // 跳转到搜索页面
};
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