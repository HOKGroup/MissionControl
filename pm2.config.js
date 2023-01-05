module.exports = {
    name: "server",
    script: "npm",
    args: "start:clean",
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