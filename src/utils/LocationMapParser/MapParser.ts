/* eslint-disable no-await-in-loop */
import { createCanvas, loadImage, ImageData } from 'node-canvas';

import { DBService } from '@db/DBService';
import { InteractionModel } from '@db/entities/Interaction';
import { isThroughable, MapSpotModel, MapSpotSubtype } from '@db/entities/MapSpot';
import { NPCModel, NPCSubtype } from '@db/entities/NPC';
import { BattleModel, parseBattleSubtype, isBattleSubtype } from '@db/entities/Battle';
import { MOVE_ACTIONS } from '@locations/AreaMap';
import { Matcher } from '@utils/Matcher';

import { Palette } from './Palette';

export type MatcherContext = { currentSpot: MapSpotModel, subtype: MapSpotSubtype };

export interface MapInfo {
  scenarioId: number,
  locationId: number,
}

export interface CustomInteractions {
  exit?: InteractionModel;
  onPlayerDied?: InteractionModel;
}

export class MapParser {
  private _mapImagePath: string;

  private _imageData: ImageData | null = null;

  private _mapInfo: MapInfo;

  private _customInteractions: CustomInteractions;

  private _mapSpotMap = new Map<string, MapSpotModel>();

  private _dbService: DBService = new DBService();

  private _mapSpotSubtypeMatcher = new Matcher<MapSpotSubtype, 'BATTLE', MatcherContext>();

  private _sequences = {
    npcId: 1,
    interactionId: 1,
  };

  private async loadImageData() {
    const image = await loadImage(this._mapImagePath);

    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

    this._imageData = ctx.getImageData(0, 0, image.width, image.height);
  }

  private async _createSpot(x: number, y: number, subtype: MapSpotSubtype) {
    const currentSpot = await this._dbService.repositories.mapSpotRepo.create({
      ...this._mapInfo,
      x,
      y,
      subtype,
      isThroughable: isThroughable(subtype),
    });
    this._mapSpotMap.set(`${x}:${y}`, currentSpot);

    return currentSpot;
  }

  private async _createRelatedNodes({ currentSpot, subtype }: MatcherContext) {
    await this._mapSpotSubtypeMatcher.run(subtype, { currentSpot, subtype });
  }

  private async _createMerchant({ currentSpot }: MatcherContext) {
    const npc = await this._dbService.repositories.npcRepo.create({
      ...this._mapInfo,
      NPCId: this._sequences.npcId,
      subtype: 'MERCHANT',
    });
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: currentSpot.id,
      to: npc.id,
      text: `💬 Поговорить с торговцем (#${this._sequences.npcId})`,
      type: 'CUSTOM',
    });
    this._sequences.npcId += 1;
  }

  private async _createLocationExit({ currentSpot }: MatcherContext) {
    let { exit } = this._customInteractions;

    if (exit == null) {
      exit = await this._dbService.repositories.interactionRepo.create({
        ...this._mapInfo,
        interactionId: 9000,
        text: 'Ты вырался из этого лабиринта живым. Хе, могло быть и хуже.',
      });
    }
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: currentSpot.id,
      to: exit.id,
      text: '',
      type: 'AUTO',
    });
  }

  private async _createBattle({ currentSpot, subtype }: MatcherContext) {
    if (!isBattleSubtype(subtype)) return console.error('Subtype mismatch');

    const [difficult, chanceOfTriggering] = parseBattleSubtype(subtype);
    const battle = await this._dbService.repositories.battleRepo.create({
      ...this._mapInfo,
      difficult,
      chanceOfTriggering,
    });
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: currentSpot.id,
      to: battle.id,
      text: '',
      type: 'AUTO',
    });
    const onWinInteraction = await this._dbService.repositories.interactionRepo.create({
      ...this._mapInfo,
      interactionId: this._sequences.interactionId,
      text: 'Больше тут ничего и никого нет.',
    });
    this._sequences.interactionId += 1;
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: battle.id,
      to: onWinInteraction.id,
      text: 'OnWin',
      type: 'SYSTEM',
    });
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: onWinInteraction.id,
      to: currentSpot.id,
      text: '',
      type: 'AUTO',
    });
    await this._dbService.repositories.actionRepo.create({
      ...this._mapInfo,
      from: battle.id,
      to: this._customInteractions.onPlayerDied == null ? currentSpot.id : this._customInteractions.onPlayerDied.id,
      text: 'OnLose',
      type: 'SYSTEM',
    });
  }

  private async _createAboveSpot({ currentSpot }: MatcherContext) {
    const above = this._mapSpotMap.get(`${currentSpot.x}:${currentSpot.y - 1}`);
    if (above != null) {
      await this._dbService.repositories.actionRepo.create({
        ...this._mapInfo,
        from: currentSpot.id,
        to: above.id,
        text: currentSpot.isThroughable && above.isThroughable ? MOVE_ACTIONS.TO_NORTH : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
      });
      await this._dbService.repositories.actionRepo.create({
        ...this._mapInfo,
        from: above.id,
        to: currentSpot.id,
        text: currentSpot.isThroughable && above.isThroughable ? MOVE_ACTIONS.TO_SOUTH : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
      });
    }
  }

  private async _createLeftSpot({ currentSpot }: MatcherContext) {
    const left = this._mapSpotMap.get(`${currentSpot.x - 1}:${currentSpot.y}`);
    if (left != null) {
      await this._dbService.repositories.actionRepo.create({
        ...this._mapInfo,
        from: currentSpot.id,
        to: left.id,
        text: currentSpot.isThroughable && left.isThroughable ? MOVE_ACTIONS.TO_WEST : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
      });
      await this._dbService.repositories.actionRepo.create({
        ...this._mapInfo,
        from: left.id,
        to: currentSpot.id,
        text: currentSpot.isThroughable && left.isThroughable ? MOVE_ACTIONS.TO_EAST : MOVE_ACTIONS.NO_WAY,
        type: 'CUSTOM',
      });
    }
  }

  constructor(mapImagePath: string, mapInfo: MapInfo, customInteractions: CustomInteractions = {}) {
    this._mapImagePath = mapImagePath;
    this._mapInfo = mapInfo;
    this._customInteractions = customInteractions;
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
        const currentSpot = await this._createSpot(x, y, subtype);
        await this._createRelatedNodes({ currentSpot, subtype });
        await this._createAboveSpot({ currentSpot, subtype });
        await this._createLeftSpot({ currentSpot, subtype });
      } catch (e) {
        console.error('MapParser::parse', e);
      }
    }
  }

  public async destructor(): Promise<void> {
    await this._dbService.destructor();
  }
}
