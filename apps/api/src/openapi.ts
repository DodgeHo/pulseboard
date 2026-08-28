const jsonResponse = (description: string, schema: object) => ({
  description,
  content: {
    'application/json': { schema },
  },
});

const schemaRef = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const responseRef = (name: string) => ({ $ref: `#/components/responses/${name}` });

const dateTimeSchema = { type: 'string', format: 'date-time' };
const nullableDateTimeSchema = { type: 'string', format: 'date-time', nullable: true };
const nullableStringSchema = { type: 'string', nullable: true };

const monitoredServiceProperties = {
  id: { type: 'string', format: 'uuid' },
  name: { type: 'string' },
  slug: { type: 'string' },
  description: nullableStringSchema,
  baseUrl: { type: 'string', format: 'uri' },
  status: { type: 'string', enum: ['ACTIVE', 'PAUSED', 'ARCHIVED'] },
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  projectId: { type: 'string', format: 'uuid' },
};

const monitoredServiceRequired = [
  'id',
  'name',
  'slug',
  'description',
  'baseUrl',
  'status',
  'createdAt',
  'updatedAt',
  'projectId',
];

const uptimeCheckProperties = {
  id: { type: 'string', format: 'uuid' },
  name: { type: 'string' },
  description: nullableStringSchema,
  method: { type: 'string', enum: ['GET', 'HEAD'] },
  url: { type: 'string', format: 'uri' },
  expectedStatus: { type: 'integer', minimum: 100, maximum: 599 },
  intervalSeconds: { type: 'integer', minimum: 30, maximum: 86_400 },
  timeoutMs: { type: 'integer', minimum: 500, maximum: 30_000 },
  consecutiveFailuresToOpen: { type: 'integer', minimum: 1, maximum: 10 },
  consecutiveSuccessesToResolve: { type: 'integer', minimum: 1, maximum: 10 },
  isActive: { type: 'boolean' },
  nextRunAt: dateTimeSchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  serviceId: { type: 'string', format: 'uuid' },
};

const uptimeCheckRequired = [
  'id',
  'name',
  'description',
  'method',
  'url',
  'expectedStatus',
  'intervalSeconds',
  'timeoutMs',
  'consecutiveFailuresToOpen',
  'consecutiveSuccessesToResolve',
  'isActive',
  'nextRunAt',
  'createdAt',
  'updatedAt',
  'serviceId',
];

const incidentProperties = {
  id: { type: 'string', format: 'uuid' },
  title: { type: 'string' },
  status: { type: 'string', enum: ['OPEN', 'ACKNOWLEDGED', 'RESOLVED'] },
  severity: { type: 'string' },
  summary: nullableStringSchema,
  openedAt: dateTimeSchema,
  acknowledgedAt: nullableDateTimeSchema,
  resolvedAt: nullableDateTimeSchema,
  createdAt: dateTimeSchema,
  updatedAt: dateTimeSchema,
  serviceId: { type: 'string', format: 'uuid' },
  openIdempotencyKey: nullableStringSchema,
  resolveIdempotencyKey: nullableStringSchema,
};

