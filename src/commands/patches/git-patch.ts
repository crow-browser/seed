// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.

import { PATCH_ARGS, ENGINE_DIR } from '../../constants'
import { log } from '../../log'
import { IMelonPatch } from './command'
import { execSync } from 'node:child_process'

export interface IGitPatch extends IMelonPatch {
  path: string
}

export async function apply(path: string): Promise<void> {
  try {
    execSync(`git apply -R ${PATCH_ARGS.join(' ')} ${path}`, {
      cwd: ENGINE_DIR,
      stdio: 'inherit',
    })
  } catch {
    undefined
  }

  try {
    execSync(`git apply ${PATCH_ARGS.join(' ')} ${path}`, {
      cwd: ENGINE_DIR,
      stdio: 'inherit',
    })
  } catch (error: any) {
    log.error(error.message)
  }
}