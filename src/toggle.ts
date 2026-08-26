import { Editor, EditorChange, EditorSelectionOrCaret } from 'obsidian';
import { computeQuoteEdit, QuoteEdit } from './quotes';

/**
 * Toggle curly quotes around every selection (or cursor) in the editor.
 *
 * Every edit is computed against the untouched document and applied as a single
 * transaction, so the whole command is one undo step.
 */
export function toggleCurlyQuotes(editor: Editor): void {
	const doc = editor.getValue();

	const edits = editor
		.listSelections()
		.map((selection) => {
			const anchor = editor.posToOffset(selection.anchor);
			const head = editor.posToOffset(selection.head);
			return computeQuoteEdit(doc, Math.min(anchor, head), Math.max(anchor, head));
		})
		.sort((a, b) => a.from - b.from || a.to - b.to)
		// Several cursors can resolve to the same word: keep one edit per region,
		// as a transaction rejects overlapping changes.
		.filter((edit, index, all) => {
			const previous = index > 0 ? all[index - 1] : undefined;
			return previous === undefined || edit.from >= previous.to;
		});

	if (edits.length === 0) return;

	const changes: EditorChange[] = edits.map((edit) => ({
		from: editor.offsetToPos(edit.from),
		to: editor.offsetToPos(edit.to),
		text: edit.text,
	}));

	editor.transaction({ changes });

	editor.setSelections(mapSelections(editor, edits));
}

/** Translate the post-edit selection offsets into positions in the rewritten document. */
function mapSelections(editor: Editor, edits: QuoteEdit[]): EditorSelectionOrCaret[] {
	const selections: EditorSelectionOrCaret[] = [];
	let delta = 0;

	for (const edit of edits) {
		const base = edit.from + delta;
		selections.push({
			anchor: editor.offsetToPos(base + edit.selectionFrom),
			head: editor.offsetToPos(base + edit.selectionTo),
		});
		delta += edit.text.length - (edit.to - edit.from);
	}

	return selections;
}
