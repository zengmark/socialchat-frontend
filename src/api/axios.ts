import axios from 'axios';
import {showToast} from 'vant';
import router from "../router/router.ts";

// 创建 axios 实例
const instance = axios.create({
    baseURL: 'https://localhost:8101', // 基础 URL
    timeout: 10000, // 请求超时时间
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        // 从本地存储中获取 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // 在请求头中添加 token
        }
        return config;
    },
    (error) => {
        // 请求错误处理
        showToast('请求发送失败');
        return Promise.reject(error);
    }
);

// 响应拦截器
instance.interceptors.response.use(
    (response) => {
        // 响应数据处理
        const { data } = response;
        if (data.code !== 200) {
            showToast(data.message || '请求失败');
            return Promise.reject(data);
        }
        return data; // 返回实际数据
    },
    (error) => {
        // 响应错误处理
        if (error.response) {
            const { status } = error.response;
            if (status === 401) {
                showToast('登录已过期，请重新登录');
                localStorage.removeItem('token');
                router.push('/login'); // 跳转到登录页面
            } else if (status === 500) {
                showToast('服务器错误，请稍后重试');
            } else {
                showToast(error.response.data.message || '请求失败');
            }
        } else if (error.request) {
            showToast('网络错误，请检查网络连接');
        } else {
            showToast(`请求出错：${error.message}`);
        }
        return Promise.reject(error);
    }
);

export default instance;