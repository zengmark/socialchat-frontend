import axios from 'axios';
import {showToast} from 'vant';
// import router from "../router/router.ts";

// 创建 axios 实例
const instance = axios.create({
    baseURL: 'http://192.168.1.166:8100', // 基础 URL
    timeout: 10000, // 请求超时时间
    withCredentials: true
});

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        // 请求错误处理
        showToast('请求发送失败');
        return Promise.reject(error);
    }
);

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    const {data} = response;
    if(response.status !== 200 || data.code !== 0) {
        showToast(data.message || '请求失败');
        return Promise.reject(data);
    }
    return data;
}, function (error) {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    showToast(error);
    return Promise.reject(error);
});

// 响应拦截器
// instance.interceptors.response.use(
//     (response) => {
//         // 响应数据处理
//         const { data } = response;
//         if (data.code !== 200) {
//             showToast(data.message || '请求失败');
//             return Promise.reject(data);
//         }
//         return data; // 返回实际数据
//     },
//     (error) => {
//         // 响应错误处理
//         if (error.response) {
//             const { status } = error.response;
//             if (status === 401) {
//                 showToast('登录已过期，请重新登录');
//                 router.push('/login'); // 跳转到登录页面
//             } else if (status === 500) {
//                 showToast('服务器错误，请稍后重试');
//             } else {
//                 showToast(error.response.data.message || '请求失败');
//             }
//         } else if (error.request) {
//             showToast('网络错误，请检查网络连接');
//         } else {
//             showToast(`请求出错：${error.message}`);
//         }
//         return Promise.reject(error);
//     }
// );

export default instance;