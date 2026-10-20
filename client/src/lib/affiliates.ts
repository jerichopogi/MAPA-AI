// Browser side of the partner links (see shared/affiliates.ts). Configure IDs in .env.
import { buildPartnerLink, createPartners, flightPartners, type Partner } from "@shared/affiliates";

export type { Partner };
export { flightPartners };

export const PARTNERS = createPartners(import.meta.env);

export const partnerLink = (partner: Partner, vars: { query?: string; from?: string; to?: string } = {}) =>
  buildPartnerLink(PARTNERS, partner, vars);
