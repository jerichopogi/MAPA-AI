import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import type { AiSource, ChatInput } from "@shared/schema";
import { AiSourceBadge } from "@/components/ai-source-badge";
import { FormattedText } from "@/components/formatted-text";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { aiApi, isQuotaError } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Message = ChatInput["messages"][number];

const SUGGESTIONS = [
  "What customs should I follow when visiting temples in Kyoto?",
  "What festivals happen in Thailand in November?",
  "Which Korean dishes should I try in Busan?",
  "Is ₱40,000 enough for 4 days in Tokyo?",
];

const SUGGESTIONS_TL = [
  "Ano ang dapat kong tandaan pag bibisita sa mga temple sa Kyoto?",
  "Anong mga festival ang meron sa Thailand tuwing November?",
  "Anong Korean food ang dapat kong i-try sa Busan?",
  "Kasya ba ang ₱40,000 para sa 4 days sa Tokyo?",
];

export default function Assistant() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<AiSource | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const send = useMutation({
    mutationFn: aiApi.chat,
    onSuccess: (res) => {
      setSource(res.source);
      setMessages((m) => [...m, { role: "assistant", content: res.data }]);
    },
    onError: (error) => {
      setMessages((m) => [...m, { role: "assistant", content: `Sorry — ${error.message}` }]);
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, send.isPending]);

  function submit(text: string) {
    const content = text.trim();
    if (!content || send.isPending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setDraft("");
    // Keep the request small: only the most recent turns are sent.
    send.mutate({ messages: next.slice(-20) });
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl sm:text-4xl">{t("Assistant")}</h1>
          <p className="mt-1.5 text-muted-foreground">{t("Ask about countries, places, culture, traditions and trip planning.")}</p>
        </div>
        {source && <AiSourceBadge source={source} />}
      </div>

      <div className="flex-1 space-y-4">
        {messages.length === 0 && (
          <div className="rounded-xl border border-dashed p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" /> {t("Try asking")}
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {(lang === "tl" ? SUGGESTIONS_TL : SUGGESTIONS).map((s) => (
                <button key={s} onClick={() => submit(s)} className="rounded-lg border bg-card px-4 py-3 text-left text-sm transition-colors hover:border-primary/40">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                m.role === "user" ? "bg-primary text-primary-foreground" : "border bg-card",
              )}
            >
              {m.role === "assistant" ? <FormattedText text={m.content} /> : <span className="whitespace-pre-line">{m.content}</span>}
            </div>
          </div>
        ))}

        {send.isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("Thinking…")}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        className="sticky bottom-20 mt-6 lg:bottom-6"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <div className="relative rounded-2xl border bg-background shadow-sm">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit(draft);
              }
            }}
            placeholder={t("Ask about a place, its culture, traditions, food or getting around…")}
            rows={2}
            className="resize-none border-0 pr-14 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" size="icon" className="absolute bottom-2 right-2 h-9 w-9 rounded-full" disabled={!draft.trim() || send.isPending} aria-label="Send">
            <ArrowUp />
          </Button>
        </div>
      </form>
    </div>
  );
}
