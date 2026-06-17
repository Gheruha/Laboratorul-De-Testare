'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock3, Plane, RadioTower, ShieldCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AirportSimulatorAssistant } from '@/components/simulator/airport-simulator-assistant';
import { WorkspaceHeader } from '@/components/headers/workspaceHeader';

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
    | 'On Time'
    | 'Delayed'
    | 'Cancelled'
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

// 2. Data for the Departures board
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
    status: 'On Time',
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
    flight: 'W6 3711',
    airline: 'Wizz Air',
    destination: 'Bologna',
    time: '18:00',
    terminal: '2',
    gate: 'A09',
    status: 'Cancelled',
  },
];

// 3. Data for the Arrivals board
const arrivalsData: Flight[] = [
  {
    id: 1,
    flight: 'RO 202',
    airline: 'Tarom',
    origin: 'Bucharest OTP',
    time: '08:45',
    terminal: '1',
    belt: '-',
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
    status: 'On Time',
  },
  {
    id: 3,
    flight: 'OS 641',
    airline: 'Austrian',
    origin: 'Vienna',
    time: '15:35',
    terminal: '2',
    belt: '03',
    status: 'On Time',
  },
  {
    id: 4,
    flight: 'LH 1654',
    airline: 'Lufthansa',
    origin: 'Munich',
    time: '23:55',
    terminal: '1',
    belt: '-',
    status: 'Delayed',
  },
];

// 5. Announcements section (manually entered data)
const announcementsData: Announcement[] = [
  {
    id: 1,
    tip: 'Maintenance',
    mesaj:
      'Maintenance work at Terminal 2 between 13:00 - 15:00. Some gates may be changed.',
    ora: '08:00',
  },
  {
    id: 2,
    tip: 'Weather',
    mesaj:
      'Unfavorable weather conditions (dense fog) in the Munich region. Possible delays for arrivals.',
    ora: '09:15',
  },
  {
    id: 3,
    tip: 'Baggage Info',
    mesaj: 'Baggage belt no. 02 at Terminal 1 is currently out of service.',
    ora: '10:30',
  },
];

// 6. Services section (manually entered data)
const servicesData: Service[] = [
  {
    id: 1,
    serviciu: 'Business Lounge Match',
    locatie: 'Terminal 2, Floor 1',
    program: '24/7',
  },
  {
    id: 2,
    serviciu: 'AeroGourmet Restaurant',
    locatie: 'Terminal 1, Departures Area',
    program: '26:00 - 29:00',
  },
  {
    id: 3,
    serviciu: 'Short-Term Parking P1',
    locatie: 'In front of Terminal 1',
    program: '24/7',
  },
  {
    id: 4,
    serviciu: 'Special Assistance / Info Desk',
    locatie: 'Terminal 1 & 2, Ground Floor',
    program: '24/7',
  },
];

