<template>
  <div class="post-container">
    <!-- 左上角的返回按钮 -->
    <div class="back-button">
      <van-icon name="arrow-left" size="24" @click="goBack" class="back-icon" />
    </div>

    <!-- 轮播图（占屏幕一半） -->
    <van-swipe class="swipe-container" :autoplay="3000" style="height: 50vh">
      <!-- 判断 post.postPictures 是否为有效数组且长度大于 0 -->
      <van-swipe-item v-for="(image, index) in (Array.isArray(post.postPictures) && post.postPictures.length > 0 ? post.postPictures : defaultImages)" :key="index">
        <img :src="image" class="swipe-image"/>
      </van-swipe-item>
    </van-swipe>

    <!-- 帖子内容 -->
    <div class="post-content">
      <h1 class="title">{{ post.postTitle || '默认标题' }}</h1>
      <div class="content">{{ post.postContent }}</div>
      <div v-if="post.userAt && post.userAt.length > 0" class="mention">@{{ post.userAt }}</div>
      <p/>
      <div class="meta">
        <span class="date">{{ formatDate(post.createTime) }}</span>
      </div>
    </div>

    <!-- 评论列表 -->
    <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoadComments"
    >
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-wrapper">
          <!-- 左侧头像 -->
          <van-image
              round
              width="40"
              height="40"
              :src="comment.userAvatar"
              class="comment-avatar"
          />

          <!-- 右侧内容 -->
          <div class="comment-content">
            <!-- 用户信息 -->
            <div class="comment-header">
              <span class="nickname">{{ comment.userName || '默认昵称' }}</span>
              <span class="comment-date">{{ formatDate(comment.createTime) }}</span>
            </div>

            <!-- 评论内容 -->
            <div class="comment-text">
              <span v-if="!comment.expanded">{{ truncatedContent(comment.commentContent) }}</span>
              <span v-else>{{ comment.commentContent }}</span>
              <van-button
                  v-if="comment.commentContent.length > 50 && !comment.expanded"
                  type="primary"
                  size="mini"
                  plain
                  @click="toggleExpand(comment)"
              >
                展开
              </van-button>
              <van-button
                  v-if="comment.expanded"
                  type="primary"
                  size="mini"
                  plain
                  @click="toggleExpand(comment)"
              >
                收起
              </van-button>
            </div>

            <!-- 主界面评论点赞 -->
            <div class="comment-actions">
              <van-icon
                  :name="comment.liked ? 'good-job' : 'good-job-o'"
                  :color="comment.liked ? 'red' : '#999'"
                  @click="toggleCommentLike(comment)"
              />
              <span class="like-count">{{ comment.likeNum }}</span>
              <van-button plain @click="handleReply(comment)">回复</van-button>

              <!-- 删除按钮，只在用户是评论的作者时显示 -->
              <van-icon
                  v-if="user && comment.userId === user.id"
                  name="delete"
                  size="20"
                  color="#999"
                  @click="deleteComment(comment)"
                  class="delete-icon"
              />
            </div>

            <!-- 子评论 -->
            <div v-if="comment.innerCommentList?.length" class="sub-comments">
              <div
                  v-for="(sub, subIndex) in comment.innerCommentList.slice(0, 2)"
                  :key="sub.id"
                  class="sub-comment"
              >
                <van-image
                    round
                    width="24"
                    height="24"
                    :src="sub.userAvatar"
                />
                <div class="sub-content">
                  <div class="sub-header">
                    <span class="sub-nickname">{{ sub.userName || '默认昵称' }}</span>
                    <span class="reply-to">回复 {{ sub.targetUserName || '默认昵称' }}</span>
                    <span class="sub-date">{{ formatDate(sub.createTime) }}</span>
                  </div>
                  <div class="sub-text">
                    <span v-if="!sub.expanded">{{ truncatedContent(sub.commentContent) }}</span>
                    <span v-else>{{ sub.commentContent }}</span>
                    <van-button
                        v-if="sub.commentContent.length > 50 && !sub.expanded"
                        type="primary"
                        size="mini"
                        plain
                        @click="toggleExpand(sub)"
                    >
                      展开
                    </van-button>
                    <van-button
                        v-if="sub.expanded"
                        type="primary"
                        size="mini"
                        plain
                        @click="toggleExpand(sub)"
                    >
                      收起
                    </van-button>
                  </div>
                </div>
              </div>
              <div class="more-comments">
                <van-button
                    type="primary"
                    size="mini"
                    plain
                    @click="viewCommentDetail(comment)"
                >
                  查看全部{{ comment.innerCommentList.length }}条回复
                </van-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-list>

    <!-- 底部操作栏 -->
    <div class="action-bar">
      <van-button
          class="comment-btn"
          icon="comment-o"
          @click="showPostCommentInput = true"
      >
        {{ post.commentNum }} 条评论
      </van-button>
      <div class="right-actions">
        <div class="action-item" @click="toggleLike">
          <van-icon
              :name="post.liked ? 'good-job' : 'good-job-o'"
              :color="post.liked ? 'red' : '#333'"
          />
          <span>{{ post.likeNum }}</span>
        </div>
        <div class="action-item" @click="toggleCollect">
          <van-icon
              :name="post.collected ? 'star' : 'star-o'"
              :color="post.collected ? '#ffd21e' : '#333'"
          />
          <span>{{ post.collectNum }}</span>
        </div>
      </div>
    </div>

    <!-- 评论评论弹窗 -->
    <!-- 优化后的评论回复弹窗 -->
    <van-popup v-model:show="showCommentInput" position="bottom" class="reply-popup">
      <!-- 弹窗头部，包含标题和关闭按钮 -->
      <div class="popup-header">
        <span class="popup-title">回复评论</span>
        <van-icon name="cross" size="20" @click="showCommentInput = false" class="popup-close" />
      </div>

      <!-- 弹窗内容区 -->
      <div class="popup-content">
        <van-field
            v-model="commentText"
            rows="3"
            autosize
            type="textarea"
            placeholder="写下你的评论..."
            class="reply-textarea"
        />
      </div>

      <!-- 底部操作区 -->
      <div class="popup-actions">
        <van-button plain class="btn-cancel" @click="showCommentInput = false">取消</van-button>
        <van-button type="primary" class="btn-submit" @click="submitComment">提交</van-button>
      </div>
    </van-popup>

    <!-- 评论帖子弹窗 -->
    <van-popup v-model:show="showPostCommentInput" position="bottom">
      <div class="comment-input-wrapper">
        <van-field
            v-model="postCommentText"
            rows="3"
            autosize
            type="textarea"
            placeholder="写下你的评论..."
        />
        <van-button type="primary" size="small" @click="submitPostComment">提交</van-button>
      </div>
    </van-popup>

    <!-- 评论详情弹窗 -->
    <van-popup v-model:show="showCommentDetailModal" position="bottom" style="height: 75vh;">
      <div class="comment-detail-modal">
        <div class="top-comment">
          <van-image
              round
              width="40"
              height="40"
              :src="selectedComment.userAvatar"
              class="comment-avatar"
          />
          <div class="comment-content">
            <div class="comment-header">
              <span class="nickname">{{ selectedComment.userName || '默认昵称' }}</span>
              <span class="comment-date">{{ formatDate(selectedComment.createTime) }}</span>
            </div>
            <div class="comment-text">
              {{ selectedComment.commentContent }}
            </div>
            <div class="comment-actions">
              <div class="like-area" @click="toggleCommentLike(selectedComment)">
                <van-icon
                    :name="selectedComment.liked ? 'good-job' : 'good-job-o'"
                    :color="selectedComment.liked ? 'red' : '#999'"
                />
                <span class="like-count">{{ selectedComment.likeNum }}</span>
              </div>
              <van-button
                  size="mini"
                  plain
                  @click="handleReply(selectedComment)"
              >
                回复
              </van-button>
              <!-- 删除按钮，只在用户是评论的作者时显示 -->
              <van-icon
                  v-if="selectedComment.userId === user.id"
                  name="delete"
                  size="20"
                  color="#999"
                  @click="deleteComment(selectedComment)"
                  class="delete-icon"
              />
            </div>
          </div>
        </div>

        <!-- 子评论列表 -->
        <van-list
            v-model:loading="loadingSubComments"
            :finished="finishedSubComments"
            finished-text="没有更多了"
            @load="loadSubComments(selectedComment.id)"
            class="sub-comment-list"
        >
          <!-- 在评论详情弹窗内，给每个子评论添加点赞按钮 -->
          <div v-for="sub in selectedComment.innerCommentList" :key="sub.id" class="sub-comment-detail">
            <van-image round width="32" height="32" :src="sub.userAvatar"/>
            <div class="sub-content-detail">
              <div class="sub-header">
                <span class="sub-nickname">{{ sub.userName || '默认昵称' }}</span>
                <span class="reply-to">回复 {{ sub.targetUserName || '默认昵称' }}</span>
                <span class="sub-date">{{ formatDate(sub.createTime) }}</span>
              </div>
              <div class="sub-text">{{ sub.commentContent }}</div>

              <!-- ✅ 修复：给子评论添加点赞按钮 -->
              <div class="sub-actions">
                <!-- ✅ 点赞按钮  -->
                <div class="like-area" @click="toggleSubLike(sub)">
                  <van-icon
                      :name="sub.liked ? 'good-job' : 'good-job-o'"
                      :color="sub.liked ? 'red' : '#999'"
                      size="14"
                  />
                  <span class="like-count">{{ sub.likeNum }}</span>
                </div>

                <!-- 回复按钮 -->
                <van-button size="mini" plain @click="handleSubReply(sub)">回复</van-button>
                <!-- 删除按钮，只在用户是评论的作者时显示 -->
                <van-icon
                    v-if="sub.userId === user.id"
                    name="delete"
                    size="20"
                    color="#999"
                    @click="deleteComment(sub)"
                    class="delete-icon"
                />
              </div>
            </div>
          </div>
        </van-list>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import {ref, onMounted, nextTick} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import axios from '../../api/axios.ts'
