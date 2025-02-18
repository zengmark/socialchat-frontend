<template>
  <div class="messages-page">
    <!-- 美化后的通知入口 -->
    <div class="notification-entry" @click="goToNotificationsPage">
      <div class="entry-content">
        <div class="entry-icon">
          <!-- 使用emoji或自定义图标 -->
          <span>🔔</span>
        </div>
        <div class="entry-text">
          <span class="entry-title">查看评论、点赞、收藏消息</span>
          <p class="entry-subtitle">查看所有与您相关的互动通知</p>
        </div>
        <div class="entry-arrow">
          <span>→</span>
        </div>
      </div>
    </div>

    <!-- 聊天记录 -->
    <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多消息了"
        @load="onLoadChats"
    >
      <div
          v-for="chat in chats"
          :key="chat.id"
          class="chat-item"
          @click="goToChatPage(chat.id)"
      >
        <div class="chat-info">
          <div class="avatar"></div>
          <div class="chat-main">
            <p class="nickname">{{ chat.nickname }}</p>
            <p class="last-message">{{ chat.lastMessage }}</p>
          </div>
        </div>
        <div class="timestamp">{{ chat.timestamp }}</div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 点击通知入口后跳转到专门的通知页面
const goToNotificationsPage = () => {
  router.push('/notifications')
}

// 聊天记录数据
const chats = ref([
  { id: 1, nickname: '用户A', lastMessage: '你好啊', timestamp: '2023-08-01' },
  { id: 2, nickname: '用户B', lastMessage: '还好吗?', timestamp: '2023-08-02' },
  { id: 3, nickname: '用户C', lastMessage: '今天挺好的', timestamp: '2023-08-03' }
])

const loading = ref(false)
const finished = ref(false)
const page = ref(1)

const onLoadChats = () => {
  // 模拟分页加载聊天记录
  setTimeout(() => {
    const moreChats = Array(10)
        .fill(0)
        .map((_, i) => ({
          id: page.value * 10 + i,
          nickname: `用户${page.value * 10 + i}`,
          lastMessage: `消息内容 ${page.value * 10 + i}`,
          timestamp: `2023-08-${i + 1}`
        }))
    chats.value = [...chats.value, ...moreChats]
    loading.value = false
    if (page.value >= 2) finished.value = true
    page.value++
  }, 1000)
}

// 跳转到聊天页面
const goToChatPage = (chatId: number) => {
  router.push(`/chat/${chatId}`)
}
</script>

<style scoped>
.messages-page {
  padding: 20px;
  background-color: #f4f7fc;
}

/* 美化通知入口 */
.notification-entry {
  margin-bottom: 20px;
  padding: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.notification-entry:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
}

.entry-content {
  display: flex;
  align-items: center;
}

.entry-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 12px;
}

.entry-text {
  flex: 1;
}

.entry-title {
  font-size: 18px;
  font-weight: bold;
}

.entry-subtitle {
  font-size: 14px;
  margin-top: 4px;
  opacity: 0.9;
}

.entry-arrow {
  font-size: 24px;
  margin-left: 12px;
}

/* 聊天记录项样式 */
.chat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.chat-item:hover {
  background-color: #f7f7f7;
}

.chat-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 16px;
}

.chat-main {
  flex: 1;
}

.nickname {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.last-message {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.timestamp {
  font-size: 12px;
  color: #aaa;
  text-align: right;
  margin-left: 12px;
}
</style>
