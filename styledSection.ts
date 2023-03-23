import { MarkdownRenderChild } from 'obsidian';

/*
	Styled Section that replaces what will be displayed on the markdown view
*/

export default class SSStyledSection extends MarkdownRenderChild
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

		// find all matches of RegExp pattern
		let match;
		do
		{
			match = this.pattern.exec(this.full_text);

			if (match)
				matches.push({ text: match[0], starting_index: match.index});		
		}
		while (match);

		// find all non-matches
		const elements = this.full_text.split(this.pattern);

		let lBound: number = 0;

		// get indices of all non-matches
		for (let i = 0; i < elements.length; i++)
		{
			if (elements[i] == "")
				continue;

			const index = this.full_text.indexOf(elements[i], lBound);
			
			nonMatches.push({ text: elements[i], starting_index: index });

			lBound = index + elements[i].length;
		}

		// collection of spans to add sections to
		const main_span: HTMLElement = this.containerEl.createSpan();

		// merging matches and non-matches in original order based on starting index values
		let match_index = 0;
		let nonmatch_index = 0;

		while (match_index < matches.length && nonmatch_index < nonMatches.length)
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

		// clean up the rest of one or the other array
		while (match_index < matches.length)
		{
			main_span.createSpan(
			{
				text: matches[match_index].text
			}).setAttr("style", this.style.trim());
			
			match_index += 1;
		}

		while (nonmatch_index < nonMatches.length)
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

// EOF