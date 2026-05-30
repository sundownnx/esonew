/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  User as UserIcon, 
  Briefcase, 
  Stethoscope, 
  Sparkles, 
  Languages, 
  BookOpen, 
  Clock, 
  Calendar, 
  FileText, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  Send,
  PlusCircle,
  Clock3,
  ChevronRight,
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';
import { translations } from './localization';
import { LanguageCode, User, Doctor, Patient, Conclusion, Appointment, MedicalCase, ChatMessage } from './types';

// Modular Subcomponents
import DicomViewer from './components/DicomViewer';
import CaseWizard from './components/CaseWizard';
import AdminPortal from './components/AdminPortal';
import Logo from './components/Logo';

export default function App() {
  // Locale State
  const [lang, setLang] = useState<LanguageCode>('ru');
  const t = translations[lang];

  // Dark/Light Mode state loaded from localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Toggle dark class on native document elements for smooth global backdrop updates
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('theme', newVal ? 'dark' : 'light');
      return newVal;
    });
  };

  // Gemini API key state
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);

  // Authentication states
  const [role, setRole] = useState<'doctor' | 'patient' | 'admin'>('patient'); // Initial switch view
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<User | null>(null);
  
  // Auth Form Inputs
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // 2FA states (GDPR Compliance - disabled by default for testability)
  const [enable2FA, setEnable2FA] = useState<boolean>(false);
  const [show2FAForm, setShow2FAForm] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<string>('4892');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string>('');

  // Loaded database references
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientList, setPatientList] = useState<{ id: string, name: string, email: string }[]>([]);
  const [conclusions, setConclusions] = useState<Conclusion[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [cases, setCases] = useState<MedicalCase[]>([]);

  // Selection states
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<string>('');
  const [bookingTime, setBookingTime] = useState<string>('');
  const [bookingStatus, setBookingStatus] = useState<string>('');

  // Active Medical Case selected by Patient/Doctor
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Expert Opinion generator states (Physician Workspace)
  const [caseName, setCaseName] = useState<string>('');
  const [anamnesis, setAnamnesis] = useState<string>('');
  const [ultrasound, setUltrasound] = useState<string>('');
  const [otherInfo, setOtherInfo] = useState<string>('');
  const [aiReport, setAiReport] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [clinicalRefName, setClinicalRefName] = useState<string>("Müller's Cardiology Textbook, 5th Edition");

  // Chat message logs state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Video Consultation Mode
  const [isInVideoCall, setIsInVideoCall] = useState<boolean>(false);
  const [videoRole, setVideoRole] = useState<'doctor' | 'patient'>('patient');
  const [videoPartner, setVideoPartner] = useState<string>('Opponent');
  const [cameraActive, setCameraActive] = useState<boolean>(true);
  const [micActive, setMicActive] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [videoLog, setVideoLog] = useState<string[]>([]);

  useEffect(() => {
    fetchInitialContext();
  }, [user]);

  // Video Call Simulation Chrono
  useEffect(() => {
    let interval: any;
    if (isInVideoCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
        const dialogues = [
          "Patient reports dyspnea under steady cardiovascular load.",
          "Fachtarzt suggestions: temporary sodium restriction & tracking clinical logs.",
          "Live Translation Channel: Medical terms verified against European textbooks.",
          "Gemini Real-time assistant: Suggesting checkup of mitral leak width."
        ];
        if (Math.random() > 0.8) {
          const s = dialogues[Math.floor(Math.random() * dialogues.length)];
          setVideoLog(prev => [...prev.slice(-3), `[${formatTime(callDuration + 1)}] ${s}`]);
        }
      }, 1000);
    } else {
      setCallDuration(0);
      setVideoLog([]);
    }
    return () => clearInterval(interval);
  }, [isInVideoCall, callDuration]);

  // Handle active case chat updates
  useEffect(() => {
    let interval: any;
    if (selectedCaseId) {
      fetchCaseChats();
      interval = setInterval(() => {
        fetchCaseChats();
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [selectedCaseId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const sc = sec % 60;
    return `${min.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
  };

  const fetchInitialContext = async () => {
    try {
      // Check API
      const resG = await fetch('/api/gemini/status');
      if (resG.ok) {
        setHasGeminiKey((await resG.json()).hasKey);
      }

      // Load Doctors
      const resDoc = await fetch('/api/doctors');
      if (resDoc.ok) {
        const dJson = await resDoc.json();
        setDoctors(dJson);
        if (dJson.length > 0) setSelectedDoctorId(dJson[0].id);
      }

      // Load registry of patients
      const resPat = await fetch('/api/patients');
      if (resPat.ok) {
        const pJson = await resPat.json();
        setPatientList(pJson);
        if (pJson.length > 0) setSelectedPatientId(pJson[0].id);
      }

      if (user) {
        const resCon = await fetch(`/api/conclusions?userId=${user.id}&role=${user.role}`);
        if (resCon.ok) {
          setConclusions(await resCon.json());
        }

        const resApp = await fetch(`/api/appointments?userId=${user.id}&role=${user.role}`);
        if (resApp.ok) {
          setAppointments(await resApp.json());
        }

        const resCas = await fetch(`/api/cases?userId=${user.id}&role=${user.role}`);
        if (resCas.ok) {
          const cJson = await resCas.json();
          setCases(cJson);
          if (cJson.length > 0 && !selectedCaseId) {
            setSelectedCaseId(cJson[0].id);
            setCaseName(cJson[0].patientName);
            setAnamnesis(cJson[0].anamnesis);
          }
        }
      }
    } catch (e) {
      console.warn("Express server offline. Fallback to offline context states.", e);
    }
  };

  const fetchCaseChats = async () => {
    if (!selectedCaseId) return;
    try {
      const res = await fetch(`/api/chats/${selectedCaseId}`);
      if (res.ok) {
        setChatMessages(await res.json());
      }
    } catch (err) {
      console.warn("Could not reload messages.");
    }
  };

  const handlePostChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedCaseId || !user) return;

    try {
      const payload = {
        caseId: selectedCaseId,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        messageText: chatInput
      };

      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setChatInput('');
        fetchCaseChats();
      }
    } catch (error) {
       console.warn("Failed sending message.");
    }
  };

  const handleQuickLogin = (selectedRole: 'doctor' | 'patient' | 'admin') => {
    if (selectedRole === 'doctor') {
      setEmail('doctor@eurosecondopinion.com');
      setPassword('Password123');
    } else if (selectedRole === 'patient') {
      setEmail('patient@eurosecondopinion.com');
      setPassword('Password123');
    } else {
      setEmail('admin@eurosecondopinion.com');
      setPassword('Password123');
    }
    setRole(selectedRole);
    setAuthMode('login');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Authentication failure.');
        }

        // Check if 2FA (GDPR secure token authorization) is active
        if (enable2FA) {
          const simulatedCode = Math.floor(1000 + Math.random() * 9000).toString();
          setOtpSent(simulatedCode);
          setShow2FAForm(true);
          setUser(data); // interim store
        } else {
          setUser(data);
        }

      } else {
        // Patient registration
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, name: fullName, password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Registration failure.');
        }
        setUser(data);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error occurred during network request.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerify2FAToken = () => {
    if (otpInput === otpSent) {
      setShow2FAForm(false);
      setOtpError('');
    } else {
      setOtpError('Неверный код авторизации 2FA. Пожалуйста, введите код, указанный в подсказке.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setAiReport('');
    setAnamnesis('');
    setUltrasound('');
    setOtherInfo('');
    setCaseName('');
    setSelectedCaseId('');
    setShow2FAForm(false);
  };

  // Generate Medical Report with Gemini Server Proxy
  const handleGenerateAiConclusion = async () => {
    if (!caseName.trim()) {
      setAiError(t.patientFio + ' is empty.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    setAiReport('');

    try {
      const res = await fetch('/api/gemini/generate-conclusion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: caseName,
          anamnesis,
          ultrasound,
          otherInfo,
          language: lang
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gemini compilation failed.');
      }
      setAiReport(data.reportText);
    } catch (err: any) {
      setAiError(err.message || 'Translation logic or Gemini connection failure.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveConclusion = async () => {
    if (!aiReport.trim() || !caseName.trim()) {
      setSaveStatus('Cannot save empty report.');
      return;
    }
    setSaveStatus('Saving report...');
    try {
      const res = await fetch('/api/conclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId || 'user_pat_1',
          patientName: caseName,
          doctorName: user?.name || 'Dr. Sarah Harrison',
          anamnesis,
          ultrasound,
          otherInfo,
          reportText: aiReport
        })
      });

      if (res.ok) {
        setSaveStatus('Saved report successfully!');
        
        // Update case state to 'ready'
        if (selectedCaseId) {
          await fetch(`/api/cases/${selectedCaseId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ready' })
          });
        }

        fetchInitialContext();
        
        // Clear inputs
        setCaseName('');
        setAnamnesis('');
        setUltrasound('');
        setOtherInfo('');
        setAiReport('');
      } else {
        const d = await res.json();
        setSaveStatus(d.error || 'Failed to sync with clinical DB');
      }
    } catch (err) {
      setSaveStatus('Network database write failure');
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDate || !bookingTime) {
      setBookingStatus('Specify valid timestamp.');
      return;
    }
    setBookingStatus('Scheduling slot...');

    const matchedDoc = doctors.find(d => d.id === selectedDoctorId);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: user?.id || 'anon',
          patientName: user?.name || 'Maxim Ivanov',
          doctorName: matchedDoc?.name || 'Dr. Sarah Harrison',
          specialty: matchedDoc?.specialty || 'General Practitioner',
          date: bookingDate,
          time: bookingTime
        })
      });

      if (res.ok) {
        setBookingStatus('Appointment booked and virtual channel created!');
        fetchInitialContext();
        setBookingDate('');
        setBookingTime('');
      } else {
        setBookingStatus('Scheduled list error.');
      }
    } catch (err) {
      setBookingStatus('Network appointment stream failed.');
    }
  };

  const startIntegratedCall = (roleType: 'doctor' | 'patient', partner: string) => {
    setVideoRole(roleType);
    setVideoPartner(partner);
    setIsInVideoCall(true);
    setCameraActive(true);
    setMicActive(true);
    setVideoLog([`[00:00] Secure Medical Channel Established (AES-256)...`]);
  };

  const activeCase = cases.find(c => c.id === selectedCaseId);

  // SLA Timers mock
  const activeSlaTimer = activeCase?.status === 'in_progress' ? 'Active Timer: 44h 12m' : '';

  return (
    <div id="eurosecondopinion-node" className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDarkMode ? 'bg-[#08100B] text-[#E6F3EC] selection:bg-[#D4AF37]/20 selection:text-[#D4AF37]' : 'bg-[#F3F7F5] text-[#1A3025] selection:bg-[#004F2D]/10 selection:text-[#004F2D]'}`}>
      
      {/* Upper Navigation Header */}
      <header id="app-header" className={`h-16 border-b flex items-center justify-between px-4 md:px-8 shrink-0 sticky top-0 z-50 shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-[#111e15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
        <Logo shieldSize={34} withText={true} />
        
        <div className="flex items-center gap-4 md:gap-6">
          {/* Universal Day/Night Mode Switcher Toggle Button */}
          <button 
            type="button"
            onClick={toggleDarkMode}
            className={`p-2 border rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-yellow-400 hover:bg-[#1a2d21] hover:text-yellow-300' : 'bg-[#F4F8F6] border-[#BDD1C6]/70 text-gray-500 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200'}`}
            title={isDarkMode ? 'Включить светлую тему' : 'Включить темную тему'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Universal Language Switcher */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-colors duration-200 ${isDarkMode ? 'bg-[#15241c] border-[#253e2f]' : 'bg-[#F4F8F6] border-[#BDD1C6]/70'}`}>
            <Languages className={`w-3.5 h-3.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as LanguageCode)}
              className={`bg-transparent text-xs font-semibold focus:outline-none uppercase cursor-pointer ${isDarkMode ? 'text-white [&>option]:bg-[#111e15] [&>option]:text-white' : 'text-[#1A3025]'}`}
            >
              <option value="en">English (EN)</option>
              <option value="de">Deutsch (DE)</option>
              <option value="fr">Français (FR)</option>
              <option value="it">Italiano (IT)</option>
              <option value="es">Español (ES)</option>
              <option value="ru">Русский (RU)</option>
            </select>
          </div>

          {user && (
            <div className={`flex items-center gap-3 border-l pl-4 md:pl-6 ${isDarkMode ? 'border-[#22392b]' : 'border-[#BDD1C6]/60'}`}>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-gray-500 font-medium font-mono">Logged in as</div>
                <div className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>{user.name}</div>
              </div>
              <button 
                id="btn-logout"
                onClick={handleLogout}
                className={`p-2 border rounded-xl transition-all cursor-pointer shadow-sm ${isDarkMode ? 'bg-[#15241c] border-[#253e2f] text-gray-400 hover:bg-rose-950/40 hover:text-rose-400 hover:border-rose-900' : 'bg-[#F4F8F6] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 border border-[#BDD1C6]/60 text-gray-500'}`}
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <div id="workspace-layout" className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Content View Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto p-4 md:p-6 lg:p-8">

          {/* NOT LOGGED IN AUTH PAGE */}
          {!user ? (
            !show2FAForm ? (
              <div id="auth-panel" className="max-w-md w-full mx-auto my-auto flex flex-col gap-6">
              
              <div className="flex flex-col items-center text-center">
                <Logo shieldSize={52} withText={true} className="mb-2" />
                <p className="text-xs text-[#004F2D]/70 font-semibold italic mt-1">
                  {t.slogan}
                </p>
              </div>

              {/* Roles selected switch tabs */}
              <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl border transition-colors duration-200 ${isDarkMode ? 'bg-[#132219] border-[#253e2f]' : 'bg-[#E1EDE6] border-[#BDD1C6]/60'}`}>
                <button 
                  type="button"
                  onClick={() => { setRole('patient'); setAuthMode('login'); }}
                  className={`py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${role === 'patient' ? (isDarkMode ? 'bg-[#D4AF37] text-white shadow-sm' : 'bg-[#004F2D] text-white shadow-sm') : (isDarkMode ? 'text-gray-400 hover:text-white bg-transparent' : 'text-gray-600 hover:text-[#004F2D] bg-transparent')}`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Пациент' : 'Patient'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setRole('doctor'); setAuthMode('login'); }}
                  className={`py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 ${role === 'doctor' ? (isDarkMode ? 'bg-[#D4AF37] text-white shadow-sm' : 'bg-[#004F2D] text-white shadow-sm') : (isDarkMode ? 'text-gray-400 hover:text-white bg-transparent' : 'text-gray-600 hover:text-[#004F2D] bg-transparent')}`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Врач' : 'Fachtarzt'}
                </button>
              </div>

              {/* Login block card */}
              <div className={`border rounded-2xl p-6 shadow-sm relative overflow-hidden text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/70'}`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${isDarkMode ? 'from-[#D4AF37] to-emerald-600' : 'from-[#004F2D] to-[#D4AF37]'}`}></div>
                
                <h3 className={`text-xs font-mono uppercase tracking-widest font-black mb-1 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                  {role === 'doctor' ? t.roleDoctor : t.rolePatient}
                </h3>
                <p className={`text-xs mb-5 leading-relaxed font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {role === 'doctor' ? t.doctorLoginDesc : t.patientLoginDesc}
                </p>

                {authError && (
                  <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-200 mb-4 flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wide">{t.fullName}</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Maxim Ivanov" 
                        className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-600 shadow-inner' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400 shadow-inner'}`}
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wide">{t.email}</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patient@eurosecondopinion.com"
                      className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-600 shadow-inner' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400 shadow-inner'}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] uppercase font-bold text-gray-500 font-mono tracking-wide">{t.password}</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-600 shadow-inner' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400 shadow-inner'}`}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={authLoading}
                    className={`w-full py-3 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b5942b]' : 'bg-[#004F2D] hover:bg-[#003520]'}`}
                  >
                    <span>{authLoading ? 'Signing in...' : (authMode === 'login' ? t.login : t.register)}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>

                {authMode === 'login' && role === 'patient' && (
                  <div className={`mt-6 pt-4 border-t text-center ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                    <span className="text-xs text-gray-500">
                      {t.noAccount + ' '}
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('register'); setRole('patient'); }}
                        className={`hover:underline font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}
                      >
                        {t.register}
                      </button>
                    </span>
                  </div>
                )}

                {authMode === 'register' && (
                  <div className={`mt-6 pt-4 border-t text-center ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                    <span className="text-xs text-gray-500">
                      {lang === 'ru' ? 'Уже есть аккаунт? ' : 'Already have an account? '}
                      <button 
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className={`hover:underline font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}
                      >
                        {lang === 'ru' ? 'Войти' : 'Login'}
                      </button>
                    </span>
                  </div>
                )}
              </div>

              {/* Demo Helper Panel */}
              <div className={`border p-5 rounded-2xl shadow-sm text-center transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold block mb-2 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{t.quickDemo}</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => handleQuickLogin('doctor')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold transition-all shadow-sm cursor-pointer ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-400 hover:bg-[#1a2d21]' : 'bg-[#F4F8F6] hover:bg-[#E1EDE6] border-[#BDD1C6]/70 text-[#004F2D]'}`}
                  >
                    {lang === 'ru' ? 'Врач: Harrison' : 'Doctor'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleQuickLogin('patient')}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold transition-all shadow-sm cursor-pointer ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-400 hover:bg-[#1a2d21]' : 'bg-[#F4F8F6] hover:bg-[#E1EDE6] border-[#BDD1C6]/70 text-[#004F2D]'}`}
                  >
                    {lang === 'ru' ? 'Пациент: Ivanov' : 'Patient'}
                  </button>
                </div>
                <span className="text-[9px] text-gray-500 font-mono mt-2.5 block">Регистрационный пароль по умолчанию: 123456</span>
              </div>
            </div>
          ) : (
            <div className={`max-w-md w-full mx-auto my-auto border p-6 rounded-2xl shadow-sm space-y-4 text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b] text-white' : 'bg-white border-[#BDD1C6]/70'}`}>
                <div className="text-center font-mono">
                  <span className={`w-12 h-12 rounded-full border border-dashed flex items-center justify-center mx-auto text-lg font-bold ${isDarkMode ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-[#004F2D] text-[#004F2D]'}`}>2FA</span>
                  <h4 className={`text-xs uppercase tracking-widest font-black mt-3 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>Двухфакторная авторизация GDPR</h4>
                  <p className={`text-[10.5px] mt-1 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    На ваш защищённый адрес выслан временный одноразовый OTP-токен авторизации.
                  </p>
                </div>

                <div className={`p-3 rounded-xl border text-center font-mono text-[11px] space-y-1 ${isDarkMode ? 'bg-[#15241b] border-[#22392b] text-emerald-300' : 'bg-[#F4F8F6] border-[#BDD1C6]/70 text-[#004F2D]'}`}>
                  <span className="text-[9px] uppercase tracking-wider block text-gray-450">Временный токен авторизации (демо):</span>
                  <strong className="text-[#D4AF37] text-lg tracking-widest block font-extrabold">{otpSent}</strong>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-wider font-bold text-gray-400">Введите одноразовый проверочный код</label>
                  <input 
                    type="text"
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    placeholder="••••"
                    className={`border rounded-xl p-3 text-center text-xl font-mono tracking-widest focus:outline-none focus:border-[#D4AF37] shadow-inner ${isDarkMode ? 'bg-[#15241b] border-[#22392b] text-white' : 'bg-[#F8FAF9] border-[#BDD1C6] text-[#004F2D]'}`}
                  />
                </div>

                {otpError && (
                  <div className="text-[10px] bg-rose-950 text-rose-300 p-2 text-center rounded-xl border border-rose-900">
                    {otpError}
                  </div>
                )}

                <button 
                  onClick={handleVerify2FAToken}
                  className={`w-full py-3 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer text-center font-mono shadow-sm ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#00321c]'}`}
                >
                  Верифицировать DSGVO сессию
                </button>
              </div>
            )
          ) : (

              <div id="logged-dashboard" className="flex flex-col gap-6">

                {/* Secure Top Welcome Strip */}
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center border rounded-2xl p-5 md:p-6 gap-4 shadow-sm text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border rounded-full flex items-center justify-center transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border-[#253e2f]' : 'bg-[#F4F8F6] border-[#BDD1C6]/80'}`}>
                      <UserIcon className={`w-5 h-5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                    </div>
                    <div>
                      <span className={`text-[9px] tracking-wider uppercase font-mono font-extrabold block ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                        {user.role === 'admin' ? (lang === 'ru' ? 'Панель Медицинского Редактора' : 'Administrator Portal') : (user.role === 'doctor' ? t.doctorPortal : t.patientPortal)}
                      </span>
                      <h2 className={`text-xl md:text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>{user.name}</h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
                    <div className={`px-3 py-1.5 border rounded-xl text-[10px] font-mono font-bold flex items-center gap-2 transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-[#D4AF37]' : 'bg-[#F4F8F6] border-[#BDD1C6]/70 text-[#004F2D]'}`}>
                      <span className={`w-2.5 h-2.5 rounded-full animate-ping ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></span>
                      <span>ONLINE SSL SESSION ENCRYPTED</span>
                    </div>

                    {user.role !== 'admin' && (
                      <button 
                        onClick={() => startIntegratedCall(user.role, user.role === 'doctor' ? (caseName || 'Maxim Ivanov') : 'Dr. Sarah Harrison')}
                        className="px-4 py-1.5 bg-[#004F2D] hover:bg-[#003920] text-white font-extrabold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow"
                      >
                        <Video className="w-4 h-4 text-white" />
                        <span>{t.startVideoCall}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* VIDEO CALL PANEL OVERLAY */}
                {isInVideoCall && (
                  <div id="video-cabinet" className="bg-[#1A3025] border border-[#BDD1C6] rounded-2xl p-4 md:p-6 overflow-hidden flex flex-col gap-4 relative shadow-lg text-left">
                    <div className="absolute top-2 right-2 text-[10px] font-mono bg-[#004F2D] text-[#D4AF37] border border-[#BDD1C6]/40 px-2 py-0.5 rounded-lg uppercase font-bold">
                      LIVE TELEMEDICINE CONFERENCING
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Video className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-xs uppercase font-mono tracking-widest text-[#D4AF37] font-extrabold">
                        {t.videoConsultation}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative bg-[#050A07] rounded-xl aspect-video flex flex-col items-center justify-center overflow-hidden border border-[#BDD1C6]/30">
                        {cameraActive ? (
                          <div className="absolute inset-0 bg-gradient-to-tr from-[#02130b] to-emerald-950/20 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full border border-dashed border-[#D4AF37]/50 flex items-center justify-center animate-spin">
                              <Activity className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#050A07] absolute inset-0 flex items-center justify-center">
                            <VideoOff className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2.5 py-1 rounded text-[10px] font-mono text-[#D4AF37] border border-white/10">
                          {user.name} ({lang === 'ru' ? 'Вы' : 'Self'})
                        </div>
                      </div>

                      <div className="relative bg-[#050A07] rounded-xl aspect-video flex flex-col items-center justify-center overflow-hidden border border-[#BDD1C6]/30">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#050A07] to-emerald-950 flex items-center justify-center">
                          <div className="flex flex-col items-center gap-2">
                            <Stethoscope className="w-12 h-12 text-[#D4AF37] animate-bounce" />
                            <span className="text-[10px] font-mono text-gray-300">Secure AES-256 peer stream active</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/70 px-2.5 py-1 rounded text-[10px] font-mono text-white border border-white/10">
                          {videoPartner}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center bg-[#07130E] p-3 rounded-xl border border-[#BDD1C6]/35 gap-2">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setMicActive(!micActive)}
                          className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${micActive ? 'bg-[#1A3025] hover:bg-emerald-900 text-emerald-400' : 'bg-rose-950 text-rose-300'}`}
                        >
                          {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setCameraActive(!cameraActive)}
                          className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${cameraActive ? 'bg-[#1A3025] hover:bg-emerald-900 text-emerald-400' : 'bg-rose-950 text-rose-300'}`}
                        >
                          {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                        </button>
                        <div className="h-6 w-[1px] bg-[#1a2e1a]"></div>
                        <span className="text-[11px] font-mono font-medium text-gray-200">
                          {t.videoStatusActive} | <span className="text-[#D4AF37] font-bold">{formatTime(callDuration)}</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsInVideoCall(false)}
                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {t.endCall}
                      </button>
                    </div>

                    <div className="bg-black/85 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-[#22c55e]/90">
                      <span className="text-[9px] text-gray-500 uppercase font-black block mb-1">Live Audio Scribe</span>
                      {videoLog.length === 0 ? <p className="italic text-gray-500">Awaiting voice capture...</p> : videoLog.map((vl, i) => <div key={i}>{vl}</div>)}
                    </div>
                  </div>
                )}


                {/* ROLE WORKSPACES */}

                {/* --- 1. ADMIN DESK WORKSPACE --- */}
                {user.role === 'admin' && (
                  <AdminPortal lang={lang} onRefresh={fetchInitialContext} isDarkMode={isDarkMode} />
                )}

                {/* --- 2. DOCTOR WORKSPACE --- */}
                {user.role === 'doctor' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left PACS scan analysis panel (7 cols) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      
                      {/* Interactive PACS DICOM component */}
                      <DicomViewer 
                        patientName={caseName || 'Maxim Ivanov'} 
                        slicesCount={activeCase?.dicomSnaps?.[0]?.slices || 15} 
                        isDarkMode={isDarkMode}
                        lang={lang}
                      />

                      {/* Diagnostic constructor inputs (anamnesis, complaints, references) */}
                      <div className={`rounded-2xl p-5 md:p-6 shadow-sm text-left relative overflow-hidden border transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                        
                        <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                          <h3 className={`text-xs uppercase font-mono tracking-widest font-black ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                            {t.createOpinion}
                          </h3>
                          {activeSlaTimer && (
                            <span className="px-2.5 py-1 text-[10px] font-mono bg-amber-50 border border-amber-200 text-amber-800 rounded-lg uppercase animate-pulse font-bold">
                              {activeSlaTimer}
                            </span>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">{t.patientFio}</label>
                              <input 
                                type="text" 
                                required
                                value={caseName}
                                onChange={(e) => setCaseName(e.target.value)}
                                placeholder="Maxim Ivanov" 
                                className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-500 shadow-inner' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400 shadow-inner'}`}
                              />
                              
                              <div className="flex flex-wrap gap-1 mt-1.5 items-center">
                                <span className="text-[9px] text-gray-500 font-mono">Быстрый выбор:</span>
                                {patientList.map((p) => (
                                  <button 
                                    key={p.id}
                                    onClick={() => { setCaseName(p.name); setSelectedPatientId(p.id); }}
                                    className={`text-[9px] px-2 py-0.5 rounded-xl border transition-colors cursor-pointer font-bold shadow-sm ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-emerald-400 hover:bg-[#1a2d21]' : 'bg-[#F4F8F6] text-[#004F2D] hover:bg-[#E1EDE6] border border-[#BDD1C6]/70'}`}
                                  >
                                    {p.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">База литературы</label>
                              <select 
                                value={clinicalRefName}
                                onChange={(e) => setClinicalRefName(e.target.value)}
                                className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-155 ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37] [&>option]:bg-[#111e15] [&>option]:text-white' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D]'}`}
                              >
                                <option value="Müller's Cardiology Textbook, 5th Edition">Müller's Cardiology, 5th Edition</option>
                                <option value="European Ultrasound Guidelines V4">European Ultrasound Guidelines V4</option>
                                <option value="Harrison's Principles of Internal Medicine">Harrison's Internal Medicine</option>
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">{t.patientAnamnesis}</label>
                            <textarea 
                              rows={3}
                              value={anamnesis}
                              onChange={(e) => setAnamnesis(e.target.value)}
                              placeholder="Жалобы пациента..."
                              className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 font-mono shadow-inner ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-500' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400'}`}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">{t.ultrasoundResults}</label>
                            <textarea 
                              rows={2}
                              value={ultrasound}
                              onChange={(e) => setUltrasound(e.target.value)}
                              placeholder="ФВ ЛЖ 62%. Митральная регургитация 1 степени..."
                              className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 font-mono shadow-inner ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-500' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400'}`}
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-400 font-mono">{t.otherDetails}</label>
                            <input 
                              type="text"
                              value={otherInfo}
                              onChange={(e) => setOtherInfo(e.target.value)}
                              placeholder="Давление 135/85 мм рт. ст..."
                              className={`rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 shadow-inner ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37] placeholder-gray-500' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D] placeholder-gray-400'}`}
                            />
                          </div>

                          <button 
                            type="button"
                            onClick={handleGenerateAiConclusion}
                            disabled={aiLoading}
                            className={`w-full py-3 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#003820]'}`}
                          >
                            <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                            <span>{aiLoading ? t.generating : t.generateWithAi}</span>
                          </button>

                          {aiError && (
                            <div className="bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-200 font-bold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                              <span>{aiError}</span>
                            </div>
                          )}
                        </div>

                        {/* Editable GenAI report */}
                        {(aiReport || aiLoading) && (
                          <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                            {aiLoading ? (
                              <div className={`p-6 text-center text-xs font-mono rounded-xl border border-dashed transition-colors ${isDarkMode ? 'bg-[#15241c] border-[#253e2f] text-gray-400' : 'bg-[#F8FAF9] border-[#BDD1C6] text-gray-400'}`}>Synthesizing expert consultation materials...</div>
                            ) : (
                              <div className="space-y-4 text-left">
                                <span className={`text-[10px] font-mono uppercase font-extrabold block ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>Редактируемый текст заключения европейского профессора (Cyrillic PDF exportable):</span>
                                <textarea 
                                  rows={10}
                                  value={aiReport}
                                  onChange={(e) => setAiReport(e.target.value)}
                                  className={`w-full p-4 rounded-xl border font-mono text-xs focus:outline-none transition-colors duration-150 shadow-inner ${isDarkMode ? 'bg-[#15241c] border-[#22392b] text-white focus:border-[#D4AF37]' : 'bg-[#F4F8F6] text-[#1A3025] border border-[#BDD1C6] focus:border-[#004F2D]'}`}
                                />

                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <span className={`text-[10px] italic font-mono font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Citing database: {clinicalRefName}</span>
                                  <button 
                                    onClick={handleSaveConclusion}
                                    className={`py-2.5 px-5 text-white rounded-xl font-bold text-xs uppercase cursor-pointer transition-colors ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#003520]'}`}
                                  >
                                    {t.saveOpinion}
                                  </button>
                                </div>

                                {saveStatus && (
                                  <div className={`text-xs p-2.5 rounded-xl border text-center font-mono font-bold transition-colors ${isDarkMode ? 'bg-[#15242c] border-[#253e2f] text-emerald-400' : 'bg-[#F4F8F6] text-[#004F2D] border border-[#BDD1C6]'}`}>
                                    {saveStatus}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                    </div>

                    {/* Right queue lists directory & live chat (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      
                      {/* Active Case tracker chat log channel */}
                      {selectedCaseId ? (
                        <div className={`border rounded-2xl p-5 flex flex-col h-[340px] text-left relative overflow-hidden shadow-sm transition-all duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                          <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                          
                          <div className={`flex items-center gap-1.5 border-b pb-2 mb-3 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                            <MessageSquare className={`w-4.5 h-4.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                            <h3 className={`text-xs uppercase font-mono tracking-widest font-extrabold ${isDarkMode ? 'text-white' : 'text-[#004F2D]'}`}>
                              Защищённый клинический чат (GDPR)
                            </h3>
                          </div>

                          <div ref={chatContainerRef} className={`flex-1 overflow-y-auto space-y-2.5 p-2.5 rounded-xl border text-xs font-mono max-h-[180px] transition-colors duration-200 ${isDarkMode ? 'bg-[#15241c] border-[#253e2f]' : 'bg-[#F8FAF9] border-[#BDD1C6]/70'}`}>
                            {chatMessages.length === 0 ? (
                              <p className="text-gray-400 italic text-center text-[10px] py-6">Сообщений в архиве нет.</p>
                            ) : (
                              chatMessages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.senderRole === 'patient' ? 'items-start' : 'items-end'}`}>
                                  <span className="text-[9px] text-gray-500 font-bold">{m.senderName} ({m.senderRole})</span>
                                  <div className={`p-2 rounded-xl mt-0.5 max-w-[85%] leading-relaxed ${m.senderRole === 'patient' ? (isDarkMode ? 'bg-[#1b2f23] text-emerald-100 border border-[#233d2e]' : 'bg-[#E1EDE6] text-[#004F2D] text-left border border-[#BDD1C6]') : 'bg-[#004F2D] text-white text-right'}`}>
                                    {m.messageText}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handlePostChatMessage} className="flex gap-2 mt-3">
                            <input 
                              type="text"
                              required
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Задать вопрос..."
                              className={`flex-1 rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37]' : 'bg-[#F8FAF9] border border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D]'}`}
                            />
                            <button 
                              type="submit"
                              className={`p-2.5 text-white rounded-xl hover:bg-opacity-90 cursor-pointer shadow-sm transition-colors ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#003820]'}`}
                            >
                              <Send className="w-3.5 h-3.5 text-white" />
                            </button>
                          </form>
                        </div>
                      ) : null}

                      {/* Doctor case folder database lists */}
                      <div className={`border rounded-2xl p-5 text-left relative overflow-hidden shadow-sm transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                        
                        <h3 className={`text-xs font-mono uppercase tracking-widest font-black mb-3 flex items-center gap-1.5 border-b pb-2 ${isDarkMode ? 'text-[#D4AF37] border-[#22392b]' : 'text-[#004F2D] border-[#E1EDE6]'}`}>
                          <BookOpen className={`w-4 h-4 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                          Пациенты на разборе (SLA Queue)
                        </h3>

                        {cases.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No assigned cases found.</p>
                        ) : (
                          <div className="space-y-2 max-h-[220px] overflow-y-auto">
                            {cases.map((c) => (
                              <div 
                                key={c.id}
                                onClick={() => { setSelectedCaseId(c.id); setCaseName(c.patientName); setAnamnesis(c.anamnesis); }}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCaseId === c.id ? (isDarkMode ? 'border-[#D4AF37] bg-[#1a2e22] ring-2 ring-[#D4AF37]/10' : 'border-[#004F2D] bg-[#F4F8F6]/60 ring-2 ring-[#004F2D]/10') : (isDarkMode ? 'border-[#22392b] bg-[#101b15] hover:bg-[#1a2e21]' : 'border-[#BDD1C6]/60 bg-white hover:bg-[#F4F8F6]/30')}`}
                              >
                                <div className="flex justify-between items-center column">
                                  <strong className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>{c.patientName}</strong>
                                  <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${c.status === 'in_progress' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#004F2D]'}`}>
                                    {c.status}
                                  </span>
                                </div>
                                <span className={`text-[10px] font-mono block mt-1.5 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Dir: {c.direction} | Создан: {c.dateCreated}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

                {/* --- 3. PATIENT WORKSPACE --- */}
                {user.role === 'patient' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left main workspace column (8 cols) */}
                    <div className="lg:col-span-8 flex flex-col gap-6 text-left">
                      
                      {/* Interactive Case Creation Button */}
                      <div className={`border p-4.5 rounded-2xl flex justify-between items-center shadow-sm relative overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                        <div className={`absolute top-0 left-0 bottom-0 w-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                        <div className="pl-3">
                          <h3 className={`text-xs uppercase font-mono tracking-widest font-extrabold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                            Телемедицинский аудит (Европа)
                          </h3>
                          <p className={`text-[11px] mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Хотите заказать новое экспертное заключение у европейского профессора?</p>
                        </div>
                        <button 
                          onClick={() => setShowWizard(!showWizard)}
                          className={`py-2 px-4.5 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b89626]' : 'bg-[#004F2D] hover:bg-[#003520]'}`}
                        >
                          <PlusCircle className="w-4 h-4 text-white" />
                          <span>{showWizard ? 'Скрыть Анкету' : 'Новый Кейс'}</span>
                        </button>
                      </div>

                      {/* Case Wizard overlay */}
                      {showWizard && (
                        <CaseWizard 
                          userId={user.id} 
                          userName={user.name} 
                          lang={lang} 
                          isDarkMode={isDarkMode}
                          onSuccess={() => { setShowWizard(false); fetchInitialContext(); }} 
                        />
                      )}

                      {/* CASE ACTIVE TRACKER STATUS BAR */}
                      {cases.length > 0 && selectedCaseId && (
                        <div className={`border rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                          <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                          
                          <div className={`flex justify-between items-center text-xs font-mono border-b pb-2 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                            <span className="text-gray-500 font-bold">ACTIVE CASE AUDIT ID: <b className={`font-mono ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{selectedCaseId}</b></span>
                            <span className={`font-extrabold uppercase ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{activeCase?.direction} Case</span>
                          </div>

                          {/* Horizontal interactive stepper status lines */}
                          <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-mono font-bold tracking-wider relative pt-2">
                            
                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono mb-2 font-bold ${
                                activeCase?.status ? 'bg-[#004F2D] border-[#004F2D] text-white shadow-sm' : (isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-450' : 'bg-gray-100 border-gray-300 text-gray-400')
                              }`}>1</span>
                              <span className={`uppercase font-bold ${isDarkMode ? 'text-emerald-400' : 'text-[#004F2D]'}`}>Documents received</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono mb-2 font-bold ${
                                activeCase?.isPreScreened ? 'bg-[#004F2D] border-[#004F2D] text-white shadow-sm' : (isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-500' : 'bg-white border-gray-300 text-gray-400')
                              }`}>2</span>
                              <span className={activeCase?.isPreScreened ? (isDarkMode ? 'text-white font-bold' : 'text-[#004F2D] font-bold') : 'text-gray-400 font-medium'}>Under pre-screening</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono mb-2 font-bold ${
                                activeCase?.status === 'in_progress' || activeCase?.status === 'ready' ? 'bg-[#004F2D] border-[#004F2D] text-white shadow-sm' : (isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-500' : 'bg-white border-gray-300 text-gray-400')
                              }`}>3</span>
                              <span className={activeCase?.status === 'in_progress' || activeCase?.status === 'ready' ? (isDarkMode ? 'text-white font-bold' : 'text-[#004F2D] font-bold') : 'text-gray-400 font-medium'}>In progress with expert</span>
                            </div>

                            <div className="flex flex-col items-center">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono mb-2 font-bold ${
                                activeCase?.status === 'ready' ? 'bg-[#004F2D] border-[#004F2D] text-white shadow-sm' : (isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-gray-500' : 'bg-white border-gray-300 text-gray-400')
                              }`}>4</span>
                              <span className={activeCase?.status === 'ready' ? (isDarkMode ? 'text-white font-bold' : 'text-[#004F2D] font-bold') : 'text-gray-400 font-medium'}>Conclusion ready</span>
                            </div>

                          </div>
                        </div>
                      )}

                      {/* Past Medical conclusions lists */}
                      <div className={`border rounded-2xl p-5 md:p-6 shadow-sm text-left relative overflow-hidden transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                        
                        <div className={`flex items-center gap-2 border-b pb-4 mb-4 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                          <FileText className={`w-5 h-5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                          <h3 className={`text-sm uppercase tracking-widest font-black ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                            {t.myOpinions}
                          </h3>
                        </div>

                        {conclusions.length === 0 ? (
                          <div className={`p-8 text-center rounded-xl border border-dashed transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border-[#22392b]' : 'bg-[#F8FAF9] border-[#BDD1C6]'}`}>
                            <FileText className="w-8 h-8 text-gray-450 mx-auto mb-2" />
                            <p className="text-xs text-gray-400 italic max-w-md mx-auto font-mono">
                              {lang === 'ru' 
                                ? "Для вашего кабинета пока нет выписанных европейских вторых мнений. Вы можете создать кейс-анкету (кнопка 'Новый Кейс' выше) или переключить демо-роль на Врача и мгновенно выписать отчет по вашим томограммам." 
                                : "No second opinions compiled yet. Please check again later or switch role to Doctor to write a report for yourself."
                              }
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            {conclusions.map((con) => (
                              <div key={con.id} className={`rounded-xl border overflow-hidden shadow-sm relative transition-colors duration-200 ${isDarkMode ? 'bg-[#15241b] border-[#22392b]' : 'bg-white border-[#BDD1C6]'}`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                                
                                <div className={`p-4 border-b flex justify-between items-center text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#1a2d21] border-[#22392b]' : 'bg-[#F4F8F6] border-[#E1EDE6]'}`}>
                                  <div className="pl-2">
                                    <span className={`text-[8.5px] font-mono uppercase tracking-wider block font-black ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>Authorized Specialist Conclusion</span>
                                    <span className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>{con.doctorName}</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[8.5px] font-mono text-gray-400 block font-bold">{t.date}</span>
                                    <span className={`text-xs font-mono font-black ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>{con.date}</span>
                                  </div>
                                </div>

                                <div className="p-4 md:p-5 space-y-4 text-xs md:text-sm">
                                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-xl border font-mono text-[11px] text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b] text-gray-300' : 'bg-[#F8FAF9] border-[#BDD1C6]/60 text-[#4B5E53]'}`}>
                                    <div>
                                      <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">Patient Name</span>
                                      <strong className={`font-bold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#1A3025]'}`}>{con.patientName}</strong>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 uppercase tracking-wider text-[9px] font-bold block">Anamnesis Analyzed</span>
                                      <span className={`line-clamp-1 italic font-medium ${isDarkMode ? 'text-[#E6F3EC]' : 'text-[#1A3025]'}`}>{con.anamnesis}</span>
                                    </div>
                                  </div>

                                  <div className={`leading-relaxed whitespace-pre-line font-mono text-[11.5px] p-4 rounded-xl border shadow-inner text-left max-h-72 overflow-y-auto transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b] text-white' : 'bg-[#F8FAF9] border-[#BDD1C6]/70 text-[#1A3025]'}`}>
                                    {con.reportText}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Right column specialist lookup pricing and live chat (4 cols) */}
                    <div className="lg:col-span-4 flex flex-col gap-6 text-left">
                      
                      {/* Active Patient Case Secure Live Chat Box */}
                      {selectedCaseId ? (
                        <div className={`border rounded-2xl p-5 flex flex-col h-[340px] relative overflow-hidden shadow-sm transition-all duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
                          <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>
                          
                          <div className={`flex items-center gap-1.5 border-b pb-2 mb-3 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                            <MessageSquare className={`w-4.5 h-4.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                            <h3 className={`text-xs uppercase font-mono tracking-widest font-extrabold ${isDarkMode ? 'text-white' : 'text-[#004F2D]'}`}>
                              Защищённый клинический чат (GDPR)
                            </h3>
                          </div>

                          <div ref={chatContainerRef} className={`flex-1 overflow-y-auto space-y-2.5 p-2.5 rounded-xl border text-xs font-mono max-h-[180px] transition-colors duration-200 ${isDarkMode ? 'bg-[#15241c] border-[#253e2f]' : 'bg-[#F8FAF9] border-[#BDD1C6]/70'}`}>
                            {chatMessages.length === 0 ? (
                              <p className="text-gray-400 italic text-center text-[10px] py-6">Сообщений в архиве нет. Задайте ваш первый вопрос врачу.</p>
                            ) : (
                              chatMessages.map(m => (
                                <div key={m.id} className={`flex flex-col ${m.senderRole === 'patient' ? 'items-end' : 'items-start'}`}>
                                  <span className="text-[9px] text-gray-500 font-bold">{m.senderName} ({m.senderRole})</span>
                                  <div className={`p-2 rounded-xl mt-0.5 max-w-[85%] leading-relaxed ${m.senderRole === 'patient' ? 'bg-[#004F2D] text-white text-right shadow-sm' : (isDarkMode ? 'bg-[#1b2f23] text-emerald-100 border border-[#233d2e]' : 'bg-[#E1EDE6] text-[#004F2D] text-left border border-[#BDD1C6]')}`}>
                                    {m.messageText}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <form onSubmit={handlePostChatMessage} className="flex gap-2 mt-3">
                            <input 
                              type="text"
                              required
                              value={chatInput}
                              onChange={(e) => setChatInput(e.target.value)}
                              placeholder="Написать ассистенту..."
                              className={`flex-1 rounded-xl p-2.5 text-xs focus:outline-none transition-colors duration-150 ${isDarkMode ? 'bg-[#15241c] border border-[#22392b] text-white focus:border-[#D4AF37]' : 'bg-[#F8FAF9] border-[#BDD1C6] text-[#1A3025] focus:border-[#004F2D]'}`}
                            />
                            <button 
                              type="submit"
                              className={`p-2.5 text-white rounded-xl hover:bg-opacity-90 cursor-pointer shadow-sm transition-colors ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#003820]'}`}
                            >
                              <Send className="w-3.5 h-3.5 text-white" />
                            </button>
                          </form>
                        </div>
                      ) : null}

                      {/* Specialist prices */}
                      <div className="bg-white border border-[#BDD1C6]/60 rounded-2xl p-5 text-left relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#004F2D]"></div>
                        
                        <h3 className="text-xs font-mono uppercase tracking-widest text-[#004F2D] font-extrabold mb-3 flex items-center gap-1.5 border-b border-[#E1EDE6] pb-2">
                          <Stethoscope className="w-4 h-4 text-[#D4AF37]" />
                          {t.pricingMenu}
                        </h3>

                        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                          {doctors.map((doc) => (
                            <div key={doc.id} className="p-3 bg-[#F8FAF9] rounded-xl border border-[#BDD1C6]/60 flex gap-3 shadow-sm">
                              <img 
                                src={doc.avatar} 
                                alt={doc.name} 
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-xl object-cover border border-[#BDD1C6] shrink-0 shadow-sm"
                              />
                              <div className="flex-1">
                                <h4 className="text-xs font-black text-[#1A3025]">{doc.name}</h4>
                                <p className="text-[9.5px] text-gray-500 font-medium font-mono mt-0.5">{lang === 'ru' ? doc.specialtyRU || doc.specialty : doc.specialty}</p>
                                
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {doc.languages.map((lngVal) => (
                                    <span key={lngVal} className="text-[8px] font-mono bg-[#E1EDE6] text-[#004F2D] border border-[#BDD1C6]/50 px-1.5 py-0.5 rounded-sm font-bold">
                                      {lngVal}
                                    </span>
                                  ))}
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E1EDE6]">
                                  <span className="text-[9px] text-[#004F2D]/70 font-mono italic font-bold">Audit fee:</span>
                                  <strong className="text-[#004F2D] text-xs font-black">€ {doc.price}</strong>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Book appointment slot */}
                      <div className="bg-white border border-[#BDD1C6]/60 rounded-2xl p-5 text-left relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-[#004F2D]"></div>
                        
                        <h3 className="text-xs font-mono uppercase tracking-widest text-[#004F2D] font-extrabold mb-3 flex items-center gap-1.5 border-b border-[#E1EDE6] pb-2">
                          <Clock className="w-4 h-4 text-[#D4AF37]" />
                          {t.bookAppointment}
                        </h3>

                        <form onSubmit={handleBookAppointment} className="space-y-3 font-mono">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500">{t.selectDoctor}</label>
                            <select 
                              value={selectedDoctorId}
                              onChange={(e) => setSelectedDoctorId(e.target.value)}
                              className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-2.5 text-xs text-[#1A3025] focus:outline-none focus:border-[#004F2D]"
                            >
                              {doctors.map((d) => (
                                <option key={d.id} value={d.id}>{d.name} (€{d.price})</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-gray-500">{t.chooseDate}</label>
                            <input 
                              type="date"
                              required
                              value={bookingDate}
                              onChange={(e) => setBookingDate(e.target.value)}
                              className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-2 text-xs text-[#1A3025] focus:outline-none"
                            />
                          </div>

                          <div className="flex flex-col gap-1 text-left">
                            <label className="text-[10px] uppercase font-bold text-gray-500">{t.chooseTime}</label>
                            <input 
                              type="time"
                              required
                              value={bookingTime}
                              onChange={(e) => setBookingTime(e.target.value)}
                              className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-2 text-xs text-[#1A3025] focus:outline-none"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full py-2.5 bg-[#004F2D] hover:bg-[#003820] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl cursor-pointer text-center shadow-sm"
                          >
                            {t.confirmBooking}
                          </button>
                        </form>

                        {bookingStatus && (
                          <div className="mt-3 bg-[#F4F8F6] text-[11px] text-[#004F2D] p-2.5 rounded-xl border border-[#BDD1C6] text-center font-mono font-bold shadow-inner">
                            {bookingStatus}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                )}

              </div>
            )}

        </main>
      </div>

      {/* Persistent Bottom status bar footer */}
      <footer id="app-footer" className="h-10 border-t border-[#BDD1C6]/50 bg-white flex flex-col sm:flex-row items-center justify-between px-4 md:px-6 text-[9.5px] font-mono tracking-widest text-[#4B5E53] uppercase shrink-0 gap-1 mt-auto font-bold">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[#004F2D]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#004F2D] animate-pulse"></span>
            EuroSecondOpinion Server Live
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">2FA & HIPAA Compliant Channels Active</span>
        </div>
        <div className="text-center sm:text-right text-[#4B5E53]/70">
          © 2026 EUROSECONDOPINION. DEPLOYMENT SYNC VERIFIED.
        </div>
      </footer>

    </div>
  );
}
