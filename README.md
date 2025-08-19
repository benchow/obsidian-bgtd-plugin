![Intro](introvideo.mov)

# Obsidian BGTD Plugin

A powerful Getting Things Done (GTD) workflow plugin for Obsidian that automatically manages task completion, organization, and provides intelligent date/time tracking with immediate visual feedback.

## Features

This plugin implements a comprehensive GTD workflow with the following features:

### 1. Task Completion Tracking
- Automatically detects when tasks are checked off (changed from `- [ ]` to `- [x]`)
- Provides immediate visual feedback with date/time stamps
- Logs completed tasks to the console for debugging

### 2. Intelligent Date/Time Tracking
- **Completed Tasks:** Automatically adds green checkmark emoji and completion date (✅ YYYY-MM-DD)
- **Unchecked Tasks:** Removes date/time stamps for clean task restoration
- **Immediate Visual Feedback:** See date/time changes instantly when checking/unchecking tasks
- **Smart DOM Updates:** Uses requestAnimationFrame for smooth, coordinated updates

### 3. Click Event Handler
- **Immediate Response:** Intercepts checkbox clicks to provide instant visual feedback
- **DOM Updates:** Adds/removes datestamps directly in the DOM without file modification
- **Non-Intrusive:** Works alongside Obsidian's default checkbox behavior
- **Smooth Coordination:** Uses requestAnimationFrame to avoid race conditions

### 4. Automatic Task Movement
When a task is completed:
- Removes the completed task from the original file
- Moves it to a corresponding " - Done" file (e.g., `Tasks.md` → `Tasks - Done.md`)
- If the " - Done" file doesn't exist, it creates it automatically
- Places completed tasks at the top of the " - Done" file with completion timestamp

### 5. Task Restoration
When a task in a " - Done" file is unchecked:
- Removes the task from the " - Done" file
- Moves it back to the top of the original file
- Converts it back to an active task (`- [ ]`) without date/time
- Maintains clean task state for reactivation

### 6. Duplicate Prevention
- Prevents duplicate tasks in both original and done files
- Intelligent task comparison that ignores date/time differences
- Maintains unique task lists across all files

### 7. Performance Optimizations
- Fast-path processing for non-task lines
- Batch processing for multiple task changes
- Infinite loop prevention with processing flags
- Optimized file operations for better responsiveness
- Race condition prevention with requestAnimationFrame

## How It Works

The plugin uses a dual approach for optimal user experience:

1. **Click Event Handler**: Provides immediate visual feedback by updating the DOM when checkboxes are clicked
2. **File Change Monitor**: Processes the actual file changes and moves tasks between files

### Enhanced Workflow with Immediate Feedback

1. **Original file**: `Projects.md`
   ```
   - [ ] Review quarterly reports
   - [ ] Schedule team meeting
   - [ ] Update documentation
   ```

2. **When you check "Review quarterly reports"**:
   - **Immediate feedback**: Task updates to `- [x] Review quarterly reports ✅ 2024-01-15` in the DOM
   - **File processing**: Task moves to `Projects - Done.md` via the file change handler
   - `Projects.md` becomes:
     ```
     - [ ] Schedule team meeting
     - [ ] Update documentation
     ```
   - `Projects - Done.md` is created with:
     ```
     - [x] Review quarterly reports ✅ 2024-01-15
     ```

3. **When you uncheck the completed task in `Projects - Done.md`**:
   - **Immediate feedback**: Task updates to `- [ ] Review quarterly reports` (date/time removed) in the DOM
   - **File processing**: Task moves back to `Projects.md` via the file change handler
   - `Projects - Done.md` becomes empty (or removes the task)
   - `Projects.md` becomes:
     ```
     - [ ] Review quarterly reports
     - [ ] Schedule team meeting
     - [ ] Update documentation
     ```

### Technical Implementation

- **Click Handler**: Intercepts checkbox clicks and updates DOM immediately
- **requestAnimationFrame**: Ensures smooth coordination with Obsidian's updates
- **File Change Handler**: Monitors file modifications and processes task movement
- **Batch Processing**: Multiple task changes are processed efficiently in batches
- **Duplicate Prevention**: Intelligent comparison prevents duplicate tasks across files
- **Performance Optimized**: Fast-path processing and infinite loop prevention

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

1. **Enable the plugin** in Obsidian settings
2. **Create tasks** in any Markdown file using the standard format: `- [ ] Task description`
3. **Check off tasks** as you complete them
   - Tasks will immediately show a green checkmark and completion date: `- [x] Task ✅ 2024-01-15`
   - The visual feedback is instant and doesn't require file processing
   - Tasks will move to the corresponding "_Done" file automatically
4. **Reactivate tasks** by unchecking them in the "_Done" file
   - Tasks will immediately lose their date/time stamp in the DOM
   - They'll move back to the original file as active tasks automatically
