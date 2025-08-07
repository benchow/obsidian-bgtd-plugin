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

    async handleFileChange(file: TFile) {
        if (file.extension !== "md") return;

        try {
            const content = await this.app.vault.read(file);
            const lines = content.split("\n");
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // Check for completed tasks (not in " - Done" files)
                if (line.startsWith("- [x]") && !file.basename.endsWith(" - Done")) {
                    const taskText = line.replace("- [x]", "").trim();
                    console.log("✅ Task completed:", taskText);
                    await this.moveTaskToDoneFile(taskText, file);
                    return; // Exit after processing one task
                }
                
                // Check for unchecked tasks (in " - Done" files)
                if (line.startsWith("- [ ]") && file.basename.endsWith(" - Done")) {
                    const taskText = line.replace("- [ ]", "").trim();
                    console.log("❌ Task unchecked in _Done file:", taskText);
                    await this.moveTaskToOriginalFile(taskText, file);
                    return; // Exit after processing one task
                }
            }
        } catch (error) {
            console.error("Error handling file change:", error);
        }
    }

    async moveTaskToDoneFile(task: string, file: TFile) {
        try {
            console.log(`Moving completed task to _Done file: "${task}"`);
            
            // Create the " - Done" file path
            const doneFilePath = file.path.replace(/\.md$/, " - Done.md");
            console.log(`Done file path: ${doneFilePath}`);
            
            // Remove the completed task from the original file
            const originalContent = await this.app.vault.read(file);
            const lines = originalContent.split("\n");
            const filteredLines = lines.filter(line => {
                const trimmedLine = line.trim();
                return !trimmedLine.startsWith("- [x]") || 
                       trimmedLine.replace("- [x]", "").trim() !== task;
            });
            const newContent = filteredLines.join("\n");
            
            console.log(`Updating original file with ${filteredLines.length} lines`);
            await this.app.vault.modify(file, newContent);

            // Add the completed task to the "_Done" file
            const doneFile = this.app.vault.getAbstractFileByPath(doneFilePath);
            const completedTaskLine = `- [x] ${task}`;
            
            if (doneFile instanceof TFile) {
                // File exists, prepend the task
                const currentContent = await this.app.vault.read(doneFile);
                const newDoneContent = completedTaskLine + "\n" + currentContent;
                await this.app.vault.modify(doneFile, newDoneContent);
                console.log(`Updated existing done file: ${doneFilePath}`);
            } else {
                // File doesn't exist, create it
                await this.app.vault.create(doneFilePath, completedTaskLine + "\n");
                console.log(`Created new done file: ${doneFilePath}`);
            }

            console.log(`✅ Successfully moved completed task to ${doneFilePath}`);
        } catch (error) {
            console.error("Error moving task to done file:", error);
        }
    }

    async moveTaskToOriginalFile(task: string, file: TFile) {
        try {
            console.log(`Moving unchecked task back to original file: "${task}"`);
            
            // Find the original file
            const originalFilePath = file.path.replace(" - Done.md", ".md");
            const originalFile = this.app.vault.getAbstractFileByPath(originalFilePath);
            
            console.log(`Looking for original file: ${originalFilePath}`);
            
            if (originalFile instanceof TFile) {
                // Original file exists, proceed normally
                await this.performTaskMove(task, file, originalFile);
            } else {
                // Original file doesn't exist, create it
                console.log(`Original file not found, creating: ${originalFilePath}`);
                await this.app.vault.create(originalFilePath, "");
                const newOriginalFile = this.app.vault.getAbstractFileByPath(originalFilePath);
                if (newOriginalFile instanceof TFile) {
                    await this.performTaskMove(task, file, newOriginalFile);
                } else {
                    console.error(`Failed to create original file: ${originalFilePath}`);
                }
            }
        } catch (error) {
            console.error("Error moving task to original file:", error);
        }
    }

    async performTaskMove(task: string, doneFile: TFile, originalFile: TFile) {
        // Remove the unchecked task from the "_Done" file
        const doneContent = await this.app.vault.read(doneFile);
        const lines = doneContent.split("\n");
        const filteredLines = lines.filter(line => {
            const trimmedLine = line.trim();
            return !trimmedLine.startsWith("- [ ]") || 
                   trimmedLine.replace("- [ ]", "").trim() !== task;
        });
        const newDoneContent = filteredLines.join("\n");
        await this.app.vault.modify(doneFile, newDoneContent);

        // Add the unchecked task to the top of the original file
        const originalContent = await this.app.vault.read(originalFile);
        const uncheckedTaskLine = `- [ ] ${task}`;
        const newOriginalContent = uncheckedTaskLine + "\n" + originalContent;
        await this.app.vault.modify(originalFile, newOriginalContent);

        console.log(`❌ Successfully moved unchecked task back to ${originalFile.path}`);
    }

    onunload() {
        console.log("BGTD Plugin unloaded");
    }
}