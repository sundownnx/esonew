/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Dynamic port to support Amvera Cloud or environment variables; defaults to 3000
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DB_DIR = fs.existsSync('/data') ? '/data' : process.cwd();
const DB_FILE = path.join(DB_DIR, 'db.json');

app.use(express.json());

// Load or initialize DB
function getDB() {
  const initialDB = {
    doctors: [
      {
        id: 'doc_1',
        name: 'Dr. Sarah Harrison',
        specialty: 'Cardiologist & General Medicine Specialist',
        price: 150,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop',
        languages: ['English', 'Russian', 'German']
      },
      {
        id: 'doc_2',
        name: 'Dr. Lukas Weber',
        specialty: 'Neurologist & MRI Evaluation Expert',
        price: 180,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop',
        languages: ['English', 'German', 'French']
      },
      {
        id: 'doc_3',
        name: 'Dr. Amélie Dupond',
        specialty: 'Oncologist & Second Opinion Specialist',
        price: 160,
        avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop',
        languages: ['English', 'French', 'Spanish', 'Italian']
      }
    ],
    users: [
      {
        id: 'user_doc_1',
        email: 'doctor@eurosecondopinion.com',
        name: 'Dr. Sarah Harrison',
        password: 'Password123',
        role: 'doctor',
        doctorRefId: 'doc_1'
      },
      {
        id: 'user_pat_1',
        email: 'patient@eurosecondopinion.com',
        name: 'Maxim Ivanov',
        password: 'Password123',
        role: 'patient'
      },
      {
        id: 'user_admin_1',
        email: 'admin@eurosecondopinion.com',
        name: 'Prof. Karl Brandt',
        password: 'Password123',
        role: 'admin'
      }
    ],
    cases: [
      {
        id: 'case_1',
        patientId: 'user_pat_1',
        patientName: 'Maxim Ivanov',
        direction: 'Cardiology',
        anamnesis: 'Complaining of dyspnea during physical cardiorespiratory tasks. Mild fatigue reported.',
        complaintsChecklist: ['Одышка при ходьбе', 'Учащенное сердцебиение', 'Общая слабость'],
        documents: [
          { name: 'ECG_Analysis_Report.pdf', size: '2.4 MB', type: 'application/pdf' },
          { name: 'Blood_Panel_Results.pdf', size: '1.1 MB', type: 'application/pdf' }
        ],
        dicomSnaps: [
          { name: 'Cardiac_MRI_Sequence_T2.dcm', size: '124.5 MB', slices: 15 }
        ],
        status: 'in_progress',
        pricePaid: 150,
        assignedDoctorId: 'doc_1',
        dateCreated: '2026-05-25',
        requiresTranslation: true,
        sourceLanguage: 'ru',
        autoTranslatedText: 'Patient comments on breathing strain during cardio strain tasks. Left ventricle measurements requested.',
        isPreScreened: true,
        preScreenNotes: 'Documents verified. DICOM images validated as legible. Routing to Dr. Harrison.',
        disclaimerSigned: true,
        signatureText: 'Maxim Ivanov'
      },
      {
        id: 'case_2',
        patientId: 'user_pat_2',
        patientName: 'Elena Petrova',
        direction: 'Neurology',
        anamnesis: 'Сильные головные боли в затылочной области, онемение пальцев левой руки.',
        complaintsChecklist: ['Головная боль', 'Онемение конечностей'],
        documents: [
          { name: 'Spine_Neurology_Review.pdf', size: '3.8 MB', type: 'application/pdf' }
        ],
        dicomSnaps: [
          { name: 'Brain_CT_Scan_3D.dcm', size: '210.4 MB', slices: 20 }
        ],
        status: 'received',
        pricePaid: 180,
        dateCreated: '2026-05-26',
        requiresTranslation: true,
        sourceLanguage: 'ru',
        autoTranslatedText: 'Severe occipital headaches, numbness of the fingers of the left hand.',
        isPreScreened: false,
        disclaimerSigned: true,
        signatureText: 'Elena Petrova'
      }
    ],
    chats: [
      {
        id: 'chat_msg_1',
        caseId: 'case_1',
        senderId: 'user_admin_1',
        senderName: 'Prof. Karl Brandt (Chief Editor)',
        senderRole: 'admin',
        messageText: 'Приветствуем в EuroSecondOpinion. Ваш кейс прошел первичный асессмент и был передан куратору Dr. Sarah Harrison. Вы можете задавать здесь уточняющие вопросы.',
        timestamp: '2026-05-25T15:00:00Z'
      }
    ],
    conclusions: [
      {
        id: 'con_1',
        patientId: 'user_pat_1',
        patientName: 'Maxim Ivanov',
        doctorName: 'Dr. Sarah Harrison',
        date: '2026-05-15',
        anamnesis: 'Complaining of mild dyspnea during physical cardiorespiratory tasks. Mild fatigue reported.',
        ultrasound: 'Mitral Valve regurgitation level 1, left ventricular ejection fraction is 62%. Normal wall thickness.',
        otherInfo: 'Blood pressure is 135/85 mmHg. Daily caffeine intake: 3 cups.',
        status: 'ready',
        reportText: `### EURO SECOND OPINION REPORT SUMMARY
- **Patient**: Maxim Ivanov
- **Evaluating Doctor**: Dr. Sarah Harrison
- **Date**: May 15, 2026
- **Status**: Stable Cardio-Dynamic Status

### CLINICAL FINDINGS & DIAGNOSTIC INTERPRETATION
The patient presents with stable left ventricular ejection fraction of 62%, within safe reference physiological intervals. Modest mitral regurgitation grade 1 represents low-level hemodynamic leakage and does not explain acute physical fatigue. Blood pressure indices hover slightly elevated at 135/85 mmHg.

### RECOMMENDATIONS & SUGGESTED THERAPY PLAN
1. Reduce dietary sodium intake.
2. Moderate caffeine (limit to 1 cup daily).
3. Introduce steady, low-intensity aerobic activity (brisk walking for 30 minutes, 4 times weekly).
4. Monitor arterial pressure daily for 14 calendar days.

### RECOMMENDED MEDICAL REFERENCES
- Ref: *Müller's Cardiology Textbook, 5th Edition*, Chap. 12 (Mitral Regurgitation Management).
- Ref: *European Society of Cardiology Guidelines*, Hypertension Classification & Non-pharmacological Interventions (2025).`
      }
    ],
    appointments: [
      {
        id: 'app_1',
        patientId: 'user_pat_1',
        patientName: 'Maxim Ivanov',
        doctorName: 'Dr. Sarah Harrison',
        specialty: 'Cardiologist & General Medicine Specialist',
        date: '2026-05-28',
        time: '14:30',
        status: 'scheduled'
      }
    ]
  };

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2), 'utf-8');
    return initialDB;
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    
    // Assure key collections exist
    if (!parsed.doctors) parsed.doctors = initialDB.doctors;
    if (!parsed.users) parsed.users = initialDB.users;
    if (!parsed.cases) parsed.cases = initialDB.cases;
    if (!parsed.chats) parsed.chats = initialDB.chats;
    if (!parsed.conclusions) parsed.conclusions = initialDB.conclusions;
    if (!parsed.appointments) parsed.appointments = initialDB.appointments;

    // Assure admin exists in users
    const hasAdmin = parsed.users.some((u: any) => u.role === 'admin' || u.email === 'admin@eurosecondopinion.com');
    if (!hasAdmin) {
      parsed.users.push({
        id: 'user_admin_1',
        email: 'admin@eurosecondopinion.com',
        name: 'Prof. Karl Brandt',
        password: 'Password123',
        role: 'admin'
      });
    }

    // Assure case_1 and case_2 exist for demonstration
    if (parsed.cases.length === 0) {
      parsed.cases = initialDB.cases;
    }
    if (parsed.chats.length === 0) {
      parsed.chats = initialDB.chats;
    }

    return parsed;
  } catch (err) {
    console.error("DB parsing error, resetting to initial", err);
    return initialDB;
  }
}

