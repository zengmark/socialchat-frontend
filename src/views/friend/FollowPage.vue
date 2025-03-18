<template>
  <div class="friend-page">
    <!-- 顶部Tab区域，带阴影和白色背景 -->
    <div class="tab-header">
      <van-tabs v-model:active="activeTab" @change="handleTabChange" sticky>
        <van-tab name="follow">
          <template #title>
            <div class="custom-tab" :style="tabStyle('follow')">
              关注<span v-if="activeTab==='follow'">（{{ followCount }}）</span>
            </div>
          </template>
        </van-tab>
        <van-tab name="fans">
          <template #title>
            <div class="custom-tab" :style="tabStyle('fans')">
              粉丝<span v-if="activeTab==='fans'">（{{ fansCount }}）</span>
            </div>
          </template>
        </van-tab>
      </van-tabs>
    </div>

    <!-- 用 transition 包裹朋友列表，实现平滑滑动动画 -->
    <transition name="slide" mode="out-in">
      <div :key="activeTab">
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
              @click="selectFriend(friend)"
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
            </div>
            <!-- 按钮点击时阻止事件冒泡 -->
            <div class="friend-action" @click.stop>
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
    </transition>

    <!-- 用户详情弹窗 -->
    <van-popup v-model:show="showDetailModal" position="center" closeable>
      <div class="friend-detail-card" v-if="selectedFriend">
        <div class="detail-header">
          <van-image
              :src="selectedFriend.userAvatar"
              width="60px"
              height="60px"
              round
          />
          <div class="detail-info">
            <div class="friend-name">{{ selectedFriend.userName }}</div>
            <div class="friend-intro">{{ friendDetailIntro }}</div>
          </div>
        </div>
        <div class="detail-actions">
          <van-button
              :class="{'follow-btn': !selectedFriend.isFollow, 'followed-btn': selectedFriend.isFollow}"
              size="small"
              @click="toggleFollowDetail"
          >
            {{ selectedFriend.isFollow ? '已关注' : '关注' }}
          </van-button>
          <van-button type="primary" size="small" @click="chatFriend">
            聊天
          </van-button>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { showToast } from 'vant';
import axios from '../../api/axios.ts';
import { useUserStore } from '../../stores/user.ts';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('follow'); // 当前 tab：'follow' 或 'fans'
const friendList = ref([]);        // 数据列表
const loading = ref(false);        // 加载状态
const finished = ref(false);       // 是否加载完所有数据
const page = ref(1);               // 当前页码
const pageSize = 10;               // 每页数量

// 分别统计关注和粉丝数量
const followCount = ref(0);
const fansCount = ref(0);

const userStore = useUserStore();

// 定义 tab 样式函数：设置宽度与最小宽度，过渡效果已在 CSS 中声明
const tabStyle = (tabName) => {
  return {
    width: activeTab.value === tabName ? '75%' : '25%',
    minWidth: '80px'
  };
};

// 加载数据，根据当前 tab 调用不同接口
const loadFriends = async () => {
  if (loading.value || finished.value) return;
  loading.value = true;
  const apiEndpoint =
      activeTab.value === 'follow'
          ? '/api/friend/listFollowers'
          : '/api/friend/listFans';
  try {
    const response = await axios.post(apiEndpoint, {
      current: page.value,
      pageSize: pageSize,
      sortField: ''
    });
    const records = response.data.records || [];
    if (activeTab.value === 'follow') {
      followCount.value = response.data.total;
    } else {
      fansCount.value = response.data.total;
    }
    if (records.length < pageSize) {
      finished.value = true;
    }
    friendList.value.push(...records);
    page.value++;
  } catch (error) {
    console.error(error);
    showToast('加载数据失败');
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

// 切换 tab 时，重置分页和数据列表
const handleTabChange = (newTab) => {
  page.value = 1;
  friendList.value = [];
  finished.value = false;
  loadFriends();
};

// 点击用户卡片，展示详情弹窗（不再跳转页面）
const selectedFriend = ref(null);
const showDetailModal = ref(false);
const selectFriend = (friend) => {
  selectedFriend.value = friend;
  showDetailModal.value = true;
};

// 详情弹窗中，若简介为空则显示默认文案
const friendDetailIntro = computed(() => {
  return selectedFriend.value &&
  selectedFriend.value.intro &&
  selectedFriend.value.intro.trim() !== ''
      ? selectedFriend.value.intro
      : '这个用户很懒，还没有简介~';
});

// 切换关注/取消关注逻辑（列表中使用）
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
    friend.isFollow = !friend.isFollow;
    showToast(friend.isFollow ? '关注成功' : '取消关注成功');
  } catch (error) {
    console.error(error);
    showToast('操作失败，请稍后再试');
  }
};

// 详情弹窗中的关注/取消关注逻辑
const toggleFollowDetail = async () => {
  if (!selectedFriend.value) return;
  try {
    const userInfo = await userStore.getUserInfo();
    let action = selectedFriend.value.isFollow ? 1 : 0;
    const friendAddRequest = {
      followerId: userInfo.id,
      followedId: selectedFriend.value.userId,
      action: action
    };
    await axios.post('/api/friend/follow', friendAddRequest);
    selectedFriend.value.isFollow = !selectedFriend.value.isFollow;
    showToast(selectedFriend.value.isFollow ? '关注成功' : '取消关注成功');
  } catch (error) {
    console.error(error);
    showToast('操作失败，请稍后再试');
  }
};

// 聊天功能：点击后跳转到聊天页面
const chatFriend = async () => {
  if (!selectedFriend.value) return;
  const userInfo = await userStore.getUserInfo();
  const userId = userInfo.id;
  const receiverId = selectedFriend.value.userId;
  let singleRoomId = userId < receiverId
      ? Number(`${userId}${receiverId}`)
      : Number(`${receiverId}${userId}`);
  router.push(`/chat/${singleRoomId}`);
};
</script>

<style scoped>
.friend-page {
  background-color: #f7f8fa;
  min-height: 100vh;
}

/* Tab区域 */
.tab-header {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 自定义 Tab 样式 */
.custom-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  font-size: 16px;
  color: #333;
  transition: width 0.5s ease;
}

/* 朋友卡片 */
.friend-card {
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  margin: 8px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.friend-card:hover {
  transform: translateY(-2px);
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

.friend-action {
  margin-left: auto;
}

/* 按钮样式 */
.follow-btn {
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: all 0.2s;
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.followed-btn {
  background-color: #e0e0e0;
  color: #777;
  border: none;
  border-radius: 20px;
  padding: 5px 12px;
  font-size: 14px;
  cursor: not-allowed;
}

/* 用户详情弹窗 */
.friend-detail-card {
  background-color: #fff;
  border-radius: 16px;
  padding: 16px;
  width: 280px;
  max-width: 90vw;
  margin: auto;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.detail-info {
  flex: 1;
}

.detail-info .friend-name {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.friend-intro {
  font-size: 14px;
  color: #777;
  line-height: 1.4;
}

.detail-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
}

.detail-actions .van-button {
  flex: 1;
  margin: 0 4px;
  padding: 6px 0;
  font-size: 14px;
  border-radius: 20px;
}

/* 小屏幕响应式 */
@media (max-width: 360px) {
  .friend-detail-card {
    width: 90vw;
    padding: 12px;
  }
  .detail-info .friend-name {
    font-size: 18px;
  }
  .friend-intro {
    font-size: 13px;
  }
}

/* 切换 tab 时的滑动动画 */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}
.slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.slide-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
