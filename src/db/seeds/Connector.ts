import type { AbstractModel } from '@db/entities/Abstract';

export type ConnectorTo = (to: AbstractModel, text: string) => Promise<void>;
export type ConnectorFrom = (connect: ConnectorTo) => Promise<void>;
