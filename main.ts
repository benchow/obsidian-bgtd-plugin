import { Plugin, TFile } from "obsidian";

export default class BGTDPlugin extends Plugin {
    private isProcessing = false; // Flag to prevent infinite loops
    private fileChangeListener: any; // Store reference to file change event listener
    private clickHandler: (event: Event) => void; // Store reference to click handler

    async onload() {
        console.log("BGTD Plugin loaded");

        // Setup click handler to intercept task checkbox clicks
        this.clickHandler = this.handleTaskClick.bind(this);
        document.addEventListener("click", this.clickHandler, true); // Use capture phase

        // Listen for any Markdown file modification
        this.fileChangeListener = this.app.vault.on("modify", (file: TFile) => {
            this.handleFileChange(file);
        });
        this.registerEvent(this.fileChangeListener);
    }

    /**
     * Ensures a file exists at the given path, creating it with initial content if it doesn't exist.
     * @param filePath - The path of the file to ensure exists
     * @param initialContent - The initial content to write if the file needs to be created
     * @returns The TFile object for the file (either existing or newly created)
     */
    async ensureFileExists(filePath: string, initialContent: string = ""): Promise<TFile> {
        let file = this.app.vault.getAbstractFileByPath(filePath);
        
        if (file instanceof TFile) {
            return file;
        }
        
        // File doesn't exist, create it
        console.log(`Creating file: ${filePath}`);
        await this.app.vault.create(filePath, initialContent);
        
        const newFile = this.app.vault.getAbstractFileByPath(filePath);
        if (newFile instanceof TFile) {
            return newFile;
        } else {
            throw new Error(`Failed to create file: ${filePath}`);
        }
    }

    /**
     * Gets the current date in yyyy-mm-dd format
     * @returns Formatted date string
     */
    getCurrentDate(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Adds green checkmark emoji and date to a task text
     * @param taskText - The original task text
     * @returns Task text with green checkmark emoji and date appended
     */
    addDateTimeToTask(taskText: string): string {
        const date = this.getCurrentDate();
        const justTheTaskText = this.removeDateTimeFromTask(taskText);
        return `${justTheTaskText} ✅ ${date}`;
    }

    /**
     * Removes green checkmark emoji and date from a task text
     * @param taskText - The task text that may contain green checkmark emoji and date
     * @returns Task text with green checkmark emoji and date removed
     */
    removeDateTimeFromTask(taskText: string): string {
        // Remove green checkmark emoji and date pattern: ✅ YYYY-MM-DD
        return taskText.replace(/\s+✅\s+\d{4}-\d{2}-\d{2}$/g, '').trim();
    }

    async handleFileChange(file: TFile) {
        if (file.extension !== "md") return;
        if (this.isProcessing) return; // Prevent infinite loops

        try {
            this.isProcessing = true; // Set flag to prevent recursive calls
            
            const content = await this.app.vault.read(file);
            const lines = content.split("\n");
            
            // Collect tasks that need to be moved
            const tasksToMove = this.collectTasksToMove(lines, file);
            
            if (tasksToMove.length === 0) {
                this.isProcessing = false;
                return;
            }
            
            // Batch process all tasks
            await this.batchMoveTasks(tasksToMove, file);
            
        } catch (error) {
            console.error("Error handling file change:", error);
        } finally {
            this.isProcessing = false; // Always reset flag
        }
    }

    /**
     * Collects all tasks that need to be moved from the file
     */
    collectTasksToMove(lines: string[], file: TFile): Array<{task: string, type: 'completed' | 'unchecked'}> {
        const isDoneFile = file.basename.endsWith(" - Done");
        const tasks: Array<{task: string, type: 'completed' | 'unchecked'}> = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Fast path: skip lines that don't start with task markers
            if (!trimmedLine.startsWith("- [x]") && !trimmedLine.startsWith("- [ ]")) {
                continue;
            }
            
            // Check for completed tasks (not in " - Done" files)
            if (trimmedLine.startsWith("- [x]") && !isDoneFile) {
                const taskText = trimmedLine.replace("- [x]", "").trim();
                tasks.push({ task: taskText, type: 'completed' });
            }
            
            // Check for unchecked tasks (in " - Done" files)
            if (trimmedLine.startsWith("- [ ]") && isDoneFile) {
                const taskText = trimmedLine.replace("- [ ]", "").trim();
                tasks.push({ task: taskText, type: 'unchecked' });
            }
        }
        
        return tasks;
    }

