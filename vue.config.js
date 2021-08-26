module.exports = {
  pluginOptions: {
    singlePageApplication: {
      useHash: false,
    },
  },
  filenameHashing: true,
  css: {
    sourceMap: true,
    loaderOptions: {
      sass: {
        // 传入共享的全局变量
        additionalData: `@import "@/style/variables.scss";`,
      },
    },
  },
  devServer: {
    port: 8000,
    disableHostCheck: true,
    // 设置代理到 mock 服务
    proxy: {
      '/mock': {
        target: 'http://localhost:3000',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/mock': '',
        },
      },
    },
  },
  configureWebpack: {},
  chainWebpack: config => {},
  // 禁用每次保存时 lint 代码
  lintOnSave: false,
}
