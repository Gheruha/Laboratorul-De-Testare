'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

// Descrierea tipurilor de date pentru TypeScript
interface Flight {
  id: number;
  flight: string;
  airline: string;
  destination?: string;
  origin?: string;
  time: string;
  terminal: string;
  gate?: string;
  belt?: string;
  status: string;
}

// 2. Date pentru tabelul de plecări
const departuresData: Flight[] = [
  {
    id: 1,
    flight: 'W6 3711',
    airline: 'Wizz Air',
    destination: 'London Luton',
    time: '06:15',
    terminal: '1',
    gate: 'A12',
    status: 'Departed',
  },
  {
    id: 2,
    flight: 'RO 201',
    airline: 'Tarom',
    destination: 'Bucharest OTP',
    time: '07:30',
    terminal: '1',
    gate: 'B03',
    status: 'Boarding',
  },
  {
    id: 3,
    flight: 'LH 1653',
    airline: 'Lufthansa',
    destination: 'Munich',
    time: '11:45',
    terminal: '2',
    gate: 'A01',
    status: 'Scheduled',
  },
  {
    id: 4,
    flight: 'FR 405',
    airline: 'Ryanair',
    destination: 'Milan Bergamo',
    time: '14:20',
    terminal: '1',
    gate: 'B05',
    status: 'Delayed',
  },
  {
    id: 5,
    flight: 'W6 3755',
    airline: 'Wizz Air',
    destination: 'Bologna',
    time: '18:00',
    terminal: '2',
    gate: '',
    status: 'Scheduled',
  }, // Bug special: lipsește poarta de îmbarcare
];

// 3. Date pentru tabelul de sosiri
const arrivalsData: Flight[] = [
  {
    id: 1,
    flight: 'RO 202',
    airline: 'Tarom',
    origin: 'Bucharest OTP',
    time: '08:45',
    terminal: '1',
    belt: '01',
    status: 'Landed',
  },
  {
    id: 2,
    flight: 'W6 3712',
    airline: 'Wizz Air',
    origin: 'London Luton',
    time: '12:10',
    terminal: '1',
    belt: '02',
    status: 'Expected',
  },
  {
    id: 3,
    flight: 'OS 641',
    airline: 'Austrian',
    origin: 'Vienna',
    time: '15:35',
    terminal: '2',
    belt: '03',
    status: 'Scheduled',
  },
  {
    id: 4,
    flight: 'LH 1654',
    airline: 'Lufthansa',
    origin: 'Munich',
    time: '23:55',
    terminal: '1',
    belt: '-',
    status: 'Scheduled',
  }, // Bug: cratimă pe banda de bagaje
];

