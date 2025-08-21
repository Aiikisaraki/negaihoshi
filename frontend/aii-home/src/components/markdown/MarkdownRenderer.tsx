import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-blue max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-blue-800 mt-6 mb-4" {...props} />,
          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-blue-700 mt-5 mb-3" {...props} />,
          h3: ({node, ...props}) => <h3 className="text-lg font-bold text-blue-600 mt-4 mb-2" {...props} />,
          p: ({node, ...props}) => <p className="text-blue-800 mb-3 leading-relaxed" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc list-inside text-blue-800 mb-3 ml-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal list-inside text-blue-800 mb-3 ml-4" {...props} />,
          li: ({node, ...props}) => <li className="mb-1 list-item" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-blue-600 my-4" {...props} />,
          code: ({node, ...props}) => <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono" {...props} />,
          pre: ({node, ...props}) => <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
          a: ({node, ...props}) => <a className="text-blue-600 hover:text-blue-800 underline" {...props} />,
          strong: ({node, ...props}) => <strong className="font-bold text-blue-900" {...props} />,
          em: ({node, ...props}) => <em className="italic" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}


