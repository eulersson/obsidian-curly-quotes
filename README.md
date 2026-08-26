# Obsidian Curly Quotes

Wrap the selected text in curly quotes (`“…”`), the same way **Cmd+I** wraps it in italics — and unwrap it when it is already quoted.

## Usage

1. Select some text (or just place the cursor inside a word).
2. Run **Toggle curly quotes** from the command palette.

To use a hotkey, go to **Settings → Hotkeys**, search for *Toggle curly quotes*, and assign one (Obsidian does not let plugins claim a default shortcut).

## Behaviour

| Before | After |
| --- | --- |
| `hel\|lo` (cursor in a word) | `“hello”` |
| `[hello]` (selection) | `“hello”` |
| `[“hello”]` (selection includes the quotes) | `hello` |
| `“hel\|lo”` (cursor inside a quoted word) | `hello` |
| `\|` (no selection, no word) | `“\|”` — cursor between the quotes |

Leading and trailing whitespace stays outside the quotes, and multiple cursors are all handled in one go.
