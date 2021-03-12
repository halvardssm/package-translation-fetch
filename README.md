# Fetch

![CI](https://github.com/halvardssm/package-translation-fetch/workflows/CI/badge.svg)
[![NPM version](https://img.shields.io/npm/v/translation-fetch.svg)](https://www.npmjs.com/package/translation-fetch)

Download your POEditor translations as JSON to use with your favourite internationalization library.

## Instalation

`yarn add -D translation-fetch` or `npm i -D translation-fetch`

## Usage

To use this package you will need a [POEditor](https://poeditor.com/) account and have a repository connected to your translations see [FAQ](https://poeditor.com/kb/code-hosting-service-integrations). You will also need to add webhooks to each language for exporting to your repository. If you store the translations in a private repository, you will need a login token.

You can either pass command line arguments or use a `.env` file

Only repo is mandatory if the repo containing translations is public, the translations are in the root folder, and you dont want to trigger the hooks. If a `.env` file exists, it will take default values from there and overwrite them with the cli arguments.

Simply place `translation-fetch` in your scripts like this:

```json
"scripts": {
  "translations": "translation-fetch"
}
```

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
LOCALES_HOOKS=asdf1234 asdf1324\
LOCALES_TOKEN=asdf1234asdf1234\
LOCALES_BRANCH=main
