
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  FileUp, 
  Loader2, 
  ChevronRight, 
  Download, 
  Eye, 
  Layout, 
  CheckCircle2, 
  Globe, 
  Github, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone,
  Code2,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Zap,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { Step, ResumeData, TemplateStyle } from './types';
import { extractTextFromPdf } from './utils/pdfWorker';
import { parseResumeText, getChatResponse } from './geminiService';
import { generateHtml } from './utils/templateGenerator';

// Constants
const TEMPLATES: TemplateStyle[] = [
  { id: 'modern', name: 'Modern Professional', primaryColor: '#2563eb', secondaryColor: '#1e40af', fontFamily: 'Inter' },
  { id: 'creative', name: 'Creative Splash', primaryColor: '#db2777', secondaryColor: '#9d174d', fontFamily: 'Inter' },
  { id: 'minimal', name: 'Minimalist Slate', primaryColor: '#334155', secondaryColor: '#1e293b', fontFamily: 'Inter' },
  { id: 'emerald', name: 'Emerald Forest', primaryColor: '#059669', secondaryColor: '#064e3b', fontFamily: 'Inter' },
  { id: 'midnight', name: 'Midnight Elegance', primaryColor: '#fbbf24', secondaryColor: '#0f172a', fontFamily: 'Georgia, serif' },
  { id: 'futuristic', name: 'Cyberpunk Tech', primaryColor: '#22d3ee', secondaryColor: '#d946ef', fontFamily: 'ui-monospace, monospace' },
];

