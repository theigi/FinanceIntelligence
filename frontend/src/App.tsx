import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// UI Components for a cleaner look
const Card = ({ children, style }: any) => (
  <div style={{ background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '24px', ...style }}>
    {children}
  </div>
);

function App() {
  const [task, setTask] = useState('Analyze performance of MyAICo.AI');
  const [competitors, setCompetitors] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [finalReport, setFinalReport] = useState('');
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!reportRef.current) return;

    const element = reportRef.current;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      width: 800,
      windowWidth: 800,
      onclone: (clonedDoc) => {
        const clonedEl =
          clonedDoc.getElementById(element.id) ||
          clonedDoc.querySelector(".prose");

        if (clonedEl) {
          const el = clonedEl as HTMLElement;
          el.style.width = "800px";
          el.style.padding = "40px";
          el.style.fontSize = "14px";
          el.style.background = "white";
        }
      },
    });

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;
    const imgWidth = pdfWidth - margin * 2;

    const pageHeightPx =
      (pdfHeight - margin * 2) * (canvas.width / imgWidth);

    let yOffset = 0;
    let page = 0;

    while (yOffset < canvas.height) {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(
        pageHeightPx,
        canvas.height - yOffset
      );

      const ctx = pageCanvas.getContext("2d")!;
      ctx.drawImage(
        canvas,
        0,
        yOffset,
        canvas.width,
        pageCanvas.height,
        0,
        0,
        canvas.width,
        pageCanvas.height
      );

      const pageImg = pageCanvas.toDataURL("image/png");
      const imgHeight =
        (pageCanvas.height * imgWidth) / canvas.width;

      if (page > 0) pdf.addPage();
      pdf.addImage(pageImg, "PNG", margin, margin, imgWidth, imgHeight);

      yOffset += pageHeightPx;
      page++;
    }

    pdf.save(`Financial_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!file) return alert("Please upload a CSV");
      setLoading(true); setLogs([]); setFinalReport('');

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      const formData = new FormData();
      formData.append('task', task);
      formData.append('competitors', competitors);
      formData.append('max_revisions', '2');
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE_URL}/analyze`, { 
          method: 'POST', 
          body: formData 
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buffer = ""; // New: Buffer to handle split chunks

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          // Append new chunk to the existing buffer
          buffer += decoder.decode(value, { stream: true });
          
          // Split by the SSE standard double-newline
          const parts = buffer.split('\n\n');
          
          // Keep the last partial part in the buffer
          buffer = parts.pop() || "";

          for (const part of parts) {
            const line = part.trim();
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.replace('data: ', '');
                const data = JSON.parse(jsonStr);
                const nodeName = Object.keys(data)[0];
                const nodeContent = data[nodeName];
                
                setLogs(prev => [...prev, nodeName.replace(/_/g, ' ')]);
                if (nodeContent.report) setFinalReport(nodeContent.report);
              } catch (err) {
                console.error("JSON split error - waiting for more data:", err);
                // If JSON is incomplete, add it back to buffer to try again later
                buffer = part + '\n\n' + buffer;
              }
            }
          }
        }
      } catch (err) { 
        console.error("Fetch error:", err); 
      } finally { 
        setLoading(false); 
      }
    };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: '"Inter", system-ui, sans-serif', color: '#1e293b' }}>
      {/* Navigation Bar */}
      <nav style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '8px', fontWeight: 'bold' }}>FI</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>FinanceIntelligence</h1>
        </div>
        {finalReport && (
          <button onClick={downloadPDF} style={{ padding: '10px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}>
            Export PDF
          </button>
        )}
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '32px', padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar Controls */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Configuration</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Objective</label>
                <input style={inputStyle} value={task} onChange={e => setTask(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Competitor Analysis</label>
                <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }} placeholder="Microsoft, Nvidia, Google" value={competitors} onChange={e => setCompetitors(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '6px' }}>Internal Financials (CSV)</label>
                <div style={{ border: '2px dashed #e2e8f0', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ fontSize: '0.8rem' }} />
                </div>
              </div>
              <button type="submit" disabled={loading} style={{ ...buttonStyle, background: loading ? '#94a3b8' : '#3b82f6' }}>
                {loading ? 'Processing...' : 'Generate Analysis'}
              </button>
            </form>
          </Card>

          <Card style={{ background: '#0f172a', color: '#94a3b8' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '0.9rem', color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Execution Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {logs.length === 0 && <span style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Idle</span>}
              {logs.map((log, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#38bdf8' }}>
                  <span>●</span> <span>{log}</span>
                </div>
              ))}
              {loading && ( <div style= { {display: 'flex', alignItems: 'center', gap: '10px', color: '#fbbf24'}}> <span style= { {width: '12px', height: '12px', backgroundColor: '#fbbf24', borderRadius: '50%', animation: 'pulse 1.5s infinite ease-in-out'}}></span> Running next node... </div>)}
            </div>
          </Card>
        </aside>

        {/* Main Content Area */}
        <main>
          {finalReport ? (
            <Card style={{ padding: '60px' }}>
              <div ref={reportRef} className="prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{finalReport}</ReactMarkdown>
              </div>
            </Card>
          ) : (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '16px' }}>
              <h2 style={{ fontWeight: 600 }}>Ready for Analysis</h2>
              <p style={{ textAlign: 'center',padding:'0 25px'}}>Upload your data and configure the task to generate the report.</p>
            </div>
          )}
        </main>
      </div>

<style>{`
  .prose {
    font-size: 14px !important;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: white;
    width: 100%;
    text-align: left;
    word-wrap: break-word; /* <--- Forces wrapping to prevent right-side cut-off */
  }

  /* Fixes Bullet Alignment & Overlapping */
  .prose ul, .prose ol {
    padding-left: 2.5rem !important; /* <--- Gives bullet markers enough room */
    margin-left: 0 !important;
    list-style-position: outside !important; /* <--- Prevents dots from overlapping text */
  }

  .prose li {
    margin-bottom: 0.5rem;
    padding-left: 0.5rem;
    page-break-inside: avoid; /* <--- Keeps bullets attached to their text */
    break-inside: avoid;
  }

  /* Header Spacing */
  .prose h1, .prose h2 {
    page-break-after: avoid;
    break-after: avoid;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  @keyframes pulse { 
    0% { opacity: 1; } 
    50% { opacity: 0.3; } /* Lower opacity for a more noticeable blink */
    100% { opacity: 1; } 
  }  
`}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '0.95rem',
  outline: 'none',
  transition: 'border 0.2s',
  boxSizing: 'border-box' as 'border-box'
};

const buttonStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  color: 'white',
  fontWeight: '700',
  fontSize: '1rem',
  cursor: 'pointer',
  marginTop: '10px'
};

export default App;