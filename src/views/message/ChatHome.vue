<template>
  <div class="chatroom-selection-page">
<!--    <div class="header">-->
<!--      <span class="back-icon" @click="goBack">←</span>-->
<!--      <span class="title">聊天室选择</span>-->
<!--    </div>-->

    <!-- 聊天室列表 -->
    <van-grid :column-num="2" square>
      <van-grid-item v-for="(chatroom, index) in chatrooms" :key="index" @click="goToChatRoom(chatroom.id)">
        <div class="chatroom-item">
          <van-image class="chatroom-icon" round :src="chatroom.icon" />
          <div class="chatroom-info">
            <div class="chatroom-name">{{ chatroom.name }}</div>
            <div class="online-count">在线人数：{{ chatroom.onlineUsers }}</div>
          </div>
        </div>
      </van-grid-item>
    </van-grid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// 模拟聊天室数据
const chatrooms = ref([
  { id: 1, name: '聊天室A', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', onlineUsers: 120 },
  { id: 2, name: '聊天室B', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg', onlineUsers: 75 },
  { id: 3, name: '聊天室C', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg', onlineUsers: 200 },
  { id: 4, name: '聊天室D', icon: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', onlineUsers: 50 },
])

const router = useRouter()

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到聊天室页面
const goToChatRoom = (chatroomId: number) => {
  router.push(`/chat/${chatroomId}`)
}
</script>

<style scoped>
.chatroom-selection-page {
  margin-top: 16px;
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

/* 聊天室选择项 */
.chatroom-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s;
  cursor: pointer;
}

.chatroom-item:hover {
  background-color: #f7f7f7;
}

.chatroom-icon {
  width: 60px;
  height: 60px;
  margin-bottom: 10px;
}

.chatroom-info {
  text-align: center;
}

.chatroom-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.online-count {
  font-size: 12px;
  color: #888;
}
</style>