import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, BookOpen, UserCheck, Languages, CheckSquare, AlertCircle, FileText } from 'lucide-react';
import { MedicalCase, Doctor, LanguageCode } from '../types';

interface AdminPortalProps {
  lang: LanguageCode;
  onRefresh: () => void;
  isDarkMode?: boolean;
}

const adminTranslations: Record<LanguageCode, {
  adminDesk: string;
  assessorWorkspace: string;
  userLabel: string;
  queueLabel: string;
  loading: string;
  noCases: string;
  caseId: string;
  preScreenStatus: string;
  completed: string;
  awaiting: string;
  patientName: string;
  direction: string;
  originalAnamnesis: string;
  noAnamnesis: string;
  cyrillicPdfs: string;
  none: string;
  dicomSlices: string;
  gdprEngine: string;
  reviewDesc: string;
  reviewPlaceholder: string;
  dispatcherHeader: string;
  remarksLabel: string;
  selectPhysician: string;
  routeButton: string;
  selectPrompt: string;
}> = {
  en: {
    adminDesk: "EUROPEAN ADMINISTRATIVE DESK OF EUROSECONDOPINION",
    assessorWorkspace: "Medical Coordinator & Chief Assessor Workspace",
    userLabel: "User: Prof. Karl Brandt",
    queueLabel: "Arrived Consultation Queue",
    loading: "Loading lists...",
    noCases: "No cases currently submitted in queue.",
    caseId: "CASE ID",
    preScreenStatus: "PRE-SCREEN STATUS",
    completed: "COMPLETED ✓",
    awaiting: "AWAITING PRES_CHECK",
    patientName: "Patient Name",
    direction: "Specialty Direction requested",
    originalAnamnesis: "Original Cyrillic Anamnesis / Complaints",
    noAnamnesis: "No custom anamnesis specified.",
    cyrillicPdfs: "Cyrillic PDF Documents",
    none: "None",
    dicomSlices: "Scanner DICOM folders",
    gdprEngine: "GDPR Autotranslation Engine & Medical Dictionary",
    reviewDesc: "Review and improve the Cyrillic input translation before it is routed to the corresponding specialist. This maintains SLA quality.",
    reviewPlaceholder: "Review the translation...",
    dispatcherHeader: "Coordinator Pre-Screening & Case Route Dispatcher",
    remarksLabel: "Pre-screener verification remarks",
    selectPhysician: "Select physician profile to route",
    routeButton: "Verify, Translate & Route with SLA Tracker",
    selectPrompt: "Select an arrived case from the left queue list."
  },
  de: {
    adminDesk: "EUROPÄISCHES VERWALTUNGSBÜRO VON EUROSECONDOPINION",
    assessorWorkspace: "Arbeitsbereich für medizinische Koordinatoren und Hauptgutachter",
    userLabel: "Benutzer: Prof. Karl Brandt",
    queueLabel: "Eingegangene Konsultationswarteschlange",
    loading: "Listen werden geladen...",
    noCases: "Derzeit befinden sich keine Fälle in der Warteschlange.",
    caseId: "FALL-ID",
    preScreenStatus: "VORPRÜFUNGSSTATUS",
    completed: "ABGESCHLOSSEN ✓",
    awaiting: "WARTET AUF PRÜFUNG",
    patientName: "Patientenname",
    direction: "Angeforderte Fachrichtung",
    originalAnamnesis: "Originale kyrillische Anamnese / Beschwerden",
    noAnamnesis: "Keine benutzerdefinierte Anamnese angegeben.",
    cyrillicPdfs: "Kyrillische PDF-Dokumente",
    none: "Keine",
    dicomSlices: "Scanner-DICOM-Ordner",
    gdprEngine: "DSGVO-Autotranslation-Engine und medizinisches Wörterbuch",
    reviewDesc: "Überprüfen und verbessern Sie die kyrillische Übersetzung, bevor sie an den entsprechenden Spezialisten weitergeleitet wird. Dies sichert die SLA-Qualität.",
    reviewPlaceholder: "Übersetzung überprüfen...",
    dispatcherHeader: "Koordinator-Vorprüfung und Fallrouten-Dispatcher",
    remarksLabel: "Bemerkungen zur Vorprüfung",
    selectPhysician: "Wählen Sie ein Arztprofil aus",
    routeButton: "Überprüfen, übersetzen und weiterleiten",
    selectPrompt: "Wählen Sie einen eingegangenen Fall aus der linken Liste aus."
  },
  fr: {
    adminDesk: "BUREAU ADMINISTRATIF EUROPÉEN DE EUROSECONDOPINION",
    assessorWorkspace: "Espace de travail du coordinateur médical et de l'assesseur en chef",
    userLabel: "Utilisateur : Prof. Karl Brandt",
    queueLabel: "File d'attente des consultations reçues",
    loading: "Chargement des listes...",
    noCases: "Aucun cas actuellement soumis dans la file d'attente.",
    caseId: "ID DU CAS",
    preScreenStatus: "STATUT DE LA PRÉ-ÉVALUATION",
    completed: "COMPLÉTÉ ✓",
    awaiting: "EN ATTENTE DE VÉRIFICATION",
    patientName: "Nom du patient",
    direction: "Spécialité demandée",
    originalAnamnesis: "Anamnative cyrillique originale / Plaintes",
    noAnamnesis: "Aucune anamnèse personnalisée spécifiée.",
    cyrillicPdfs: "Documents PDF cyrilliques",
    none: "Aucun",
    dicomSlices: "Dossiers scanners DICOM",
    gdprEngine: "Moteur de traduction automatique RGPD et dictionnaire médical",
    reviewDesc: "Examinez et améliorez la traduction de l'anamnèse en cyrillique avant qu'elle ne soit transmise au spécialiste correspondant. Cela maintient la qualité du service (SLA).",
    reviewPlaceholder: "Examiner la traduction...",
    dispatcherHeader: "Pré-évaluation du coordinateur et répartiteur de cas",
    remarksLabel: "Remarques de vérification de pré-évaluation",
    selectPhysician: "Sélectionner le profil du médecin à attribuer",
    routeButton: "Vérifier, traduire et acheminer avec suivi SLA",
    selectPrompt: "Sélectionnez un cas arrivé dans la file d'attente à gauche."
  },
  it: {
    adminDesk: "UFFICIO AMMINISTRATIVO EUROPEO DI EUROSECONDOPINION",
    assessorWorkspace: "Area di lavoro del coordinatore medico e del valutatore capo",
    userLabel: "Utente: Prof. Karl Brandt",
    queueLabel: "Coda delle consultazioni ricevute",
    loading: "Caricamento in corso...",
    noCases: "Nessun caso attualmente presente nella coda.",
    caseId: "ID CASO",
    preScreenStatus: "STATO PRE-VALUTAZIONE",
    completed: "COMPLETATO ✓",
    awaiting: "IN ATTESA DI VERIFICA",
    patientName: "Nome Paziente",
    direction: "Specializzazione richiesta",
    originalAnamnesis: "Anamnesi originale in cirillico / Reclami",
    noAnamnesis: "Nessuna anamnesi personalizzata specificata.",
    cyrillicPdfs: "Documenti PDF in cirillico",
    none: "Nessuno",
    dicomSlices: "Cartelle DICOM dello scanner",
    gdprEngine: "Motore di traduzione automatica GDPR e dizionario medico",
    reviewDesc: "Verifica e migliora la traduzione cirillica prima che venga inviata allo specialista. Ciò garantisce la qualità del servizio (SLA).",
    reviewPlaceholder: "Rivedi la traduzione...",
    dispatcherHeader: "Pre-valutazione coordinatore e smistamento casi",
    remarksLabel: "Osservazioni del coordinatore",
    selectPhysician: "Seleziona il profilo medico a cui assegnare",
    routeButton: "Verifica, traduci e assegna il caso",
    selectPrompt: "Seleziona un caso presente nella coda a sinistra."
  },
  es: {
    adminDesk: "OFICINA ADMINISTRATIVA EUROPEA DE EUROSECONDOPINION",
    assessorWorkspace: "Área de trabajo del coordinador médico y del asesor principal",
    userLabel: "Usuario: Prof. Karl Brandt",
    queueLabel: "Cola de consultas recibidas",
    loading: "Cargando listas...",
    noCases: "No hay casos presentados en la cola.",
    caseId: "ID DEL CASO",
    preScreenStatus: "ESTADO DE PRE-EVALUACIÓN",
    completed: "COMPLETADO ✓",
    awaiting: "ESPERANDO VERIFICACIÓN",
    patientName: "Nombre del Paciente",
    direction: "Especialidad solicitada",
    originalAnamnesis: "Anamnesis original en cirílico / Quejas",
    noAnamnesis: "No se especificó ninguna anamnesis.",
    cyrillicPdfs: "Documentos PDF en cirílico",
    none: "Ninguno",
    dicomSlices: "Carpetas DICOM de escáner",
    gdprEngine: "Motor de traducción automática GDPR y dictionnaire médico",
    reviewDesc: "Revise y mejore la traducción en cirílico antes de enviarla al especialista correspondiente. Esto mantiene la calidad del servicio (SLA).",
    reviewPlaceholder: "Revisar la traducción...",
    dispatcherHeader: "Pre-evaluación del coordinador y despacho del caso",
    remarksLabel: "Observaciones del coordinador",
    selectPhysician: "Seleccione el perfil médico para asignar",
    routeButton: "Verificar, traducir y despachar con SLA",
    selectPrompt: "Seleccione un caso de la cola izquierda."
  },
  ru: {
    adminDesk: "ЕВРОПЕЙСКИЙ АДМИНИСТРАТИВНЫЙ ОТДЕЛ EUROSECONDOPINION",
    assessorWorkspace: "Рабочее место медицинского координатора и главного асессора",
    userLabel: "Пользователь: Проф. Карл Брандт",
    queueLabel: "Очередь поступивших обращений",
    loading: "Загрузка списков...",
    noCases: "В очереди нет активных обращений.",
    caseId: "ИД КЕЙСА",
    preScreenStatus: "СТАТУС ПРЕ-СКРИНИНГА",
    completed: "ЗАВЕРШЕН ✓",
    awaiting: "ОЖИДАЕТ ПРОВЕРКИ",
    patientName: "ФИО Пациента",
    direction: "Запрошенное медицинское направление",
    originalAnamnesis: "Оригинальный анамнез на кириллице / Жалобы",
    noAnamnesis: "Анамнез не указан.",
    cyrillicPdfs: "Файлы документов (PDF/исследования на кириллице)",
    none: "Нет",
    dicomSlices: "Слои сканирования DICOM",
    gdprEngine: "GDPR Модуль автоперевода и медицинских терминов",
    reviewDesc: "Проверьте и скорректируйте качество перевода жалоб на кириллице перед назначением ведущему специалисту клиники. Это гарантирует SLA.",
    reviewPlaceholder: "Отредактируйте перевод здесь...",
    dispatcherHeader: "Панель координации, пре-скрининга и диспетчеризации кейса",
    remarksLabel: "Примечания верификации координатора",
    selectPhysician: "Выберите профиль европейского специалиста для маршрутизации",
    routeButton: "Верифицировать, перевести и направить специалисту (SLA Tracker)",
    selectPrompt: "Выберите поступивший кейс из списка очереди слева."
  }
};

