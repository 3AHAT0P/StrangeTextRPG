import { DataContainer, AbstractEntity } from '@db/entities';

export type ConnectorTo = (to: DataContainer<AbstractEntity>, text: string) => void;
export type ConnectorFrom = (connect: ConnectorTo) => void;
