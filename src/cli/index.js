#!/usr/bin/env node
const yargs = require("yargs");
const chalk = require("chalk");
const child_process = require("child_process");
const cliSpinners = require("cli-spinners");
const nodemon = require("nodemon");

const prefix = chalk.bgBlue(" BOT.JS ");
const errorPrefix = chalk.bgRed(" ERROR ");

const usage =
  chalk.bgBlue("Bot.js CLI") + "\n" + chalk.gray("Usage: botjs [build/dev]");

const options = yargs
  .usage(usage)
  .option("build", {
    alias: "b",
    describe: "Build the bot",
  })
  .option("dev", {
    alias: "d",
    describe: "Run the bot in development mode",
    type: "string",
  })
  .help(true).argv;

if (yargs.argv._.length === 0) {
  console.log(usage);
} else {
  if (options.build || yargs.argv._[0] === "build") {
    import("ora").then(({ default: ora }) => {
      const spinner = ora({
        spinner: cliSpinners.bouncingBar,
        prefixText: prefix + " Building the bot",
        color: "gray",
      }).start();
      // run tsc

      child_process.exec("yarn tsc", (err, stdout, stderr) => {
        let newPrefix = prefix;

        spinner.stop();

        if (err) {
          console.log(chalk.red(prefix + " Error building the bot."));
          newPrefix = errorPrefix;
        } else {
          console.log(chalk.green(prefix + " Bot built successfully."));
        }

        const lines = stdout.split("\n");
        lines.shift();
        lines.shift();
        lines.pop();

        for (const line of lines) {
          console.log(newPrefix + " " + line);
        }
      });
    });
  }

  if (options.dev || yargs.argv._[0] === "dev") {
    nodemon({
      script: options.dev || yargs.argv._[1] || ".",
      ext: "js ts",
      exec: "npx tsx",
    });
    nodemon.on("quit", () => {
      console.log(prefix + " Bot stopped");
    });
    nodemon.on("restart", (files) => {
      console.log(prefix + " Bot restarted due to: ", files);
    });
  }
}