export default function AdminPortal({ lang, onRefresh, isDarkMode = false }: AdminPortalProps) {
  const t = adminTranslations[lang] || adminTranslations['en'];
  
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
    <div className={`border rounded-xl p-5 md:p-6 shadow-sm relative overflow-hidden text-left transition-colors duration-200 ${isDarkMode ? 'bg-[#101b15] border-[#22392b]' : 'bg-white border-[#BDD1C6]/60'}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${isDarkMode ? 'bg-[#D4AF37]' : 'bg-[#004F2D]'}`}></div>

      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 mb-5 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
        <div>
          <span className={`text-[10px] uppercase font-mono tracking-wider font-extrabold block ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
            {t.adminDesk}
          </span>
          <h2 className={`text-sm font-bold uppercase font-mono tracking-tight flex items-center gap-1.5 mt-0.5 ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>
            <Shield className={`w-4 h-4 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
            {t.assessorWorkspace}
          </h2>
        </div>
        <div className={`text-[10.5px] font-mono font-bold py-1 px-3 rounded-xl border ${isDarkMode ? 'bg-[#15241b] border-[#253e2f] text-[#D4AF37]' : 'bg-[#F4F8F6] border-[#BDD1C6]/50 text-gray-500'}`}>
          {t.userLabel}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column Case Queue (4 cols) */}
        <div className={`rounded-xl p-4 border space-y-3 ${isDarkMode ? 'bg-[#15241b] border-[#22392b]' : 'bg-[#F8FAF9] border-[#BDD1C6]/70'}`}>
          <span className={`text-[10px] font-mono uppercase tracking-wider block font-extrabold border-b pb-1 ${isDarkMode ? 'text-[#D4AF37] border-emerald-900/40' : 'text-[#004F2D] border-[#E1EDE6]'}`}>
            {t.queueLabel}
          </span>

          {loading ? (
            <div className="text-center text-xs text-gray-450 py-6 font-mono">{t.loading}</div>
          ) : cases.length === 0 ? (
            <p className="text-[10px] text-gray-400 italic py-4">{t.noCases}</p>
          ) : (
            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {cases.map((c) => (
                <div 
                  key={c.id}
                  onClick={() => handleSelectCase(c)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCaseId === c.id 
                      ? (isDarkMode ? 'border-[#D4AF37] bg-[#1a2e22] ring-2 ring-[#D4AF37]/10' : 'border-[#004F2D] bg-white ring-2 ring-[#004F2D]/10') 
                      : (isDarkMode ? 'border-[#253e2f] bg-[#101b15] hover:bg-[#1a2e21]' : 'border-[#BDD1C6]/60 bg-white hover:bg-[#F4F8F6]/40')
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-[#1A3025]'}`}>{c.patientName}</span>
                    <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase ${c.status === 'received' ? 'bg-amber-100 text-amber-800' : (isDarkMode ? 'bg-[#004F2D] text-emerald-300' : 'bg-emerald-100 text-[#004F2D]')}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center mt-2 text-[9px] font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className={`font-semibold ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>Dir: {c.direction}</span>
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
              <div className={`rounded-xl p-4 border space-y-3 shadow-sm ${isDarkMode ? 'bg-[#15241c] border-[#22392b]' : 'bg-white border-[#BDD1C6]/70'}`}>
                <div className={`flex justify-between pb-2 text-[10.5px] font-mono border-b ${isDarkMode ? 'border-[#22392b] text-gray-500' : 'border-[#E1EDE6] text-gray-400'}`}>
                  <span>{t.caseId}: {currentCase.id}</span>
                  <span className={`${isDarkMode ? 'text-emerald-400' : 'text-[#004F2D]'} font-bold`}>{t.preScreenStatus}: {currentCase.isPreScreened ? t.completed : t.awaiting}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px]">{t.patientName}</span>
                    <strong className={isDarkMode ? 'text-white' : 'text-[#1A3025]'}>{currentCase.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase text-[9px]">{t.direction}</span>
                    <strong className={isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D] font-extrabold'}>{currentCase.direction}</strong>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <span className="text-gray-400 block uppercase text-[9px] font-mono font-bold">{t.originalAnamnesis}</span>
                  <p className={`p-3 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-line border ${isDarkMode ? 'bg-[#111e15] text-gray-300 border-[#22392b]' : 'bg-[#F8FAF9] text-gray-700 border-[#BDD1C6]/40'}`}>
                    {currentCase.anamnesis || t.noAnamnesis}
                  </p>
                </div>

                {/* Attachments preview */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#111e15] border-[#22392b]' : 'bg-[#F8FAF9] border-[#BDD1C6]/55'}`}>
                    <span className={`uppercase text-[9px] font-black block mb-1 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#4B5E53]'}`}>{t.cyrillicPdfs}</span>
                    {(currentCase.documents || []).length === 0 ? (
                      <span className="text-gray-400 italic block">{t.none}</span>
                    ) : (
                      currentCase.documents.map((d, i) => <div key={i} className={isDarkMode ? 'text-emerald-400 font-bold' : 'text-[#004F2D] font-bold'}>📄 {d.name} ({d.size})</div>)
                    )}
                  </div>

                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-[#111e15] border-[#22392b]' : 'bg-[#F8FAF9] border-[#BDD1C6]/55'}`}>
                    <span className={`uppercase text-[9px] font-black block mb-1 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#4B5E53]'}`}>{t.dicomSlices}</span>
                    {(currentCase.dicomSnaps || []).length === 0 ? (
                      <span className="text-gray-400 italic block">{t.none}</span>
                    ) : (
                      currentCase.dicomSnaps.map((ds, i) => <div key={i} className={isDarkMode ? 'text-emerald-400 font-bold' : 'text-[#004F2D] font-bold'}>❖ {ds.name} [{ds.slices} slices]</div>)
                    )}
                  </div>
                </div>
              </div>

              {/* Translation translator engine */}
              <div className={`border rounded-xl p-4 space-y-3 shadow-sm ${isDarkMode ? 'bg-[#15241c] border-[#22392b]' : 'bg-white border-[#BDD1C6]/70'}`}>
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-extrabold flex items-center gap-1.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`}>
                  <Languages className="w-4 h-4 text-[#D4AF37]" />
                  {t.gdprEngine}
                </span>
                <p className="text-[9px] text-gray-500 italic font-medium">
                  {t.reviewDesc}
                </p>

                <textarea 
                  rows={3}
                  value={translatedText}
                  onChange={(e) => setTranslatedText(e.target.value)}
                  className={`w-full border rounded-xl p-3 text-xs font-mono focus:outline-none shadow-inner ${isDarkMode ? 'bg-[#111e15] border-[#22392b] text-white focus:border-[#D4AF37]' : 'bg-[#F8FAF9] border-[#BDD1C6] text-[#1D3025] focus:border-[#004F2D]'}`}
                  placeholder={t.reviewPlaceholder}
                />
              </div>

              {/* Coordinator dispatcher notes and Router trigger */}
              <div className={`border rounded-xl p-4 space-y-4 shadow-sm ${isDarkMode ? 'bg-[#15241c] border-[#22392b]' : 'bg-white border-[#BDD1C6]/70'}`}>
                <div className={`flex items-center gap-1.5 mb-1 border-b pb-2 ${isDarkMode ? 'border-[#22392b]' : 'border-[#E1EDE6]'}`}>
                  <UserCheck className={`w-4.5 h-4.5 ${isDarkMode ? 'text-[#D4AF37]' : 'text-[#004F2D]'}`} />
                  <span className={`text-[10px] uppercase tracking-widest font-extrabold font-mono ${isDarkMode ? 'text-white' : 'text-[#004F2D]'}`}>{t.dispatcherHeader}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono font-black text-gray-400">{t.remarksLabel}</label>
                    <input 
                      type="text"
                      className={`border rounded-xl p-2.5 text-xs focus:outline-none ${isDarkMode ? 'bg-[#111e15] border-[#22392b] text-white focus:border-[#D4AF37]' : 'bg-[#F8FAF9] border-[#BDD1C6] text-[#1D3025] focus:border-[#004F2D]'}`}
                      value={preScreenNotes}
                      onChange={(e) => setPreScreenNotes(e.target.value)}
                      placeholder="Documents verified. DICOM scans checked."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] uppercase font-mono font-black text-gray-400">{t.selectPhysician}</label>
                    <select 
                      value={assignedDocId}
                      onChange={(e) => setAssignedDocId(e.target.value)}
                      className={`border rounded-xl p-2.5 text-xs focus:outline-none ${isDarkMode ? 'bg-[#111e15] border-[#22392b] text-white focus:border-[#D4AF37] [&>option]:bg-[#111e15] [&>option]:text-white' : 'bg-[#F8FAF9] border-[#BDD1C6] text-[#1D3025] focus:border-[#004F2D]'}`}
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
                  className={`w-full py-3 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all cursor-pointer text-center shadow ${isDarkMode ? 'bg-[#D4AF37] hover:bg-[#b0912c]' : 'bg-[#004F2D] hover:bg-[#003820]'}`}
                >
                  {t.routeButton}
                </button>

                {actionStatus && (
                  <div className={`border rounded-xl p-2.5 text-center font-mono text-[11px] font-bold ${isDarkMode ? 'bg-[#111f16] border-[#22392b] text-emerald-400' : 'bg-[#F4F8F6] border-[#BDD1C6] text-[#004F2D]'}`}>
                    {actionStatus}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={`p-8 text-center border border-dashed rounded-xl font-mono text-xs ${isDarkMode ? 'bg-[#15241b] border-[#22392b] text-gray-500' : 'bg-white border-[#BDD1C6] text-gray-400'}`}>
              {t.selectPrompt}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
