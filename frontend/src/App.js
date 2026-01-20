import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file || !jd) return alert("Please upload a file and paste a JD");
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd', jd);

    try {
      const response = await axios.post('http://127.0.0.1:8000/analyze', formData);
      setResult(response.data);
    } catch (err) {
      alert("Backend error. Make sure your Python server is running!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen animated-bg text-white p-8 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
          Resume Matcher
        </h1>
        <p className="text-slate-400">Optimize your career path with AI</p>
      </header> 
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="glass p-6 rounded-2xl shadow-xl">
          <label className="block text-sm font-medium mb-2 text-cyan-400">1. Upload Resume (PDF)</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} 
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 mb-6" />

          <label className="block text-sm font-medium mb-2 text-cyan-400">2. Job Description</label>
          <textarea className="w-full h-64 p-4 bg-[#0f172a] border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none text-sm transition-all"
            placeholder="Paste here..." value={jd} onChange={(e) => setJd(e.target.value)} />

          <button onClick={handleAnalyze} disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-blue-600 py-3 rounded-xl font-bold hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-500/30 active:scale-95 transition-all duration-300">
            {!loading ? 'Processing...' : 'Analyze Match'}
          </button>
        </div>

        {/* Right Side: Results (Only shows after analysis) */}
        <div className="flex flex-col gap-6 fade-in">
          {!result ? (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-700 rounded-2xl text-slate-500">
              Results will appear here
            </div>
          ) : (
            <>
              <div className="bg-[#1e293b] p-6 rounded-2xl border-l-4 border-cyan-500 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Match Score</h2>
                  <span className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]">
  {result.ats_score}%
</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full transition-all duration-1000" style={{ width: `${result.ats_score}%` }}></div>
                </div>
              </div>

              <div className="bg-[#1e293b] p-6 rounded-2xl shadow-xl border border-slate-700">
                <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">✨ AI Suggestions</h3>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">{s}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;