import {useUserStore} from "../../stores/user.ts";

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const user = ref({
});

// 轮播图数据
const defaultImages = ref([
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
  'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg'
])

// 帖子数据
const post = ref({});
const showPostCommentInput = ref(false)
const postCommentText = ref('');

// 评论相关
const comments = ref([])
const loading = ref(false)
const finished = ref(false)
const page = ref(1)
const showCommentInput = ref(false)
const commentText = ref('')
const load = ref(false);
const currentReplyComment = ref(null)

// 是否是评论子评论
const isSubComment = ref(false);
const showCommentDetailModal = ref(false)
const selectedComment = ref(null)
const loadingSubComments = ref(false)
const finishedSubComments = ref(false)
const subCommentsPage = ref(1)
const subLoad = ref(false)

const truncatedContent = (text) => {
  return text?.length > 50 ? text.slice(0, 50) + '...' : text
}

const toggleExpand = (comment) => {
  comment.expanded = !comment.expanded
}

const toggleCollect = async () => {
  try {
    const userInfo = await userStore.getUserInfo();
    let collectAction = 0;
    if (post.value.collected) {
      collectAction = 1;
    }
    const collectAddRequest = {
      targetId: post.value.id,
      targetType: 0,
      collectUserId: userInfo.id,
      collectAction: collectAction,
      userId: post.value.userId,
    };
    await axios.post('/api/like_collect/collect/collect', collectAddRequest);
    post.value.collected = !post.value.collected;
    post.value.collectNum += post.value.collected ? 1 : -1;
  } catch (e) {
    console.error(e)
  }
}

