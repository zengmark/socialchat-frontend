<template>
  <div class="post-create-page">
    <!-- 顶部导航栏 -->
    <van-nav-bar
        title="发布帖子"
        left-arrow
        @click-left="goBack"
        class="custom-nav-bar"
    />

    <!-- 上传图片 -->
    <div class="section upload-section">
      <h3 class="section-title">上传图片</h3>
      <van-uploader
          v-model="images"
          multiple
          :max-count="9"
          :preview-size="100"
          :after-read="handleAfterRead"
          @delete="deleteImage"
      />
      <p v-if="images.length === 0" class="error-text">请至少上传一张图片</p>
    </div>

    <!-- 文字内容 -->
    <div class="section text-section">
      <h3 class="section-title">文字内容</h3>
      <van-field
          v-model="form.title"
          label="标题"
          placeholder="请输入标题"
          required
          class="custom-field"
      />
      <p v-if="!form.title" class="error-text">标题为必填项</p>
      <van-field
          v-model="form.content"
          type="textarea"
          rows="5"
          label="内容"
          placeholder="请输入内容"
          class="custom-field"
      />
      <p v-if="!form.content" class="error-text">内容为必填项</p>
    </div>

    <!-- 功能选项 -->
    <div class="section features-section">
      <h3 class="section-title">功能项</h3>
      <van-cell title="投票" is-link @click="toggleVoteModal" />
      <van-cell title="@用户" is-link @click="toggleMentionModal" />
      <div class="visibility-switch">
        <span>是否公开可见</span>
        <van-switch v-model="form.isPublic" size="20px" />
      </div>
    </div>

    <!-- 发布/存草稿 -->
    <div class="fixed-footer">
      <van-button type="default" block @click="saveDraft">存草稿</van-button>
      <van-button type="primary" block @click="submitPost">发布帖子</van-button>
    </div>

    <!-- 投票弹框 -->
    <van-popup v-model:show="showVoteModal" position="bottom" class="vote-popup">
      <div class="vote-popup-content">
        <van-field
            v-model="vote.title"
            label="投票标题"
            placeholder="请输入投票标题"
            class="custom-field"
        />
        <div v-for="(option, index) in vote.options" :key="index" class="vote-option">
          <van-field
              v-model="vote.options[index]"
              placeholder="请输入选项内容"
              class="custom-field"
          />
          <van-icon
              name="delete"
              class="delete-icon"
              @click="deleteVoteOption(index)"
          />
        </div>
        <van-button type="primary" size="small" @click="addVoteOption">
          添加选项
        </van-button>
        <van-button type="default" size="small" @click="closeVoteModal">
          完成
        </van-button>
      </div>
    </van-popup>

    <!-- @用户弹框 -->
    <van-popup v-model:show="showMentionModal" position="bottom" class="mention-popup">
      <div class="mention-popup-content">
        <van-field
            v-model="searchQuery"
            placeholder="请输入用户名"
            clearable
            @input="searchUsers"
        />
        <div v-if="searchResults.length > 0">
          <van-cell
              v-for="user in searchResults"
              :key="user.id"
              :title="user.name"
              @click="mentionUser(user)"
          />
        </div>
        <div v-else class="no-results">
          未找到相关用户
        </div>
        <van-button type="default" block @click="closeMentionModal">完成</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { showToast } from 'vant';
import { useRouter } from 'vue-router';

// 路由
const router = useRouter();

// 表单数据
const form = ref({
  title: '',
  content: '',
  isPublic: true,
});

// 图片数据
const images = ref([]);

// 投票数据
const vote = ref({
  title: '',
  options: ['选项 1', '选项 2'],
});

// 搜索用户数据
const showVoteModal = ref(false);
const showMentionModal = ref(false);
const searchQuery = ref('');
const searchResults = ref([]);

// 返回上一页
const goBack = () => {
  router.back();
};

// 打开/关闭投票弹框
const toggleVoteModal = () => {
  showVoteModal.value = !showVoteModal.value;
};

// 关闭投票弹框
const closeVoteModal = () => {
  if (!vote.value.title || vote.value.options.some((o) => !o)) {
    showToast('请完整填写投票内容');
    return;
  }
  showVoteModal.value = false;
};

// 添加投票选项
const addVoteOption = () => {
  if (vote.value.options.length >= 10) {
    showToast('最多只能添加 10 个选项');
    return;
  }
  vote.value.options.push(`选项 ${vote.value.options.length + 1}`);
};

// 删除投票选项
const deleteVoteOption = (index) => {
  if (vote.value.options.length > 2) {
    vote.value.options.splice(index, 1);
  } else {
    showToast('投票至少需要两个选项');
  }
};

// 打开/关闭@用户弹框
const toggleMentionModal = () => {
  showMentionModal.value = !showMentionModal.value;
};

// 关闭@用户弹框
const closeMentionModal = () => {
  showMentionModal.value = false;
};

// 搜索用户
const searchUsers = () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }
  // 模拟搜索结果
  searchResults.value = Array.from({ length: 5 }, (_, index) => ({
    id: index + 1,
    name: `用户 ${searchQuery.value} ${index + 1}`,
  }));
};

// 选择@用户
const mentionUser = (user) => {
  form.value.content += ` @${user.name} `;
  closeMentionModal();
};

// 上传图片
const handleAfterRead = (file) => {
  if (images.value.length >= 9) {
    showToast('最多上传 9 张图片');
    return;
  }
  images.value.push(file);
};

// 删除图片
const deleteImage = (file) => {
  images.value = images.value.filter((image) => image !== file);
};

// 保存草稿
const saveDraft = () => {
  if (images.value.length === 0) {
    showToast('请至少上传一张图片');
    return;
  }
  showToast('草稿已保存');
};

// 发布帖子
const submitPost = () => {
  if (!form.value.title || !form.value.content || images.value.length === 0) {
    showToast('请填写完整的帖子内容并上传至少一张图片');
    return;
  }
  showToast('帖子发布成功');
};
</script>

<style scoped>
.post-create-page {
  padding: 16px;
  background-color: #f9f9f9;
  padding-bottom: 100px;
}

.custom-nav-bar {
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.section {
  margin-bottom: 16px;
  background-color: #fff;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 12px;
}

.visibility-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 92%;
  background-color: #fff;
  padding: 10px 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.mention-popup-content {
  padding: 16px;
}

.no-results {
  text-align: center;
  color: #999;
  margin: 16px 0;
}
</style>