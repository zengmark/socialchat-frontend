<template>
  <div class="home-page">
    <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多内容了"
        @load="onLoad"
    >
      <div v-for="post in posts" :key="post.id" class="post-item" @click="goToPost(post.id)">
        <div class="post-content">
          <!-- 左侧文字内容 -->
          <div class="post-text">
            <div class="post-title">{{ post.title }}</div>
            <div class="post-description">{{ post.description }}</div>
          </div>
          <!-- 右侧图片 -->
          <img :src="post.image" alt="帖子图片" class="post-image" />
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// 模拟接口返回的数据
const fetchPosts = async (page, pageSize) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟
  const posts = Array.from({ length: pageSize }, (_, index) => {
    const id = (page - 1) * pageSize + index + 1;
    return {
      id,
      title: `帖子标题 ${id}`,
      description: `这是帖子 ${id} 的描述内容。描述内容较长时会显示省略号。示例文字非常非常非常非常长。`,
      image: `https://picsum.photos/100/100?random=${id}`,
    };
  });
  return posts;
};

const posts = ref([]); // 帖子列表
const page = ref(1); // 当前页码
const pageSize = 10; // 每页帖子数量
const loading = ref(false); // 是否正在加载
const finished = ref(false); // 是否加载完成
const router = useRouter();

// 加载更多数据
const onLoad = async () => {
  loading.value = true;
  const newPosts = await fetchPosts(page.value, pageSize);

  if (newPosts.length === 0) {
    finished.value = true; // 没有更多数据
  } else {
    posts.value.push(...newPosts); // 添加新数据到帖子列表
    page.value++;
  }

  loading.value = false;
};

// 跳转到帖子详情页
const goToPost = (id) => {
  router.push(`/post/${id}`);
};
</script>

<style scoped>
/* 整个页面样式 */
.home-page {
  padding: 0;
}

/* 单个帖子容器 */
.post-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

/* 帖子内容部分 */
.post-content {
  display: flex;
  width: 100%;
}

/* 左侧文字部分 */
.post-text {
  flex: 1;
  padding-right: 10px; /* 与图片保持间距 */
}

/* 帖子标题 */
.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap; /* 不换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超出显示省略号 */
}

/* 帖子描述 */
.post-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  max-height: 3em; /* 限制最多显示两行 */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 限制最多显示两行 */
  -webkit-box-orient: vertical;
}

/* 右侧图片部分 */
.post-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover; /* 保证图片填满框并保持比例 */
}
</style>