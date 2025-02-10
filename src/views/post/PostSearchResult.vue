<template>
  <div class="search-results">
    <!-- 导航栏 -->
    <van-nav-bar title="搜索结果" left-arrow @click-left="goBack">
      <template #right>
        <!-- 右上角搜索框 -->
        <van-search v-model="searchQuery" placeholder="请输入搜索关键词" @search="handleSearch"/>
      </template>
    </van-nav-bar>

    <!-- 标签项 -->
    <div class="tags-container">
      <div class="tags-list">
        <van-tag
            v-for="(tag, index) in tags"
            :key="tag.tagId"
            :class="{'selected-tag': selectedTags.includes(tag.tagName)}"
            @click="toggleTag(tag.tagName)"
            class="tag-item"
        >
          {{ tag.tagName }}
        </van-tag>
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="tabs-container">
      <van-tabs v-model:active="activeTab" class="custom-tabs" type="line">
        <van-tab title="最热" />
        <van-tab title="最新" />
      </van-tabs>
    </div>

    <!-- 搜索结果列表 -->
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
import {ref, onMounted} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import axios from '../../api/axios.ts';

const route = useRoute();
const router = useRouter();
const searchQuery = ref(route.query.query || ''); // 获取搜索关键词
const posts = ref([]); // 搜索结果帖子列表
const loading = ref(false);
const finished = ref(false);
const current = ref(1);
const pageSize = 10;
const defaultPicture = "https://gitee.com/Code_for_love/images/raw/master/-6696978110499230174test.png";

// 标签列表
const tags = ref([]);
const selectedTags = ref([]); // 被选择的标签

// 选项卡当前选中
const activeTab = ref(0); // 0=最热，1=最新

// 请求接口返回的数据
const fetchPosts = async (searchWord, tagList, current, pageSize, sortType) => {
  const postSearchRequest = {
    current: current,
    pageSize: pageSize,
    sortField: sortType,  // 根据选项卡选择排序字段
    searchWord: searchWord,
    tagList: tagList,
  };
  const responsePosts = await axios.post('/api/post/listSearchPosts', postSearchRequest);
  return responsePosts.data.records;
};

// 加载搜索结果
const onLoad = async () => {
  if (loading.value) return;

  loading.value = true;
  const sortField = activeTab.value === 0 ? 'hot' : 'new'; // 根据选项卡选择排序字段
  try {
    const newPosts = await fetchPosts(searchQuery.value, selectedTags.value, current.value, pageSize, sortField);
    if (newPosts.length === 0) {
      finished.value = true;
    } else {
      posts.value.push(...newPosts);
      current.value++;
    }
  } catch (error) {
    console.error('加载数据失败', error);
  } finally {
    loading.value = false;
  }
};

// 加载标签列表
const onLoadTags = async () => {
  try {
    const resp = await axios.post('/api/post/listTagList');
    const tagList = resp.data;
    console.log(tagList);
    tags.value = tagList;
  } catch (e) {
    console.error(e);
  }
};

onMounted(() => {
  onLoadTags();
  onLoad();
});

// 跳转到帖子详情页
const goToPost = (id) => {
  router.push(`/post/${id}`);
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 处理搜索
const handleSearch = () => {
  posts.value = [];
  current.value = 1;
  finished.value = false;
  router.push({ path: '/searchResult', query: { query: searchQuery.value } });
  onLoad();
};

// 切换标签
const toggleTag = (tag) => {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter(t => t !== tag);
  } else {
    selectedTags.value.push(tag);
  }
  current.value = 1;
  posts.value = [];
  finished.value = false;
  onLoad();
};
</script>

<style scoped>
.search-results {
  padding: 10px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

/* 基础标签样式 */
.tag-item {
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 20px;
  transition: background-color 0.3s, color 0.3s;
  cursor: pointer;
  background-color: #f0f0f0; /* 默认灰色背景 */
  color: #333;
}

/* 选中的标签 */
.selected-tag {
  background-color: #0061f2 !important;
  color: #fff !important;
}

/* 以下为其他页面样式 */
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

.post-content {
  display: flex;
  width: 100%;
}

.post-text {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.post-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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

.post-meta {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.meta-icon {
  font-size: 18px;
  color: #888;
  margin-right: 4px;
}

.meta-number {
  font-size: 14px;
  color: #666;
  margin-right: 16px;
}

.post-image {
  width: 80px;
  height: 80px;
  border-radius: 5px;
  object-fit: cover;
  margin-left: 10px;
  flex-shrink: 0;
}
</style>
