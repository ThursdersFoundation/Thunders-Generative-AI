# Changelog

All notable changes to this project are documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioned per [SemVer](https://semver.org/).

## [Unreleased]

### Added

- Initial monorepo scaffold: `apps/` (web, mobile, desktop, admin), FastAPI
  `backend/`, `ai/` research modules, `models/` registry, `training/`,
  `inference/`, `datasets/`, `data_pipeline/`, `evaluation/`, `sdk/`,
  `infrastructure/`, `security/`, `observability/`, CI/CD workflows and docs.

## [0.1.0] - 2026-10-25

### Added

- Project scaffold and repository layout.
- CI/CD pipeline templates (tests, security scan, docker build, release).
- Development stack via Docker Compose (Postgres, Redis, MinIO, backend).
