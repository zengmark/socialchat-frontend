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
          <div class="avatar">
            <img :src="chat.avatar || defaultAvatar" alt="默认头像"/>
            <!-- 未读数气泡 -->
            <div v-if="chat.unreadCount > 0" class="unread-badge">
              {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
            </div>
          </div>
          <div class="chat-main">
            <p class="nickname">{{ chat.nickname }}</p>
            <!-- 使用截断函数 -->
            <p class="last-message">{{ truncateMessage(chat.lastMessage) }}</p>
          </div>
        </div>
        <div class="timestamp">{{ chat.timestamp }}</div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {useUserStore} from "../../stores/user.ts"
import axios from '../../api/axios.ts'

// 默认头像路径，请根据实际情况替换
const defaultAvatar = '/assets/default-avatar.png'
const userStore = useUserStore()

// 定义消息截断函数：超过7个字符时截取前7个字符并追加省略号
const truncateMessage = (message: string): string => {
  if (message && message.length > 7) {
    return message.slice(0, 7) + '...'
  }
  return message
}

// 路由实例
const router = useRouter()

// 聊天记录数据
const chats = ref([])

const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

// 跳转到聊天页面
const goToChatPage = async (receiverId: number) => {
  const userInfo = await userStore.getUserInfo()
  const userId = userInfo.id

  // 重置当前会话未读数
  const targetChat = chats.value.find(chat => chat.id === receiverId);
  if (targetChat) {
    targetChat.unreadCount = 0;
  }

  // 直接拼接并转换为数字，组成单聊聊天室ID
  let singleRoomId = userId < receiverId
      ? Number(`${userId}${receiverId}`)
      : Number(`${receiverId}${userId}`)
  router.push(`/chat/${singleRoomId}`)
}

// 将消息追加到当前聊天界面
const appendMessageToChat = (content: string, senderName: string, senderAvatar: string) => {
  console.log(`New message from ${senderName}: ${content}`)
}

// 分页加载聊天记录
const onLoadChats = async () => {
  loading.value = true
  try {
    const pageRequest = {
      current: page.value,
      pageSize: pageSize,
      sortField: ''
    }
    const resp = await axios.post('/api/chat/listChatSingleRooms', pageRequest)
    const records = resp.data.records || []

    // 将后端字段映射到前端需要的字段格式
    const mappedChats = records.map((item: any) => ({
      id: item.receiverId,
      nickname: item.receiverName,
      lastMessage: item.lastChatMessage,
      avatar: item.receiverAvatar,
      timestamp: item.lastChatTime ? new Date(item.lastChatTime).toLocaleString() : '',
      unreadCount: item.unReadCount // 新增未读数映射
    }))

    // 追加新的聊天记录
    chats.value = [...chats.value, ...mappedChats]

    // 当返回的数据不足一页时，标记为加载完成
    if (records.length < pageSize) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (error) {
    console.error("加载单聊信息失败", error)
  } finally {
    loading.value = false
  }
}

// 点击通知入口后跳转到专门的通知页面
const goToNotificationsPage = () => {
  router.push('/notifications')
}

onMounted(async () => {
  const userInfo = await userStore.getUserInfo();
  // WebSocket 实例，假设你已经有一个 WebSocket 连接
  const socket = new WebSocket(`ws://192.168.1.149:8100/api/post/ws/chat?roomId=1&userId=${userInfo.id}&targetUserId=5301`)
  // WebSocket 消息接收处理
  socket.onopen = () => {
    console.log('建立连接')
  }

  socket.onmessage = (event) => {
    const newMessage = JSON.parse(event.data)
    console.log("接受消息为：", newMessage)

    // 假设消息格式是：{ senderId, targetId, content, senderName, senderAvatar }
    const {senderId, targetId, receiverId, content, senderName, senderAvatar} = newMessage

    // 找到目标聊天记录
    console.log("chats为", chats.value)
    const targetChat = chats.value.find(chat => chat.id === senderId)

    if (targetChat) {
      // 如果目标聊天记录存在，更新它的最后一条消息
      targetChat.lastMessage = content
      targetChat.timestamp = new Date().toLocaleString()
      targetChat.unreadCount = (targetChat.unreadCount || 0) + 1

      // 如果当前是该聊天会话页面，可以更新聊天界面
      if (router.currentRoute.value.name === 'chat' && router.currentRoute.value.params.chatId === targetId.toString()) {
        // 直接显示消息在当前聊天框中
        appendMessageToChat(content, senderName, senderAvatar)
      }
    } else {
      // 如果该聊天记录不存在，可能是新聊天，加入聊天列表
      chats.value.push({
        id: targetId,
        nickname: senderName,
        lastMessage: content,
        avatar: senderAvatar,
        timestamp: new Date().toLocaleString(),
        unreadCount: 1 // 新聊天默认未读数
      })
    }
  }

  socket.onclose = () => {
    console.log(`已断开聊天室的连接`)
  }

  socket.onerror = (error) => {
    console.error('WebSocket错误：', error)
  }
})
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
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ddd;
  margin-right: 16px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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

/* 未读数标记样式 */
.unread-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(30%, -30%); /* 将气泡移到头像外 */
  min-width: 20px;
  height: 20px;
  padding: 2px 5px;
  background: #ff4444;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: 2px solid white; /* 添加白色边框增强可视性 */
  z-index: 1; /* 确保悬浮在头像上方 */
}
</style>
