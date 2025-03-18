// stores/sse.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSseStore = defineStore('sse', () => {
    // const eventSource = ref(null);
    const isConnected = ref(false);
    const unreadMessagesCount = ref(0); // 全局未读消息计数

    // 初始化 SSE 连接
    const initSse = (userId) => {
        // if (eventSource.value) {
        //     return; // 防止重复连接
        // }
        console.log('建立 SSE 连接', userId);
        const eventSource = new EventSource(`http://192.168.1.149:8100/api/like_collect/sse/stream/${userId}`);

        eventSource.onopen = () => {
            isConnected.value = true;
            console.log('SSE connection opened');
        };

        eventSource.onmessage = (event) => {
            console.log('Received message:', event.data);
            // 处理消息，比如更新状态、显示通知等
        };

        eventSource.addEventListener('notification', (event) => {
            console.log('Received notification event:', event.data);
            unreadMessagesCount.value = event.data;
        });


        eventSource.onerror = (error) => {
            isConnected.value = false;
            console.error('SSE connection error:', error);
        };
    };

    const initMessageCount = (messageCount: any) => {
        unreadMessagesCount.value = messageCount;
    }

    // 关闭 SSE 连接
    // const closeSse = () => {
    //     if (eventSource.value) {
    //         eventSource.value.close();
    //         isConnected.value = false;
    //         console.log('SSE connection closed');
    //     }
    // };

    return {
        // eventSource,
        // isConnected,
        initSse,
        initMessageCount,
        unreadMessagesCount,
        // closeSse,
    };
});
