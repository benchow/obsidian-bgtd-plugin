import { Plugin, TFile } from "obsidian";

export default class TaskDoneListenerPlugin extends Plugin {
    private previousContents: Map<string, string> = new Map();

    async onload() {
        console.log("TaskDoneListenerPlugin loaded");

        // Listen for any Markdown file modification
        this.registerEvent(
            this.app.vault.on("modify", (file: TFile) => {
                this.handleFileChange(file);
            })
        );

        // Store the current content of all markdown files on load
        for (const file of this.app.vault.getMarkdownFiles()) {
            const contents = await this.app.vault.read(file);
            this.previousContents.set(file.path, contents);
        }
    }

    async handleFileChange(file: TFile) {
        if (file.extension !== "md") return;

        const newContents = await this.app.vault.read(file);
        const oldContents = this.previousContents.get(file.path) || "";

        const oldLines = oldContents.split("\n");
        const newLines = newContents.split("\n");

        for (let i = 0; i < newLines.length; i++) {
            if (
                oldLines[i] &&
                oldLines[i].startsWith("- [ ]") &&
                newLines[i] &&
                newLines[i].startsWith("- [x]")
            ) {
                const taskText = newLines[i].replace("- [x]", "").trim();
                console.log("✅ Task completed:", taskText);

                // 🔹 Run your custom GTD behavior here
                await this.onTaskCompleted(taskText, file);
            }
        }

        this.previousContents.set(file.path, newContents);
    }

    async onTaskCompleted(task: string, file: TFile) {
        // Example GTD action: append to a "Completed.md" log
        const completedLog = this.app.vault.getAbstractFileByPath("Completed.md");
        const logLine = `${new Date().toISOString()} - ${task} (from ${file.basename})\n`;

        if (completedLog instanceof TFile) {
            const currentLog = await this.app.vault.read(completedLog);
            await this.app.vault.modify(completedLog, currentLog + logLine);
        } else {
            await this.app.vault.create("Completed.md", logLine);
        }
    }
}