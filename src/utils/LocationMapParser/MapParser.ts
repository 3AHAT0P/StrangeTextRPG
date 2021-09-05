/* eslint-disable no-await-in-loop */
import { createCanvas, loadImage, ImageData } from 'node-canvas';

import {
  InteractionEntity,
  BattleEntity,
  NPCEntity,
  MapSpotEntity,
  DataContainer,
  DataCollection,
} from '@db/entities';
import { isThroughable, MapSpotSubtype } from '@db/entities/MapSpot';
import { parseBattleSubtype, isBattleSubtype } from '@db/entities/Battle';
import { MOVE_ACTIONS } from '@locations/AreaMap';
import { Matcher } from '@utils/Matcher';
import logger from '@utils/Logger';

import { Palette } from './Palette';

export type MatcherContext = { currentSpot: DataContainer<MapSpotEntity>, subtype: MapSpotSubtype };

export interface MapInfo {
  scenarioId: number,
  locationId: number,
}

export interface CustomInteractions {
  exitId: string;
  onPlayerDiedId: string;
}

export class MapParser {
  private _mapImagePath: string;

  private _imageData: ImageData | null = null;

  private _mapInfo: MapInfo;

  private _customInteractions: CustomInteractions;

  private _nodeCollection: DataCollection;

  private _mapSpotMap = new Map<string, DataContainer<MapSpotEntity>>();

  private _mapSpotSubtypeMatcher = new Matcher<MapSpotSubtype, 'BATTLE', MatcherContext>();

  private _sequences = {
    npcId: 1,
    interactionId: 1,
  };

  public get spotMap(): Map<string, DataContainer<MapSpotEntity>> { return this._mapSpotMap; }

  private async loadImageData() {
    const image = await loadImage(this._mapImagePath);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

    this._imageData = ctx.getImageData(0, 0, image.width, image.height);
  }

  private _createSpot(x: number, y: number, subtype: MapSpotSubtype): DataContainer<MapSpotEntity> {
    const currentSpot = this._nodeCollection.addContainer<MapSpotEntity>(
      'MapSpot',
      {
        ...this._mapInfo,
        x,
        y,
        subtype,
        isThroughable: isThroughable(subtype),
      },
    );
    this._mapSpotMap.set(`${x}:${y}`, currentSpot);

    return currentSpot;
  }

  private async _createRelatedNodes({ currentSpot, subtype }: MatcherContext): Promise<void> {
    await this._mapSpotSubtypeMatcher.run(subtype, { currentSpot, subtype });
  }

  private _createMerchant({ currentSpot }: MatcherContext): void {
    const npc = this._nodeCollection.addContainer<NPCEntity>(
      'NPC',
      {
        ...this._mapInfo,
        NPCId: this._sequences.npcId,
        subtype: 'MERCHANT',
      },
    );
    this._nodeCollection.addLink(currentSpot, {
      ...this._mapInfo,
      to: npc.entity.interactionId,
      text: `💬 Поговорить с торговцем (#${this._sequences.npcId})`,
      operation: `{{loadMerchantInfo ${this._sequences.npcId}}}`,
      type: 'CUSTOM',
      subtype: 'TALK_TO_NPC',
    });
    this._sequences.npcId += 1;
  }

  private _createLocationExit({ currentSpot }: MatcherContext): void {
    const { exitId } = this._customInteractions;

    this._nodeCollection.addLink(currentSpot, {
      ...this._mapInfo,
      to: exitId,
      text: '',
      type: 'AUTO',
      subtype: 'EXIT_LOCATION',
    });
  }

  private _createBattle({ currentSpot, subtype }: MatcherContext): void {
    if (!isBattleSubtype(subtype)) return logger.error('MapParser::_createBattle', 'Subtype mismatch');

    const [difficult, chanceOfTriggering] = parseBattleSubtype(subtype);

    const battle = this._nodeCollection.addContainer<BattleEntity>(
      'Battle',
      {
        ...this._mapInfo,
        difficult,
        chanceOfTriggering,
      },
    );

    this._nodeCollection.addLink(currentSpot, {
      ...this._mapInfo,
      to: battle.entity.interactionId,
      text: '',
      condition: `{{canBattleTrigger ${battle.entity.interactionId} ${chanceOfTriggering}}}`,
      type: 'AUTO',
      subtype: 'BATTLE_START',
    });

    const onWinInteraction = this._nodeCollection.addContainer<InteractionEntity>(
      'Battle',
      {
        ...this._mapInfo,
        text: 'Больше тут ничего и никого нет.',
      },
    );

    this._nodeCollection.addLink(battle, {
      ...this._mapInfo,
      to: onWinInteraction.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'BATTLE_WIN',
    });

    this._nodeCollection.addLink(battle, {
      ...this._mapInfo,
      to: this._customInteractions.onPlayerDiedId ?? currentSpot.entity.interactionId,
      text: '',
      type: 'SYSTEM',
      subtype: 'BATTLE_LOSE',
    });

    this._nodeCollection.addLink(onWinInteraction, {
      ...this._mapInfo,
      to: currentSpot.entity.interactionId,
      text: '',
      operation: `{{updateBattleImmune ${battle.entity.interactionId} 10}}`,
      type: 'AUTO',
      subtype: 'OTHER',
    });
  }

