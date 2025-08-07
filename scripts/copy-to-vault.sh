#!/bin/bash

# Plugin name
PLUGIN_NAME="obsidian-bgtd-plugin"

# Configuration file
CONFIG_FILE="deploy.config"

# Default vault path (fallback)
DEFAULT_VAULT_PATH="/Users/benchow/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/development/"

# Function to read vault paths from config file
get_vault_paths() {
    if [ -f "$CONFIG_FILE" ]; then
        # Read vault paths from config file, one per line
        cat "$CONFIG_FILE" | grep -v '^#' | grep -v '^$'
    else
        # Use default if no config file exists
        echo "$DEFAULT_VAULT_PATH"
    fi
}

# Function to deploy to a single vault
deploy_to_vault() {
    local vault_path="$1"
    local plugin_dir="${vault_path}.obsidian/plugins/${PLUGIN_NAME}"
    
    echo "📁 Deploying to: $vault_path"
    
    # Check if vault directory exists
    if [ ! -d "$vault_path" ]; then
        echo "❌ Error: Vault directory does not exist: $vault_path"
        return 1
    fi
    
    # Create plugin directory if it doesn't exist
    mkdir -p "$plugin_dir"
    
    # Copy built files - check if we're in scripts directory or root
    if [ -f "main.js" ] && [ -f "manifest.json" ]; then
        echo "  Copying from current directory..."
        cp main.js "$plugin_dir/"
        cp manifest.json "$plugin_dir/"
    elif [ -f "../main.js" ] && [ -f "../manifest.json" ]; then
        echo "  Copying from parent directory..."
        cp ../main.js "$plugin_dir/"
        cp ../manifest.json "$plugin_dir/"
    else
        echo "❌ Error: Could not find plugin files to copy!"
        echo "  Looking for: main.js, manifest.json"
        echo "  Current directory: $(pwd)"
        exit 1
    fi
    
    echo "✅ Plugin deployed to: $vault_path"
}

# Main deployment logic
echo "🚀 Starting plugin deployment..."

# Get vault paths
vault_paths=$(get_vault_paths)

# Deploy to each vault
success_count=0
total_count=0

while IFS= read -r vault_path; do
    if [ -n "$vault_path" ]; then
        total_count=$((total_count + 1))
        if deploy_to_vault "$vault_path"; then
            success_count=$((success_count + 1))
        fi
    fi
done <<< "$vault_paths"

echo ""
echo "📊 Deployment Summary:"
echo "  ✅ Successful: $success_count"
echo "  ❌ Failed: $((total_count - success_count))"
echo "  📁 Total vaults: $total_count"

if [ $success_count -gt 0 ]; then
    echo ""
    echo "📝 Next steps:"
    echo "  1. Open Obsidian"
    echo "  2. Go to Settings → Community plugins"
    echo "  3. Find 'BGTD Plugin' and enable it"
    echo "  4. Restart Obsidian if needed"
fi 