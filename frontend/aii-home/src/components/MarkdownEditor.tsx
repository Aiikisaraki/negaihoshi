import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  mode?: 'status' | 'post';
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = '使用 Markdown 编写内容...',
  maxLength,
  mode = 'post'
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  
  // 统计有效字符（排除 markdown 控制符）
  const countEffectiveChars = (md: string) => {
    const stripped = md
      .replace(/`{1,3}[\s\S]*?`{1,3}/g, '') // 代码块与行内代码
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '') // 图片
      .replace(/\[[^\]]*\]\([^\)]*\)/g, '') // 链接
      .replace(/[*_~#>`-]/g, '') // 常见标记
      .replace(/\s+/g, ''); // 空白
    return stripped.length;
  };
  
  const effectiveChars = countEffectiveChars(value);
  
  // 检查是否超过字符限制
  const isOverLimit = maxLength && effectiveChars > maxLength;
  
  return (
    <div className="border border-white/40 rounded-2xl bg-white/30 backdrop-blur-xl overflow-hidden">
      <div className="flex border-b border-white/40">
        <button
          className={`flex-1 py-3 text-center ${!preview ? 'bg-blue-500 text-white' : 'text-blue-800'}`}
          onClick={() => setPreview(false)}
        >
          编辑
        </button>
        <button
          className={`flex-1 py-3 text-center ${preview ? 'bg-blue-500 text-white' : 'text-blue-800'}`}
          onClick={() => setPreview(true)}
        >
          预览
        </button>
      </div>
      
      <div className="p-4">
        {preview ? (
          <div className="prose prose-blue max-w-none min-h-[200px] bg-white/20 p-4 rounded-xl">
            <ReactMarkdown>{value || placeholder}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[200px] p-4 rounded-xl bg-white/20 border border-white/40 
                     text-blue-800 placeholder-blue-500/60 focus:outline-none focus:ring-2 
                     focus:ring-purple-500/30 resize-none"
          />
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-white/40 bg-white/10 text-sm text-blue-700 flex justify-between">
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