import { App, Editor, MarkdownPostProcessorContext, MarkdownRenderChild, MarkdownRenderer, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, ToggleComponent } from 'obsidian';

interface MyPluginSettings
{
	active: boolean;
	pattern_styling: Map<string, string>;
}

const DEFAULT_SETTINGS: MyPluginSettings =
{
	active: true,
	pattern_styling: new Map<string, string>()
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
			const search_criteria: RegExp = /236P/g;
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

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
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
		  	text: this.text
		});

		this.containerEl.replaceWith(matchEl);
	}
}

class SearchStyleSettings extends PluginSettingTab
{
	plugin: SearchStyle;

	constructor(app: App, plugin: SearchStyle)
	{
		super(app, plugin);

		this.plugin = plugin;
	}

	display(): void
	{
		console.table(this.plugin.settings);

		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: "Search Style Settings"});

		new Setting(containerEl)
			.setName('Display highlighting')
			.setDesc('Controls whether the highlighting is active or not')
			.addToggle(toggleElement => toggleElement
				.onChange(new_value =>
				{
					this.plugin.settings.active = new_value;

					this.plugin.saveSettings();
				})
				.setValue(this.plugin.settings.active))

		new Setting(containerEl)
			.setName("RegExp Search Criteria")
			.setDesc("Regular expression patterns to search markdown against (separate by newlines)")
			.addText(text => text
				.setPlaceholder("^Hello, World!$")
				.inputEl.id = "pattern_input")
			.addButton(button => button
				.setButtonText("Add")
				.onClick(evt =>
				{
					const pattern_input: HTMLInputElement = this.containerEl.querySelector("#pattern_input") as HTMLInputElement;
					
					this.plugin.settings.pattern_styling = this.plugin.settings.pattern_styling.set(pattern_input.value, "");

					pattern_input.value = "";

					this.plugin.saveSettings();
					this.display();
				}))

		for (const pattern of this.plugin.settings.pattern_styling.keys())
		{
			new Setting(containerEl)
				.setName(pattern + " Styling")
				.setDesc("The CSS style that will be applied to " + pattern)
				.addText(text => text
					.setPlaceholder("background-color: lime;\ncolor: red;")
					.onChange(new_value =>
					{
						this.plugin.settings.pattern_styling.set(pattern, new_value);

						this.plugin.saveSettings();
					}))
				.addButton(button => button
					.setIcon("trash-2")
					.onClick(evt =>
					{
						this.plugin.settings.pattern_styling.delete(pattern);

						this.plugin.saveSettings();
						this.display();
					}))
		}

		console.log("pattern_styling: ");
		console.table(this.plugin.settings.pattern_styling);
	}
}