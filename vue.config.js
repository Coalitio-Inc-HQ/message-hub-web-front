const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          VUE_APP_WS_URL: JSON.stringify(
            process.env.VUE_APP_API_BASE_URL.replace(/^https/, 'wss') + '/ws_listener'
          )
        }
      })
    ]
  }
});