declare const JSZip: any;

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [step, setStep] = useState<Step>(Step.UPLOAD);
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>(TEMPLATES[0]);
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateStyle | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: 'Hi! I\'m your PortfoliAI assistant. Need help refining your resume or choosing a template?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const botResponse = await getChatResponse(userMsg, data || undefined);
      setChatMessages(prev => [...prev, { role: 'bot', text: botResponse || 'Sorry, I couldn\'t process that.' }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'bot', text: 'I encountered an error. Please try again.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Determine which template style to show in the live preview
  const activePreviewTemplate = hoveredTemplate || selectedTemplate;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setFile(uploadedFile);
    setError(null);
    setStep(Step.EXTRACTING);
    setIsProcessing(true);

    try {
      const text = await extractTextFromPdf(uploadedFile);
      const extractedData = await parseResumeText(text);
      setData(extractedData);
      setStep(Step.EDIT);
    } catch (err: any) {
      console.error(err);
      setError('Failed to process resume. Please try again.');
      setStep(Step.UPLOAD);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (field: keyof ResumeData, value: any) => {
    if (data) {
      setData({ ...data, [field]: value });
    }
  };

  const downloadZip = async () => {
    if (!data) return;
    
    const zip = new JSZip();
    const htmlContent = generateHtml(data, selectedTemplate);
    
    zip.file("index.html", htmlContent);
    zip.file("data.json", JSON.stringify(data, null, 2));
    zip.file("README.txt", "Portfolio generated with PortfoliAI. Simply host these files to go live!");

    const content = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${data.fullName.replace(/\s+/g, '_')}_portfolio.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const miniPreviewHtml = useMemo(() => {
    if (!data) return '';
    return generateHtml(data, activePreviewTemplate);
  }, [data, activePreviewTemplate]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">PortfoliAI</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Templates</a>
              <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900">Documentation</a>
              <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-12 gap-4">
          {[Step.UPLOAD, Step.EDIT, Step.PREVIEW].map((s, idx) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${step === s ? 'text-blue-600' : 'text-slate-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step === s ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                  {idx + 1}
                </div>
                <span className="text-sm font-semibold capitalize hidden sm:inline">{s}</span>
              </div>
              {idx < 2 && <ChevronRight className="w-4 h-4 text-slate-300" />}
            </React.Fragment>
          ))}
        </div>

        {/* Dynamic Content */}
        {step === Step.UPLOAD && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Turn your resume into a portfolio</h1>
              <p className="text-lg text-slate-600">Upload your PDF resume and our AI will extract the data to build your stunning professional website instantly.</p>
            </div>
            
            <label className="block w-full cursor-pointer group">
              <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 bg-white hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition">
                  <FileUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Drop your PDF here</h3>
                <p className="text-slate-500 mb-8">Support for single or multiple page PDF resumes</p>
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
                <span className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:bg-slate-800 transition">
                  Browse Files
                </span>
              </div>
            </label>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
                {error}
              </div>
            )}
          </div>
        )}

        {step === Step.EXTRACTING && (
          <div className="max-w-md mx-auto text-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Analyzing Your Resume...</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-500 bg-white p-3 rounded-lg border">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <span>Identifying key sections</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 bg-white p-3 rounded-lg border">
                <Code2 className="w-5 h-5 text-purple-500" />
                <span>Structuring technical skills</span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 bg-white p-3 rounded-lg border">
                <Layout className="w-5 h-5 text-green-500" />
                <span>Generating professional summary</span>
              </div>
            </div>
          </div>
        )}

        {step === Step.EDIT && data && (
          <div className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Editor Sidebar */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl p-8 border shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-slate-900">Review Information</h2>
                  <button 
                    onClick={() => setStep(Step.PREVIEW)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition active:scale-95 shadow-lg shadow-blue-500/20"
                  >
                    View Full Preview <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Basic Info */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Basic Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Full Name</label>
                        <input 
                          value={data.fullName}
                          onChange={(e) => handleDataChange('fullName', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-500 ml-1">Job Title</label>
                        <input 
                          value={data.title}
                          onChange={(e) => handleDataChange('title', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none transition" 
                        />
                      </div>
                    </div>
                  </section>

                  {/* Contact */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          value={data.contact.email}
                          onChange={(e) => setData({...data, contact: {...data.contact, email: e.target.value}})}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition" 
                          placeholder="Email"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          value={data.contact.location}
                          onChange={(e) => setData({...data, contact: {...data.contact, location: e.target.value}})}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition" 
                          placeholder="Location"
                        />
                      </div>
                      <div className="relative">
                        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          value={data.contact.github || ''}
                          onChange={(e) => setData({...data, contact: {...data.contact, github: e.target.value}})}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition" 
                          placeholder="GitHub URL"
                        />
                      </div>
                      <div className="relative">
                        <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          value={data.contact.linkedIn || ''}
                          onChange={(e) => setData({...data, contact: {...data.contact, linkedIn: e.target.value}})}
                          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition" 
                          placeholder="LinkedIn URL"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Summary */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Professional Summary</h3>
                    <textarea 
                      value={data.summary}
                      onChange={(e) => handleDataChange('summary', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition resize-none" 
                    />
                  </section>

                  {/* Skills */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.skills.map((skill, i) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 group">
                          <span className="text-sm font-medium text-slate-700">{skill}</span>
                          <button 
                            onClick={() => handleDataChange('skills', data.skills.filter((_, idx) => idx !== i))}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          const s = prompt('Add skill:');
                          if (s) handleDataChange('skills', [...data.skills, s]);
                        }}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline transition"
                      >
                        + Add Skill
                      </button>
                    </div>
                  </section>

                  {/* Experience */}
                  <section>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Experience</h3>
                    <div className="space-y-4">
                      {data.experience.map((exp, i) => (
                        <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-900">{exp.company}</h4>
                            <span className="text-xs text-slate-500 font-medium">{exp.startDate} - {exp.endDate}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2 font-medium">{exp.position}</p>
                          <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4 opacity-80">
                            {exp.highlights.map((h, hi) => <li key={hi}>{h}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl p-6 border shadow-sm sticky top-24">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Zap className={`w-5 h-5 ${hoveredTemplate ? 'text-amber-500 animate-pulse' : 'text-blue-600'}`} />
                        Live Style Preview
                    </h3>
                    <div className="rounded-2xl overflow-hidden border-2 border-slate-100 aspect-video mb-6 relative bg-slate-50 shadow-inner ring-1 ring-black/5">
                         <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 z-20"></div>
                         <div className={`absolute inset-0 flex items-center justify-center bg-slate-900/10 backdrop-blur-[0.5px] transition-opacity duration-300 z-10 pointer-events-none ${hoveredTemplate ? 'opacity-100' : 'opacity-0'}`}>
                            <span className="bg-slate-900 text-white px-3 py-1.5 rounded-full text-[10px] font-bold shadow-2xl border border-white/20 uppercase tracking-[0.2em] scale-90">Previewing Style</span>
                         </div>
                         <iframe 
                            srcDoc={miniPreviewHtml}
                            className="w-full h-full scale-[0.35] origin-top-left pointer-events-none transition-opacity duration-200"
                            style={{ width: '286%', height: '286%' }}
                            title="Mini Preview"
                         />
                    </div>
                </div>

                <div className="grid gap-3">
                  {TEMPLATES.map(template => (
                    <button
                      key={template.id}
                      onMouseEnter={() => setHoveredTemplate(template)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      onClick={() => {
                        setSelectedTemplate(template);
                        setHoveredTemplate(null);
                      }}
                      className={`relative p-4 rounded-2xl border-2 transition-all duration-300 text-left group overflow-hidden ${
                        selectedTemplate.id === template.id 
                          ? 'border-blue-600 bg-blue-50/50 shadow-[0_10px_30px_rgba(37,99,235,0.15)] ring-2 ring-blue-600/10 scale-[1.02]' 
                          : hoveredTemplate?.id === template.id
                          ? 'border-amber-400 bg-amber-50/20 shadow-lg scale-[1.01]'
                          : 'border-slate-100 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <p className={`font-bold transition-colors duration-300 ${selectedTemplate.id === template.id ? 'text-blue-900' : hoveredTemplate?.id === template.id ? 'text-amber-900' : 'text-slate-900'}`}>
                            {template.name}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <div className="w-4 h-4 rounded-full border border-black/5 shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: template.primaryColor }}></div>
                            <div className="w-4 h-4 rounded-full border border-black/5 opacity-50 shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: template.secondaryColor }}></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hoveredTemplate?.id === template.id && selectedTemplate.id !== template.id && (
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest animate-pulse">Previewing</span>
                          )}
                          {selectedTemplate.id === template.id ? (
                              <div className="bg-blue-600 p-2 rounded-full shadow-lg shadow-blue-400/30 ring-4 ring-blue-600/10 animate-in zoom-in-50 duration-300">
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                          ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-slate-100 rounded-full">
                                  <Eye className="w-4 h-4 text-slate-400" />
                              </div>
                          )}
                        </div>
                      </div>
                      <div 
                        className={`absolute bottom-0 right-0 w-1/2 h-1/2 bg-slate-100 rounded-tl-[100px] -mr-8 -mb-8 transition-transform duration-700 ease-out pointer-events-none group-hover:scale-150 ${selectedTemplate.id === template.id ? 'opacity-30' : 'opacity-10'}`}
                        style={{ background: template.primaryColor }}
                      ></div>
                    </button>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t">
                  <p className="text-[10px] text-slate-400 mb-4 text-center italic uppercase tracking-widest font-bold">Preview updates instantly on hover</p>
                  <button 
                    onClick={() => setStep(Step.PREVIEW)}
                    className="w-full bg-slate-900 text-white px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition active:scale-95 shadow-xl shadow-slate-900/20"
                  >
                    Confirm & View Full Size
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === Step.PREVIEW && data && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setStep(Step.EDIT)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-500 transition active:scale-90"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Portfolio Preview</h2>
                  <p className="text-sm text-slate-500 font-medium">Rendered with <strong className="text-blue-600 underline underline-offset-4">{selectedTemplate.name}</strong></p>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={() => setStep(Step.EDIT)}
                  className="flex-1 md:flex-none px-6 py-3 rounded-xl border-2 border-slate-100 font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95"
                >
                  Adjust Content
                </button>
                <button 
                  onClick={downloadZip}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-2xl shadow-blue-500/30 active:scale-95"
                >
                  <Download className="w-4 h-4" /> Download ZIP
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border-4 border-slate-100 overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] ring-1 ring-slate-200">
              <div className="bg-slate-50 px-6 py-4 flex items-center gap-4 border-b">
                <div className="flex gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-inner border border-red-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 shadow-inner border border-yellow-500/20"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-green-400 shadow-inner border border-green-500/20"></div>
                </div>
                <div className="flex-1 max-w-md mx-auto bg-white px-6 py-2 rounded-xl text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-200 text-center flex items-center justify-center gap-3">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  https://{data.fullName.toLowerCase().replace(/\s+/g, '-')}.portfoliai.me
                </div>
              </div>
              <div className="bg-white p-2">
                <iframe 
                    srcDoc={generateHtml(data, selectedTemplate)}
                    className="w-full h-[80vh] border-none rounded-[1.5rem]"
                    title="Portfolio Preview"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chatbot UI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="bg-white w-[350px] sm:w-[400px] h-[500px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/5">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold tracking-tight">PortfoliAI Assistant</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white border text-slate-700 shadow-sm rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border p-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-xs text-slate-400 font-medium">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                className="flex gap-2"
              >
                <input 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask for resume feedback..."
                  className="flex-1 px-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
        
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isChatOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'
          }`}
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-8 opacity-40 grayscale">
            <div className="p-1.5 bg-slate-900 rounded-md">
                <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900 uppercase">PortfoliAI</span>
          </div>
          <p className="text-slate-400 text-sm font-medium max-w-lg mx-auto leading-relaxed">
            Professional personal branding simplified. PortfoliAI turns static PDF resumes into dynamic digital identities with AI-driven content extraction and high-performance templates.
          </p>
          <div className="flex justify-center gap-10 mt-12">
             <a href="#" className="text-slate-300 hover:text-blue-600 transition-all hover:scale-125"><Github className="w-6 h-6" /></a>
             <a href="#" className="text-slate-300 hover:text-blue-700 transition-all hover:scale-125"><Linkedin className="w-6 h-6" /></a>
             <a href="#" className="text-slate-300 hover:text-slate-900 transition-all hover:scale-125"><Globe className="w-6 h-6" /></a>
          </div>
          <div className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
            &copy; {new Date().getFullYear()} PortfoliAI Project Labs
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
