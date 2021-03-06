import { UserActSelectorAbstractAdapter } from '@ui/UserActSelectorAbstractAdapter';

import { BaseUserActSelector, UserActSelectorOptions } from './BaseUserActSelector';
import { OnMapUserActSelector } from './OnMapUserActSelector';
import { HandshakeUserActSelector } from './HandshakeUserActSelector';
import { BattleUserActSelector } from './BattleUserActSelector';
import { MainMenuUserActSelector } from './MainMenuUserActSelector';
import { InventoryUserActSelector } from './InventoryUserActSelector';

interface UserActSelectorFactory {
  new(options: UserActSelectorOptions): BaseUserActSelector;
}

export type UserActSelectorType = 'BASE' | 'ON_MAP' | 'HANDSHAKE' | 'BATTLE' | 'MAIN_MENU' | 'INVENTORY_MENU';

export class UserActSelectorManager {
  private static readonly _unitFactoryMap: Map<string, UserActSelectorFactory> = new Map();

  public static registerFactory(
    id: string,
    scenarioFactory: UserActSelectorFactory,
  ): typeof UserActSelectorManager {
    this._unitFactoryMap.set(id, scenarioFactory);
    return this;
  }

  private readonly _unitMap: Map<string, BaseUserActSelector> = new Map();

  private readonly _adapter: UserActSelectorAbstractAdapter;

  constructor(adapter: UserActSelectorAbstractAdapter) {
    this._adapter = adapter;
  }

  public add(id: string, unit: BaseUserActSelector): this {
    this._unitMap.set(id, unit);
    return this;
  }

  public takeById(id: string): BaseUserActSelector | null {
    const unit = this._unitMap.get(id);

    return unit ?? null;
  }

  public takeOrCreate(id: string): BaseUserActSelector {
    const unit = this.takeById(id);
    if (unit !== null) return unit;

    return this.create(id);
  }

  public create(id: string): BaseUserActSelector {
    const UnitFactory = UserActSelectorManager._unitFactoryMap.get(id);
    if (UnitFactory == null) throw new Error(`UnitFactory with id ${id} not registered`);

    const unit = new UnitFactory({ adapter: this._adapter });
    return unit;
  }
}

UserActSelectorManager.registerFactory('BASE', BaseUserActSelector);
UserActSelectorManager.registerFactory('ON_MAP', OnMapUserActSelector);
UserActSelectorManager.registerFactory('HANDSHAKE', HandshakeUserActSelector);
UserActSelectorManager.registerFactory('BATTLE', BattleUserActSelector);
UserActSelectorManager.registerFactory('MAIN_MENU', MainMenuUserActSelector);
UserActSelectorManager.registerFactory('INVENTORY_MENU', InventoryUserActSelector);
