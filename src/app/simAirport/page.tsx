'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
    flight: 'W6 3755',
    airline: 'Wizz Air',
    destination: 'Bologna',
    time: '18:00',
    terminal: '2',
    gate: '',
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
    mesaj:
      'Baggage belt no. 02 at Terminal 1 has been put back into operation.',
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
    program: '06:00 - 23:00',
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
      case 'Cancelled':
        return (
          <Badge className="bg-red-900 text-red-200 border border-red-700">
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-400 border-slate-700">
            On Time
          </Badge>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      <div className="p-4 md:p-8 w-full flex-grow">
        {/* Navigation Bar */}
        <nav className="w-full border border-slate-800 bg-slate-900 rounded-xl mb-8 p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-blue-400">
                ✈️ International Airport{' '}
                <span className="text-white">AeroSim</span>
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
              <button
                onClick={() => setActiveTab('departures')}
                className={`hover:text-blue-400 transition-colors ${activeTab === 'departures' ? 'text-blue-400 font-semibold' : ''}`}
              >
                Departures
              </button>
              <button
                onClick={() => setActiveTab('arrivals')}
                className={`hover:text-blue-400 transition-colors ${activeTab === 'arrivals' ? 'text-blue-400 font-semibold' : ''}`}
              >
                Arrivals
              </button>
              <Link
                href="#anunturi"
                className="hover:text-blue-400 transition-colors"
              >
                Announcements
              </Link>
              <Link
                href="#servicii"
                className="hover:text-blue-400 transition-colors"
              >
                Services
              </Link>
            </div>
          </div>
        </nav>

        {/* 4. Search bar and filters */}
        <div className="max-w-7xl mx-auto mb-6 p-4 border border-slate-800 bg-slate-900/50 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="w-full md:max-w-md">
            <input
              type="text"
              placeholder="Search by flight no. or airline..."
              value={searchQuery === ' ' ? '' : searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
            <span className="text-xs text-slate-400 self-center mr-2">
              Status Filter:
            </span>
            {['All', 'On Time', 'Delayed', 'Cancelled'].map(status => (
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

        {/* Main panels */}
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
                Departures
              </TabsTrigger>
              <TabsTrigger
                value="arrivals"
                className="data-[state=active]:bg-slate-800 data-[state=active]:text-white"
              >
                Arrivals
              </TabsTrigger>
            </TabsList>

            {/* 2. Departures Table */}
            <TabsContent value="departures">
              <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                  <CardTitle className="text-xl text-white">
                    Departures Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800/40">
                        <TableRow className="border-slate-800">
                          <TableCell className="font-semibold text-slate-300">
                            Flight No.
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Airline
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Destination
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Time
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Gate
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
              <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                  <CardTitle className="text-xl text-white">
                    Arrivals Board
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-800/40">
                        <TableRow className="border-slate-800">
                          <TableCell className="font-semibold text-slate-300">
                            Flight No.
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Airline
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Origin
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300">
                            Time
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Terminal
                          </TableCell>
                          <TableCell className="font-semibold text-slate-300 text-center">
                            Baggage
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
          <section id="anunturi" className="scroll-mt-6">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-amber-950/20">
                <CardTitle className="text-xl text-amber-400 flex items-center gap-2">
                  📢 Announcements Section
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/40">
                    <TableRow className="border-slate-800">
                      <TableCell className="font-semibold text-slate-300 w-32">
                        Announcement Type
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300">
                        Informational Message
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300 text-right w-24">
                        Time
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

          {/* 6. Services section */}
          <section id="servicii" className="scroll-mt-6">
            <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl overflow-hidden">
              <CardHeader className="border-b border-slate-800 bg-blue-950/20">
                <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                  💼 Services Section
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-800/40">
                    <TableRow className="border-slate-800">
                      <TableCell className="font-semibold text-slate-300">
                        Service
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300">
                        Location
                      </TableCell>
                      <TableCell className="font-semibold text-slate-300 text-right">
                        Schedule
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

      {/* 7. Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-900/60 mt-16 py-8 px-4 md:px-8 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-base">
              Airport Contact
            </h4>
            <p className="text-xs">
              📍 Address: Airport Street no. 1, Chișinău
            </p>
            <p className="text-xs">📞 Phone: +373 22 000 000</p>
            <p className="text-xs">✉️ Email: support@aerosim-airport.md</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-semibold text-base">Useful Links</h4>
            <ul className="text-xs space-y-1">
              <li>
                <Link
                  href="#anunturi"
                  className="hover:text-white transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="#servicii"
                  className="hover:text-white transition-colors"
                >
                  Special Assistance
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
            <h4 className="text-white font-semibold text-base">Schedule</h4>
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
