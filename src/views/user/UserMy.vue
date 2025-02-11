<template>
  <div class="my-page">
    <!-- 用户信息 -->
    <div class="user-info">
      <van-image class="avatar" round :src="user.userAvatar" @click="openAvatarModal" />
      <div class="user-details">
        <p v-if="isLogin" class="nickname">{{ user.userName || '默认昵称' }}</p>
        <p v-else class="nickname">未登录</p>
        <p class="bio">{{ user.userProfile || '这个人很懒，还没有简介' }}</p>
      </div>
      <van-button size="small" round plain type="primary" @click="openEditProfile">编辑资料</van-button>
    </div>

    <!-- 编辑资料弹窗 -->
    <van-popup v-model:show="showEditProfile" position="bottom">
      <div class="edit-profile-popup">
        <van-field v-model="nickname" label="昵称" placeholder="请输入昵称" />
        <van-field v-model="bio" label="简介" placeholder="请输入简介" type="textarea" />
        <van-button type="primary" block @click="saveProfile">保存</van-button>
      </div>
    </van-popup>

    <!-- 头像更新弹窗 -->
    <van-popup v-model:show="showAvatarModal" position="bottom">
      <div class="avatar-popup">
        <p>请更新您的头像</p>
        <van-uploader
            v-model="images"
            multiple
            :max-count="1"
            :preview-size="100"
            :before-read="beforeRead"
            :after-read="handleAfterRead"
            @delete="deleteImage"
        />
        <van-button type="primary" block @click="saveAvatar">保存头像</van-button>
      </div>
    </van-popup>

    <!-- 菜单列表 -->
    <van-cell-group inset>
      <van-cell title="我的帖子" icon="notes-o" is-link @click="goToMyPosts" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="goToFavorites" />
      <van-cell title="设置" icon="setting-o" is-link @click="goToSettings" />
    </van-cell-group>

    <!-- 退出登录 -->
    <van-button v-if="isLogin" class="logout-btn" type="danger" block round @click="logout">退出登录</van-button>
    <van-button v-else class="logout-btn" type="danger" block round @click="login">登录</van-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useUserStore } from "../../stores/user.ts"
import axios from '../../api/axios.ts'
import {initWebSocket} from "../../services/imageWebsocket.ts";

const router = useRouter()
const userStore = useUserStore()
const isLogin = ref(false)
const user = ref({})

const showEditProfile = ref(false) // 控制资料弹窗显示
const showAvatarModal = ref(false) // 控制头像弹窗显示
const nickname = ref('') // 用户昵称
const bio = ref('') // 用户简介

// 图片数据
const images = ref([]);
const imageUrls = ref([]);

// 编辑个人资料
const openEditProfile = () => {
  if (isLogin.value) {
    nickname.value = user.value.userName || ''
    bio.value = user.value.userProfile || ''
    showEditProfile.value = true;
  } else {
    showToast('请先登录')
  }
}

// 头像更新弹窗
const openAvatarModal = () => {
  if (isLogin.value) {
    showAvatarModal.value = true;
  } else {
    showToast('请先登录')
  }
}

// 保存资料
const saveProfile = async () => {
  const userUpdateRequest = {
    userName: user.value.userName,
    userProfile: user.value.userProfile
  }
  if (nickname.value) {
    userUpdateRequest.userName = nickname.value;
  }
  if (bio.value) {
    userUpdateRequest.userProfile = bio.value;
  }
  await userStore.updateUserInfo(userUpdateRequest);
  await onLoadUser();
  showToast('资料保存成功')
  showEditProfile.value = false
}

// 保存头像
const saveAvatar = async () => {
  console.log("保存头像")
  if (images.value.length > 0) {
    const imageUrl = imageUrls.value[0]; // Get the first image URL
    const userUpdateAvatarRequest = {
      userAvatar: imageUrl
    }
    console.log(userUpdateAvatarRequest);
    await userStore.updateUserAvatar(userUpdateAvatarRequest);
    showToast('头像更新成功');
    showAvatarModal.value = false;
    await onLoadUser();
  } else {
    showToast('请选择一张头像');
  }
}

// 跳转到各个功能页面
const goToMyPosts = () => router.push('/myPosts')
const goToFavorites = () => router.push('/favorites')
const goToSettings = () => router.push('/mySetting')

// 退出登录
const logout = () => {
  showConfirmDialog({
    title: '确认退出？',
    message: '退出后需要重新登录'
  })
      .then(() => {
        userStore.clearUserInfo();
        user.value = null;
        axios.post('/api/user/logout').then((res) => {
          showToast('退出成功');
          window.location.reload(); // 刷新页面
          // router.push('/login')
        });
      })
      .catch(() => {
        showToast('已取消')
      })
}

// 登录
const login = () => {
  router.push('/login')
}

const onLoadUser = async () => {
  await userStore.fetchUserInfo();
  const userInfo = await userStore.getUserInfo();
  isLogin.value = userStore.isLoggedIn;
  user.value = userInfo;
}

// 上传图片
const beforeRead = (file) => {
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

// 上传图片
const handleAfterRead = async (file) => {
  if (images.value.length > 1) {
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
    imageUrls.value.push(imageUrl);
    showToast('图片上传成功');
  } catch (error) {
    console.error("图片上传失败", error);
    showToast('图片上传失败');
  }
};

// 删除图片
const deleteImage = (file) => {
  images.value = images.value.filter((image) => image !== file);
};

onMounted(() => {
  onLoadUser()
})
</script>

<style scoped>
.my-page {
  padding: 20px;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  margin-right: 15px;
  cursor: pointer;
}

.user-details {
  flex: 1;
}

.nickname {
  font-size: 18px;
  font-weight: bold;
}

.bio {
  font-size: 14px;
  color: #666;
}

/* 头像更新弹窗 */
.avatar-popup {
  padding: 20px;
  text-align: center;
}

/* 退出登录按钮 */
.logout-btn {
  margin-top: 20px;
}

/* 编辑资料弹窗 */
.edit-profile-popup {
  padding: 20px;
}
</style>
