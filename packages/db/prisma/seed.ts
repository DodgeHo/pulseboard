import { createHash } from 'node:crypto';

import { prisma } from '../src/client.js';

const salt = process.env.API_KEY_HASH_SALT ?? 'local-development-only';
const demoApiKey = process.env.DEMO_API_KEY ?? 'pb_local_demo_key_change_me';

function hashApiKey(key: string) {
  return createHash('sha256').update(`${salt}:${key}`).digest('hex');
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@pulseboard.local' },
    update: {},
    create: {
      email: 'demo@pulseboard.local',
      name: 'Demo Operator',
    },
  });

  await prisma.apiKey.upsert({
    where: { keyHash: hashApiKey(demoApiKey) },
    update: { revokedAt: null },
    create: {
      name: 'Local demo key',
      prefix: demoApiKey.slice(0, 10),
      keyHash: hashApiKey(demoApiKey),
      userId: user.id,
    },
  });

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'acme-remote-ops' },
    update: {},
    create: {
      name: 'Acme Remote Ops',
      slug: 'acme-remote-ops',
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  });

  const project = await prisma.project.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: 'customer-platform',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Customer Platform',
      slug: 'customer-platform',
      description: 'Demo project for API and worker health monitoring.',
    },
  });

  const service = await prisma.monitoredService.upsert({
    where: {
      projectId_slug: {
        projectId: project.id,
        slug: 'public-api',
      },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'Public API',
      slug: 'public-api',
      baseUrl: 'https://example.com',
      description: 'Seed service used to demonstrate uptime checks.',
    },
  });

  const existingCheck = await prisma.uptimeCheck.findFirst({
    where: {
      serviceId: service.id,
      name: 'Example homepage',
    },
  });

  if (!existingCheck) {
    await prisma.uptimeCheck.create({
      data: {
        serviceId: service.id,
        name: 'Example homepage',
        url: 'https://example.com',
        expectedStatus: 200,
        intervalSeconds: 120,
        timeoutMs: 5000,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      action: 'CREATED',
      entityType: 'seed',
      entityId: workspace.id,
      actorType: 'system',
      message: 'Seeded demo workspace, project, service, uptime check, and API key.',
      workspaceId: workspace.id,
    },
  });

  await prisma.usageMetric.create({
    data: {
      workspaceId: workspace.id,
      name: 'seeded_services',
      value: 1,
    },
  });

  console.log('Seed complete.');
  console.log(`Demo API key: ${demoApiKey}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

