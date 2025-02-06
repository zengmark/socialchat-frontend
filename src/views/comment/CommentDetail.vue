<template>
  <div class="comment-detail">
    <van-nav-bar title="评论详情" left-arrow @click-left="router.back()" />

    <van-list
        v-model:loading="loading"
        :finished="finished"
        @load="onLoad"
        :immediate-check="false"
    >
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-main">
          <div class="comment-author">{{ comment.nickName }}</div>
          <div class="comment-content">{{ comment.content }}</div>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { CommentItem } from './types'

const route = useRoute()
const router = useRouter()

const parentId = ref(Number(route.query.parentId))
const comments = ref<CommentItem[]>([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const pageSize = 10

const loadComments = async () => {
  // 模拟API请求
  setTimeout(() => {
    const mockData: CommentItem[] = Array(pageSize).fill(0).map((_, i) => ({
      id: page.value * pageSize + i,
      nickName: `子用户${page.value * pageSize + i}`,
      content: `子评论内容 ${page.value * pageSize + i}`
    }))

    comments.value = [...comments.value, ...mockData]
    loading.value = false
    if (page.value >= 3) finished.value = true
    page.value++
  }, 1000)
}

const onLoad = () => {
  loadComments()
}

onMounted(() => {
  loadComments()
})
</script>