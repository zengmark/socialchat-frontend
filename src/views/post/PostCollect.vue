<template>
  <div class="favorites-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
        title="我的收藏"
        left-text="返回"
        left-arrow
        @click-left="goBack"
    />

    <!-- 收藏帖子列表 -->
    <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多收藏了"
        @load="onLoad"
    >
      <div
          v-for="post in posts"
          :key="post.id"
          class="post-item"
          @click="goToPost(post.id)"
      >
        <div class="post-content">
          <!-- 左侧文字内容 -->
          <div class="post-text">
            <div class="post-title">{{ post.postTitle }}</div>
            <div class="post-description">{{ post.postContent }}</div>
            <div class="post-meta">
              <van-icon name="like-o" class="meta-icon" />
              <span class="meta-number">{{ post.likeNum }}</span>
              <van-icon name="chat-o" class="meta-icon" />
              <span class="meta-number">{{ post.commentNum }}</span>
              <van-icon name="star-o" class="meta-icon" />
              <span class="meta-number">{{ post.collectNum }}</span>
            </div>
          </div>
          <!-- 右侧图片（若无图片则显示默认图片） -->
          <img
              :src="(post.postPictures && post.postPictures.length > 0) ? post.postPictures[0] : defaultPicture"
              alt="帖子图片"
              class="post-image"
          />
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '../../api/axios.ts';

interface CollectVO {
  id: number;
  userId: number;
  postTitle: string;
  postContent: string;
  postPictures: string[];
  userAt: number[];
  likeNum: number;
  commentNum: number;
  collectNum: number;
  visible: number;
  tags: string[];
}

const posts = ref<CollectVO[]>([]);
const current = ref(1);
const pageSize = 10;
const loading = ref(false);
const finished = ref(false);
const router = useRouter();
const defaultPicture =
    'https://gitee.com/Code_for_love/images/raw/master/-6696978110499230174test.png';

// 加载收藏帖子列表数据
const onLoad = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const pageRequest = {
      current: current.value,
      pageSize: pageSize,
      sortField: ''
    };
    const response = await axios.post('/api/like_collect/collect/listCollect', pageRequest);
    if (response.data && response.data.records) {
      const records = response.data.records;
      if (records.length < pageSize) {
        finished.value = true;
      }
      posts.value.push(...records);
      current.value++;
    } else {
      finished.value = true;
    }
  } catch (error) {
    console.error('加载收藏帖子失败', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onLoad();
});

// 跳转到帖子详情页
const goToPost = (id: number) => {
  router.push(`/post/${id}`);
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.favorites-page {
  padding: 0;
  margin: 0;
}

/* 顶部导航栏下边距 */
.van-nav-bar {
  margin-bottom: 10px;
}

/* 单个帖子容器 */
.post-item {
  display: flex;
  align-items: center;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #f9f9f9;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

/* 帖子内容部分 */
.post-content {
  display: flex;
  width: 100%;
}

/* 左侧文字部分 */
.post-text {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

/* 帖子标题 */
.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 帖子描述 */
.post-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  max-height: 3em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 点赞、评论、收藏的容器 */
.post-meta {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

/* 图标样式 */
.meta-icon {
  font-size: 18px;
  color: #888;
  margin-right: 4px;
}

/* 数字样式 */
.meta-number {
  font-size: 14px;
  color: #666;
  margin-right: 16px;
}

/* 右侧图片部分 */
.post-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
