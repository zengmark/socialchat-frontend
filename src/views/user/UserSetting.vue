<template>
  <div class="settings-page">
    <!-- 返回按钮 -->
    <van-nav-bar
        title="设置"
        left-text="返回"
        left-arrow
        @click-left="goBack"
    />

    <!-- 功能项列表 -->
    <van-cell-group inset>
      <van-cell
          title="注销用户"
          icon="warning-o"
          is-link
          @click="confirmLogout"
      />
      <van-cell
          title="更多"
          icon="ellipsis"
          is-link
          @click="showComingSoon"
      />
    </van-cell-group>

    <!-- 注销确认弹窗 -->
    <van-dialog
        v-model:show="showLogoutDialog"
        title="确认注销"
        show-cancel-button
        @confirm="logout"
        @cancel="cancelLogout"
    >
      注销后需要重新登录，您确定要注销吗？
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { showToast } from 'vant';
import { useUserStore } from '../../stores/user.ts';
import axios from '../../api/axios.ts'

const router = useRouter();
const userStore = useUserStore();

const showLogoutDialog = ref(false); // 控制注销确认弹窗显示
const showComingSoonToast = ref(false); // 控制“更多”功能提示

// 返回按钮点击事件
const goBack = () => {
  router.go(-1); // 返回上一页
};

// 显示注销确认弹窗
const confirmLogout = () => {
  showLogoutDialog.value = true;
};

// 取消注销
const cancelLogout = () => {
  showLogoutDialog.value = false;
};

// 执行注销操作
const logout = async () => {
  userStore.clearUserInfo();
  await axios.post('/api/user/deleteUser');
  showToast('注销成功');
  router.push('/'); // 返回登录页面
  showLogoutDialog.value = false;
};

// 显示“更多”功能提示
const showComingSoon = () => {
  showToast('暂未上线，敬请期待');
};
</script>

<style scoped>
.settings-page {
  padding: 20px;
}

/* 返回按钮 */
.van-nav-bar {
  background-color: #f8f8f8;
}

/* 功能项列表 */
.van-cell-group {
  margin-top: 20px;
}

/* 注销确认弹窗 */
.van-dialog {
  width: 80%;
  max-width: 400px;
}
</style>
