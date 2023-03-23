// import {
// 	Decoration,
// 	DecorationSet,
// 	EditorView,
// 	PluginSpec,
// 	PluginValue,
// 	ViewPlugin,
// 	ViewUpdate,
// 	WidgetType,
// } from "@codemirror/view";

// import { syntaxTree } from "@codemirror/language";
// import { RangeSetBuilder } from "@codemirror/state";
// import SearchStyle, { SearchStyleSettings } from "main";
// import { WorkspaceLeaf, editorLivePreviewField } from "obsidian";

// export class StyleWidget extends WidgetType
// {
// 	text: string;
//     style: string;

// 	constructor(text: string, style: string)
// 	{
// 		super();

// 		this.text = text;
//         this.style = style;
// 	}

// 	toDOM(view: EditorView): HTMLElement
// 	{
// 		const span = document.createElement("span");

// 		span.setAttr("style", this.style.trim());

// 		span.innerHTML = this.text;
	
// 		return span;
// 	}
// }

// export default function getStyleEditor(settings: SearchStyleSettings)
// {
// 	const viewPlugin = ViewPlugin.fromClass(
// 		class StyleEditor
// 		{
// 			decorations: DecorationSet;
				
// 			constructor(view: EditorView)
// 			{
// 				this.decorations = this.buildDecorations(view);
// 			}
		
// 			update(update: ViewUpdate)
// 			{
// 				if (update.view.state.field(editorLivePreviewField) && (update.docChanged || update.viewportChanged))
// 				{
// 					this.decorations = this.buildDecorations(update.view);
// 				}
// 			}
		
// 			buildDecorations(view: EditorView): DecorationSet
// 			{
// 				console.log("entering build decorations");

// 				const builder = new RangeSetBuilder<Decoration>();

// 				for (let { from, to } of view.visibleRanges)
// 				{
// 					const view_string: string = view.state.sliceDoc(from, to);

// 					for ( const {pattern, style} of settings.pattern_styling)
// 					{
// 						const r_pattern = new RegExp(pattern, "g");
// 						let match;

// 						do
// 						{
// 							match = r_pattern.exec(view_string);

// 							if (!match)
// 								break;

// 							const matchStart = from + match.index;

// 							builder.add(
// 								from + matchStart,
// 								from + matchStart + match[0].length,
// 								Decoration.replace(
// 								{
// 									widget: new StyleWidget(match[0], style)
// 								})
// 							);
// 						}						
// 						while (match);
// 					}
// 				}

// 				return builder.finish();
// 			}
// 		},
// 		{
// 			decorations: value => value.decorations
// 		}
// 	);

// 	return viewPlugin;
// }

// // export default class StyleEditor implements PluginValue
// // {
// // 	decorations: DecorationSet;

// // 	constructor(view: EditorView)
// // 	{
// // 		this.decorations = this.buildDecorations(view);
// // 	}

// // 	update(update: ViewUpdate)
// // 	{
// // 		if (update.docChanged || update.viewportChanged)
// // 		{
// // 			this.decorations = this.buildDecorations(update.view);
// // 		}
// // 	}

// // 	destroy() {}

// // 	buildDecorations(view: EditorView): DecorationSet
// // 	{
// // 		const builder = new RangeSetBuilder<Decoration>();

// // 		console.log(view.visibleRanges);

// // 		for (let { from, to } of view.visibleRanges)
// // 		{
// // 			const view_string: string = view.state.sliceDoc(from, to);

// // 			const matchRegex = /236P/g; // regular expression to match all occurrences of "236P"

// // 			let match;
// // 			while ((match = matchRegex.exec(view_string)))
// // 			{
// // 				console.log("match", match);

// // 				const matchStart = from + match.index;
// // 				const matchEnd = matchStart + match[0].length;

// // 				builder.add(
// // 					from + matchStart,
// // 					from + matchEnd,
// // 					Decoration.replace(
// // 					{
// // 						widget: new StyleWidget(match[0], "color: blue"),
// // 					})
// // 				);
// // 			}
// // 		}

// // 		return builder.finish();
// // 	}
// // }