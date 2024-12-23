<template>
  <div class="page-background">
    <div class="register-container">
      <h1 class="title">注册</h1>
      <van-form @submit="onSubmit" @failed="onFailed">
        <!-- 账号输入框 -->
        <van-field
            v-model="form.userAccount"
            label="账号"
            name="userAccount"
            placeholder="请输入账号"
            required
            class="custom-field"
        />

        <!-- 密码输入框 -->
        <van-field
            v-model="form.userPassword"
            type="password"
            label="密码"
            name="userPassword"
            placeholder="请输入密码"
            required
            class="custom-field"
        />

        <!-- 确认密码输入框 -->
        <van-field
            v-model="form.confirmUserPassword"
            type="password"
            label="确认密码"
            name="confirmUserPassword"
            placeholder="请再次输入密码"
            required
            class="custom-field"
            :rules="[{ validator: validatePassword, message: '两次密码不一致' }]"
        />

        <!-- 邮箱输入框 -->
        <van-field
            v-model="form.userEmail"
            label="邮箱"
            name="userEmail"
            placeholder="请输入邮箱"
            required
            class="custom-field"
            :rules="[{ validator: validateEmail, message: '邮箱格式不正确' }]"
        />

        <!-- 验证码输入框 -->
        <van-field
            v-model="form.verifyCode"
            label="验证码"
            name="verifyCode"
            placeholder="请输入验证码"
            required
            class="custom-field"
        >
          <template #button>
            <van-button size="small" @click="getVerifyCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>

        <!-- 按钮 -->
        <div class="button-group">
          <van-button type="default" @click="goToLogin">返回登录</van-button>
          <van-button type="primary" native-type="submit">确认注册</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue';
import {showToast} from "vant";
import axios from '../../api/axios.ts'
import {useRouter} from "vue-router";

const form = ref({
  userAccount: '',
  userPassword: '',
  confirmUserPassword: '',
  userEmail: '',
  verifyCode: '',
});

const countdown = ref(0); // 验证码倒计时

const router = useRouter();

// 验证两次密码是否一致
const validatePassword = () => {
  return form.value.userPassword === form.value.confirmUserPassword;
};

// 验证是否为邮箱
const validateEmail = (value: string): boolean => {
  // 使用正则表达式校验邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// 获取验证码
const getVerifyCode = async () => {
  if (countdown.value > 0) return;

  const {confirmUserPassword, ...verifyCodeRequest} = form.value;
  try {
    const resp = await axios.post('/api/user/getVerifyCode', verifyCodeRequest);
    if (resp.data === true) {
      showToast('验证码已发送');
      countdown.value = 60;

      // 模拟倒计时
      const timer = setInterval(() => {
        countdown.value -= 1;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    } else {
      showToast('验证码发送失败');
    }
  } catch (error) {
    console.log("验证码获取失败", error);
    showToast('验证码发送失败');
  }
};

// 表单提交事件
const onSubmit = async (values: typeof form.value) => {
  const {confirmUserPassword, ...userRegisterRequest} = values;
  try {
    const resp = await axios.post('/api/user/register', userRegisterRequest);
    if (resp.data == true) {
      showToast('注册成功！');
      router.push('/login')
    } else {
      showToast('注册新用户失败，服务暂时不可用');
    }
  } catch (error: any) {
    console.log("注册失败", error);
    showToast('注册失败，' + error?.description)
  }
};

// 表单提交失败
const onFailed = (error: any) => {
  console.log('注册表单提交失败:', error);
  showToast('请完善注册信息！');
};

// 返回登录页
const goToLogin = () => {
  router.push('/login');
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
  padding: 40px 16px; /* 防止内容直接贴到边缘 */
  box-sizing: border-box; /* 包含 padding */
}

/* 注册容器，调整为响应式高度 */
.register-container {
  max-width: 400px;
  width: 90%; /* 适配小屏幕 */
  max-height: 90vh; /* 限制最大高度为视口的 90% */
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.7); /* 半透明背景 */
  border-radius: 16px;
  text-align: center;
  overflow-y: auto; /* 超出高度时允许滚动 */
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
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 16px;
}

.button-group .van-button {
  font-size: 14px;
  flex: 1;
}
</style>