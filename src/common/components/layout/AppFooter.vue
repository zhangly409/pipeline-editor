<template>
  <footer class="footer">
    <div class="footer-content">
      <p class="text-center">
        Copyright &copy; {{ appYear }} <a href="xxx">xxx</a> All rights reserved.
      </p>
      <p class="text-center">请使用 Chrome，Firefox，IE10+ 等浏览器访问本站</p>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'AppFooter',
  props: {},
  data() {
    return {
      appYear: new Date().getFullYear(),
    }
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>
<style scoped>
.footer {
  margin-top: 20px;
}
</style>
