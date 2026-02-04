'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  Phone,
  Star,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Appointment, Lead, Property } from '@/types';

const fetchArray = async <T,>(url: string): Promise<T[]> => {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? (json as T[]) : [];
  } catch {
    return [];
  }
};

export default function DashboardPage() {
  const {
    data: properties = [],
    isLoading: propertiesLoading,
    isError: propertiesError,
  } = useQuery({
    queryKey: ['properties'],
    queryFn: () => fetchArray<Property>('/api/properties'),
    retry: 0,
  });

  const {
    data: appointments = [],
    isLoading: appointmentsLoading,
    isError: appointmentsError,
  } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => fetchArray<Appointment>('/api/appointments'),
    retry: 0,
  });

  const {
    data: leads = [],
    isLoading: leadsLoading,
    isError: leadsError,
  } = useQuery({
    queryKey: ['leads'],
    queryFn: () => fetchArray<Lead>('/api/leads'),
    retry: 0,
  });

  const totalProperties = properties.length;
  const availableProperties = properties.filter((p) => p.status === 'Disponible').length;
  const reservedProperties = properties.filter((p) => p.status === 'Reservado').length;

  const todayISO = new Date().toISOString().slice(0, 10);
  const todaysAppointments = appointments.filter((a) => String(a.date).slice(0, 10) === todayISO);

  const hotLeads = leads.filter((l) => l.stage === 'Caliente');

  const inventoryProgress = totalProperties > 0 ? (availableProperties / totalProperties) * 100 : 0;

  const anyApiError = propertiesError || appointmentsError || leadsError;
  const anyLoading = propertiesLoading || appointmentsLoading || leadsLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Action Center</h1>
          <p className="text-muted-foreground">Resumen general y acciones rápidas</p>
        </div>
      </div>

      {anyApiError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No se pudo cargar la data de Sheets (API). Revisa variables de entorno en Vercel y vuelve a desplegar.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado de Inventario</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-muted">
                  <span className="text-sm font-bold">{Math.round(inventoryProgress)}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-muted-foreground">{totalProperties} propiedades totales</p>
                <Progress value={inventoryProgress} className="h-2" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-green-500" />
                <span>Disponibles</span>
                <span className="ml-auto font-medium">{availableProperties}</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-2 w-2 rounded-full bg-yellow-500" />
                <span>Reservadas</span>
                <span className="ml-auto font-medium">{reservedProperties}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agenda de Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysAppointments.length}</div>
            <p className="text-xs text-muted-foreground">Citas programadas</p>
            <div className="mt-4 flex items-center justify-between">
              <Button variant="outline" size="sm" className="w-full justify-between" asChild>
                <a href="/appointments">
                  Ver Agenda <span>→</span>
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Calientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotLeads.length}</div>
            <p className="text-xs text-muted-foreground">
              {leads.length > 0 ? `+${Math.max(0, leads.filter(l => l.stage === 'Nuevo').length)} nuevo` : 'Sin datos aún'}
            </p>
            <div className="mt-4">
              <Button size="sm" className="w-full" asChild>
                <a href="/gold-list">Ver Leads</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Acciones Prioritarias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 rounded-lg border p-3">
                <div className="mt-0.5 rounded-full bg-green-100 p-1">
                  <Phone className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Seguimiento Leads</p>
                  <p className="text-sm text-muted-foreground">Revisar y contactar leads pendientes</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href="/gold-list">Ir a Lista Dorada</a>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-lg border p-3">
                <div className="mt-0.5 rounded-full bg-blue-100 p-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Citas de Hoy</p>
                  <p className="text-sm text-muted-foreground">Confirmar citas y enviar WhatsApp</p>
                  <Button variant="outline" size="sm" className="mt
