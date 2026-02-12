import { useState, useEffect, useRef } from 'react';
import type { Question, Difficulty, UserStats, SubjectConfig } from '../types';
import {
  getQuestions, addQuestion, addQuestions, deleteQuestion,
  getSettings, saveSettings, getAllUserStats, deleteUser,
  exportUsersCSV, exportResultsCSV, exportUsersJSON, exportFullDataJSON, exportLiveJSON,
  getSubjects, addSubject, updateSubject, removeSubject,
} from '../utils/storage';
import {
  supportsFileSystemAccess,
  isFileConnected as checkFileConnected,
  getLastSyncTime,
  getFileName,
  setStatusCallback,
  connectFile,
  loadFromFile,
  syncNow,
  disconnectFile,
  downloadDataFile,
  loadFromUploadedFile,
} from '../utils/fileSync';

type Tab = 'users' | 'scores' | 'add' | 'manage' | 'import' | 'subjects' | 'settings' | 'analytics';
type SortField = 'username' | 'type' | 'joined' | 'quizzes' | 'avg' | 'best' | 'accuracy';
type SortDir = 'asc' | 'desc';

const difficultyOptions: Difficulty[] = ['easy', 'medium', 'hard'];

const GRADIENT_OPTIONS = [
  'from-orange-500 to-red-500',
  'from-blue-500 to-cyan-500',
  'from-yellow-500 to-amber-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-violet-500',
  'from-pink-500 to-rose-500',
  'from-teal-500 to-cyan-500',
  'from-red-500 to-orange-500',
  'from-indigo-500 to-blue-500',
  'from-fuchsia-500 to-pink-500',
  'from-lime-500 to-green-500',
  'from-sky-500 to-indigo-500',
];

