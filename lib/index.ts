import commander from 'commander'
import * as dotenv from 'dotenv'
import path from 'path'
import { Fetcher } from './fetcher'

export type SupportedGitHosts = 'github' | 'gitlab'//|'bitbucket'|'azure'

export const GIT_HOST_GITHUB = 'github'
export const GIT_HOST_GITLAB = 'gitlab'
export const GIT_HOST_ALL: SupportedGitHosts[] = [GIT_HOST_GITHUB, GIT_HOST_GITLAB]//, 'bitbucket', 'azure']

export interface ProgramOptions {
	repo: string
	path: string
	host: SupportedGitHosts
	folder: string
	hooks?: string
	token?: string
}

export type ProgramCommander = ProgramOptions | commander.CommanderStatic

const OPTION_REPO = 'repo'
const OPTION_PATH = 'path'
const OPTION_HOOKS = 'hooks'
const OPTION_HOST = 'host'
const OPTION_TOKEN = 'token'
const OPTION_FOLDER = 'folder'
const OPTION_CONFIG = 'config'


const main = async (argv = process.argv) => {
	const configIndex = argv.findIndex(el => el === '-c' || el === `--${OPTION_CONFIG}`)
	let configPath = `${process.cwd()}/.env`

	if (configIndex >= 1 && configIndex < argv.length - 2 && !argv[configIndex].startsWith('-')) {
		const configPathRaw = argv[configIndex + 1]
		configPath = path.resolve(process.cwd(), configPathRaw)
	}

	dotenv.config({ path: configPath })

	commander
		.requiredOption(`-r, --${OPTION_REPO} <${OPTION_REPO}>`, 'the translation repo id, on gitlab this is the project id while on github this is the owner+repo name. E.g. 1234567, halvardssm/translations', process.env.TRANS_REPO)
		.option(`-p, --${OPTION_PATH} <${OPTION_PATH}>`, 'path to the folder containing the translations, if empty it will take the root', process.env.TRANS_PATH || '.')
		.option(`--${OPTION_HOST} <${OPTION_HOST}>`, 'the git host, can be one of: github, gitlab', process.env.TRANS_HOST || 'github')
		.option(`-f, --${OPTION_FOLDER} <${OPTION_FOLDER}>`, 'the download folder', process.env.TRANS_PATH || 'src/translations')
		.option(`-c, --${OPTION_CONFIG} <${OPTION_CONFIG}>`, 'path to the env file, defaults to ./.env', configPath)
		.option(`--${OPTION_HOOKS} <${OPTION_HOOKS}>`, 'string of webhook codes separated by space, ex: "123 123"', process.env.TRANS_HOOKS)
		.option(`-t, --${OPTION_TOKEN} <${OPTION_TOKEN}>`, 'the gitlab token', process.env.TRANS_TOKEN)
		.parse(argv);

	[OPTION_REPO].forEach(el => {
		if (commander[el] === undefined || commander[el] === '') throw new Error(`Flag ${el} not defined`)
	})

	let program: ProgramOptions = commander as ProgramCommander as ProgramOptions

	const fetcher = new Fetcher(program)

	await fetcher.run()
}

export default main
module.exports = main
