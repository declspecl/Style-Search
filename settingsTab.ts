import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

import SearchStyle from 'main';

/*
	Settings Tab Configuration
*/

export default class SSSettingsTab extends PluginSettingTab
{
	plugin: SearchStyle;

	constructor(app: App, plugin: SearchStyle)
	{
		super(app, plugin);

		this.plugin = plugin;
	}

	display(): void
	{
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h3', { text: "Search Style Settings" });

		new Setting(containerEl)
			.setName("Display highlighting")
			.setDesc("Controls whether the highlighting is active or not. Reload file(s) to see effects")
			.addToggle(toggleElement => toggleElement
				.onChange(new_value =>
				{
					this.plugin.settings.active = new_value;

					this.plugin.saveSettings();
				})
				.setValue(this.plugin.settings.active)
			);

		new Setting(containerEl)
			.setName("RegExp Search Pattern")
			.setDesc("Regular expression search pattern to style")
			.addText(text => text
				.setPlaceholder("^Hello, World!$")
				.inputEl.id = "searchstyle_pattern_input")
			.addButton(button => button
				.setButtonText("Add")
				.onClick(_ =>
				{
					const pattern_input: HTMLInputElement = this.containerEl.querySelector("#searchstyle_pattern_input") as HTMLInputElement;

					if (pattern_input.value == "")
					{
						new Notice("You cannot input a blank pattern.");

						return;
					}
					
					this.plugin.setPatternStyle(pattern_input.value, "");

					pattern_input.value = "";

					this.plugin.saveSettings();
					this.display();
				})
			);

		// variable size style editors

		if (this.plugin.settings.pattern_styling.length > 0)
			containerEl.createEl('h3', { text: "Custom CSS Styles" });

		for (const [index, pattern_style] of this.plugin.settings.pattern_styling.entries())
		{
			new Setting(containerEl)
				.setName("\"" + pattern_style.pattern + "\" Styling")
				.setDesc("The CSS styling that will be applied to \"" + pattern_style.pattern + "\" matches")
				.addTextArea(textarea => textarea
					.setPlaceholder("color: red;\nbackground-color: lime;\nborder: 1px solid black;")
					.setValue(pattern_style.style)
					.onChange(new_value =>
					{
						this.plugin.setPatternStyle(pattern_style.pattern, new_value);

						this.plugin.saveSettings();
					}).inputEl.addClass("searchstyle_style_textarea")
				)
				.addButton(button => button
					.setIcon("trash-2")
					.onClick(_ =>
					{
						this.plugin.deletePatternStyle(index);

						this.plugin.saveSettings();

						this.display();
					})
				)
		};
	}
}

// EOF