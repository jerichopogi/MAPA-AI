import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Clock, ExternalLink, Globe, Loader2, Mail, MapPin, Phone, Receipt, Search, Stamp } from "lucide-react";
import { visaQuerySchema, type VisaQueryInput } from "@shared/schema";
import { COUNTRIES } from "@shared/reference-data";
import { AiSourceBadge } from "@/components/ai-source-badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { aiApi, isQuotaError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const PURPOSES = [
  { value: "tourism", label: "Tourism" },
  { value: "business", label: "Business" },
  { value: "family", label: "Visiting family / friends" },
  { value: "education", label: "Study" },
  { value: "medical", label: "Medical" },
] as const;

export default function VisaHelp() {
  const { toast } = useToast();
  const { t } = useI18n();
  const form = useForm<VisaQueryInput>({
    resolver: zodResolver(visaQuerySchema),
    defaultValues: { destination: "", purpose: "tourism", duration: 7, hasVisitedBefore: false },
  });

  const query = useMutation({
    mutationFn: aiApi.visa,
    onError: (error) => !isQuotaError(error) && toast({ title: "Couldn't check visa rules", description: error.message, variant: "destructive" }),
  });
  const result = query.data?.data;

  return (
    <>
      <PageHeader title={t("Visa help")} description={t("Requirements for Philippine passport holders, in plain language.")} />

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <Form {...form}>
          <form noValidate onSubmit={form.handleSubmit((v) => query.mutate(v))} className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PURPOSES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Length of stay (days)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={365} {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasVisitedBefore"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  </FormControl>
                  <FormLabel className="font-normal">I've visited before</FormLabel>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={query.isPending}>
              {query.isPending ? <Loader2 className="animate-spin" /> : <Search />} Check requirements
            </Button>
          </form>
        </Form>

        <div>
          {!result ? (
            <EmptyState icon={Stamp} title="Pick a destination" description="We'll list the visa type, fees, processing time and the documents to prepare." />
          ) : (
            <div className="space-y-6 animate-fade-up">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-semibold">{result.country}</h2>
                  <p className={cn("mt-1 font-medium", result.visaRequired ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400")}>
                    {result.visaRequired ? "Visa required" : "No visa required"} · {result.visaType}
                  </p>
                </div>
                <AiSourceBadge source={query.data!.source} />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: Clock, label: "Stay allowed", value: result.stayDuration },
                  { icon: Clock, label: "Processing", value: result.processingTime },
                  { icon: Receipt, label: "Fee", value: result.fee },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{f.label}</p>
                    <p className="mt-1 text-sm font-medium">{f.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-medium">Documents to prepare</h3>
                <ul className="mt-4 space-y-2.5">
                  {result.requirements.map((r) => (
                    <li key={r} className="flex gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              {result.notes && (
                <div className="rounded-xl bg-accent p-5 text-sm text-accent-foreground">
                  <p className="font-medium">Good to know</p>
                  <p className="mt-1 leading-relaxed">{result.notes}</p>
                </div>
              )}

              <div className="rounded-xl border bg-card p-5">
                <h3 className="font-medium">{result.embassyInfo.name}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0" /> {result.embassyInfo.address}</li>
                  <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0" /> {result.embassyInfo.phone}</li>
                  <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0" /> {result.embassyInfo.email}</li>
                  <li className="flex gap-3">
                    <Globe className="h-4 w-4 shrink-0" />
                    <a href={result.embassyInfo.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                      Official website <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">Visa rules change often. Always confirm with the embassy before you apply or book.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
