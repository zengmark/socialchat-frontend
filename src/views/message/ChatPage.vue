<template>
  <div class="chat-page">
    <!-- 头部区域 -->
    <header class="chat-header">
      <span class="back-icon" @click="goBack">←</span>
      <span class="chat-title">{{ chatRoomName }}</span>
    </header>

    <!-- 消息列表区域 -->
    <div class="chat-container" ref="chatContainer">
      <!-- 如果可以加载更多历史消息，则显示加载更多按钮 -->
      <div v-if="canLoadMore" class="load-more" @click="loadMoreMessages">
        展开获取更多消息
      </div>

      <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-wrapper', msg.from === 'me' ? 'sent' : 'received']"
      >
        <!-- 昵称和头像 -->
        <div class="message-header">
          <img :src="msg.avatar" alt="头像" class="message-avatar"/>
          <span class="message-nickname">{{ msg.nickname }}</span>
        </div>
        <!-- 时间戳 -->
        <div class="message-timestamp">{{ formatTime(msg.time) }}</div>
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
import { useUserStore } from "../../stores/user.ts";
import axios from '../../api/axios.ts'

const router = useRouter()
const routes = useRoute()
const userStore = useUserStore();

const chatRoomName = ref('聊天室名称')
const newMessage = ref('')
// 消息列表（最新消息在后面）
const messages = ref([])

// 聊天框容器引用
const chatContainer = ref(null)

// 分页及历史消息相关变量
const page = ref(1)
const pageSize = 10
const totalMessages = ref(0)
const canLoadMore = ref(false)

// WebSocket 对象与当前房间ID
const socket = ref(null)
const roomId = ref(null)

// 定时器变量
let timer = null;

// 返回上一页
const goBack = () => {
  router.back()
}

// 单聊时获取接收者ID的辅助函数
const getReceiverId = (singleRoomId, userId) => {
  const userIdStr = String(userId);
  const singleRoomIdStr = String(singleRoomId);
  if (singleRoomIdStr.startsWith(userIdStr)) {
    return Number(singleRoomIdStr.slice(userIdStr.length));
  }
  return Number(singleRoomIdStr.slice(0, singleRoomIdStr.length - userIdStr.length));
}

// 加载历史消息
const loadMoreMessages = async () => {
  try {
    const chatMessagePageRequest = {
      current: page.value,
      pageSize: pageSize,
      sortField: '',
      roomId: roomId.value
    }
    // 模拟调用后端接口（请根据实际情况修改 URL 和参数）
    const resp = await axios.post(`/api/chat/listChatMessages`, chatMessagePageRequest);
    const { data } = resp;
    console.log(data.records)
    if (page.value === 1) {
      totalMessages.value = data.total;
    }
    const userInfo = await userStore.getUserInfo();
    if (data.records && data.records.length > 0) {
      // 将获取到的历史消息插入到当前消息列表的最前面
      data.records.forEach(record => {
        let tempMessage = {};
        if (record.senderId === userInfo.id) {
          // console.log('进来了', record)
          tempMessage.from = 'me';
          tempMessage.nickname = record.senderName;
          tempMessage.avatar = record.senderAvatar;
          // console.log('消息最终为', tempMessage)
        } else {
          // console.log('进来了', record)
          tempMessage.from = 'other';
          tempMessage.nickname = record.senderName;
          tempMessage.avatar = record.senderAvatar;
          // console.log('消息最终为', tempMessage)
        }
        tempMessage.content = record.chatContent;
        tempMessage.time = record.createTime;
        // 使用 unshift 将新数据插入到消息列表的前面
        messages.value.unshift(tempMessage);
      })
      page.value += 1;
    }
    // 当返回的消息数量小于分页大小时，说明没有更多历史消息了
    if (data.records.length < pageSize) {
      canLoadMore.value = false;
    } else {
      canLoadMore.value = true;
    }
  } catch (error) {
    console.error("加载历史消息失败：", error);
  }
}

