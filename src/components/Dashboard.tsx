import React, { useState, useEffect } from 'react';
import { storage } from '@/src/lib/storage';
import { AppData, Client, Project, Payment } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Users, Briefcase, CreditCard, Bell, LogOut, LayoutDashboard, UserCircle, Calendar, Plus } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ClientsView } from './Clients';
import { ProjectsView } from './Projects';
import { RenewalsView } from './Renewals';
import { differenceInDays, parseISO, isAfter, addMonths } from 'date-fns';

export function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'projects' | 'renewals'>('dashboard');
  const [data, setData] = useState<AppData>(storage.getData());

  const refreshData = () => {
    setData(storage.getData());
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const stats = {
    clients: data.clients.length,
    activeProjects: data.projects.filter(p => p.status !== 'finished').length,
    pendingPayments: data.payments.filter(p => p.status === 'pending').length,
    upcomingRenewals: data.projects.filter(p => {
      const domainDays = differenceInDays(parseISO(p.domainRenewalDate), new Date());
      const hostingDays = differenceInDays(parseISO(p.hostingRenewalDate), new Date());
      return (domainDays >= 0 && domainDays <= 30) || (hostingDays >= 0 && hostingDays <= 30);
    }).length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Resumen</h1>
              <p className="text-neutral-500">Bienvenido de nuevo a tu panel de control.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
                  <Users className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clients}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
                  <Briefcase className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                  <CreditCard className="h-4 w-4 text-neutral-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Renovaciones Próximas</CardTitle>
                  <Bell className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.upcomingRenewals}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Proyectos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.projects.slice(-5).reverse().map(project => {
                      const client = data.clients.find(c => c.id === project.clientId);
                      return (
                        <div key={project.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{project.domain || 'Sin dominio'}</p>
                            <p className="text-xs text-neutral-500">{client?.businessName || 'Cliente desconocido'}</p>
                          </div>
                          <div className="text-xs font-medium px-2 py-1 bg-neutral-100 rounded-full">
                            {project.status === 'development' ? 'En desarrollo' : project.status === 'demo' ? 'Demo' : 'Finalizado'}
                          </div>
                        </div>
                      );
                    })}
                    {data.projects.length === 0 && <p className="text-sm text-neutral-500 text-center py-4">No hay proyectos registrados.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Alertas de Renovación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.projects
                      .filter(p => {
                        const domainDays = differenceInDays(parseISO(p.domainRenewalDate), new Date());
                        const hostingDays = differenceInDays(parseISO(p.hostingRenewalDate), new Date());
                        return (domainDays >= 0 && domainDays <= 30) || (hostingDays >= 0 && hostingDays <= 30);
                      })
                      .slice(0, 5)
                      .map(p => (
                        <div key={p.id} className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0">
                          <div className="mt-1 p-1 bg-red-100 rounded-full">
                            <Bell className="w-3 h-3 text-red-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{p.domain}</p>
                            <p className="text-xs text-neutral-500">
                              Renovación: {differenceInDays(parseISO(p.domainRenewalDate), new Date()) <= 30 ? 'Dominio' : 'Hosting'} pronto
                            </p>
                          </div>
                        </div>
                      ))}
                    {data.projects.filter(p => {
                      const d = differenceInDays(parseISO(p.domainRenewalDate), new Date());
                      const h = differenceInDays(parseISO(p.hostingRenewalDate), new Date());
                      return (d >= 0 && d <= 30) || (h >= 0 && h <= 30);
                    }).length === 0 && <p className="text-sm text-neutral-500 text-center py-4">No hay renovaciones próximas.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'clients':
        return <ClientsView data={data} onUpdate={refreshData} />;
      case 'projects':
        return <ProjectsView data={data} onUpdate={refreshData} />;
      case 'renewals':
        return <RenewalsView data={data} onUpdate={refreshData} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-black rounded-xl">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">WebDesign</span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<UserCircle className="w-4 h-4" />} 
            label="Clientes" 
            active={activeTab === 'clients'} 
            onClick={() => setActiveTab('clients')} 
          />
          <NavItem 
            icon={<Briefcase className="w-4 h-4" />} 
            label="Proyectos" 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
          />
          <NavItem 
            icon={<Calendar className="w-4 h-4" />} 
            label="Renovaciones" 
            active={activeTab === 'renewals'} 
            onClick={() => setActiveTab('renewals')} 
          />
        </nav>

        <div className="pt-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-neutral-500 hover:text-red-600 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 z-50">
        <MobileNavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <MobileNavItem 
          icon={<UserCircle className="w-5 h-5" />} 
          active={activeTab === 'clients'} 
          onClick={() => setActiveTab('clients')} 
        />
        <MobileNavItem 
          icon={<Briefcase className="w-5 h-5" />} 
          active={activeTab === 'projects'} 
          onClick={() => setActiveTab('projects')} 
        />
        <MobileNavItem 
          icon={<Calendar className="w-5 h-5" />} 
          active={activeTab === 'renewals'} 
          onClick={() => setActiveTab('renewals')} 
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 pb-24 md:pb-10 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'bg-neutral-100 text-black' 
          : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-xl transition-all ${
        active ? 'bg-black text-white' : 'text-neutral-400'
      }`}
    >
      {icon}
    </button>
  );
}
