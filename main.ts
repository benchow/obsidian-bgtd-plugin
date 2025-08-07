import { Plugin, TFile } from "obsidian";

export default class BGTDPlugin extends Plugin {
    async onload() {
        console.log("BGTD Plugin loaded");

        // Listen for any Markdown file modification
        this.registerEvent(
            this.app.vault.on("modify", (file: TFile) => {
                this.handleFileChange(file);
            })
        );
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
        return `${taskText} ✅ ${date}`;
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

        try {
            const content = await this.app.vault.read(file);
            const lines = content.split("\n");
            
            // Collect all tasks that need to be moved
            const tasksToMove = this.collectTasksToMove(lines, file);
            
            if (tasksToMove.length === 0) return;
            
            // Batch process all tasks
            await this.batchMoveTasks(tasksToMove, file);
            
        } catch (error) {
            console.error("Error handling file change:", error);
        }
    }

    /**
     * Collects all tasks that need to be moved from the file
     */
    collectTasksToMove(lines: string[], file: TFile): Array<{task: string, type: 'completed' | 'unchecked'}> {
        const tasks: Array<{task: string, type: 'completed' | 'unchecked'}> = [];
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Check for completed tasks (not in " - Done" files)
            if (trimmedLine.startsWith("- [x]") && !file.basename.endsWith(" - Done")) {
                const taskText = trimmedLine.replace("- [x]", "").trim();
                // Add date and time to completed tasks
                const taskWithDateTime = this.addDateTimeToTask(taskText);
                tasks.push({ task: taskWithDateTime, type: 'completed' });
            }
            
            // Check for unchecked tasks (in " - Done" files)
            if (trimmedLine.startsWith("- [ ]") && file.basename.endsWith(" - Done")) {
                const taskText = trimmedLine.replace("- [ ]", "").trim();
                // Remove date and time from unchecked tasks
                const taskWithoutDateTime = this.removeDateTimeFromTask(taskText);
                tasks.push({ task: taskWithoutDateTime, type: 'unchecked' });
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
            const taskTexts = tasks.map(t => t.task);
            
            const filteredLines = lines.filter(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith("- [x]")) return true;
                
                const taskText = trimmedLine.replace("- [x]", "").trim();
                // Compare without date/time for removal
                const taskWithoutDateTime = this.removeDateTimeFromTask(taskText);
                return !taskTexts.map(t => this.removeDateTimeFromTask(t)).includes(taskWithoutDateTime);
            });
            
            const newContent = filteredLines.join("\n");
            console.log(`Updating original file with ${filteredLines.length} lines`);
            await this.app.vault.modify(file, newContent);

            // Ensure the done file exists and add all completed tasks
            const doneFile = await this.ensureFileExists(doneFilePath);
            const completedTaskLines = tasks.map(t => `- [x] ${t.task}`);
            
            // Prepend all tasks to the existing content
            const currentContent = await this.app.vault.read(doneFile);
            const newDoneContent = completedTaskLines.join("\n") + "\n" + currentContent;
            await this.app.vault.modify(doneFile, newDoneContent);
            
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
            const taskTexts = tasks.map(t => t.task);
            
            const filteredLines = lines.filter(line => {
                const trimmedLine = line.trim();
                if (!trimmedLine.startsWith("- [ ]")) return true;
                
                const taskText = trimmedLine.replace("- [ ]", "").trim();
                // Compare without date/time for removal
                const taskWithoutDateTime = this.removeDateTimeFromTask(taskText);
                return !taskTexts.map(t => this.removeDateTimeFromTask(t)).includes(taskWithoutDateTime);
            });
            
            const newDoneContent = filteredLines.join("\n");
            await this.app.vault.modify(file, newDoneContent);

            // Add all unchecked tasks to the top of the original file
            const originalContent = await this.app.vault.read(originalFile);
            const uncheckedTaskLines = tasks.map(t => `- [ ] ${t.task}`);
            const newOriginalContent = uncheckedTaskLines.join("\n") + "\n" + originalContent;
            await this.app.vault.modify(originalFile, newOriginalContent);

            console.log(`❌ Successfully moved ${tasks.length} unchecked tasks back to ${originalFile.path}`);
        } catch (error) {
            console.error("Error moving unchecked tasks to original file:", error);
        }
    }

    onunload() {
        console.log("BGTD Plugin unloaded");
    }
}