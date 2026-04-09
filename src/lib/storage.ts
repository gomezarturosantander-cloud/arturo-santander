import { AppData, Client, Project, Payment, Maintenance } from '../types';

const STORAGE_KEY = 'webdesign_manager_data';

const initialData: AppData = {
  clients: [],
  projects: [],
  payments: [],
  maintenance: [],
};

export const storage = {
  getData: (): AppData => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return initialData;
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Error parsing storage data', e);
      return initialData;
    }
  },

  saveData: (data: AppData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // Clients
  getClients: () => storage.getData().clients,
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => {
    const data = storage.getData();
    const newClient: Client = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    data.clients.push(newClient);
    storage.saveData(data);
    return newClient;
  },
  updateClient: (id: string, updates: Partial<Client>) => {
    const data = storage.getData();
    data.clients = data.clients.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.saveData(data);
  },
  deleteClient: (id: string) => {
    const data = storage.getData();
    data.clients = data.clients.filter(c => c.id !== id);
    data.projects = data.projects.filter(p => p.clientId !== id);
    data.maintenance = data.maintenance.filter(m => m.clientId !== id);
    // Payments are linked to projects, so they'll be orphaned but we should clean them too
    const projectIds = data.projects.filter(p => p.clientId === id).map(p => p.id);
    data.payments = data.payments.filter(p => !projectIds.includes(p.projectId));
    storage.saveData(data);
  },

  // Projects
  getProjects: (clientId?: string) => {
    const projects = storage.getData().projects;
    return clientId ? projects.filter(p => p.clientId === clientId) : projects;
  },
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => {
    const data = storage.getData();
    const newProject: Project = {
      ...project,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    data.projects.push(newProject);
    storage.saveData(data);
    return newProject;
  },
  updateProject: (id: string, updates: Partial<Project>) => {
    const data = storage.getData();
    data.projects = data.projects.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.saveData(data);
  },
  deleteProject: (id: string) => {
    const data = storage.getData();
    data.projects = data.projects.filter(p => p.id !== id);
    data.payments = data.payments.filter(p => p.projectId !== id);
    storage.saveData(data);
  },

  // Payments
  getPayments: (projectId?: string) => {
    const payments = storage.getData().payments;
    return projectId ? payments.filter(p => p.projectId === projectId) : payments;
  },
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const data = storage.getData();
    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    data.payments.push(newPayment);
    storage.saveData(data);
    return newPayment;
  },
  updatePayment: (id: string, updates: Partial<Payment>) => {
    const data = storage.getData();
    data.payments = data.payments.map(p => p.id === id ? { ...p, ...updates } : p);
    storage.saveData(data);
  },
  deletePayment: (id: string) => {
    const data = storage.getData();
    data.payments = data.payments.filter(p => p.id !== id);
    storage.saveData(data);
  },

  // Maintenance
  getMaintenance: (clientId?: string) => {
    const maintenance = storage.getData().maintenance;
    return clientId ? maintenance.find(m => m.clientId === clientId) : maintenance;
  },
  setMaintenance: (maintenance: Omit<Maintenance, 'id' | 'createdAt'>) => {
    const data = storage.getData();
    const existingIndex = data.maintenance.findIndex(m => m.clientId === maintenance.clientId);
    if (existingIndex > -1) {
      data.maintenance[existingIndex] = {
        ...data.maintenance[existingIndex],
        ...maintenance,
      };
    } else {
      data.maintenance.push({
        ...maintenance,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      });
    }
    storage.saveData(data);
  }
};
