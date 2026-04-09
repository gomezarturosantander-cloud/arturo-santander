import React, { useState } from 'react';
import { AppData, Client, ClientStatus } from '@/src/types';
import { storage } from '@/src/lib/storage';
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Textarea } from "@/src/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/src/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Plus, Search, MoreVertical, Edit2, Trash2, Phone, ExternalLink } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ClientsViewProps {
  data: AppData;
  onUpdate: () => void;
}

export function ClientsView({ data, onUpdate }: ClientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const filteredClients = data.clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const clientData = {
      name: formData.get('name') as string,
      businessName: formData.get('businessName') as string,
      whatsapp: formData.get('whatsapp') as string,
      status: formData.get('status') as ClientStatus,
      notes: formData.get('notes') as string,
    };

    if (editingClient) {
      storage.updateClient(editingClient.id, clientData);
      toast.success("Cliente actualizado correctamente");
    } else {
      storage.addClient(clientData);
      toast.success("Cliente añadido correctamente");
    }

    setIsAddDialogOpen(false);
    setEditingClient(null);
    onUpdate();
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este cliente? Se eliminarán también sus proyectos y pagos.")) {
      storage.deleteClient(id);
      toast.success("Cliente eliminado");
      onUpdate();
    }
  };

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'interested': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Interesado</Badge>;
      case 'in_progress': return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">En proceso</Badge>;
      case 'finished': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminado</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-neutral-500">Gestiona tu cartera de clientes y prospectos.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) setEditingClient(null);
        }}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Cliente</Label>
                  <Input id="name" name="name" defaultValue={editingClient?.name} required placeholder="Ej. Juan Pérez" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nombre del Negocio</Label>
                  <Input id="businessName" name="businessName" defaultValue={editingClient?.businessName} required placeholder="Ej. Hotel Paraíso" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" defaultValue={editingClient?.whatsapp} placeholder="Ej. +52 123 456 7890" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select name="status" defaultValue={editingClient?.status || 'interested'}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">Interesado</SelectItem>
                      <SelectItem value="in_progress">En proceso</SelectItem>
                      <SelectItem value="finished">Terminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea id="notes" name="notes" defaultValue={editingClient?.notes} placeholder="Detalles sobre el cliente..." className="min-h-[100px]" />
              </div>
              <DialogFooter>
                <button type="submit" className="w-full bg-black text-white py-2.5 rounded-xl hover:bg-neutral-800 transition-colors">
                  {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardHeader className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input 
              placeholder="Buscar por nombre o negocio..." 
              className="pl-10 bg-neutral-50 border-none focus-visible:ring-1 focus-visible:ring-neutral-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-neutral-100">
                  <TableHead className="w-[250px]">Cliente / Negocio</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Proyectos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => {
                  const projectsCount = data.projects.filter(p => p.clientId === client.id).length;
                  return (
                    <TableRow key={client.id} className="group border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-neutral-900">{client.name}</span>
                          <span className="text-xs text-neutral-500">{client.businessName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`https://wa.me/${client.whatsapp.replace(/\D/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-sm text-neutral-600 hover:text-green-600 transition-colors"
                        >
                          <Phone className="w-3 h-3 mr-1.5" />
                          {client.whatsapp || 'N/A'}
                        </a>
                      </TableCell>
                      <TableCell>{getStatusBadge(client.status)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-neutral-100 text-neutral-600 font-normal">
                          {projectsCount} {projectsCount === 1 ? 'web' : 'webs'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-neutral-200 rounded-lg transition-colors">
                              <MoreVertical className="w-4 h-4 text-neutral-500" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 rounded-xl">
                            <DropdownMenuItem onClick={() => {
                              setEditingClient(client);
                              setIsAddDialogOpen(true);
                            }}>
                              <Edit2 className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDeleteClient(client.id)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredClients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                      No se encontraron clientes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
