export const OPENING_QUOTE = '“'; // “
export const CLOSING_QUOTE = '”'; // ”

/** Characters that never belong to the word under the cursor. */
const WORD_BOUNDARY = /[\s.,;:!?…"'`“”‘’«»()[\]{}<>*_~=|\\/]/;

export interface QuoteEdit {
	/** Offsets into the original document. */
	from: number;
	to: number;
	/** Text replacing the `[from, to)` range. */
	text: string;
	/** Where the selection should land, as offsets inside `text`. */
	selectionFrom: number;
	selectionTo: number;
}

/** Maximal run of non-boundary characters around `offset`, or null if there is none. */
function wordRangeAt(doc: string, offset: number): { start: number; end: number } | null {
	let start = offset;
	let end = offset;

	while (start > 0 && !WORD_BOUNDARY.test(doc.charAt(start - 1))) start--;
	while (end < doc.length && !WORD_BOUNDARY.test(doc.charAt(end))) end++;

	return start === end ? null : { start, end };
}

/**
 * Work out how a single selection (or cursor) should be rewritten:
 * unwrap when the text is already quoted, wrap it otherwise.
 */
export function computeQuoteEdit(doc: string, from: number, to: number): QuoteEdit {
	let start = from;
	let end = to;

	if (start === end) {
		// No selection: act on the word under the cursor, like Obsidian's bold/italic commands.
		const word = wordRangeAt(doc, start);
		if (word) {
			start = word.start;
			end = word.end;
		}
	} else {
		// Leave surrounding whitespace outside the quotes.
		while (start < end && /\s/.test(doc.charAt(start))) start++;
		while (end > start && /\s/.test(doc.charAt(end - 1))) end--;
	}

	const selected = doc.slice(start, end);

	// The quotes are part of the selection: strip them.
	if (
		selected.length >= OPENING_QUOTE.length + CLOSING_QUOTE.length &&
		selected.startsWith(OPENING_QUOTE) &&
		selected.endsWith(CLOSING_QUOTE)
	) {
		const inner = selected.slice(OPENING_QUOTE.length, selected.length - CLOSING_QUOTE.length);
		return { from: start, to: end, text: inner, selectionFrom: 0, selectionTo: inner.length };
	}

	// The quotes sit just outside the selection: strip them too.
	if (
		doc.slice(start - OPENING_QUOTE.length, start) === OPENING_QUOTE &&
		doc.slice(end, end + CLOSING_QUOTE.length) === CLOSING_QUOTE
	) {
		return {
			from: start - OPENING_QUOTE.length,
			to: end + CLOSING_QUOTE.length,
			text: selected,
			selectionFrom: 0,
			selectionTo: selected.length,
		};
	}

	const text = `${OPENING_QUOTE}${selected}${CLOSING_QUOTE}`;
	return {
		from: start,
		to: end,
		text,
		selectionFrom: OPENING_QUOTE.length,
		selectionTo: OPENING_QUOTE.length + selected.length,
	};
}
