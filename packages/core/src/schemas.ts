import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const workspaceInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
});

export const projectInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const serviceInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  baseUrl: z.string().url(),
  description: z.string().max(500).optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'ARCHIVED']).optional(),
});

export const uptimeCheckInputSchema = z.object({
  name: z.string().min(2).max(120),
  method: z.enum(['GET', 'HEAD']).default('GET'),
  url: z.string().url(),
  expectedStatus: z.number().int().min(100).max(599).default(200),
  intervalSeconds: z.number().int().min(30).max(86_400).default(60),
  timeoutMs: z.number().int().min(500).max(30_000).default(5000),
  consecutiveFailuresToOpen: z.number().int().min(1).max(10).default(2),
  consecutiveSuccessesToResolve: z.number().int().min(1).max(10).default(1),
  isActive: z.boolean().default(true),
});

export const incidentUpdateSchema = z.object({
  status: z.enum(['OPEN', 'ACKNOWLEDGED', 'RESOLVED']).optional(),
  severity: z.string().min(2).max(40).optional(),
  summary: z.string().max(1000).nullable().optional(),
});

export const webhookIngestSchema = z.object({
  workspaceId: z.string().uuid(),
  source: z.string().min(2).max(80),
  eventType: z.string().min(2).max(120),
  externalId: z.string().max(160).optional(),
  payload: z.record(z.unknown()).default({}),
});

export const apiKeyInputSchema = z.object({
  name: z.string().min(2).max(120),
});

export type WorkspaceInput = z.infer<typeof workspaceInputSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;
export type ServiceInput = z.infer<typeof serviceInputSchema>;
export type UptimeCheckInput = z.infer<typeof uptimeCheckInputSchema>;
export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;
export type WebhookIngestInput = z.infer<typeof webhookIngestSchema>;
export type ApiKeyInput = z.infer<typeof apiKeyInputSchema>;
