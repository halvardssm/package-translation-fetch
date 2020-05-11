# Fetch

Download your POEditor translations as JSON to use with your favourite internationalization library.

## Instalation

`yarn add -D translation-fetch` or `npm i -D translation-fetch`

## Usage

To use this package you will need a [POEditor](https://poeditor.com/) account and have a repository connected to your translations see [FAQ](https://poeditor.com/kb/code-hosting-service-integrations). You will also need to add webhooks to each language for exporting to your repository. If you store the translations in a private repository, you will need a login token.

You can either pass command line arguments or use a `.env` file

### CLI Arguments

  `-r, --repo <repo>`      the translation repo id, on gitlab this is the project id while on github this is the owner+repo name. E.g. 1234567, package/translations\
  `-p, --path <path>`      path to the folder containing the translations, if empty it will take the root (default: "./")\
  `--host <host>`          the git host, can be one of: github, gitlab (default: "github")\
  `-f, --folder <folder>`  the download folder (default: "src/translations")\
  `-c, --config <config>`  path to the env file, defaults to ./.env (default: "./.env")\
  `--hooks <hooks>`        string of webhook codes separated by space, ex: "123 123"\
  `-t, --token <token>`    the gitlab token\
  `-h, --help`             output usage information\
