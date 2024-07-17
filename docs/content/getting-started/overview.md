+++
title = "Setting up your project"
weight = 5
+++

## Getting started with samurai

### What is samurai

Samurai is a build tool and documentation for creating firefox-based browsers. Its goal is to simplify the process of creating web browsers to encourage competition and development within the space.

### Getting help

If you are having problems with following these instructions, or with samurai in general, please contact us. You can [create a discussion on github](https://github.com/PraxiveSoftware/samurai/discussions/new), ping @jonasfranke (BinaryBlazer - Jonas F. Franke) on the [Praxive Community Discord](https://discord.gg/praxive).

### System requirements

- **OS**: Windows, Linux and MacOS
- **Samurai dependencies**: NodeJS and npm
- **Browser dependencies**: Will be handled by bootstrapping

### Getting started

The first thing you are going to need to do is to install Samurai. As it is a nodejs program it can be installed through npm or yarn.

```sh
npm install -g @praxive/samurai@latest
# or
yarn global add @praxive/samurai@latest

# Note: Linux and mac users may have to run the above command with sudo
```

Now create a git repo and clone it to your local machine. Then run the following:

```sh
samurai setup-project
```

This will ask you a variety of questions in relation to your project setup. Firstly, the release of the browser you want to bind to.

```
? Select a product to fork › - Use arrow-keys. Return to submit.
❯   Firefox stable
    Firefox extended support (older)
    Firefox extended support (newer)
    Firefox developer edition (Not recommended)
    Firefox beta (Not recommended)
```

You can change what version you are bound to at any time. Pulse Browser currently uses the stable releases, but if you want a lower workload, the newer Extended Support releases might be good for you.

Then next is the version of the browser you want to use. By default samurai will populate this with the latest version available, which we recommend using. Simply click enter to accept.

```
? Enter the version of this product › 102.0.1
```

Next it will ask for the name of your browser. Avoid references to Firefox or other Mozilla brands, as this is likely to lead to trademark and copyright issues down the road.

```
? Enter a product name › Samurai Example Browser
```

The binary name is the name that your program will be run from. We recommend that you add `-browser` to the end to [avoid conflicts with common utilities](https://github.com/dothq/browser/issues/604).

```
? Enter the name of the binary › samurai-example-browser
```

Vendor is the company (or solo developer) who is creating the browser.

```
? Enter a vendor › Fushra
```

The appid follows reverse dns naming conventions. For example, Fushra owns the domain `fushra.com`, so our browser is `com.fushra.browser.desktop`. If you do not have a domain, you can use your username / pseudonym as the appid, e.g. `trickypr.watermelon`.

```
? Enter an appid › dev.samurai.example
```

Next you need to chose a starting template for your browser. If you know what you are doing, you can go with `None` and configure it how you like. Otherwise, we recommend you stick with `UserChrome`.

```
? Select a ui mode template › - Use arrow-keys. Return to submit.
    None
❯   User Chrome (custom browser css, simplest)
```

Now you have created the directory structure for your project, you can build it for the first time. First, ask samurai to download the firefox source.

```sh
samurai download
```

If you are running this for the first time, you will need to install the firefox dependencies. You can do this via boostrapping:

```sh
samurai bootstrap
```

If you encour any errors with not found pip or MozillaBuild (MozillaBuild: Windows Only) while running the bootstrap command, you can try running the following command:

```sh
samurai download-mb-pip
```

After the source code has been downloaded, the changes to firefox described in the source code must be applied.

```sh
samurai import
```

After running the importation, we have to add files and create our first commit.

```sh
samurai commit
```

Finally, you can start building the firefox source code. This takes around an hour and a half on my computer, but the binary output will be cached, making later builds faster

```sh
samurai build
```

Now you can finally start the browser!

```sh
samurai run
```

## Common errors

Here are some common errors that you might run into whilst running `samurai build` and some potential fixes.

### Anything to do with `wasm-ld`

On Arch linux, there were two errors that were thrown:

```
Executable "wasm-ld" doesn't exist!
wasm-ld: error: cannot open /usr/lib/clang/{CLANG_VERSION}/lib/wasi/libclang_rt.builtins-wasm32.a: No such file or directory
```

On Linux, I fixed the first error by installing `ldd`:

```sh
apt-get install lld-7 # Debian
apt-get install lld-8 # Ubuntu
apk add lld # Alpine
pacman -S lld # Arch
dnf install lld # Fedora
```

The second error was fixed by installing the associated wasm libraries:

```sh
sudo pacman -Syu wasi-libc wasi-libc++ wasi-compiler-rt
```

You will need to port the above command to your distrobution. If you do not care about the improved security of sandboxed libraries, you can simply disable them by adding the following to ``
