// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { Command } from 'commander'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { bin_name } from '..'
import { log } from '../log'
import { config, configDispatch } from '../utils'
import os from 'node:os'

async function removeGitLock(directory: string) {
  const lockFile = join(directory, '.git', 'index.lock')
  try {
    unlinkSync(lockFile)
    log.info('Removed existing .git/index.lock file')
  } catch (error) {
    // Ignore if the file does not exist
  }
}

async function runGitCommand(args: string[], cwd: string) {
  await configDispatch('git', { args, cwd, shell: 'unix' })
  // Add a small delay
  await new Promise((resolve) => setTimeout(resolve, 100))
}

export const init = async (directory: Command | string): Promise<void> => {
  const cwd = process.cwd()
  const absoluteInitDirectory = resolve(cwd as string, directory.toString())

  if (!existsSync(absoluteInitDirectory)) {
    log.error(
      `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
    )
    return
  }

  let version = readFileSync(
    resolve(
      cwd,
      directory.toString(),
      'browser',
      'config',
      'version_display.txt'
    )
  ).toString()

  if (!version) {
    log.error(
      `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
    )
    return
  }

  const fixedversion = version.trim().replace(/\n/g, '').replace(/\./g, '')

  // TODO: Use bash on windows, this may significantly improve performance.
  // Still needs testing though
  log.info('Initializing git, this may take some time')

  await removeGitLock(absoluteInitDirectory)

  await runGitCommand(['init'], absoluteInitDirectory)

  await runGitCommand(
    ['config', 'core.safecrlf', 'false'],
    absoluteInitDirectory
  )

  await runGitCommand(
    ['checkout', '--orphan', fixedversion],
    absoluteInitDirectory
  )

  log.info('Adding files to git, this will take long time')

  await runGitCommand(['add', '-f', '.'], absoluteInitDirectory)

  log.info('Committing...')

  await runGitCommand(
    [
      'commit',
      '-aqm',
      `"Initialized firefix ${version.trim().replace(/\n/g, '')} with seed engine"`,
    ],
    absoluteInitDirectory
  )

  await runGitCommand(
    ['checkout', '-b', config.name.toLowerCase().replace(/\s/g, '_')],
    absoluteInitDirectory
  )
}
