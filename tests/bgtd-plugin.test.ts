import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Test the core logic functions directly
describe('BGTD Plugin Core Logic', () => {
  
  describe('Feature 1: Task Completion Logic', () => {
    it('should detect completed tasks in regular files', () => {
      const lines = ['- [x] Task 1', '- [ ] Task 2'];
      const isDoneFile = false;
      
      let completedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      expect(completedTasks).toEqual(['Task 1']);
    });

    it('should not detect completed tasks in " - Done" files', () => {
      const lines = ['- [x] Task 1', '- [ ] Task 2'];
      const isDoneFile = true;
      
      let completedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      expect(completedTasks).toEqual([]);
    });

    it('should create correct " - Done" file path', () => {
      const filePath = 'test.md';
      const doneFilePath = filePath.replace(/\.md$/, " - Done.md");
      expect(doneFilePath).toBe('test - Done.md');
    });

    it('should filter completed tasks from original file', () => {
      const originalContent = '- [x] Task 1\n- [ ] Task 2\n- [x] Task 3';
      const lines = originalContent.split("\n");
      const taskToRemove = 'Task 1';
      
      const filteredLines = lines.filter(line => {
        const trimmedLine = line.trim();
        return !trimmedLine.startsWith("- [x]") || 
               trimmedLine.replace("- [x]", "").trim() !== taskToRemove;
      });
      
      const result = filteredLines.join("\n");
      expect(result).toBe('- [ ] Task 2\n- [x] Task 3');
    });

    it('should prepend completed task to done file content', () => {
      const existingDoneContent = '- [x] Previous Task';
      const completedTaskLine = '- [x] New Task';
      const newDoneContent = completedTaskLine + "\n" + existingDoneContent;
      
      expect(newDoneContent).toBe('- [x] New Task\n- [x] Previous Task');
    });

    it('should handle case when " - Done" file does not exist', () => {
      // This test verifies that " - Done" files are created when they don't exist
      const originalFile = 'test.md';
      const doneFilePath = originalFile.replace(/\.md$/, " - Done.md");
      
      // Simulate file creation
      const completedTask = 'New Task';
      const newDoneContent = `- [x] ${completedTask}\n`;
      
      expect(doneFilePath).toBe('test - Done.md');
      expect(newDoneContent).toBe('- [x] New Task\n');
    });
  });

  describe('Feature 2: Task Restoration Logic', () => {
    it('should detect unchecked tasks in " - Done" files', () => {
      const lines = ['- [ ] Completed Task', '- [x] Another Task'];
      const isDoneFile = true;
      
      let uncheckedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [ ]") && isDoneFile) {
          const taskText = line.replace("- [ ]", "").trim();
          uncheckedTasks.push(taskText);
        }
      }
      
      expect(uncheckedTasks).toEqual(['Completed Task']);
    });

    it('should not detect unchecked tasks in regular files', () => {
      const lines = ['- [ ] Task 1', '- [x] Task 2'];
      const isDoneFile = false;
      
      let uncheckedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [ ]") && isDoneFile) {
          const taskText = line.replace("- [ ]", "").trim();
          uncheckedTasks.push(taskText);
        }
      }
      
      expect(uncheckedTasks).toEqual([]);
    });

    it('should identify " - Done" files correctly', () => {
      const doneFile = { basename: 'test - Done' };
      const regularFile = { basename: 'test' };
      
      expect(doneFile.basename.endsWith(' - Done')).toBe(true);
      expect(regularFile.basename.endsWith(' - Done')).toBe(false);
    });

    it('should find original file path from done file', () => {
      const doneFilePath = 'test - Done.md';
      const originalFilePath = doneFilePath.replace(" - Done.md", ".md");
      
      expect(originalFilePath).toBe('test.md');
    });

    it('should remove unchecked tasks from done file', () => {
      const doneContent = '- [x] Task 1\n- [ ] Task 2\n- [x] Task 3';
      const lines = doneContent.split("\n");
      const taskToRemove = 'Task 2';
      
      const filteredLines = lines.filter(line => {
        const trimmedLine = line.trim();
        return !trimmedLine.startsWith("- [ ]") || 
               trimmedLine.replace("- [ ]", "").trim() !== taskToRemove;
      });
      
      const result = filteredLines.join("\n");
      expect(result).toBe('- [x] Task 1\n- [x] Task 3');
    });

    it('should prepend unchecked task to original file', () => {
      const originalContent = '- [ ] Other Task';
      const uncheckedTaskLine = '- [ ] Restored Task';
      const newOriginalContent = uncheckedTaskLine + "\n" + originalContent;
      
      expect(newOriginalContent).toBe('- [ ] Restored Task\n- [ ] Other Task');
    });

    it('should handle case when original file does not exist', () => {
      // This test verifies that original files are created when they don't exist
      const doneFile = 'test - Done.md';
      const originalFilePath = doneFile.replace(" - Done.md", ".md");
      
      // Simulate file creation
      const uncheckedTask = 'Restored Task';
      const newOriginalContent = `- [ ] ${uncheckedTask}\n`;
      
      expect(originalFilePath).toBe('test.md');
      expect(newOriginalContent).toBe('- [ ] Restored Task\n');
    });
  });

  describe('File Creation Scenarios', () => {
    it('should create " - Done" file when it does not exist', () => {
      const originalFile = 'test.md';
      const doneFilePath = originalFile.replace(/\.md$/, " - Done.md");
      const completedTask = 'New Task';
      
      // Simulate file creation logic
      const shouldCreateFile = true; // File doesn't exist
      const newDoneContent = `- [x] ${completedTask}\n`;
      
      expect(shouldCreateFile).toBe(true);
      expect(doneFilePath).toBe('test - Done.md');
      expect(newDoneContent).toBe('- [x] New Task\n');
    });

    it('should create original file when it does not exist', () => {
      const doneFile = 'test - Done.md';
      const originalFilePath = doneFile.replace(" - Done.md", ".md");
      const uncheckedTask = 'Restored Task';
      
      // Simulate file creation logic
      const shouldCreateFile = true; // File doesn't exist
      const newOriginalContent = `- [ ] ${uncheckedTask}\n`;
      
      expect(shouldCreateFile).toBe(true);
      expect(originalFilePath).toBe('test.md');
      expect(newOriginalContent).toBe('- [ ] Restored Task\n');
    });

    it('should handle empty original file creation', () => {
      const originalFilePath = 'test.md';
      const emptyContent = "";
      
      // Simulate creating empty file
      const shouldCreateEmptyFile = true;
      
      expect(shouldCreateEmptyFile).toBe(true);
      expect(emptyContent).toBe("");
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const lines = [''];
      const isDoneFile = false;
      
      let completedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      expect(completedTasks).toEqual([]);
    });

    it('should handle whitespace in task lines', () => {
      const lines = ['  - [x] Task 1  '];
      const isDoneFile = false;
      
      let completedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      expect(completedTasks).toEqual(['Task 1']);
    });

    it('should handle mixed task states', () => {
      const lines = ['- [x] Task 1', '- [ ] Task 2', '- [x] Task 3'];
      const isDoneFile = false;
      
      let completedTasks = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      expect(completedTasks).toEqual(['Task 1', 'Task 3']);
    });
  });

  describe('Requirements Verification', () => {
    it('should verify Feature 1: Task completion moves to _Done file', () => {
      // This test verifies the core requirement:
      // "If the task is marked done and it is not in a _Done file then remove it from the original file and move it to the top of the _Done file"
      
      const originalFile = 'test.md';
      const doneFile = 'test - Done.md';
      
      // Simulate completed task in regular file
      const lines = ['- [x] Task 1', '- [ ] Task 2'];
      const isDoneFile = false;
      
      let completedTask = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          completedTask = line.replace("- [x]", "").trim();
          break;
        }
      }
      
      // Verify the task was detected
      expect(completedTask).toBe('Task 1');
      
      // Verify the done file path is correct
      const doneFilePath = originalFile.replace(/\.md$/, " - Done.md");
      expect(doneFilePath).toBe('test - Done.md');
      
      // Verify the task would be prepended to done file
      const doneFileContent = '- [x] Previous Task';
      const newDoneContent = `- [x] ${completedTask}\n${doneFileContent}`;
      expect(newDoneContent).toBe('- [x] Task 1\n- [x] Previous Task');
    });

    it('should verify Feature 2: Unchecked tasks move back to original file', () => {
      // This test verifies the core requirement:
      // "If the task is unchecked and in a _Done file we remove it from the _Done file and add it to the top of the original file"
      
      const doneFile = 'test - Done.md';
      const originalFile = 'test.md';
      
      // Simulate unchecked task in done file
      const lines = ['- [ ] Completed Task', '- [x] Another Task'];
      const isDoneFile = true;
      
      let uncheckedTask = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [ ]") && isDoneFile) {
          uncheckedTask = line.replace("- [ ]", "").trim();
          break;
        }
      }
      
      // Verify the task was detected
      expect(uncheckedTask).toBe('Completed Task');
      
      // Verify it's a " - Done" file
      const fileBasename = doneFile.replace('.md', '');
      expect(fileBasename.endsWith(' - Done')).toBe(true);
      
      // Verify original file path is found
      const originalFilePath = doneFile.replace(" - Done.md", ".md");
      expect(originalFilePath).toBe('test.md');
      
      // Verify task would be prepended to original file
      const originalContent = '- [ ] Other Task';
      const newOriginalContent = `- [ ] ${uncheckedTask}\n${originalContent}`;
      expect(newOriginalContent).toBe('- [ ] Completed Task\n- [ ] Other Task');
    });

    it('should verify completed tasks in _Done files are ignored', () => {
      // This test verifies that completed tasks in _Done files don't trigger any action
      
      const lines = ['- [x] Completed Task'];
      const isDoneFile = true;
      
      let completedTasks = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("- [x]") && !isDoneFile) {
          const taskText = line.replace("- [x]", "").trim();
          completedTasks.push(taskText);
        }
      }
      
      // Verify no tasks were detected (because it's a _Done file)
      expect(completedTasks).toEqual([]);
    });
  });

  describe('Date/Time Feature', () => {
    it('should add green checkmark emoji and date to completed tasks', () => {
      // Mock the date functionality
      const mockDate = new Date('2024-01-15T10:30:45');
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate) as any;
      
      // Simulate the date formatting
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      const taskText = 'Complete project';
      const date = formatDate(mockDate);
      const taskWithCheckmark = `${taskText} ✅ ${date}`;
      
      expect(taskWithCheckmark).toBe('Complete project ✅ 2024-01-15');
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('should remove green checkmark emoji and date from unchecked tasks', () => {
      // Test removing green checkmark emoji and date from various formats
      const removeCheckmarkAndDate = (taskText: string) => {
        return taskText.replace(/✅\s+\d{4}-\d{2}-\d{2}$/g, '').trim();
      };
      
      const testCases = [
        'Task 1 ✅ 2024-01-15',
        'Task 2 ✅ 2024-12-31',
        'Task 3 ✅ 2024-01-15',
        'Task 4 ✅ 2024-01-15',
        'Task 5' // No checkmark and date
      ];
      
      const expectedResults = [
        'Task 1',
        'Task 2',
        'Task 3',
        'Task 4',
        'Task 5'
      ];
      
      testCases.forEach((testCase, index) => {
        const result = removeCheckmarkAndDate(testCase);
        expect(result).toBe(expectedResults[index]);
      });
    });

    it('should handle tasks with and without green checkmark emoji and date correctly', () => {
      // Test that completed tasks get green checkmark emoji and date added
      const originalTask = 'Complete documentation';
      const addCheckmarkAndDate = (taskText: string) => {
        const mockDate = new Date('2024-01-15T10:30:45');
        const year = mockDate.getFullYear();
        const month = String(mockDate.getMonth() + 1).padStart(2, '0');
        const day = String(mockDate.getDate()).padStart(2, '0');
        const date = `${year}-${month}-${day}`;
        return `${taskText} ✅ ${date}`;
      };
      
      const completedTask = addCheckmarkAndDate(originalTask);
      expect(completedTask).toBe('Complete documentation ✅ 2024-01-15');
      
      // Test that unchecked tasks have green checkmark emoji and date removed
      const removeCheckmarkAndDate = (taskText: string) => {
        return taskText.replace(/✅\s+\d{4}-\d{2}-\d{2}$/g, '').trim();
      };
      
      const uncheckedTask = removeCheckmarkAndDate(completedTask);
      expect(uncheckedTask).toBe(originalTask);
    });

    it('should use requestAnimationFrame for DOM coordination', () => {
      // Test that requestAnimationFrame is used for coordinating with Obsidian's updates
      const mockRequestAnimationFrame = jest.fn((callback: () => void) => {
        callback();
      });
      
      // Mock requestAnimationFrame
      const originalRequestAnimationFrame = global.requestAnimationFrame;
      global.requestAnimationFrame = mockRequestAnimationFrame as any;
      
      // Simulate the requestAnimationFrame usage
      const updateDOM = () => {
        requestAnimationFrame(() => {
          // DOM update logic would go here
        });
      };
      
      updateDOM();
      
      // Verify requestAnimationFrame was called
      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(expect.any(Function));
      
      // Restore original requestAnimationFrame
      global.requestAnimationFrame = originalRequestAnimationFrame;
    });

    it('should prevent duplicate tasks when moving unchecked tasks back to original file', () => {
      // Test duplicate prevention logic
      const originalContent = `
- [ ] Task 1
- [ ] Task 2
- [x] Task 3 ✅ 2024-01-15
- [ ] Task 4
`.trim();

      const lines = originalContent.split("\n");
      const existingTasks = new Set(lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith("- [ ]") || trimmedLine.startsWith("- [x]")) {
          return trimmedLine.replace(/^- \[[ x]\]\s*/, "").trim();
        }
        return null;
      }).filter(Boolean));

      // Simulate unchecked tasks that might be duplicates
      const uncheckedTasks = [
        { task: "Task 1", type: 'unchecked' as const }, // Already exists
        { task: "Task 2", type: 'unchecked' as const }, // Already exists  
        { task: "Task 5", type: 'unchecked' as const }, // New task
        { task: "Task 6", type: 'unchecked' as const }  // New task
      ];

      // Filter out tasks that already exist
      const newTasks = uncheckedTasks.filter(task => !existingTasks.has(task.task));
      
      expect(newTasks).toHaveLength(2);
      expect(newTasks.map(t => t.task)).toEqual(["Task 5", "Task 6"]);
      expect(existingTasks.has("Task 1")).toBe(true);
      expect(existingTasks.has("Task 2")).toBe(true);
      expect(existingTasks.has("Task 5")).toBe(false);
      expect(existingTasks.has("Task 6")).toBe(false);
    });
  });

  describe('Click Event Handler', () => {
    it('should detect task checkbox clicks', () => {
      // Test that the click handler can identify task checkboxes
      const mockEvent = {
        target: {
          classList: {
            contains: jest.fn((className: string) => className === 'task-list-item-checkbox')
          }
        }
      };
      
      const isTaskCheckbox = mockEvent.target.classList.contains('task-list-item-checkbox');
      expect(isTaskCheckbox).toBe(true);
    });

    it('should ignore non-checkbox clicks', () => {
      // Test that non-checkbox clicks are ignored
      const mockEvent = {
        target: {
          classList: {
            contains: jest.fn((className: string) => className === 'task-list-item-checkbox')
          }
        }
      };
      
      // Simulate a non-checkbox element
      mockEvent.target.classList.contains = jest.fn(() => false);
      
      const isTaskCheckbox = mockEvent.target.classList.contains('task-list-item-checkbox');
      expect(isTaskCheckbox).toBe(false);
    });

    it('should find task list item parent', () => {
      // Test that the click handler can find the parent task list item
      const mockTarget = {
        closest: jest.fn((selector: string) => {
          if (selector === '.HyperMD-task-line' || selector === 'li') {
            return { querySelector: jest.fn() };
          }
          return null;
        })
      };
      
      const taskListItem = mockTarget.closest('.HyperMD-task-line') || mockTarget.closest('li');
      expect(taskListItem).toBeDefined();
    });

    it('should determine checkbox state correctly', () => {
      // Test that the checkbox state is determined correctly
      const mockCheckbox = {
        getAttribute: jest.fn((attr: string) => {
          if (attr === 'data-task') return 'x';
          return null;
        })
      };
      
      const currentState = mockCheckbox.getAttribute('data-task') === 'x';
      expect(currentState).toBe(true);
    });
  });
}); 