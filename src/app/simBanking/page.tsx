'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CreditCard,
  Landmark,
  LockKeyhole,
  Search,
  Shield,
  Trash2,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkspaceHeader } from '@/components/headers/workspaceHeader';
import { BankingSimulatorAssistant } from '@/components/simulator/airport-simulator-assistant';
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

const initialAccounts = [
  {
    id: 'checking',
    name: 'Everyday Checking',
    number: '•••• 4821',
    balance: 2450,
  },
  { id: 'savings', name: 'Growth Savings', number: '•••• 9074', balance: 8100 },
];

const transactions = [
  {
    reference: 'TX-88421',
    merchant: 'Fresh Market',
    category: 'Groceries',
    date: 'June 10, 2026',
    amount: -84.3,
  },
  {
    reference: 'TX-88422',
    merchant: 'Northstar Payroll',
    category: 'Income',
    date: 'June 9, 2026',
    amount: 2800,
  },
  {
    reference: 'TX-88423',
    merchant: 'City Transit',
    category: 'Transport',
    date: 'June 8, 2026',
    amount: -32,
  },
  {
    reference: 'TX-88423',
    merchant: 'StreamBox',
    category: 'Entertainment',
    date: 'June 7, 2026',
    amount: -14.99,
  },
  {
    reference: 'TX-88425',
    merchant: 'Bright Energy',
    category: 'Utilities',
    date: 'June 5, 2026',
    amount: -126.4,
  },
];

const initialBeneficiaries = [
  { id: 1, name: 'Alex Morgan', account: '•••• 1182' },
  { id: 2, name: 'Riverstone Rentals', account: '•••• 3914' },
  { id: 3, name: 'Maya Patel', account: '•••• 7750' },
];

