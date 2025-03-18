<template>
  <div>
    <van-button @click="connect">连接</van-button>
    <van-field v-model="message" placeholder="请输入消息" />
    <van-button @click="sendMessage">发送</van-button>
    <div v-for="msg in messages" :key="msg">{{ msg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const message = ref('');
const messages = ref([]);
let socket = null;

const connect = () => {
  // Replace with your backend WebSocket URL
  socket = new WebSocket('ws://192.168.1.149:8100/api/post/ws/chat');
  socket.onopen = () => {
    console.log('连接成功');
  };
  socket.onmessage = (event) => {
    messages.value.push(event.data);
  };
  socket.onclose = () => {
    console.log('连接关闭');
  };
};

const sendMessage = () => {
  if (message.value && socket && socket.readyState === WebSocket.OPEN) {
    // Send message in format: "type:message:receiverId"
    const messageType = 'single'; // or 'group' based on your logic
    const receiverId = '123'; // Replace with the appropriate receiver ID or roomId
    socket.send(`${messageType}:${message.value}:${receiverId}`);
    message.value = '';
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
