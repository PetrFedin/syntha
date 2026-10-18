import {
  LifecycleIdempotencyConflict,
  LifecycleIdempotencyResultMissing,
  type LifecycleCreateCommand,
  type LifecycleCreateResult,
  type LifecycleResultEntityType,
} from '../domain/lifecycle-create-command';

interface CompletedRecord {
  readonly fingerprint: string;
  readonly actorCredentialId: string;
  readonly resultEntityType: LifecycleResultEntityType;
  readonly resultEntityId: string;
}

export class InMemoryLifecycleIdempotencyRegistry {
  private readonly records = new Map<string, CompletedRecord>();

  private key(command: LifecycleCreateCommand): string {
    return `${command.organisationId}:${command.commandName}:${command.idempotencyKey}`;
  }

  findReplay<Entity>(input: {
    readonly command: LifecycleCreateCommand;
    readonly expectedEntityType: LifecycleResultEntityType;
    readonly loadEntity: (id: string) => Entity | null;
  }): Entity | null {
    const record = this.records.get(this.key(input.command));
    if (!record) return null;
    if (
      record.fingerprint !== input.command.fingerprint ||
      record.actorCredentialId !== input.command.actorCredentialId
    ) {
      throw new LifecycleIdempotencyConflict();
    }
    if (record.resultEntityType !== input.expectedEntityType) {
      throw new LifecycleIdempotencyConflict('Idempotency result type does not match command');
    }
    const entity = input.loadEntity(record.resultEntityId);
    if (!entity) throw new LifecycleIdempotencyResultMissing(record.resultEntityId);
    return entity;
  }

  complete<Entity>(input: {
    readonly command: LifecycleCreateCommand;
    readonly resultEntityType: LifecycleResultEntityType;
    readonly resultEntityId: string;
    readonly entity: Entity;
    readonly loadEntity: (id: string) => Entity | null;
  }): LifecycleCreateResult<Entity> {
    const replay = this.findReplay({
      command: input.command,
      expectedEntityType: input.resultEntityType,
      loadEntity: input.loadEntity,
    });
    if (replay) return Object.freeze({ entity: replay, replayed: true });
    this.records.set(
      this.key(input.command),
      Object.freeze({
        fingerprint: input.command.fingerprint,
        actorCredentialId: input.command.actorCredentialId,
        resultEntityType: input.resultEntityType,
        resultEntityId: input.resultEntityId,
      }),
    );
    return Object.freeze({ entity: input.entity, replayed: false });
  }
}