    /**
     * Batch processes all tasks that need to be moved
     */
    async batchMoveTasks(tasks: Array<{task: string, type: 'completed' | 'unchecked'}>, file: TFile) {
        if (tasks.length === 0) return;
        
        console.log(`Processing ${tasks.length} tasks to move`);
        
        // Group tasks by type
        const completedTasks = tasks.filter(t => t.type === 'completed') as Array<{task: string, type: 'completed'}>;
        const uncheckedTasks = tasks.filter(t => t.type === 'unchecked') as Array<{task: string, type: 'unchecked'}>;
        
        // Process completed tasks
        if (completedTasks.length > 0) {
            await this.batchMoveCompletedTasks(completedTasks, file);
        }
        
        // Process unchecked tasks
        if (uncheckedTasks.length > 0) {
            await this.batchMoveUncheckedTasks(uncheckedTasks, file);
        }
    }

    /**
     * Batch moves completed tasks to the done file
     */
    async batchMoveCompletedTasks(tasks: Array<{task: string, type: 'completed'}>, file: TFile) {
        try {
            console.log(`Moving ${tasks.length} completed tasks to _Done file`);
            
            // Create the " - Done" file path
            const doneFilePath = file.path.replace(/\.md$/, " - Done.md");
            console.log(`Done file path: ${doneFilePath}`);
            
            // Remove all completed tasks from the original file
            const originalContent = await this.app.vault.read(file);
            const lines = originalContent.split("\n");
            
            // Simply filter out all lines that start with "- [x]" (completed tasks)
            const filteredLines = lines.filter(line => !line.trim().startsWith("- [x]"));
            
            const newContent = filteredLines.join("\n");
            console.log(`Updating original file with ${filteredLines.length} lines`);
            await this.app.vault.modify(file, newContent);

            // Ensure the done file exists and add all completed tasks with datestamps
            const doneFile = await this.ensureFileExists(doneFilePath);
            const currentContent = await this.app.vault.read(doneFile);
            
            const completedTaskLines = tasks.map(t => `- [x] ${this.addDateTimeToTask(t.task)}`);
            const newDoneContent = completedTaskLines.join("\n") + "\n" + currentContent;
            await this.app.vault.modify(doneFile, newDoneContent);
            console.log(`Added ${completedTaskLines.length} completed tasks to done file`);
            
            console.log(`✅ Successfully moved ${tasks.length} completed tasks to ${doneFilePath}`);
        } catch (error) {
            console.error("Error moving completed tasks to done file:", error);
        }
    }

    /**
     * Batch moves unchecked tasks back to the original file
     */
    async batchMoveUncheckedTasks(tasks: Array<{task: string, type: 'unchecked'}>, file: TFile) {
        try {
            console.log(`Moving ${tasks.length} unchecked tasks back to original file`);
            
            // Find the original file path
            const originalFilePath = file.path.replace(" - Done.md", ".md");
            console.log(`Looking for original file: ${originalFilePath}`);
            
            // Ensure the original file exists
            const originalFile = await this.ensureFileExists(originalFilePath);
            
            // Remove all unchecked tasks from the done file
            const doneContent = await this.app.vault.read(file);
            const lines = doneContent.split("\n");
            
            // Simply filter out all lines that start with "- [ ]" (unchecked tasks)
            const filteredLines = lines.filter(line => !line.trim().startsWith("- [ ]"));
            
            const newDoneContent = filteredLines.join("\n");
            await this.app.vault.modify(file, newDoneContent);

            // Add all unchecked tasks to the top of the original file
            const originalContent = await this.app.vault.read(originalFile);
            const uncheckedTaskLines = tasks.map(t => `- [ ] ${this.removeDateTimeFromTask(t.task)}`);
            const newOriginalContent = uncheckedTaskLines.join("\n") + "\n" + originalContent;
            
            await this.app.vault.modify(originalFile, newOriginalContent);
            console.log(`Added ${uncheckedTaskLines.length} unchecked tasks to original file`);

            console.log(`❌ Successfully moved ${tasks.length} unchecked tasks back to ${originalFile.path}`);
        } catch (error) {
            console.error("Error moving unchecked tasks to original file:", error);
        }
    }

