<template>
  <div class="home-page">
    <!-- 选项卡 -->
    <div class="tabs-container">
      <van-tabs v-model:active="activeTab" class="custom-tabs" type="line">
        <van-tab title="最热"/>
        <van-tab title="最新"/>
      </van-tabs>
    </div>

    <!-- 帖子列表 -->
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
            <div class="post-title">{{ post.postTitle }}</div>
            <div class="post-description">{{ post.postContent }}</div>
            <div class="post-meta">
              <van-icon name="like-o" class="meta-icon"/>
              <span class="meta-number">{{ post.likeNum }}</span>
              <van-icon name="chat-o" class="meta-icon"/>
              <span class="meta-number">{{ post.commentNum }}</span>
              <van-icon name="star-o" class="meta-icon"/>
              <span class="meta-number">{{ post.collectNum }}</span>
            </div>
          </div>
          <!-- 右侧图片 -->
          <img :src="(post.postPictures && post.postPictures.length > 0) ? post.postPictures[0] : defaultPicture"
               alt="帖子图片" class="post-image"/>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {useRouter} from 'vue-router';
import axios from '../../api/axios.ts'
import { onMounted } from 'vue';

const posts = ref([]); // 帖子列表
const current = ref(1); // 当前页码
const pageSize = 10; // 每页帖子数量
const loading = ref(false); // 是否正在加载
const finished = ref(false); // 是否加载完成
const activeTab = ref(0); // 当前选中的选项卡，0=最热，1=最新
const router = useRouter();
const defaultPicture = "https://gitee.com/Code_for_love/images/raw/master/-6696978110499230174test.png";

// 根据选项卡类型获取帖子类型
const postType = ref('hot'); // 当前帖子类型：最热 or 最新

// 请求接口返回的数据
const fetchPosts = async (type, current, pageSize) => {
  const pageRequest = {
    current: current,
    pageSize: pageSize,
    sortField: type
  };
  const responsePosts = await axios.post('/api/post/listHomePosts', pageRequest);
  const {data} = responsePosts;
  const {records} = data;
  // console.log(records);
  return records;

  // 下面是 mock 数据
  // await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟
  // return Array.from({length: pageSize}, (_, index) => {
  //   const id = (current - 1) * pageSize + index + 1;
  //   return {
  //     id,
  //     title: `${type === 'hot' ? '最热' : '最新'}帖子标题 ${id}`,
  //     description: `这是帖子内容描述 ${id}，这是示例文字，非常非常长，足够长到需要省略...`,
  //     image: `https://picsum.photos/100/100?random=${id}`,
  //     likes: Math.floor(Math.random() * 1000), // 点赞数
  //     comments: Math.floor(Math.random() * 500), // 评论数
  //     favorites: Math.floor(Math.random() * 300), // 收藏数
  //   };
  // });
};

// 加载更多数据
const onLoad = async () => {
  // 如果已经在加载中，则不触发请求
  if (loading.value) return;

  loading.value = true; // 开始加载

  try {
    const newPosts = await fetchPosts(postType.value, current.value, pageSize);

    if (newPosts.length === 0) {
      finished.value = true; // 停止加载
    } else {
      posts.value.push(...newPosts); // 追加新数据
      console.log(posts.value)
      current.value++;
    }
  } catch (error) {
    console.error('加载数据失败', error);
  } finally {
    loading.value = false; // 请求完成，恢复加载状态
  }
};

onMounted(() => {
  onLoad(); // 页面初次加载时调用 onLoad
});


// 切换选项卡时重新加载数据
watch(activeTab, (newVal) => {
  console.log("选项卡切换:", newVal);
  postType.value = newVal === 0 ? 'hot' : 'new';
  current.value = 1;
  posts.value = [];
  finished.value = false;
  onLoad();
});

// 跳转到帖子详情页
const goToPost = (id) => {
  router.push(`/post/${id}`);
};
</script>

<style scoped>
/* 整个页面样式 */
.home-page {
  padding: 0; /* 移除父容器的内边距 */
  margin: 0; /* 移除可能的外边距 */
}

/* 选项卡容器样式 */
.tabs-container {
  display: flex;
  justify-content: flex-start; /* 左对齐 */
  padding-left: 10px;
  background-color: #fff;
}

/* 自定义选项卡样式 */
.custom-tabs {
  width: auto; /* 不占满一行 */
}

.custom-tabs .van-tab {
  min-width: 60px; /* 调整每个 tab 的宽度 */
  padding: 5px 10px; /* 内边距调整，让 tab 更紧凑 */
  font-size: 12px; /* 缩小字体大小 */
}

.custom-tabs .van-tabs__line {
  height: 2px; /* 下划线的高度 */
}

.custom-tabs .van-tab--active {
  color: #07c160; /* 选中状态的文字颜色 */
}

/* 单个帖子容器 */
.post-item {
  display: flex;
  align-items: center;
  width: 100%; /* 占满屏幕 */
  margin: 0; /* 移除上下间距 */
  padding: 0; /* 移除内边距 */
  background-color: #f9f9f9; /* 浅灰色背景 */
  border-bottom: 1px solid #eee; /* 细分隔线 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
  box-sizing: border-box; /* 确保内容区域包括边框和内边距 */
}

/* 帖子内容部分 */
.post-content {
  display: flex;
  width: 100%;
}

/* 左侧文字部分 */
.post-text {
  flex: 1;
  padding: 10px; /* 给文字内容一些内边距 */
  overflow: hidden; /* 防止文字溢出影响布局 */
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
  margin-right: 16px; /* 间隔 */
}

/* 右侧图片部分 */
.post-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover; /* 保证图片填满框并保持比例 */
  margin-left: 10px; /* 与文字部分保持距离 */
  flex-shrink: 0; /* 防止图片因文字过长被压缩 */
}
</style>