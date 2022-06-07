import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
// import Vue2Editor from "vue2-editor";
// Vue.use(Vue2Editor);
import axios from 'axios'
import VueAxios from 'vue-axios'

axios.defaults.baseURL = 'http://127.0.0.1:3000';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;

Vue.use(VueAxios, axios)
Vue.config.productionTip = false;

// 添加请求拦截器
axios.interceptors.request.use(function (config) {
  // 将token添加到请求头中
  let token = localStorage.getItem("token");
  if(token) {
    config.headers['Authorization'] = localStorage.getItem("token");
  }
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");