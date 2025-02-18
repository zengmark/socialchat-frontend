<template>
  <div class="notifications-page">
    <!-- 顶部头部 -->
    <div class="header">
      <span class="back-icon" @click="goBack">←</span>
      <span class="title">通知</span>
    </div>

    <!-- 标签页切换不同通知类型 -->
    <van-tabs v-model:active="activeTab" swipeable>
      <!-- 评论通知 -->
      <van-tab title="评论">
        <div v-for="item in comments" :key="item.id" class="notification-item">
          <div class="notification-icon">💬</div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-body">{{ item.content }}</div>
            <div class="notification-time">{{ item.timestamp }}</div>
          </div>
        </div>
      </van-tab>

      <!-- 点赞通知 -->
      <van-tab title="点赞">
        <div v-for="item in likes" :key="item.id" class="notification-item">
          <div class="notification-icon">👍</div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-body">{{ item.content }}</div>
            <div class="notification-time">{{ item.timestamp }}</div>
          </div>
        </div>
      </van-tab>

      <!-- 收藏通知 -->
      <van-tab title="收藏">
        <div v-for="item in favorites" :key="item.id" class="notification-item">
          <div class="notification-icon">⭐</div>
          <div class="notification-content">
            <div class="notification-title">{{ item.title }}</div>
            <div class="notification-body">{{ item.content }}</div>
            <div class="notification-time">{{ item.timestamp }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Tab, Tabs } from 'vant'

const router = useRouter()
const activeTab = ref(0)

const goBack = () => {
  router.back()
}

// 模拟评论通知数据
const comments = ref([
  {
    id: 1,
    title: '用户A 评论了您的帖子',
    content: '你的帖子很棒！',
    timestamp: '2023-08-01 12:00'
  },
  {
    id: 2,
    title: '用户B 评论了您的帖子',
    content: '期待更多精彩内容！',
    timestamp: '2023-08-02 15:30'
  }
])

// 模拟点赞通知数据
const likes = ref([
  {
    id: 3,
    title: '用户C 点赞了您的帖子',
    content: '👍',
    timestamp: '2023-08-03 10:20'
  },
  {
    id: 4,
    title: '用户D 点赞了您的帖子',
    content: '👍',
    timestamp: '2023-08-04 11:45'
  }
])

// 模拟收藏通知数据
const favorites = ref([
  {
    id: 5,
    title: '用户E 收藏了您的帖子',
    content: '⭐',
    timestamp: '2023-08-05 09:10'
  },
  {
    id: 6,
    title: '用户F 收藏了您的帖子',
    content: '⭐',
    timestamp: '2023-08-06 08:55'
  }
])
</script>

<style scoped>
.notifications-page {
  background-color: #f4f7fc;
  min-height: 100vh;
}

/* 头部样式 */
.header {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

/* 通知项样式 */
.notification-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 16px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f7f7f7;
}

.notification-icon {
  font-size: 24px;
  margin-right: 12px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.notification-body {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}

.notification-time {
  font-size: 12px;
  color: #aaa;
  text-align: right;
}
</style>
