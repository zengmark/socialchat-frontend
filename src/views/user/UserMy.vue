<template>
  <div class="my-page">
    <!-- 用户信息 -->
    <div class="user-info">
      <van-image class="avatar" round :src="user.avatar" />
      <div class="user-details">
        <p class="nickname">{{ user.nickname }}</p>
        <p class="bio">{{ user.bio }}</p>
      </div>
      <van-button size="small" round plain type="primary" @click="editProfile">编辑资料</van-button>
    </div>

    <!-- 菜单列表 -->
    <van-cell-group inset>
      <van-cell title="我的帖子" icon="notes-o" is-link @click="goToMyPosts" />
      <van-cell title="我的收藏" icon="star-o" is-link @click="goToFavorites" />
      <van-cell title="消息中心" icon="chat-o" is-link @click="goToMessages" />
      <van-cell title="设置" icon="setting-o" is-link @click="goToSettings" />
    </van-cell-group>

    <!-- 退出登录 -->
    <van-button class="logout-btn" type="danger" block round @click="logout">退出登录</van-button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import {useUserStore} from "../../stores/user.ts";

const router = useRouter()
const userStore = useUserStore()

// 模拟用户信息
const user = ref({
  avatar: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  nickname: 'Vue 开发者',
  bio: '这个人很懒，什么都没写'
})

// 编辑个人资料
const editProfile = () => {
  router.push('/edit-profile')
}

// 跳转到各个功能页面
const goToMyPosts = () => router.push('/my-posts')
const goToFavorites = () => router.push('/favorites')
const goToMessages = () => router.push('/messages')
const goToSettings = () => router.push('/settings')

// 退出登录
const logout = () => {
  showConfirmDialog({
    title: '确认退出？',
    message: '退出后需要重新登录'
  })
      .then(() => {
        userStore.logout() // 调用 Pinia 进行用户状态清理
        showToast('退出成功')
        router.push('/login') // 返回登录页面
      })
      .catch(() => {
        showToast('已取消')
      })
}

onMounted(() => {

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

/* 退出登录按钮 */
.logout-btn {
  margin-top: 20px;
}
</style>