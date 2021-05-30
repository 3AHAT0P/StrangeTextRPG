import {
  isRelationship, Relationship, EspeciallyRelationship, NRecord, Integer, getIntValue,
} from './common';

export interface ActionRelationshipProperties {
  scenarioId: Integer;
  locationId: Integer;
  text: string;
  type: 'SYSTEM' | 'AUTO' | 'CUSTOM';
}

export interface ActionEntity {
  id: number;
  scenarioId: number;
  locationId: number;
  fromInteractionId: number;
  toInteractionId: number;
  text: string;
  type: 'SYSTEM' | 'AUTO' | 'CUSTOM';
}

export const isActionRelationship = <T extends Integer>(
  value: Relationship<T>,
): value is EspeciallyRelationship<ActionRelationshipProperties, T> => value.type.toLowerCase() === 'action';

export const extractActionEntityFromRelationship = (record: NRecord): ActionEntity => {
  const data = record.get(0);
  if (!isRelationship(data)) throw new Error('Record isn\'t Relationship');
  if (!isActionRelationship(data)) throw new Error('Record isn\'t ActionRelationship');

  return {
    id: data.identity.toNumber(),
    scenarioId: getIntValue(data.properties.scenarioId),
    locationId: getIntValue(data.properties.locationId),
    fromInteractionId: data.start.toNumber(),
    toInteractionId: data.end.toNumber(),
    text: data.properties.text,
    type: data.properties.type,
  };
};
