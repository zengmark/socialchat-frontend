import {defineStore} from 'pinia';
import axios from '../api/axios';
import {getToken, removeToken} from '../utils/auth';
import {useRouter} from "vue-router";

const router = useRouter();

export const useUserStore = defineStore('user', {
    state: () => ({
        userInfo: null, // 存储用户信息
    }),
    getters: {
        isLoggedIn: (state) => !!state.userInfo,
    },
    actions: {
        // 设置用户信息
        setUserInfo(user: any) {
            this.userInfo = user;
        },
        // 清除用户信息
        clearUserInfo() {
            this.userInfo = null;
        },
        // 从后端获取用户信息
        async fetchUserInfo() {
            try {
                const resp = await axios.post('/api/user/getLoginUser'); // 替换为您的获取用户信息的 API
                const userInfo = resp.data;
                if (userInfo === null) {
                    throw new Error("获取用户信息失败");
                }
                this.setUserInfo(userInfo);
            } catch (error) {
                console.error('获取用户信息失败:', error);
                showToast("您未登录，请您登录")
                // 根据需要处理错误，例如清除 Token 并重定向到登录页
                removeToken();
                this.clearUserInfo();
                // 这里假设您使用 Vue Router
                router.push('/login');
            }
        },
        // 获取用户信息（优先从 Pinia，若无则从后端获取）
        async getUserInfo() {
            if (this.userInfo) {
                return this.userInfo;
            }
            const token = getToken();
            if (token) {
                await this.fetchUserInfo();
                return this.userInfo;
            }
            return null;
        },
        // 更新用户信息
        async updateUserInfo(userUpdateRequest: any) {
            try {
                // 调用后端更新接口
                const resp = await axios.post('/api/user/updateUserInfo', userUpdateRequest);
                const updateUserInfo = resp.data;
                this.setUserInfo(updateUserInfo); // 直接传入更新后的数据
                showToast('用户信息更新成功');
            } catch (error) {
                console.error('更新用户信息失败:', error);
                showToast('更新失败，请稍后再试');
            }
        },
        // 更新用户头像
        async updateUserAvatar(userUpdateAvatarRequest: any) {
            try {
                // 调用后端更新接口
                const resp = await axios.post('/api/user/updateUserAvatar', userUpdateAvatarRequest);
                const updateUserInfo = resp.data;
                this.setUserInfo(updateUserInfo); // 直接传入更新后的数据
                showToast('用户信息更新成功');
            } catch (error) {
                console.error('更新用户信息失败:', error);
                showToast('更新失败，请稍后再试');
            }
        },
    },
});
