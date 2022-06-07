<template>
  <div class="create-post">
    <BlogCoverPreview v-show="this.$store.state.blogPhotoPreview" />
    <Loading v-show="loading" />
    <div class="container">
      <div :class="{ invisible: !error }" class="err-message">
        <p><span>Error:</span>{{ this.errorMsg }}</p>
      </div>
      <div class="blog-info">
        <input type="text" placeholder="Enter Blog Title" v-model="blogTitle" />
        <div class="upload-file">
          <label for="blog-photo">Upload Cover Photo</label>
          <input
            type="file"
            ref="blogPhoto"
            id="blog-photo"
            @change="fileChange"
            accept=".png, .jpg, ,jpeg"
          />
          <button
            @click="openPreview"
            class="preview"
            :class="{ 'button-inactive': !this.$store.state.blogPhotoFileURL }"
          >
            Preview Photo
          </button>
          <span>文件选择: {{ this.$store.state.blogPhotoName }}</span>
        </div>
      </div>
      <!-- markdown编辑器 -->
      <Markdown v-model="blogHTML" />
      <div class="blog-actions">
        <button @click="updateBlog">Save Changes</button>
        <router-link class="router-button" :to="{ name: 'BlogPreview' }"
          >Preview Changes</router-link
        >
      </div>
    </div>
  </div>
</template>

<script>
import BlogCoverPreview from "../components/BlogCoverPreview";
import Loading from "../components/Loading";
import Markdown from "vue-meditor";

import Quill from "quill";
window.Quill = Quill;
const ImageResize = require("quill-image-resize-module").default;
Quill.register("modules/imageResize", ImageResize);

export default {
  name: "CreatePost",
  data() {
    return {
      file: null,
      error: null,
      errorMsg: null,
      loading: null,
      // 获取路由上的文章id
      routeID: null,
      currentBlog: null,
    };
  },
  components: {
    BlogCoverPreview,
    Loading,
    Markdown,
  },
  async mounted() {
    // 获取路由上的文章id
    this.routeID = this.$route.params.blogid;
    // 从 this.$store.state.blogPosts 中找到对应 id 的博客
    this.currentBlog = await this.$store.state.blogPosts.filter((post) => {
      return post.blogID === this.routeID;
    });
    this.$store.commit("setBlogState", this.currentBlog[0]);
  },
  methods: {
    fileChange() {
      this.file = this.$refs.blogPhoto.files[0];
      const fileName = this.file.name;
      this.$store.commit("fileNameChange", fileName);
      this.$store.commit("createFileURL", URL.createObjectURL(this.file));
    },

    openPreview() {
      this.$store.commit("openPhotoPreview");
    },

    // 更新博客
    async updateBlog() {
      // 有新图片上传, 先将图片云存储
      this.loading = true;
      let photoUrl = this.currentBlog[0].blogCoverPhoto;
      if (this.file) {
        const cloudBaseApp = this.$store.state.cloudBaseApp;
        // 云存储，存储上传的图片
        const uploadFile = await cloudBaseApp.uploadFile({
          // 云存储的路径
          cloudPath: `blog/${this.$store.state.blogPhotoName}`,
          // 需要上传的文件，File 类型
          filePath: this.file,
        });
        // 获取云存储的图片url
        photoUrl = uploadFile.download_url;
      }

      const timestamp = await Date.now();
      const result = await this.axios.post("/article/update", {
        blogHTML: this.blogHTML,
        blogTitle: this.blogTitle,
        blogCoverPhoto: photoUrl,
        blogCoverPhotoName: this.blogCoverPhotoName,
        profileId: this.profileId,
        date: timestamp,
        articleId: this.routeID,
      });
      console.log(result.data);

      // 更新单个博客
      await this.$store.dispatch("updatePost", this.routeID);
      this.loading = false;
      this.$router.push({
        name: "ViewBlog",
        params: { blogid: this.routeID },
      });
    },
  },
  computed: {
    profileId() {
      return this.$store.state.profileId;
    },
    blogCoverPhotoName() {
      return this.$store.state.blogPhotoName;
    },
    blogTitle: {
      get() {
        return this.$store.state.blogTitle;
      },
      set(payload) {
        this.$store.commit("updateBlogTitle", payload);
      },
    },
    blogHTML: {
      get() {
        return this.$store.state.blogHTML;
      },
      set(payload) {
        this.$store.commit("newBlogPost", payload);
      },
    },
  },
};
</script>

<style lang="scss">
.create-post {
  position: relative;
  height: 100%;

  button {
    margin-top: 0;
  }

  .router-button {
    text-decoration: none;
    color: #fff;
  }

  label,
  button,
  .router-button {
    transition: 0.5s ease-in-out all;
    align-self: center;
    font-size: 14px;
    cursor: pointer;
    border-radius: 20px;
    padding: 12px 24px;
    color: #fff;
    background-color: #303030;
    text-decoration: none;

    &:hover {
      background-color: rgba(48, 48, 48, 0.7);
    }
  }

  .container {
    position: relative;
    height: 100%;
    padding: 10px 25px 60px;
  }

  // error styling
  .invisible {
    opacity: 0 !important;
  }

  .err-message {
    width: 100%;
    padding: 12px;
    border-radius: 8px;
    color: #fff;
    margin-bottom: 10px;
    background-color: #303030;
    opacity: 1;
    transition: 0.5s ease all;

    p {
      font-size: 14px;
    }

    span {
      font-weight: 600;
    }
  }

  .blog-info {
    display: flex;
    margin-bottom: 32px;

    input:nth-child(1) {
      min-width: 300px;
    }

    input {
      transition: 0.5s ease-in-out all;
      padding: 10px 4px;
      border: none;
      border-bottom: 1px solid #303030;

      &:focus {
        outline: none;
        box-shadow: 0 1px 0 0 #303030;
      }
    }

    .upload-file {
      flex: 1;
      margin-left: 16px;
      position: relative;
      display: flex;

      input {
        display: none;
      }

      .preview {
        margin-left: 16px;
        text-transform: initial;
      }

      span {
        font-size: 12px;
        margin-left: 16px;
        align-self: center;
      }
    }
  }

  // 编辑器
  .editor {
    .v-note-wrapper {
      height: 100%;
    }
  }

  // .editor {
  //   height: 60vh;
  //   display: flex;
  //   flex-direction: column;

  //   .quillWrapper {
  //     position: relative;
  //     display: flex;
  //     flex-direction: column;
  //     height: 100%;
  //   }

  //   .ql-container {
  //     display: flex;
  //     flex-direction: column;
  //     height: 100%;
  //     overflow: scroll;
  //   }

  //   .ql-editor {
  //     padding: 20px 16px 30px;
  //   }
  // }

  .blog-actions {
    margin-top: 32px;

    button {
      margin-right: 16px;
    }
  }
}
</style>
