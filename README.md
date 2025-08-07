# Obsidian BGTD Plugin

A powerful Getting Things Done (GTD) workflow plugin for Obsidian that automatically manages task completion, organization, and provides intelligent date/time tracking.

## Features

This plugin implements a comprehensive GTD workflow with the following features:

### 1. Task Completion Tracking
- Automatically detects when tasks are checked off (changed from `- [ ]` to `- [x]`)
- Provides immediate visual feedback with date/time stamps
- Logs completed tasks to the console for debugging

### 2. Intelligent Date/Time Tracking
- **Completed Tasks:** Automatically adds green checkmark emoji and completion date (✅ YYYY-MM-DD)
- **Unchecked Tasks:** Removes date/time stamps for clean task restoration
- **Visual Feedback:** See date/time changes immediately when checking/unchecking tasks
- **500ms Delay:** Brief pause before moving tasks for better user experience

### 3. Automatic Task Movement
When a task is completed:
- Removes the completed task from the original file
- Moves it to a corresponding " - Done" file (e.g., `Tasks.md` → `Tasks - Done.md`)
- If the " - Done" file doesn't exist, it creates it automatically
- Places completed tasks at the top of the " - Done" file with completion timestamp

### 4. Task Restoration
When a task in a " - Done" file is unchecked:
- Removes the task from the " - Done" file
- Moves it back to the top of the original file
- Converts it back to an active task (`- [ ]`) without date/time
- Maintains clean task state for reactivation

### 5. Duplicate Prevention
- Prevents duplicate tasks in both original and done files
- Intelligent task comparison that ignores date/time differences
- Maintains unique task lists across all files

### 6. Performance Optimizations
- Fast-path processing for non-task lines
- Batch processing for multiple task changes
- Infinite loop prevention with processing flags
- Optimized file operations for better responsiveness

## How It Works

The plugin monitors all Markdown files in your vault for changes to task checkboxes. It provides immediate visual feedback and intelligently manages task movement with date/time tracking.

### Enhanced Workflow with Date/Time Tracking

1. **Original file**: `Projects.md`
   ```
   - [ ] Review quarterly reports
   - [ ] Schedule team meeting
   - [ ] Update documentation
   ```

2. **When you check "Review quarterly reports"**:
   - **Immediate feedback**: Task updates to `- [x] Review quarterly reports ✅ 2024-01-15`
   - **After 500ms delay**: Task moves to `Projects - Done.md`
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
   - **Immediate feedback**: Task updates to `- [ ] Review quarterly reports` (date/time removed)
   - **After 500ms delay**: Task moves back to `Projects.md`
   - `Projects - Done.md` becomes empty (or removes the task)
   - `Projects.md` becomes:
     ```
     - [ ] Review quarterly reports
     - [ ] Schedule team meeting
     - [ ] Update documentation
     ```

### Technical Implementation

- **In-Place Updates**: Tasks are updated immediately in their current file for visual feedback
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
   - After a brief 500ms delay, tasks will move to the corresponding "_Done" file
4. **Reactivate tasks** by unchecking them in the "_Done" file
   - Tasks will immediately lose their date/time stamp
   - After a brief delay, they'll move back to the original file as active tasks
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

## Advanced Features

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

## Configuration

Currently, the plugin works automatically without any configuration required. Future versions may include options for:
- Custom file naming patterns
- Different task formats
- Notification settings
- Backup options
- Custom date/time formats
- Adjustable delay timing

## Troubleshooting

### Common Issues

- **Check the browser console** (Ctrl+Shift+I) for debug messages
- **Ensure your tasks use the standard Markdown format**: `- [ ]` and `- [x]`
- **Make sure the plugin is enabled** in Obsidian settings
- **Verify file permissions** if "_Done" files aren't being created

### Performance Issues

- **Infinite loops**: The plugin includes built-in prevention mechanisms
- **Slow response**: The 500ms delay is intentional for better UX
- **Duplicate tasks**: The plugin automatically prevents duplicates

### Date/Time Issues

- **Wrong date format**: Uses ISO format (YYYY-MM-DD) for consistency
- **Missing timestamps**: Only completed tasks in "_Done" files have timestamps
- **Visual feedback**: Green checkmark emoji should appear immediately

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

## Changelog

### Latest Version
- **Date/Time Tracking**: Added green checkmark emoji and completion dates
- **Visual Feedback**: Immediate in-place updates for better UX
- **Performance**: 500ms delay and batch processing optimizations
- **Duplicate Prevention**: Intelligent task comparison across files
- **Bug Fixes**: Infinite loop prevention and proper task flow

### Previous Versions
- Basic task movement between files
- Automatic "_Done" file creation
- Task restoration functionality

## Support

If you find this plugin helpful, consider supporting the development:
- Star the repository
- Report bugs or suggest features
- Contribute code improvements
