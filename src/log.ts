import prompts from 'prompts'
import { colors } from './constants/colors'

const formatToDoubleDigit = (r: number) =>
  r.toString().length == 1 ? `0${r}` : r

const MAX_LOG_TYPE_LENGTH = 9 // Length of the longest log type (e.g., "SUCCESS") + 1

const centerLogType = (type: string) => {
  const padding = MAX_LOG_TYPE_LENGTH - type.length
  const padStart = Math.floor(padding / 2)
  const padEnd = padding - padStart
  return ' '.repeat(padStart) + type + ' '.repeat(padEnd)
}

class Log {
  private startTime: number

  _isDebug = false

  constructor() {
    const d = new Date()

    this.startTime = d.getTime()
  }

  getDiff(): string {
    const d = new Date()

    const currentTime = d.getTime()

    const elapsedTime = currentTime - this.startTime

    const secs = Math.floor((elapsedTime / 1000) % 60)
    const mins = Math.floor((elapsedTime / (60 * 1000)) % 60)
    const hours = Math.floor((elapsedTime / (60 * 60 * 1000)) % 24)

    return `${formatToDoubleDigit(hours)}:${formatToDoubleDigit(
      mins
    )}:${formatToDoubleDigit(secs)}`
  }

  set isDebug(value: boolean) {
    log.debug(`Logger debug mode has been ${value ? 'enabled' : 'disabled'}`)
    this._isDebug = value
    log.debug(`Logger debug mode has been ${value ? 'enabled' : 'disabled'}`)
  }

  get isDebug() {
    return this._isDebug
  }

  debug(...arguments_: unknown[]): void {
    if (this.isDebug) console.debug(...arguments_)
  }

  info(...arguments_: unknown[]): void {
    console.info(
      `${colors.blue}[${colors.reset}${centerLogType('INFO')}${colors.blue}]${colors.reset} [${colors.blue}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }

  warning(...arguments_: unknown[]): void {
    console.warn(
      `${colors.yellow}[${colors.reset}${centerLogType('WARNING')}${colors.yellow}]${colors.reset} [${colors.yellow}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }

  async hardWarning(...arguments_: unknown[]): Promise<void> {
    console.warn(
      `${colors.yellow}[${colors.reset}${centerLogType('WARNING')}${colors.yellow}]${colors.reset} [${colors.yellow}${this.getDiff()}${colors.reset}] ${arguments_}`
    )

    const { answer } = await prompts({
      type: 'confirm',
      name: 'answer',
      message: 'Are you sure you want to continue?',
    })

    if (!answer) process.exit(0)
  }

  success(...arguments_: unknown[]): void {
    console.log()
    console.log(
      `${colors.green}[${colors.reset}${centerLogType('SUCCESS')}${colors.green}]${colors.reset} [${colors.green}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }

  error(...arguments_: (Error | unknown)[]): never {
    throw arguments_[0] instanceof Error
      ? arguments_[0]
      : new Error(
          ...arguments_.map((a) =>
            typeof a !== 'undefined' ? (a as object).toString() : a
          )
        )
  }

  askForReport(): void {
    console.info(
      'The following error is a bug. Please open an issue on the seed issue structure with a link to your repository and the output from this command.'
    )
    console.info(
      'The seed issue tracker is located at: https://github.com/crow-browser/seed/issues'
    )
  }

  checkSuccess(...arguments_: unknown[]): void {
    console.log(
      `${colors.green}[${colors.reset}${centerLogType('SUCCESS')}${colors.green}]${colors.reset} [${colors.green}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }

  checkError(...arguments_: unknown[]): void {
    console.log(
      `${colors.red}[${colors.reset}${centerLogType('ERROR')}${colors.red}]${colors.reset} [${colors.red}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }

  checkWarning(...arguments_: unknown[]): void {
    console.log(
      `${colors.yellow}[${colors.reset}${centerLogType('WARNING')}${colors.yellow}]${colors.reset} [${colors.yellow}${this.getDiff()}${colors.reset}] ${arguments_}`
    )
  }
}

export const log = new Log()
