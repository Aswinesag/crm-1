# Procurement identity migration runbook

This administrative migration is dry-run by default. Never place production mappings or generated backups in source control.

1. Take an independent MongoDB backup.
2. Run `npm run survey:legacy-procurement`.
3. Review `reports/procurement-identity-migration/summary.json`, mappings, ambiguous, unresolved, conflicts, and affected-record reports.
4. Copy the example override JSON outside the repository, manually verify every override, and rerun the dry-run with `--mapping-file <path>`.
5. Review the revised report. Do not apply while conflicts or unresolved records are intended for the apply set.
6. Run `npm run migrate:procurement-identity -- --mapping-file <path> --batch-size 50` once more without `--apply`.
7. Apply only with `npm run migrate:procurement-identity -- --apply --confirm MIGRATE_LEGACY_IDENTITY --mapping-file <path> --batch-size 50`.
8. Retain the generated field-level backup and run `npm run verify:procurement-identity`.
9. Run the Phase 5 procurement and Phase 4 GRN-to-inventory tests, then monitor application logs.
10. Keep rollback artifacts until the migration is accepted.

Rollback is also dry-run by default. Preview with `npm run rollback:procurement-identity -- --backup-file <file>`. Apply with the additional `--apply --confirm ROLLBACK_LEGACY_IDENTITY` flags. Rollback touches only fields recorded by the migration and only while its versioned metadata is still present.
