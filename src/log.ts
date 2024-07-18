// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
import prompts from "prompts";
import { colors } from "./constants/colors";

const formatToDoubleDigit = (r: number) =>
  r.toString().length == 1 ? `0${r}` : r;

class Log {
  private startTime: number;

  _isDebug = false;

  constructor() {
    const d = new Date();

    this.startTime = d.getTime();
  }

  getDiff(): string {
    const d = new Date();

    const currentTime = d.getTime();

    const elapsedTime = currentTime - this.startTime;

    const secs = Math.floor((elapsedTime / 1000) % 60);
    const mins = Math.floor((elapsedTime / (60 * 1000)) % 60);
    const hours = Math.floor((elapsedTime / (60 * 60 * 1000)) % 24);

    return `${formatToDoubleDigit(hours)}:${formatToDoubleDigit(
      mins
    )}:${formatToDoubleDigit(secs)}`;
  }

  set isDebug(value: boolean) {
    log.debug(`Logger debug mode has been ${value ? "enabled" : "disabled"}`);
    this._isDebug = value;
    log.debug(`Logger debug mode has been ${value ? "enabled" : "disabled"}`);
  }

  get isDebug() {
    return this._isDebug;
  }

  /**
   * A version of info that only outputs when in debug mode.
   *
   * @param args The information you want to provide to the user
   */
  debug(...arguments_: unknown[]): void {
    if (this.isDebug) console.debug(...arguments_);
  }

  /**
   * Provides information to the user. If you intend to provide debugging
   * information that should be hidden unless verbose mode is enabled, use
   * `debug` instead.
   *
   * @param args The information you want to provide to the user
   */
  info(...arguments_: unknown[]): void {
    console.info(colors.blue, this.getDiff(), ...arguments_, colors.reset);
  }

  /**
   * Provides text intended to be a warning to the user. If it is not critical,
   * for example, something is missing, but probably doesn't matter, use `info`
   * or even `debug` instead.
   *
   * @param args The information you want to provide to the user
   */
  warning(...arguments_: unknown[]): void {
    console.warn(colors.yellow, this.getDiff(), ...arguments_, colors.reset);
  }

  /**
   * A warning that requires the user to take an action to continue, otherwise
   * the process will exit.
   *
   * @param args The information you want to provide to the user
   */
  async hardWarning(...arguments_: unknown[]): Promise<void> {
    console.info(
      colors.yellow,
      this.getDiff(),
      ...arguments_,
      colors.reset,
      "\n"
    );

    const { answer } = await prompts({
      type: "confirm",
      name: "answer",
      message: "Are you sure you want to continue?",
    });

    if (!answer) process.exit(0);
  }

  /**
   * Outputs a success message to the console
   *
   * @param args The information you want to provide to the user
   */
  success(...arguments_: unknown[]): void {
    console.log();
    console.log(colors.green, this.getDiff(), ...arguments_, colors.reset);
  }

  /**
   * Throws an error based on the input
   *
   * @param args The error you want to throw or a type that you want to convert to an error
   */
  error(...arguments_: (Error | unknown)[]): never {
    throw arguments_[0] instanceof Error
      ? arguments_[0]
      : new Error(
          ...arguments_.map((a) =>
            typeof a !== "undefined" ? (a as object).toString() : a
          )
        );
  }

  /**
   * Asks for an error report to our issue tracker. Should be used in chases
   * where we don't think an error will occur, but we want to know if it does
   * to fix it
   */
  askForReport(): void {
    console.info(
      "The following error is a bug. Please open an issue on the samurai issue structure with a link to your repository and the output from this command."
    );
    console.info(
      "The samurai issue tracker is located at: https://github.com/PraxiveSoftware/samurai/issues"
    );
  }

  /**
   * Outputs a success message to the console for the check command
   *
   * @param args The information you want to provide to the user
   */
  checkSuccess(...arguments_: unknown[]): void {
    console.log(colors.green, this.getDiff(), ...arguments_, colors.reset);
  }

  /**
   * Outputs a error message to the console for the check command
   *
   * @param args The information you want to provide to the user
   */
  checkError(...arguments_: unknown[]): void {
    console.log(colors.red, this.getDiff(), ...arguments_, colors.reset);
  }

  /**
   * Outputs a warning message to the console for the check command
   *
   * @param args The information you want to provide to the user
   */
  checkWarning(...arguments_: unknown[]): void {
    console.log(colors.yellow, this.getDiff(), ...arguments_, colors.reset);
  }
}

export const log = new Log();
