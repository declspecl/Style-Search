import { MarkdownPostProcessor, MarkdownPreviewView, MarkdownRenderChild, MarkdownRenderer, MarkdownView, Plugin } from 'obsidian';
import { Decoration, DecorationSet, PluginSpec, ViewPlugin } from '@codemirror/view';

import SearchStyleSettingsTab from 'settings';
// import StyleEditor from 'editor';
// import getStyleEditor from 'editor';

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

export default class SearchStyle extends Plugin
{
	settings: SearchStyleSettings;

	async onload()
	{
		await this.loadSettings();

		this.registerMarkdownPostProcessor((element, context) =>
		{
			const valid_elements = element.querySelectorAll(":not(script)") as NodeListOf<HTMLElement>;

			for (let i = 0; i < valid_elements.length; i++)
			{
				for (const {pattern, style} of this.settings.pattern_styling)
				{
					const r_pattern: RegExp = new RegExp(pattern, "g");

					if (r_pattern.test(valid_elements[i].textContent as string))
					{
						context.addChild(new SearchStyleMatch(
							valid_elements[i],
							valid_elements[i].textContent as string,
							new RegExp(pattern, "g"),
							style));
					}
				}
			}
		});

		this.addCommand(
		{
			id: 'search-style-toggle',
			name: 'Toggle Search Style Highlighting',
			callback: async () =>
			{
				this.settings.active = !this.settings.active;

				const markDownViewObj = this.app.workspace.getActiveViewOfType(MarkdownView);

				// @ts-ignore
				markDownViewObj.leaf.rebuildView();
			}
		});

		this.addSettingTab(new SearchStyleSettingsTab(this.app, this));
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

	deletePatternStyle(index: number)
	{
		this.settings.pattern_styling = this.settings.pattern_styling.slice(0, index).concat(this.settings.pattern_styling.slice(index + 1))
	}
}

class SearchStyleMatch extends MarkdownRenderChild
{
	pattern: RegExp;
	full_text: string;
	style: string;

	constructor(containerEl: HTMLElement, full_text: string, pattern: RegExp, style: string)
	{
		super(containerEl);

		this.pattern = pattern;
		this.full_text = full_text;
		this.style = style;
	}

	onload()
	{
		interface matchStruct
		{
			text: string;
			starting_index: number;
		};

		const nonMatches: Array<matchStruct> = [];
		const matches: Array<matchStruct> = [];

		let match;
		do
		{
			match = this.pattern.exec(this.full_text);

			if (match)
			{
				matches.push({ text: match[0], starting_index: match.index});
			}			
		}
		while (match);
		
		const elements = this.full_text.split(this.pattern);

		let lBound: number = 0;

		for (let i = 0; i < elements.length; i++)
		{
			if (elements[i] == "")
				continue;

			const element = elements[i];

			const index = this.full_text.indexOf(element, lBound);

			lBound = index + element.length;
			
			nonMatches.push({ text: elements[i], starting_index: index });
		}

		let match_index = 0;
		let nonmatch_index = 0;

		const main_span = this.containerEl.createSpan();

		while (match_index <= matches.length - 1 && nonmatch_index <= nonMatches.length - 1)
		{
			if (matches[match_index].starting_index < nonMatches[nonmatch_index].starting_index)
			{
				main_span.createSpan(
				{
					text: matches[match_index].text
				}).setAttr("style", this.style.trim());
				
				match_index += 1;
			}
			else
			{
				main_span.createSpan(
				{
					text: nonMatches[nonmatch_index].text
				});

				nonmatch_index += 1;
			}
		}

		while (match_index <= matches.length - 1)
		{
			main_span.createSpan(
			{
				text: matches[match_index].text
			}).setAttr("style", this.style.trim());
			
			match_index += 1;
		}

		while (nonmatch_index <= nonMatches.length - 1)
		{
			main_span.createSpan(
			{
				text: matches[nonmatch_index].text
			});
			
			nonmatch_index += 1;
		}
		
		this.containerEl.replaceChildren(main_span);
	}
}