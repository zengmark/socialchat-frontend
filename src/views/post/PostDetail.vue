<template>
  <div class="post-detail">
    <van-nav-bar
        title="帖子详情"
        left-text="返回"
        left-arrow
        @click-left="goBack"
    />
    <div class="content">
      <img :src="post.image" alt="帖子图片" class="post-image" />
      <h1>{{ post.title }}</h1>
      <p>{{ post.description }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const post = ref(null);

// 模拟获取帖子详情的接口
const fetchPostDetail = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟延迟
  return {
    id,
    title: `帖子标题 ${id}`,
    description: `这是帖子 ${id} 的详细描述内容，非常丰富有趣！`,
    image: `https://picsum.photos/400/600?random=${id}`,
  };
};

// 加载帖子详情
onMounted(async () => {
  const postId = route.params.id;
  post.value = await fetchPostDetail(postId);
});

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.post-detail {
  padding: 16px;
}

.post-image {
  width: 100%;
  border-radius: 8px;
}

.content {
  text-align: center;
}
</style>