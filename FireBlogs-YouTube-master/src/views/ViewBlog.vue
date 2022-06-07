<template>
  <div class="post-view" v-if="currentBlog">
    <div class="container quillWrapper">
      <h2>{{ this.currentBlog[0].blogTitle }}</h2>
      <h4>
        Posted on:
        {{ postedOn }}
      </h4>
      <img :src="this.currentBlog[0].blogCoverPhoto" alt="" />
      <!-- 显示markdown文本内容 -->
      <MarkdownPreview :initialValue="this.currentBlog[0].blogHTML" />
    </div>
  </div>
</template>

<script>
import { MarkdownPreview } from "vue-meditor";
import myMixin from "../mixin/index.js";

export default {
  mixins: [myMixin],
  name: "ViewBlog",
  components: {
    MarkdownPreview,
  },
  data() {
    return {
      currentBlog: null,
    };
  },
  async mounted() {
    // 从 state 中过滤出单个博客
    this.currentBlog = await this.$store.state.blogPosts.filter((post) => {
      return post.blogID === this.$route.params.blogid;
    });
    // 调整时间格式
    this.timeFormat(this.currentBlog[0].blogDate);
  },
  methods: {},
};
</script>

<style lang="scss">
.post-view {
  h4 {
    font-weight: 400;
    font-size: 14px;
    margin-bottom: 24px;
  }
}
</style>
