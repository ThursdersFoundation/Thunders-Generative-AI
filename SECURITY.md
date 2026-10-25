# Security Policy

## 🛡️ Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | ✅ |
| < 0.1 | ❌ |

## 📣 Reporting a vulnerability

**Do not open public issues for security vulnerabilities.**

- Use [GitHub private security advisories](https://github.com/thunders-ai/Thunders-Generative-AI/security/advisories/new), or
- Email **security@thunders.ai** (PGP key available on request).

We aim to acknowledge reports within **48 hours** and provide a fix or mitigation
within **90 days**, coordinated per standard responsible-disclosure practice.

## 🔍 Scope

Areas of particular interest:

- `backend/` — API surface, authentication/authorization, rate limiting
- `ai/safety/` — prompt injection, content moderation, PII leakage
- `security/` — model security, data privacy, policy enforcement
- `infrastructure/` — container images, Kubernetes manifests, secrets handling

## 🔐 Safe harbor

We consider security research conducted in good faith and in accordance with
this policy to be authorized, and we will not pursue action against researchers
who respect user privacy and data.
