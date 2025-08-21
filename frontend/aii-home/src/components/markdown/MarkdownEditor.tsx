import { useCallback, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  mode?: 'status' | 'post';
  editorMinHeight?: number; // px
  dense?: boolean; // 紧凑布局：减少内边距与间距
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = '使用 Markdown 编写内容...',
  maxLength,
  mode = 'post',
  editorMinHeight = 360,
  dense = false,
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 统计有效字符（排除 markdown 控制符）
  const countEffectiveChars = useCallback((md: string) => {
    const stripped = md
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // 代码块与行内代码
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '') // 图片
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '') // 链接
      .replace(/[*_~#>`-]/g, '') // 常见标记
      .replace(/\s+/g, ''); // 空白
    return stripped.length;
  }, []);

  const effectiveChars = useMemo(() => countEffectiveChars(value), [countEffectiveChars, value]);

  // 基础编辑辅助函数
  const updateValue = (next: string) => {
    onChange(next);
  };

  const getSelection = () => {
    const ta = textareaRef.current;
    if (!ta) return { start: 0, end: 0, selected: '' };
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const selected = value.substring(start, end);
    return { start, end, selected };
  };

  const setSelection = (start: number, end: number) => {
    const ta = textareaRef.current;
    if (!ta) return;
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(start, end);
    });
  };

  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    const { start, end, selected } = getSelection();
    const before = value.substring(0, start);
    const after = value.substring(end);
    const wrapped = `${prefix}${selected || '文本'}${suffix}`;
    const next = `${before}${wrapped}${after}`;
    updateValue(next);
    const selStart = before.length + prefix.length;
    const selEnd = selStart + (selected ? selected.length : 2);
    setSelection(selStart, selEnd);
  };

  const insertBlock = (text: string) => {
    const { start, end } = getSelection();
    const before = value.substring(0, start);
    const after = value.substring(end);
    // 在块级前后插入换行，保持良好排版
    const needsLeadingLF = before && !before.endsWith('\n') ? '\n' : '';
    const needsTrailingLF = after && !after.startsWith('\n') ? '\n' : '';
    const next = `${before}${needsLeadingLF}${text}${needsTrailingLF}${after}`;
    const cursor = (before + needsLeadingLF + text).length;
    updateValue(next);
    setSelection(cursor, cursor);
  };

  const togglePrefixForLines = (prefix: string | ((idx: number) => string)) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const { start, end } = getSelection();
    const before = value.substring(0, start);
    const target = value.substring(start, end);
    const after = value.substring(end);

    const lines = target.split(/\n/);
    const nextLines = lines.map((line, idx) => {
      const p = typeof prefix === 'function' ? prefix(idx) : prefix;
      if (line.startsWith(p)) {
        return line.substring(p.length);
      }
      return `${p}${line || '项'}`;
    });

    const replaced = nextLines.join('\n');
    const next = before + replaced + after;
    updateValue(next);
    // 选区保持覆盖替换后的文本
    setSelection(before.length, (before + replaced).length);
  };

  // 工具栏动作
  const onBold = () => wrapSelection('**');
  const onItalic = () => wrapSelection('*');
  const onStrike = () => wrapSelection('~~');
  const onInlineCode = () => wrapSelection('`');
  const onH1 = () => insertBlock('# 标题');
  const onH2 = () => insertBlock('## 标题');
  const onH3 = () => insertBlock('### 标题');
  const onQuote = () => togglePrefixForLines('> ');
  const onUL = () => togglePrefixForLines('- ');
  const onOL = () => togglePrefixForLines((idx) => `${idx + 1}. `);
  const onHR = () => insertBlock('---');
  const onTask = () => togglePrefixForLines('- [ ] ');
  const onCodeBlock = () => insertBlock('```\n代码\n```');
  const onLink = () => wrapSelection('[', '](https://)');
  const onImage = () => wrapSelection('![', '](https://)');

  // 快捷键支持（编辑态）
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (preview) return;
    const isMac = navigator.platform.toLowerCase().includes('mac');
    const mod = isMac ? e.metaKey : e.ctrlKey;

    if (mod) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          onBold();
          return;
        case 'i':
          e.preventDefault();
          onItalic();
          return;
        case 'k':
          e.preventDefault();
          onLink();
          return;
        case 'e': // Ctrl/Cmd+E 行内代码
          e.preventDefault();
          onInlineCode();
          return;
        case 'l': // 列表（无序）
          e.preventDefault();
          onUL();
          return;
      }
    }

    if (mod && e.shiftKey) {
      switch (e.key.toLowerCase()) {
        case 'c': // 代码块
          e.preventDefault();
          onCodeBlock();
          return;
        case 'o': // 有序列表
          e.preventDefault();
          onOL();
          return;
        case 's': // 删除线
          e.preventDefault();
          onStrike();
          return;
      }
    }
  };

  const isOverLimit = maxLength && effectiveChars > maxLength;

  const ToolbarButton = ({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`px-2 ${dense ? 'py-0.5' : 'py-1'} rounded-lg text-blue-800 hover:bg-blue-50 border border-blue-100`}
    >
      {children}
    </button>
  );

  const minHClass = editorMinHeight >= 480 ? 'min-h-[480px]' : 'min-h-[360px]';

  return (
    <div className={`border border-blue-100 rounded-2xl bg-white shadow-xl overflow-hidden`}>
      {/* 顶部标签：编辑 / 预览 */}
      <div className="flex border-b border-blue-100 bg-gray-50/60">
        <button
          type="button"
          className={`flex-1 ${dense ? 'py-2' : 'py-3'} text-center ${!preview ? 'bg-blue-500 text-white' : 'text-blue-800 hover:bg-white/40'}`}
          onClick={() => setPreview(false)}
        >
          编辑
        </button>
        <button
          type="button"
          className={`flex-1 ${dense ? 'py-2' : 'py-3'} text-center ${preview ? 'bg-blue-500 text-white' : 'text-blue-800 hover:bg-white/40'}`}
          onClick={() => setPreview(true)}
        >
          预览
        </button>
      </div>

      {preview ? (
        <div className={`${dense ? 'p-3' : 'p-4'}`}>
          <div className={`prose prose-blue max-w-none bg-white border border-blue-100 p-4 rounded-xl ${minHClass}`}>
            <ReactMarkdown>{value || placeholder}</ReactMarkdown>
          </div>
        </div>
      ) : (
        <>
          {/* 工具栏（仅编辑模式显示） */}
          <div className={`flex flex-wrap items-center gap-2 ${dense ? 'p-2' : 'p-3'} border-b border-blue-100 bg-gray-50`}>
            <ToolbarButton title="加粗 (Ctrl/Cmd+B)" onClick={onBold}>
              <strong>B</strong>
            </ToolbarButton>
            <ToolbarButton title="斜体 (Ctrl/Cmd+I)" onClick={onItalic}>
              <em>I</em>
            </ToolbarButton>
            <ToolbarButton title="删除线 (Ctrl/Cmd+Shift+S)" onClick={onStrike}>
              <span className="line-through">S</span>
            </ToolbarButton>
            <span className="mx-1 opacity-50">|</span>
            <ToolbarButton title="H1" onClick={onH1}>H1</ToolbarButton>
            <ToolbarButton title="H2" onClick={onH2}>H2</ToolbarButton>
            <ToolbarButton title="H3" onClick={onH3}>H3</ToolbarButton>
            <span className="mx-1 opacity-50">|</span>
            <ToolbarButton title="引用" onClick={onQuote}>&gt;</ToolbarButton>
            <ToolbarButton title="无序列表 (Ctrl/Cmd+L)" onClick={onUL}>• List</ToolbarButton>
            <ToolbarButton title="有序列表 (Ctrl/Cmd+Shift+O)" onClick={onOL}>1. List</ToolbarButton>
            <ToolbarButton title="任务列表" onClick={onTask}>[ ]</ToolbarButton>
            <span className="mx-1 opacity-50">|</span>
            <ToolbarButton title="行内代码 (Ctrl/Cmd+E)" onClick={onInlineCode}>`code`</ToolbarButton>
            <ToolbarButton title="代码块 (Ctrl/Cmd+Shift+C)" onClick={onCodeBlock}>```</ToolbarButton>
            <span className="mx-1 opacity-50">|</span>
            <ToolbarButton title="链接 (Ctrl/Cmd+K)" onClick={onLink}>🔗</ToolbarButton>
            <ToolbarButton title="图片" onClick={onImage}>🖼️</ToolbarButton>
            <ToolbarButton title="分割线" onClick={onHR}>—</ToolbarButton>
          </div>

          <div className={`${dense ? 'p-3' : 'p-4'}`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`w-full p-4 rounded-xl bg-white border border-blue-100 text-blue-800 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 resize-none ${minHClass}`}
            />
          </div>
        </>
      )}
      
      <div className={`border-t border-blue-100 bg-gray-50 ${dense ? 'px-3 py-2' : 'px-4 py-3'} text-sm text-blue-700 flex justify-between`}>
        <div>
          {mode === 'status' && (
            <span className={isOverLimit ? 'text-red-500' : ''}>
              有效字符: {effectiveChars}{maxLength && `/${maxLength}`}
            </span>
          )}
        </div>
        <div>
          <span>Markdown 格式</span>
        </div>
      </div>
    </div>
  );
}