function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// REST API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Gemini status check
app.get('/api/gemini/status', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== '';
  res.json({ hasKey });
});

// Get Doctors
app.get('/api/doctors', (req, res) => {
  const db = getDB();
  res.json(db.doctors);
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const db = getDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password && u.role === role);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email, password, or designated role select.' });
  }
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    doctorRefId: (user as any).doctorRefId
  });
});

// Register Patient
app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  const db = getDB();
  
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const newId = 'user_' + Date.now();
  const newUser = {
    id: newId,
    email,
    name,
    password,
    role: 'patient' as const
  };

  db.users.push(newUser);
  saveDB(db);

  res.json({
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  });
});

// Get conclusions for specific user
app.get('/api/conclusions', (req, res) => {
  const { userId, role } = req.query;
  const db = getDB();
  
  if (role === 'doctor') {
    // Doctors can access all reports they wrote or all registered reports
    res.json(db.conclusions);
  } else {
    // Patients see only their own
    const filtered = db.conclusions.filter(c => c.patientId === userId);
    res.json(filtered);
  }
});

// Create new conclusion
app.post('/api/conclusions', (req, res) => {
  const { patientId, patientName, doctorName, anamnesis, ultrasound, otherInfo, reportText } = req.body;
  const db = getDB();

  const newReport = {
    id: 'con_' + Date.now(),
    patientId: patientId || 'user_pat_1',
    patientName,
    doctorName,
    date: new Date().toISOString().split('T')[0],
    anamnesis,
    ultrasound,
    otherInfo,
    reportText
  };

  db.conclusions.push(newReport);
  saveDB(db);

  res.json(newReport);
});

