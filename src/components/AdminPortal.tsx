import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, BookOpen, UserCheck, Languages, CheckSquare, AlertCircle, FileText } from 'lucide-react';
import { MedicalCase, Doctor, LanguageCode } from '../types';

interface AdminPortalProps {
  lang: LanguageCode;
  onRefresh: () => void;
}

export default function AdminPortal({ lang, onRefresh }: AdminPortalProps) {
  const [cases, setCases] = useState<MedicalCase[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  
  // Controls
  const [assignedDocId, setAssignedDocId] = useState<string>('');
  const [preScreenNotes, setPreScreenNotes] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [actionStatus, setActionStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Get all cases
      const resC = await fetch('/api/cases?role=admin');
      if (resC.ok) {
        const cJson = await resC.json();
        setCases(cJson || []);
        if (cJson && cJson.length > 0) {
          setSelectedCaseId(cJson[0].id);
          setPreScreenNotes(cJson[0].preScreenNotes || 'Documents verified. MRI DICOM images confirmed readable.');
          setTranslatedText(cJson[0].autoTranslatedText || cJson[0].anamnesis || '');
        }
      }

      // Get all specialists list
      const resD = await fetch('/api/doctors');
      if (resD.ok) {
        const dJson = await resD.json();
        setDoctors(dJson || []);
        if (dJson && dJson.length > 0) {
          setAssignedDocId(dJson[0].id);
        }
      }
    } catch (e) {
      console.warn("Error fetching admin panel data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCase = (cItem: MedicalCase) => {
    setSelectedCaseId(cItem.id);
    setPreScreenNotes(cItem.preScreenNotes || 'Documents verified. MRI DICOM images confirmed readable.');
    setTranslatedText(cItem.autoTranslatedText || cItem.anamnesis || '');
  };

  const handlePreScreenAndRouteCase = async () => {
    if (!selectedCaseId) return;
    setActionStatus('Processing medical pre-screening routing...');

    const matchedDoc = doctors.find(d => d.id === assignedDocId);

    try {
      const dbUpdate = {
        status: 'in_progress',
        isPreScreened: true,
        preScreenNotes,
        autoTranslatedText: translatedText,
        assignedDoctorId: assignedDocId
      };

      const res = await fetch(`/api/cases/${selectedCaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbUpdate)
      });

      if (res.ok) {
        setActionStatus(`Case assigned successfully to expert ${matchedDoc?.name}!`);
        fetchAdminData();
        onRefresh();
        
        // Push welcome system chat message
        await fetch('/api/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            caseId: selectedCaseId,
            senderId: 'system',
            senderName: 'Medical Assessor Core',
            senderRole: 'system',
            messageText: `Медицинский асессор Prof. Karl Brandt проверил ваши материалы. Кейс назначен ведущему специалисту ${matchedDoc?.name} клиники. Статус обновлен на 'В работе'.`,
          })
         });

      } else {
        setActionStatus('Routing request failed.');
      }
    } catch (err) {
      setActionStatus('Database synchronization write error.');
    }
  };

  const currentCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="bg-white border border-[#BDD1C6]/60 rounded-xl p-5 md:p-6 shadow-sm relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#004F2D]"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E1EDE6] pb-4 mb-5">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-[#004F2D] block">
            EUROPEAN ADMINISTRATIVE DESK OF EUROSECONDOPINION
          </span>
          <h2 className="text-sm font-bold text-[#1A3025] uppercase font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
            <Shield className="w-4 h-4 text-[#004F2D]" />
            Medical Coordinator & Chief Assessor Workspace
          </h2>
        </div>
        <div className="text-[10.5px] font-mono text-gray-500 font-bold bg-[#F4F8F6] py-1 px-3 rounded-xl border border-[#BDD1C6]/50">
          User: Prof. Karl Brandt
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column Case Queue (4 cols) */}
        <div className="lg:col-span-4 bg-[#F8FAF9] rounded-xl p-4 border border-[#BDD1C6]/70 space-y-3">
          <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-extrabold border-b border-[#E1EDE6] pb-1">
            Arrived Consultation Queue
          </span>

          {loading ? (
            <div className="text-center text-xs text-gray-450 py-6 font-mono">Loading lists...</div>
          ) : cases.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic py-4">No cases currently submitted in queue.</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {cases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${selectedCaseId === c.id ? 'border-[#004F2D] bg-white ring-2 ring-[#004F2D]/10' : 'border-[#BDD1C6]/60 bg-white hover:bg-[#F4F8F6]/40'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-[#1A3025]">{c.patientName}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase ${c.status === 'received' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-[#004F2D]'}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-[9px] font-mono text-gray-500">
                    <span className="font-semibold text-[#004F2D]">Dir: {c.direction}</span>
                    <span>{c.dateCreated}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column detailed Workspace pre-screener translation and routing (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {currentCase ? (
            <div className="space-y-4">
              {/* Patient info details */}
              <div className="bg-white rounded-xl p-4 border border-[#BDD1C6]/70 space-y-3 shadow-sm">
                <div className="flex justify-between border-b border-[#E1EDE6] pb-2 text-[10.5px] font-mono text-gray-400">
                  <span>CASE ID: {currentCase.id}</span>
                  <span className="text-[#004F2D] font-bold">PRE-SCREEN STATUS: {currentCase.isPreScreened ? 'COMPLETED ✓' : 'AWAITING PRES_CHECK'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px]">Patient Name</span>
                    <strong className="text-[#1A3025]">{currentCase.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px]">Specialty Direction requested</span>
                    <strong className="text-[#004F2D] font-extrabold">{currentCase.direction}</strong>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <span className="text-gray-400 block uppercase text-[9px] font-mono font-bold">Original Cyrillic Anamnesis / Complaints</span>
                  <p className="bg-[#F8FAF9] p-3 rounded-xl text-gray-700 border border-[#BDD1C6]/40 font-mono text-[11px] leading-relaxed whitespace-pre-line">
                    {currentCase.anamnesis || 'No custom anamnesis specified.'}
                  </p>
                </div>

                {/* Attachments preview */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="p-2.5 bg-[#F8FAF9] rounded-xl border border-[#BDD1C6]/55">
                    <span className="text-[#4B5E53] uppercase text-[9px] font-black block mb-1">Cyrillic PDF Documents</span>
                    {(currentCase.documents || []).length === 0 ? (
                      <span className="text-gray-400 italic block">None</span>
                    ) : (
                      currentCase.documents.map((d, i) => <div key={i} className="text-[#004F2D] font-bold">📄 {d.name} ({d.size})</div>)
                    )}
                  </div>

                  <div className="p-2.5 bg-[#F8FAF9] rounded-xl border border-[#BDD1C6]/55">
                    <span className="text-[#4B5E53] uppercase text-[9px] font-black block mb-1">Scanner DICOM folders</span>
                    {(currentCase.dicomSnaps || []).length === 0 ? (
                      <span className="text-gray-400 italic block">None</span>
                    ) : (
                      currentCase.dicomSnaps.map((ds, i) => <div key={i} className="text-[#004F2D] font-bold">❖ {ds.name} [{ds.slices} slices]</div>)
                    )}
                  </div>
                </div>
              </div>

              {/* Translation translator engine */}
              <div className="bg-white border border-[#BDD1C6]/70 rounded-xl p-4 space-y-3 shadow-sm">
                <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-extrabold flex items-center gap-1.5">
                  <Languages className="w-4 h-4 text-[#D4AF37]" />
                  GDPR Autotranslation Engine & Medical Dictionary (Edit)
                </span>
                <p className="text-[9px] text-gray-500 italic font-medium">
                  Review and improve the Cyrillic input translation before it is routed to the corresponding specialist. This maintains SLA quality.
                </p>

                <textarea 
                  rows={3}
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className="w-full bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-3 text-xs text-[#1D3025] font-mono focus:outline-none focus:border-[#004F2D] shadow-inner"
                  placeholder="Review the translation..."
                />
              </div>

              {/* Coordinator dispatcher notes and Router trigger */}
              <div className="bg-white border border-[#BDD1C6]/70 rounded-xl p-4 space-y-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 border-b border-[#E1EDE6] pb-2">
                  <UserCheck className="w-4.5 h-4.5 text-[#004F2D]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#004F2D] font-extrabold font-mono">Coordinator Pre-Screening & Case Route Dispatcher</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-gray-550 font-mono font-black">Pre-screener verification remarks</label>
                    <input 
                      type="text"
                      className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-2.5 text-xs text-[#1D3025]"
                      value={preScreenNotes}
                      onChange={(e) => setPreScreenNotes(e.target.value)}
                      placeholder="Documents verified. DICOM scans checked."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase text-gray-550 font-mono font-black">Select physician profile to route</label>
                    <select 
                      value={assignedDocId}
                      onChange={(e) => setAssignedDocId(e.target.value)}
                      className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-2.5 text-xs text-[#1D3025] focus:outline-none focus:border-[#004F2D]"
                    >
                      {doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({lang === 'ru' ? d.specialtyRU || d.specialty : d.specialty})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={handlePreScreenAndRouteCase}
                  className="w-full py-3 bg-[#004F2D] hover:bg-[#003820] text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer text-center shadow"
                >
                  Verify, Translate & Route with SLA Tracker
                </button>

                {actionStatus && (
                  <div className="bg-[#F4F8F6] border border-[#BDD1C6] rounded-xl p-2.5 text-center font-mono text-[11px] text-[#004F2D] font-bold">
                    {actionStatus}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-dashed border-[#BDD1C6] rounded-xl text-gray-400 font-mono text-xs">
              Select an arrived case from the left queue queue list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
