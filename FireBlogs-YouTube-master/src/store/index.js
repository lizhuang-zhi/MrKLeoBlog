import Vue from 'vue'
import Vuex from 'vuex'

import axios from 'axios'

// 使用腾讯的cloudbase
import cloudbase from "@cloudbase/js-sdk";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 发布的文章集合
    blogPosts: [],
    postLoaded: null,

    // 编辑博客
    blogHTML: "Write your blog title here...",
    blogTitle: "",
    blogPhotoName: "",
    blogPhotoFileURL: null,
    blogPhotoPreview: null,

    // 编辑博客
    editPost: null,
    // 用户
    user: null,
    profileAdmin: null,
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileUsername: null,
    profileId: null,
    profileInitials: null,

    // cloudbase
    cloudBaseApp: cloudbase.init({
      env: "mrkleo-blog-2gw4gee4088deaca",
      region: "ap-guangzhou",
    }),
    // axios 请求
    axios: axios
  },
  getters: {
    // 首页开头的前两篇文章
    blogPostsFeed(state) {
      return state.blogPosts.slice(0, 2);
    },
    // 卡片形式展示后面四篇文章
    blogPostsCards(state) {
      return state.blogPosts.slice(2, 6);
    },
  },
  // 必须同步执行
  mutations: {
    newBlogPost(state, payload) {
      state.blogHTML = payload;
    },
    updateBlogTitle(state, payload) {
      state.blogTitle = payload;
    },
    // 编辑博客
    toggleEditPost(state, payload) {
      state.editPost = payload;
    },
    // 修改上传图片的名字
    fileNameChange(state, payload) {
      state.blogPhotoName = payload;
    },
    // 创建上传博客的图片 url
    createFileURL(state, payload) {
      state.blogPhotoFileURL = payload;
    },
    setProfileInfo(state, doc) {
      state.profileId = doc._id;
      state.profileEmail = doc.email;
      state.profileFirstName = doc.firstName;
      state.profileLastName = doc.lastName;
      state.profileUsername = doc.username;
    },
    // 预览上传的博客图片
    openPhotoPreview(state) {
      state.blogPhotoPreview = !state.blogPhotoPreview;
    },
    // Admin
    setProfileAdmin(state, payload) {
      state.profileAdmin = payload;
    },
    setProfileInitials(state) {
      state.profileInitials =
        state.profileFirstName.match(/(\b\S)?/g).join("") + state.profileLastName.match(/(\b\S)?/g).join("");
    },
    updateUser(state, payload) {
      state.user = payload;
    },
    changeFirstName(state, payload) {
      state.profileFirstName = payload;
    },
    changeLastName(state, payload) {
      state.profileLastName = payload;
    },
    changeUsername(state, payload) {
      state.profileUsername = payload;
    },
    filterBlogPost(state, payload) {
      state.blogPosts = state.blogPosts.filter((post) => post.blogID !== payload);
    },
    // 设置博客各项属性
    setBlogState(state, payload) {
      state.blogTitle = payload.blogTitle;
      state.blogHTML = payload.blogHTML;
      state.blogPhotoFileURL = payload.blogCoverPhoto;
      state.blogPhotoName = payload.blogCoverPhotoName;
    },
    // Sign Out
    signOut(state) {
      state.user = null;
      state.profileAdmin = null;
      state.profileEmail = null;
      state.profileFirstName = null;
      state.profileLastName = null;
      state.profileUsername = null;
      state.profileId = null;
      state.profileInitials = null;
    }
  },
  // 可以执行异步操作
  actions: {
    // 登陆后，设置当前用户
    async getCurrentUser({
      commit
    }, user) {
      const userInfo = user;
      // 用户权限
      const userAuth = userInfo.userAuth;
      // 改变state中用户信息
      commit("setProfileInfo", userInfo);
      // 设置右上角的用户名字首字母的显示
      commit("setProfileInitials");
      // 设置state中用户权限
      commit("setProfileAdmin", userAuth);
      // 更新state中用户
      commit("updateUser", userInfo);
    },
    // 获取博客
    async getPost({
      state
    }) {
      const result = await state.axios.get('/article/all');
      const postLists = result.data.data;
      /* 
        遍历重新请求来的数据, 判断当前数据是否和原来数据中有重复,
        如果没有重复就添加到原数组
      */
      postLists.forEach(item => {
        if (!state.blogPosts.some(val => {
            return val.blogID == item._id;
          })) {
          const data = {
            blogID: item._id,
            blogHTML: item.blogHTML,
            blogCoverPhoto: item.blogCoverPhoto,
            blogTitle: item.blogTitle,
            blogDate: item.date,
            blogCoverPhotoName: item.blogCoverPhotoName,
          }
          state.blogPosts.push(data);
        }
      })
      state.postLoaded = true;
    },
    // 修改用户个人信息
    async updateUserSettings({
      commit,
      state
    }) {
      // 更新用户信息
      await state.axios.post("/updateuserinfo", {
        profileId: state.profileId,
        firstName: state.profileFirstName,
        lastName: state.profileLastName,
        username: state.profileUsername
      });
      commit("setProfileInitials");
    },
    // 删除博客
    async deletePost({
      commit,
      state
    }, deleteArticleId) {
      await state.axios.post("/article/delete", {
        articleId: deleteArticleId
      })
      commit("filterBlogPost", deleteArticleId);
    },
    async updatePost({
      commit,
      dispatch
    }, updateBlogId) {
      commit("filterBlogPost", updateBlogId);
      await dispatch("getPost");
    },
  },
  modules: {}
})