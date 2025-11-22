// build.js  ← this file makes Vercel happy
const { execSync } = require("child_process");
console.log("Building frontend...");
execSync("npm install && npm run build", { cwd: "Frontend", stdio: "inherit" });
