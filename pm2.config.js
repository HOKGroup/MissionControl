module.exports = {
    name: "server",
    script: "./server/main.js",
    env_production: {
        NODE_ENV: "production"
    },
    env_development: {
        NODE_ENV: "development"
    },
    watch: ["server"],
    watch_delay: 10000,
    ignore_watch: ["node_modules", "public"]
}