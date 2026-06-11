'use client';

import { FormEvent, useMemo, useState } from 'react';
import {
  CalendarDays,
  HeartPulse,
  Hospital,
  Megaphone,
  Search,
  Stethoscope,
  Users,
} from 'lucide-react';
import { WorkspaceHeader } from '@/components/headers/workspaceHeader';
import { HospitalSimulatorAssistant } from '@/components/simulator/airport-simulator-assistant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Doctor {
  name: string;
  specialty: string;
  department: string;
  license: string;
  status: 'Available' | 'Unavailable';
}

const doctors: Doctor[] = [
  {
    name: 'Emily Carter',
    specialty: 'Cardiology',
    department: 'Cardiology',
    license: 'MED-2048',
    status: 'Available',
  },
  {
    name: 'Noah Williams',
    specialty: 'Neurology',
    department: 'Neurology',
    license: 'MED-2048',
    status: 'Available',
  },
  {
    name: 'Sophia Miller',
    specialty: 'Cardiology',
    department: 'Cardiology',
    license: 'MED-3112',
    status: 'Available',
  },
  {
    name: 'James Wilson',
    specialty: 'Orthopedics',
    department: 'Orthopedics',
    license: 'MED-4410',
    status: 'Available',
  },
  {
    name: 'Olivia Brown',
    specialty: 'Dermatology',
    department: 'Dermatology',
    license: 'MED-5521',
    status: 'Unavailable',
  },
  {
    name: 'Liam Davis',
    specialty: 'Pediatrics',
    department: 'Pediatrics',
    license: 'MED-6630',
    status: 'Available',
  },
  {
    name: 'Ava Thompson',
    specialty: 'Cardiology',
    department: 'Cardiology',
    license: 'MED-7102',
    status: 'Available',
  },
  {
    name: 'Ethan Moore',
    specialty: 'Oncology',
    department: 'Oncology',
    license: 'MED-7233',
    status: 'Available',
  },
  {
    name: 'Mia Taylor',
    specialty: 'Radiology',
    department: 'Radiology',
    license: 'MED-7304',
    status: 'Available',
  },
  {
    name: 'Lucas Anderson',
    specialty: 'Surgery',
    department: 'General Surgery',
    license: 'MED-7415',
    status: 'Available',
  },
  {
    name: 'Amelia Thomas',
    specialty: 'Psychiatry',
    department: 'Psychiatry',
    license: 'MED-7526',
    status: 'Available',
  },
  {
    name: 'Henry Jackson',
    specialty: 'Ophthalmology',
    department: 'Ophthalmology',
    license: 'MED-7637',
    status: 'Available',
  },
  {
    name: 'Isabella White',
    specialty: 'ENT',
    department: 'ENT',
    license: 'MED-7748',
    status: 'Available',
  },
  {
    name: 'Alexander Harris',
    specialty: 'Urology',
    department: 'Urology',
    license: 'MED-7859',
    status: 'Available',
  },
  {
    name: 'Charlotte Martin',
    specialty: 'Endocrinology',
    department: 'Endocrinology',
    license: 'MED-7960',
    status: 'Available',
  },
  {
    name: 'Benjamin Garcia',
    specialty: 'Emergency Medicine',
    department: 'Emergency',
    license: 'MED-8071',
    status: 'Available',
  },
  {
    name: 'Harper Martinez',
    specialty: 'Family Medicine',
    department: 'Family Medicine',
    license: 'MED-8182',
    status: 'Available',
  },
  {
    name: 'Daniel Robinson',
    specialty: 'Neurology',
    department: 'Neurology',
    license: 'MED-8293',
    status: 'Available',
  },
  {
    name: 'Evelyn Clark',
    specialty: 'Orthopedics',
    department: 'Orthopedics',
    license: 'MED-8304',
    status: 'Available',
  },
  {
    name: 'Matthew Rodriguez',
    specialty: 'Pediatrics',
    department: 'Pediatrics',
    license: 'MED-8415',
    status: 'Available',
  },
  {
    name: 'Abigail Lewis',
    specialty: 'Oncology',
    department: 'Oncology',
    license: 'MED-8526',
    status: 'Available',
  },
  {
    name: 'Sebastian Lee',
    specialty: 'Radiology',
    department: 'Radiology',
    license: 'MED-8637',
    status: 'Available',
  },
  {
    name: 'Ella Walker',
    specialty: 'Surgery',
    department: 'General Surgery',
    license: 'MED-8748',
    status: 'Available',
  },
  {
    name: 'Jack Hall',
    specialty: 'Dermatology',
    department: 'Dermatology',
    license: 'MED-8859',
    status: 'Available',
  },
  {
    name: 'Scarlett Allen',
    specialty: 'Emergency Medicine',
    department: 'Emergency',
    license: 'MED-8960',
    status: 'Available',
  },
];

