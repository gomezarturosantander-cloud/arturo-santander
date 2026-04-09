import React from 'react';
import { AppData } from '@/src/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/src/components/ui/table";
import { Badge } from "@/src/components/ui/badge";
import { Bell, Globe, Server, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format, parseISO, differenceInDays, isAfter } from 'date-fns';

interface RenewalsViewProps {
  data: AppData;
  onUpdate: () => void;
}

export function RenewalsView({ data }: RenewalsViewProps) {
  const allRenewals = data.projects.flatMap(project => [
    {
      id: `${project.id}-domain`,
      project,
      type: 'Dominio',
      date: project.domainRenewalDate,
      item: project.domain,
      icon: <Globe className="w-4 h-4" />
    },
    {
      id: `${project.id}-hosting`,
      project,
      type: 'Hosting',
      date: project.hostingRenewalDate,
      item: project.hosting,
      icon: <Server className="w-4 h-4" />
    }
  ]).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const getStatus = (dateStr: string) => {
    const days = differenceInDays(parseISO(dateStr), new Date());
    if (days < 0) return { label: 'Vencido', color: 'bg-red-100 text-red-700 border-red-200', icon: <AlertTriangle className="w-3 h-3 mr-1" /> };
    if (days <= 30) return { label: `En ${days} días`, color: 'bg-amber-100 text-amber-700 border-amber-200', icon: <Bell className="w-3 h-3 mr-1" /> };
    return { label: 'Al día', color: 'bg-green-100 text-green-700 border-green-200', icon: <CheckCircle2 className="w-3 h-3 mr-1" /> };
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Renovaciones</h1>
        <p className="text-neutral-500">Control de vencimientos de dominios y servicios de hosting.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {allRenewals.filter(r => differenceInDays(parseISO(r.date), new Date()) < 0).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Próximos 30 días</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {allRenewals.filter(r => {
                const d = differenceInDays(parseISO(r.date), new Date());
                return d >= 0 && d <= 30;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">Total Servicios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allRenewals.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-neutral-100">
                <TableHead>Servicio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allRenewals.map((renewal) => {
                const client = data.clients.find(c => c.id === renewal.project.clientId);
                const status = getStatus(renewal.date);
                return (
                  <TableRow key={renewal.id} className="border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-neutral-100 rounded-lg text-neutral-600">
                          {renewal.icon}
                        </div>
                        <span className="font-medium">{renewal.item || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-neutral-600">{renewal.type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-neutral-600">{client?.businessName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{format(parseISO(renewal.date), 'dd MMM, yyyy')}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${status.color} border-none font-medium px-2 py-0.5`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {allRenewals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-neutral-500">
                    No hay servicios registrados para renovación.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
