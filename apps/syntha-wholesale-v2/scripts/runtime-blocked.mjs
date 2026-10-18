import process from 'node:process';

const command = process.argv[2] ?? 'runtime command';
console.error(`${command} is blocked until the runtime ADR and toolchain are accepted.`);
console.error('See docs/architecture/RUNTIME_BOUNDARY.md and STATUS.md.');
process.exit(1);
