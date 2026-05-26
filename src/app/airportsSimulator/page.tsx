'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
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
  status:
    | 'La timp'
    | 'Întârziat'
    | 'Anulat'
    | 'Boarding'
    | 'Departed'
    | 'Landed';
}

interface Announcement {
  id: number;
  tip: string;
  mesaj: string;
  ora: string;
}

interface Service {
  id: number;
  serviciu: string;
  locatie: string;
  program: string;
}

// 2. Date pentru panoul de Plecări
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
    status: 'La timp',
  },
  {
    id: 4,
    flight: 'FR 405',
    airline: 'Ryanair',
    destination: 'Milan Bergamo',
    time: '14:20',
    terminal: '1',
    gate: 'B05',
    status: 'Întârziat',
  },
  {
    id: 5,
    flight: 'W6 3755',
    airline: 'Wizz Air',
    destination: 'Bologna',
    time: '18:00',
    terminal: '2',
    gate: '',
    status: 'Anulat',
  },
];

// 3. Date pentru panoul de Sosiri
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
    status: 'La timp',
  },
  {
    id: 3,
    flight: 'OS 641',
    airline: 'Austrian',
    origin: 'Vienna',
    time: '15:35',
    terminal: '2',
    belt: '03',
    status: 'La timp',
  },
  {
    id: 4,
    flight: 'LH 1654',
    airline: 'Lufthansa',
    origin: 'Munich',
    time: '23:55',
    terminal: '1',
    belt: '-',
    status: 'Întârziat',
  },
];

// 5. Secțiunea de anunțuri (Date introduse manual)
const announcementsData: Announcement[] = [
  {
    id: 1,
    tip: 'Mentenanță',
    mesaj:
      'Lucrări de mentenanță la Terminalul 2 între orele 13:00 - 15:00. Unele porți pot fi modificate.',
    ora: '08:00',
  },
  {
    id: 2,
    tip: 'Meteo',
    mesaj:
      'Condiții meteo nefavorabile (ceață densă) în regiunea München. Posibile întârzieri la sosiri.',
    ora: '09:15',
  },
  {
    id: 3,
    tip: 'Info Bagaje',
    mesaj:
      'Banda de bagaje nr. 02 de la Terminalul 1 a fost repusă în funcțiune.',
    ora: '10:30',
  },
];

// 6. Secțiunea de servicii (Date introduse manual)
const servicesData: Service[] = [
  {
    id: 1,
    serviciu: 'Business Lounge Match',
    locatie: 'Terminal 2, Etaj 1',
    program: 'Non-stop',
  },
  {
    id: 2,
    serviciu: 'Restaurant AeroGourmet',
    locatie: 'Terminal 1, Zona Plecări',
    program: '06:00 - 23:00',
  },
  {
    id: 3,
    serviciu: 'Parcare Termen Scurt P1',
    locatie: 'În fața Terminalului 1',
    program: 'Non-stop',
  },
  {
    id: 4,
    serviciu: 'Asistență Specială / Info Desk',
    locatie: 'Terminal 1 & 2, Parter',
    program: 'Non-stop',
  },
];

