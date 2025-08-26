require("ts-node/register");
require("dotenv/config");

// Import config TypeScript (default export)
const config = require("./src/config/config.ts").default;

module.exports = config;
