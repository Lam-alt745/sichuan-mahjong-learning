# Sichuan Mahjong · 川麻
[简体中文](README.md)

Offline bilingual learning: 43 lessons, 61 terms, six drill types, a 12-question placement assessment and a local fight-to-the-end teaching table. Chinese, English and bilingual reading modes. Points have educational value only.

## Run
Verified with Node.js 24. The historical engines range is >=20; other versions are unverified.
```sh
npm ci --registry=https://registry.npmjs.org
npm run content
npm test
npm run test:coverage
npm run build
npm run dev -- --host 127.0.0.1
```
Open the address printed by Vite. Serve dist as static files. Development uses hot reload communication. No external request code was found in the production app. There is no Service Worker; offline refresh after first load is unverified.

## Architecture and privacy
src/engine contains rules, table, coach, probability and scoring; src/placement provides placement; src/pages and components provide the UI. src/state/progress.ts owns progress. scripts/build-content.ts generates src/content from six levels in content. Tests cover rules, placement and progress parsing.

No accounts, backend, telemetry or external AI. Progress is stored in browser localStorage under sichuan-mahjong.v1. Import/export requires user action; exported records should be kept private. Clear site storage to reset. Demos and tests use generated data; no real learner records are included.

## Rules and licensing
Teaching defaults follow content/rules-facts.md section K, rather than every platform. Tenpai checks use maximum base pattern fan; Heavenly/Earthly hands use first-draw and approximate first-round timing. No real money, wagering or online multiplayer. English supports reading only.

Maintainer: [Lam-alt745](https://github.com/Lam-alt745). This candidate awaits independent review and is not approved for publication. The owner confirms owner-controlled code/content was generated with AI assistance and authorizes [MIT](LICENSE). Third-party dependencies and reused/adapted material retain their own terms; see [license scope](LICENSE-SCOPE.md) and [provenance](PROVENANCE.md). The bounded text comparison identified no substantive copied passage; see [source review](SOURCE-REVIEW.md) for evidence and limits. Tests do not establish release rights or human acceptance.

Progress imports accept only allowed persisted fields and reject unknown/dangerous keys or invalid structures. Missing fields in older v1 files retain defaults. Parsing is limited to one million characters and bounded nesting. See [dependency assessment](DEPENDENCY-ADVISORIES.md).
