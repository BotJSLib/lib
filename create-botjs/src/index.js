#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = require("chalk");
var prompts_1 = require("prompts");
var path_1 = require("path");
var fs_1 = require("fs");
var axios_1 = require("axios");
var util_1 = require("util");
var stream_1 = require("stream");
var os_1 = require("os");
var path_2 = require("path");
var fs_2 = require("fs");
var stream_2 = require("stream");
var tar_1 = require("tar");
var cli_spinners_1 = require("cli-spinners");
var ora_1 = require("ora");
var child_process_1 = require("child_process");
var prefix = chalk_1.default.bgBlue(" BOT.JS ");
var res = await (0, prompts_1.default)({
    type: "text",
    initial: "bot",
    message: "".concat(prefix, " What is your project name?"),
    name: "name",
}, {
    onCancel: function () {
        console.log("".concat(prefix, " Bye!"));
        process.exit(0);
    },
});
var projectPath = "./" + res.name.trim();
var resolvedProjectPath = path_1.default.resolve(projectPath);
var projectName = path_1.default.basename(resolvedProjectPath);
var packageManager = await (0, prompts_1.default)({
    type: "select",
    name: "value",
    message: "".concat(prefix, " Choose your package manager:"),
    choices: [
        { title: "npm", value: "npm" },
        { title: "yarn", value: "yarn" },
        { title: "pnpm", value: "pnpm" },
    ],
});
await fs_1.promises.mkdir(resolvedProjectPath, { recursive: true });
var templates = await axios_1.default
    .get("https://api.github.com/repos/BotJSLib/templates/contents")
    .then(function (res) {
    return res.data
        .filter(function (file) { return file.type === "dir"; })
        .map(function (row) { return ({
        title: row.name,
        value: row.name,
    }); });
})
    .catch(function () { return []; });
var template = await (0, prompts_1.default)({
    type: "select",
    name: "value",
    message: "".concat(prefix, " Choose your template:"),
    choices: templates,
});
var spinner = (0, ora_1.default)({
    spinner: cli_spinners_1.default.bouncingBar,
    prefixText: chalk_1.default.greenBright("✔ ") + chalk_1.default.bold(prefix + " Downloading template..."),
    color: "gray",
}).start();
var pipeline = (0, util_1.promisify)(stream_1.default.pipeline);
var temp = (0, path_2.join)((0, os_1.tmpdir)(), "template-botjs-" + Date.now());
var reques = await (0, axios_1.default)({
    responseType: "stream",
    url: "https://codeload.github.com/BotJSLib/templates/tar.gz/main",
});
await pipeline(stream_2.Readable.from(reques.data), (0, fs_2.createWriteStream)(temp));
await tar_1.default.x({
    cwd: resolvedProjectPath,
    file: temp,
    filter: function (p) { return p.includes("templates-main/" + template.value); },
    strip: 2,
});
await fs_1.promises.unlink(temp);
spinner.stop();
console.log(chalk_1.default.greenBright("✔ ") + chalk_1.default.bold(prefix + " Done!"));
try {
    (0, child_process_1.execSync)("npx -y json -I -f package.json -e \"this.name=\\\"".concat(projectName, "\\\"\""), {
        cwd: resolvedProjectPath,
        stdio: "ignore",
    });
}
catch (err) {
    console.log(chalk_1.default.red(prefix + " Failed to update project name :("));
}
