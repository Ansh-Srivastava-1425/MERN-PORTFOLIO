import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import API from '../api/axios';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/posts/${slug}`)
      .then(res => { setPost(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!post) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
      <p className="text-xl mb-4">Post not found</p>
      <Link to="/" className="text-indigo-400 hover:text-indigo-300">← Back to Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200">
      <div className="max-w-3xl mx-auto px-6 py-20">
        
        {/* Back */}
        <Link to="/#blog"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-12 transition-colors">
          ← Back to Articles
        </Link>

        {/* Cover Image */}
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title}
            className="w-full h-64 object-cover rounded-2xl mb-10 border border-white/5" />
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags.map((tag, i) => (
            <span key={i}
              className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-slate-500 text-sm mb-12 pb-8 border-b border-white/5">
          <span>{post.readTime}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}</span>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-white
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-blockquote:border-indigo-500 prose-blockquote:text-slate-400
          prose-code:text-indigo-300 prose-code:bg-white/5 prose-code:px-1 prose-code:rounded">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter style={oneDark} language={match[1]}
                    PreTag="div" className="rounded-xl" {...props}>
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>{children}</code>
                );
              }
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
}