// Get Cases
app.get('/api/cases', (req, res) => {
  const { userId, role } = req.query;
  const db = getDB();

  if (role === 'admin') {
    res.json(db.cases || []);
  } else if (role === 'doctor') {
    // Return all cases so they can see queue, but flag assigned ones
    res.json(db.cases || []);
  } else {
    // Patient cases
    const filtered = (db.cases || []).filter((c: any) => c.patientId === userId);
    res.json(filtered);
  }
});

// Create new case (Wizard Flow)
app.post('/api/cases', (req, res) => {
  const { patientId, patientName, direction, anamnesis, complaintsChecklist, documents, dicomSnaps, pricePaid, requiresTranslation, sourceLanguage, autoTranslatedText, disclaimerSigned, signatureText } = req.body;
  const db = getDB();

  const newCase = {
    id: 'case_' + Date.now(),
    patientId: patientId || 'user_pat_1',
    patientName: patientName || 'Anonymous',
    direction: direction || 'Cardiology',
    anamnesis: anamnesis || '',
    complaintsChecklist: complaintsChecklist || [],
    documents: documents || [],
    dicomSnaps: dicomSnaps || [],
    status: 'received' as const,
    pricePaid: pricePaid || 150,
    dateCreated: new Date().toISOString().split('T')[0],
    requiresTranslation: !!requiresTranslation,
    sourceLanguage: sourceLanguage || 'en',
    autoTranslatedText: autoTranslatedText || '',
    isPreScreened: false,
    disclaimerSigned: !!disclaimerSigned,
    signatureText: signatureText || ''
  };

  if (!db.cases) db.cases = [];
  db.cases.push(newCase);

  // Send system chat message
  if (!db.chats) db.chats = [];
  db.chats.push({
    id: 'chat_msg_' + Date.now(),
    caseId: newCase.id,
    senderId: 'system',
    senderName: 'System Core',
    senderRole: 'system',
    messageText: `Новое обращение зарегистрировано под номером ${newCase.id}. Направление: ${newCase.direction}. Ожидайте верификации документов медицинским редактором.`,
    timestamp: new Date().toISOString()
  });

  saveDB(db);
  res.json(newCase);
});

// Update Case (SLA assignment, pre-screenings, translation or status transitions)
app.put('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = getDB();

  if (!db.cases) db.cases = [];
  const caseIdx = db.cases.findIndex((c: any) => c.id === id);
  if (caseIdx === -1) {
    return res.status(404).json({ error: 'Case not found' });
  }

  db.cases[caseIdx] = {
    ...db.cases[caseIdx],
    ...updateData
  };

  saveDB(db);
  res.json(db.cases[caseIdx]);
});

// Retrieve secure chat messages for a case
app.get('/api/chats/:caseId', (req, res) => {
  const { caseId } = req.params;
  const db = getDB();

  const filtered = (db.chats || []).filter((ch: any) => ch.caseId === caseId);
  res.json(filtered);
});

// Write a chat message
app.post('/api/chats', (req, res) => {
  const { caseId, senderId, senderName, senderRole, messageText } = req.body;
  const db = getDB();

  const newChat = {
    id: 'chat_msg_' + Date.now(),
    caseId,
    senderId,
    senderName,
    senderRole,
    messageText,
    timestamp: new Date().toISOString()
  };

  if (!db.chats) db.chats = [];
  db.chats.push(newChat);
  saveDB(db);

  res.json(newChat);
});