export default function BankingSimulatorPage() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [displayName, setDisplayName] = useState('there');
  const [transactionQuery, setTransactionQuery] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [beneficiaries, setBeneficiaries] = useState(initialBeneficiaries);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch('/api/account', { cache: 'no-store' });
        const data = (await response.json()) as {
          profile?: { displayName?: string };
        };
        const name = data.profile?.displayName?.trim();
        if (!response.ok || !name) return;
        setDisplayName(name.split(/\s+/)[0] ?? name);
      } catch {
        // Keep the neutral fallback if the profile cannot be loaded.
      }
    })();
  }, []);

  // Intentional defect: the advertised category search checks merchants only.
  const filteredTransactions = useMemo(
    () =>
      transactions.filter(transaction =>
        transaction.merchant
          .toLowerCase()
          .includes(transactionQuery.toLowerCase()),
      ),
    [transactionQuery],
  );

  const submitTransfer = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const fromAccount = String(form.get('from'));
    const toAccount = String(form.get('to'));
    const amount = Number(form.get('amount'));

    setAccounts(current =>
      current.map(account => {
        if (account.id === fromAccount) {
          return { ...account, balance: account.balance - amount };
        }
        if (account.id === toAccount) {
          return { ...account, balance: account.balance + amount };
        }
        return account;
      }),
    );
    setTransferMessage(
      `Transfer of $${amount.toFixed(2)} completed successfully.`,
    );
  };

  const schedulePayment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPaymentMessage(`Payment scheduled for ${form.get('payment-date')}.`);
  };

  const removeBeneficiary = (id: number) => {
    // Intentional defect: deleting any beneficiary removes the first entry.
    setBeneficiaries(current => current.slice(1));
    toast.success(`Beneficiary ${id} removed`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#ecfeff_0%,#f8fafc_40%,#ffffff_100%)] pt-14 text-foreground dark:bg-[linear-gradient(180deg,#083344_0%,#09090b_44%,#09090b_100%)]">
      <WorkspaceHeader />

      <section className="border-b border-cyan-200 bg-white/90 px-5 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-md border border-cyan-200 bg-cyan-950 shadow-sm dark:border-zinc-800">
          <div className="relative min-h-[18rem] md:min-h-[22rem]">
            <Image
              src="/images/bankSim-image.jpg"
              alt="Digital banking dashboard and financial services"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1280px"
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-950/90 via-cyan-950/55 to-cyan-950/10" />
            <div className="relative flex min-h-[18rem] flex-col justify-end gap-5 px-5 py-8 text-white md:min-h-[22rem] md:px-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge className="mb-4 bg-cyan-700 text-white">
                  Northstar Digital Banking
                </Badge>
                <h1 className="text-3xl font-bold md:text-5xl">
                  Good morning, {displayName}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-cyan-50 md:text-base">
                  Manage accounts, transfers, cards, and upcoming payments.
                </p>
              </div>
              <div className="grid gap-3 rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur sm:grid-cols-3 lg:w-[27rem]">
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-cyan-50">
                    Total available balance
                  </p>
                  <p className="mt-1 text-3xl font-bold">$11,750.00</p>
                </div>
                <div className="space-y-2 text-xs text-cyan-50">
                  <p className="flex items-center gap-2">
                    <LockKeyhole className="size-4 text-cyan-200" />
                    2FA enabled
                  </p>
                  <p className="flex items-center gap-2">
                    <Bell className="size-4 text-cyan-200" />3 alerts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-5 py-8">
        <BankingSimulatorAssistant />

        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <WalletCards className="text-cyan-700" />
            Your accounts
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map(account => (
              <Card
                key={account.number}
                className="border-cyan-200 shadow-none dark:border-zinc-800"
              >
                <CardHeader>
                  <CardDescription>{account.number}</CardDescription>
                  <CardTitle>{account.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    ${account.balance.toLocaleString('en-US')}.00
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Available balance
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Tabs defaultValue="activity">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="transfer">Transfer</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-5">
            <Card className="overflow-hidden border-cyan-200 py-0 shadow-none dark:border-zinc-800">
              <CardHeader className="border-b bg-cyan-50 py-5 dark:bg-zinc-900">
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  Search by merchant name or transaction category.
                </CardDescription>
                <div className="relative mt-3 max-w-md">
                  <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                  <Input
                    value={transactionQuery}
                    onChange={event => setTransactionQuery(event.target.value)}
                    className="pl-9"
                    placeholder="Search merchant or category..."
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-[28rem] overflow-y-auto p-0">
                <Table className="min-w-[42rem]">
                  <TableHeader className="sticky top-0 z-10 bg-card">
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction, index) => (
                      <TableRow key={`${transaction.reference}-${index}`}>
                        <TableCell className="font-mono text-xs">
                          {transaction.reference}
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.merchant}
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.amount > 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : ''
                          }`}
                        >
                          {transaction.amount > 0 ? '+' : '-'}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer" className="mt-5">
            <Card className="max-w-2xl border-cyan-200 shadow-none dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="text-cyan-700" />
                  Move money between accounts
                </CardTitle>
                <CardDescription>
                  Transfers are completed immediately.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitTransfer} className="grid gap-4">
                  <div>
                    <Label htmlFor="from-account">From account</Label>
                    <select
                      id="from-account"
                      name="from"
                      required
                      className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="to-account">To account</Label>
                    <select
                      id="to-account"
                      name="to"
                      required
                      className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {accounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" name="amount" type="number" required />
                  </div>
                  <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
                    Complete transfer
                  </Button>
                  {transferMessage && (
                    <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <ArrowDownLeft className="size-4" />
                      {transferMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-5">
            <Card className="max-w-2xl border-cyan-200 shadow-none dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Schedule a bill payment</CardTitle>
                <CardDescription>
                  Choose a payee, amount, and future payment date.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={schedulePayment} className="grid gap-4">
                  <div>
                    <Label htmlFor="payee">Payee</Label>
                    <select
                      id="payee"
                      required
                      className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      <option>Bright Energy</option>
                      <option>Riverstone Rentals</option>
                      <option>City Water</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="payment-amount">Amount</Label>
                    <Input id="payment-amount" type="number" min="1" required />
                  </div>
                  <div>
                    <Label htmlFor="payment-date">Payment date</Label>
                    <Input
                      id="payment-date"
                      name="payment-date"
                      type="date"
                      required
                    />
                  </div>
                  <Button className="bg-cyan-700 text-white hover:bg-cyan-800">
                    Schedule payment
                  </Button>
                  {paymentMessage && (
                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      {paymentMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="border-cyan-200 shadow-none dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="text-cyan-700" />
                Debit card
              </CardTitle>
              <CardDescription>Northstar debit •••• 3329</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-zinc-900 p-5 text-white">
                <div className="flex justify-between gap-3">
                  <Landmark />
                  <span className="text-sm">Debit</span>
                </div>
                <p className="mt-8 text-lg tracking-widest">
                  •••• •••• •••• 3329
                </p>
                <p className="mt-3 text-xs text-zinc-300">Expires 09/29</p>
              </div>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                onClick={() => undefined}
              >
                <Shield />
                Freeze card
              </Button>
            </CardContent>
          </Card>

          <Card className="border-cyan-200 shadow-none dark:border-zinc-800">
            <CardHeader>
              <CardTitle>Saved beneficiaries</CardTitle>
              <CardDescription>
                Manage people and organizations you can pay.
              </CardDescription>
            </CardHeader>
            <CardContent className="divide-y p-0">
              {beneficiaries.map(beneficiary => (
                <div
                  key={beneficiary.id}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-cyan-100 font-semibold text-cyan-800 dark:bg-zinc-800 dark:text-cyan-300">
                    {beneficiary.name[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{beneficiary.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {beneficiary.account}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${beneficiary.name}`}
                    onClick={() => removeBeneficiary(beneficiary.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
