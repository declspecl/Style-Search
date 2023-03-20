import { MarkdownRenderChild, Plugin } from 'obsidian';

import SearchStyleSettings from 'settings';

interface PatternStyle
{
	pattern: string,
	style: string
}

interface MyPluginSettings
{
	active: boolean;
	pattern_styling: Array<PatternStyle>
}

const DEFAULT_SETTINGS: MyPluginSettings =
{
	active: true,
	pattern_styling: []
}

export default class SearchStyle extends Plugin
{
	settings: MyPluginSettings;

	async onload()
	{
		await this.loadSettings();

		this.addCommand(
		{
			id: 'search-style-toggle',
			name: 'Toggle Search Style Highlighting',
			callback: async () =>
			{
				this.settings.active = !this.settings.active;

				this.saveSettings();
			}
		});

		this.addSettingTab(new SearchStyleSettings(this.app, this));

		this.registerDomEvent(document, 'click', (evt: MouseEvent) =>
		{
			console.log('click', evt);
		});

		this.registerMarkdownPostProcessor((element, context) =>
		{
			const search_criteria = /236P/g;
			const valid_elements = element.querySelectorAll(":not(script)") as NodeListOf<HTMLElement>;

			console.log("postprocessor called: " + valid_elements);

			for (let i = 0; i < valid_elements.length; i++)
			{
				if (search_criteria.test(valid_elements[i].textContent as string))
				{
					context.addChild(new SearchStyleMatch(valid_elements.item(i), "236P"));
				}
			}
		})

		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload()
	{
		this.saveSettings();
	}

	async loadSettings()
	{
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings()
	{
		await this.saveData(this.settings);
	}

	getPatternStyle(pattern: string): string
	{
		for (const pattern_style of this.settings.pattern_styling)
		{
			if (pattern_style.pattern === pattern)
				return pattern_style.style;
		}

		return "";
	}

	setPatternStyle(pattern: string, style: string)
	{
		console.log("before: " + this.settings.pattern_styling);

		for (let i = 0; i < this.settings.pattern_styling.length; i++)
		{
			if (this.settings.pattern_styling[i].pattern === pattern)
			{
				this.settings.pattern_styling[i].style = style;

				return;
			}
		}

		this.settings.pattern_styling.push({pattern, style});

		console.log("after: " + this.settings.pattern_styling);
	}

	deletePatternStyle(index: number)
	{
		this.settings.pattern_styling = this.settings.pattern_styling.slice(0, index).concat(this.settings.pattern_styling.slice(index + 1))
	}
}

class SearchStyleMatch extends MarkdownRenderChild
{
	text: string;

	constructor(containerEl: HTMLElement, text: string)
	{
		super(containerEl);

		this.text = text;
	}

	onload()
	{
		const matchEl = this.containerEl.createSpan(
		{
			text: "MATCH"
		});

		this.containerEl.replaceWith(matchEl);
	}
}