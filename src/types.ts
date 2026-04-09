
export type ClientStatus = 'interested' | 'in_progress' | 'finished';
export type ProjectStatus = 'demo' | 'development' | 'finished';
export type PaymentStage = 'initial' | 'intermediate' | 'final';
export type PaymentStatus = 'pending' | 'paid';
export type MaintenancePlan = 'none' | 'basic' | 'full';

export interface Client {
  id: string;
  name: string;
  businessName: string;
  whatsapp: string;
  status: ClientStatus;
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  type: string;
  status: ProjectStatus;
  domain: string;
  hosting: string;
  deliveryDate: string;
  domainRenewalDate: string;
  hostingRenewalDate: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  stage: PaymentStage;
  amount: number;
  status: PaymentStatus;
  date: string;
  createdAt: string;
}

export interface Maintenance {
  id: string;
  clientId: string;
  planType: MaintenancePlan;
  nextPaymentDate: string;
  createdAt: string;
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  payments: Payment[];
  maintenance: Maintenance[];
}
