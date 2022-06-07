import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../views/Home.vue";
import Blogs from "../views/Blogs.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Profile from "../views/Profile.vue";
import CreatePost from "../views/CreatePost.vue";
import BlogPreview from "../views/BlogPreview.vue";
import ViewBlog from "../views/ViewBlog.vue";
import EditBlog from "../views/EditBlog.vue";

import store from "../store/index";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: 'Home',
      requiresAuth: false,
    }
  },
  {
    path: "/blogs",
    name: "Blogs",
    component: Blogs,
    meta: {
      title: 'Blogs',
      requiresAuth: false,
    }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      title: 'Login',
      requiresAuth: false,
    }
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: {
      title: 'Register',
      requiresAuth: false,
    }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      title: 'Profile',
      // 需要用户登陆，才能去的页面
      requiresAuth: true,
    }
  },
  {
    path: "/create-post",
    name: "CreatePost",
    component: CreatePost,
    meta: {
      title: "CreatePost",
      // 需要用户登陆，同时该用户必须是管理员
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/post-preview",
    name: "BlogPreview",
    component: BlogPreview,
    meta: {
      title: "Preview Blog Post",
      // 需要用户登陆，同时该用户必须是管理员
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
  {
    path: "/view-blog/:blogid",
    name: "ViewBlog",
    component: ViewBlog,
    meta: {
      title: "View Blog Post",
      requiresAuth: false,
    },
  },
  {
    path: "/edit-blog/:blogid",
    name: "EditBlog",
    component: EditBlog,
    meta: {
      title: "Edit Blog Post",
      // 需要用户登陆，同时该用户必须是管理员
      requiresAuth: true,
      requiresAdmin: true,
    },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// Vue Document Titles
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | FireBlog`;
  next();
})

// 前置守卫，判断哪些页面不可进入
router.beforeEach(async (to, from, next) => {
  let state = store.state;
  let user = state.user;
  let admin = null;

  if (user) {
    admin = state.profileAdmin;
  }

  // 页面需要用户登录
  if (to.matched.some((res) => res.meta.requiresAuth)) {
    // 用户已经登录
    if (user) {
      // 页面需要管理者权限
      if (to.matched.some((res) => res.meta.requiresAdmin)) {
        // 用户有管理权限, 可进入对应页面
        if (admin) {
          return next();
        }
        // 没有管理权限跳转到 Home 页面
        return next({ name: "Home" });
      }
      // 不用管理管理者权限的页面直接进
      return next();
    }
    // 用户没有登录
    return next({ name: "Home" });
  }
  // 不用登录的页面, 直接到达
  return next();
});

export default router;
