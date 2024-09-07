// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import { Command } from 'commander'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { bin_name } from '..'
import { log } from '../log'
import { config, configDispatch } from '../utils'
import { platform } from 'node:os'

export const init = async (directory: Command | string): Promise<void> => {
  const cwd = process.cwd()

  const absoluteInitDirectory = resolve(cwd as string, directory.toString())

  if (!existsSync(absoluteInitDirectory)) {
    log.error(
      `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
    )
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

  if (!version)
    log.error(
      `Directory "${directory}" not found.\nCheck the directory exists and run |${bin_name} init| again.`
    )

  version = version.trim().replace(/\\n/g, '')

  log.info('Initializing git, this may take some time')

  const shell = process.platform === 'win32' ? 'bash' : 'unix'

  await configDispatch('git', {
    args: ['init'],
    cwd: absoluteInitDirectory,
    shell: shell,
  })

  await configDispatch('git', {
    args: ['checkout', '--orphan', version],
    cwd: absoluteInitDirectory,
    shell: shell,
  })

  await configDispatch('git', {
    args: ['config', 'core.autocrlf', 'false'],
    cwd: absoluteInitDirectory,
    shell: shell,
  })

  if (shell === 'bash') {
    await configDispatch('git', {
      args: ['config', 'core.eol', 'lf'],
      cwd: absoluteInitDirectory,
      shell: shell,
    })
  } else {
    await configDispatch('git', {
      args: ['config', 'core.eol', 'crlf'],
      cwd: absoluteInitDirectory,
      shell: shell,
    })
  }

  await configDispatch('git', {
    args: ['add', '-f', '.'],
    cwd: absoluteInitDirectory,
    shell: shell,
  })

  log.info('Committing...')

  await configDispatch('git', {
    args: ['commit', '-aqm', 'Firefox initialized by seed'],
    cwd: absoluteInitDirectory,
    shell: shell,
  })

  await configDispatch('git', {
    args: ['checkout', '-b', config.name.toLowerCase().replace(/\s/g, '_')],
    cwd: absoluteInitDirectory,
    shell: shell,
  })
}
