<template>
  <div class="form-wrap">
    <Loading v-if="loading" />
    <form class="login">
      <p class="login-register">
        Don't hava an account?
        <router-link class="router-link" :to="{ name: 'Register' }"
          >Register</router-link
        >
      </p>
      <h2>Login to FireBlogs</h2>
      <div class="inputs">
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
      <button @click.prevent="signIn">Sign In</button>
      <div class="angle"></div>
    </form>
    <div class="background"></div>
  </div>
</template>

<script>
import email from "../assets/Icons/envelope-regular.svg";
import password from "../assets/Icons/lock-alt-solid.svg";
import Loading from "../components/Loading.vue";

export default {
  name: "Login",
  components: {
    email,
    password,
    Loading,
  },
  data() {
    return {
      email: "",
      password: "",
      // 是否显示错误信息
      error: null,
      // 提交后, 显示的错误信息
      errorMsg: "",
      // loading
      loading: false,
    };
  },
  methods: {
    async signIn() {
      if (this.email !== "" && this.password !== "") {
        this.loading = true;
        let res = await this.axios.post("/login", {
          email: this.email,
          password: this.password,
        });
        // 获取查询到的用户信息
        const queryUsers = res.data.userInfo;
        const token = res.data.token;
        if (res.data.status != 200) {
          this.error = true;
          this.errorMsg = res.data.message;
          this.loading = false;
        } else {
          this.$store.dispatch("getCurrentUser", queryUsers);
          this.$router.push({ name: "Home" });
          // 存储返回的token
          localStorage.setItem("token", token);
        }
      } else {
        this.error = true;
        this.errorMsg = "请确保输入内容完整";
      }
    },
  },
};
</script>

<style lang="scss">
.form-wrap {
  overflow: hidden;
  display: flex;
  height: 100vh;
  justify-content: center;
  align-self: center;
  margin: 0 auto;
  width: 90%;
  @media (min-width: 900px) {
    width: 100%;
  }

  .login-register {
    margin-bottom: 32px;

    .router-link {
      color: #000;
    }
  }

  form {
    padding: 0 10px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    @media (min-width: 900px) {
      padding: 0 50px;
    }

    h2 {
      text-align: center;
      font-size: 32px;
      color: #303030;
      margin-bottom: 40px;
      @media (min-width: 900px) {
        font-size: 40px;
      }
    }

    .inputs {
      width: 100%;
      max-width: 350px;

      .input {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 8px;
        input {
          width: 100%;
          border: none;
          background-color: #f2f7f6;
          padding: 4px 4px 4px 30px;
          height: 50px;

          &:focus {
            outline: none;
          }
        }

        .icon {
          width: 12px;
          position: absolute;
          left: 6px;
        }
      }
    }

    .angle {
      display: none;
      position: absolute;
      background-color: #fff;
      transform: rotateZ(3deg);
      width: 60px;
      right: -30px;
      height: 101%;
      @media (min-width: 900px) {
        display: initial;
      }
    }
  }

  .background {
    display: none;
    flex: 2;
    background-size: cover;
    background-image: url("../assets/background.png");
    width: 100%;
    height: 100%;
    @media (min-width: 900px) {
      display: initial;
    }
  }
}
</style>