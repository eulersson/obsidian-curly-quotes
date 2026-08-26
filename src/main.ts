import { Editor, Plugin } from 'obsidian';
import { toggleCurlyQuotes } from './toggle';

export default class CurlyQuotesPlugin extends Plugin {
	onload() {
		this.addCommand({
			id: 'toggle',
			name: 'Toggle around selection',
			icon: 'quote',
			editorCallback: (editor: Editor) => toggleCurlyQuotes(editor),
		});
	}
}