export default function AirportsSimulatorPage() {
  const [activeTab, setActiveTab] = useState<string>('departures');
  const [searchQuery, setSearchQuery] = useState<string>(' ');
  const [statusFilter, setStatusFilter] = useState<string>('Toate');

  // 4. Funcționalitatea de căutare și filtrare
  const filterFlights = (flights: Flight[]) => {
    return flights.filter(item => {
      const matchesSearch =
        item.flight.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.airline.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (statusFilter === 'Toate') return matchesSearch;
      return matchesSearch && item.status === statusFilter;
    });
  };

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
      case 'Întârziat':
        return <Badge variant="destructive">Întârziat</Badge>;
      case 'Anulat':
        return (
          <Badge className="bg-red-900 text-red-200 border border-red-700">
            Anulat
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            La timp
          </Badge>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div className="p-4 md:p-8 w-full flex-grow">
        {/* Bara de Navigare */}
        <nav className="w-full border border-slate-800 bg-slate-900 rounded-xl mb-8 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-blue-400">
                ✈️ Aeroportul Internațional{' '}
                <span className="text-white">AeroSim</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
              <button
                onClick={() => setActiveTab('departures')}
                className={`hover:text-blue-400 transition-colors ${activeTab === 'departures' ? 'text-blue-400 font-semibold' : ''}`}
              >
                Plecări
              </button>
              <button
                onClick={() => setActiveTab('arrivals')}
                className={`hover:text-blue-400 transition-colors ${activeTab === 'arrivals' ? 'text-blue-400 font-semibold' : ''}`}
              >
                Sosiri
              </button>
              <Link
                href="#anunturi"
                className="hover:text-blue-400 transition-colors"
              >
                Anunțuri
              </Link>
              <Link
                href="#servicii"
                className="hover:text-blue-400 transition-colors"
              >
                Servicii
              </Link>
            </div>
          </div>
        </nav>

        {/* 4. Bara de căutare și filtre */}
        <div className="max-w-7xl mx-auto mb-6 p-4 border border-slate-800 bg-slate-900/50 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              placeholder="Caută după nr. zbor sau companie..."
              value={searchQuery === ' ' ? '' : searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <span className="text-xs text-slate-400 self-center mr-2">
              Filtru Status:
            </span>
            {['Toate', 'La timp', 'Întârziat', 'Anulat'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Panouri principale */}
        <main className="max-w-7xl mx-auto space-y-12">
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

            {/* 2. Tabelul de Plecări */}
            <TabsContent value="departures">
              <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                  <CardTitle className="text-xl text-white">
                    Panoul de Plecări
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800/40">
                        <TableRow className="border-slate-800">
                          <TableCell className="font-semibold text-slate-300">
                            Nr. Zbor
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Companie
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Destinație
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Ora
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Poartă
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-right">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterFlights(departuresData).length > 0 ? (
                          filterFlights(departuresData).map(flight => (
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
                          ))
                        ) : (
                          <TableRow className="border-slate-800">
                            <TableCell
                              colSpan={7}
                              className="text-center p-8 text-slate-500"
                            >
                              Nu s-au găsit zboruri.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Tabelul de Sosiri */}
            <TabsContent value="arrivals">
              <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                  <CardTitle className="text-xl text-white">
                    Panoul de Sosiri
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800/40">
                        <TableRow className="border-slate-800">
                          <TableCell className="font-semibold text-slate-300">
                            Nr. Zbor
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Companie
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Origine
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Ora
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Bagaje
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-right">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterFlights(arrivalsData).length > 0 ? (
                          filterFlights(arrivalsData).map(flight => (
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
                          ))
                        ) : (
                          <TableRow className="border-slate-800">
                            <TableCell
                              colSpan={7}
                              className="text-center p-8 text-slate-500"
                            >
                              Nu s-au găsit zboruri.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* 5. Secțiunea de anunțuri */}
          <section id="anunturi" className="scroll-mt-6">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-amber-950/20">
                <CardTitle className="text-xl text-amber-400 flex items-center gap-2">
                  📢 Secțiunea de Anunțuri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/40">
                    <TableRow className="border-slate-800">
                      <TableCell className="font-semibold text-slate-300 w-32">
                        Tip Anunț
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300">
                        Mesaj Informativ
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300 text-right w-24">
                        Ora
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcementsData.map(ann => (
                      <TableRow
                        key={ann.id}
                        className="border-slate-800 hover:bg-slate-800/20"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-amber-400 border-amber-500/30 bg-amber-500/5"
                          >
                            {ann.tip}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {ann.mesaj}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-400 text-sm">
                          {ann.ora}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* 6. Secțiunea de servicii */}
          <section id="servicii" className="scroll-mt-6">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-blue-950/20">
                <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                  💼 Secțiunea de Servicii
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/40">
                    <TableRow className="border-slate-800">
                      <TableCell className="font-semibold text-slate-300">
                        Serviciu
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300">
                        Locație
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300 text-right">
                        Program
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesData.map(service => (
                      <TableRow
                        key={service.id}
                        className="border-slate-800 hover:bg-slate-800/20"
                      >
                        <TableCell className="font-medium text-white">
                          {service.serviciu}
                        </TableCell>
                        <TableCell className="text-slate-300 text-sm">
                          {service.locatie}
                        </TableCell>
                        <TableCell className="text-right text-slate-400 font-mono text-sm">
                          {service.program}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>

      {/* 7. Subsolul paginii */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/60 mt-16 py-8 px-4 md:px-8 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-base">
              Contact Aeroport
            </h4>
            <p className="text-xs">
              📍 Adresă: Str. Aeroportului nr. 1, Chișinău
            </p>
            <p className="text-xs">📞 Telefon: +373 22 000 000</p>
            <p className="text-xs">✉️ Email: support@aerosim-airport.md</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-base">
              Linkuri Utile
            </h4>
            <ul className="text-xs space-y-1">
              <li>
                <Link
                  href="#anunturi"
                  className="hover:text-white transition-colors"
                >
                  Termeni și Condiții
                </Link>
              </li>
              <li>
                <Link
                  href="#servicii"
                  className="hover:text-white transition-colors"
                >
                  Asistență Specială
                </Link>
              </li>
              <li>
                <Link
                  href="https://alliedtesting.com"
                  target="_blank"
                  className="hover:text-white text-blue-400 transition-colors"
                >
                  Allied Testing
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 md:text-right">
            <h4 className="text-white font-semibold text-base">Program</h4>
            <p className="text-xs">Platformă activă pentru simulări QA.</p>
            <p className="text-xs text-slate-500 pt-4">
              © 2026 AeroSim. Toate drepturile rezervate.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