// Retrieve lists of patients registered in the system (for Doctor dropdown or selection)
app.get('/api/patients', (req, res) => {
  const db = getDB();
  const patients = db.users
    .filter(u => u.role === 'patient')
    .map(p => ({ id: p.id, name: p.name, email: p.email }));
  res.json(patients);
});

// Get Appointments
app.get('/api/appointments', (req, res) => {
  const { userId, role } = req.query;
  const db = getDB();

  if (role === 'doctor') {
    // Doctor appointments based on doctor role (can see all or those matching their name)
    res.json(db.appointments);
  } else {
    // Patient appointment matching patientId
    const filtered = db.appointments.filter(a => a.patientId === userId);
    res.json(filtered);
  }
});

// Book Appointment
app.post('/api/appointments', (req, res) => {
  const { patientId, patientName, doctorName, specialty, date, time } = req.body;
  const db = getDB();

  const newApp = {
    id: 'app_' + Date.now(),
    patientId,
    patientName,
    doctorName,
    specialty,
    date,
    time,
    status: 'scheduled' as const
  };

  db.appointments.push(newApp);
  saveDB(db);

  res.json(newApp);
});

// Generate medical opinion with Gemini API (Server-Side)
app.post('/api/gemini/generate-conclusion', async (req, res) => {
  const { name, anamnesis, ultrasound, otherInfo, language } = req.body;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(403).json({
      error: "Please set your Gemini API secret via the Settings > Secrets tab in the AI Studio panel before generating AI conclusions."
    });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const systemInstructions = `You are a highly detailed and professional European second-opinion medical consultant.
Your role is to evaluate patient profiles and synthesize a medically sound second opinion and therapeutic course in the requested language.
Always cite representative textbooks, guidelines and academic literature, e.g., "Müller's Cardiology, European Ultrasound Review Guidelines V4, Clinical Pharmacology Handbook".
You write beautifully structured, thorough diagnoses. Respond only in the specified language (one of Russian, English, German, French, Italian, Spanish).`;

    const prompt = `Please generate an expert clinical second opinion consultation for the patient below.
Patient Full Name: ${name}
Medical Anamnesis & Complaints: ${anamnesis}
Diagnostic Ultrasound/UZI Findings: ${ultrasound}
Other Reports/Clinical Logs: ${otherInfo}

Please write the full report in ${language === 'ru' ? 'Russian' : language === 'de' ? 'German' : language === 'fr' ? 'French' : language === 'it' ? 'Italian' : language === 'es' ? 'Spanish' : 'English'}.

Structure of output format should strictly include the following Markdown headers:
### EURO SECOND OPINION REPORT SUMMARY
Provide name, analysis date, summary of medical state.

### CLINICAL FINDINGS & DIAGNOSTIC INTERPRETATION
Explain details of patient history, analyse the ultrasound/UZI results in professional terminology, and state whether they reconcile with standard cardiology or medicine reference values.

### RECOMMENDATIONS & SUGGESTED THERAPY PLAN
Actionable medical guidelines (dietary changes, activities, scheduling checks, medications review, etc.).

### CLINICAL REFERENCES & DIAGNOSTIC RATIONALE
References standard clinical books or journals that back up this advice, reassuring the patient of a gold-standard approach.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.7,
      }
    });

    const reportText = response.text || "Diagnostic compilation error. No response was generated.";
    res.json({ reportText });
  } catch (error: any) {
    console.error("Gemini invocation failed:", error);
    res.status(500).json({ error: `AI Diagnostic engine failure: ${error?.message || 'Unknown integration error occurs.'}` });
  }
});


// Bootstrapping Server/Vite
const isProduction =
  process.env.NODE_ENV === "production" ||
  (typeof __filename !== 'undefined' && __filename.includes('dist')) ||
  (process.argv[1] && process.argv[1].includes('dist')) ||
  !fs.existsSync(path.join(process.cwd(), 'server.ts'));

async function run() {
  console.log(`[Boot] Running server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT / PREVIEW'} mode`);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'custom'
    });
    app.use(vite.middlewares);

    // Explicitly handle and transform index.html for SPA support
    app.get('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server started and serving in standard mode on http://localhost:${PORT}`);
  });
}

run();
