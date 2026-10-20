import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { packageRequestSchema, type PackageRequestInput } from "@shared/schema";
import { COUNTRIES, PREFERENCES } from "@shared/reference-data";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { requireSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const BUDGETS = ["Under ₱25,000", "₱25,000 – ₱50,000", "₱50,000 – ₱100,000", "Above ₱100,000"];

export default function TravelPackage() {
  const { user, displayName } = useAuth();
  const { toast } = useToast();

  const form = useForm<PackageRequestInput>({
    resolver: zodResolver(packageRequestSchema),
    defaultValues: {
      name: displayName,
      email: user?.email ?? "",
      phone: "",
      contactMethod: "email",
      destination: "",
      travelDates: "",
      adults: 2,
      children: 0,
      budgetRange: "",
      interests: [],
      message: "",
    },
  });

  const submit = useMutation({
    mutationFn: async (v: PackageRequestInput) => {
      const { error } = await requireSupabase().from("package_requests").insert({
        name: v.name,
        email: v.email,
        phone: v.phone,
        contact_method: v.contactMethod,
        destination: v.destination,
        travel_dates: v.travelDates || null,
        adults: v.adults,
        children: v.children,
        budget_range: v.budgetRange,
        interests: v.interests,
        message: v.message || null,
      });
      if (error) throw error;
    },
    onError: (error) => toast({ title: "Couldn't send request", description: error.message, variant: "destructive" }),
  });

  if (submit.isSuccess) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-semibold">Request received</h1>
        <p className="mt-2 text-muted-foreground">A travel specialist will reach out within one business day with package options.</p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            form.reset();
            submit.reset();
          }}
        >
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Package quote" description="Prefer someone to handle the bookings? Tell us what you want and we'll send a quote." />

      <Form {...form}>
        <form noValidate onSubmit={form.handleSubmit((v) => submit.mutate(v))} className="max-w-2xl space-y-8">
          <section className="grid gap-5 sm:grid-cols-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input type="tel" placeholder="+63 9XX XXX XXXX" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactMethod" render={({ field }) => (
              <FormItem>
                <FormLabel>Best way to reach you</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp / Viber</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )} />
          </section>

          <section className="grid gap-5 border-t pt-8 sm:grid-cols-2">
            <FormField control={form.control} name="destination" render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Choose a destination" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {COUNTRIES.map((c) => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                    <SelectItem value="Other">Somewhere else</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="travelDates" render={({ field }) => (
              <FormItem>
                <FormLabel>Travel dates</FormLabel>
                <FormControl><Input placeholder="e.g. Late March, 6 nights" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="adults" render={({ field }) => (
                <FormItem>
                  <FormLabel>Adults</FormLabel>
                  <FormControl><Input type="number" min={1} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 1)} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="children" render={({ field }) => (
                <FormItem>
                  <FormLabel>Children</FormLabel>
                  <FormControl><Input type="number" min={0} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="budgetRange" render={({ field }) => (
              <FormItem>
                <FormLabel>Budget per person</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Choose a range" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {BUDGETS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          </section>

          <FormField control={form.control} name="interests" render={({ field }) => (
            <FormItem className="border-t pt-8">
              <FormLabel>Interests</FormLabel>
              <div className="flex flex-wrap gap-2 pt-1">
                {PREFERENCES.map((p) => {
                  const on = field.value.includes(p.code);
                  return (
                    <button
                      key={p.code}
                      type="button"
                      aria-pressed={on}
                      onClick={() => field.onChange(on ? field.value.filter((v) => v !== p.code) : [...field.value, p.code])}
                      className={cn("rounded-full border px-3.5 py-1.5 text-sm transition-colors", on ? "border-primary bg-accent text-accent-foreground" : "hover:bg-muted")}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </FormItem>
          )} />

          <FormField control={form.control} name="message" render={({ field }) => (
            <FormItem>
              <FormLabel>Anything else?</FormLabel>
              <FormControl><Textarea rows={4} placeholder="Special occasions, accessibility needs, must-see places…" {...field} /></FormControl>
            </FormItem>
          )} />

          <Button type="submit" size="lg" disabled={submit.isPending}>
            {submit.isPending ? <Loader2 className="animate-spin" /> : <Send />} Request a quote
          </Button>
        </form>
      </Form>
    </>
  );
}
