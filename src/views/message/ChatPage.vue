<template>
  <div class="chat-page">
    <!-- 头部区域 -->
    <header class="chat-header">
      <span class="back-icon" @click="goBack">←</span>
      <span class="chat-title">{{ friendName }}</span>
    </header>

    <!-- 消息列表区域 -->
    <div class="chat-container" ref="chatContainer">
      <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['chat-message', msg.from === 'me' ? 'sent' : 'received']"
      >
        <div class="message-content">
          <span>{{ msg.content }}</span>
        </div>
      </div>
    </div>

    <!-- 消息输入区域 -->
    <div class="chat-input-container">
      <van-field
          v-model="newMessage"
          placeholder="请输入消息"
          type="text"
          class="chat-input"
          clearable
          @keyup.enter="sendMessage"
      />
      <button class="send-button" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const friendName = '好友A'
const newMessage = ref('')
const messages = ref([
  { from: 'other', content: '你好！' },
  { from: 'me', content: '你好，最近怎么样？' },
  { from: 'other', content: '最近工作挺忙的，你呢？' }
])

const chatContainer = ref<HTMLDivElement | null>(null)

// 返回上一页
const goBack = () => {
  router.back()
}

// 发送消息，并自动滚动到底部
const sendMessage = () => {
  if (!newMessage.value.trim()) return
  messages.value.push({ from: 'me', content: newMessage.value.trim() })
  newMessage.value = ''
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f7fc;
}

/* 头部区域 */
.chat-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 16px;
}

.chat-title {
  font-size: 18px;
  font-weight: bold;
}

/* 消息列表区域 */
.chat-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 消息项样式 */
.chat-message {
  margin-bottom: 12px;
  max-width: 70%;
  display: flex;
  align-items: flex-end;
}

.chat-message.sent {
  align-self: flex-end;
  justify-content: flex-end;
}

.chat-message.received {
  align-self: flex-start;
  justify-content: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.chat-message.sent .message-content {
  background-color: #a18cd1;
  color: #fff;
}

/* 消息输入区域 */
.chat-input-container {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #fff;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.chat-input {
  flex: 1;
  margin-right: 8px;
}

.send-button {
  background-color: #a18cd1;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.send-button:hover {
  background-color: #8f76b5;
}
</style>
