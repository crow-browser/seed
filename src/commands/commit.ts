// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import execa from "execa";
import { config } from "..";
import { ENGINE_DIR } from "../constants";
import { log } from "../log";
import path from "path";

export const commit = async () => {
  log.info(`Committing ${config.name}...`);

  const projectRoot = path.resolve(ENGINE_DIR, "..");

  await execa("git", ["add", "."], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  try {
    await execa("git", ["commit", "-m", "chore: commit"], {
      cwd: projectRoot,
      stdio: "inherit",
    });
  } catch (error) {
    await execa("git", ["push origin main --set-upstream"], {
      cwd: projectRoot,
      stdio: "inherit",
    });
    return log.success(`Committed ${config.name}`);
  }

  await execa("git", ["push origin main --set-upstream"], {
    cwd: projectRoot,
    stdio: "inherit",
  });

  log.success(`Committed ${config.name}`);
};
