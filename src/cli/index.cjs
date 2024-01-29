#!/usr/bin/env node
const yargs = require("yargs");
const chalk = require("chalk");
const child_process = require("child_process");
const cliSpinners = require("cli-spinners");
const { spawn } = require("child_process");
const prefix = chalk.bgBlue(" BOT.JS ");

const usage = chalk.bold(
  chalk.bgBlue(" BOT.JS ") + chalk.gray(" Usage: botjs [build/dev]")
);

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
        prefixText: chalk.bold(prefix + " Building the bot"),
        color: "gray",
      }).start();
      // run tsc

      child_process.exec("yarn tsc", (err, stdout, stderr) => {
        let newPrefix = prefix;

        spinner.stop();

        if (err) {
          newPrefix = chalk.redBright("✖ ") + prefix;
          console.log(chalk.bold(newPrefix + " Error building the bot"));
        } else {
          newPrefix = chalk.greenBright("✔ ") + prefix;
          console.log(chalk.bold(newPrefix + " Bot built successfully"));
        }

        const lines = stdout.split("\n");
        lines.shift();
        lines.shift();
        lines.pop();

        for (const line of lines) {
          console.log(chalk.bold(newPrefix + " " + line));
        }
      });
    });
  }

  if (options.dev || yargs.argv._[0] === "dev") {
    process.env.BOTJS_WATCH = "true";
    const child = spawn(
      "node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm/transpile-only " +
        (options.dev || yargs.argv._[1] || "."),
      {
        shell: true,
        cwd: process.cwd(),
        stdio: "inherit",
      }
    );

    child.on("exit", (code) => {
      if (code === 1) {
        console.log(
          chalk.redBright("✖ ") + chalk.bold(prefix + " Error running the bot")
        );
      }
    });
  }
}