#!/bin/bash

# Configuration - UPDATE THIS PATH TO YOUR VAULT
VAULT_PATH="/Users/benchow/Library/Mobile Documents/iCloud~md~obsidian/Documents/development/"

# Plugin name
PLUGIN_NAME="obsidian-bgtd-plugin"

# Create plugin directory if it doesn't exist
PLUGIN_DIR="${VAULT_PATH}.obsidian/plugins/${PLUGIN_NAME}"
mkdir -p "$PLUGIN_DIR"

# Copy built files - check if we're in scripts directory or root
echo "Copying plugin files to: $PLUGIN_DIR"

# Check if files exist in current directory (running from root)
if [ -f "main.js" ] && [ -f "manifest.json" ]; then
    echo "  Copying from current directory..."
    cp main.js "$PLUGIN_DIR/"
    cp manifest.json "$PLUGIN_DIR/"
# Check if files exist in parent directory (running from scripts)
elif [ -f "../main.js" ] && [ -f "../manifest.json" ]; then
    echo "  Copying from parent directory..."
    cp ../main.js "$PLUGIN_DIR/"
    cp ../manifest.json "$PLUGIN_DIR/"
else
    echo "❌ Error: Could not find plugin files to copy!"
    echo "  Looking for: main.js, manifest.json"
    echo "  Current directory: $(pwd)"
    echo "  Files in current directory:"
    ls -la *.js *.css *.json 2>/dev/null || echo "    No matching files found"
    exit 1
fi

echo "✅ Plugin files copied successfully!"
echo "📝 Don't forget to enable the plugin in Obsidian:"
echo "   Settings → Community plugins → Find 'Ben Tasks' → Enable" 