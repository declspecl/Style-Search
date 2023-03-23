import { Plugin } from 'obsidian';

import SSSettingsTab from 'settingsTab';
import SSStyledSection from 'styledSection';

/*
	Settings Configuration
*/

export interface PatternStyle
{
	pattern: string,
	style: string
}

export interface SearchStyleSettings
{
	active: boolean;
	pattern_styling: Array<PatternStyle>
}

const DEFAULT_SETTINGS: SearchStyleSettings =
{
	active: true,
	pattern_styling: []
}

/*
	Main Plugin
*/

export default class SearchStyle extends Plugin
{
	settings: SearchStyleSettings;

	async onload()
	{
		await this.loadSettings();
		
		this.addSettingTab(new SSSettingsTab(this.app, this));

		this.registerMarkdownPostProcessor((element, context) =>
		{
			if (!this.settings.active) return;

			const valid_elements = element.querySelectorAll(":not(script)") as NodeListOf<HTMLElement>;

			for (let i = 0; i < valid_elements.length; i++)
			{
				for (const {pattern, style} of this.settings.pattern_styling)
				{
					const r_pattern: RegExp = new RegExp(pattern, "g");

					if (r_pattern.test(valid_elements[i].textContent as string))
					{
						context.addChild(new SSStyledSection(
							valid_elements[i],
							valid_elements[i].textContent as string,
							new RegExp(pattern, "g"),
							style)
						);
					}
				}
			}
		});

		/* EXPERIMENTAL: redraws markdownview to reset highlighting but is unstable

		this.addCommand(
		{
			id: 'search-style-toggle',
			name: 'Toggle Search Style Highlighting',
			callback: async () =>
			{
				this.settings.active = !this.settings.active;

				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);

				// @ts-ignore
				markdownView.leaf.rebuildView();
			}
		}); */
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

	// returns the style mapped to a pattern if it exists, and an empty string if it does not
	getPatternStyle(pattern: string): string
	{
		for (const pattern_style of this.settings.pattern_styling)
		{
			if (pattern_style.pattern === pattern)
				return pattern_style.style;
		}

		return "";
	}

	// updates the style of a pattern if it exists, creating the entry if it does not exist
	setPatternStyle(pattern: string, style: string): void
	{
		for (let i = 0; i < this.settings.pattern_styling.length; i++)
		{
			if (this.settings.pattern_styling[i].pattern === pattern)
			{
				this.settings.pattern_styling[i].style = style;

				return;
			}
		}

		this.settings.pattern_styling.push({pattern, style});
	}

	// edits the pattern styling map to not include the entry at the given index
	deletePatternStyle(index: number): void
	{
		if (index >= 0 && index < this.settings.pattern_styling.length)
			this.settings.pattern_styling = this.settings.pattern_styling.slice(0, index).concat(this.settings.pattern_styling.slice(index + 1))
	}
}

// EOF