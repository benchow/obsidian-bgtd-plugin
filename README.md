# Obsidian BGTD Plugin

A simple Getting Things Done (GTD) workflow plugin for Obsidian that automatically manages task completion and organization.

## Features

This plugin implements a streamlined GTD workflow with the following features:

### 1. Task Completion Tracking
- Automatically detects when tasks are checked off (changed from `- [ ]` to `- [x]`)
- Logs completed tasks to the console for debugging

### 2. Automatic Task Movement
When a task is completed:
- Removes the completed task from the original file
- Moves it to a corresponding " - Done" file (e.g., `Tasks.md` → `Tasks - Done.md`)
- If the " - Done" file doesn't exist, it creates it automatically
- Places completed tasks at the top of the " - Done" file

### 3. Task Restoration
When a task in a " - Done" file is unchecked:
- Removes the task from the " - Done" file
- Moves it back to the top of the original file
- Converts it back to an active task (`- [ ]`)

## How It Works

The plugin monitors all Markdown files in your vault for changes to task checkboxes. It maintains a cache of file contents to detect when tasks are checked or unchecked.

### Example Workflow

1. **Original file**: `Projects.md`
   ```
   - [ ] Review quarterly reports
   - [ ] Schedule team meeting
   - [ ] Update documentation
   ```

2. **After completing "Review quarterly reports"**:
   - `Projects.md` becomes:
     ```
     - [ ] Schedule team meeting
     - [ ] Update documentation
     ```
   - `Projects - Done.md` is created with:
     ```
     - [x] Review quarterly reports
     ```

3. **If you uncheck the completed task in `Projects - Done.md`**:
   - `Projects - Done.md` becomes empty (or removes the task)
   - `Projects.md` becomes:
     ```
     - [ ] Review quarterly reports
     - [ ] Schedule team meeting
     - [ ] Update documentation
     ```

## Installation

### Manual Installation
1. Download the latest release
2. Extract the files to your `.obsidian/plugins/obsidian-bgtd-plugin/` folder
3. Enable the plugin in Obsidian settings

### Development Installation
1. Clone this repository
2. Run `npm install`
3. Run `npm run dev` to compile
4. Copy the compiled files to your plugin folder

## Usage

1. Enable the plugin in Obsidian settings
2. Create tasks in any Markdown file using the standard format: `- [ ] Task description`
3. Check off tasks as you complete them
4. The plugin will automatically handle moving tasks to "_Done" files
5. If you need to reactivate a completed task, uncheck it in the "_Done" file

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

## Configuration

Currently, the plugin works automatically without any configuration required. Future versions may include options for:
- Custom file naming patterns
- Different task formats
- Notification settings
- Backup options

## Troubleshooting

- Check the browser console (Ctrl+Shift+I) for debug messages
- Ensure your tasks use the standard Markdown format: `- [ ]` and `- [x]`
- Make sure the plugin is enabled in Obsidian settings

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Support

If you find this plugin helpful, consider supporting the development:
- Star the repository
- Report bugs or suggest features
- Contribute code improvements
