# ADR 0002: SSRF-Safe HTTP Checks

- Status: Accepted
- Date: 2026-08-28

## Context

An uptime worker makes outbound requests to URLs supplied through an authenticated API. Authentication and tenant isolation do not make those URLs trustworthy: a valid tenant could otherwise ask the worker to reach loopback services, private networks, cloud metadata endpoints, or a hostname that changes to a private address after validation.

The previous implementation passed the stored URL directly to `fetch`. It therefore followed redirects automatically and relied on a second DNS lookup at connection time. That left private addresses, mixed public/private DNS answers, DNS rebinding, and redirect-based bypasses unaddressed.

## Decision

PulseBoard treats monitoring targets as untrusted input and applies the same policy during API create/update and immediately before every worker request.

The policy:

- accepts only absolute `http:` and `https:` URLs;
- rejects embedded URL credentials and local/internal hostname suffixes;
- rejects loopback, private, link-local, carrier-grade NAT, multicast, documentation, benchmarking, reserved, IPv4-mapped IPv6, and cloud-metadata address ranges;
- resolves all DNS answers and rejects the hostname if any answer is non-public;
- selects one approved address and pins the HTTP connection to it while retaining the original hostname for the `Host` header and TLS SNI;
- disables automatic redirects, follows at most three redirects, and repeats URL, DNS, and address validation for every hop; and
- uses one timeout budget across DNS resolution and all redirect hops.

The API rejects an unsafe target before creating or updating an uptime check. The worker repeats the validation because DNS and network state can change after configuration, and because durable data must not be treated as permanently trusted.

## Consequences

- A queued check cannot connect to a different address than the address approved for that hop, closing the validation-to-connection DNS rebinding window inside the application.
- A hostname with mixed public and private answers is rejected rather than selecting only a convenient public answer. This is conservative but deterministic.
- Redirects to metadata or private services become failed check results instead of outbound requests.
- Private-network monitoring is deliberately unsupported. Adding it later would require an explicit, tenant-scoped allowlist and deployment-level egress controls rather than a global bypass flag.
- DNS resolution now occurs on create/update as well as execution, so an unresolvable target is rejected earlier. The worker still owns the authoritative pre-request decision.

## Remaining Boundaries

Application checks are defense in depth, not a replacement for network policy. A production deployment should also restrict worker egress and cloud metadata access at the host or network layer. The special-purpose IP registry changes over time, so the blocked-range table requires maintenance. PulseBoard does not currently support authenticated targets, custom proxy routing, or tenant-managed private probes.

## Verification

`packages/core/test/http-check.test.ts` covers private and metadata IPv4 targets, private IPv6, IPv4-mapped IPv6, unsafe hostnames, non-HTTP schemes, embedded credentials, mixed DNS answers, DNS pinning, redirect revalidation, and the shared timeout budget. The PostgreSQL-backed API integration flow verifies that an unsafe target returns HTTP 400 and is not persisted.
