<template>
  <div class="friend-page">
    <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
    >
      <div
          v-for="friend in friendList"
          :key="friend.id"
          class="friend-card"
      >
        <div class="friend-avatar">
          <van-image
              :src="friend.userAvatar"
              width="50px"
              height="50px"
              fit="cover"
              round
          />
        </div>
        <div class="friend-info">
          <div class="friend-name">{{ friend.userName }}</div>
<!--          <div class="friend-profile">{{ friend.userProfile }}</div>-->
        </div>
        <div class="friend-action">
          <van-button
              :class="{'follow-btn': !friend.isFollow, 'followed-btn': friend.isFollow}"
              size="small"
              @click.stop="toggleFollow(friend)"
          >
            {{ friend.isFollow ? '已关注' : '关注' }}
          </van-button>
        </div>
      </div>
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { showToast } from 'vant';
import axios from '../../api/axios.ts';
import { useUserStore } from "../../stores/user.ts";

const friendList = ref([]); // 好友列表数据
const loading = ref(false); // 加载状态
const finished = ref(false); // 是否加载完所有数据
const page = ref(1); // 当前页码
const pageSize = 10; // 每页数量

const userStore = useUserStore();

// 加载朋友数据（增加 guard 判断，避免重复请求）
const loadFriends = async () => {
  if (loading.value || finished.value) return; // 已经在加载或加载完成时，直接返回
  loading.value = true;
  try {
    const response = await axios.post('/api/friend/listFriends', {
      current: page.value,
      pageSize: pageSize,
      sortField: ''
    });
    const records = response.data.records || [];
    if (records.length < pageSize) {
      finished.value = true;
    }
    friendList.value.push(...records);
    page.value++;
  } catch (error) {
    console.error(error);
    showToast('加载朋友列表失败');
  } finally {
    loading.value = false;
  }
};

const onLoad = async () => {
  await loadFriends();
};

onMounted(() => {
  loadFriends();
});

// 切换关注/取消关注的逻辑
const toggleFollow = async (friend) => {
  try {
    const userInfo = await userStore.getUserInfo();
    let action = friend.isFollow ? 1 : 0;
    const friendAddRequest = {
      followerId: userInfo.id,
      followedId: friend.userId,
      action: action
    };
    await axios.post('/api/friend/follow', friendAddRequest);
    if (friend.isFollow) {
      friend.isFollow = false;
      showToast('取消关注成功');
    } else {
      friend.isFollow = true;
      showToast('关注成功');
    }
  } catch (error) {
    console.error(error);
    showToast('操作失败，请稍后再试');
  }
};
</script>

<style scoped>
.friend-page {
  padding: 16px;
  background-color: #f0f2f5;
  min-height: 100vh;
}

.friend-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 12px;
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.friend-avatar {
  flex-shrink: 0;
}

.friend-info {
  flex: 1;
  margin-left: 12px;
}

.friend-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.friend-profile {
  font-size: 14px;
  color: #777;
  margin-top: 4px;
}

.friend-action {
  margin-left: auto;
}

/* 关注按钮的样式 */
.follow-btn {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

/* 已关注按钮的样式 */
.followed-btn {
  background-color: #eee;
  color: #999;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  cursor: not-allowed;
}
</style>
