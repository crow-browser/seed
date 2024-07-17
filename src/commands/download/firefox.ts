import execa from 'execa'
import { existsSync, rmSync, writeFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { exec } from 'child_process';
import { promisify } from 'util';

import { bin_name } from '../..'
import { BASH_PATH, ENGINE_DIR, MELON_TMP_DIR } from '../../constants'
import { log } from '../../log'
import { commandExistsSync } from '../../utils/command-exists'
import { downloadFileToLocation } from '../../utils/download'
import { ensureDirectory, windowsPathToUnix } from '../../utils/fs'
import { init } from '../init'
import { config } from '../..'
import {
  addAddonsToMozBuild,
  downloadAddon,
  generateAddonMozBuild,
  getAddons,
  initializeAddon,
  resolveAddonDownloadUrl,
  unpackAddon,
} from './addon'
import { configPath } from '../../utils'

const execAsync = promisify(exec);

export async function handleMozillaPipChecks() {
  try {
    await execAsync('python3 --version');
    console.log('Python is already installed. Skipping installation...');
  } catch (error) {
    console.log('Python is not installed. Installation starting...');

    if (process.platform === "win32") {
      await execAsync('start ms-windows-store://pdp/?ProductId=9PJPW5LDXLZ5');
      return console.log('Please install Python from the Microsoft Store and run the command again.');
    } else if (process.platform === "darwin") {
      await execAsync('brew install python3');
    } else if (process.platform === "linux") {
      await execAsync('sudo apt-get install python3');
    } else {
      return console.log('Unsupported operating system. Please install Python manually and run the command again.');
    }
  }

  try {
    await execAsync('pip3 --version');
    console.log('pip3 is already installed. Skipping installation...');
  } catch (error) {
    console.log('pip3 is not installed. Installation starting...');

    if (process.platform === "win32") {
      await execAsync('curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py && python get-pip.py');
      await execAsync('del get-pip.py');
    } else if (process.platform === "darwin") {
      await execAsync('sudo easy_install pip');
    } else if (process.platform === "linux") {
      await execAsync('sudo apt-get install python3-pip');
    } else {
      return console.log('Unsupported operating system. Please install pip3 manually and run the command again.');
    }

    console.log('pip3 was successfully installed.');
  }

  if (process.platform === "win32") {
    if (!existsSync('c:/mozilla-build')) {
      console.log('MozillaBuild is not installed. Installation starting...');
      
      await execAsync('curl -o MozillaBuildSetup-Latest.exe https://ftp.mozilla.org/pub/mozilla/libraries/win32/MozillaBuildSetup-Latest.exe && start /wait MozillaBuildSetup-Latest.exe');
      await execAsync('del MozillaBuildSetup-Latest.exe');

      console.log('MozillaBuild was successfully installed.');
    } else {
      console.log('MozillaBuild is already installed. Skipping installation...');
    }

    return console.log('All required checks and installations were successful.');
  } else {
    console.log('Not a windows machine. Skipping MozillaBuild and pip3 checks / installations.');
  }
}

export function shouldSetupFirefoxSource() {
  return !(
    existsSync(ENGINE_DIR) &&
    existsSync(resolve(ENGINE_DIR, 'toolkit', 'moz.build'))
  )
}

export async function setupFirefoxSource(version: string) {
  await handleMozillaPipChecks();
  const firefoxSourceTar = await downloadFirefoxSource(version)

  await unpackFirefoxSource(firefoxSourceTar)

  if (!process.env.CI_SKIP_INIT) {
    log.info('Init firefox')
    await init(ENGINE_DIR)
  }
}

async function unpackFirefoxSource(name: string): Promise<void> {
  log.info(`Unpacking Firefox...`)

  ensureDirectory(ENGINE_DIR)

  let tarExec = 'tar'

  // On MacOS, we need to use gnu tar, otherwise tar doesn't behave how we
  // would expect it to behave, so this section is responsible for handling
  // that
  //
  // If BSD tar adds --transform support in the future, we can use that
  // instead
  if (process.platform == 'darwin') {
    // GNU Tar doesn't come preinstalled on any MacOS machines, so we need to
    // check for it and ask for the user to install it if necessary
    if (!commandExistsSync('gtar')) {
      throw new Error(
        `GNU Tar is required to extract Firefox's source on MacOS. Please install it using the command |brew install gnu-tar| and try again`
      )
    }

    tarExec = 'gtar'
  }

  await execa(
    tarExec,
    [
      '--strip-components=1',
      process.platform == 'win32' ? '--force-local' : undefined,
      '-xf',
      windowsPathToUnix(resolve(MELON_TMP_DIR, name)),
      '-C',
      windowsPathToUnix(ENGINE_DIR),
    ].filter(Boolean) as string[],
    {
      // HACK: Use bash shell on windows to get a sane version of tar that works
      shell: BASH_PATH || false,
    }
  )
}

async function downloadFirefoxSource(version: string) {
  const base = `https://archive.mozilla.org/pub/firefox/releases/${version}/source/`
  const filename = `firefox-${version}.source.tar.xz`

  const url = base + filename

  const fsParent = MELON_TMP_DIR
  const fsSaveLocation = resolve(fsParent, filename)

  log.info(`Locating Firefox release ${version}...`)

  await ensureDirectory(dirname(fsSaveLocation))

  if (existsSync(fsSaveLocation)) {
    log.info('Using cached download')
    return filename
  }

  // Do not re-download if there is already an existing workspace present
  if (existsSync(ENGINE_DIR))
    log.error(
      `Workspace already exists.\nRemove that workspace and run |${bin_name} download ${version}| again.`
    )

  log.info(`Downloading Firefox release ${version}...`)

  await downloadFileToLocation(url, resolve(MELON_TMP_DIR, filename))
  return filename
}

export async function downloadInternals({
  version,
  force,
}: {
  version: string
  force?: boolean
}) {
  // Provide a legible error if there is no version specified
  if (!version) {
    log.error(
      'You have not specified a version of firefox in your config file. This is required to build a firefox fork.'
    )
    process.exit(1)
  }

  if (force && existsSync(ENGINE_DIR)) {
    log.info('Removing existing workspace')
    rmSync(ENGINE_DIR, { recursive: true })
  }

  // If the .engine directory is empty, we should delete it.
  const engineIsEmpty =
    existsSync(ENGINE_DIR) &&
    (await readdir(ENGINE_DIR).then((files) => files.length === 0))
  if (engineIsEmpty) {
    log.info("'.engine/' is empty, it...")
    rmSync(ENGINE_DIR, { recursive: true })
  }

  if (!existsSync(ENGINE_DIR)) {
    await setupFirefoxSource(version)
  }

  for (const addon of getAddons()) {
    const downloadUrl = await resolveAddonDownloadUrl(addon)
    const downloadedXPI = await downloadAddon(downloadUrl, addon)

    await unpackAddon(downloadedXPI, addon)
    await generateAddonMozBuild(addon)
    await initializeAddon(addon)
  }

  await addAddonsToMozBuild(getAddons())

  config.version.version = version
  writeFileSync(configPath, JSON.stringify(config, undefined, 2))
}