export default function AirportsSimulatorPage() {
  const [activeTab, setActiveTab] = useState<string>('departures');

  // Funcție pentru stilizarea badge-urilor de status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Departed':
      case 'Landed':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          >
            Landed / Departed
          </Badge>
        );
      case 'Boarding':
        return (
          <Badge className="bg-amber-500 text-black font-bold animate-pulse">
            Boarding
          </Badge>
        );
      case 'Delayed':
        return <Badge variant="destructive">Delayed</Badge>;
      default:
        return (
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            Scheduled
          </Badge>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* 1. BARA INTERNĂ DE NAVIGARE */}
      <nav className="w-full border border-slate-800 bg-slate-900 rounded-xl mb-8 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Numele platformei / aeroportului */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight text-blue-400">
              ✈️ Aeroportul Internațional{' '}
              <span className="text-white">AeroSim</span>
            </span>
          </div>

          {/* Linkuri rapide în interiorul componentei */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('departures')}
              className={`hover:text-blue-400 transition-colors ${activeTab === 'departures' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Plecări (Departures)
            </button>
            <button
              onClick={() => setActiveTab('arrivals')}
              className={`hover:text-blue-400 transition-colors ${activeTab === 'arrivals' ? 'text-blue-400 font-semibold' : ''}`}
            >
              Sosiri (Arrivals)
            </button>
            <a
              href="#announcements"
              className="hover:text-blue-400 transition-colors"
            >
              Anunțuri (Announcements)
            </a>
            <a
              href="#services"
              className="hover:text-blue-400 transition-colors"
            >
              Servicii (Services)
            </a>
          </div>
        </div>
      </nav>

      {/* CONȚINUTUL CU TABELE */}
      <main className="max-w-7xl mx-auto space-y-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full space-y-6"
        >
          <TabsList className="grid w-full max-w-xs grid-cols-2 bg-slate-900 border border-slate-800 text-slate-400">
            <TabsTrigger
              value="departures"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Plecări
            </TabsTrigger>
            <TabsTrigger
              value="arrivals"
              className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
            >
              Sosiri
            </TabsTrigger>
          </TabsList>

          {/* 2. TABELUL DE PLECĂRI */}
          <TabsContent value="departures">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-xl text-white">
                  Tabelul de Plecări / Departures Board
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Mod de simulare pentru controlul calității testării.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Versiunea pentru desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-800/40">
                      <TableRow className="border-slate-800">
                        <TableCell className="font-semibold text-slate-300">
                          № Zbor (Flight)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Companie (Airline)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Destinație (Destination)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Ora (Time)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-center">
                          Terminal
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-center">
                          Poarta (Gate)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-right">
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departuresData.map(flight => (
                        <TableRow
                          key={flight.id}
                          className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <TableCell className="font-mono font-bold text-blue-400">
                            {flight.flight}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {flight.airline}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {flight.destination}
                          </TableCell>
                          <TableCell className="font-mono text-amber-400">
                            {flight.time}
                          </TableCell>
                          <TableCell className="text-center text-slate-300">
                            {flight.terminal}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-slate-200">
                            {flight.gate || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(flight.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Versiunea mobilă (Adaptivă pentru smartphone-uri) */}
                <div className="block md:hidden divide-y divide-slate-800">
                  {departuresData.map(flight => (
                    <div key={flight.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-400 text-lg">
                          {flight.flight}
                        </span>
                        {getStatusBadge(flight.status)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {flight.airline} ➔{' '}
                          <strong className="text-white">
                            {flight.destination}
                          </strong>
                        </span>
                        <span className="font-mono text-amber-400">
                          {flight.time}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">
                        <div>
                          Terminal:{' '}
                          <span className="font-semibold text-slate-200">
                            {flight.terminal}
                          </span>
                        </div>
                        <div>
                          Poarta:{' '}
                          <span className="font-semibold text-slate-200">
                            {flight.gate || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. TABELUL DE SOSIRI */}
          <TabsContent value="arrivals">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                <CardTitle className="text-xl text-white">
                  Tabelul de Sosiri / Arrivals Board
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Verificarea benzilor de bagaje și a timpului de sosire.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Versiunea pentru desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader className="bg-slate-800/40">
                      <TableRow className="border-slate-800">
                        <TableCell className="font-semibold text-slate-300">
                          № Zbor (Flight)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Companie (Airline)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Plecare Din (Origin)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300">
                          Ora (Time)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-center">
                          Terminal
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-center">
                          Banda Bagaje (Belt)
                        </TableCell>
                        <TableCell className="font-semibold text-slate-300 text-right">
                          Status
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {arrivalsData.map(flight => (
                        <TableRow
                          key={flight.id}
                          className="border-slate-800 hover:bg-slate-800/30 transition-colors"
                        >
                          <TableCell className="font-mono font-bold text-blue-400">
                            {flight.flight}
                          </TableCell>
                          <TableCell className="text-slate-300">
                            {flight.airline}
                          </TableCell>
                          <TableCell className="font-semibold text-white">
                            {flight.origin}
                          </TableCell>
                          <TableCell className="font-mono text-amber-400">
                            {flight.time}
                          </TableCell>
                          <TableCell className="text-center text-slate-300">
                            {flight.terminal}
                          </TableCell>
                          <TableCell className="text-center font-semibold text-amber-500">
                            {flight.belt}
                          </TableCell>
                          <TableCell className="text-right">
                            {getStatusBadge(flight.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Versiunea mobilă */}
                <div className="block md:hidden divide-y divide-slate-800">
                  {arrivalsData.map(flight => (
                    <div key={flight.id} className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-blue-400 text-lg">
                          {flight.flight}
                        </span>
                        {getStatusBadge(flight.status)}
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">
                          {flight.airline} din{' '}
                          <strong className="text-white">
                            {flight.origin}
                          </strong>
                        </span>
                        <span className="font-mono text-amber-400">
                          {flight.time}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-slate-400 bg-slate-950 p-2 rounded-lg">
                        <div>
                          Terminal:{' '}
                          <span className="font-semibold text-slate-200">
                            {flight.terminal}
                          </span>
                        </div>
                        <div>
                          Banda:{' '}
                          <span className="font-semibold text-amber-500">
                            {flight.belt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
