<template>
  <div id="app">
    <el-container class="wrapper">
      <el-container>
        <!-- <el-aside> <app-sidebar /></el-aside> -->
        <el-container>
          <!-- <el-header> <app-header /></el-header> -->
          <el-main><router-view></router-view></el-main>
          <el-footer> <app-footer /></el-footer>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { AppHeader, AppSidebar, AppFooter } from '@/common/components/layout'
export default {
  name: 'App',
  components: { AppFooter, AppSidebar, AppHeader },
  props: {},
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>
<style lang="scss" scoped>
// 有scoped属性，CSS 只作用于当前组件中的元素
.el-footer {
  height: 100px !important;
}
.wrapper {
  height: 100vh;
  .el-container {
    height: 100vh;
    .el-container {
      height: 100%;
    }
  }
}
</style>