export default function AirportsSimulatorPage() {
  const [activeTab, setActiveTab] = useState<string>('departures');
  const [searchQuery, setSearchQuery] = useState<string>(' ');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // 4. Search and filtering functionality
  const filterFlights = (flights: Flight[]) => {
    return flights.filter(item => {
      const matchesSearch =
        item.flight.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.airline.toLowerCase().includes(searchQuery.toLowerCase().trim());

      if (statusFilter === 'All') return matchesSearch;
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
            className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
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
      case 'Cancelled':
        return (
          <Badge className="border border-red-300 bg-red-100 text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="border-blue-300 text-slate-600 dark:border-slate-700 dark:text-slate-400"
          >
            On Time
          </Badge>
        );
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-[linear-gradient(180deg,#eef7ff_0%,#f8fafc_38%,#ffffff_100%)] pt-14 font-sans text-foreground dark:bg-[linear-gradient(180deg,#020617_0%,#0f172a_45%,#020617_100%)] dark:text-slate-100">
      <WorkspaceHeader />
      <div className="w-full flex-grow p-4 md:p-8">
        <section className="mx-auto mb-6 max-w-7xl overflow-hidden rounded-md border border-blue-200 bg-blue-950 shadow-sm dark:border-slate-800">
          <div className="relative min-h-[18rem] md:min-h-[22rem]">
            <Image
              src="/images/airportSim_image.jpg"
              alt="Airport terminal and aircraft operations"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              className="absolute inset-0 size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-950/55 to-blue-950/10" />
            <div className="relative flex min-h-[18rem] max-w-3xl flex-col justify-end px-5 py-8 text-white md:min-h-[22rem] md:px-8">
              <Badge className="mb-4 w-fit bg-blue-500 text-white">
                AeroSim Operations
              </Badge>
              <h1 className="text-3xl font-bold md:text-5xl">
                International Airport Control Board
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 md:text-base">
                Monitor live departures, arrivals, service information, and
                operational announcements across the airport.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Bar */}
        <nav className="mb-8 w-full overflow-hidden rounded-md border border-blue-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-blue-100 bg-blue-950 px-5 py-3 text-white dark:border-slate-800">
            <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-sm bg-blue-500">
                  <Plane className="size-5" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-widest text-blue-200">
                    International Airport Operations
                  </p>
                  <p className="text-lg font-semibold">AeroSim Live Portal</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <span className="rounded-sm bg-white/10 px-3 py-2">
                  <RadioTower className="mb-1 size-4 text-blue-200" />
                  ATC normal
                </span>
                <span className="rounded-sm bg-white/10 px-3 py-2">
                  <Clock3 className="mb-1 size-4 text-blue-200" />
                  UTC +03
                </span>
                <span className="rounded-sm bg-white/10 px-3 py-2">
                  <ShieldCheck className="mb-1 size-4 text-blue-200" />
                  Security open
                </span>
              </div>
            </div>
          </div>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 p-4 md:flex-row">
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <button
                onClick={() => setActiveTab('departures')}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${activeTab === 'departures' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
              >
                Departures
              </button>
              <button
                onClick={() => setActiveTab('arrivals')}
                className={`transition-colors hover:text-blue-600 dark:hover:text-blue-400 ${activeTab === 'arrivals' ? 'font-semibold text-blue-600 dark:text-blue-400' : ''}`}
              >
                Arrivals
              </button>
              <Link
                href="#anunturi"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Announcements
              </Link>
              <Link
                href="#servicii"
                className="transition-colors hover:text-blue-600 dark:hover:text-blue-400"
              >
                Services
              </Link>
            </div>
          </div>
        </nav>

        <AirportSimulatorAssistant />

        {/* 4. Search bar and filters */}
        <div className="max-w-7xl mx-auto mb-6 p-4 border border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900/50 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by flight no., airline, or city..."
              value={searchQuery === ' ' ? '' : searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm text-foreground dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <span className="text-xs text-slate-600 dark:text-slate-400 self-center mr-2">
              Status Filter:
            </span>
            {['All', 'On Time', 'Delayed', 'Cancelled'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-100 text-slate-600 hover:bg-blue-200 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Main panels */}
        <main className="max-w-7xl mx-auto space-y-12">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full space-y-6"
          >
            <TabsList className="grid w-full max-w-xs grid-cols-2 bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
              <TabsTrigger
                value="departures"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
              >
                Departures
              </TabsTrigger>
              <TabsTrigger
                value="arrivals"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:data-[state=active]:bg-blue-500"
              >
                Arrivals
              </TabsTrigger>
            </TabsList>

            {/* 2. Departures Table */}
            <TabsContent value="departures">
              <Card className="border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground dark:text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900/50">
                  <CardTitle className="text-xl text-slate-950 dark:text-white">
                    Departures Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-blue-50 dark:bg-slate-800/40">
                        <TableRow className="border-blue-200 dark:border-slate-800">
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Flight No.
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Airline
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Destination
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Time
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                            Gate
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterFlights(departuresData).length > 0 ? (
                          filterFlights(departuresData).map(flight => (
                            <TableRow
                              key={flight.id}
                              className="border-blue-200 dark:border-slate-800 hover:bg-blue-50/80 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {flight.flight}
                              </TableCell>
                              <TableCell className="text-slate-700 dark:text-slate-300">
                                {flight.airline}
                              </TableCell>
                              <TableCell className="font-semibold text-slate-950 dark:text-white">
                                {flight.destination}
                              </TableCell>
                              <TableCell className="font-mono text-amber-600 dark:text-amber-400">
                                {flight.time}
                              </TableCell>
                              <TableCell className="text-center text-slate-700 dark:text-slate-300">
                                {flight.terminal}
                              </TableCell>
                              <TableCell className="text-center font-semibold text-slate-800 dark:text-slate-200">
                                {flight.gate || '-'}
                              </TableCell>
                              <TableCell className="text-right">
                                {getStatusBadge(flight.status)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow className="border-blue-200 dark:border-slate-800">
                            <TableCell
                              colSpan={7}
                              className="text-center p-8 text-slate-500"
                            >
                              No flights found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Arrivals Table */}
            <TabsContent value="arrivals">
              <Card className="border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground dark:text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-blue-200 dark:border-slate-800 bg-blue-50/70 dark:bg-slate-900/50">
                  <CardTitle className="text-xl text-slate-950 dark:text-white">
                    Arrivals Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-blue-50 dark:bg-slate-800/40">
                        <TableRow className="border-blue-200 dark:border-slate-800">
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Flight No.
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Airline
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Origin
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                            Time
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                            Baggage
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                            Status
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterFlights(arrivalsData).length > 0 ? (
                          filterFlights(arrivalsData).map(flight => (
                            <TableRow
                              key={flight.id}
                              className="border-blue-200 dark:border-slate-800 hover:bg-blue-50/80 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                                {flight.flight}
                              </TableCell>
                              <TableCell className="text-slate-700 dark:text-slate-300">
                                {flight.airline}
                              </TableCell>
                              <TableCell className="font-semibold text-slate-950 dark:text-white">
                                {flight.origin}
                              </TableCell>
                              <TableCell className="font-mono text-amber-600 dark:text-amber-400">
                                {flight.time}
                              </TableCell>
                              <TableCell className="text-center text-slate-700 dark:text-slate-300">
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
                          <TableRow className="border-blue-200 dark:border-slate-800">
                            <TableCell
                              colSpan={7}
                              className="text-center p-8 text-slate-500"
                            >
                              No flights found.
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

          {/* 5. Announcements section */}
          <section id="anunturi" className="scroll-mt-20">
            <Card className="border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground dark:text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-blue-200 bg-amber-50 dark:border-slate-800 dark:bg-amber-950/20">
                <CardTitle className="text-xl text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  📢 Announcements Section
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-blue-50 dark:bg-slate-800/40">
                    <TableRow className="border-blue-200 dark:border-slate-800">
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300 w-32">
                        Announcement Type
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                        Informational Message
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-right w-24">
                        Time
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {announcementsData.map(ann => (
                      <TableRow
                        key={ann.id}
                        className="border-blue-200 dark:border-slate-800 hover:bg-blue-50/80 dark:hover:bg-slate-800/20"
                      >
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/5"
                          >
                            {ann.tip}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                          {ann.mesaj}
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-600 dark:text-slate-400 text-sm">
                          {ann.ora}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* 6. Services section */}
          <section id="servicii" className="scroll-mt-20">
            <Card className="border-blue-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-foreground dark:text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-blue-200 bg-blue-50 dark:border-slate-800 dark:bg-blue-950/20">
                <CardTitle className="text-xl text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  💼 Services Section
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-blue-50 dark:bg-slate-800/40">
                    <TableRow className="border-blue-200 dark:border-slate-800">
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                        Service
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300">
                        Location
                      </TableCell>
                      <TableCell className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                        Schedule
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicesData.map(service => (
                      <TableRow
                        key={service.id}
                        className="border-blue-200 dark:border-slate-800 hover:bg-blue-50/80 dark:hover:bg-slate-800/20"
                      >
                        <TableCell className="font-medium text-slate-950 dark:text-white">
                          {service.serviciu}
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300 text-sm">
                          {service.locatie}
                        </TableCell>
                        <TableCell className="text-right text-slate-600 dark:text-slate-400 font-mono text-sm">
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

      {/* 7. Footer */}
      <footer className="w-full border-t border-blue-200 dark:border-slate-800 bg-blue-50/80 dark:bg-slate-900/60 mt-16 py-8 px-4 md:px-8 text-slate-600 dark:text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-slate-950 dark:text-white font-semibold text-base">
              Airport Contact
            </h4>
            <p className="text-xs">
              📍 Address: Airport Street no. 1, Chișinău
            </p>
            <p className="text-xs">📞 Phone: +373 22 000 000</p>
            <p className="text-xs">✉️ Email: support@aerosim-airport.md</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-slate-950 dark:text-white font-semibold text-base">
              Useful Links
            </h4>
            <ul className="text-xs space-y-1">
              <li>
                <Link
                  href="#anunturi"
                  className="transition-colors hover:text-slate-950 dark:hover:text-white"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#servicii"
                  className="transition-colors hover:text-slate-950 dark:hover:text-white"
                >
                  Special Assistance
                </Link>
              </li>
              <li>
                <Link
                  href="https://alliedtesting.com"
                  target="_blank"
                  className="text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Allied Testing
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-2 md:text-right">
            <h4 className="text-slate-950 dark:text-white font-semibold text-base">
              Schedule
            </h4>
            <p className="text-xs">Active platform for QA simulations.</p>
            <p className="text-xs text-slate-500 pt-4">
              © 2026 AeroSim. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
