import { MarkdownRenderChild, Plugin } from 'obsidian';
import { Decoration, DecorationSet } from '@codemirror/view';

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
	decorations: DecorationSet;

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

		this.registerCodeMirror((cm) =>
		{
			const decorations: Array<Decoration> = [];
	
			// Find all occurrences of the string "236P" in the editor
			cm.doc.iter((line: any) =>
			{
				const text = line.text;
				const regex = /236P/g;
				let match;
		
				while ((match = regex.exec(text)) !== null)
				{
					const from = match.index;
					const to = from + match[0].length;
					const decoration = Decoration.mark(
					{
						from,
						to,
						tagName: 'span',
						class: 'my-decoration-class',
						attributes:
						{
							'data-tooltip': 'This is an example decoration',
						},
					});
					decorations.push(decoration);
				}
			});
	
			// Update the decorations in the editor
			const decorationSet = DecorationSet.create(cm.state.doc, decorations);
			Decoration.set(cm, decorationSet);
			this.decorations = decorationSet;
		});
	}

	// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

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