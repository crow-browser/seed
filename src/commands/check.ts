// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import execa from "execa";
import { config } from "..";
import { ENGINE_DIR } from "../constants";
import { log } from "../log";
import path from "path";
import fs from "fs";

export const check = async () => {
  log.info(`Checking for prerequisites...`);
  log.info("-".repeat(process.stdout.columns - 9) + "\n");

  const projectRoot = path.resolve(ENGINE_DIR, "..");
  const requiredTools = ["git", "node", "python3", "pip3"];

  if (process.platform === "win32") {
    requiredTools.push("c:/mozilla-build");
  }

  let found = [] as string[];
  let notFound = [] as string[];

  for (const tool of requiredTools) {
    if (tool.startsWith("c:/")) {
      if (fs.existsSync(tool)) {
        found.push(tool);
      } else {
        notFound.push(tool);
      }
    } else {
      try {
        await execa(tool, ["--version"], { cwd: projectRoot });
        found.push(tool);
      } catch (error) {
        notFound.push(tool);
      }
    }
  }

  if (notFound.length > 0) {
    log.checkError(
      `${"   "}The following tools could not be found: ${notFound.join(", ")}`
    );
    log.checkWarning(
      `${" "}Please make sure you have the required tools installed.\n`
    );
    log.info(`-`.repeat(20) + "\n");
    log.checkSuccess(
      `${" "}The following tools had been found: ${found.join(", ")}\n`
    );
    log.info(`-`.repeat(20) + "\n");
    if (notFound.length > 0)
      log.checkError(
        `${"   "}[FAIL] [${notFound.length}/${requiredTools.length}]`
      );
    if (found.length > 0)
      log.checkSuccess(
        `${" "}[OK] ${"  "}[${found.length}/${requiredTools.length}]`
      );
    process.exit(1);
  } else {
    log.checkSuccess(`The following tools had been found: ${found.join(", ")}`);
    log.checkSuccess(`[OK] [${found.length}/${requiredTools.length}]`);
    process.exit(0);
  }
};
