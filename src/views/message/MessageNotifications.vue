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
        <van-list
            v-model:loading="loading"
            :finished="finishedComments"
            finished-text="没有更多评论了"
            @load="onLoadComments"
        >
          <div v-for="item in comments" :key="item.id" class="notification-item">
            <div class="notification-icon">💬</div>
            <div class="notification-content">
              <div class="notification-title">{{ item.sourceUserName }} 回复了你</div>
              <div class="notification-body">{{ item.commentContent }}</div>
              <div class="notification-time">{{ formatDate(item.createTime) }}</div>
            </div>
          </div>
        </van-list>
      </van-tab>

      <!-- 点赞通知 -->
      <van-tab title="点赞">
        <van-list
            v-model:loading="loading"
            :finished="finishedLikes"
            finished-text="没有更多点赞了"
            @load="onLoadLikes"
        >
          <div v-for="item in likes" :key="item.id" class="notification-item">
            <div class="notification-icon">👍</div>
            <div class="notification-content">
              <div class="notification-title">{{ item.sourceUserName }}</div>
              <div class="notification-body">给你发布的内容点了个赞</div>
              <div class="notification-time">{{ formatDate(item.createTime) }}</div>
            </div>
          </div>
        </van-list>
      </van-tab>

      <!-- 收藏通知 -->
      <van-tab title="收藏">
        <van-list
            v-model:loading="loading"
            :finished="finishedFavorites"
            finished-text="没有更多收藏了"
            @load="onLoadFavorites"
        >
          <div v-for="item in favorites" :key="item.id" class="notification-item">
            <div class="notification-icon">⭐</div>
            <div class="notification-content">
              <div class="notification-title">{{ item.sourceUserName }}</div>
              <div class="notification-body">收藏了你发布的内容</div>
              <div class="notification-time">{{ formatDate(item.createTime) }}</div>
            </div>
          </div>
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import { useRouter } from 'vue-router'
import axios from '../../api/axios.ts'

const router = useRouter()
const activeTab = ref(0)

// 控制各类通知的加载状态
const loading = ref(false)
const finishedComments = ref(false)
const finishedLikes = ref(false)
const finishedFavorites = ref(false)

// 评论、点赞和收藏数据
const comments = ref([])
const likes = ref([])
const favorites = ref([])

// 当前页码
const pageComments = ref(1)
const pageLikes = ref(1)
const pageFavorites = ref(1)

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const hours = ('0' + date.getHours()).slice(-2);
  const minutes = ('0' + date.getMinutes()).slice(-2);
  const seconds = ('0' + date.getSeconds()).slice(-2);
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 获取评论通知数据
const onLoadComments = async () => {
  loading.value = true
  try {
    const pageRequest = {
      current: pageComments.value,
      pageSize: 10,
      sortField: 'comment'
    }
    const response = await axios.post('/api/like_collect/message/listMessage',  pageRequest)
    const data = response.data
    const {records} = data;
    console.log(records);
    if (records.length === 0) {
      finishedComments.value = true; // 如果没有数据，标记为已加载完
    } else {
      comments.value.push(...records)
      pageComments.value++
      finishedComments.value = records.length < 10
    }
  } catch (error) {
    console.error('加载评论通知失败', error)
  } finally {
    loading.value = false
  }
}

// 获取点赞通知数据
const onLoadLikes = async () => {
  loading.value = true
  try {
    const pageRequest = {
      current: pageLikes.value,
      pageSize: 10,
      sortField: 'like'
    }
    const response = await axios.post('/api/like_collect/message/listMessage', pageRequest)
    const data = response.data
    const {records} = data;
    console.log(records);
    if (records.length === 0) {
      finishedLikes.value = true; // 如果没有数据，标记为已加载完
    } else {
      likes.value.push(...records)
      pageLikes.value++
      finishedLikes.value = records.length < 10
    }
  } catch (error) {
    console.error('加载点赞通知失败', error)
  } finally {
    loading.value = false
  }
}

// 获取收藏通知数据
const onLoadFavorites = async () => {
  loading.value = true
  try {
    const pageRequest = {
      current: pageFavorites.value,
      pageSize: 10,
      sortField: 'collect'
    }
    const response = await axios.post('/api/like_collect/message/listMessage', pageRequest)
    const data = response.data
    const {records} = data;
    console.log(records);
    if (records.length === 0) {
      finishedFavorites.value = true; // 如果没有数据，标记为已加载完
    } else {
      favorites.value.push(...records)
      pageFavorites.value++
      finishedFavorites.value = records.length < 10
    }
  } catch (error) {
    console.error('加载收藏通知失败', error)
  } finally {
    loading.value = false
  }
}

const readMessage = async () => {
  await axios.post('/api/like_collect/message/readMessage');
}

onMounted(() => {
  readMessage();
})
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