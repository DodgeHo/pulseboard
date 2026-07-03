export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PulseBoard API',
    version: '0.1.0',
    description:
      'A local-first cloud-native SaaS backend demo for uptime checks, incidents, webhooks, audit logs, and async workers.',
  },
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
  },
  paths: {
    '/health/live': { get: { security: [], summary: 'Liveness check', responses: { 200: { description: 'Alive' } } } },
    '/health/ready': { get: { security: [], summary: 'Readiness check', responses: { 200: { description: 'Ready' }, 503: { description: 'Not ready' } } } },
    '/v1/workspaces': {
      get: { summary: 'List workspaces', responses: { 200: { description: 'Workspace list' } } },
      post: { summary: 'Create workspace', responses: { 201: { description: 'Workspace created' } } },
    },
    '/v1/workspaces/{id}': {
      get: { summary: 'Get workspace', responses: { 200: { description: 'Workspace detail' }, 404: { description: 'Not found' } } },
      patch: { summary: 'Update workspace', responses: { 200: { description: 'Workspace updated' } } },
      delete: { summary: 'Delete workspace', responses: { 200: { description: 'Workspace deleted' } } },
    },
    '/v1/workspaces/{workspaceId}/projects': {
      get: { summary: 'List projects', responses: { 200: { description: 'Project list' } } },
      post: { summary: 'Create project', responses: { 201: { description: 'Project created' } } },
    },
    '/v1/projects/{id}': {
      get: { summary: 'Get project', responses: { 200: { description: 'Project detail' }, 404: { description: 'Not found' } } },
      patch: { summary: 'Update project', responses: { 200: { description: 'Project updated' } } },
      delete: { summary: 'Delete project', responses: { 200: { description: 'Project deleted' } } },
    },
    '/v1/projects/{projectId}/services': {
      get: { summary: 'List services', responses: { 200: { description: 'Service list' } } },
      post: { summary: 'Create service', responses: { 201: { description: 'Service created' } } },
    },
    '/v1/services/{id}': {
      get: { summary: 'Get service', responses: { 200: { description: 'Service detail' }, 404: { description: 'Not found' } } },
      patch: { summary: 'Update service', responses: { 200: { description: 'Service updated' } } },
      delete: { summary: 'Archive service', responses: { 200: { description: 'Service archived' } } },
    },
    '/v1/services/{serviceId}/uptime-checks': {
      get: { summary: 'List uptime checks', responses: { 200: { description: 'Uptime check list' } } },
      post: { summary: 'Create uptime check', responses: { 201: { description: 'Uptime check created' } } },
    },
    '/v1/uptime-checks/{id}': {
      get: { summary: 'Get uptime check', responses: { 200: { description: 'Uptime check detail' }, 404: { description: 'Not found' } } },
      patch: { summary: 'Update uptime check', responses: { 200: { description: 'Uptime check updated' } } },
      delete: { summary: 'Disable uptime check', responses: { 200: { description: 'Uptime check disabled' } } },
    },
    '/v1/incidents': {
      get: { summary: 'List incidents', responses: { 200: { description: 'Incident list' } } },
    },
    '/v1/incidents/{id}': {
      get: { summary: 'Get incident', responses: { 200: { description: 'Incident detail' } } },
      patch: { summary: 'Update incident status', responses: { 200: { description: 'Incident updated' } } },
    },
    '/v1/webhooks/events': {
      post: { summary: 'Ingest webhook event', responses: { 202: { description: 'Webhook accepted' } } },
    },
    '/v1/usage-metrics': {
      get: { summary: 'List usage metrics', responses: { 200: { description: 'Usage metric list' } } },
    },
    '/v1/audit-logs': {
      get: { summary: 'List audit logs', responses: { 200: { description: 'Audit log list' } } },
    },
  },
} as const;
