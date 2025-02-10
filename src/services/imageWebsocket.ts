// src/services/websocket.ts
import { ref } from 'vue';

const socket = ref<WebSocket | null>(null);

// 创建一个 Promise 用于等待 WebSocket 返回结果
const initWebSocket = (sessionId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        // 确认 WebSocket URL 是否正确
        socket.value = new WebSocket('ws://192.168.1.2:8100/api/post/ws/upload');

        socket.value.onopen = () => {
            console.log('WebSocket 连接已建立');
            // 发送 sessionId 给后端，以便后端识别会话
            socket.value?.send(sessionId);
        };

        socket.value.onmessage = (event) => {
            console.log('收到 WebSocket 消息:', event.data);
            resolve(event.data); // 返回结果
            // 关闭 WebSocket 连接（根据需求，可以选择是否关闭）
            socket.value?.close();
        };

        socket.value.onerror = (error) => {
            console.error('WebSocket 出现错误:', error);
            reject(error);
        };

        socket.value.onclose = (event) => {
            if (!event.wasClean) {
                console.warn('WebSocket 非正常关闭:', event);
            }
            console.log('WebSocket 连接已关闭');
        };
    });
};

export { initWebSocket };