const toggleLike = async () => {
  try {
    const userInfo = await userStore.getUserInfo();
    const isLogin = userStore.isLoggedIn;
    if (!isLogin) {
      showToast('请先登录后再点赞');
    }
    let likeAction = 0;
    if (post.value.liked) {
      likeAction = 1;
    }
    const likeAddRequest = {
      targetId: post.value.id,
      targetType: 0,
      likeUserId: userInfo.id,
      likeAction: likeAction,
      userId: post.value.userId
    };
    await axios.post('/api/like_collect/like/like', likeAddRequest);
    post.value.liked = !post.value.liked;
    post.value.likeNum += post.value.liked ? 1 : -1;
  } catch (e) {
    console.error(e)
  }
}

const toggleCommentLike = async (comment) => {
  try {
    const userInfo = await userStore.getUserInfo();
    let likeAction = 0;
    if (comment.liked) {
      likeAction = 1;
    }
    const likeAddRequest = {
      targetId: comment.id,
      targetType: 1,
      likeUserId: userInfo.id,
      likeAction: likeAction,
      userId: comment.userId,
    };
    await axios.post('/api/like_collect/like/like', likeAddRequest);
    comment.liked = !comment.liked
    comment.likeNum += comment.liked ? 1 : -1
  } catch (e) {
    console.error(e)
  }
}

