import prompts from 'prompts'
import { colors } from './constants/colors'

const formatToDoubleDigit = (r: number) =>
  r.toString().length == 1 ? `0${r}` : r

const getPadding = (str: string) => {
  return `${str}${' '.repeat(8 - str.length)}`
}

const MAX_LOG_TYPE_LENGTH = 8 // Length of the longest log type (e.g., "SUCCESS") + 1

class Log {
  private startTime: number
  private _isDebug = false

  constructor() {
    this.startTime = new Date().getTime()
  }

  private getDate(): string {
    return new Date().toLocaleString()
  }

  set isDebug(value: boolean) {
    this.debug(`Logger debug mode has been ${value ? 'enabled' : 'disabled'}`)
    this._isDebug = value
    this.debug(`Logger debug mode has been ${value ? 'enabled' : 'disabled'}`)
  }

  get isDebug() {
    return this._isDebug
  }

  debug(...args: unknown[]): void {
    if (this.isDebug) console.debug(...args)
  }

  info(...args: unknown[]): void {
    console.info(
      `${colors.blue}[ Seed ] - ${colors.reset}${this.getDate()} ${colors.blue} ${getPadding('LOG')} ${colors.reset}${args}`
    )
  }

  warning(...args: unknown[]): void {
    console.warn(
      `${colors.blue}[ Seed ] - ${colors.reset}${this.getDate()} ${colors.yellow} ${getPadding('WARNING')} ${colors.reset}${args}`
    )
  }

  async hardWarning(...args: unknown[]): Promise<void> {
    this.warning(...args)

    const { answer } = await prompts({
      type: 'confirm',
      name: 'answer',
      message: 'Are you sure you want to continue?',
    })

    if (!answer) process.exit(0)
  }

  success(...args: unknown[]): void {
    console.log()
    console.log(
      `${colors.blue}[ Seed ] - ${colors.reset}${this.getDate()} ${colors.green} ${getPadding('SUCCESS')} ${colors.reset}${args}`
    )
  }

  error(...args: (Error | unknown)[]): never {
    throw args[0] instanceof Error
      ? args[0]
      : new Error(
          ...args.map((a) =>
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

  checkSuccess(...args: unknown[]): void {
    this.success(...args)
  }

  checkError(...args: unknown[]): void {
    console.log(
      `${colors.blue}[ Seed ] - ${colors.reset}${this.getDate()} ${colors.red} ${getPadding('ERROR')} ${colors.reset}${args}`
    )
  }

  checkWarning(...args: unknown[]): void {
    this.warning(...args)
  }
}

export const log = new Log()