  private _createAboveSpot({ currentSpot }: MatcherContext): void {
    const above = this._mapSpotMap.get(`${currentSpot.entity.x}:${currentSpot.entity.y - 1}`);

    if (above != null) {
      const isThroughableSpot = currentSpot.entity.isThroughable && above.entity.isThroughable;
      this._nodeCollection.addLink(currentSpot, {
        ...this._mapInfo,
        to: above.entity.interactionId,
        text: isThroughableSpot ? MOVE_ACTIONS.TO_NORTH : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
        subtype: isThroughableSpot ? 'MOVE_TO_NORTH' : 'MOVE_FORBIDDEN',
      });
      this._nodeCollection.addLink(above, {
        ...this._mapInfo,
        to: currentSpot.entity.interactionId,
        text: isThroughableSpot ? MOVE_ACTIONS.TO_SOUTH : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
        subtype: isThroughableSpot ? 'MOVE_TO_SOUTH' : 'MOVE_FORBIDDEN',
      });
    }
  }

  private _createLeftSpot({ currentSpot }: MatcherContext): void {
    const left = this._mapSpotMap.get(`${currentSpot.entity.x - 1}:${currentSpot.entity.y}`);

    if (left != null) {
      const isThroughableSpot = currentSpot.entity.isThroughable && left.entity.isThroughable;
      this._nodeCollection.addLink(currentSpot, {
        ...this._mapInfo,
        to: left.entity.interactionId,
        text: isThroughableSpot ? MOVE_ACTIONS.TO_WEST : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
        subtype: isThroughableSpot ? 'MOVE_TO_WEST' : 'MOVE_FORBIDDEN',
      });
      this._nodeCollection.addLink(left, {
        ...this._mapInfo,
        to: currentSpot.entity.interactionId,
        text: isThroughableSpot ? MOVE_ACTIONS.TO_EAST : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
        subtype: isThroughableSpot ? 'MOVE_TO_EAST' : 'MOVE_FORBIDDEN',
      });
    }
  }

  constructor(
    mapImagePath: string,
    mapInfo: MapInfo,
    customInteractions: CustomInteractions,
    nodeCollection: DataCollection,
  ) {
    this._mapImagePath = mapImagePath;
    this._mapInfo = mapInfo;
    this._customInteractions = customInteractions;
    this._nodeCollection = nodeCollection;
  }

  public async init(): Promise<void> {
    await this.loadImageData();

    this._mapSpotSubtypeMatcher
      .addMatcher((event) => (event.startsWith('BATTLE#') ? 'BATTLE' : null));

    this._mapSpotSubtypeMatcher
      .on('BATTLE', this._createBattle.bind(this))
      .on('LOCATION_EXIT', this._createLocationExit.bind(this))
      .on('MERCHANT', this._createMerchant.bind(this));
  }

  public async parse(): Promise<void> {
    const imageData = this._imageData;
    if (imageData == null) return;

    for (let i = 0; i < imageData.data.length; i += 4) {
      const y = Math.floor((i / 4) / imageData.width);
      const x = i / 4 - y * imageData.width;
      const subtype = Palette.getSpotTypeByColor(
        Palette.colorRGBToHEX(imageData.data[i + 0], imageData.data[i + 1], imageData.data[i + 2]),
      );

      if (subtype === null) throw new Error('Spot subtype is incorrect.');

      try {
        const currentSpot = this._createSpot(x, y, subtype);
        await this._createRelatedNodes({ currentSpot, subtype });
        this._createAboveSpot({ currentSpot, subtype });
        this._createLeftSpot({ currentSpot, subtype });
      } catch (e) {
        logger.error('MapParser::parse', e);
      }
    }
  }

  public async destructor(): Promise<void> {
    // await this._dbService.destructor();
  }
}
