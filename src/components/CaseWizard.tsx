import React, { useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, UploadCloud, Shield, CreditCard, ChevronRight, Activity, FileText, Check } from 'lucide-react';
import { LanguageCode } from '../types';

interface CaseWizardProps {
  userId: string;
  userName: string;
  lang: LanguageCode;
  onSuccess: () => void;
}

export default function CaseWizard({ userId, userName, lang, onSuccess }: CaseWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [direction, setDirection] = useState<string>('Cardiology');
  const [anamnesis, setAnamnesis] = useState<string>('');
  
  // Custom checklist of complaints based on direction
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; size: string; role: string }[]>([]);
  const [dicomSnaps, setDicomSnaps] = useState<{ name: string; size: string; slices: number }[]>([]);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    docsScanned: number;
    translationSuccess: boolean;
    hasWarning: boolean;
    warningsList: string[];
    structuredBrief: string;
  } | null>(null);

  const [aiParsing, setAiParsing] = useState<boolean>(false);
  const [disclaimerSigned, setDisclaimerSigned] = useState<boolean>(false);
  const [signatureText, setSignatureText] = useState<string>('');
  
  // Payment states
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 1264');
  const [cardHolder, setCardHolder] = useState<string>(userName.toUpperCase());
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCVV, setCardCVV] = useState<string>('392');
  const [paymentPaid, setPaymentPaid] = useState<boolean>(false);
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [networkError, setNetworkError] = useState<string>('');

  const directionsList = [
    { value: 'Cardiology', labelRU: 'Кардиология', labelEN: 'Cardiology', cost: 150, docHint: 'Кардио-МРТ, ЭКГ в покое и под нагрузкой, узи сердца' },
    { value: 'Neurology', labelRU: 'Неврология', labelEN: 'Neurology', cost: 180, docHint: 'МРТ/КТ головного мозга, шейного отдела позвоночника, ЭЭГ' },
    { value: 'Orthopedics', labelRU: 'Ортопедия и суставы', labelEN: 'Orthopedics & Joints', cost: 160, docHint: 'МРТ коленного/плечевого сустава, рентгенография' },
    { value: 'Regenerative', labelRU: 'Регенеративная медицина', labelEN: 'Regenerative Medicine', cost: 220, docHint: 'Предыдущие биопсии, иммунные листы, метаболические панели' }
  ];

  const currentDir = directionsList.find(d => d.value === direction) || directionsList[0];

  const complaintsDatabase: Record<string, string[]> = {
    Cardiology: ['Одышка при ходьбе', 'Учащенное сердцебиение', 'Боли за грудиной', 'Повышенное артериальное давление', 'Отеки ног'],
    Neurology: ['Сильные затылочные боли', 'Онемение пальцев конечностей', 'Головокружение и шум в ушах', 'Нарушения координации', 'Нарушение сна'],
    Orthopedics: ['Боли в коленном суставе', 'Ограничение подвижности плеча', 'Хруст в суставах при ходьбе', 'Отек сустава', 'Посттравматическая нестабильность'],
    Regenerative: ['Хроническая усталость', 'Снижение иммунного тонуса', 'Аутоиммунные воспаления', 'Возрастные дегенеративные изменения кожи/связок']
  };

  const handleToggleComplaint = (item: string) => {
    if (selectedComplaints.includes(item)) {
      setSelectedComplaints(selectedComplaints.filter(c => c !== item));
    } else {
      setSelectedComplaints([...selectedComplaints, item]);
    }
  };

  const simulateDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'dicom') => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files) as File[];
    
    if (type === 'pdf') {
      const added = files.map((f: File) => ({
        id: 'doc_' + Date.now() + Math.random(),
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        role: 'Epicrisis report file'
      }));
      setUploadedFiles([...uploadedFiles, ...added]);
    } else {
      // DICOM Scans
      const added = files.map((f: File) => ({
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
        slices: Math.floor(Math.random() * 15) + 10 // slice stack count
      }));
      setDicomSnaps([...dicomSnaps, ...added]);
    }
  };

  // Live automatic translation & medical documentation check simulation
  const handleTriggerAIEvaluate = () => {
    setAiParsing(true);
    setAiAnalysisResult(null);

    setTimeout(() => {
      const wList: string[] = [];
      
      // Look for checklist warnings or file shortages
      if (uploadedFiles.length === 0) {
        wList.push(lang === 'ru' ? 'Внимание: не найдено ни одного клинического заключения / эпикриза в PDF.' : 'Attention: No clinical summary / epicrisis report found in PDF format.');
      }
      if (dicomSnaps.length === 0) {
        wList.push(lang === 'ru' ? 'Внимание: отсутствует DICOM-архив МРТ/КТ исследований во вкладке DICOM.' : 'Attention: Missing DICOM raw scanner datasets for MRI/CT evaluations.');
      }
      if (direction === 'Cardiology' && !selectedComplaints.some(c => c.includes('Одышка') || c.includes('сердцебиение'))) {
        wList.push(lang === 'ru' ? 'Ортодоксальный протокол: просим указать детали кардиологической симптоматики для полноценного заключения.' : 'Clinical protocol check: Recommend selecting relevant cardiological symptoms.');
      }

      setAiAnalysisResult({
        docsScanned: uploadedFiles.length + dicomSnaps.length,
        translationSuccess: true,
        hasWarning: wList.length > 0,
        warningsList: wList,
        structuredBrief: lang === 'ru' 
          ? `[ИИ-Глоссарий]: Текст жалоб успешно переведен на немецкий и английский языки. Профильное направление распознано как ${direction}. Подтверждено присутствие DICOM слоев.`
          : `[AI Core Translation]: Cyrillic complaints auto-translated to German (Deutsches Format). Selected target profile: ${direction}. Verified scanner layer inputs.`
      });
      setAiParsing(false);
    }, 1500);
  };

  // Submit complete medical audit case with dummy payment processing
  const handleSubmitPaymentAndForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disclaimerSigned) {
      setNetworkError(lang === 'ru' ? 'Необходимо согласиться с условиями аудита!' : 'Please sign the second opinion disclaimer!');
      return;
    }
    if (!signatureText.trim()) {
      setNetworkError(lang === 'ru' ? 'Введите вашу личную подпись в поле!' : 'Please enter your cursive signature!');
      return;
    }

    setPaymentLoading(true);
    setNetworkError('');

    try {
      // Create Case on Express Server REST Endpoint!
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: userId,
          patientName: userName,
          direction,
          anamnesis: anamnesis || `Complaints selection checklist: ${selectedComplaints.join(', ')}`,
          complaintsChecklist: selectedComplaints,
          documents: uploadedFiles,
          dicomSnaps: dicomSnaps,
          pricePaid: currentDir.cost,
          requiresTranslation: true,
          sourceLanguage: 'ru',
          autoTranslatedText: aiAnalysisResult?.structuredBrief || `Symptom overview trans: Patient reports ${selectedComplaints.join('; ')}`,
          disclaimerSigned: true,
          signatureText
        })
      });

      if (!res.ok) {
        throw new Error('Could not submit case. Please verify routing tables.');
      }

      setPaymentPaid(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (err: any) {
      setNetworkError(err?.message || 'Express server database connection error.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="bg-white border border-[#BDD1C6]/60 rounded-xl p-5 md:p-6 shadow-sm relative overflow-hidden text-left">
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#004F2D]"></div>

      {/* Steps indicators tabs */}
      <div className="flex border-b border-[#E1EDE6] pb-4 mb-5 items-center justify-between text-[10px] font-mono tracking-wider font-bold text-gray-400">
        <span className={`uppercase ${step === 1 ? 'text-[#004F2D] font-extrabold' : ''}`}>Step 1: Specialty</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className={`uppercase ${step === 2 ? 'text-[#004F2D] font-extrabold' : ''}`}>Step 2: Anamnesis</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className={`uppercase ${step === 3 ? 'text-[#004F2D] font-extrabold' : ''}`}>Step 3: Verification</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className={`uppercase ${step === 4 ? 'text-[#004F2D] font-extrabold' : ''}`}>Step 4: Check-Out</span>
      </div>

      {/* STEP 1: SELECT SPECIALTY */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-left mb-3">
            <h3 className="text-xs uppercase font-mono tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              {lang === 'ru' ? 'Выберите медицинскую дисциплину' : 'Choose Medical Specialty Direction'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
              {lang === 'ru' ? 'Ваш кейс будет автоматически сопоставлен с ведущим профессором из этой клинической базы.' : 'Your clinical folder will be routed directly to the representative expert.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {directionsList.map((dirItem) => (
              <div 
                key={dirItem.value}
                onClick={() => setDirection(dirItem.value)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${direction === dirItem.value ? 'border-[#004F2D] bg-[#F4F8F6] ring-1 ring-[#004F2D]' : 'border-[#BDD1C6]/70 bg-white hover:bg-[#F4F8F6]/30'}`}
              >
                <div>
                  <h4 className="text-xs font-bold text-[#1A3025] uppercase font-mono tracking-wide">{lang === 'ru' ? dirItem.labelRU : dirItem.labelEN}</h4>
                  <span className="text-[9px] text-gray-500 font-mono block mt-1">Рекомендуемый пакет: {dirItem.docHint}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#E1EDE6]">
                  <span className="text-[10px] text-[#004F2D]/60 font-mono italic">Expert rate:</span>
                  <strong className="text-sm text-[#004F2D] font-black">€ {dirItem.cost}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3">
            <button 
              type="button" 
              onClick={() => setStep(2)}
              className="py-2.5 px-5 bg-[#004F2D] text-white hover:bg-[#003820] font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>{lang === 'ru' ? 'Продолжить' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ANAMNESIS & COMPLAINTS SUMMARY */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="text-left mb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              {lang === 'ru' ? 'Жалобы и история заболевания' : 'Anamnesis & Structured Questionnaire'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
              {lang === 'ru' ? 'Укажите текущие симптомы для автоматического перевода на рабочий язык куратора.' : 'Specify symptoms to be auto-translated to German / English.'}
            </p>
          </div>

          <div className="bg-[#F4F8F6] p-4 rounded-xl border border-[#BDD1C6]/70 space-y-3">
            <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-black">
              {lang === 'ru' ? 'Быстрый опросник по вашей жалобе' : 'Symptom Audit Checklist'}
            </span>

            <div className="flex flex-wrap gap-2">
              {complaintsDatabase[direction]?.map((item) => (
                <button 
                  key={item}
                  type="button"
                  onClick={() => handleToggleComplaint(item)}
                  className={`py-1.5 px-3 rounded-full text-[10px] font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                    selectedComplaints.includes(item) 
                    ? 'border-[#004F2D] bg-[#004F2D]/10 text-[#004F2D] font-bold' 
                    : 'border-[#BDD1C6] bg-white text-gray-500 hover:text-gray-800 shadow-sm'
                  }`}
                >
                  {selectedComplaints.includes(item) && <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>}
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-500 font-mono">
              {lang === 'ru' ? 'Расширенное описание (Анамнез жизни)' : 'Extensive Clinical History'}
            </label>
            <textarea 
              rows={4}
              value={anamnesis}
              onChange={(e) => setAnamnesis(e.target.value)}
              placeholder={lang === 'ru' ? "Опишите своими словами клиническую хронику, жалобы, принимаемые медикаменты..." : "Provide comprehensive clinical notes, previous evaluations, or relevant symptoms in your language..."}
              className="bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-3 text-xs text-[#1D3025] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#004F2D]/20 focus:border-[#004F2D] resize-y font-mono leading-relaxed"
            />
          </div>

          <div className="flex justify-between pt-3">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="py-2.5 px-4 bg-white border border-[#BDD1C6] hover:bg-[#F4F8F6] text-gray-650 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
            >
              {lang === 'ru' ? 'Назад' : 'Back'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(3)}
              className="py-2.5 px-5 bg-[#004F2D] text-white hover:bg-[#003820] font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>{lang === 'ru' ? 'Продолжить' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MEDICAL ATTACHMENTS & DICOM VALIDATOR */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="text-left mb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              {lang === 'ru' ? 'Прикрепление документов и DICOM' : 'Attachment Uploads & DICOM Validation'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
              {lang === 'ru' ? 'Загрузите МРТ/КТ снимки для интерактивного анализа на PACS станции эксперта.' : 'Upload heavy MRI/CT scanner files in .dcm format.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard clinical docs uploader */}
            <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#BDD1C6]/70 space-y-3 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-bold">
                  {lang === 'ru' ? '1. Выписки и эпикризы (PDF)' : '1. Clinical Reports (PDF/Docs)'}
                </span>
                <p className="text-[9px] text-gray-500 italic mt-0.5">Предельный размер до 30 MB.</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-1.5 p-2 bg-white rounded border border-[#BDD1C6]/60 text-[10px] font-mono">
                  {uploadedFiles.map(f => (
                    <div key={f.id} className="flex justify-between text-gray-700">
                      <span className="truncate max-w-[140px] text-[#004F2D] font-bold">✓ {f.name}</span>
                      <span className="text-gray-500">{f.size}</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="border border-dashed border-[#BDD1C6] p-4 rounded-xl text-center cursor-pointer hover:border-[#004F2D] bg-white transition-colors block shadow-sm">
                <input 
                  type="file" 
                  multiple 
                  accept=".pdf" 
                  className="hidden" 
                  onChange={(e) => simulateDocUpload(e, 'pdf')} 
                />
                <UploadCloud className="w-6 h-6 text-[#004F2D] mx-auto mb-1" />
                <span className="text-[10px] text-gray-500 block">{lang === 'ru' ? 'Кликните для выбора PDF' : 'Select Epicrisis PDF File'}</span>
              </label>
            </div>

            {/* Heavy scan files directory uploader */}
            <div className="p-4 bg-[#F8FAF9] rounded-xl border border-[#BDD1C6]/70 space-y-3 flex flex-col justify-between shadow-sm">
              <div>
                <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-bold">
                  {lang === 'ru' ? '2. PACS-DICOM Снимки (.DCM/ZIP)' : '2. DICOM Scan Stacks (.DCM/ZIP)'}
                </span>
                <p className="text-[9px] text-gray-500 italic mt-0.5">МРТ/КТ порезы, снимки костей / сосудов.</p>
              </div>

              {dicomSnaps.length > 0 && (
                <div className="space-y-1.5 p-2 bg-white rounded border border-[#BDD1C6]/60 text-[10px] font-mono">
                  {dicomSnaps.map((f, i) => (
                    <div key={i} className="flex justify-between text-[#004F2D] font-bold">
                      <span className="truncate max-w-[140px]">✓ {f.name}</span>
                      <span className="text-gray-500">[{f.slices} slices, {f.size}]</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="border border-dashed border-[#BDD1C6] p-4 rounded-xl text-center cursor-pointer hover:border-[#004F2D] bg-white transition-colors block shadow-sm">
                <input 
                  type="file" 
                  multiple 
                  accept=".dcm,.zip" 
                  className="hidden" 
                  onChange={(e) => simulateDocUpload(e, 'dicom')} 
                />
                <UploadCloud className="w-6 h-6 text-[#004F2D] mx-auto mb-1" />
                <span className="text-[10px] text-gray-500 block">{lang === 'ru' ? 'Загрузить МРТ/КТ снимки (DICOM)' : 'Select DICOM Raw File'}</span>
              </label>
            </div>
          </div>

          {/* Evaluate trigger block with AI validation */}
          <div className="border border-[#BDD1C6]/60 bg-[#F4F8F6] rounded-xl p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-gray-500 font-mono font-bold">PRE-SCREENING VERIFY CHECK</span>
              <button 
                type="button" 
                onClick={handleTriggerAIEvaluate}
                disabled={aiParsing}
                className="py-1 px-3 bg-[#004F2D] hover:bg-[#003820] text-white text-[9px] font-bold font-mono tracking-widest uppercase rounded-lg cursor-pointer transition-all shadow-sm"
              >
                {aiParsing ? 'Validating integrity...' : 'Verify Files Integrity'}
              </button>
            </div>

            {aiAnalysisResult ? (
              <div className="space-y-2 pt-2 border-t border-[#E1EDE6]">
                <div className="flex gap-2 items-center text-[10px] text-gray-800 font-bold">
                  {aiAnalysisResult.hasWarning ? (
                    <AlertTriangle className="w-4 h-4 text-[#D4AF37]" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-[#004F2D]" />
                  )}
                  <span>
                    {lang === 'ru' 
                      ? `Изучено файлов: ${aiAnalysisResult.docsScanned}.` 
                       : `Scanned attachments: ${aiAnalysisResult.docsScanned}.`
                    }
                  </span>
                </div>

                {aiAnalysisResult.hasWarning && (
                  <div className="bg-amber-100 text-amber-900 text-[10px] p-2.5 rounded-xl border border-amber-200 font-mono space-y-1">
                    {aiAnalysisResult.warningsList.map((w, idx) => (
                      <div key={idx}>• {w}</div>
                    ))}
                  </div>
                )}
                <div className="bg-white text-[10px] text-[#004F2D] p-2.5 rounded-xl border border-[#BDD1C6]/70 font-mono font-semibold">
                  {aiAnalysisResult.structuredBrief}
                </div>
              </div>
            ) : (
              <p className="text-[9px] text-[#4B5E53] italic">Нажмите кнопку верификации выше для автоматического ИИ-листа проверки документов и перевода.</p>
            )}
          </div>

          <div className="flex justify-between pt-3">
            <button 
              type="button" 
              onClick={() => setStep(2)}
              className="py-2.5 px-4 bg-white border border-[#BDD1C6] hover:bg-[#F4F8F6] text-gray-655 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
            >
              {lang === 'ru' ? 'Назад' : 'Back'}
            </button>
            <button 
              type="button" 
              onClick={() => setStep(4)}
              className="py-2.5 px-5 bg-[#004F2D] text-white hover:bg-[#003820] font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <span>{lang === 'ru' ? 'Продолжить' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: MOCK MERCHANT Stripe CHECKOUT & DISCLAIMER */}
      {step === 4 && (
        <form onSubmit={handleSubmitPaymentAndForm} className="space-y-4">
          <div className="text-left mb-2">
            <h3 className="text-xs uppercase font-mono tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
              {lang === 'ru' ? 'Раздел Оплаты и Юридического Согласия' : 'Billing & Legal Informed Consent'}
            </h3>
            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
              {lang === 'ru' ? 'Для проведения консилиума требуется подписание дисклеймера телемедицинского аудита.' : 'Submit credit card elements and sign standard medical disclaimers.'}
            </p>
          </div>

          <div className="bg-[#F4F8F6] border border-[#BDD1C6]/70 p-5 rounded-xl space-y-4 shadow-sm relative overflow-hidden">
            <span className="absolute top-2 right-2 text-[8px] font-mono text-[#004F2D] bg-white border border-[#BDD1C6] px-2 py-0.5 rounded font-bold uppercase">SECURED STRIPE PORTAL</span>
            
            <span className="text-[10px] font-mono text-[#004F2D] uppercase tracking-wider block font-black">
              {lang === 'ru' ? 'Кредитная карта аудита (Simulated)' : 'Card Payment Session'}
            </span>

            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase text-gray-500 font-mono font-bold">Card Number</label>
                <div className="relative">
                  <input 
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-[#BDD1C6] rounded-xl p-3 text-xs text-[#1A3025] uppercase font-mono tracking-widest focus:outline-none focus:border-[#004F2D] shadow-sm"
                  />
                  <CreditCard className="w-4 h-4 text-[#004F2D] absolute right-3 top-3 animate-pulse" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-gray-500 font-mono font-bold">Expiry Date</label>
                  <input 
                    type="text"
                    required
                    maxLength={5}
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-white border border-[#BDD1C6] rounded-xl p-3 text-xs text-[#1A3025] font-mono focus:outline-none focus:border-[#004F2D] shadow-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase text-gray-500 font-mono font-bold">CVC Code</label>
                  <input 
                    type="password"
                    required
                    maxLength={3}
                    placeholder="CVC"
                    value={cardCVV}
                    onChange={(e) => setCardCVV(e.target.value)}
                    className="w-full bg-white border border-[#BDD1C6] rounded-xl p-3 text-xs text-[#1A3025] font-mono focus:outline-none focus:border-[#004F2D] shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Legal disclaimer signature pad */}
          <div className="bg-white border border-[#BDD1C6]/70 p-4 rounded-xl space-y-3 shadow-sm">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#004F2D] font-bold flex items-center gap-1.5 border-b border-[#E1EDE6] pb-2">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              {lang === 'ru' ? 'ИНФОРМИРОВАННОЕ СОГЛАСИЕ' : 'INFORMED AUDIT CONSENT'}
            </h4>
            <p className="text-[9px] text-[#4B5E53] leading-relaxed font-mono whitespace-pre-line bg-[#F8FAF9] p-3 rounded-xl border border-[#BDD1C6]/70 max-h-24 overflow-y-auto">
              {lang === 'ru' 
                ? 'Я понимаю и подтверждаю, что заказываю услугу экспертного Второго медицинского мнения (clinical medical audit), которая основывается исключительно на предоставленных мной анамнестических выписках и МРТ/КТ томограммах. Данный аудит носит рекомендательный характер, не заменяет необходимость очной консультации и первичного клинического осмотра европейскими лечащими врачами.'
                : 'I hereby acknowledge that I am requesting an expert Medical Second Opinion (clinical audit) based solely on the historical medical reports and scan stack images I have attached. I understand this report does not present therapeutic diagnostic guidance or establish a physical treatment plan.'
              }
            </p>

            <div className="flex items-start gap-2.5 pt-1">
              <input 
                id="disclaimer-check"
                type="checkbox"
                required
                className="w-4 h-4 cursor-pointer text-[#004F2D] rounded border-[#BDD1C6] focus:ring-[#004F2D] bg-white mt-0.5 accent-[#004F2D]"
                checked={disclaimerSigned}
                onChange={(e) => setDisclaimerSigned(e.target.checked)}
              />
              <label htmlFor="disclaimer-check" className="text-[10px] text-gray-655 font-semibold cursor-pointer leading-normal select-none">
                {lang === 'ru' ? 'Да, я согласен с условиями медицинского аудита, правилами защиты конфиденциальности DSGVO / GDPR.' : 'I accept terms and acknowledge other details under gdpr privacy rules.'}
              </label>
            </div>

            <div className="flex flex-col gap-1 pt-1 text-left">
              <label className="text-[9px] uppercase text-gray-500 font-mono font-bold italic">
                {lang === 'ru' ? 'Введите ФИО для цифровой подписи (согласие)' : 'Type your signature to certify informed audit consent'}
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="Maxim Ivanov"
                  value={signatureText}
                  onChange={(e) => setSignatureText(e.target.value)}
                  className="w-full bg-[#F8FAF9] border border-[#BDD1C6] rounded-xl p-3 text-sm text-[#004F2D] font-serif italic tracking-wide font-semibold focus:outline-none focus:border-[#004F2D] placeholder-gray-400 shadow-sm"
                />
                {signatureText && (
                  <span className="absolute right-3 top-3 text-[10px] font-mono text-[#004F2D] font-bold">
                    Signed ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {networkError && (
            <div className="bg-rose-50 text-rose-800 text-[10px] p-3 rounded-xl border border-rose-200">
              {networkError}
            </div>
          )}

          {paymentPaid ? (
            <div className="bg-[#F4F8F6] border border-[#004F2D] p-5 rounded-xl text-center font-mono text-xs text-[#004F2D] shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#004F2D] text-white flex items-center justify-center mx-auto mb-2 font-bold select-none shadow">✓</div>
              <strong className="block text-sm uppercase">Оплата проведена успешно!</strong>
              <span className="text-[11px] text-[#4B5E53] mt-1 block">Кейс передан медицинскому асессору для назначения экспертам.</span>
            </div>
          ) : (
            <div className="flex justify-between pt-3 items-center">
              <button 
                type="button" 
                onClick={() => setStep(3)}
                className="py-2.5 px-4 bg-white border border-[#BDD1C6] hover:bg-[#F4F8F6] text-gray-600 rounded-xl text-xs uppercase cursor-pointer transition-colors shadow-sm"
              >
                {lang === 'ru' ? 'Назад' : 'Back'}
              </button>

              <button 
                type="submit"
                disabled={paymentLoading}
                className="py-3 px-6 bg-[#004F2D] text-white font-bold uppercase tracking-widest text-[#103010] text-[#004F2D] rounded-xl bg-[#004F2D] hover:bg-[#003820] disabled:bg-gray-200 disabled:text-gray-400 transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span className="text-white font-bold">{paymentLoading ? 'Booking gateway...' : `${lang === 'ru' ? 'Подтвердить и Оплатить' : 'Process Checkout'} ( ${currentDir.cost} €)`}</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

        </form>
      )}

    </div>
  );
}
