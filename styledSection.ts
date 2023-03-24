import { MarkdownRenderChild } from 'obsidian';

/*
	Styled Section that replaces what will be displayed on the markdown view
*/

export default class SSStyledSection extends MarkdownRenderChild
{
	pattern: RegExp;
	style: string;

	constructor(containerEl: HTMLElement, pattern: RegExp, style: string)
	{
		super(containerEl);

		this.pattern = pattern;
		this.style = style;
	}

	onload()
	{
		const element_content: string = this.containerEl.innerHTML;

		interface matchSection
		{
			content: string;
			starting_index: number;
		};

		const matches: Array<matchSection> = [];
		const nonMatches: Array<matchSection> = [];

		// find all matches of RegExp pattern
		let match;
		do
		{
			match = this.pattern.exec(element_content);

			if (match)
				matches.push({ content: match[0], starting_index: match.index});		
		}
		while (match);

		// find all non-matches
		const elements = element_content.split(this.pattern);

		let lBound: number = 0;

		// get indices of all non-matches
		for (let i = 0; i < elements.length; i++)
		{
			if (elements[i] == "")
				continue;

			const index = element_content.indexOf(elements[i], lBound);
			
			nonMatches.push({ content: elements[i].replace(/\r?\n|\r/g, ""), starting_index: index });

			lBound = index + elements[i].length;
		}

		// collection of spans to add sections to
		const main_collection: HTMLElement = this.containerEl.createDiv();

		// merging matches and non-matches in original order based on starting index values
		let match_index = 0;
		let nonmatch_index = 0;

		// need to accumulate innerHTML into string instead of immediately affecting the DOM because incomplete tags
		// are automatically closed when added to the DOM, causing errors.
		// we use innerHTML to keep the formatting
		let final_innerHTML: string = "";

		while (match_index < matches.length && nonmatch_index < nonMatches.length)
		{
			if (matches[match_index].starting_index < nonMatches[nonmatch_index].starting_index)
			{
				final_innerHTML += "<span style=\"" + this.style.trim() + "\">" + matches[match_index].content + "</span>"
				
				match_index += 1;
			}
			else
			{
				final_innerHTML += nonMatches[nonmatch_index].content;

				nonmatch_index += 1;
			}
		}

		// clean up the rest of one or the other array
		while (match_index < matches.length)
		{
			final_innerHTML += "<span style=\"" + this.style.trim() + "\">" + matches[match_index].content + "</span>"
			
			match_index += 1;
		}

		while (nonmatch_index < nonMatches.length)
		{
			final_innerHTML += nonMatches[nonmatch_index].content;

			nonmatch_index += 1;
		}

		main_collection.innerHTML = final_innerHTML;

		// replaceWith causes weird behavior with lists, so replaceChildren it is 😊
		this.containerEl.replaceChildren(main_collection);
	}
}

// EOF