const incidentRequired = [
  'id',
  'title',
  'status',
  'severity',
  'summary',
  'openedAt',
  'acknowledgedAt',
  'resolvedAt',
  'createdAt',
  'updatedAt',
  'serviceId',
  'openIdempotencyKey',
  'resolveIdempotencyKey',
];

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'PulseBoard API',
    version: '0.1.0',
    description:
      'The public /demo contract for a local-first SaaS backend demo covering uptime checks, incidents, webhooks, audit logs, and async workers. Representative public, authentication, workspace, uptime-check, and incident responses have executable schemas. The local operator-only /metrics route is intentionally excluded.',
  },
  security: [{ bearerAuth: [] }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
      },
    },
    responses: {
      Unauthorized: jsonResponse('Missing, invalid, or revoked API key', schemaRef('ErrorResponse')),
      ValidationError: jsonResponse('Invalid request or unsafe monitoring target', schemaRef('ErrorResponse')),
      NotFound: jsonResponse('Resource not found within the authenticated tenant boundary', schemaRef('ErrorResponse')),
      Conflict: jsonResponse('The requested state transition conflicts with current state', schemaRef('ErrorResponse')),
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['error', 'requestId'],
        properties: {
          error: { type: 'string' },
          requestId: { type: 'string', minLength: 1 },
        },
      },
      LivenessResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['status', 'service', 'release', 'contract', 'checkedAt'],
        properties: {
          status: { type: 'string', enum: ['ok'] },
          service: { type: 'string', enum: ['pulseboard-api'] },
          release: { type: 'string', minLength: 1 },
          contract: { type: 'string', minLength: 1 },
          checkedAt: dateTimeSchema,
        },
      },
      ReadinessResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['ready'] },
        },
      },
      NotReadyResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['status', 'requestId'],
        properties: {
          status: { type: 'string', enum: ['not_ready'] },
          reason: { type: 'string', enum: ['shutting_down'] },
          requestId: { type: 'string', minLength: 1 },
        },
      },
      Workspace: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'name', 'slug', 'createdAt', 'updatedAt'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          slug: { type: 'string' },
          createdAt: dateTimeSchema,
          updatedAt: dateTimeSchema,
        },
      },
      WorkspaceListResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: { type: 'array', items: schemaRef('Workspace') },
        },
      },
      MonitoredService: {
        type: 'object',
        additionalProperties: false,
        required: monitoredServiceRequired,
        properties: monitoredServiceProperties,
      },
      UptimeCheck: {
        type: 'object',
        additionalProperties: false,
        required: uptimeCheckRequired,
        properties: uptimeCheckProperties,
      },
      UptimeCheckResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: schemaRef('UptimeCheck'),
        },
      },
      UptimeCheckListResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: { type: 'array', items: schemaRef('UptimeCheck') },
        },
      },
      CheckRun: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'idempotencyKey',
          'status',
          'statusCode',
          'latencyMs',
          'errorMessage',
          'checkedAt',
          'uptimeCheckId',
          'serviceId',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          idempotencyKey: { type: 'string' },
          status: { type: 'string', enum: ['UP', 'DOWN', 'DEGRADED'] },
          statusCode: { type: 'integer', nullable: true },
          latencyMs: { type: 'integer', nullable: true },
          errorMessage: nullableStringSchema,
          checkedAt: dateTimeSchema,
          uptimeCheckId: { type: 'string', format: 'uuid' },
          serviceId: { type: 'string', format: 'uuid' },
        },
      },
      UptimeCheckDetailResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            additionalProperties: false,
            required: [...uptimeCheckRequired, 'checkRuns'],
            properties: {
              ...uptimeCheckProperties,
              checkRuns: { type: 'array', items: schemaRef('CheckRun') },
            },
          },
        },
      },
      IncidentListItem: {
        type: 'object',
        additionalProperties: false,
        required: [...incidentRequired, 'service'],
        properties: {
          ...incidentProperties,
          service: schemaRef('MonitoredService'),
        },
      },
      NotificationAttempt: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'attemptNumber',
          'succeeded',
          'errorMessage',
          'responseStatus',
          'createdAt',
          'notificationId',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          attemptNumber: { type: 'integer' },
          succeeded: { type: 'boolean' },
          errorMessage: nullableStringSchema,
          responseStatus: { type: 'integer', nullable: true },
          createdAt: dateTimeSchema,
          notificationId: { type: 'string', format: 'uuid' },
        },
      },
      NotificationWithAttempts: {
        type: 'object',
        additionalProperties: false,
        required: [
          'id',
          'idempotencyKey',
          'channel',
          'status',
          'target',
          'payload',
          'sentAt',
          'errorMessage',
          'attemptCount',
          'cycleAttemptCount',
          'maxAttempts',
          'nextAttemptAt',
          'lastAttemptAt',
          'leaseOwner',
          'leaseExpiresAt',
          'deadLetteredAt',
          'replayedAt',
          'createdAt',
          'updatedAt',
          'incidentId',
          'attempts',
        ],
        properties: {
          id: { type: 'string', format: 'uuid' },
          idempotencyKey: { type: 'string' },
          channel: { type: 'string', enum: ['EMAIL', 'SLACK', 'WEBHOOK'] },
          status: { type: 'string', enum: ['QUEUED', 'PROCESSING', 'SENT', 'FAILED', 'DEAD_LETTER'] },
          target: { type: 'string' },
          payload: {},
          sentAt: nullableDateTimeSchema,
          errorMessage: nullableStringSchema,
          attemptCount: { type: 'integer' },
          cycleAttemptCount: { type: 'integer' },
          maxAttempts: { type: 'integer' },
          nextAttemptAt: dateTimeSchema,
          lastAttemptAt: nullableDateTimeSchema,
          leaseOwner: nullableStringSchema,
          leaseExpiresAt: nullableDateTimeSchema,
          deadLetteredAt: nullableDateTimeSchema,
          replayedAt: nullableDateTimeSchema,
          createdAt: dateTimeSchema,
          updatedAt: dateTimeSchema,
          incidentId: { type: 'string', format: 'uuid', nullable: true },
          attempts: { type: 'array', items: schemaRef('NotificationAttempt') },
        },
      },
      IncidentListResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: { type: 'array', items: schemaRef('IncidentListItem') },
        },
      },
      IncidentDetailResponse: {
        type: 'object',
        additionalProperties: false,
        required: ['data'],
        properties: {
          data: {
            type: 'object',
            additionalProperties: false,
            required: [...incidentRequired, 'service', 'notifications'],
            properties: {
              ...incidentProperties,
              service: schemaRef('MonitoredService'),
              notifications: { type: 'array', items: schemaRef('NotificationWithAttempts') },
            },
          },
        },
      },
    },
  },
  paths: {
    '/demo/health/live': {
      get: {
        security: [],
        summary: 'Liveness check',
        responses: {
          '200': jsonResponse('Alive', schemaRef('LivenessResponse')),
        },
      },
    },
    '/demo/health/ready': {
      get: {
        security: [],
        summary: 'Readiness check',
        responses: {
          '200': jsonResponse('Dependencies are ready', schemaRef('ReadinessResponse')),
          '503': jsonResponse('Draining or a dependency is unavailable', schemaRef('NotReadyResponse')),
        },
      },
    },
    '/demo/api/v1/api-keys': {
      get: { summary: 'List API keys for the authenticated user', responses: { '200': { description: 'API key metadata list' } } },
      post: {
        summary: 'Create an API key',
        description: 'Returns the plaintext API key only once. Store only the returned value in a secure secret manager.',
        responses: { '201': { description: 'API key created' } },
      },
    },
    '/demo/api/v1/api-keys/{id}': {
      delete: { summary: 'Revoke an API key', responses: { '200': { description: 'API key revoked' }, '404': { description: 'Not found' } } },
    },
    '/demo/api/v1/workspaces': {
      get: {
        summary: 'List workspaces',
        responses: {
          '200': jsonResponse('Workspace list', schemaRef('WorkspaceListResponse')),
          '401': responseRef('Unauthorized'),
        },
      },
      post: { summary: 'Create workspace', responses: { '201': { description: 'Workspace created' } } },
    },
    '/demo/api/v1/workspaces/{id}': {
      get: { summary: 'Get workspace', responses: { '200': { description: 'Workspace detail' }, '404': { description: 'Not found' } } },
      patch: { summary: 'Update workspace', responses: { '200': { description: 'Workspace updated' } } },
      delete: { summary: 'Delete workspace', responses: { '200': { description: 'Workspace deleted' } } },
    },
    '/demo/api/v1/workspaces/{workspaceId}/projects': {
      get: { summary: 'List projects', responses: { '200': { description: 'Project list' } } },
      post: { summary: 'Create project', responses: { '201': { description: 'Project created' } } },
    },
    '/demo/api/v1/projects/{id}': {
      get: { summary: 'Get project', responses: { '200': { description: 'Project detail' }, '404': { description: 'Not found' } } },
      patch: { summary: 'Update project', responses: { '200': { description: 'Project updated' } } },
      delete: { summary: 'Delete project', responses: { '200': { description: 'Project deleted' } } },
    },
    '/demo/api/v1/projects/{projectId}/services': {
      get: { summary: 'List services', responses: { '200': { description: 'Service list' } } },
      post: { summary: 'Create service', responses: { '201': { description: 'Service created' } } },
    },
    '/demo/api/v1/services/{id}': {
      get: { summary: 'Get service', responses: { '200': { description: 'Service detail' }, '404': { description: 'Not found' } } },
      patch: { summary: 'Update service', responses: { '200': { description: 'Service updated' } } },
      delete: { summary: 'Archive service', responses: { '200': { description: 'Service archived' } } },
    },
    '/demo/api/v1/services/{serviceId}/uptime-checks': {
      get: {
        summary: 'List uptime checks',
        responses: {
          '200': jsonResponse('Uptime check list', schemaRef('UptimeCheckListResponse')),
          '401': responseRef('Unauthorized'),
          '404': responseRef('NotFound'),
        },
      },
      post: {
        summary: 'Create uptime check',
        description:
          'Only public HTTP(S) targets are accepted. PulseBoard rejects local, private, reserved, metadata, mixed-DNS, and credential-bearing targets before queueing a check.',
        responses: {
          '201': jsonResponse('Uptime check created', schemaRef('UptimeCheckResponse')),
          '400': responseRef('ValidationError'),
          '401': responseRef('Unauthorized'),
          '404': responseRef('NotFound'),
        },
      },
    },
    '/demo/api/v1/uptime-checks/{id}': {
      get: {
        summary: 'Get uptime check',
        responses: {
          '200': jsonResponse('Uptime check detail with recent runs', schemaRef('UptimeCheckDetailResponse')),
          '401': responseRef('Unauthorized'),
          '404': responseRef('NotFound'),
        },
      },
      patch: {
        summary: 'Update uptime check',
        description: 'A changed URL is subject to the same public HTTP(S) target validation as creation.',
        responses: {
          '200': { description: 'Uptime check updated' },
          '400': responseRef('ValidationError'),
        },
      },
      delete: { summary: 'Disable uptime check', responses: { '200': { description: 'Uptime check disabled' } } },
    },
    '/demo/api/v1/incidents': {
      get: {
        summary: 'List incidents',
        responses: {
          '200': jsonResponse('Incident list with monitored services', schemaRef('IncidentListResponse')),
          '401': responseRef('Unauthorized'),
        },
      },
    },
    '/demo/api/v1/incidents/{id}': {
      get: {
        summary: 'Get incident',
        responses: {
          '200': jsonResponse('Incident detail with notification attempts', schemaRef('IncidentDetailResponse')),
          '401': responseRef('Unauthorized'),
          '404': responseRef('NotFound'),
        },
      },
      patch: {
        summary: 'Update incident status',
        responses: {
          '200': { description: 'Incident updated' },
          '409': responseRef('Conflict'),
        },
      },
    },
    '/demo/api/v1/notifications/{id}/replay': {
      post: {
        summary: 'Replay a failed or dead-letter notification',
        responses: { '202': { description: 'Notification requeued' }, '409': { description: 'Notification is not replayable' } },
      },
    },
    '/demo/api/v1/webhooks/events': {
      post: { summary: 'Ingest webhook event', responses: { '202': { description: 'Webhook accepted' } } },
    },
    '/demo/api/v1/usage-metrics': {
      get: { summary: 'List usage metrics', responses: { '200': { description: 'Usage metric list' } } },
    },
    '/demo/api/v1/audit-logs': {
      get: { summary: 'List audit logs', responses: { '200': { description: 'Audit log list' } } },
    },
  },
} as const;
