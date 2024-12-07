<template>
  <div class="page-background">
    <div class="login-container">
      <h1 class="title">登录</h1>
      <van-form @submit="onSubmit" @failed="onFailed">
        <!-- 账号输入框 -->
        <van-field
            v-model="form.username"
            label="账号"
            name="username"
            placeholder="请输入账号"
            required
            class="custom-field"
        />

        <!-- 密码输入框 -->
        <van-field
            v-model="form.password"
            type="password"
            label="密码"
            name="password"
            placeholder="请输入密码"
            required
            class="custom-field"
        />

        <!-- 登录按钮 -->
        <div class="button-group">
          <van-button type="primary" block native-type="submit">登录</van-button>
        </div>
      </van-form>

      <!-- 注册提示 -->
      <p class="register-tip">
        如果还没有账号，请创建一个
        <span class="link" @click="goToRegister">新账号</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {showToast} from "vant";

// 表单数据
const form = ref({
  username: '',
  password: '',
});

// 表单提交事件
const onSubmit = (values: typeof form.value) => {
  console.log('登录表单提交成功:', values);
  showToast('登录成功！');
};

// 表单提交失败
const onFailed = (error: any) => {
  console.log('登录表单提交失败:', error);
  showToast('请输入账号和密码！');
};

// 跳转到注册页面
const goToRegister = () => {
  showToast('跳转到注册页面');
  // 在实际项目中，可以使用 router.push('/register')
};
</script>

<style scoped>
/* 渐变背景 */
.page-background {
  background: linear-gradient(to bottom right, #36d1dc, #5b86e5);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 40px 16px;
  box-sizing: border-box;
}

/* 登录容器 */
.login-container {
  max-width: 400px;
  width: 90%; /* 适配小屏幕 */
  max-height: 90vh;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
  border-radius: 16px;
  text-align: center;
  overflow-y: auto;
}

/* 屏幕过大时，动态调整注册框位置 */
@media (min-height: 900px) {
  .register-container {
    margin-top: -100px;
    max-height: 80vh; /* 进一步减少上下空白 */
  }
}

@media (min-height: 1200px) {
  .register-container {
    margin-top: -200px;
    max-height: 70vh; /* 适应超大屏幕 */
  }
}

/* 标题样式 */
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

/* 输入框样式 */
.custom-field {
  margin-bottom: 20px;
  border-radius: 20px;
}

.van-field__control {
  padding: 8px 12px;
  font-size: 16px;
  border-radius: 8px;
  background: #f7f7f7;
}

/* 按钮组 */
.button-group {
  margin-top: 16px;
}

/* 注册提示文字样式 */
.register-tip {
  margin-top: 12px;
  font-size: 14px;
  color: #666;
}

/* 注册链接样式 */
.link {
  color: #3a8bff;
  cursor: pointer;
  text-decoration: underline;
  font-weight: bold;
}
.link:hover {
  color: #0056b3;
}
</style>