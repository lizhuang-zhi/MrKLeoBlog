<template>
  <div class="form-wrap">
    <form class="register">
      <p class="login-register">
        Already have an account?
        <router-link class="router-link" :to="{ name: 'Login' }"
          >Login</router-link
        >
      </p>
      <h2>Create Your FireBlog Account</h2>
      <div class="inputs">
        <div class="input">
          <input type="text" placeholder="First Name" v-model="firstName" />
          <user class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="Last Name" v-model="lastName" />
          <user class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="Username" v-model="username" />
          <user class="icon" />
        </div>
        <div class="input">
          <input type="text" placeholder="Email" v-model="email" />
          <email class="icon" />
        </div>
        <div class="input">
          <input type="password" placeholder="Password" v-model="password" />
          <password class="icon" />
        </div>
        <div v-show="error" class="error">{{ this.errorMsg }}</div>
      </div>
      <button @click.prevent="register">Sign Up</button>
      <div class="angle"></div>
    </form>
    <div class="background"></div>
  </div>
</template>

<script>
import email from "../assets/Icons/envelope-regular.svg";
import password from "../assets/Icons/lock-alt-solid.svg";
import user from "../assets/Icons/user-alt-light.svg";

export default {
  name: "Register",
  components: {
    email,
    password,
    user,
  },
  data() {
    return {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      error: null,
      errorMsg: "",
    };
  },
  methods: {
    async register() {
      // 密码长度不小于 8 位，不大于 32 位，以字母开头、并且携带数字的字串
      const judgePassword = /^[a-zA-Z]{1}([a-zA-Z0-9]){7,33}$/;
      if (
        this.email !== "" &&
        this.password !== "" &&
        this.firstName !== "" &&
        this.lastName !== "" &&
        this.username !== ""
      ) {
        if (!judgePassword.test(this.password)) {
          this.error = true;
          this.errorMsg =
            "密码长度不小于 8 位，不大于 32 位，以字母开头、并且携带数字";
          return;
        }
        this.error = false;
        this.errorMsg = "";

        const result = await this.axios.post("/register", {
          firstName: this.firstName,
          lastName: this.lastName,
          username: this.username,
          password: this.password,
          email: this.email,
          // 用户默认权限为 false（默认都不是管理员）
          userAuth: false,
        });
        const data = result.data;
        // 注册成功
        if(data.status == 200) {
          this.$router.push({ name: "Login" });
        }else {
          this.error = true;
          this.errorMsg = data.message + ",请稍后再试";
        }

      } else {
        this.error = true;
        this.errorMsg = "请确保所有信息都已经填写";
        return;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.register {
  h2 {
    max-width: 350px;
  }
}
</style>
