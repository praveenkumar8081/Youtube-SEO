import React, { useState, useRef } from 'react';
import { generateSeoData, editImage } from './services/geminiService';
import { SeoResponse, LoadingState } from './types';
import CopyButton from './components/CopyButton';
import { 
  IconSparkles, 
  IconYoutube, 
  IconHash, 
  IconTag, 
  IconImage,
  IconSearch,
  IconUpload,
  IconMagic,
  IconDownload,
  IconEdit
} from './components/Icons';

type Tab = 'seo' | 'editor';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('seo');

  // SEO State
  const [topic, setTopic] = useState('');
  const [seoStatus, setSeoStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [seoData, setSeoData] = useState<SeoResponse | null>(null);
  const [seoError, setSeoError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Image Editor State
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/png');
  const [editPrompt, setEditPrompt] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [editorStatus, setEditorStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [editorError, setEditorError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- SEO Handlers ---

  const handleGenerateSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setSeoStatus(LoadingState.LOADING);
    setSeoError(null);
    setSeoData(null);

    try {
      const result = await generateSeoData(topic);
      setSeoData(result);
      setSeoStatus(LoadingState.SUCCESS);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
      setSeoStatus(LoadingState.ERROR);
      setSeoError("Unable to generate SEO data. Please verify your API Key and try again.");
    }
  };

  // --- Image Editor Handlers ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
        setImageMime(file.type);
        setEditedImage(null); // Clear previous result
        setEditorError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImage = async () => {
    if (!imageFile || !editPrompt.trim()) return;

    setEditorStatus(LoadingState.LOADING);
    setEditorError(null);

    try {
      // Remove data URL prefix for API call
      const base64Data = imageFile.split(',')[1];
      const resultBase64 = await editImage(base64Data, imageMime, editPrompt);
      
      setEditedImage(`data:image/png;base64,${resultBase64}`);
      setEditorStatus(LoadingState.SUCCESS);
    } catch (err) {
      console.error(err);
      setEditorStatus(LoadingState.ERROR);
      setEditorError("Failed to process image. Please try again with a different prompt.");
    }
  };

  const handleDownload = () => {
    if (editedImage) {
      const link = document.createElement('a');
      link.href = editedImage;
      link.download = 'tuberank-edited-thumbnail.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-100 selection:bg-red-600 selection:text-white pb-20 font-sans">
      
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-[#0f0f0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-red-600 p-1.5 rounded-lg">
              <IconYoutube className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">TubeRank<span className="text-red-500">AI</span></span>
          </div>
          
          <div className="flex bg-[#1e1e1e] p-1 rounded-lg border border-gray-800">
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'seo' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              SEO Generator
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'editor' ? 'bg-red-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <IconMagic className="w-3.5 h-3.5" /> Thumbnail Editor
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-12">
        
        {/* === SEO TAB === */}
        {activeTab === 'seo' && (
          <div className="animate-fade-in">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
                Viral SEO in Seconds
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Generate high-CTR titles, optimized descriptions, and viral tags tailored for the Indian audience.
              </p>

              {/* Input Form */}
              <form onSubmit={handleGenerateSeo} className="relative max-w-2xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-red-900 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                  <div className="relative flex items-center bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Paste your video topic here (e.g., 'Momos Recipe', 'Tech News')..."
                      className="w-full bg-transparent text-white px-6 py-4 outline-none placeholder-gray-500 text-lg"
                      disabled={seoStatus === LoadingState.LOADING}
                    />
                    <button
                      type="submit"
                      disabled={seoStatus === LoadingState.LOADING || !topic.trim()}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {seoStatus === LoadingState.LOADING ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                      ) : (
                        <>
                          <IconSparkles className="w-5 h-5" />
                          <span>Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {seoError && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-800/50 text-red-400 rounded-lg text-sm inline-block">
                  {seoError}
                </div>
              )}
            </div>

            {/* Results Section */}
            {seoData && seoStatus === LoadingState.SUCCESS && (
              <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in-up">
                
                {/* Column 1: Titles & Short Info (Wide) */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Clickbait Titles */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <span className="text-red-500 text-2xl">🔥</span> High-CTR Titles
                      </h3>
                      <CopyButton text={seoData.titles.join('\n')} label="Copy All" />
                    </div>
                    <ul className="space-y-3">
                      {seoData.titles.map((title, idx) => (
                        <li key={idx} className="group relative bg-[#121212] p-4 rounded-lg border border-gray-800 hover:border-gray-600 transition-colors">
                          <span className="text-gray-200 font-medium text-lg leading-snug">{title}</span>
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CopyButton text={title} className="bg-[#1e1e1e]" />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Description */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <IconYoutube className="w-6 h-6 text-red-500" /> Description
                      </h3>
                      <CopyButton text={seoData.description} />
                    </div>
                    <div className="bg-[#121212] p-4 rounded-lg border border-gray-800 text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {seoData.description}
                    </div>
                  </div>

                   {/* Hook Lines */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                      <span className="text-yellow-500 text-2xl">⚡</span> First 3-Second Hooks
                    </h3>
                    <div className="grid gap-3">
                       {seoData.hooks.map((hook, idx) => (
                         <div key={idx} className="bg-[#121212] p-4 rounded-lg border border-gray-800 text-gray-200 italic flex justify-between items-start group">
                           <span>"{hook}"</span>
                           <CopyButton text={hook} className="opacity-0 group-hover:opacity-100" />
                         </div>
                       ))}
                    </div>
                  </div>

                  {/* Related Queries */}
                   <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                        <IconSearch className="w-5 h-5 text-blue-400" /> Related Search Queries
                      </h3>
                      <CopyButton text={seoData.relatedQueries.join('\n')} label="Copy List" />
                    </div>
                    <div className="bg-[#121212] p-4 rounded-lg border border-gray-800">
                      <div className="flex flex-wrap gap-2">
                        {seoData.relatedQueries.map((query, idx) => (
                          <span key={idx} className="bg-blue-900/20 text-blue-300 px-3 py-1 rounded-full text-sm border border-blue-900/30">
                            {query}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Column 2: Meta Data (Narrow) */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Short Search Title */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">SEO Filename / Short Title</h3>
                    <div className="bg-[#121212] p-3 rounded border border-gray-700 font-mono text-sm text-green-400 break-words flex justify-between items-center gap-2">
                      {seoData.shortTitle}
                      <CopyButton text={seoData.shortTitle} className="shrink-0" />
                    </div>
                  </div>

                  {/* Thumbnail Text */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
                      <IconImage className="w-5 h-5 text-purple-400" /> Thumbnail Ideas
                    </h3>
                    <ul className="space-y-2">
                      {seoData.thumbnailTexts.map((text, idx) => (
                        <li key={idx} className="bg-[#121212] px-3 py-2 rounded border border-gray-800 text-white font-bold text-center tracking-wide shadow-sm">
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Hashtags */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                         <IconHash className="w-5 h-5 text-pink-500" /> Hashtags
                      </h3>
                      <CopyButton text={seoData.hashtags.join(' ')} />
                    </div>
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-800 h-48 overflow-y-auto custom-scrollbar">
                       <div className="flex flex-wrap gap-1.5">
                         {seoData.hashtags.map((tag, idx) => (
                           <span key={idx} className="text-pink-400 text-sm hover:text-pink-300 cursor-pointer transition-colors">
                             {tag}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>

                  {/* Tags / Keywords */}
                  <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-3">
                       <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                         <IconTag className="w-5 h-5 text-orange-500" /> Tags
                      </h3>
                      <CopyButton text={seoData.tags.join(', ')} />
                    </div>
                    <div className="bg-[#121212] p-3 rounded-lg border border-gray-800 h-64 overflow-y-auto custom-scrollbar">
                      <div className="flex flex-wrap gap-2">
                        {seoData.tags.map((tag, idx) => (
                          <span key={idx} className="bg-[#2a2a2a] text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* === EDITOR TAB === */}
        {activeTab === 'editor' && (
           <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="text-center mb-10">
               <h1 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
                 AI Thumbnail Editor
               </h1>
               <p className="text-gray-400">
                 Upload your thumbnail and tell AI how to improve it using natural language.
               </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {/* Upload & Prompt Section */}
               <div className="space-y-6">
                 
                 {/* Dropzone */}
                 <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed border-gray-700 hover:border-red-500 hover:bg-red-900/10 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all ${imageFile ? 'bg-gray-800/50' : 'bg-[#1e1e1e]'}`}
                 >
                   <input 
                     type="file" 
                     ref={fileInputRef} 
                     onChange={handleFileChange} 
                     accept="image/*" 
                     className="hidden" 
                   />
                   
                   {imageFile ? (
                     <img src={imageFile} alt="Preview" className="h-full w-full object-contain rounded-lg p-2" />
                   ) : (
                     <div className="text-center p-6">
                       <IconUpload className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                       <p className="text-gray-300 font-medium">Click to Upload Thumbnail</p>
                       <p className="text-xs text-gray-500 mt-2">JPG, PNG supported</p>
                     </div>
                   )}
                 </div>

                 {/* Prompt Input */}
                 <div>
                   <label className="block text-sm font-medium text-gray-400 mb-2">How should AI edit this?</label>
                   <textarea
                     value={editPrompt}
                     onChange={(e) => setEditPrompt(e.target.value)}
                     placeholder="e.g. 'Add a retro filter', 'Make the background neon blue', 'Add a surprised emoji'"
                     className="w-full bg-[#1e1e1e] border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors h-32 resize-none"
                   />
                 </div>

                 <button
                   onClick={handleEditImage}
                   disabled={!imageFile || !editPrompt.trim() || editorStatus === LoadingState.LOADING}
                   className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                 >
                   {editorStatus === LoadingState.LOADING ? (
                      <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                   ) : (
                     <>
                       <IconMagic className="w-5 h-5" /> Generate Magic
                     </>
                   )}
                 </button>

                 {editorError && (
                   <div className="p-3 bg-red-900/30 border border-red-800 text-red-300 rounded-lg text-sm text-center">
                     {editorError}
                   </div>
                 )}
               </div>

               {/* Result Section */}
               <div className="bg-[#1e1e1e] border border-gray-800 rounded-xl p-6 flex flex-col h-full min-h-[400px]">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                   <IconSparkles className="w-5 h-5 text-yellow-500" /> AI Result
                 </h3>
                 
                 <div className="flex-1 bg-[#121212] rounded-lg border border-gray-700 flex items-center justify-center overflow-hidden relative">
                   {editedImage ? (
                     <img src={editedImage} alt="Edited Result" className="w-full h-full object-contain" />
                   ) : (
                     <div className="text-center text-gray-500 p-8">
                       <p className="mb-2">No edits generated yet.</p>
                       <p className="text-sm">Upload an image and enter a prompt to start.</p>
                     </div>
                   )}
                 </div>

                 {editedImage && (
                   <button
                     onClick={handleDownload}
                     className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <IconDownload className="w-5 h-5" /> Download Image
                   </button>
                 )}
               </div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default App;