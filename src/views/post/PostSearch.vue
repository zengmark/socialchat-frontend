<template>
  <div class="search-page">
    <van-nav-bar title="搜索" left-arrow @click-left="goBack" />

    <!-- 搜索输入框 -->
    <van-search v-model="searchQuery" show-action placeholder="请输入搜索关键词" @search="handleSearch">
      <template #action>
        <van-button type="primary" size="small" @click="handleSearch">搜索</van-button>
      </template>
    </van-search>

    <!-- 热门搜索词 -->
<!--    <div class="hot-search">-->
<!--      <div class="title">热门搜索</div>-->
<!--      <div class="tags">-->
<!--        <van-tag v-for="(tag, index) in hotSearches" :key="index" @click="selectHotSearch(tag)">-->
<!--          {{ tag }}-->
<!--        </van-tag>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const searchQuery = ref(''); // 搜索输入
const hotSearches = ref(['Vue3', '前端开发', 'JavaScript', 'Node.js', '人工智能']); // 热门搜索词

// 点击搜索按钮，跳转到搜索结果页面
const handleSearch = () => {
  if (!searchQuery.value.trim()) {
    return;
  }
  router.push({ path: '/searchResult', query: { query: searchQuery.value } });
};

// 选中热门搜索
const selectHotSearch = (tag) => {
  searchQuery.value = tag;
  handleSearch();
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.search-page {
  padding: 10px;
}

/* 热门搜索 */
.hot-search {
  margin-top: 20px;
}

.hot-search .title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.van-tag {
  cursor: pointer;
  padding: 5px 10px;
}
</style>
