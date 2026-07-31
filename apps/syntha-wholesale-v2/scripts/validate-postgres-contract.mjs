{
  "name": "@syntha/wholesale-v2",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22"
  },
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "validate:architecture": "node scripts/validate-architecture.mjs",
    "validate:postgres": "node scripts/validate-postgres-contract.mjs",
    "verify": "npm run validate:architecture && npm run validate:postgres && npm test"
  },
  "dependencies": {
    "pg": "^8.13.1"
  }
}
