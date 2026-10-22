#!/bin/bash
# Auto-formats files with Prettier after Claude writes/edits them.
# Uses the project's local Prettier only — never downloads it via npx.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
PRETTIER="${CLAUDE_PROJECT_DIR:-.}/node_modules/.bin/prettier"

if [ -z "$FILE_PATH" ] || [ ! -x "$PRETTIER" ]; then
  exit 0
fi

# Only format file types Prettier handles
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    "$PRETTIER" --write "$FILE_PATH" >/dev/null 2>&1
    ;;
esac

exit 0
