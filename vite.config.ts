import { defineConfig } from "vite";

import "dotenv/config";

export default defineConfig({
  base: "",
  /*
server: {
  proxy: {
    "/application": {
      target: process.env.VITE_APP_PROXY_API,
      changeOrigin: true,
      secure: false,
    },
    "/benefits": {
      target: process.env.VITE_APP_PROXY_API,
      changeOrigin: true,
      secure: false,
    },
  },
},
*/
});
