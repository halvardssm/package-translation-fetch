import * as fs from 'fs'
import fetch from 'node-fetch';

export interface FetcherOptions {
	token: string
	folder: string
	downloadPath: string
	repo: string
	hooks: string[]
	apiUrl?: string
}

export interface TranslationInformation {
	path: string
	name: string
}

export class Fetcher {
	private token: string
	private folder: string
	private downloadPath: string
	private repo: string
	private hooks: string[]
	private repoUrl: string

	constructor({ token, hooks, folder, downloadPath, apiUrl, repo }: FetcherOptions) {
		this.token = token
		this.hooks = hooks
		this.folder = folder
		this.downloadPath = downloadPath
		this.repo = repo
		this.repoUrl = this._generateUrl(apiUrl)
	}

	async run() {
		try {
			const fileRegExp = RegExp('[a-z_-]+.json')
			console.log("Starting translation fetch")

			await this._repoExistsFn()

			await this._triggerHooks()

			await this._timeout(10000)

			const translationInfoRaw = await this._getTranslationInfo()

			const translationInfo = (await translationInfoRaw.json() as Array<TranslationInformation>)
				.filter((el) => fileRegExp.test(el.path))

			await this._fetchTranslations(translationInfo)

			console.log("Translations downloaded")
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	}

	private _generateUrl(apiUrl: string = 'https://gitlab.com/api/v4'): string {
		const url = `${apiUrl}/projects/${this.repo}/repository`

		return url
	}

	private async _repoExistsFn() {
		console.log('Checking if repo exists')

		return await fetch(`${this.repoUrl}/tree`, { headers: { 'Private-Token': this.token } })
	}

	private async _triggerHooks() {
		console.log('Triggering Hooks')

		await Promise.all(this.hooks.map((el: any) => {
			const url = `https://api.poeditor.com/webhooks/${el}`

			console.log(`Triggering: ${url}`)

			return fetch(url)
		}))
	}

	private async _getTranslationInfo() {
		console.log('Fetching translation info')

		return await fetch(`${this.repoUrl}/tree?path=${this.folder}`, { headers: { 'Private-Token': this.token } })
	}

	private async _timeout(duration: number) {
		console.log(`Waiting ${duration / 1000} seconds for POE to commit changes`)

		return await new Promise((resolve) => setTimeout(resolve, duration))
	}

	private async _fetchTranslations(data: Array<TranslationInformation>) {
		console.log('Downloading translations')

		for await (const el of data) {
			const fileUrl = el.path.replace('/', '%2F')

			const file = await fetch(`${this.repoUrl}/files/${fileUrl}/raw?ref=master`, { headers: { 'Private-Token': this.token } })

			const fileDownloadPath = `${process.cwd()}/${this.downloadPath}`

			fs.mkdirSync(fileDownloadPath, { recursive: true })
			fs.writeFileSync(
				`${fileDownloadPath}/${el.name}`,
				await file.buffer()
			)
			console.log(`${el.name} saved`)
		}
	}
}