const toggleSubLike = async (subComment) => {
  try {
    const userInfo = await userStore.getUserInfo();
    let likeAction = 0;
    if (subComment.liked) {
      likeAction = 1;
    }
    const likeAddRequest = {
      targetId: subComment.id,
      targetType: 1,
      likeUserId: userInfo.id,
      likeAction: likeAction,
      userId: subComment.userId
    }
    await axios.post('/api/like_collect/like/like', likeAddRequest)
    subComment.liked = !subComment.liked
    subComment.likeNum += subComment.liked ? 1 : -1
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
};

const onLoadPost = async () => {
  const postId = route.params.id;
  const resp = await axios.post('/api/post/getPostByPostId', null, {
    params: {postId: postId}
  });
  const {data} = resp;
  post.value = data.postVO;
  post.value.liked = data.liked;
  post.value.collected = data.collected;
};

const onLoadComments = async () => {
  if (loading.value && load.value) return;

  loading.value = true;
  load.value = true;

  const commentPageRequest = {
    current: page.value,
    pageSize: 10,
    sortField: '',
    parentId: route.params.id
  };

  const resp = await axios.post('/api/comment/listCommentByPostId', commentPageRequest);
  const {data} = resp;
  const {records} = data;

  records.forEach(comment => {
    comment.expanded = false;
    comment.innerCommentList?.forEach(sub => {
      sub.expanded = false;
    })
  });

  comments.value = [...comments.value, ...records];
  loading.value = false;
  load.value = false;

  if (records.length < commentPageRequest.pageSize) {
    finished.value = true;
  }
  page.value++;
};

const loadSubComments = async (commentId) => {
  if (loadingSubComments.value && subLoad.value) return;

  loadingSubComments.value = true;
  subLoad.value = true;

  const resp = await axios.post('/api/comment/listCommentByCommentId', {
    current: subCommentsPage.value,
    pageSize: 10,
    sortField: '',
    parentId: commentId
  });

  const {data} = resp;
  const {innerCommentList} = data;

  selectedComment.value.innerCommentList = [...selectedComment.value.innerCommentList, ...innerCommentList];
  loadingSubComments.value = false;
  subLoad.value = false;

  if (innerCommentList.length < 10) {
    finishedSubComments.value = true;
  }
  subCommentsPage.value++;
};

const viewCommentDetail = (comment) => {
  selectedComment.value = comment;
  showCommentDetailModal.value = true;
  selectedComment.value.innerCommentList = [];
  subCommentsPage.value = 1;
  finishedSubComments.value = false;
};

const handleReply = (comment) => {
  console.log(comment);
  isSubComment.value = false;
  currentReplyComment.value = comment;
  showCommentInput.value = true;
};

const handleSubReply = (subComment) => {
  console.log(subComment)
  isSubComment.value = true;
  currentReplyComment.value = subComment;

  // 先保持弹窗不关闭，等待 Vue 渲染
  nextTick(() => {
    showCommentInput.value = true; // 显示输入框
  });
};

// 评论评论
const submitComment = async () => {
  if (!commentText.value.trim()) return;

  try {
    const userInfo = await userStore.getUserInfo();
    const postId = route.params.id;
    const commentAddRequest = {
      userId: userInfo.id,
      userName: userInfo.userName,
      userAvatar: userInfo.userAvatar,
      postId: postId,
      parentId: currentReplyComment.value.id,
      targetType: 1,
      targetId: currentReplyComment.value.id,
      commentContent: commentText.value,
      targetUserId: currentReplyComment.value.userId,
      targetUserName: currentReplyComment.value.userName,
      targetUserAvatar: currentReplyComment.value.userAvatar
    }
    // 说明回复的是子评论
    if (isSubComment.value) {
      commentAddRequest.parentId = selectedComment.value.id
    }

    await axios.post('/api/comment/addComment', commentAddRequest);

    commentText.value = '';
    showCommentInput.value = false;
    currentReplyComment.value = null;
    isSubComment.value = false;
    // 重新加载评论
    comments.value = [];
    page.value = 1;
    finished.value = false;
    showCommentDetailModal.value = false;
    onLoadComments();
  } catch (e) {
    console.error(e);
  }
};

// 评论帖子
const submitPostComment = async () => {
  if(!postCommentText.value.trim()) return;

  try {
    const userInfo = await userStore.getUserInfo();
    const postId = route.params.id;
    const postUserInfo = await axios.post('/api/user/getUserInfoByUserId',null,{
      params: {
        userId: post.value.userId
      }
    })
    const commentAddRequest = {
      userId: userInfo.id,
      userName: userInfo.userName,
      userAvatar: userInfo.userAvatar,
      postId: postId,
      parentId: postId,
      targetType: 0,
      targetId: postId,
      commentContent: postCommentText.value,
      targetUserId: post.value.userId,
      targetUserName: postUserInfo.userName,
      targetUserAvatar: postUserInfo.userAvatar
    }

    const resp = await axios.post('/api/comment/addComment', commentAddRequest);
    console.log(resp)

    postCommentText.value = '';
    showPostCommentInput.value = false;
    currentReplyComment.value = null;
    // 重新加载评论
    comments.value = [];
    page.value = 1;
    finished.value = false;
    showCommentDetailModal.value = false;
    onLoadComments();
  } catch (e) {
    console.error(e);
  }
}

const deleteComment = async (comment) => {
  try {
    const commentId = comment.id;
    await axios.post('/api/comment/deleteComment', null, {
      params: {
        commentId: commentId
      }
    });
    comments.value = [];
    page.value = 1;
    finished.value = false;
    showCommentDetailModal.value = false;
    onLoadComments();
  } catch (e) {
    console.error(e)
  }
}

const goBack = () => {
  router.back()
}

onMounted(async () => {
  user.value = await userStore.getUserInfo();
  onLoadPost();
});
</script>

<style scoped>
/* 新增样式 */
.post-content {
  padding: 15px;
  background: #fff;
}

.swipe-container {
  height: 200px;
}

.swipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mention {
  color: #1989fa;
  margin: 10px 0;
  font-size: 14px;
}

.comment-item {
  padding: 12px 15px;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.comment-wrapper {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  position: relative;
}

.comment-header {
  display: flex;
  flex-direction: column; /* 设置为垂直方向 */
  margin-bottom: 8px;
}

.nickname {
  font-weight: 500;
  font-size: 14px;
}

.comment-date {
  color: #999;
  font-size: 12px;
}


.comment-text {
  font-size: 15px;
  line-height: 1.5;
  margin-right: 60px;
}

.sub-comments {
  margin-top: 10px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 6px;
}

.sub-comment {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.sub-content {
  flex: 1;
  font-size: 13px;
  color: #666;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.right-actions {
  display: flex;
  gap: 20px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.comment-input-wrapper {
  padding: 15px;
  background: #fff;
}

.van-field {
  margin-bottom: 10px;
}

/* 日期样式 */
.date {
  font-size: 12px;
  color: #999;
}

.comment-detail-modal {
  padding: 15px;
  background: #fff;
}

.top-comment {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.comment-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
}

.sub-comment {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 8px;
}

.sub-content {
  flex: 1;
  font-size: 13px;
  color: #666;
}

.sub-nickname {
  font-weight: 500;
  color: #333;
}

.sub-text {
  color: #999;
}

/* 让回复按钮变成超链接的样式 */
.reply-btn .van-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #1989fa;
  text-decoration: underline;
  cursor: pointer;
}

.reply-btn .van-button:hover {
  color: #106bb4;
}

/* 增强子评论可读性，添加分割线 */
.sub-comments {
  margin-top: 10px;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 6px;
  border-top: 1px solid #ddd;
}

/* 让子评论的样式和主评论对齐 */
.sub-comment {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.sub-comment:last-child {
  border-bottom: none;
}

/* 头像样式 */
.sub-comment .van-image {
  flex-shrink: 0;
}

/* 子评论内容区域 */
.sub-content {
  flex: 1;
  font-size: 14px;
  color: #333;
}

/* 子评论的用户信息 */
.sub-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
}

/* 回复对象 */
.reply-to {
  font-weight: 500;
}

/* 子评论正文 */
.sub-text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin-top: 5px;
}

/* 子评论的操作区域（点赞+回复） */
.sub-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 确保靠左 */
  gap: 15px; /* 点赞和回复按钮之间留出间距 */
  margin-top: 5px;
}

.like-area {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.like-area:hover {
  color: red;
}

/* 修正评论输入框的美观 */
.comment-input-wrapper {
  padding: 15px;
  background: #fff;
  display: flex;
  gap: 10px;
  align-items: center;
}

/* 评论详情弹窗美化 */
.comment-detail-modal {
  padding: 15px;
  background: #fff;
}

/* 顶部评论 */
.top-comment {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

/* 详情页子评论的样式优化 */
.sub-comment-detail {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.sub-comment-detail:last-child {
  border-bottom: none;
}

.sub-content-detail {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.sub-content-detail .sub-header {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #666;
}

.sub-content-detail .sub-text {
  font-size: 14px;
  color: #333;
  margin-top: 5px;
}

.comment-actions {
  display: flex;
  align-items: center;
  gap: 10px; /* 控制点赞和回复按钮的间距 */
  font-size: 14px;
  color: #666;
}

.comment-actions .van-icon {
  cursor: pointer;
}

.comment-actions .van-icon:hover {
  color: red;
}

.comment-actions .van-button {
  background: none;
  border: none;
  color: #1989fa;
  text-decoration: underline;
  cursor: pointer;
}

.comment-actions .van-button:hover {
  color: #106bb4;
}

/* 统一回复按钮的超链接风格 */
.reply-btn .van-button,
.comment-actions .van-button,
.sub-actions .van-button {
  background: none;
  border: none;
  padding: 0;
  font-size: 14px;
  color: #1989fa;
  text-decoration: underline;
  cursor: pointer;
}

.reply-btn .van-button:hover,
.comment-actions .van-button:hover,
.sub-actions .van-button:hover {
  color: #106bb4;
}

/* 主界面评论的点赞按钮 */
.main-like-area {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
}

/* 弹窗子评论的点赞按钮 */
.popup-like-area {
  position: relative; /* 确保不受主界面的绝对定位影响 */
  display: flex;
  align-items: center;
  gap: 4px;
  color: #999;
  cursor: pointer;
}

/* 让主界面和弹窗的点赞按钮 hover 颜色相同 */
.main-like-area:hover, .popup-like-area:hover {
  color: red;
}

/* 左上角返回按钮的样式 */
.back-button {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
}

.back-icon {
  color: #333; /* 设置图标颜色 */
  cursor: pointer;
  background: transparent; /* 透明背景 */
}

/* 优化后的回复弹窗样式 */
.reply-popup {
  padding: 15px;
  background-color: #fff;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

/* 弹窗头部 */
.reply-popup .popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.reply-popup .popup-title {
  font-size: 16px;
  font-weight: 500;
}

.reply-popup .popup-close {
  color: #999;
  cursor: pointer;
}

/* 弹窗内容区 */
.reply-popup .popup-content {
  margin-bottom: 15px;
}

.reply-popup .reply-textarea .van-field__control {
  font-size: 14px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 6px;
}

/* 弹窗底部操作区 */
.reply-popup .popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.reply-popup .popup-actions .van-button {
  min-width: 70px;
}

</style>