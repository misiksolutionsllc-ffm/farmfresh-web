'use client';
import { useState } from 'react';
import { Brain, Send, Key } from 'lucide-react';
export function AIAgent() {
  const [key, setKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const ask = async () => {
    if (!key || !prompt) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt, apiKey: key }) });
      const data = await res.json();
      setResponse(data.response || data.error || 'No response');
    } catch(e:any) { setResponse('Error: ' + e.message); }
    setLoading(false);
  };
  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-3 mb-4"><Brain className="w-6 h-6 text-violet-400" /><h2 className="text-lg font-bold text-white">AI Agent (Claude)</h2></div>
      <div className="flex items-center gap-2"><Key className="w-4 h-4 text-slate-500" /><input value={key} onChange={e=>setKey(e.target.value)} placeholder="Anthropic API Key" type="password" className="flex-1 px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500/30" /></div>
      <div className="flex gap-2">
        <input value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="Ask about platform metrics, strategy..." className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white focus:outline-none focus:border-violet-500/30" />
        <button onClick={ask} disabled={loading||!key||!prompt} className="px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold disabled:opacity-30 hover:bg-violet-500 transition-all"><Send className="w-4 h-4" /></button>
      </div>
      {response && <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5"><pre className="text-sm text-slate-300 whitespace-pre-wrap">{response}</pre></div>}
    </div>
  );
}