5. **View completion history** in your "_Done" files with timestamps

### Date/Time Format

- **Format**: `✅ YYYY-MM-DD` (e.g., `✅ 2024-01-15`)
- **Location**: Appended to completed tasks in "_Done" files
- **Removal**: Automatically removed when tasks are unchecked
- **Visual**: Green checkmark emoji provides immediate visual feedback

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

### Deployment

The plugin includes a flexible deployment system that can deploy to multiple Obsidian vaults:

#### Quick Setup
```bash
# Set up deployment configuration
npm run deploy:setup

# Edit the created deploy.config file with your vault paths
# Then deploy to all configured vaults
npm run deploy
```

#### Manual Deployment
```bash
# Build the plugin
npm run build

# Deploy to configured vaults
npm run deploy:copy

# Or deploy with build step
npm run deploy
```

#### Deployment Configuration

1. **Create configuration file:**
   ```bash
   npm run deploy:setup
   ```

2. **Edit `deploy.config`:**
   ```
   /Users/username/Documents/Obsidian/MyVault/
   /Users/username/Documents/Obsidian/WorkVault/
   /Users/username/Dropbox/Obsidian/PersonalVault/
   ```

3. **Deploy to all vaults:**
   ```bash
   npm run deploy
   ```

#### Available Deployment Scripts

- `npm run deploy` - Build and deploy to all configured vaults
- `npm run deploy:build` - Build the plugin only
- `npm run deploy:copy` - Deploy to vaults (requires build first)
- `npm run deploy:setup` - Create deployment configuration file
- `npm run deploy:test` - Test build without deploying

## Advanced Features

### Click Event Handling
- Intercepts checkbox clicks before Obsidian processes them
- Provides immediate visual feedback without waiting for file processing
- Uses capture phase to ensure our handler runs first
- Coordinates with Obsidian's updates using requestAnimationFrame

### Race Condition Prevention
- Uses requestAnimationFrame to coordinate with Obsidian's DOM updates
- Ensures our changes happen after Obsidian has finished processing
- Prevents conflicts between our code and Obsidian's default behavior
- More reliable than arbitrary timeouts

### Batch Processing
- Multiple task changes are processed efficiently in a single operation
- Prevents performance issues when checking/unchecking many tasks at once

### Duplicate Prevention
- Intelligent task comparison prevents duplicate tasks across files
- Works even when tasks have different date/time stamps
- Maintains clean, unique task lists

### Performance Optimizations
- Fast-path processing for non-task lines
- Infinite loop prevention with processing flags
- Optimized file operations for better responsiveness
- Efficient DOM manipulation with minimal reflows

## Configuration

Currently, the plugin works automatically without any configuration required. Future versions may include options for:
- Custom file naming patterns
- Different task formats
- Notification settings
- Backup options
- Custom date/time formats
- Adjustable visual feedback timing

## Troubleshooting

### Common Issues

- **Check the browser console** (Ctrl+Shift+I) for debug messages
- **Ensure your tasks use the standard Markdown format**: `- [ ]` and `- [x]`
- **Make sure the plugin is enabled** in Obsidian settings
- **Verify file permissions** if "_Done" files aren't being created

### Performance Issues

- **Infinite loops**: The plugin includes built-in prevention mechanisms
- **Slow response**: Visual feedback is immediate, file processing happens in background
- **Duplicate tasks**: The plugin automatically prevents duplicates

### Date/Time Issues

- **Wrong date format**: Uses ISO format (YYYY-MM-DD) for consistency
- **Missing timestamps**: Only completed tasks in "_Done" files have timestamps
- **Visual feedback**: Green checkmark emoji should appear immediately

### Click Handler Issues

- **No immediate feedback**: Check that the plugin is enabled and console for errors
- **Race conditions**: The plugin uses requestAnimationFrame to prevent these
- **DOM conflicts**: Ensure you're using the latest version with proper event handling

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Changelog

### Latest Version
- **Click Event Handler**: Added immediate visual feedback for checkbox interactions
- **requestAnimationFrame**: Replaced setTimeout with proper frame-based coordination
- **Race Condition Prevention**: Better coordination with Obsidian's DOM updates
- **Immediate Feedback**: Users see datestamp changes instantly
- **Performance**: Removed 500ms delay, faster task processing
- **DOM Management**: Cleaner, more reliable DOM manipulation

### Previous Versions
- **Date/Time Tracking**: Added green checkmark emoji and completion dates
- **Visual Feedback**: Immediate in-place updates for better UX
- **Performance**: Batch processing optimizations
- **Duplicate Prevention**: Intelligent task comparison across files
- **Bug Fixes**: Infinite loop prevention and proper task flow
- Basic task movement between files
- Automatic "_Done" file creation
- Task restoration functionality

## Support

If you find this plugin helpful, consider supporting the development:
- Star the repository
- Report bugs or suggest features
- Contribute code improvements
