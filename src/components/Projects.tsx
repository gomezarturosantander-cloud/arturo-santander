import React, { useState } from 'react';
import { AppData, Project, ProjectStatus, Payment, PaymentStage, PaymentStatus, MaintenancePlan } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/src/components/ui/dialog";
import { Badge } from "@/src/components/ui/badge";
import { Plus, Search, MoreVertical, Edit2, Trash2, Globe, Server, Calendar as CalendarIcon, CreditCard, Settings, CheckCircle2, Clock, Briefcase } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, parseISO, addYears } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

interface ProjectsViewProps {
  data: AppData;
  onUpdate: () => void;
}

export function ProjectsView({ data, onUpdate }: ProjectsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = data.projects.filter(project => {
    const client = data.clients.find(c => c.id === project.clientId);
    return (
      project.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.businessName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projectData = {
      clientId: formData.get('clientId') as string,
      type: formData.get('type') as string,
      status: formData.get('status') as ProjectStatus,
      domain: formData.get('domain') as string,
      hosting: formData.get('hosting') as string,
      deliveryDate: formData.get('deliveryDate') as string,
      domainRenewalDate: formData.get('domainRenewalDate') as string,
      hostingRenewalDate: formData.get('hostingRenewalDate') as string,
    };

    if (editingProject) {
      storage.updateProject(editingProject.id, projectData);
      toast.success("Proyecto actualizado");
    } else {
      const newProject = storage.addProject(projectData);
      // Initialize payments for new project
      const totalAmount = parseFloat(formData.get('totalAmount') as string || '0');
      if (totalAmount > 0) {
        storage.addPayment({ projectId: newProject.id, stage: 'initial', amount: totalAmount * 0.3, status: 'pending', date: new Date().toISOString() });
        storage.addPayment({ projectId: newProject.id, stage: 'intermediate', amount: totalAmount * 0.4, status: 'pending', date: new Date().toISOString() });
        storage.addPayment({ projectId: newProject.id, stage: 'final', amount: totalAmount * 0.3, status: 'pending', date: new Date().toISOString() });
      }
      toast.success("Proyecto creado con plan de pagos");
    }

    setIsAddDialogOpen(false);
    setEditingProject(null);
    onUpdate();
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este proyecto?")) {
      storage.deleteProject(id);
      toast.success("Proyecto eliminado");
      onUpdate();
    }
  };

  const handleTogglePayment = (payment: Payment) => {
    storage.updatePayment(payment.id, { 
      status: payment.status === 'paid' ? 'pending' : 'paid',
      date: new Date().toISOString()
    });
    onUpdate();
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'demo': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Demo</Badge>;
      case 'development': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Desarrollo</Badge>;
      case 'finished': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Finalizado</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          <p className="text-neutral-500">Gestiona las webs, pagos y mantenimiento de tus clientes.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingProject(null);
        }}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Proyecto
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto Web'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientId">Cliente</Label>
                  <Select name="clientId" defaultValue={editingProject?.clientId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.clients.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Web</Label>
                  <Input id="type" name="type" defaultValue={editingProject?.type} required placeholder="Ej. Tienda Online, Hotel..." />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Dominio</Label>
                  <Input id="domain" name="domain" defaultValue={editingProject?.domain} placeholder="ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hosting">Hosting</Label>
                  <Input id="hosting" name="hosting" defaultValue={editingProject?.hosting} placeholder="Nombre del proveedor" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Fecha Entrega</Label>
                  <Input id="deliveryDate" name="deliveryDate" type="date" defaultValue={editingProject?.deliveryDate || format(new Date(), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domainRenewalDate">Renov. Dominio</Label>
                  <Input id="domainRenewalDate" name="domainRenewalDate" type="date" defaultValue={editingProject?.domainRenewalDate || format(addYears(new Date(), 1), 'yyyy-MM-dd')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hostingRenewalDate">Renov. Hosting</Label>
                  <Input id="hostingRenewalDate" name="hostingRenewalDate" type="date" defaultValue={editingProject?.hostingRenewalDate || format(addYears(new Date(), 1), 'yyyy-MM-dd')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Estado del Proyecto</Label>
                  <Select name="status" defaultValue={editingProject?.status || 'development'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demo">Demo</SelectItem>
                      <SelectItem value="development">Desarrollo</SelectItem>
                      <SelectItem value="finished">Finalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!editingProject && (
                  <div className="space-y-2">
                    <Label htmlFor="totalAmount">Presupuesto Total ($)</Label>
                    <Input id="totalAmount" name="totalAmount" type="number" placeholder="1000" />
                  </div>
                )}
              </div>

              <DialogFooter>
                <button type="submit" className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">
                  {editingProject ? 'Guardar Cambios' : 'Crear Proyecto'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <Input 
          placeholder="Buscar por dominio, tipo o negocio..." 
          className="pl-10 bg-white border-none shadow-sm h-12 rounded-xl focus-visible:ring-1 focus-visible:ring-neutral-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map(project => {
          const client = data.clients.find(c => c.id === project.clientId);
          const payments = data.payments.filter(p => p.projectId === project.id);
          const totalPaid = payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
          const totalPending = payments.filter(p => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
          const maintenance = data.maintenance.find(m => m.clientId === project.clientId);

          return (
            <Card key={project.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-bold">{project.domain || 'Sin dominio'}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      {client?.businessName} • {project.type}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4 text-neutral-400" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem onClick={() => {
                        setEditingProject(project);
                        setIsAddDialogOpen(true);
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteProject(project.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-2">{getStatusBadge(project.status)}</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Globe className="w-3 h-3" /> {project.domain || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <Server className="w-3 h-3" /> {project.hosting || 'N/A'}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-500">
                    <CalendarIcon className="w-3 h-3" /> Entrega: {format(parseISO(project.deliveryDate), 'dd/MM/yy')}
                  </div>
                </div>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pagos</span>
                    <span className="text-xs font-medium text-neutral-900">
                      Pendiente: <span className="text-red-600">${totalPending.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {['initial', 'intermediate', 'final'].map((stage) => {
                      const p = payments.find(pay => pay.stage === stage);
                      if (!p) return null;
                      return (
                        <button
                          key={stage}
                          onClick={() => handleTogglePayment(p)}
                          className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                            p.status === 'paid' 
                              ? 'bg-green-50 border-green-100 text-green-700' 
                              : 'bg-neutral-50 border-neutral-100 text-neutral-400 hover:border-neutral-200'
                          }`}
                        >
                          {p.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          <span className="text-[10px] font-bold uppercase">{stage === 'initial' ? '30%' : stage === 'intermediate' ? '40%' : '30%'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs text-neutral-600">
                      Plan: {maintenance?.planType === 'full' ? 'Completo' : maintenance?.planType === 'basic' ? 'Básico' : 'Ninguno'}
                    </span>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-xs font-medium text-black hover:underline">Gestionar Plan</button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle>Mantenimiento y Plan Mensual</DialogTitle>
                        <DialogDescription>Configura el plan mensual para {client?.businessName}</DialogDescription>
                      </DialogHeader>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        storage.setMaintenance({
                          clientId: project.clientId,
                          planType: fd.get('planType') as MaintenancePlan,
                          nextPaymentDate: fd.get('nextPaymentDate') as string,
                        });
                        toast.success("Plan actualizado");
                        onUpdate();
                      }} className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Tipo de Plan</Label>
                          <Select name="planType" defaultValue={maintenance?.planType || 'none'}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sin mantenimiento</SelectItem>
                              <SelectItem value="basic">Básico</SelectItem>
                              <SelectItem value="full">Completo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Próximo Pago</Label>
                          <Input name="nextPaymentDate" type="date" defaultValue={maintenance?.nextPaymentDate || format(new Date(), 'yyyy-MM-dd')} />
                        </div>
                        <Button type="submit" className="w-full bg-black text-white rounded-xl">Guardar Plan</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredProjects.length === 0 && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-neutral-500 bg-white rounded-2xl border-2 border-dashed">
            <Briefcase className="w-8 h-8 mb-2 opacity-20" />
            <p>No se encontraron proyectos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
