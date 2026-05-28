/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  price: number;
  avatar: string;
  languages: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'doctor' | 'patient' | 'admin';
  specialty?: string;
  price?: number;
  emailVerified2FA?: boolean;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodType: string;
}

export interface Conclusion {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  anamnesis: string;
  ultrasound: string;
  otherInfo: string;
  status: 'received' | 'pre_screening' | 'in_progress' | 'ready';
  reportText: string;
  specialty?: string;
  alternativeTherapiesSuggested?: string[];
  peerConsultantComment?: string;
}

export interface MedicalCase {
  id: string;
  patientId: string;
  patientName: string;
  direction: string; // Orthopedics, Neurology, Regenerative Medicine, Cardiology
  anamnesis: string;
  complaintsChecklist: string[];
  documents: { name: string; size: string; type: string }[];
  dicomSnaps: { name: string; size: string; slices: number }[];
  status: 'received' | 'pre_screening' | 'in_progress' | 'ready';
  pricePaid: number;
  assignedDoctorId?: string;
  dateCreated: string;
  requiresTranslation?: boolean;
  sourceLanguage?: string;
  autoTranslatedText?: string;
  isPreScreened?: boolean;
  preScreenNotes?: string;
  disclaimerSigned: boolean;
  signatureText?: string;
}

export interface ChatMessage {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: 'doctor' | 'patient' | 'admin' | 'system';
  messageText: string;
  timestamp: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed';
}

export type LanguageCode = 'en' | 'de' | 'fr' | 'it' | 'es' | 'ru';
