import type {
  AiResult,
  ChatInput,
  GenerateTripInput,
  GeneratedTrip,
  LocalPlace,
  LocalSecretsQueryInput,
  VisaQueryInput,
  VisaRequirement,
} from "@shared/schema";
import { supabase } from "./supabase";

/** POST to the Express API with the current Supabase access token attached. */
async function post<T>(path: string, body: unknown): Promise<T> {
  const { data } = (await supabase?.auth.getSession()) ?? { data: { session: null } };
  const token = data.session?.access_token;

  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || `Request failed (${res.status})`);
  }
  return json as T;
}

export const aiApi = {
  generateTrip: (input: GenerateTripInput) => post<AiResult<GeneratedTrip>>("/ai/generate-trip", input),
  visa: (input: VisaQueryInput) => post<AiResult<VisaRequirement>>("/ai/visa", input),
  localSecrets: (input: LocalSecretsQueryInput) => post<AiResult<LocalPlace[]>>("/ai/local-secrets", input),
  chat: (input: ChatInput) => post<AiResult<string>>("/ai/chat", input),
};
