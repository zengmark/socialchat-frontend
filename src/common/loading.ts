// src/composables/loading.ts
import { ref } from 'vue';

// 全局加载状态
export const isLoading = ref(false);

// 控制加载状态的方法
export const setLoading = (state: boolean) => {
    isLoading.value = state;
};