    /**
     * Intercepts clicks on Obsidian task checkboxes to provide immediate visual feedback
     */
    private async handleTaskClick(event: Event) {
        const target = event.target as HTMLElement;
        
        // Check if the clicked element is an Obsidian task checkbox
        if (!target.classList.contains('task-list-item-checkbox')) {
            return;
        }

        // Don't prevent default - let Obsidian handle the checkbox state change
        // event.preventDefault();
        // event.stopPropagation();
        // event.stopImmediatePropagation();

        // Find the parent task list item that contains the task text
        const taskListItem = target.closest('.HyperMD-task-line') || target.closest('li');
        if (!taskListItem) {
            console.log("Could not find task list item parent");
            return;
        }
        
        // Get the current checkbox state from the DOM element
        const checkbox = target as HTMLInputElement;
        const currentCheckboxState = checkbox.getAttribute('data-task') === 'x';
        
        // Determine the new state (opposite of current checkbox state)
        const newState = !currentCheckboxState;
        
        // Update the DOM to show/hide the datestamp immediately
        this.updateDatestampInDOM(taskListItem, newState);
    }

    /**
     * Updates the datestamp in the DOM without modifying the file
     */
    private updateDatestampInDOM(taskListItem: Element, isChecked: boolean) {
        if (isChecked) {
            // Task is being checked - add datestamp to DOM if not present
            if (!taskListItem.querySelector('.bgtd-datestamp')) {
                const date = this.getCurrentDate();
                const datestampElement = document.createElement('span');
                datestampElement.textContent = ` ✅ ${date}`;
                datestampElement.style.color = '#22c55e'; // Green color for checkmark
                
                // Find the task text content area - look for the actual text, not the container
                // We want to append after the task text, not before the checkbox
                let targetElement = taskListItem.querySelector('.cm-line') ||
                                   taskListItem.querySelector('.HyperMD-task-line') ||
                                   taskListItem.querySelector('.cm-content');
                
                // If we can't find a specific text container, look for the last text node
                if (!targetElement) {
                    // Find the last text-containing element in the list item
                    const textElements = Array.from(taskListItem.querySelectorAll('*')).filter(el => 
                        el.textContent && 
                        el.textContent.trim() && 
                        !el.classList.contains('task-list-item-checkbox')
                    );
                    
                    if (textElements.length > 0) {
                        // Use the last text element (which should be the task description)
                        targetElement = textElements[textElements.length - 1];
                    } else {
                        // Fallback to the list item itself
                        targetElement = taskListItem;
                    }
                }
                
                // Append the datestamp to the target element
                targetElement.appendChild(datestampElement);
                
                console.log('Added datestamp to DOM:', datestampElement.textContent);
            }
        } else {
            // Task is being unchecked - remove datestamp from DOM if present
            // Look for the cm-list-1 span that contains the task text
            const taskTextSpan = taskListItem.querySelector('.cm-list-1');
            if (taskTextSpan && taskTextSpan.textContent) {
                const currentText = taskTextSpan.textContent;
                // Remove the datestamp portion that starts with checkmark emoji
                const cleanedText = currentText.replace(/✅\s+\d{4}-\d{2}-\d{2}$/g, '').trim();
                
                if (cleanedText !== currentText) {
                    // Wait for the next render cycle after Obsidian's DOM updates
                    requestAnimationFrame(() => {
                        taskTextSpan.textContent = " " + cleanedText;
                        console.log('Removed datestamp from task text:', cleanedText);
                    });
                }
            }
        }
    }

    onunload() {
        console.log("BGTD Plugin unloaded");
        if (this.fileChangeListener) {
            this.app.vault.off("modify", this.fileChangeListener);
        }
        document.removeEventListener("click", this.clickHandler, true); // Remove click handler on unload
    }
}