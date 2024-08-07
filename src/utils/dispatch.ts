import { BASH_PATH } from '../constants'
import { log } from '../log'
import { exec } from 'node:child_process'

export const removeTimestamp = (input: string): string =>
  input.replace(/\s\d{1,5}:\d\d\.\d\d /g, '')

export const configDispatch = async (
  cmd: string,
  config?: {
    args?: string[]
    cwd?: string
    killOnError?: boolean
    logger?: (data: string) => void
    shell?: 'default' | 'unix' | 'bash'
    env?: Record<string, string>
  }
): Promise<boolean> => {
  const logger = config?.logger || ((data: string) => log.info(data))
  let shell: string | boolean = false

  if (config?.shell) {
    switch (config.shell) {
      case 'default': break
      case 'unix': shell = BASH_PATH || false; break
      case 'bash': shell = BASH_PATH || false; break
      default: log.error(`dispatch() does not understand the shell '${shell}'`); break
    }
  }

  const handle = (data: string | Error, killOnError?: boolean) => {
    const dataAsString = data.toString()
    for (const line of dataAsString.split('\n')) {
      if (line.length > 0) logger(removeTimestamp(line))
    }
    if (killOnError) {
      log.error('Command failed. See error above.')
    }
  }

  return new Promise((resolve) => {
    const command = `"${cmd}" ${config?.args?.map(arg => `"${arg}"`).join(' ') || ''}`
    console.log(command)
    const proc = exec(command, {
      cwd: config?.cwd || process.cwd(),
      shell: shell ? String(shell) : undefined,
      env: {
        ...config?.env,
        ...process.env,
      },
    })

    proc.stdout?.on('data', (d) => handle(d))
    proc.stderr?.on('data', (d) => handle(d))

    proc.stdout?.on('error', (d) => handle(d, config?.killOnError || false))
    proc.stderr?.on('error', (d) => handle(d, config?.killOnError || false))

    proc.on('exit', () => {
      resolve(true)
    })
  })
}

export const dispatch = (
  cmd: string,
  arguments_?: string[],
  cwd?: string,
  killOnError?: boolean,
  logger = (data: string) => log.info(data)
): Promise<boolean> => {
  return configDispatch(cmd, {
    args: arguments_,
    cwd: cwd,
    killOnError: killOnError,
    logger: logger,
  })
}