// 格式化时间戳
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 发送消息，并通过 WebSocket 发送数据
const sendMessage = async () => {
  if (!newMessage.value.trim()) return

  const userInfo = await userStore.getUserInfo();
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  const content = newMessage.value;
  newMessage.value = ''

  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })

  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    let receiverId = -1;
    // 如果 roomId 大于当前用户ID，说明是单聊
    if (roomId.value > userInfo.id) {
      receiverId = getReceiverId(roomId.value, userInfo.id);
    }
    const payload = JSON.stringify({
      type: 1, // 消息类型
      content: content,
      targetId: roomId.value,
      receiverId: receiverId,
      senderId: userInfo.id,
      senderName: userInfo.userName ? userInfo.userName : "用户" + userInfo.id,
      senderAvatar: userInfo.userAvatar ? userInfo.userAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    })
    console.log("发送的消息为", payload);
    socket.value.send(payload)
  }

  messages.value.push({
    from: 'me',
    nickname: userInfo.userName ? userInfo.userName : "用户" + userInfo.id,
    avatar: userInfo.userAvatar ? userInfo.userAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
    content: content,
    time: now,
  })
}

// 建立与指定聊天室的 WebSocket 连接
const connectToChatRoom = async (roomId) => {
  if (socket.value) {
    socket.value.close()
  }

  await userStore.getUserInfo();
  socket.value = new WebSocket(`ws://192.168.1.149:8100/api/post/ws/chat?roomId=${roomId}&userId=9072`)

  socket.value.onopen = () => {
    console.log(`已连接到聊天室 ${roomId}`)
  }

  socket.value.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const time = new Date();
    console.log("收到消息为:", data)
    messages.value.push({
      from: 'other',
      nickname: data.senderName ? data.senderName : '用户' + data.senderId,
      avatar: data.senderAvatar ? data.senderAvatar : 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
      content: data.content,
      time: time
    })
  }

  socket.value.onclose = () => {
    console.log(`已断开聊天室 ${roomId} 的连接`)
  }

  socket.value.onerror = (error) => {
    console.error('WebSocket错误：', error)
  }
}

const initChatRoomName = async () => {
  const userInfo = await userStore.getUserInfo();
  const userId = userInfo.id;
  // 说明是单聊聊天室
  if (roomId.value > userId) {
    const receiverId = getReceiverId(roomId.value, userId);
    // 发起请求获取用户名
    const resp = await axios.post('/api/user/getUserInfoByUserId', null, {
      params: {
        userId: receiverId
      }
    });
    const { data } = resp;
    chatRoomName.value = data.userName;
  } else {
    const resp = await axios.post('/api/chat/getChatRoomInfo', null, {
      params: {
        roomId: roomId.value
      }
    });
    const { data } = resp;
    chatRoomName.value = data.roomName;
  }
}

// 组件挂载时：建立 WebSocket 连接、加载初始历史消息并启动定时器
onMounted(async () => {
  console.log("进来了")
  const roomIdFromRoute = routes.params.id;
  if (roomIdFromRoute) {
    roomId.value = Number(roomIdFromRoute)
    console.log("建立连接：", roomId.value);
    initChatRoomName();
    connectToChatRoom(roomId.value)
    // 初次加载历史消息
    await loadMoreMessages();
    // 初始加载如果历史消息总数大于10，则展示加载更多按钮
    if (totalMessages.value > pageSize) {
      canLoadMore.value = true;
    }
    // 滚动到最新消息
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
    const userInfo = await userStore.getUserInfo();
    const receiverId = getReceiverId(roomId.value, userInfo.id);
    const messageSingleRoomReadRequest = {
      roomId: roomId.value,
      senderId: userInfo.id,
      receiverId: receiverId
    }
    await axios.post('/api/like_collect/message/readSingleChatMessage', messageSingleRoomReadRequest);

    // 添加定时器，每秒向后端发送一个请求
    timer = setInterval(async () => {
      await axios.post('/api/like_collect/message/readSingleChatMessage', messageSingleRoomReadRequest);
    }, 3000);
  }
})

// 组件卸载前关闭 WebSocket 连接及清除定时器
onBeforeUnmount(() => {
  if (socket.value) {
    socket.value.close()
  }
  if (timer) {
    clearInterval(timer);
  }
})
</script>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f4f7fc;
}

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

.chat-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  padding: 10px;
  color: #007aff;
  cursor: pointer;
  margin-bottom: 10px;
}

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

.message-timestamp {
  font-size: 12px;
  color: #aaa;
  margin-bottom: 4px;
}

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
