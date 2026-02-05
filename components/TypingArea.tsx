import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TypingStats, CodeSegment, ProgrammingLanguage } from '../types';

interface TypingAreaProps {
    segments: CodeSegment[];
    onComplete: (stats: TypingStats) => void;
    isActive: boolean;
    language: ProgrammingLanguage;
}

type HighlightPattern = { regex: RegExp; cls: string };

const getHighlightPatterns = (language: ProgrammingLanguage): HighlightPattern[] => {
    const common = {
        numbers: { regex: /\b\d+(\.\d+)?([eE][+-]?\d+)?\b/g, cls: 'text-orange-300' },
        strings: { regex: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, cls: 'text-green-400' },
    };

    switch (language) {
        case 'python':
            return [
                { regex: /\b(def|class|return|if|elif|else|for|while|break|continue|pass|import|from|as|with|try|except|finally|lambda|yield|True|False|None|and|or|not|in|is|global|nonlocal|assert)\b/g, cls: 'text-purple-400' },
                { regex: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, cls: 'text-blue-300' },
                common.numbers,
                common.strings,
                { regex: /#.*$/gm, cls: 'text-slate-500' },
            ];
        case 'java':
            return [
                { regex: /\b(class|public|private|protected|static|final|void|int|long|float|double|boolean|char|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|package|import|this|super|null|true|false)\b/g, cls: 'text-purple-400' },
                { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, cls: 'text-yellow-300' },
                { regex: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, cls: 'text-blue-300' },
                common.numbers,
                common.strings,
                { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'text-slate-500' },
            ];
        case 'csharp':
            return [
                { regex: /\b(class|public|private|protected|internal|static|readonly|void|int|long|float|double|decimal|bool|char|string|new|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|using|namespace|null|true|false)\b/g, cls: 'text-purple-400' },
                { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, cls: 'text-yellow-300' },
                { regex: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g, cls: 'text-blue-300' },
                common.numbers,
                common.strings,
                { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'text-slate-500' },
            ];
        case 'javascript':
            return [
                { regex: /\b(const|let|var|function|class|return|if|else|for|while|do|switch|case|break|continue|import|from|export|default|new|this|super|null|true|false|async|await|try|catch|finally|throw)\b/g, cls: 'text-purple-400' },
                { regex: /\b[A-Za-z_$][A-Za-z0-9_$]*(?=\s*\()/g, cls: 'text-blue-300' },
                common.numbers,
                common.strings,
                { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'text-slate-500' },
            ];
        case 'typescript':
            return [
                { regex: /\b(const|let|var|function|class|interface|type|implements|extends|public|private|protected|readonly|return|if|else|for|while|do|switch|case|break|continue|import|from|export|default|new|this|super|null|true|false|async|await|try|catch|finally|throw)\b/g, cls: 'text-purple-400' },
                { regex: /\b[A-Z][a-zA-Z0-9_]*\b/g, cls: 'text-yellow-300' },
                { regex: /\b[A-Za-z_$][A-Za-z0-9_$]*(?=\s*\()/g, cls: 'text-blue-300' },
                common.numbers,
                common.strings,
                { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'text-slate-500' },
            ];
        case 'c_cpp':
        default:
            return [
                { regex: /\b(class|public|private|protected|void|int|float|double|bool|char|auto|const|override|virtual|return|if|else|for|while|do|switch|case|break|continue|namespace|using|struct|template|typename|new|delete|this|sizeof|static|friend|true|false|nullptr|enum|unsigned|long)\b/g, cls: 'text-purple-400' },
                { regex: /\b(juce::[a-zA-Z0-9_:]+|[A-Z][a-zA-Z0-9_]*)\b/g, cls: 'text-yellow-300' },
                { regex: /\b\w+(?=\s*\()/g, cls: 'text-blue-300' },
                { regex: /\b\d+(\.\d+)?f?\b/g, cls: 'text-orange-300' },
                { regex: /^\s*#\w+/gm, cls: 'text-cyan-400' },
                { regex: /"(?:[^"\\]|\\.)*"/g, cls: 'text-green-400' },
                { regex: /\/\/.*|\/\*[\s\S]*?\*\//g, cls: 'text-slate-500' },
            ];
    }
};

// Simple syntax highlighter per language
const highlightCode = (code: string, language: ProgrammingLanguage): string[] => {
    const classes = new Array(code.length).fill('text-slate-300');

    const fill = (match: RegExpExecArray, className: string) => {
        for (let i = match.index; i < match.index + match[0].length; i++) {
            classes[i] = className;
        }
    };

    const patterns = getHighlightPatterns(language);

    patterns.forEach(({ regex, cls }) => {
        // Reset lastIndex for global regexes
        regex.lastIndex = 0;
        let match;
        while ((match = regex.exec(code)) !== null) {
            fill(match, cls);
        }
    });

    return classes;
};

const TypingArea: React.FC<TypingAreaProps> = ({ segments, onComplete, isActive, language }) => {
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reconstruct full code
    const fullCode = useMemo(() => segments.map(s => s.text).join(''), [segments]);
    const interactiveLength = useMemo(() => segments.filter(s => s.type === 'type').reduce((acc, s) => acc + s.text.length, 0), [segments]);

    // Compute syntax highlighting
    const syntaxClasses = useMemo(() => highlightCode(fullCode, language), [fullCode, language]);

    // Reset state when code changes
    useEffect(() => {
        setUserInput('');
        setStartTime(null);
        setMistakes(0);
    }, [segments]);

    // Keep focus
    useEffect(() => {
        const handleFocus = () => {
            if (isActive && inputRef.current) inputRef.current.focus();
        };
        if (isActive && inputRef.current) inputRef.current.focus();
        window.addEventListener('click', handleFocus);
        return () => window.removeEventListener('click', handleFocus);
    }, [isActive]);

    const calculateStats = useCallback((): TypingStats => {
        const endTime = Date.now();
        const start = startTime || endTime;
        const timeInMinutes = (endTime - start) / 60000;

        const wpm = timeInMinutes > 0 ? (interactiveLength / 5) / timeInMinutes : 0;
        const accuracy = interactiveLength > 0
            ? Math.max(0, 100 - ((mistakes / interactiveLength) * 100))
            : 100;

        return {
            wpm: Math.round(wpm),
            accuracy: Math.round(accuracy),
            progress: 100,
            mistakes,
            startTime,
            endTime
        };
    }, [interactiveLength, mistakes, startTime]);

    // Auto-fill auto segments
    useEffect(() => {
        if (userInput.length === fullCode.length && fullCode.length > 0 && !isActive) return;

        let currentIndex = userInput.length;
        let segmentOffset = 0;

        for (const segment of segments) {
            if (currentIndex < segmentOffset + segment.text.length) {
                if (segment.type === 'auto') {
                    const remaining = (segmentOffset + segment.text.length) - currentIndex;
                    if (remaining > 0) {
                        const nextText = segment.text.substring(segment.text.length - remaining);
                        setUserInput(prev => prev + nextText);
                    }
                }
                break;
            }
            segmentOffset += segment.text.length;
        }

        if (userInput.length === fullCode.length && fullCode.length > 0) {
            onComplete(calculateStats());
        }

    }, [userInput, segments, fullCode, onComplete, calculateStats, isActive]);

    const processInput = (newValue: string) => {
        if (!startTime) setStartTime(Date.now());

        // Backspace protection for auto segments
        if (newValue.length < userInput.length) {
            let segmentOffset = 0;
            let isSafeToDelete = true;
            for (const segment of segments) {
                if (newValue.length < segmentOffset + segment.text.length) {
                    if (segment.type === 'auto') isSafeToDelete = false;
                    break;
                }
                segmentOffset += segment.text.length;
            }
            if (!isSafeToDelete) return;
        }

        // Mistake calculation
        if (newValue.length > userInput.length) {
            let newMistakes = 0;
            for (let i = userInput.length; i < newValue.length; i++) {
                if (i < fullCode.length) {
                    if (newValue[i] !== fullCode[i]) newMistakes++;
                }
            }
            if (newMistakes > 0) setMistakes(prev => prev + newMistakes);
        }

        setUserInput(newValue);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        processInput(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            const currentIndex = userInput.length;
            const lineStart = fullCode.lastIndexOf('\n', currentIndex - 1) + 1;
            const isAtLineStart = currentIndex === lineStart;

            if (isAtLineStart) {
                let nextIndex = currentIndex;
                while (nextIndex < fullCode.length && fullCode[nextIndex] !== '\n' && (fullCode[nextIndex] === ' ' || fullCode[nextIndex] === '\t')) {
                    nextIndex++;
                }
                if (nextIndex > currentIndex) {
                    e.preventDefault();
                    const textToAppend = fullCode.substring(currentIndex, nextIndex);
                    processInput(userInput + textToAppend);
                    return;
                }
            }

            e.preventDefault();
            const spaces = '    ';
            const newValue = userInput + spaces;
            if (newValue.length <= fullCode.length + spaces.length) {
                const clampedValue = newValue.length > fullCode.length ? newValue.slice(0, fullCode.length) : newValue;
                processInput(clampedValue);
            }
        } else if (e.key === 'Enter') {
            const currentIndex = userInput.length;
            // Check if the rest of the line (until \n) is just whitespace
            let distanceToNewline = 0;
            let canSkip = true;

            for (let i = currentIndex; i < fullCode.length; i++) {
                if (fullCode[i] === '\n') {
                    break;
                }
                // If we hit a non-whitespace character before newline, we can't skip
                if (fullCode[i] !== ' ' && fullCode[i] !== '\t') {
                    canSkip = false;
                    break;
                }
                distanceToNewline++;
            }

            // If valid skip scenario and we are not out of bounds
            if (canSkip && currentIndex + distanceToNewline < fullCode.length) {
                e.preventDefault();
                // Auto-fill the whitespace AND the newline character
                const textToAppend = fullCode.substring(currentIndex, currentIndex + distanceToNewline + 1);
                processInput(userInput + textToAppend);
            }
        }
    };

    const renderContent = () => {
        let rendered = [];
        let currentGlobalIndex = 0;

        segments.forEach((segment, segIdx) => {
            const isBoilerplate = segment.type === 'auto';
            const segmentText = segment.text;

            const segmentChars = segmentText.split('').map((char, charIdx) => {
                const globalIndex = currentGlobalIndex + charIdx;
                const isTyped = globalIndex < userInput.length;
                const isCursor = globalIndex === userInput.length;
                const syntaxClass = syntaxClasses[globalIndex];

                let className = "";

                if (isTyped) {
                    if (userInput[globalIndex] === char) {
                        // Correctly typed: Use syntax highlighting, fully opaque
                        className = syntaxClass;
                    } else {
                        // Error: Red background
                        className = "text-red-200 bg-red-900/50";
                    }
                } else {
                    // Untyped (Future): Dimmed syntax highlighting
                    className = `${syntaxClass} opacity-40`;
                }

                // Newline handling
                if (char === '\n') {
                    return (
                        <React.Fragment key={globalIndex}>
                            <span className={`${className} ${isCursor ? 'border-l-2 border-blue-400 cursor-blink' : ''}`}>
                                {/* Zero width space to keep cursor height if needed, or just let the span height handle it */}
                                &#8203;
                            </span>
                            {'\n'}
                        </React.Fragment>
                    );
                }

                return (
                    <span
                        key={globalIndex}
                        className={`${className} ${isCursor ? 'border-b-2 border-blue-400 cursor-blink' : ''}`}
                    >
                        {char}
                    </span>
                );
            });

            rendered.push(<span key={`seg-${segIdx}`}>{segmentChars}</span>);
            currentGlobalIndex += segmentText.length;
        });

        return rendered;
    };

    return (
        <div className="relative w-full h-full flex flex-col font-mono text-base md:text-lg leading-relaxed">
            <textarea
                ref={inputRef}
                value={userInput}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="absolute opacity-0 top-0 left-0 w-full h-full cursor-default resize-none z-10 pointer-events-none"
                autoFocus
                spellCheck={false}
                autoComplete="off"
            />

            <div
                ref={containerRef}
                className="absolute inset-0 p-8 whitespace-pre-wrap break-all overflow-y-auto bg-[#0d1117] rounded-lg border border-slate-800 shadow-inner scroll-smooth"
                onClick={() => inputRef.current?.focus()}
            >
                {renderContent()}
            </div>

            <div className="absolute top-2 right-4 flex gap-4 text-xs font-sans text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full backdrop-blur-sm z-20">
                <span>{Math.round((userInput.length / Math.max(fullCode.length, 1)) * 100)}% Complete</span>
                <span>Errors: {mistakes}</span>
            </div>
        </div>
    );
};

export default TypingArea;