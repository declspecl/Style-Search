import { App, PluginSettingTab, Setting } from 'obsidian';

import SearchStyle from 'main'

export default class SearchStyleSettings extends PluginSettingTab
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
					
					this.plugin.setPatternStyle(pattern_input.value, "");

					pattern_input.value = "";

					this.plugin.saveSettings();
					this.display();
				}))

		for (const [index, pattern_style] of this.plugin.settings.pattern_styling.entries())
		{
			new Setting(containerEl)
				.setName("\"" + pattern_style.pattern + "\" Styling")
				.setDesc("The CSS style that will be applied to \"" + pattern_style.pattern + "\"")
				.addText(text => text
					.setPlaceholder("background-color: lime; color: red;")
					.setValue(pattern_style.style)
					.onChange(new_value =>
					{
						this.plugin.setPatternStyle(pattern_style.pattern, new_value);

						this.plugin.saveSettings();

						console.table(this.plugin.settings.pattern_styling);
					}))
				.addButton(button => button
					.setIcon("trash-2")
					.onClick(evt =>
					{
						this.plugin.deletePatternStyle(index);

						this.plugin.saveSettings();
						this.display();
					}))
		}
	}
}