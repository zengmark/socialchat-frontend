<template>
  <div class="chatroom-selection-page">
    <!-- 聊天室列表 -->
    <van-grid :column-num="2" square>
      <van-grid-item
          v-for="(chatroom, index) in chatRooms"
          :key="index"
          @click="goToChatRoom(chatroom.id)"
      >
        <div class="chatroom-item">
          <van-image class="chatroom-icon" round :src="chatroom.roomAvatar" />
          <div class="chatroom-info">
            <div class="chatroom-name">{{ chatroom.roomName }}</div>
            <div class="chatroom-description">{{ chatroom.roomDescription }}</div>
          </div>
        </div>
      </van-grid-item>
    </van-grid>

    <!-- 固定右下角创建聊天室按钮 -->
    <van-button
        class="create-room-button"
        type="primary"
        circle
        @click="openCreatePopup"
    >
      +
    </van-button>

    <!-- 创建聊天室弹窗 -->
    <van-popup v-model:show="showCreatePopup" position="center" closeable>
      <div class="create-chatroom-popup">
        <div class="popup-header">
          <h3>创建聊天室</h3>
        </div>
        <van-field
            v-model="newChatRoomName"
            label="聊天室名称"
            placeholder="请输入聊天室名称"
            clearable
            class="custom-field"
        />
        <van-field
            v-model="newChatRoomDescription"
            label="聊天室描述"
            placeholder="请输入聊天室描述"
            clearable
            class="custom-field"
        />

        <!-- 上传聊天室图标和标签在一行 -->
        <div class="uploader-container">
          <div class="uploader-label">
            聊天室图标 <span class="required">*</span>
          </div>
          <!-- 上传聊天室图标 -->
          <van-uploader
              v-model="newChatRoomIconList"
              :before-read="beforeRead"
              :after-read="handleAfterRead"
              :max-count="1"
              accept="image/*"
              class="custom-uploader"
          >
            <template #upload>
              <div class="uploader-placeholder">
                <van-icon name="plus" size="24" />
                <span>上传图标</span>
              </div>
            </template>
          </van-uploader>
        </div>

        <div class="popup-actions">
          <van-button type="primary" @click="createChatRoom">创建</van-button>
          <van-button @click="showCreatePopup = false">取消</van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import axios from '../../api/axios.ts'
import { initWebSocket } from '../../services/imageWebsocket.ts'

// 聊天室列表（从后端获取返回的 ChatRoomVO 数组）
const chatRooms = ref<Array<{ id: number, roomName: string, roomDescription: string, roomAvatar: string }>>([])

const router = useRouter()

// 跳转到聊天室页面
const goToChatRoom = (chatroomId: number) => {
  router.push(`/chat/${chatroomId}`)
}

// 加载聊天室列表数据
const loadChatRooms = async () => {
  try {
    // 这里传入分页参数，如当前页号、页面大小、排序字段等
    const response = await axios.post('/api/chat/listChatRooms', {
      current: 1,
      pageSize: 10,
      sortField: ''
    })
    // 假设返回数据结构为：{ data: { records: ChatRoomVO[] } }
    if (response.data && response.data.records) {
      // 将后端数据映射为前端所需格式
      chatRooms.value = response.data.records.map((item: any) => ({
        id: item.id,
        roomName: item.roomName,
        roomDescription: item.roomDescription,
        roomAvatar: item.roomAvatar
      }))
    }
  } catch (error) {
    console.error("加载聊天室列表失败", error)
    showToast('获取聊天室列表失败')
  }
}

// 弹窗控制及输入字段
const showCreatePopup = ref(false)
const newChatRoomName = ref('')
const newChatRoomDescription = ref('')

// 用于上传图标，v-model 是一个数组，最多允许一张图片
const newChatRoomIconList = ref([])

// 上传前验证（同头像上传）
const beforeRead = (file: any) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    showToast('仅支持上传图片文件');
    return false;
  }
  const isUnderLimit = file.size / 1024 / 1024 < 5; // 限制为 5MB
  if (!isUnderLimit) {
    showToast('图片大小不能超过 5MB');
    return false;
  }
  return true;
};

// 上传图片后的回调（调用同一接口，通过 WebSocket 获取图片地址）
const handleAfterRead = async (file: any) => {
  if (newChatRoomIconList.value.length > 1) {
    showToast('最多上传 1 张图片');
    return;
  }
  const formData = new FormData();
  formData.append('file', file.file);
  const sessionId = 'session-' + Math.random().toString(36).substr(2, 9);
  try {
    const wsPromise = initWebSocket(sessionId);
    await axios.post('/api/post/uploadPostImage', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { sessionId },
    });
    // 等待 WebSocket 返回图片地址
    const imageUrl = await wsPromise;
    console.log('WebSocket 返回的图片地址:', imageUrl);
    // 将 imageUrl 封装为对象，并使用 url 属性，van-uploader 默认读取 url 作为预览地址
    newChatRoomIconList.value = [{ url: imageUrl }];
    showToast('图片上传成功');
  } catch (error) {
    console.error("图片上传失败", error);
    showToast('图片上传失败');
  }
};

// 打开创建聊天室弹窗
const openCreatePopup = () => {
  showCreatePopup.value = true;
}

// 创建聊天室逻辑
const createChatRoom = async () => {
  if (!newChatRoomName.value.trim()) {
    showToast('请输入聊天室名称');
    return;
  }
  if (!newChatRoomDescription.value.trim()) {
    showToast('请输入聊天室描述');
    return;
  }
  if (newChatRoomIconList.value.length === 0) {
    showToast('请上传聊天室图标');
    return;
  }
  // 组装后端要求的请求对象：ChatRoomAddRequest
  const chatRoomAddRequest = {
    roomName: newChatRoomName.value.trim(),
    roomDescription: newChatRoomDescription.value.trim(),
    roomAvatar: newChatRoomIconList.value[0].url
  }
  try {
    const response = await axios.post('/api/chat/createChatRoom', chatRoomAddRequest)
    if (response.data) {
      showToast('聊天室创建成功')
      showCreatePopup.value = false
      // 清空输入框及图片列表
      newChatRoomName.value = ''
      newChatRoomDescription.value = ''
      newChatRoomIconList.value = []
      // 重新加载聊天室列表
      loadChatRooms()
    } else {
      showToast('创建聊天室失败')
    }
  } catch (error) {
    console.error("创建聊天室失败", error)
    showToast('创建聊天室失败')
  }
}

// 组件加载时，拉取聊天室列表
onMounted(() => {
  loadChatRooms()
})
</script>

<style scoped>
.chatroom-selection-page {
  margin-top: 16px;
  background-color: #f4f7fc;
  min-height: 100vh;
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
.chatroom-description {
  font-size: 12px;
  color: #888;
}

/* 固定右下角创建聊天室按钮 */
.create-room-button {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #409eff;
  color: #fff;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 优化弹窗样式 */
.create-chatroom-popup {
  padding: 20px;
  width: 320px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 弹窗标题 */
.popup-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

/* 自定义输入框样式 */
.custom-field {
  --field-label-color: #555;
  --field-input-text-color: #333;
  --field-font-size: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: none;
}

/* 上传组件和标签在一行显示 */
.uploader-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 上传图标标签 */
.uploader-label {
  font-size: 14px;
  color: #555;
}

/* 必填字段标识 */
.required {
  color: red;
}

/* 自定义上传组件样式 */
.custom-uploader {
  flex: 1;
}
.uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}

/* 按钮区域 */
.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.popup-actions .van-button {
  flex: 1;
  border-radius: 8px;
  height: 40px;
}
</style>
