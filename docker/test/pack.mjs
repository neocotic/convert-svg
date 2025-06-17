#!/usr/bin/env node

import { spawn } from "node:child_process";
import { glob, rename, rm } from "node:fs/promises";
import { EOL } from "node:os";
import { resolve as resolvePath } from "node:path";

const npmPack = () =>
  runCommand("npm", [
    "pack",
    "--workspace=convert-svg-core",
    "--workspace=convert-svg-core-test",
    "--pack-destination=.",
  ]);

const renameFile = async (oldFileName, newFileName) => {
  const newFilePath = resolvePath(import.meta.dirname, newFileName);

  await rm(newFilePath, { force: true });

  for await (const match of glob(oldFileName, { cwd: import.meta.dirname })) {
    const oldFilePath = resolvePath(import.meta.dirname, match);

    await rename(oldFilePath, newFilePath);

    process.stdout.write(`Renamed ${match} to ${newFileName}${EOL}`);
  }
};

const runCommand = (command, args) =>
  new Promise((resolve, reject) => {
    const cmd = spawn(command, args, { cwd: import.meta.dirname });

    cmd.stderr.on("data", (data) => process.stderr.write(data));
    cmd.stdout.on("data", (data) => process.stdout.write(data));

    cmd.on("error", reject);
    cmd.on("close", () => resolve());
  });

const main = async () => {
  await npmPack();

  await renameFile(
    "convert-svg-core-[0-9]*.tgz",
    "convert-svg-core-latest.tgz",
  );
  await renameFile(
    "convert-svg-core-test-*.tgz",
    "convert-svg-core-test-latest.tgz",
  );
};

main().catch(console.error);
