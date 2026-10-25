# Governance

## Roles

| Role | Responsibilities |
| --- | --- |
| **Users** | Use the platform, file issues, join discussions |
| **Contributors** | Submit PRs, review docs, triage issues |
| **Module maintainers** | Own an area (see [CODEOWNERS](.github/CODEOWNERS)); review and merge PRs |
| **Core team** | Sets technical direction, approves RFCs, manages releases |

## Decision making

- **Small changes** (bug fixes, docs, isolated features): normal PR review by a
  module maintainer.
- **Significant changes** (new APIs, new model families, breaking changes, new
  dependencies): open a **Thunders Enhancement Proposal (TEP)** as a
  [research proposal](.github/ISSUE_TEMPLATE/research_proposal.yml) or PR to
  `docs/`; core team reaches consensus, or escalates to a vote.
- **Safety-affecting changes** require sign-off from the `ai/safety/` owners.

## Release process

Releases are cut from `main` by tagged CI (`.github/workflows/release.yml`).
Versioning follows [SemVer](https://semver.org/); notable changes are recorded in
[CHANGELOG.md](CHANGELOG.md).

## Adding maintainers

Contributors with sustained, high-quality contributions to an area may be
invited to become its maintainer by the core team.
