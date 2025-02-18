<template>
  <router-view/>
</template>

<style scoped>
/* 居中加载动画 */
.loading-overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
}
</style>
<script setup>
import {onMounted} from "vue";
import {useSseStore} from "./stores/sse.ts";
import {useUserStore} from "./stores/user.ts";

const userStore = useUserStore();
const sseStore = useSseStore();

const initSSE = async () => {
  const userInfo = await userStore.getUserInfo();
  console.log("初始化SSE", userInfo)
  const isLogin = userStore.isLoggedIn;
  if (!isLogin) {
    return;
  }
  sseStore.initSse(userInfo.id);
}

onMounted(() =>{
  initSSE();
})
</script>