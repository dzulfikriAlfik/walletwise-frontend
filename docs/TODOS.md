# WalletWise Frontend – Todos

This document tracks pending tasks and completed items for the WalletWise frontend project.

---

## Recently Completed

- [x] **Analytics Page** – Spending by category, monthly trend, Pro+ gated (`/analytics`)
- [x] **CSV/Excel Export** – Export buttons on Transactions page (Pro+ tier)
- [x] **Dashboard** – Wallet/transaction summary, recent transactions, quick links
- [x] **Transactions** – Full CRUD, filters (wallet, type, category, date range), summary card

---

## Pro+ Features

- [x] **Analytics Dashboard** – Implement analytics UI (Pro+ tier)
- [x] **CSV/Excel Export** – Implement export UI (Pro+ tier)

---

## Routing & Pages

- [ ] **Profile Page** – Add dedicated `/profile` route (optional; settings currently in dropdown)
- [ ] **Clients Page** – Add `/clients` route if required (referenced in architecture doc)

---

## IPA / Testing

From [docs/ipa/ipa-checklist.md](ipa/ipa-checklist.md):

- [ ] Unit tests for utilities
- [ ] Integration tests for hooks
- [ ] Component tests for features
- [ ] E2E tests for critical flows
- [ ] Configure CI pipeline to run tests

---

## Deployment

- [ ] Add production deployment link
- [ ] Add staging deployment link

---

## Priority Summary (Pending)

| Priority   | Item                     |
|------------|--------------------------|
| ~~**High**~~   | ~~CSV/Excel export UI~~ ✓      |
| ~~**High**~~   | ~~Analytics dashboard UI~~ ✓   |
| **Medium** | Profile page (optional)  |
| **Lower**  | Unit & integration tests |
| **Lower**  | CI pipeline              |
| **Lower**  | Deployment URLs          |
