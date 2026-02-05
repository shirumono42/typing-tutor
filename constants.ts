import { LessonType, FileType, LessonData, CodeSegment } from './types';

// Helper to create segments easily
const bp = (text: string): CodeSegment => ({ text, type: 'auto' });
const code = (text: string): CodeSegment => ({ text, type: 'type' });

export const UI_LABELS = {
    title: "Typing Tutor",
    homeTyping: "Start Typing",
    homeCreate: "Add Typing Content",
    createTitle: "Create a Typing Lesson",
    createNameLabel: "Title",
    createDescriptionLabel: "Description",
    createContentLabel: "Typing Content",
    createLineTypeLabel: "Line Type",
    createTagsLabel: "Tags",
    createFileNameLabel: "File name",
    createFileLanguageLabel: "Language",
    createAddFileButton: "Add File",
    createRemoveFileButton: "Remove",
    createSaveButton: "Save Changes",
    createEditButton: "Edit",
    createDeleteButton: "Delete",
    createNewButton: "New Lesson",
    createCancelEdit: "Cancel Edit",
    createAddButton: "Add Lesson",
    createBack: "Back to Home",
    createHint: "Choose which lines are auto-filled (auto) or typed by the user (type).",
    createError: "Please fill in all fields.",
    wpm: "WPM",
    accuracy: "Accuracy",
    backToMenu: "Back to Menu",
    startCoding: "Start Typing ->",
    codeComplete: "Lesson Complete!",
    tryAgain: "Choose Lesson",
    typos: "Typos",
    footer: "Build speed and accuracy by typing real code. Press any key to start.",
    analyzing: "Analyzing logic...",
    closeTutor: "Close Tutor",
    explainCode: "Explain Code",
    tags: ["Basics", "Syntax"]
};

const WARMUP_LESSON: LessonData = {
    id: LessonType.BASICS,
    title: "JavaScript Warmup",
    description: "Build a tiny task list with clear functions and arrays.",
    tags: UI_LABELS.tags,
    fileLanguages: {
        [FileType.MAIN_JS]: 'javascript',
    },
    files: {
        [FileType.MAIN_JS]: [
            bp(`// Build a tiny task list\n`),
            code(`const tasks = [];\n\n`),
            bp(`// Add a task with a clear label\n`),
            code(`function addTask(label) {\n    tasks.push({ label, done: false });\n}\n\n`),
            bp(`// Mark a task done by index\n`),
            code(`function completeTask(index) {\n    if (tasks[index]) tasks[index].done = true;\n}\n\n`),
            code(`addTask("Ship the demo");\naddTask("Write docs");\ncompleteTask(0);\nconsole.log(tasks);\n`)
        ],
    },
    fileOrder: [FileType.MAIN_JS]
};

const HELPERS_LESSON: LessonData = {
    id: LessonType.HELPERS,
    title: "TypeScript Helpers",
    description: "Write small utilities and use them in a clean main file.",
    tags: ["TypeScript", "Functions"],
    fileLanguages: {
        [FileType.MAIN_TS]: 'typescript',
        [FileType.UTILS_TS]: 'typescript',
    },
    files: {
        [FileType.MAIN_TS]: [
            bp(`import { clamp, formatPercent } from "./utils";\n\n`),
            code(`type Score = { correct: number; total: number };\n\n`),
            code(`const computeAccuracy = ({ correct, total }: Score) => {\n    if (total === 0) return 1;\n    return clamp(correct / total, 0, 1);\n};\n\n`),
            code(`const score: Score = { correct: 42, total: 50 };\nconst accuracy = computeAccuracy(score);\nconsole.log(formatPercent(accuracy));\n`)
        ],
        [FileType.UTILS_TS]: [
            bp(`// Small helpers for analytics\n`),
            code(`export const clamp = (value: number, min: number, max: number) => {\n    return Math.min(max, Math.max(min, value));\n};\n\n`),
            code(`export const formatPercent = (value: number) => {\n    return String(Math.round(value * 100)) + "%";\n};\n`)
        ]
    },
    fileOrder: [FileType.MAIN_TS, FileType.UTILS_TS]
};

export const getLessons = (): LessonData[] => [WARMUP_LESSON, HELPERS_LESSON];
