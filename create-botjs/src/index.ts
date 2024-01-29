#!/usr/bin/env node
import chalk from "chalk";
import prompts from "prompts";
import path from "path";
import { promises as pfs } from "fs";
import axios from "axios";
import { promisify } from "util";
import Stream from "stream";
import { tmpdir } from "os";
import { join } from "path";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import tar from "tar";
import cliSpinners from "cli-spinners";
import ora from "ora";
import { execSync } from "child_process";

const prefix = chalk.bgBlue(" BOT.JS ");
const res = await prompts(
  {
    type: "text",
    initial: "bot",
    message: `${prefix} What is your project name?`,
    name: "name",
  },
  { onCancel: () => process.exit(0) }
);

const projectPath = "./" + res.name.trim();
const resolvedProjectPath = path.resolve(projectPath);
const projectName = path.basename(resolvedProjectPath);
const packageManager = await prompts({
  type: "select",
  name: "value",
  message: `${prefix} Choose your package manager:`,
  choices: [
    { title: "npm", value: "npm" },
    { title: "yarn", value: "yarn" },
    { title: "pnpm", value: "pnpm" },
  ],
});

await pfs.mkdir(resolvedProjectPath, { recursive: true });

const templates = await axios
  .get<
    {
      name: string;
      path: string;
      type: "file" | "dir";
    }[]
  >("https://api.github.com/repos/BotJSLib/templates/contents")
  .then((res) =>
    res.data
      .filter((file) => file.type === "dir")
      .map((row) => ({
        title: row.name,
        value: row.name,
      }))
  )
  .catch(() => []);

const template = await prompts({
  type: "select",
  name: "value",
  message: `${prefix} Choose your template:`,
  choices: templates,
});

const spinner = ora({
  spinner: cliSpinners.bouncingBar,
  prefixText:
    chalk.greenBright("✔ ") + chalk.bold(prefix + " Downloading template..."),
  color: "gray",
}).start();

const pipeline = promisify(Stream.pipeline);
const temp = join(tmpdir(), "template-botjs-" + Date.now());
const reques = await axios({
  responseType: "stream",
  url: "https://codeload.github.com/BotJSLib/templates/tar.gz/main",
});

await pipeline(Readable.from(reques.data), createWriteStream(temp));
await tar.x({
  cwd: resolvedProjectPath,
  file: temp,
  filter: (p) => p.includes("templates-main/" + template.value),
  strip: 2,
});

await pfs.unlink(temp);

spinner.stop();
console.log(chalk.greenBright("✔ ") + chalk.bold(prefix + " Done!"));

try {
  execSync(
    `npx -y json -I -f package.json -e "this.name=\\"${projectName}\\""`,
    {
      cwd: resolvedProjectPath,
      stdio: "ignore",
    }
  );
} catch (err) {
  console.log(
    chalk.redBright("✖ ") +
      chalk.bold(prefix + " Failed to update project name")
  );
}