const departments = [
  ['Cardiology', '4', 'Heart and vascular care'],
  ['Neurology', '2', 'Brain and nervous system'],
  ['Orthopedics', '2', 'Bones, joints, and mobility'],
  ['Dermatology', '2', 'Skin health'],
  ['Pediatrics', '2', 'Children and adolescent care'],
  ['Oncology', '2', 'Cancer diagnosis and treatment'],
  ['Radiology', '2', 'Diagnostic imaging'],
  ['General Surgery', '2', 'Surgical procedures'],
  ['Psychiatry', '1', 'Mental health services'],
  ['Ophthalmology', '1', 'Eye care'],
  ['ENT', '1', 'Ear, nose, and throat'],
  ['Urology', '1', 'Urinary system care'],
  ['Endocrinology', '1', 'Hormone-related care'],
  ['Emergency', '2', '24-hour urgent care'],
  ['Family Medicine', '1', 'Primary and preventive care'],
];

const announcements = [
  [
    'Emergency Entrance Renovation',
    'The emergency entrance will move temporarily from June 15.',
  ],
  [
    'Flu Vaccination Campaign',
    'Free seasonal flu vaccinations are available every weekday.',
  ],
  [
    'New MRI Equipment',
    'Our radiology department has installed a new MRI scanner.',
  ],
  ['Blood Donation Day', 'Join the community blood donation event on June 22.'],
  ['Visitor Hours Update', 'Visitor hours now end at 20:00 on weekdays.'],
];

