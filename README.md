# Fetch

![CI](https://github.com/halvardssm/package-translation-fetch/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/translation-fetch.svg)](https://www.npmjs.com/package/translation-fetch)

Download your translations as JSON to use with your favourite internationalization library. This library can also trigger webhooks from POEditor if this is needed. If you want support for other translation hosting platforms, please submit an issue or a PR.

## Instalation

This library contains support for multiple languages, and if you wish to see your added, please submit an issue or a PR.

### NPM

Install the package via you favourite package manager.

```shell
# Yarn
yarn add -D translation-fetch

# NPM
npm i -D translation-fetch
```

Simply place `translation-fetch` in your scripts like this:

```json
"scripts": {
  "translations": "translation-fetch [...optional args]"
}
```

## Usage

To use this library, you need to have a repository with a translation folder containing translations. This can either be a dedicated translation repo, or for a different project. Currently this library only checks for `JSON` files, and regmatches on the file ending.

You can also integrate a webhook calls for POEditor for syncing your translations see [FAQ](https://poeditor.com/kb/code-hosting-service-integrations). You will need to add webhooks to each language for syncing with your repository.

If you store the translations in a private repository, you will need a login token.

Currently only `GitHub` and `GitLab` are supported for hosing of the translation files.

You can either pass command line arguments or use a `.env` file

Only repo is mandatory if the repo containing translations is public, the translations are in the root folder, and you dont want to use hooks. If a `.env` file exists, it will take default values from there and overwrite them with the cli arguments.

### CLI Arguments

  `-r, --repo <repo>`      the translation repo id, on gitlab this is the project id while on github this is the owner+repo name. E.g. 1234567, package/translations\
  `-p, --path <path>`      path to the folder containing the translations, if empty it will take the root (default: "./")\
  `--host <host>`          the git host, can be one of: github, gitlab (default: "github")\
  `-f, --folder <folder>`  the download folder (default: "src/translations")\
  `-b, --branch <branch>`  the download folder (default: "main")\
  `--hooks <hooks>`        string of webhook codes separated by space, ex: "123 123"\
  `-t, --token <token>`    the authentication token\
  `-e, --env <env>`        path to the env file, defaults to ./.env (default: "./.env")\
  `-h, --help`             display help for command

### .env File

LOCALES_REPO=owner/translations\
LOCALES_PATH=test\
LOCALES_HOST=github\
LOCALES_FOLDER=translations\
LOCALES_HOOKS="asdf1234 asdf1324"\
LOCALES_TOKEN=asdf1234asdf1234\
LOCALES_BRANCH=main
