import * as dotenv from 'dotenv'
import commander from 'commander'
import { Fetcher } from './fetcher'
import path from 'path'

export interface ProgramOptions extends commander.CommanderStatic {
	hooks: string
	repo: string
	folder: string
	token: string
	path: string
}

const OPTION_HOOKS = 'hooks'
const OPTION_REPO = 'repo'
const OPTION_FOLDER = 'folder'
const OPTION_TOKEN = 'token'
const OPTION_PATH = 'path'
const OPTION_CONFIG = 'config'

const main = async (argv = process.argv) => {
	const configIndex = argv.findIndex(el => el === '-c' || el === '--config')
	let configPath = `${process.cwd()}/.env`
	if (configIndex >= 1 && configIndex < argv.length - 2 && !argv[configIndex].startsWith('-')) {
		const configPathRaw = argv[argv.findIndex(el => el === '-c' || el === '--config') + 1]
		configPath = path.resolve(process.cwd(), configPathRaw)
	}

	dotenv.config({ path: configPath })

	commander
		.option(`-h, --${OPTION_HOOKS} <${OPTION_HOOKS}>`, 'a string of webhook codes, ex: "123 123"', process.env.TRANS_HOOKS)
		.option(`-r, --${OPTION_REPO} <${OPTION_REPO}>`, 'the translation folder repo id on gitlab', process.env.TRANS_REPO)
		.option(`-f, --${OPTION_FOLDER} <${OPTION_FOLDER}>`, 'the translation folder name in the repo on gitlab', process.env.TRANS_FOLDER)
		.option(`-t, --${OPTION_TOKEN} <${OPTION_TOKEN}>`, 'the gitlab token', process.env.TRANS_TOKEN)
		.option(`-p, --${OPTION_PATH} <${OPTION_PATH}>`, 'the download folder', 'src/translations')
		.option(`-c, --${OPTION_CONFIG} <${OPTION_CONFIG}>`, 'path to the env file, defaults to ./.env', './.env')
		.parse(argv);

	[OPTION_HOOKS, OPTION_REPO, OPTION_FOLDER, OPTION_TOKEN].forEach(el => {
		if (commander[el] === undefined || commander[el] === '') throw new Error(`Flag ${el} not defined`)
	})

	let program: ProgramOptions = commander as unknown as ProgramOptions

	const fetcher = new Fetcher({
		repo: program.repo,
		token: program.token,
		folder: program.folder,
		downloadPath: program.path,
		hooks: program.hooks.split(' ')
	})

	await fetcher.run()
}

export default main
module.exports = main
