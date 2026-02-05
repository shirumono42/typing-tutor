import React, { useEffect, useMemo, useState } from 'react';
import { getLessons, UI_LABELS } from './constants';
import { AppMode, TypingStats, CodeSegment, Language, LessonId, LessonFileKey, SegmentType, LessonData, ProgrammingLanguage } from './types';
import TypingArea from './components/TypingArea';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(null);
  const [activeFile, setActiveFile] = useState<LessonFileKey | null>(null);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [language, setLanguage] = useState<Language>(Language.EN);
  const [customLessons, setCustomLessons] = useState<LessonData[]>([]);

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<LessonId | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  type DraftFile = {
    key: string;
    content: string;
    lineTypes: SegmentType[];
    language: ProgrammingLanguage;
  };

  const createEmptyDraftFile = (): DraftFile => ({ key: '', content: '', lineTypes: [], language: 'c_cpp' });
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([createEmptyDraftFile()]);

  const builtInLessons = useMemo(() => getLessons(language), [language]);
  const lessons = useMemo(() => [...builtInLessons, ...customLessons], [builtInLessons, customLessons]);
  const lessonsById = useMemo(() => {
    const map: Record<string, LessonData> = {};
    lessons.forEach((lesson) => { map[lesson.id] = lesson; });
    return map;
  }, [lessons]);
  const labels = UI_LABELS[language];

  useEffect(() => {
    const stored = localStorage.getItem('customLessons');
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as LessonData[];
      if (Array.isArray(parsed)) {
        const normalizeType = (value: string | undefined): SegmentType => {
          if (value === 'auto' || value === 'type') return value;
          if (value === 'boilerplate') return 'auto';
          return 'type';
        };
        const normalizeLanguage = (value: string | undefined): ProgrammingLanguage => {
          if (value === 'python' || value === 'java' || value === 'csharp' || value === 'javascript' || value === 'typescript') return value;
          return 'c_cpp';
        };
        const normalized = parsed.map((lesson) => ({
          ...lesson,
          tags: lesson.tags ?? [],
          files: Object.fromEntries(
            Object.entries(lesson.files ?? {}).map(([key, segments]) => [
              key,
              (segments ?? []).map((segment) => ({
                ...segment,
                type: normalizeType((segment as CodeSegment).type),
              })),
            ])
          ) as LessonData['files'],
          fileOrder: lesson.fileOrder && lesson.fileOrder.length > 0 ? lesson.fileOrder : Object.keys(lesson.files ?? {}),
          fileLanguages: Object.fromEntries(
            Object.keys(lesson.files ?? {}).map((key) => [
              key,
              normalizeLanguage((lesson as LessonData).fileLanguages?.[key]),
            ])
          ) as LessonData['fileLanguages'],
          isCustom: true,
        }));
        setCustomLessons(normalized);
      }
    } catch {
      setCustomLessons([]);
    }
  }, []);

  const persistCustomLessons = (next: LessonData[]) => {
    localStorage.setItem('customLessons', JSON.stringify(next));
  };

  const startLesson = (lessonId: LessonId) => {
    const lesson = lessonsById[lessonId];
    if (!lesson) return;
    setActiveLessonId(lessonId);
    setMode(AppMode.TYPING);
    setActiveFile(lesson.fileOrder[0] ?? Object.keys(lesson.files)[0] ?? null);
    setStats(null);
  };

  const handleLessonComplete = (finalStats: TypingStats) => {
    setStats(finalStats);
    // Could add confetti or sound here
  };

  const goBackToMenu = () => {
    setMode(AppMode.MENU);
    setStats(null);
  };

  const goHome = () => {
    setMode(AppMode.HOME);
    setStats(null);
  };

  const activeLesson = activeLessonId ? lessonsById[activeLessonId] : null;

  const activeFileLanguage: ProgrammingLanguage = activeLesson && activeFile
    ? (activeLesson.fileLanguages?.[activeFile] ?? 'c_cpp')
    : 'c_cpp';

  const getActiveSegments = (): CodeSegment[] => {
    if (!activeLesson || !activeFile) return [];
    return activeLesson.files[activeFile] ?? [];
  };

  const getActiveContext = () => {
    if (!activeLesson) return '';
    return `${activeLesson.title} - ${activeFile ?? ''} - ${activeLesson.description}`;
  };

  const buildSegmentsFromLines = (lines: string[], types: SegmentType[]): CodeSegment[] => {
    if (lines.length === 1 && lines[0] === '') return [];
    const segments: CodeSegment[] = [];
    lines.forEach((line, idx) => {
      const text = idx < lines.length - 1 ? `${line}\n` : line;
      const type = types[idx] ?? 'type';
      const last = segments[segments.length - 1];
      if (last && last.type === type) {
        last.text += text;
      } else {
        segments.push({ text, type });
      }
    });
    return segments;
  };

  const syncLineTypes = (content: string, previous: SegmentType[]) => {
    const lines = content.split('\n');
    return lines.map((_, idx) => previous[idx] ?? 'type');
  };

  const buildContentAndLineTypes = (segments: CodeSegment[]) => {
    let content = '';
    const lineTypes: SegmentType[] = [];
    let lineIndex = 0;
    segments.forEach((segment) => {
      const normalizedType: SegmentType = segment.type === 'auto' || segment.type === 'type'
        ? segment.type
        : (segment.type === 'boilerplate' ? 'auto' : 'type');
      for (const char of segment.text) {
        content += char;
        if (lineTypes[lineIndex] == null) lineTypes[lineIndex] = normalizedType;
        if (char === '\n') lineIndex += 1;
      }
    });
    if (lineTypes.length === 0 && content === '') return { content: '', lineTypes: [] };
    return { content, lineTypes: lineTypes.map((t) => t ?? 'type') };
  };

  const updateDraftFileContent = (index: number, content: string) => {
    setDraftFiles((prev) => {
      const next = [...prev];
      const file = next[index];
      if (!file) return prev;
      next[index] = {
        ...file,
        content,
        lineTypes: syncLineTypes(content, file.lineTypes),
      };
      return next;
    });
  };

  const updateDraftFileKey = (index: number, key: string) => {
    setDraftFiles((prev) => {
      const next = [...prev];
      const file = next[index];
      if (!file) return prev;
      next[index] = { ...file, key };
      return next;
    });
  };

  const updateDraftFileLanguage = (index: number, language: ProgrammingLanguage) => {
    setDraftFiles((prev) => {
      const next = [...prev];
      const file = next[index];
      if (!file) return prev;
      next[index] = { ...file, language };
      return next;
    });
  };

  const updateLineType = (fileIndex: number, lineIndex: number, value: SegmentType) => {
    setDraftFiles((prev) => {
      const next = [...prev];
      const file = next[fileIndex];
      if (!file) return prev;
      const updated = [...file.lineTypes];
      updated[lineIndex] = value;
      next[fileIndex] = { ...file, lineTypes: updated };
      return next;
    });
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDescription('');
    setNewTags('');
    setDraftFiles([createEmptyDraftFile()]);
    setEditingLessonId(null);
    setFormError(null);
  };

  const loadLessonForEdit = (lessonId: LessonId) => {
    const lesson = customLessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    setEditingLessonId(lessonId);
    setNewTitle(lesson.title);
    setNewDescription(lesson.description);
    setNewTags(lesson.tags.join(', '));
    const files = lesson.fileOrder.map((fileKey) => {
      const segments = lesson.files[fileKey] ?? [];
      const { content, lineTypes } = buildContentAndLineTypes(segments);
      return {
        key: String(fileKey),
        content,
        lineTypes: syncLineTypes(content, lineTypes),
        language: lesson.fileLanguages?.[fileKey] ?? 'c_cpp',
      };
    });
    setDraftFiles(files.length > 0 ? files : [createEmptyDraftFile()]);
    setFormError(null);
  };

  const handleDeleteLesson = (lessonId: LessonId) => {
    const next = customLessons.filter((item) => item.id !== lessonId);
    setCustomLessons(next);
    persistCustomLessons(next);
    if (editingLessonId === lessonId) resetForm();
  };

  const handleAddLesson = () => {
    const title = newTitle.trim();
    const description = newDescription.trim();
    const tags = newTags.split(',').map((tag) => tag.trim()).filter(Boolean);

    const cleanedFiles = draftFiles
      .map((file) => ({
        key: file.key.trim(),
        content: file.content.trimEnd(),
        lineTypes: file.lineTypes,
      }))
      .filter((file) => file.key || file.content);

    if (!title || !description || cleanedFiles.length === 0) {
      setFormError(labels.createError);
      return;
    }

    if (cleanedFiles.some((file) => !file.key || !file.content)) {
      setFormError(labels.createError);
      return;
    }

    const uniqueKeys = new Set<string>();
    for (const file of cleanedFiles) {
      if (uniqueKeys.has(file.key)) {
        setFormError(labels.createError);
        return;
      }
      uniqueKeys.add(file.key);
    }

    const files: Record<LessonFileKey, CodeSegment[]> = {};
    const fileOrder: LessonFileKey[] = [];
    const fileLanguages: Record<LessonFileKey, ProgrammingLanguage> = {};
    cleanedFiles.forEach((file) => {
      const lines = file.content.split('\n');
      const segments = buildSegmentsFromLines(lines, file.lineTypes.slice(0, lines.length));
      files[file.key] = segments;
      fileOrder.push(file.key);
      fileLanguages[file.key] = file.language;
    });

    const lessonId = editingLessonId ?? `custom-${Date.now()}`;
    const newLesson: LessonData = {
      id: lessonId,
      title,
      description,
      tags,
      files,
      fileOrder,
      fileLanguages,
      isCustom: true,
    };

    const next = editingLessonId
      ? customLessons.map((item) => (item.id === editingLessonId ? newLesson : item))
      : [...customLessons, newLesson];

    setCustomLessons(next);
    persistCustomLessons(next);
    resetForm();
    setMode(AppMode.HOME);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-red-500 rounded flex items-center justify-center font-bold text-white">
              J
            </div>
            <h1 className="text-xl font-bold tracking-tight">{labels.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {mode === AppMode.TYPING && stats && (
              <div className="flex gap-6 text-sm font-semibold hidden md:flex">
                <div className="text-green-400">{labels.wpm}: {stats.wpm}</div>
                <div className="text-blue-400">{labels.accuracy}: {stats.accuracy}%</div>
              </div>
            )}

            {mode === AppMode.TYPING ? (
              <button
                onClick={goBackToMenu}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {labels.backToMenu}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                {mode !== AppMode.HOME && (
                  <button
                    onClick={goHome}
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    {labels.createBack}
                  </button>
                )}
                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button
                    onClick={() => setLanguage(Language.EN)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${language === Language.EN ? 'bg-slate-700 text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage(Language.JP)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${language === Language.JP ? 'bg-slate-700 text-white font-medium' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    日本語
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col">
        {mode === AppMode.HOME ? (
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
              <div
                onClick={() => setMode(AppMode.MENU)}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{labels.homeTyping}</h2>
                <p className="text-slate-400">{labels.startCoding}</p>
              </div>
              <div
                onClick={() => setMode(AppMode.CREATE)}
                className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 cursor-pointer hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-900/20 overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{labels.homeCreate}</h2>
                <p className="text-slate-400">{labels.createHint}</p>
              </div>
            </div>
          </div>
        ) : mode === AppMode.MENU ? (
          <div className="flex-grow flex items-center justify-center p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  onClick={() => startLesson(lesson.id)}
                  className="group relative bg-slate-900 border border-slate-800 rounded-2xl p-8 cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-2xl hover:shadow-blue-900/20 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{lesson.title}</h2>
                    {lesson.isCustom && (
                      <span className="text-xs px-2 py-1 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-700/40">Custom</span>
                    )}
                  </div>
                  <p className="text-slate-400 mb-6">{lesson.description}</p>
                  <div className="flex gap-2 text-xs font-mono text-slate-500">
                    {(lesson.tags ?? []).map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-800 rounded">{tag}</span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center text-blue-500 font-medium opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                    {labels.startCoding}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : mode === AppMode.CREATE ? (
          <div className="flex-grow flex items-start justify-center p-6">
            <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{labels.createTitle}</h2>
                <button
                  onClick={resetForm}
                  className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500"
                >
                  {labels.createNewButton}
                </button>
              </div>

              {customLessons.length > 0 && (
                <div className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customLessons.map((lesson) => (
                      <div key={lesson.id} className="border border-slate-800 rounded-xl p-4 bg-slate-950/40">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-semibold text-white">{lesson.title}</div>
                            <p className="text-xs text-slate-400">{lesson.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadLessonForEdit(lesson.id)}
                              className="text-xs px-2 py-1 rounded border border-slate-700 text-slate-300 hover:text-white"
                            >
                              {labels.createEditButton}
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="text-xs px-2 py-1 rounded border border-red-800 text-red-300 hover:text-white"
                            >
                              {labels.createDeleteButton}
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {(lesson.tags ?? []).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">{labels.createNameLabel}</label>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="My Lesson"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-2">{labels.createDescriptionLabel}</label>
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                    placeholder="Short description"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-slate-400 mb-2">{labels.createTagsLabel}</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  placeholder="C++, DSP"
                />
              </div>

              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm text-slate-400">{labels.createContentLabel}</label>
                <button
                  onClick={() => setDraftFiles((prev) => [...prev, createEmptyDraftFile()])}
                  className="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-300 hover:text-white"
                >
                  {labels.createAddFileButton}
                </button>
              </div>

              <div className="space-y-6">
                {draftFiles.map((file, fileIndex) => {
                  const lines = file.content.split('\n');
                  return (
                    <div key={`draft-${fileIndex}`} className="border border-slate-800 rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                        <div className="flex-1">
                          <label className="block text-xs text-slate-400 mb-1">{labels.createFileNameLabel}</label>
                          <input
                            value={file.key}
                            onChange={(e) => updateDraftFileKey(fileIndex, e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                            placeholder="typing.cpp"
                          />
                        </div>
                        <div className="w-full md:w-48">
                          <label className="block text-xs text-slate-400 mb-1">{labels.createFileLanguageLabel}</label>
                          <select
                            value={file.language}
                            onChange={(e) => updateDraftFileLanguage(fileIndex, e.target.value as ProgrammingLanguage)}
                            className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                          >
                            <option value="c_cpp">C/C++</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="csharp">C#</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                          </select>
                        </div>
                        {draftFiles.length > 1 && (
                          <button
                            onClick={() => setDraftFiles((prev) => prev.filter((_, idx) => idx !== fileIndex))}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white"
                          >
                            {labels.createRemoveFileButton}
                          </button>
                        )}
                      </div>

                      <textarea
                        value={file.content}
                        onChange={(e) => updateDraftFileContent(fileIndex, e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-sm"
                        placeholder="Paste your code or text here..."
                      />

                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm text-slate-400">{labels.createLineTypeLabel}</label>
                          <span className="text-xs text-slate-500">{labels.createHint}</span>
                        </div>
                        <div className="max-h-[40vh] overflow-y-auto border border-slate-800 rounded-lg">
                          {lines.map((line, lineIdx) => (
                            <div key={`${fileIndex}-${lineIdx}`} className="flex items-start gap-3 px-3 py-2 border-b border-slate-800/60">
                              <div className="w-10 text-right text-xs text-slate-500 pt-1">{lineIdx + 1}</div>
                              <select
                                value={file.lineTypes[lineIdx] ?? 'type'}
                                onChange={(e) => updateLineType(fileIndex, lineIdx, e.target.value as SegmentType)}
                                className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1"
                              >
                                <option value="type">type</option>
                                <option value="auto">auto</option>
                              </select>
                              <div className="flex-1 font-mono text-xs md:text-sm text-slate-300 whitespace-pre-wrap">
                                {line === '' ? ' ' : line}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {formError && (
                <div className="text-sm text-red-300 mt-4">{formError}</div>
              )}

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleAddLesson}
                  className="px-6 py-3 bg-emerald-500 text-slate-900 font-bold rounded-full hover:bg-emerald-400 transition-colors"
                >
                  {editingLessonId ? labels.createSaveButton : labels.createAddButton}
                </button>
                {editingLessonId && (
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-slate-800 text-slate-200 font-semibold rounded-full hover:bg-slate-700 transition-colors"
                  >
                    {labels.createCancelEdit}
                  </button>
                )}
                <button
                  onClick={goHome}
                  className="px-6 py-3 bg-slate-800 text-slate-200 font-semibold rounded-full hover:bg-slate-700 transition-colors"
                >
                  {labels.createBack}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full p-4 md:p-6 gap-4 h-[calc(100vh-64px)]">
            {/* File Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(activeLesson?.fileOrder ?? []).map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setActiveFile(file);
                    setStats(null); // Reset stats on file change
                  }}
                  className={`px-4 py-2 rounded-t-lg font-mono text-sm transition-colors border-b-2 ${activeFile === file
                    ? 'bg-slate-800 text-blue-400 border-blue-500'
                    : 'bg-slate-900/50 text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {file}
                </button>
              ))}
            </div>

            {/* Typing Container */}
            <div className="flex-grow relative bg-slate-900 rounded-b-lg rounded-tr-lg border border-slate-800 overflow-hidden shadow-2xl">
              {stats ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-40 backdrop-blur-sm">
                  <div className="text-4xl mb-2">🎉</div>
                  <h2 className="text-3xl font-bold text-white mb-4">{labels.codeComplete}</h2>
                  <div className="grid grid-cols-3 gap-8 text-center mb-8">
                    <div>
                      <div className="text-4xl font-mono text-green-400">{stats.wpm}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{labels.wpm}</div>
                    </div>
                    <div>
                      <div className="text-4xl font-mono text-blue-400">{stats.accuracy}%</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{labels.accuracy}</div>
                    </div>
                    <div>
                      <div className="text-4xl font-mono text-red-400">{stats.mistakes}</div>
                      <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{labels.typos}</div>
                    </div>
                  </div>
                  <button
                    onClick={goBackToMenu}
                    className="px-6 py-3 bg-white text-slate-900 font-bold rounded-full hover:bg-blue-50 transition-colors"
                  >
                    {labels.tryAgain}
                  </button>
                </div>
              ) : null}

              <TypingArea
                segments={getActiveSegments()}
                onComplete={handleLessonComplete}
                isActive={!stats}
                language={activeFileLanguage}
              />
            </div>

          </div>
        )}
      </main>

      <footer className="py-4 text-center text-slate-600 text-xs">
        <p>{labels.footer}</p>
      </footer>
    </div>
  );
};

export default App;