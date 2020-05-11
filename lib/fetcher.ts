import * as fs from 'fs'
import nodeFetch, { RequestInfo, RequestInit, Response, HeaderInit, HeadersInit } from 'node-fetch';
import { ProgramOptions, SupportedGitHosts, GIT_HOST_GITHUB, GIT_HOST_GITLAB, GIT_HOST_ALL } from './index';

export interface TranslationInformation {
	path: string
	name: string
}

export class Fetcher {
	private state: ProgramOptions
	private apiUrl: string

	constructor(options: ProgramOptions) {
		this.state = { ...this.state, ...options }
		this.apiUrl = this._parseApiUrl()
	}

	async run() {
		try {
			const fileRegExp = RegExp('[a-z_-]+.json')
			console.info("Starting translation fetch")

			const translationInfoRaw = await this._getTranslationInfo()

			await this._triggerHooks()

			await this._timeout(10000)

			const translationInfo = (await translationInfoRaw.json() as Array<TranslationInformation>)
				.filter((el) => fileRegExp.test(el.path))

			await this._fetchTranslations(translationInfo)

			console.log("Translations downloaded")
		} catch (error) {
			console.error(error)
			process.exit(1)
		}
	}

	private async _fetch(url: RequestInfo, appendHeader: boolean = false) {
		let headers: RequestInit

		if (this.state.token && appendHeader) {
			let headerToken: HeadersInit

			switch (this.state.host) {
				case GIT_HOST_GITHUB:
					headerToken = { 'Authorization': `token ${this.state.token}` }
				case GIT_HOST_GITLAB:
					headerToken = { 'Private-Token': this.state.token }
			}

			headers = { headers: headerToken }
		}

		const result = await nodeFetch(url, headers)

		if (result.status !== 200) throw new Error(`Fetch failed:\n${url}\n${await result.text()}`)

		return result
	}

	private _parseApiUrl(): string {
		switch (this.state.host) {
			case GIT_HOST_GITHUB:
				return 'https://api.github.com/repos'
			case GIT_HOST_GITLAB:
				return 'https://gitlab.com/api/v4/projects'
			default:
				throw new Error('Git host not supported')
		}
	}

	private _urlSwitch(options: { [name in SupportedGitHosts]: string }) {
		return options[this.state.host]
	}

	private async _triggerHooks() {
		console.info('Triggering Hooks')

		await Promise.all(this.state.hooks.split(' ').map((el: any) => {
			const url = `https://api.poeditor.com/webhooks/${el}`

			return this._fetch(url)
		}))
	}

	private async _timeout(duration: number) {
		console.info(`Waiting ${duration / 1000} seconds for POEditor to commit changes`)

		return await new Promise((resolve) => setTimeout(resolve, duration))
	}

	private async _getTranslationInfo() {
		console.info('Fetching translation info')

		let append = this._urlSwitch({ gitlab: `/repository/tree?path=${this.state.folder}`, github: `/contents/${this.state.folder}` })

		return await this._fetch(`${this.apiUrl}/${this.state.repo}${append}`, true)
	}

	private async _parseContent(file: Response) {
		switch (this.state.host) {
			case GIT_HOST_GITLAB:
				return await file.buffer()
			case GIT_HOST_GITHUB:
				const content = await file.json()
				return content.content
			default:
				return await file.json()
		}
	}

	private async _fetchTranslations(data: Array<TranslationInformation>) {
		console.info('Downloading translations')

		for await (const el of data) {
			const fileUrl = el.path.replace('/', '%2F')

			let append = this._urlSwitch({ gitlab: `/repository/files/${fileUrl}/raw?ref=master`, github: `/contents/${fileUrl}` })

			const file = await this._fetch(`${this.apiUrl}/${this.state.repo}${append}`, true)

			const content = await this._parseContent(file)

			const fileDownloadPath = `${process.cwd()}/${this.state.path}`

			fs.mkdirSync(fileDownloadPath, { recursive: true })
			fs.writeFileSync(
				`${fileDownloadPath}/${el.name}`,
				content
			)
			console.info(`${el.name} saved`)
		}
	}
}