export default function HospitalSimulatorPage() {
  const [doctorQuery, setDoctorQuery] = useState('');
  const [departmentQuery, setDepartmentQuery] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<
    number | null
  >(null);
  const [contactSaved, setContactSaved] = useState(false);

  // Intentional functional defect: advertised specialty search checks names only.
  const filteredDoctors = useMemo(
    () =>
      doctors.filter(doctor =>
        doctor.name.toLowerCase().includes(doctorQuery.toLowerCase()),
      ),
    [doctorQuery],
  );
  const filteredDepartments = departments.filter(department =>
    department[0].toLowerCase().includes(departmentQuery.toLowerCase()),
  );

  const ignoreAppointment = (event: FormEvent) => event.preventDefault();
  const saveContact = (event: FormEvent) => {
    event.preventDefault();
    setContactSaved(true);
  };

  return (
    <div className="min-h-screen bg-emerald-50/50 pt-14 text-foreground dark:bg-zinc-950">
      <WorkspaceHeader />

      <section className="border-b border-emerald-200 bg-white px-5 py-10 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl">
          <Badge className="mb-4 bg-emerald-600 text-white">
            PrivateMed Portal
          </Badge>
          <h1 className="max-w-3xl text-3xl font-bold md:text-5xl">
            Welcome to PrivateMed Hospital
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Find specialists, explore departments, and manage your healthcare
            appointments.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-5 py-8">
        <HospitalSimulatorAssistant />

        <Tabs defaultValue="doctors">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="doctors">
              <Stethoscope /> Doctors
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Hospital /> Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-5">
            <Card className="overflow-hidden border-emerald-200 py-0 shadow-none dark:border-zinc-800">
              <CardHeader className="border-b bg-emerald-50 py-5 dark:bg-zinc-900">
                <CardTitle>Doctor Directory</CardTitle>
                <CardDescription>
                  Search by doctor name or specialty.
                </CardDescription>
                <div className="relative mt-3 max-w-md">
                  <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input
                    value={doctorQuery}
                    onChange={event => setDoctorQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search name or specialty..."
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[32rem] overflow-y-auto p-0">
                <Table className="min-w-[44rem]">
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDoctors.map(doctor => (
                      <TableRow key={`${doctor.name}-${doctor.license}`}>
                        <TableCell className="font-medium">
                          {doctor.name}
                        </TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.department}</TableCell>
                        <TableCell className="font-mono">
                          {doctor.license}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              doctor.status === 'Available'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {doctor.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="mt-5">
            <Card className="overflow-hidden border-emerald-200 py-0 shadow-none dark:border-zinc-800">
              <CardHeader className="border-b bg-emerald-50 py-5 dark:bg-zinc-900">
                <CardTitle>Hospital Departments</CardTitle>
                <div className="relative mt-3 max-w-md">
                  <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input
                    value={departmentQuery}
                    onChange={event => setDepartmentQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Filter departments..."
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Department</TableHead>
                      <TableHead>Doctors</TableHead>
                      <TableHead>Services</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDepartments.map(department => (
                      <TableRow key={department[0]}>
                        <TableCell className="font-medium">
                          {department[0]}
                        </TableCell>
                        <TableCell>{department[1]}</TableCell>
                        <TableCell>{department[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Megaphone className="text-emerald-600" /> Announcements
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {announcements.map((announcement, index) => (
              <button
                key={announcement[0]}
                type="button"
                onClick={() => setSelectedAnnouncement(index)}
                className="rounded-md border border-emerald-200 bg-white p-4 text-left transition-colors hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
              >
                <p className="font-medium">{announcement[0]}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {announcement[1]}
                </p>
              </button>
            ))}
          </div>
          {selectedAnnouncement !== null && (
            <Card className="mt-4 border-emerald-300 shadow-none">
              <CardHeader>
                <CardTitle>{announcements[selectedAnnouncement][0]}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {selectedAnnouncement === 0
                  ? announcements[1][1]
                  : announcements[selectedAnnouncement][1]}
              </CardContent>
            </Card>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-emerald-200 shadow-none dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="text-emerald-600" /> Book an
                Appointment
              </CardTitle>
              <CardDescription>
                Select a doctor, date, and available time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={ignoreAppointment} className="grid gap-4">
                <div>
                  <Label htmlFor="patient">Patient name</Label>
                  <Input id="patient" required />
                </div>
                <div>
                  <Label htmlFor="doctor">Doctor</Label>
                  <select
                    id="doctor"
                    required
                    className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select doctor</option>
                    {doctors.map(doctor => (
                      <option key={doctor.name}>
                        {doctor.name} — {doctor.status}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <select
                      id="time"
                      required
                      className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option>09:00</option>
                      <option>11:30</option>
                      <option>15:00</option>
                    </select>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Confirm Appointment
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 shadow-none dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-emerald-600" /> Contact Details
              </CardTitle>
              <CardDescription>
                Save your preferred contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveContact} className="grid gap-4">
                <div>
                  <Label htmlFor="contact-name">Full name</Label>
                  <Input id="contact-name" required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" required />
                </div>
                <Button type="submit" variant="outline">
                  Save Contact Details
                </Button>
                {contactSaved && (
                  <p className="flex items-center gap-2 text-sm text-emerald-700">
                    <HeartPulse className="size-4" /> Contact details saved
                    successfully.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
