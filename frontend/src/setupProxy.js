const { createProxyMiddleware } = require("http-proxy-middleware");

const target = "http://localhost:8000";

module.exports = function setupProxy(app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target,
      changeOrigin: true,
    })
  );

  app.use(
    "/ws",
    createProxyMiddleware({
      target,
      changeOrigin: true,
      ws: true,
    })
  );
};
