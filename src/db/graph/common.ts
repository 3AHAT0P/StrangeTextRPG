import {
  Node, Relationship, Record as Neo4jRecord, Integer,
} from 'neo4j-driver';

import {
  isNode, isRelationship, isInt, Session,
} from 'neo4j-driver-core';

export {
  Node, Relationship, Neo4jRecord, Integer, isNode, isRelationship, isInt, Session,
};

export const getIntValue = (value: number | Integer): number => (
  isInt(value) ? (value as Integer).toNumber() : value as number
);

export interface EspeciallyNode<TProperties, TIdentity extends Integer = Integer> extends Node<TIdentity> {
  properties: TProperties;
}

export interface EspeciallyRelationship<
  TProperties, TIdentity extends Integer = Integer,
> extends Relationship<TIdentity> {
  properties: TProperties;
}
