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
          :class="['message-wrapper', msg.from === 'me' ? 'sent' : 'received']"
      >
        <!-- 昵称和头像 -->
        <div class="message-header">
          <img :src="msg.avatar" alt="头像" class="message-avatar" />
          <span class="message-nickname">{{ msg.nickname }}</span>
        </div>
        <!-- 时间戳 -->
        <div class="message-timestamp">{{ msg.time }}</div>
        <!-- 消息气泡 -->
        <div class="chat-message">
          <div class="message-content">
            <span>{{ msg.content }}</span>
          </div>
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

<script setup>
import { ref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {useUserStore} from "../../stores/user.ts";

const router = useRouter()
const routes = useRoute()
const userStore = useUserStore();

const friendName = '好友A'
const newMessage = ref('')
const messages = ref([
  // { from: 'other', nickname: '用户A', avatar: 'https://via.placeholder.com/40', content: '你好！', time: '09:00' },
  // { from: 'me', nickname: '我', avatar: 'https://via.placeholder.com/40', content: '你好，最近怎么样？', time: '09:01' },
  // { from: 'other', nickname: '用户B', avatar: 'https://via.placeholder.com/40', content: '最近工作挺忙的，你呢？', time: '09:02' }
])
const chatContainer = ref(null)

// 新增：用于保存当前 WebSocket 连接的对象
const socket = ref(null)
// 新增：保存当前聊天室 ID
const roomId = ref(null)

// 返回上一页
const goBack = () => {
  router.back()
}

const getReceiverId = (singleRoomId, userId) => {
  const userIdStr = String(userId);
  const singleRoomIdStr = String(singleRoomId);

  // 如果 singleRoomId 以 userId 开头，则 receiverId 是后面的部分
  if (singleRoomIdStr.startsWith(userIdStr)) {
    return Number(singleRoomIdStr.slice(userIdStr.length));
  }

  // 否则，singleRoomId 以 userId 结尾，则 receiverId 是前面的部分
  return Number(singleRoomIdStr.slice(0, singleRoomIdStr.length - userIdStr.length));
}

// 发送消息，并通过 WebSocket 发送数据
// 发送消息时，包括头像和昵称
const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userInfo = await userStore.getUserInfo();
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}` // 修改时间格式为 时:分

  const content = newMessage.value;

  // 清空输入框
  newMessage.value = ''
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })

  // 修改：如果 WebSocket 处于打开状态，则发送消息
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    let receiverId = -1;
    // 说明是单聊，群聊就用-1即可
    if (roomId.value > userInfo.id) {
      receiverId = getReceiverId(roomId.value, userInfo.id);
    }
    const payload = JSON.stringify({
      type: 1, // 群聊消息类型
      content: content,
      targetId: roomId.value, // 将房间ID作为目标
      receiverId: receiverId, // 接受者的ID
      senderId: userInfo.id, // 发送者的ID
      senderName: userInfo.userName ? userInfo.userName : "用户" + userInfo.id, // 发送者的昵称
      senderAvatar: userInfo.userAvatar ? userInfo.userAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg', // 发送者的头像
    })
    console.log("发送的消息为", payload);
    socket.value.send(payload)
  }

  // 更新本地消息列表
  messages.value.push({
    from: 'me',
    nickname: userInfo.userName ? userInfo.userName : "用户" + userInfo.id,
    avatar: userInfo.userAvatar ? userInfo.userAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    content: content,
    time: time,
  })
}

// 新增：建立连接到指定聊天室的 WebSocket 连接
const connectToChatRoom = async (roomId) => {
  // 如果已有连接，则先关闭
  if (socket.value) {
    socket.value.close()
  }

  const userInfo = await userStore.getUserInfo();

  // 修改：建立新的 WebSocket 连接，替换 URL 为实际的服务地址
  socket.value = new WebSocket(`ws://192.168.1.236:8100/api/post/ws/chat?roomId=${roomId}&userId=9072`)

  socket.value.onopen = () => {
    console.log(`已连接到聊天室 ${roomId}`)
  }

  socket.value.onmessage = (event) => {
    const resp = event.data;
    const data = JSON.parse(resp);
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`; // 修改时间格式为 时:分
    console.log("收到消息为:", data)
    messages.value.push({
      from: 'other',
      nickname: data.senderName ? data.senderName : '用户' + data.senderId,
      avatar: data.senderAvatar ? data.senderAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      content: data.content,
      time: time // 使用新的时间格式
    })
  }

  socket.value.onclose = () => {
    console.log(`已断开聊天室 ${roomId} 的连接`)
  }

  socket.value.onerror = (error) => {
    console.error('WebSocket错误：', error)
  }
}

// 修改：组件挂载时建立与聊天室的 WebSocket 连接
onMounted(() => {
  console.log("进来了")
  const roomIdFromRoute = routes.params.id;
  if (roomIdFromRoute) {
    roomId.value = Number(roomIdFromRoute)
    console.log("建立连接：", roomId.value);
    connectToChatRoom(roomId.value)
  }
})

// 修改：组件卸载前关闭 WebSocket 连接，防止资源泄露
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
  }
})
</script>


<style scoped>
/* 此处保留原有样式 */
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

/* 消息 wrapper */
.message-wrapper {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  max-width: 70%;
  width: 100%;
  align-items: flex-start;
}

.message-wrapper.sent {
  margin-left: auto;
  align-items: flex-end;
}

/* 昵称和头像 */
.message-header {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 8px;
}

.message-nickname {
  font-size: 14px;
  font-weight: bold;
}

/* 时间戳样式 */
.message-timestamp {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

/* 消息气泡 */
.chat-message {
}

.message-content {
  display: inline-block;
  padding: 10px 14px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.message-wrapper.sent .message-content {
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
