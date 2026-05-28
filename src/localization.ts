/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageCode } from './types';

export const translations: Record<LanguageCode, {
  brand: string;
  slogan: string;
  roleSelect: string;
  roleDoctor: string;
  rolePatient: string;
  doctorLoginDesc: string;
  patientLoginDesc: string;
  email: string;
  password: string;
  fullName: string;
  login: string;
  register: string;
  noAccount: string;
  haveAccount: string;
  logout: string;
  quickDemo: string;
  
  // Doctor Panel
  doctorPortal: string;
  patientsList: string;
  createOpinion: string;
  patientFio: string;
  patientAnamnesis: string;
  ultrasoundResults: string;
  otherDetails: string;
  generateWithAi: string;
  generating: string;
  manualOverride: string;
  clinicalLiteratureRef: string;
  referenceNotes: string;
  saveOpinion: string;
  reportsHistory: string;
  date: string;
  noPatientsYet: string;
  noReportsYet: string;
  aiReportTemplateHeader: string;
  recommendedTreatment: string;

  // Patient Panel
  patientPortal: string;
  myInfo: string;
  myOpinions: string;
  pricingMenu: string;
  bookAppointment: string;
  selectDoctor: string;
  chooseDate: string;
  chooseTime: string;
  confirmBooking: string;
  myAppointments: string;
  pricePerConsultation: string;
  statusScheduled: string;
  statusCompleted: string;

  // Video Call
  videoConsultation: string;
  startVideoCall: string;
  joinRoom: string;
  endCall: string;
  videoStatusActive: string;
  muteMic: string;
  unmuteMic: string;
  cameraOff: string;
  cameraOn: string;
  connecting: string;
  simulatedTranscript: string;
  liveFeedback: string;
  liveAIAssist: string;
  languageSelect: string;
  backToDashboard: string;
}> = {
  en: {
    brand: "EuroSecondOpinion",
    slogan: "Expert online second medical opinions from leading European specialists",
    roleSelect: "How would you like to access the portal?",
    roleDoctor: "Login as Specialist Doctor",
    rolePatient: "Login as Patient",
    doctorLoginDesc: "Access diagnostic workflows, AI consultation synthesizers, and video appointments.",
    patientLoginDesc: "View your medical conclusions, schedule video calls, and consult with matching specialists.",
    email: "Email Address",
    password: "Password",
    fullName: "Full Name (First and Last name)",
    login: "Sign In",
    register: "Create Account",
    noAccount: "Don't have an account? Sign up as a patient below",
    haveAccount: "Already have an account? Log in and check details",
    logout: "Sign Out",
    quickDemo: "Demo Quick Access",

    doctorPortal: "Doctor Specialist Dashboard",
    patientsList: "Patient Directory",
    createOpinion: "Synthesize Medical Second Opinion",
    patientFio: "Patient Full Name",
    patientAnamnesis: "Anamnesis & Medical History",
    ultrasoundResults: "Diagnostic Ultrasound (US/UZI) Results",
    otherDetails: "Other Lab Reports / Clinical Findings",
    generateWithAi: "Generate Expert Second Opinion (Gemini AI)",
    generating: "Analyzing inputs and cross-referencing clinical books via Gemini Pro...",
    manualOverride: "You can modify and finalize the report below before saving:",
    clinicalLiteratureRef: "Clinical References & Diagnostic Rationale",
    referenceNotes: "References standard textbooks: Müller's Cardiology, European Ultrasound Guidelines V4.",
    saveOpinion: "Register & Save Consultation Report",
    reportsHistory: "Generated Medical Opinion Archive",
    date: "Date Issued",
    noPatientsYet: "No registered patients found. Register or create demo files.",
    noReportsYet: "No clinical reports compiled yet.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - SECOND OPINION",
    recommendedTreatment: "Recommended Action Plan & Therapy",

    patientPortal: "Patient Consultation Health Desk",
    myInfo: "Personal Medical Details",
    myOpinions: "My Expert Medical Opinions",
    pricingMenu: "European Clinic Specialties & Pricing",
    bookAppointment: "Schedule Consult Room Appointment",
    selectDoctor: "Choose Medical Specialist",
    chooseDate: "Preferred Booking Date",
    chooseTime: "Select Tele-Consult Time",
    confirmBooking: "Schedule Slot & Create Room",
    myAppointments: "My Scheduled Appointments",
    pricePerConsultation: "Standard Second Opinion Rate",
    statusScheduled: "Confirmed Stream Active",
    statusCompleted: "Archived & Concluded",

    videoConsultation: "Secure Tele-Consult Room",
    startVideoCall: "Initialize Secure Tele-Conference",
    joinRoom: "Join Consult Video Room",
    endCall: "Terminate Connection",
    videoStatusActive: "Live Secure Medical Channel Connected",
    muteMic: "Mute Microphone",
    unmuteMic: "Enable Audio",
    cameraOff: "On-camera Stream Paused",
    cameraOn: "Enable Webcam",
    connecting: "Establishing end-to-end encrypted medical connection...",
    simulatedTranscript: "Live Transcription Panel (Auto-translation Engaged)",
    liveFeedback: "Simulated stream. Use toggle controls to test microphone and video streams.",
    liveAIAssist: "Real-time AI Copilot Assist: Analyzing consultation pointers...",
    languageSelect: "Select Country/Language",
    backToDashboard: "Return to Main Dashboard"
  },
  de: {
    brand: "EuroSecondOpinion",
    slogan: "Kompetente medizinische Zweitmeinungen von führenden europäischen Spezialisten",
    roleSelect: "Wie möchten Sie auf das Portal zugreifen?",
    roleDoctor: "Anmeldung als Facharzt",
    rolePatient: "Anmeldung als Patient",
    doctorLoginDesc: "Zugriff auf diagnostische Abläufe, KI-Konsultations-Synthesizer und Videotermine.",
    patientLoginDesc: "Sehen Sie Ihre medizinischen Befunde ein, buchen Sie Videoanrufe und konsultieren Sie Spezialisten.",
    email: "E-Mail-Adresse",
    password: "Passwort",
    fullName: "Vollständiger Name",
    login: "Einloggen",
    register: "Konto erstellen",
    noAccount: "Kein Konto? Als Patient registrieren",
    haveAccount: "Bereits ein Konto? Einloggen",
    logout: "Abmelden",
    quickDemo: "Schnellzugriff für die Demo",

    doctorPortal: "Facharzt-Dashboard",
    patientsList: "Patientenverzeichnis",
    createOpinion: "Medizinische Zweitmeinung synthetisieren",
    patientFio: "Vollständiger Name des Patienten",
    patientAnamnesis: "Anamnese & Krankengeschichte",
    ultrasoundResults: "Diagnostische Ultraschallbefunde (Sonographie/US)",
    otherDetails: "Sonstige Laborberichte / klinische Befunde",
    generateWithAi: "Zweitmeinung generieren (Gemini AI)",
    generating: "Analysiere Eingaben und vergleiche mit klinischen Lehrbüchern via Gemini Pro...",
    manualOverride: "Sie können den Bericht vor dem Speichern anpassen:",
    clinicalLiteratureRef: "Klinische Referenzen & Diagnostische Rationale",
    referenceNotes: "Referenziert Standard-Lehrbücher: Müllers Kardiologie, Europäische Ultraschallrichtlinien V4.",
    saveOpinion: "Konsultationsbericht registrieren & speichern",
    reportsHistory: "Archiv der generierten Zweitmeinungen",
    date: "Ausstellungsdatum",
    noPatientsYet: "Keine Patienten registriert. Erstellen Sie Demodatensätze.",
    noReportsYet: "Noch keine klinischen Berichte erstellt.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - ZWEITMEINUNG",
    recommendedTreatment: "Empfohlener Aktionsplan & Therapie",

    patientPortal: "Gesundheitsschalter für Patienten",
    myInfo: "Persönliche medizinische Details",
    myOpinions: "Meine Experten-Zweitmeinungen",
    pricingMenu: "Medizinische Fachrichtungen & Preise",
    bookAppointment: "Tele-Zweitmeinungstermin buchen",
    selectDoctor: "Facharzt auswählen",
    chooseDate: "Bevorzugtes Buchungsdatum",
    chooseTime: "Konsultationszeit wählen",
    confirmBooking: "Termin reservieren & Raum erstellen",
    myAppointments: "Meine gebuchten Termine",
    pricePerConsultation: "Standard-Zweitmeinungsgebühr",
    statusScheduled: "Zugesagte Verbindung aktiv",
    statusCompleted: "Archiviert & abgeschlossen",

    videoConsultation: "Sicherer Videokonsultationsraum",
    startVideoCall: "Sichere Videokonferenz starten",
    joinRoom: "Videoraum beitreten",
    endCall: "Verbindung trennen",
    videoStatusActive: "Live-Medizinischer Kanal verschlüsselt verbunden",
    muteMic: "Stummschalten",
    unmuteMic: "Audio aktivieren",
    cameraOff: "Kamerabild pausiert",
    cameraOn: "Kamera aktivieren",
    connecting: "Sichere Ende-zu-Ende verschlüsselte Verbindung wird aufgebaut...",
    simulatedTranscript: "Live-Transkription (Automatische Übersetzung aktiv)",
    liveFeedback: "Simulierter Video-Stream. Nutzen Sie die Schalter, um Kamera und Mikrofon zu testen.",
    liveAIAssist: "Echtzeit-KI-Modul: Analysiere aktuelle Gesprächspunkte...",
    languageSelect: "Land/Sprache wählen",
    backToDashboard: "Zurück zum Dashboard"
  },
  fr: {
    brand: "EuroSecondOpinion",
    slogan: "Deuxièmes avis médicaux d'experts par de grands spécialistes européens",
    roleSelect: "Comment souhaitez-vous accéder au portail ?",
    roleDoctor: "Connexion en tant que Médecin Spécialiste",
    rolePatient: "Connexion en tant que Patient",
    doctorLoginDesc: "Accédez aux outils de diagnostic, à la synthèse de rapports médicaux par IA et aux appels vidéo.",
    patientLoginDesc: "Consultez vos rapports médicaux, planifiez des téléconsultations et discutez avec des experts.",
    email: "Adresse Email",
    password: "Mot de passe",
    fullName: "Nom complet du patient",
    login: "Se connecter",
    register: "Créer un compte",
    noAccount: "Pas de compte ? S'enregistrer comme patient",
    haveAccount: "Déjà membre ? Se connecter",
    logout: "Se déconnecter",
    quickDemo: "Accès Rapide Démo",

    doctorPortal: "Tableau de bord Médecin Spécialiste",
    patientsList: "Répertoire des Patients",
    createOpinion: "Synthétiser un second avis médical",
    patientFio: "Nom complet du patient",
    patientAnamnesis: "Anamnèse et antécédents médicaux",
    ultrasoundResults: "Résultats de l'échographie diagnostique (U.S.)",
    otherDetails: "Autres rapports de laboratoire ou examens",
    generateWithAi: "Générer le second avis (IA Gemini)",
    generating: "Analyse des données et recoupement de la littérature clinique via Gemini Pro...",
    manualOverride: "Vous pouvez modifier et finaliser le rapport ci-dessous avant de l'enregistrer :",
    clinicalLiteratureRef: "Références cliniques et fondements diagnostiques",
    referenceNotes: "Se réfère aux manuels standards: Cardiologie de Müller, Directives européennes d'échographie V4.",
    saveOpinion: "Enregistrer et publier le rapport",
    reportsHistory: "Archive des seconds avis générés",
    date: "Date de délivrance",
    noPatientsYet: "Aucun patient enregistré. Créez des profils de démonstration.",
    noReportsYet: "Aucun rapport clinique n'a encore été compilé.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - SECOND AVIS",
    recommendedTreatment: "Plan d'action thérapeutique recommandé",

    patientPortal: "Espace Santé Personnalisé du Patient",
    myInfo: "Données médicales personnelles",
    myOpinions: "Mes seconds avis d'experts",
    pricingMenu: "Tarifs des spécialistes européens",
    bookAppointment: "Prendre un rendez-vous en ligne",
    selectDoctor: "Choisir un médecin spécialiste",
    chooseDate: "Date souhaitée",
    chooseTime: "Heure de la téléconsultation",
    confirmBooking: "Confirmer le rendez-vous & Créer la salle",
    myAppointments: "Mes rendez-vous planifiés",
    pricePerConsultation: "Tarf standard pour un second avis",
    statusScheduled: "Téléconsultation confirmée",
    statusCompleted: "Archivé et clôturé",

    videoConsultation: "Salle de téléconsultation sécurisée",
    startVideoCall: "Initialiser l'appel vidéo sécurisé",
    joinRoom: "Rejoindre la salle de consultation",
    endCall: "Terminer la télétransmission",
    videoStatusActive: "Canal médical en direct sécurisé",
    muteMic: "Couper le micro",
    unmuteMic: "Activer le micro",
    cameraOff: "Caméra désactivée",
    cameraOn: "Activer la caméra",
    connecting: "Connexion sécurisée en cours de cryptage de bout en bout...",
    simulatedTranscript: "Transcription instantanée (Traduction automatique activée)",
    liveFeedback: "Simulation en temps réel. Utilisez les boutons pour tester votre flux vidéo et audio.",
    liveAIAssist: "Copilote IA en direct : Analyse des thématiques de la consultation...",
    languageSelect: "Sélectionner la langue",
    backToDashboard: "Retour au tableau de bord"
  },
  it: {
    brand: "EuroSecondOpinion",
    slogan: "Secondi pareri medici esperti da parte dei migliori specialisti europei",
    roleSelect: "Come desideri accedere al portale?",
    roleDoctor: "Accedi come Medico Specialista",
    rolePatient: "Accedi come Paziente",
    doctorLoginDesc: "Accedi al flusso diagnostico, ai sintetizzatori di consulti AI e alle video-visite.",
    patientLoginDesc: "Visualizza i tuoi referti medici, prenota videochiamate e consulta i nostri medici.",
    email: "Indirizzo Email",
    password: "Password",
    fullName: "Nome e Cognome",
    login: "Accedi",
    register: "Registrati",
    noAccount: "Non hai un account? Registrati come paziente",
    haveAccount: "Hai già un account? Accedi",
    logout: "Esci",
    quickDemo: "Accesso Rapido Demo",

    doctorPortal: "Dashboard del Medico Specialista",
    patientsList: "Elenco Pazienti",
    createOpinion: "Sintetizza Secondo Parere Medico",
    patientFio: "Nome e Cognome del Paziente",
    patientAnamnesis: "Anamnesi e anamnesi patologica",
    ultrasoundResults: "Risultati dell'ecografia diagnostica (ECO/UZI)",
    otherDetails: "Altri esami di laboratorio / dati clinici",
    generateWithAi: "Genera Secondo Parere (AI Gemini)",
    generating: "Analisi dei dati in corso e confronto con testi clinici tramite Gemini Pro...",
    manualOverride: "Puoi modificare e completare il referto qui sotto prima di salvarlo:",
    clinicalLiteratureRef: "Riferimenti clinici e motivazione diagnostica",
    referenceNotes: "Riferimento ai manuali standard: Cardiologia di Müller, Linee guida europee per l'ecografia V4.",
    saveOpinion: "Archivia e Salva il Referto",
    reportsHistory: "Archivio dei secondi pareri generati",
    date: "Data di emissione",
    noPatientsYet: "Nessun paziente registrato. Crea dati dimostrativi.",
    noReportsYet: "Nessun referto clinico redatto.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - SECONDO PARERE",
    recommendedTreatment: "Piano d'azione cronologico e terapia",

    patientPortal: "Portale della Salute del Paziente",
    myInfo: "Dettagli medici personali",
    myOpinions: "I miei secondi pareri medici",
    pricingMenu: "Tariffe e discipline della clinica",
    bookAppointment: "Prenota video-consulto specialistico",
    selectDoctor: "Seleziona Medico Specialista",
    chooseDate: "Data della visita",
    chooseTime: "Seleziona l'orario del consulto",
    confirmBooking: "Prenota Slot e Crea Stanza",
    myAppointments: "Le mie visite prenotate",
    pricePerConsultation: "Tariffa fissa secondo parere",
    statusScheduled: "Collegamento confermato attivo",
    statusCompleted: "Archiviato e concluso",

    videoConsultation: "Stanza consulto video protetta",
    startVideoCall: "Avvia video-conferenza protetta",
    joinRoom: "Entra nella stanza video",
    endCall: "Scollega chiamata",
    videoStatusActive: "Canale medico crittografato connesso",
    muteMic: "Disattiva Microfono",
    unmuteMic: "Attiva Microfono",
    cameraOff: "Visualizzazione video sospesa",
    cameraOn: "Attiva Telecamera",
    connecting: "Sincronizzazione della crittografia di sicurezza in corso...",
    simulatedTranscript: "Trascrizione canali in tempo reale (Traduzione istantanea integrata)",
    liveFeedback: "Flusso video virtuale. Utilizza i pulsanti per testare l'infrastruttura video/audio.",
    liveAIAssist: "Assistenza IA in tempo reale: Rilevamento parametri discussi...",
    languageSelect: "Seleziona Paese/Lingua",
    backToDashboard: "Torna alla Dashboard"
  },
  es: {
    brand: "EuroSecondOpinion",
    slogan: "Segundas opiniones médicas de expertos líderes europeos en línea",
    roleSelect: "Como desea acceder al portal corporativo?",
    roleDoctor: "Iniciar sesión como Médico Especialista",
    rolePatient: "Iniciar sesión como Paciente",
    doctorLoginDesc: "Acceda a flujos de trabajo de diagnóstico, sintetizadores IA de informes y videoconsultas.",
    patientLoginDesc: "Vea opiniones médicas, solicite turnos de videollamadas y consulte con especialistas.",
    email: "Correo electrónico",
    password: "Contraseña",
    fullName: "Nombre completo",
    login: "Iniciar sesión",
    register: "Registrarse",
    noAccount: "No tiene cuenta? Regístrese como paciente",
    haveAccount: "Ya tiene cuenta? Inicie sesión",
    logout: "Cerrar sesión",
    quickDemo: "Acceso Rápido Demo",

    doctorPortal: "Panel de control del Especialista",
    patientsList: "Directorio de Pacientes",
    createOpinion: "Sintetizar segunda opinión médica",
    patientFio: "Nombre completo del Paciente",
    patientAnamnesis: "Anamnesis y antecedentes de salud",
    ultrasoundResults: "Resultados de ecografía de diagnóstico (ECO)",
    otherDetails: "Otros informes de análisis de laboratorios",
    generateWithAi: "Generar segunda opinión experta (Gemini AI)",
    generating: "Procesando entradas y cotejando con archivos de literatura vía Gemini...",
    manualOverride: "Puede modificar y finalizar el informe antes de guardarlo:",
    clinicalLiteratureRef: "Referencias científicas y justificación de diagnóstico",
    referenceNotes: "Basado en textos clásicos: Cardiología de Müller, Directivas de Ultrasonido Europeo V4.",
    saveOpinion: "Archivar y guardar informe del caso",
    reportsHistory: "Archivo de opiniones médicas generadas",
    date: "Fecha de emisión",
    noPatientsYet: "No hay pacientes registrados. Registre pacientes de prueba.",
    noReportsYet: "Ningún informe clínico redactado todavía.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - SEGUNDA OPINIÓN",
    recommendedTreatment: "Plan de tratamiento terapéutico aconsejado",

    patientPortal: "Oficina Virtual de Salud del Paciente",
    myInfo: "Detalles de su historial clínico",
    myOpinions: "Mis segundas opiniones de expertos",
    pricingMenu: "Especialidades clínicas y tarifas",
    bookAppointment: "Reservar turno de teleconsulta",
    selectDoctor: "Seleccionar Médico Especialista",
    chooseDate: "Seleccione fecha del turno",
    chooseTime: "Seleccione hora de teleconsulta",
    confirmBooking: "Reservar turno y construir sala",
    myAppointments: "Turnos de atención reservados",
    pricePerConsultation: "Tarifa estándar por informe",
    statusScheduled: "Canal de video confirmado",
    statusCompleted: "Archivado y finalizado",

    videoConsultation: "Sala de videoconferencia segura",
    startVideoCall: "Iniciar sesión de video cifrada",
    joinRoom: "Ingresar a sala de video",
    endCall: "Desconectar llamada",
    videoStatusActive: "Canal de telemedicina cifrado en vivo",
    muteMic: "Silenciar micrófono",
    unmuteMic: "Habilitar micrófono",
    cameraOff: "Imagen de video en pausa",
    cameraOn: "Habilitar cámara",
    connecting: "Sincronizando claves de seguridad certificadas médicas...",
    simulatedTranscript: "Transcripción automática del diálogo (Traducción simultánea activada)",
    liveFeedback: "Demostración de sala de consulta. Utilice los controles para probar voz y video.",
    liveAIAssist: "Copiloto clínico de IA: Analizando factores del diagnóstico...",
    languageSelect: "Cambiar idioma/país",
    backToDashboard: "Volver al menú principal"
  },
  ru: {
    brand: "EuroSecondOpinion",
    slogan: "Экспертное второе медицинское мнение от ведущих европейских специалистов",
    roleSelect: "Как вы хотите войти на портал?",
    roleDoctor: "Войти под логином Врача",
    rolePatient: "Войти под логином Пациента",
    doctorLoginDesc: "Доступ к историям болезни, ИИ-генераторам клинических заключений и видеозвонкам.",
    patientLoginDesc: "Просмотр медицинских заключений европейских специалистов, расценок и запись на онлайн-прием.",
    email: "Адрес эл. почты",
    password: "Пароль",
    fullName: "ФИО (Фамилия Имя Отчество)",
    login: "Войти в систему",
    register: "Зарегистрироваться",
    noAccount: "Нет учетной записи? Зарегистрируйтесь как пациент",
    haveAccount: "Уже зарегистрированы? Войдите здесь",
    logout: "Выйти из системы",
    quickDemo: "Быстрый демо-вход",

    doctorPortal: "Панель управления врача-специалиста",
    patientsList: "Реестр пациентов клиники",
    createOpinion: "Составить второе медицинское заключение",
    patientFio: "ФИО Пациента",
    patientAnamnesis: "Анамнез жизни и заболевания (жалобы, история болезни)",
    ultrasoundResults: "Результаты УЗИ (ультразвукового исследования)",
    otherDetails: "Прочая клиническая информация (анализы, КТ, МРТ и др.)",
    generateWithAi: "Сгенерировать заключение (ИИ Gemini)",
    generating: "ИИ-агент Gemini Pro анализирует анамнез и результаты диагностики в соответствии с клиническими книгами...",
    manualOverride: "Перед сохранением вы можете откорректировать текст ИИ-заключения:",
    clinicalLiteratureRef: "Клинические ссылки и обоснование диагноза",
    referenceNotes: "Рекомендации сгенерированы со ссылкой на руководства: Müller's Cardiology, European Ultrasound Guidelines V4.",
    saveOpinion: "Сохранить и опубликовать заключение",
    reportsHistory: "Архив медицинских заключений экспертов",
    date: "Дата подписания",
    noPatientsYet: "Пациенты в реестре не найдены. Вы можете зарегистрировать пациента из демо-панели.",
    noReportsYet: "Медицинские заключения еще не сформированы.",
    aiReportTemplateHeader: "EUROPEAN MEDICAL ADVOCATES - ВТОРОЕ МНЕНИЕ",
    recommendedTreatment: "Рекомендуемая схема лечения и профилактика",

    patientPortal: "Консультационный кабинет пациента",
    myInfo: "Личные медицинские данные",
    myOpinions: "Мои медицинские заключения экспертов",
    pricingMenu: "Специальности клиники и расценки на услуги врачей",
    bookAppointment: "Записаться на онлайн-прием к врачу",
    selectDoctor: "Выберите европейского специалиста",
    chooseDate: "Желаемая дата консультации",
    chooseTime: "Выберите время звонка",
    confirmBooking: "Подтвердить запись и создать онлайн-кабинет",
    myAppointments: "Мои запланированные консультации",
    pricePerConsultation: "Стоимость экспертного анализа заключения",
    statusScheduled: "Прием запланирован",
    statusCompleted: "Завершен и архивирован",

    videoConsultation: "Защищенный кабинет видеозвонка",
    startVideoCall: "Начать защищенный видеозвонок",
    joinRoom: "Войти в видео-кабинет",
    endCall: "Завершить видеосвязь",
    videoStatusActive: "Защищенный медицинский онлайн-канал связи установлен",
    muteMic: "Отключить микрофон",
    unmuteMic: "Включить микрофон",
    cameraOff: "Отключить камеру",
    cameraOn: "Включить камеру",
    connecting: "Установка сквозного шифрования для защиты вашей конфиденциальности...",
    simulatedTranscript: "Панель расшифровки диалога в реальном времени (включая автоперевод)",
    liveFeedback: "Интерактивная видеосвязь. Используйте кнопки для изменения состояния аудио/видео.",
    liveAIAssist: "Живой ассистент ИИ врача: Анализ ключевых фраз консультации...",
    languageSelect: "Выбор языка интерфейса",
    backToDashboard: "Вернуться в личный кабинет"
  }
};