const ICON_OPTIONS = ['🌐', '🎨', '⚡', '🐍', '💎', '🔥', '🚀', '📱', '🎯', '💻', '🧠', '📊', '🔧', '🗄️', '☁️', '🤖', '🎮', '🌟', '📐', '🔬'];

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  // Subjects
  const [subjects, setSubjects] = useState<SubjectConfig[]>([]);
  const [newSubName, setNewSubName] = useState('');
  const [newSubId, setNewSubId] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('💻');
  const [newSubGradient, setNewSubGradient] = useState(GRADIENT_OPTIONS[0]);
  const [newSubDesc, setNewSubDesc] = useState('');
  const [newSubQCount, setNewSubQCount] = useState(10);
  const [newSubTime, setNewSubTime] = useState(10);
  const [subjectMsg, setSubjectMsg] = useState('');
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null);

  // Add form
  const [formSubject, setFormSubject] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<Difficulty>('easy');
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [formCorrect, setFormCorrect] = useState(0);
  const [addMsg, setAddMsg] = useState('');

  // Manage
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | 'all'>('all');

  // Import
  const [importJson, setImportJson] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [importTargetSubject, setImportTargetSubject] = useState<string>('__keep__');
  const [importTargetDifficulty, setImportTargetDifficulty] = useState<string>('__keep__');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings
  const [qPerQuiz, setQPerQuiz] = useState(10);
  const [timePerQuiz, setTimePerQuiz] = useState(10);
  const [settingsMsg, setSettingsMsg] = useState('');

  // Users
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [userFilter, setUserFilter] = useState<'all' | 'registered' | 'guest'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('joined');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showPasswords, setShowPasswords] = useState(false);

  // Export
  const [copyMsg, setCopyMsg] = useState('');

  // File Sync
  const [fileConnected, setFileConnected] = useState(false);
  const [fileSyncTime, setFileSyncTime] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [hasFileAPI, setHasFileAPI] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  const dataFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasFileAPI(supportsFileSystemAccess());
    setFileConnected(checkFileConnected());
    setFileSyncTime(getLastSyncTime());
    setFileName(getFileName());
    setStatusCallback((c, t) => {
      setFileConnected(c);
      setFileSyncTime(t);
      setFileName(getFileName());
    });
    loadAll();
  }, []);

  const loadAll = () => {
    setAllQuestions(getQuestions());
    setUserStats(getAllUserStats());
    setSubjects(getSubjects());
    const s = getSettings();
    setQPerQuiz(s.questionsPerQuiz);
    setTimePerQuiz(s.timePerQuiz);
  };

  const loadQuestions = () => setAllQuestions(getQuestions());
  const loadSubjects = () => setSubjects(getSubjects());

  // ===== FILE SYNC =====
  const handleConnectFile = async () => {
    setSyncMsg('');
    const success = await connectFile();
    if (success) { setSyncMsg('✅ File connected!'); loadAll(); }
  };
  const handleLoadFromFile = async () => {
    setSyncMsg('');
    const success = await loadFromFile();
    if (success) { setSyncMsg('✅ Data loaded!'); loadAll(); } else setSyncMsg('⚠️ Failed.');
  };
  const handleSyncNow = async () => {
    const success = await syncNow();
    setSyncMsg(success ? '✅ Synced!' : '⚠️ Failed.');
    setTimeout(() => setSyncMsg(''), 3000);
  };
  const handleDisconnect = () => { disconnectFile(); setSyncMsg('Disconnected.'); setTimeout(() => setSyncMsg(''), 3000); };
  const handleDownloadData = () => { downloadDataFile(); setSyncMsg('✅ Downloaded!'); setTimeout(() => setSyncMsg(''), 3000); };
  const handleUploadDataFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const success = await loadFromUploadedFile(file);
    if (success) { setSyncMsg('✅ Loaded!'); loadAll(); } else setSyncMsg('⚠️ Failed.');
    if (dataFileRef.current) dataFileRef.current.value = '';
  };

  // ===== ADD SUBJECT =====
  const handleAddSubject = () => {
    setSubjectMsg('');
    const id = newSubId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || newSubName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
    if (!newSubName.trim() || !id) { setSubjectMsg('⚠️ Please enter a subject name.'); return; }
    const config: SubjectConfig = {
      id,
      name: newSubName.trim(),
      icon: newSubIcon,
      gradient: newSubGradient,
      description: newSubDesc.trim() || `${newSubName.trim()} questions`,
      questionsPerQuiz: newSubQCount,
      timePerQuiz: newSubTime,
    };
    const ok = addSubject(config);
    if (!ok) { setSubjectMsg('⚠️ Subject ID already exists.'); return; }
    loadSubjects();
    setNewSubName(''); setNewSubId(''); setNewSubDesc('');
    setNewSubQCount(10); setNewSubTime(10);
    setSubjectMsg(`✅ Subject "${config.name}" added!`);
    setTimeout(() => setSubjectMsg(''), 3000);
  };

  const handleUpdateSubjectSettings = (id: string, qCount: number, time: number) => {
    updateSubject(id, { questionsPerQuiz: qCount, timePerQuiz: time });
    loadSubjects();
  };

  const handleRemoveSubject = (id: string) => {
    removeSubject(id);
    loadSubjects();
    loadQuestions();
    setDeleteSubConfirm(null);
  };

  // ===== ADD QUESTION (shuffled on save) =====
  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg('');
    if (!formSubject) { setAddMsg('⚠️ Please select a subject.'); return; }
    if (!formQuestion.trim() || formOptions.some(o => !o.trim())) { setAddMsg('⚠️ Fill all fields.'); return; }
    const q: Question = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      subject: formSubject,
      difficulty: formDifficulty,
      question: formQuestion.trim(),
      options: formOptions.map(o => o.trim()),
      correctAnswer: formCorrect,
    };
    addQuestion(q); // options get shuffled inside storage.ts
    loadQuestions();
    setFormQuestion('');
    setFormOptions(['', '', '', '']);
    setFormCorrect(0);
    setAddMsg('✅ Question added (options shuffled)!');
    setTimeout(() => setAddMsg(''), 3000);
  };

  // ===== IMPORT =====
  const processImport = (text: string) => {
    setImportMsg('');
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) { setImportMsg('⚠️ JSON must be an array.'); return; }
      const validSubjects = subjects.map(s => s.id);
      const overrideSub = importTargetSubject !== '__keep__' ? importTargetSubject : null;
      const overrideDiff = importTargetDifficulty !== '__keep__' ? importTargetDifficulty as Difficulty : null;
      const qs: Question[] = parsed.map((item: Record<string, unknown>, i: number) => {
        const sub = overrideSub || String(item.subject || '');
        if (!validSubjects.includes(sub)) {
          console.warn(`Question ${i}: subject "${sub}" not found. Adding anyway.`);
        }
        return {
          id: `imp-${Date.now()}-${i}`,
          subject: sub,
          difficulty: overrideDiff || (item.difficulty as Difficulty) || 'easy',
          question: String(item.question || ''),
          options: Array.isArray(item.options) ? (item.options as string[]).map(String) : ['', '', '', ''],
          correctAnswer: typeof item.correctAnswer === 'number' ? item.correctAnswer : 0,
        };
      });
      addQuestions(qs); // each question's options get shuffled
      loadQuestions();
      setImportJson('');
      const subLabel = overrideSub ? subjects.find(s => s.id === overrideSub)?.name || overrideSub : 'original';
      const diffLabel = overrideDiff || 'original';
      setImportMsg(`✅ Imported ${qs.length} questions → Subject: ${subLabel}, Difficulty: ${diffLabel} (options shuffled)!`);
    } catch { setImportMsg('⚠️ Invalid JSON.'); }
  };
  const handleImportPaste = () => processImport(importJson);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { setImportMsg('⚠️ Upload .json files only.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const t = ev.target?.result as string; if (t) { setImportJson(t); processImport(t); } };
    reader.onerror = () => setImportMsg('⚠️ Error reading file.');
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) { setImportMsg('⚠️ Upload .json files only.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { const t = ev.target?.result as string; if (t) { setImportJson(t); processImport(t); } };
    reader.readAsText(file);
  };

  // ===== SETTINGS =====
  const handleSaveSettings = () => {
    saveSettings({ questionsPerQuiz: qPerQuiz, timePerQuiz: timePerQuiz });
    setSettingsMsg('✅ Global settings saved!');
    setTimeout(() => setSettingsMsg(''), 3000);
  };

  const handleDeleteQuestion = (id: string) => { deleteQuestion(id); loadQuestions(); };
  const handleDeleteUser = (userId: string) => { deleteUser(userId); setUserStats(getAllUserStats()); setDeleteConfirm(null); };

  // ===== EXPORT =====
  const handleExportUsersCSV = () => downloadFile(exportUsersCSV(), 'codequiz-users.csv', 'text/csv;charset=utf-8');
  const handleExportResultsCSV = () => downloadFile(exportResultsCSV(), 'codequiz-results.csv', 'text/csv;charset=utf-8');
  const handleExportUsersJSON = () => downloadFile(exportUsersJSON(), 'codequiz-users-data.json', 'application/json;charset=utf-8');
  const handleExportFullJSON = () => downloadFile(exportFullDataJSON(), 'codequiz-full-backup.json', 'application/json;charset=utf-8');
  const handleExportLiveJSON = () => downloadFile(exportLiveJSON(), 'live.json', 'application/json;charset=utf-8');
  const handleCopyJSON = () => {
    navigator.clipboard.writeText(exportUsersJSON());
    setCopyMsg('✅ Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  // ===== SORTING =====
  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  const sortIcon = (field: SortField) => sortField === field ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '';

  // ===== FILTERED & SORTED USERS =====
  const filteredUsers = userStats
    .filter(s => {
      if (userFilter === 'registered' && s.user.isGuest) return false;
      if (userFilter === 'guest' && !s.user.isGuest) return false;
      if (userSearch && !s.user.username.toLowerCase().includes(userSearch.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'username': return dir * a.user.username.localeCompare(b.user.username);
        case 'type': return dir * ((a.user.isGuest ? 1 : 0) - (b.user.isGuest ? 1 : 0));
        case 'joined': return dir * (new Date(a.user.createdAt).getTime() - new Date(b.user.createdAt).getTime());
        case 'quizzes': return dir * (a.totalQuizzes - b.totalQuizzes);
        case 'avg': return dir * (a.avgScore - b.avgScore);
        case 'best': return dir * (a.bestScore - b.bestScore);
        case 'accuracy': {
          const accA = a.totalQuestions > 0 ? a.totalCorrect / a.totalQuestions : 0;
          const accB = b.totalQuestions > 0 ? b.totalCorrect / b.totalQuestions : 0;
          return dir * (accA - accB);
        }
        default: return 0;
      }
    });

  const filteredQuestions = allQuestions.filter(q => {
    if (filterSubject !== 'all' && q.subject !== filterSubject) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  });

  // Analytics helpers
  const subjectQuestionCounts = subjects.map(s => ({
    ...s,
    count: allQuestions.filter(q => q.subject === s.id).length,
    easy: allQuestions.filter(q => q.subject === s.id && q.difficulty === 'easy').length,
    medium: allQuestions.filter(q => q.subject === s.id && q.difficulty === 'medium').length,
    hard: allQuestions.filter(q => q.subject === s.id && q.difficulty === 'hard').length,
  }));

  const subjectLabel = (id: string) => subjects.find(s => s.id === id)?.name ?? id;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'users', label: 'Users & Scores', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'subjects', label: 'Subjects', icon: '📁' },
    { id: 'add', label: 'Add Question', icon: '➕' },
    { id: 'manage', label: 'Manage', icon: '📋' },
    { id: 'import', label: 'Import', icon: '📥' },
    { id: 'scores', label: 'Export', icon: '📤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm";
  const selectClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all text-sm";

  const ThSort = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="text-left px-4 py-3.5 text-gray-400 font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none whitespace-nowrap"
      onClick={() => handleSort(field)}
    >
      {children}{sortIcon(field)}
    </th>
  );

  const scoreColor = (pct: number) =>
    pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-yellow-400' : pct > 0 ? 'text-red-400' : 'text-gray-600';
  const scoreBg = (pct: number) =>
    pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <h1 className="text-3xl font-extrabold text-white mb-2 animate-fade-in">⚙️ Admin Panel</h1>
      <p className="text-gray-400 mb-6 animate-fade-in">Manage subjects, questions, users, scores, and settings</p>

      {/* FILE SYNC BANNER */}
      <div className={`glass-light rounded-3xl p-6 mb-8 animate-fade-in border ${fileConnected ? 'border-emerald-500/30' : 'border-white/5'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${fileConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse' : 'bg-gray-500'}`} />
            <h2 className="text-lg font-bold text-white">💾 Live Data Sync</h2>
            {fileConnected && <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 tracking-wider">AUTO-SYNC ON</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {hasFileAPI ? (
              fileConnected ? (
                <>
                  <button onClick={handleSyncNow} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all">💾 Sync</button>
                  <button onClick={handleDisconnect} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all">❌ Disconnect</button>
                </>
              ) : (
                <>
                  <button onClick={handleConnectFile} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/20">📁 Connect File</button>
                  <button onClick={handleLoadFromFile} className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 transition-all">📂 Load from File</button>
                </>
              )
            ) : (
              <>
                <button onClick={handleDownloadData} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-violet-500 to-indigo-500 text-white transition-all shadow-lg">⬇️ Save Data</button>
                <label className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 cursor-pointer inline-flex items-center gap-1.5 transition-all">
                  📂 Load Data
                  <input ref={dataFileRef} type="file" accept=".json" onChange={handleUploadDataFile} className="hidden" />
                </label>
              </>
            )}
          </div>
        </div>
        {fileConnected ? (
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            {fileSyncTime && <span>⏱️ Last sync: <strong className="text-emerald-400">{fileSyncTime}</strong></span>}
            {fileName && <span>📄 <strong className="text-white font-mono text-xs">{fileName}</strong></span>}
            <span>👥 {userStats.length} users</span>
            <span>📝 {userStats.reduce((a, s) => a + s.totalQuizzes, 0)} results</span>
          </div>
        ) : (
          <p className="text-sm text-gray-500">{hasFileAPI ? '📁 Connect a JSON file to auto-save.' : '⚠️ Browser doesn\'t support live sync.'}</p>
        )}
        {syncMsg && <div className={`mt-3 px-4 py-2 rounded-xl text-sm ${syncMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>{syncMsg}</div>}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-in">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (['users', 'scores', 'analytics', 'subjects'].includes(tab.id)) loadAll(); }}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-violet-500/20 text-violet-300 shadow-inner' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ======================== USERS & SCORES ======================== */}
      {activeTab === 'users' && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input type="text" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500/50" />
            </div>
            <div className="flex bg-white/5 rounded-xl p-1">
              {(['all', 'registered', 'guest'] as const).map(f => (
                <button key={f} onClick={() => setUserFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${userFilter === f ? 'bg-violet-500/30 text-violet-300' : 'text-gray-500 hover:text-white'}`}>
                  {f === 'all' ? `All (${userStats.length})` : f === 'registered' ? `Reg (${userStats.filter(s => !s.user.isGuest).length})` : `Guest (${userStats.filter(s => s.user.isGuest).length})`}
                </button>
              ))}
            </div>
            <button onClick={() => setShowPasswords(p => !p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showPasswords ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
              {showPasswords ? '🔓 Hide' : '🔒 Pass'}
            </button>
            <button onClick={() => loadAll()} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 border border-white/10 hover:text-white transition-all">🔄</button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total Users', value: userStats.length, icon: '👥', color: 'from-violet-500/20 to-indigo-500/20' },
              { label: 'Registered', value: userStats.filter(s => !s.user.isGuest).length, icon: '✅', color: 'from-emerald-500/20 to-green-500/20' },
              { label: 'Guests', value: userStats.filter(s => s.user.isGuest).length, icon: '👤', color: 'from-gray-500/20 to-slate-500/20' },
              { label: 'Total Quizzes', value: userStats.reduce((a, s) => a + s.totalQuizzes, 0), icon: '📝', color: 'from-cyan-500/20 to-blue-500/20' },
              { label: 'Avg Score', value: `${userStats.filter(s => s.totalQuizzes > 0).length > 0 ? Math.round(userStats.filter(s => s.totalQuizzes > 0).reduce((a, s) => a + s.avgScore, 0) / userStats.filter(s => s.totalQuizzes > 0).length) : 0}%`, icon: '📊', color: 'from-amber-500/20 to-yellow-500/20' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-4">
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}><span>{stat.icon}</span></div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* USERS TABLE */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="text-left px-4 py-3.5 text-gray-400 font-semibold text-xs uppercase tracking-wider w-10">#</th>
                    <ThSort field="username">Username</ThSort>
                    {showPasswords && <th className="text-left px-4 py-3.5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Password</th>}
                    <ThSort field="type">Type</ThSort>
                    <ThSort field="joined">Joined</ThSort>
                    <ThSort field="quizzes">Quizzes</ThSort>
                    <ThSort field="avg">Avg Score</ThSort>
                    <ThSort field="best">Best</ThSort>
                    <ThSort field="accuracy">Accuracy</ThSort>
                    <th className="text-center px-4 py-3.5 text-gray-400 font-semibold text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((stat, idx) => {
                    const accuracy = stat.totalQuestions > 0 ? Math.round((stat.totalCorrect / stat.totalQuestions) * 100) : 0;
                    const isExpanded = expandedUser === stat.user.id;
                    return (
                      <> 
                        <tr
                          key={stat.user.id}
                          className={`border-b border-white/5 transition-colors cursor-pointer ${isExpanded ? 'bg-violet-500/[0.06]' : 'hover:bg-white/[0.03]'} ${idx % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                          onClick={() => setExpandedUser(isExpanded ? null : stat.user.id)}
                        >
                          <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 ${
                                stat.user.isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                                stat.user.isGuest ? 'bg-gradient-to-br from-gray-500 to-slate-600' :
                                'bg-gradient-to-br from-violet-500 to-indigo-600'
                              }`}>
                                {stat.user.isGuest ? '👤' : stat.user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <span className="text-white font-semibold block">{stat.user.username}</span>
                                {stat.user.isAdmin && <span className="text-[10px] text-amber-400 font-bold">ADMIN</span>}
                              </div>
                            </div>
                          </td>
                          {showPasswords && (
                            <td className="px-4 py-3.5">
                              <code className="text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">{stat.user.password || '(none)'}</code>
                            </td>
                          )}
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                              stat.user.isGuest ? 'bg-gray-500/20 text-gray-400' :
                              stat.user.isAdmin ? 'bg-amber-500/20 text-amber-400' :
                              'bg-violet-500/20 text-violet-400'
                            }`}>
                              {stat.user.isGuest ? 'Guest' : stat.user.isAdmin ? 'Admin' : 'User'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">{new Date(stat.user.createdAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3.5"><span className="text-white font-bold">{stat.totalQuizzes}</span></td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-14 h-1.5 bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(stat.avgScore)}`} style={{ width: `${stat.avgScore}%` }} /></div>
                              <span className={`font-bold text-xs ${scoreColor(stat.avgScore)}`}>{stat.avgScore}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5"><span className={`font-bold text-sm ${scoreColor(stat.bestScore)}`}>{stat.bestScore}%</span></td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-medium ${scoreColor(accuracy)}`}>{accuracy}%</span>
                            <span className="text-gray-600 text-[10px] ml-1">({stat.totalCorrect}/{stat.totalQuestions})</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {!stat.user.isAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(stat.user.id); }} className="px-2 py-1 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all" title="Delete">🗑️</button>
                              )}
                              <span className={`text-gray-500 text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr key={`${stat.user.id}-detail`}>
                            <td colSpan={showPasswords ? 10 : 9} className="bg-white/[0.02] border-b border-white/10">
                              <div className="px-6 py-5">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-white">{stat.totalQuizzes}</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Quizzes</p>
                                  </div>
                                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                                    <p className={`text-lg font-bold ${scoreColor(stat.avgScore)}`}>{stat.avgScore}%</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Average</p>
                                  </div>
                                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                                    <p className={`text-lg font-bold ${scoreColor(stat.bestScore)}`}>{stat.bestScore}%</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Best</p>
                                  </div>
                                  <div className="bg-white/[0.04] rounded-xl p-3 text-center">
                                    <p className="text-lg font-bold text-white">{accuracy}%</p>
                                    <p className="text-[10px] text-gray-500 uppercase">Accuracy</p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-500">
                                  <span>📅 Joined: {new Date(stat.user.createdAt).toLocaleString()}</span>
                                  {stat.totalQuizzes > 0 && <span>🕐 Last: {new Date(stat.lastActive).toLocaleString()}</span>}
                                </div>
                                {stat.results.length > 0 ? (
                                  <div className="rounded-xl border border-white/5 overflow-hidden">
                                    <table className="w-full text-xs">
                                      <thead><tr className="bg-white/[0.04]">
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">#</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Date</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Subject</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Diff</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Score</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">%</th>
                                        <th className="text-left px-3 py-2.5 text-gray-500 font-medium uppercase tracking-wider">Time</th>
                                      </tr></thead>
                                      <tbody>
                                        {stat.results.slice().reverse().map((r, ri) => (
                                          <tr key={r.id} className={`border-t border-white/5 ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                                            <td className="px-3 py-2.5 text-gray-600">{ri + 1}</td>
                                            <td className="px-3 py-2.5 text-gray-300 whitespace-nowrap">{new Date(r.date).toLocaleDateString()} <span className="text-gray-600">{new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                                            <td className="px-3 py-2.5 text-white font-medium">{subjectLabel(r.subject)}</td>
                                            <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' : r.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{r.difficulty}</span></td>
                                            <td className="px-3 py-2.5 text-white font-medium">{r.score}/{r.total}</td>
                                            <td className="px-3 py-2.5">
                                              <div className="flex items-center gap-1.5">
                                                <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${scoreBg(r.percentage)}`} style={{ width: `${r.percentage}%` }} /></div>
                                                <span className={`font-bold ${scoreColor(r.percentage)}`}>{r.percentage}%</span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-gray-500">{Math.floor(r.timeTaken / 60)}m {r.timeTaken % 60}s</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-600 text-sm bg-white/[0.02] rounded-xl">📭 No results yet</div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && <div className="text-center py-16 text-gray-500"><span className="text-4xl block mb-3">🔍</span>No users found.</div>}
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredUsers.length} of {userStats.length} users</span>
              <span>Click row to expand</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================== ANALYTICS ======================== */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in space-y-6">
          {/* Overview Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-3xl mb-2 block">📚</span>
              <p className="text-2xl font-bold text-white">{allQuestions.length}</p>
              <p className="text-xs text-gray-500">Total Questions</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-3xl mb-2 block">📁</span>
              <p className="text-2xl font-bold text-white">{subjects.length}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-3xl mb-2 block">👥</span>
              <p className="text-2xl font-bold text-white">{userStats.length}</p>
              <p className="text-xs text-gray-500">Users</p>
            </div>
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-3xl mb-2 block">📝</span>
              <p className="text-2xl font-bold text-white">{userStats.reduce((a, s) => a + s.totalQuizzes, 0)}</p>
              <p className="text-xs text-gray-500">Quizzes Taken</p>
            </div>
          </div>

          {/* Questions by Subject Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5"><h3 className="text-lg font-bold text-white">📊 Questions by Subject & Difficulty</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Subject</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">🟢 Easy</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">🟡 Medium</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">🔴 Hard</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Total</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Distribution</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Q/Quiz</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectQuestionCounts.map((s, i) => (
                    <tr key={s.id} className={`border-t border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-sm`}>{s.icon}</span>
                          <span className="text-white font-semibold">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">{s.easy}</span></td>
                      <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold">{s.medium}</span></td>
                      <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-bold">{s.hard}</span></td>
                      <td className="px-5 py-3 text-center text-white font-bold">{s.count}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-0.5 h-3 rounded-full overflow-hidden w-32">
                          {s.count > 0 ? (
                            <>
                              <div className="bg-emerald-500/60 h-full" style={{ width: `${(s.easy / s.count) * 100}%` }} />
                              <div className="bg-yellow-500/60 h-full" style={{ width: `${(s.medium / s.count) * 100}%` }} />
                              <div className="bg-red-500/60 h-full" style={{ width: `${(s.hard / s.count) * 100}%` }} />
                            </>
                          ) : (
                            <div className="bg-white/5 w-full h-full" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-violet-400 font-bold">{s.questionsPerQuiz}</td>
                      <td className="px-5 py-3 text-center text-cyan-400 font-bold">{s.timePerQuiz}m</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/10 bg-white/[0.03]">
                    <td className="px-5 py-3 text-white font-bold">Total</td>
                    <td className="px-5 py-3 text-center text-emerald-400 font-bold">{subjectQuestionCounts.reduce((a, s) => a + s.easy, 0)}</td>
                    <td className="px-5 py-3 text-center text-yellow-400 font-bold">{subjectQuestionCounts.reduce((a, s) => a + s.medium, 0)}</td>
                    <td className="px-5 py-3 text-center text-red-400 font-bold">{subjectQuestionCounts.reduce((a, s) => a + s.hard, 0)}</td>
                    <td className="px-5 py-3 text-center text-white font-bold">{allQuestions.length}</td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Top Performers */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5"><h3 className="text-lg font-bold text-white">🏆 Top Performers</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-white/[0.03]">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">#</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">User</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Quizzes</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Avg</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Best</th>
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Performance</th>
                </tr></thead>
                <tbody>
                  {userStats.filter(s => s.totalQuizzes > 0).sort((a, b) => b.avgScore - a.avgScore).slice(0, 10).map((stat, idx) => (
                    <tr key={stat.user.id} className={`border-t border-white/5 hover:bg-white/[0.03] ${idx % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-5 py-3 text-gray-500 font-bold">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{stat.user.username}</td>
                      <td className="px-5 py-3 text-center text-white">{stat.totalQuizzes}</td>
                      <td className="px-5 py-3 text-center"><span className={`font-bold ${scoreColor(stat.avgScore)}`}>{stat.avgScore}%</span></td>
                      <td className="px-5 py-3 text-center"><span className={`font-bold ${scoreColor(stat.bestScore)}`}>{stat.bestScore}%</span></td>
                      <td className="px-5 py-3">
                        <div className="w-full max-w-[200px] h-3 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${scoreBg(stat.avgScore)} transition-all`} style={{ width: `${stat.avgScore}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {userStats.filter(s => s.totalQuizzes > 0).length === 0 && <p className="text-center py-8 text-gray-500">No data yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ======================== SUBJECTS MANAGEMENT ======================== */}
      {activeTab === 'subjects' && (
        <div className="animate-fade-in space-y-6">
          {/* Add New Subject */}
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl font-bold text-white mb-6">➕ Add New Subject</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject Name *</label>
                <input type="text" value={newSubName} onChange={e => { setNewSubName(e.target.value); setNewSubId(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '')); }} className={inputClass} placeholder="e.g. React, TypeScript, SQL..." />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject ID (auto)</label>
                <input type="text" value={newSubId} onChange={e => setNewSubId(e.target.value)} className={inputClass} placeholder="auto-generated" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <input type="text" value={newSubDesc} onChange={e => setNewSubDesc(e.target.value)} className={inputClass} placeholder="e.g. Frontend Framework" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Questions per Quiz</label>
                <input type="number" min={1} max={50} value={newSubQCount} onChange={e => setNewSubQCount(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time per Quiz (minutes)</label>
                <input type="number" min={1} max={120} value={newSubTime} onChange={e => setNewSubTime(Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(icon => (
                  <button key={icon} type="button" onClick={() => setNewSubIcon(icon)} className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${newSubIcon === icon ? 'bg-violet-500/30 ring-2 ring-violet-500 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Color Theme</label>
              <div className="flex flex-wrap gap-2">
                {GRADIENT_OPTIONS.map(g => (
                  <button key={g} type="button" onClick={() => setNewSubGradient(g)} className={`w-10 h-10 rounded-xl bg-gradient-to-br ${g} transition-all ${newSubGradient === g ? 'ring-2 ring-white scale-110 shadow-lg' : 'opacity-60 hover:opacity-100'}`} />
                ))}
              </div>
            </div>
            {/* Preview */}
            <div className="glass rounded-2xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${newSubGradient} flex items-center justify-center`}>
                  <span className="text-2xl">{newSubIcon}</span>
                </div>
                <div>
                  <p className="text-white font-bold">{newSubName || 'Subject Name'}</p>
                  <p className="text-xs text-gray-500">{newSubDesc || 'Description'}</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{newSubQCount} questions · {newSubTime} minutes</p>
                </div>
              </div>
            </div>
            {subjectMsg && <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${subjectMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{subjectMsg}</div>}
            <button onClick={handleAddSubject} className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25">
              ➕ Add Subject
            </button>
          </div>

          {/* Existing Subjects Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5">
              <h3 className="text-lg font-bold text-white">📁 Current Subjects ({subjects.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03]">
                    <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Subject</th>
                    <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">ID</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Questions</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Q/Quiz</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Time</th>
                    <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s, i) => {
                    const qCount = allQuestions.filter(q => q.subject === s.id).length;
                    const isEditing = editingSubject === s.id;
                    return (
                      <tr key={s.id} className={`border-t border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center`}><span>{s.icon}</span></div>
                            <div>
                              <span className="text-white font-semibold">{s.name}</span>
                              <span className="text-xs text-gray-600 block">{s.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3"><code className="text-gray-400 bg-white/5 px-2 py-0.5 rounded font-mono text-xs">{s.id}</code></td>
                        <td className="px-5 py-3 text-center text-white font-bold">{qCount}</td>
                        <td className="px-5 py-3 text-center">
                          {isEditing ? (
                            <input type="number" min={1} max={50} value={s.questionsPerQuiz}
                              onChange={e => handleUpdateSubjectSettings(s.id, Number(e.target.value), s.timePerQuiz)}
                              className="w-16 px-2 py-1 rounded-lg bg-white/10 border border-violet-500/30 text-white text-center text-xs focus:outline-none"
                            />
                          ) : (
                            <span className="text-violet-400 font-bold">{s.questionsPerQuiz}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {isEditing ? (
                            <input type="number" min={1} max={120} value={s.timePerQuiz}
                              onChange={e => handleUpdateSubjectSettings(s.id, s.questionsPerQuiz, Number(e.target.value))}
                              className="w-16 px-2 py-1 rounded-lg bg-white/10 border border-violet-500/30 text-white text-center text-xs focus:outline-none"
                            />
                          ) : (
                            <span className="text-cyan-400 font-bold">{s.timePerQuiz}m</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => setEditingSubject(isEditing ? null : s.id)} className={`px-2 py-1 rounded-lg text-xs font-medium transition-all ${isEditing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400 hover:text-white'}`}>
                              {isEditing ? '✅' : '✏️'}
                            </button>
                            <button onClick={() => setDeleteSubConfirm(s.id)} className="px-2 py-1 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {subjects.length === 0 && <div className="text-center py-12 text-gray-500">No subjects configured.</div>}
          </div>
        </div>
      )}

      {/* ======================== ADD QUESTION ======================== */}
      {activeTab === 'add' && (
        <div className="glass-card rounded-3xl p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-2">Add New Question</h2>
          <p className="text-sm text-gray-500 mb-6">Options will be automatically shuffled when saved.</p>
          <form onSubmit={handleAddQuestion} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject *</label>
                <select value={formSubject} onChange={e => setFormSubject(e.target.value)} className={selectClass}>
                  <option value="">-- Select Subject --</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Difficulty</label>
                <select value={formDifficulty} onChange={e => setFormDifficulty(e.target.value as Difficulty)} className={selectClass}>
                  {difficultyOptions.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Question</label>
              <textarea value={formQuestion} onChange={e => setFormQuestion(e.target.value)} rows={3} className={inputClass} placeholder="Enter question..." />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Options <span className="text-gray-600">(will be shuffled)</span></label>
              <div className="space-y-3">
                {formOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <button type="button" onClick={() => setFormCorrect(i)} className={`w-9 h-9 rounded-xl text-xs font-bold shrink-0 transition-all ${formCorrect === i ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-white/8 text-gray-500 hover:bg-white/15'}`}>
                      {String.fromCharCode(65 + i)}
                    </button>
                    <input type="text" value={opt} onChange={e => { const n = [...formOptions]; n[i] = e.target.value; setFormOptions(n); }} className={inputClass} placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                    {formCorrect === i && <span className="text-emerald-400 text-xs font-bold shrink-0">✓ Correct</span>}
                  </div>
                ))}
              </div>
            </div>
            {addMsg && <div className={`px-4 py-3 rounded-xl text-sm ${addMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{addMsg}</div>}
            <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25">
              ➕ Add Question (Shuffled)
            </button>
          </form>
        </div>
      )}

      {/* ======================== MANAGE QUESTIONS ======================== */}
      {activeTab === 'manage' && (
        <div className="animate-fade-in">
          <div className="flex flex-wrap gap-3 mb-6">
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
              <option value="all">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
            </select>
            <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value as Difficulty | 'all')} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none">
              <option value="all">All Difficulties</option>
              {difficultyOptions.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </select>
            <span className="px-4 py-2 text-sm text-gray-400">{filteredQuestions.length} of {allQuestions.length} questions</span>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/10">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase w-10">#</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Subject</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Difficulty</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Question</th>
                    <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs uppercase">Answer</th>
                    <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs uppercase w-16">Del</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, i) => (
                    <tr key={q.id} className={`border-t border-white/5 hover:bg-white/[0.03] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{i + 1}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-lg bg-white/10 text-xs font-medium text-gray-300">{subjectLabel(q.subject)}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${q.difficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-400' : q.difficulty === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{q.difficulty}</span></td>
                      <td className="px-4 py-3 text-white text-xs max-w-xs truncate" title={q.question}>{q.question}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-[140px] truncate" title={q.options[q.correctAnswer]}>
                        <span className="text-emerald-400 font-bold mr-1">{String.fromCharCode(65 + q.correctAnswer)}.</span>
                        {q.options[q.correctAnswer]}
                      </td>
                      <td className="px-4 py-3 text-center"><button onClick={() => handleDeleteQuestion(q.id)} className="px-2 py-1 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all">🗑️</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredQuestions.length === 0 && <div className="text-center py-12 text-gray-500">No questions found.</div>}
            <div className="px-5 py-3 bg-white/[0.02] border-t border-white/10 text-xs text-gray-500">{filteredQuestions.length} questions</div>
          </div>
        </div>
      )}

      {/* ======================== IMPORT ======================== */}
      {activeTab === 'import' && (
        <div className="glass-card rounded-3xl p-8 animate-fade-in">
          <h2 className="text-xl font-bold text-white mb-2">Import Questions</h2>
          <p className="text-gray-400 text-sm mb-6">Upload a JSON file or paste JSON. Options are auto-shuffled on import.</p>

          {/* Target Subject & Difficulty Override */}
          <div className="glass rounded-2xl p-5 mb-6 border border-violet-500/20">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              🎯 Import Target
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-500/20 text-violet-400">OVERRIDE</span>
            </h3>
            <p className="text-xs text-gray-500 mb-4">Override the subject/difficulty for ALL imported questions, or keep original values from JSON.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Target Subject</label>
                <select value={importTargetSubject} onChange={e => setImportTargetSubject(e.target.value)} className={selectClass}>
                  <option value="__keep__">📂 Keep from JSON (original)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">Target Difficulty</label>
                <select value={importTargetDifficulty} onChange={e => setImportTargetDifficulty(e.target.value)} className={selectClass}>
                  <option value="__keep__">🎯 Keep from JSON (original)</option>
                  <option value="easy">🟢 Easy</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>
            {(importTargetSubject !== '__keep__' || importTargetDifficulty !== '__keep__') && (
              <div className="mt-3 flex flex-wrap gap-2">
                {importTargetSubject !== '__keep__' && (
                  <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-500/15 text-violet-400 border border-violet-500/20">
                    → {subjects.find(s => s.id === importTargetSubject)?.icon} {subjects.find(s => s.id === importTargetSubject)?.name}
                  </span>
                )}
                {importTargetDifficulty !== '__keep__' && (
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    importTargetDifficulty === 'easy' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                    importTargetDifficulty === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/15 text-red-400 border-red-500/20'
                  }`}>
                    → {importTargetDifficulty}
                  </span>
                )}
                <button
                  onClick={() => { setImportTargetSubject('__keep__'); setImportTargetDifficulty('__keep__'); }}
                  className="px-2 py-1 rounded-lg text-xs text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  ✕ Reset
                </button>
              </div>
            )}
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-white/15 rounded-2xl p-10 text-center hover:border-violet-500/40 hover:bg-violet-500/5 transition-all cursor-pointer mb-6 group" onDragOver={handleDragOver} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><span className="text-3xl">📁</span></div>
            <h3 className="text-lg font-bold text-white mb-2">Upload JSON File</h3>
            <p className="text-sm text-gray-400">Drag & drop or click to browse</p>
            {importTargetSubject !== '__keep__' && (
              <p className="text-xs text-violet-400 mt-2">→ Will import to: {subjects.find(s => s.id === importTargetSubject)?.name}</p>
            )}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative flex justify-center text-xs"><span className="px-3 bg-[#161638] text-gray-500">or paste JSON below</span></div>
          </div>

          <div className="glass rounded-2xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-2 font-medium">JSON Format:</p>
            <pre className="text-xs text-cyan-400 overflow-x-auto whitespace-pre-wrap">{importTargetSubject !== '__keep__'
              ? `[{ "question": "..?", "options": ["A","B","C","D"], "correctAnswer": 0 }]\n// subject & difficulty will be set from Target above`
              : `[{ "subject": "${subjects[0]?.id || 'html'}", "difficulty": "easy", "question": "..?", "options": ["A","B","C","D"], "correctAnswer": 0 }]`
            }</pre>
            <p className="text-[10px] text-gray-600 mt-2">Available subjects: {subjects.map(s => `${s.icon} ${s.id}`).join(', ')}</p>
          </div>

          <textarea value={importJson} onChange={e => setImportJson(e.target.value)} rows={10} className={inputClass + ' font-mono'} placeholder="Paste JSON here..." />
          {importMsg && <div className={`mt-4 px-4 py-3 rounded-xl text-sm ${importMsg.startsWith('✅') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>{importMsg}</div>}
          <button onClick={handleImportPaste} disabled={!importJson.trim()} className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-600 hover:to-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/25">
            📥 Import {importTargetSubject !== '__keep__' ? `to ${subjects.find(s => s.id === importTargetSubject)?.name}` : ''} (Auto-Shuffle)
          </button>
        </div>
      )}

      {/* ======================== EXPORT ======================== */}
      {activeTab === 'scores' && (
        <div className="animate-fade-in space-y-6">
          {/* ★ LIVE.JSON — Fallback Recovery File */}
          <div className="glass-light rounded-3xl p-6 border border-amber-500/20 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center shrink-0">
                  <span className="text-3xl">🛡️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Save as live.json
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-400">RECOMMENDED</span>
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Download current data as <code className="bg-white/5 px-1.5 py-0.5 rounded text-amber-400 font-mono text-xs">live.json</code> and place it next to <code className="bg-white/5 px-1.5 py-0.5 rounded text-cyan-400 font-mono text-xs">index.html</code> on your server.
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    ✅ When localStorage is cleared, the app will <strong className="text-white">automatically restore</strong> all user accounts, scores, and settings from this file.
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportLiveJSON}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 whitespace-nowrap shrink-0"
              >
                🛡️ Download live.json
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Users CSV', desc: 'All users with stats', icon: '📊', action: handleExportUsersCSV },
              { title: 'Scores CSV', desc: 'All quiz results', icon: '📋', action: handleExportResultsCSV },
              { title: 'Users JSON', desc: 'Users + results', icon: '👥', action: handleExportUsersJSON },
              { title: 'Full Backup', desc: 'Everything (loadable)', icon: '💾', action: handleExportFullJSON },
            ].map(item => (
              <div key={item.title} className="glass-card rounded-2xl p-6 text-center hover:bg-white/5 transition-all">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-4">{item.desc}</p>
                <button onClick={item.action} className="w-full py-2.5 rounded-xl bg-violet-500/15 text-violet-400 text-xs font-bold hover:bg-violet-500/25 border border-violet-500/20 transition-all">⬇️ Download</button>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">📋 Live Users Data (JSON)</h3>
              <button onClick={handleCopyJSON} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 transition-all">
                {copyMsg || '📋 Copy'}
              </button>
            </div>
            <div className="bg-black/40 rounded-xl p-4 max-h-[400px] overflow-y-auto border border-white/5">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">{exportUsersJSON()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================== SETTINGS ======================== */}
      {activeTab === 'settings' && (
        <div className="animate-fade-in space-y-6">
          <div className="glass-card rounded-3xl p-8 max-w-lg">
            <h2 className="text-xl font-bold text-white mb-2">⚙️ Global Quiz Settings</h2>
            <p className="text-sm text-gray-500 mb-6">Default values — can be overridden per subject in the Subjects tab.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Questions per Quiz</label>
                <input type="number" min={1} max={50} value={qPerQuiz} onChange={e => setQPerQuiz(Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Time per Quiz (minutes)</label>
                <input type="number" min={1} max={120} value={timePerQuiz} onChange={e => setTimePerQuiz(Number(e.target.value))} className={inputClass} />
              </div>
              {settingsMsg && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm">{settingsMsg}</div>}
              <button onClick={handleSaveSettings} className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-bold hover:from-violet-600 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/25">💾 Save Settings</button>
            </div>
          </div>

          {/* Per-Subject Settings Overview */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5"><h3 className="text-lg font-bold text-white">📁 Per-Subject Settings</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-white/[0.03]">
                  <th className="text-left px-5 py-3 text-gray-500 font-medium text-xs uppercase">Subject</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Questions/Quiz</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Time (min)</th>
                  <th className="text-center px-5 py-3 text-gray-500 font-medium text-xs uppercase">Edit</th>
                </tr></thead>
                <tbody>
                  {subjects.map((s, i) => (
                    <tr key={s.id} className={`border-t border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.015]'}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-lg bg-gradient-to-br ${s.gradient} flex items-center justify-center text-sm`}>{s.icon}</span>
                          <span className="text-white font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-center text-violet-400 font-bold">{s.questionsPerQuiz}</td>
                      <td className="px-5 py-3 text-center text-cyan-400 font-bold">{s.timePerQuiz}m</td>
                      <td className="px-5 py-3 text-center">
                        <button onClick={() => { setActiveTab('subjects'); setEditingSubject(s.id); }} className="px-2 py-1 rounded-lg text-xs bg-white/5 text-gray-400 hover:text-white transition-all">✏️ Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-light rounded-3xl p-8 max-w-md w-full animate-fade-in">
            <div className="text-center">
              <span className="text-5xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-bold text-white mb-2">Delete User?</h3>
              <p className="text-gray-400 text-sm mb-2">
                Permanently delete <strong className="text-white">{userStats.find(s => s.user.id === deleteConfirm)?.user.username}</strong> and all their scores.
              </p>
              <p className="text-red-400 text-xs mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all">Cancel</button>
                <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 border border-red-500/30 transition-all">🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subject Confirmation Modal */}
      {deleteSubConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-light rounded-3xl p-8 max-w-md w-full animate-fade-in">
            <div className="text-center">
              <span className="text-5xl mb-4 block">⚠️</span>
              <h3 className="text-xl font-bold text-white mb-2">Delete Subject?</h3>
              <p className="text-gray-400 text-sm mb-2">
                Delete <strong className="text-white">{subjects.find(s => s.id === deleteSubConfirm)?.name}</strong> and <strong className="text-red-400">all its questions</strong>.
              </p>
              <p className="text-red-400 text-xs mb-6">
                {allQuestions.filter(q => q.subject === deleteSubConfirm).length} questions will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteSubConfirm(null)} className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all">Cancel</button>
                <button onClick={() => handleRemoveSubject(deleteSubConfirm)} className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium hover:bg-red-500/30 border border-red-500/30 transition-all">🗑️ Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
