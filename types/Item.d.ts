import GameEntity = require('../src/GameEntity');
import ItemType = require('../src/ItemType');
import { Inventory } from '../src/Inventory';

export type EntityReference = unknown;

export interface ItemConfig {
  metadata?: Record<string, unknown>;
  behaviors?: Record<string, unknown>;
  items?: number[];
  description?: string;
  entityReference?: string;
  id: number;
  maxItems?: number;
  inventory?: unknown;
  isEquipped?: boolean;
  keywords: string[];
  name: string;
  room?: unknown;
  roomDesc?: string;
  script?: string | null;
  type?: keyof typeof ItemType | string;
  uuid?: string;
  closeable?: boolean;
  closed?: boolean;
  locked?: boolean;
  lockedBy?: EntityReference | null;
}

declare class Item extends GameEntity {
  constructor(area: unknown, item: ItemConfig);

  area: unknown;
  metadata: Record<string, unknown>;
  behaviors: Map<string, unknown>;
  defaultItems: number[];
  description: string;
  entityReference?: string;
  id: number;
  maxItems: number;
  inventory: Inventory | null;
  isEquipped: boolean;
  keywords: string[];
  name: string;
  room: unknown;
  roomDesc: string;
  script: string | null;
  type: ItemType | string;
  uuid: string;
  closeable: boolean;
  closed: boolean;
  locked: boolean;
  lockedBy: EntityReference | null;
  carriedBy: unknown;
  equippedBy: unknown;

  initializeInventory(inventory: unknown): void;
  hasKeyword(keyword: string): boolean;
  addItem(item: Item): void;
  removeItem(item: Item): void;
  isInventoryFull(): boolean;
  findCarrier(): unknown;
  open(): void;
  close(): void;
  lock(): void;
  unlock(): void;
  hydrate(state: unknown, serialized?: Record<string, unknown>): boolean | void;
  serialize(): Record<string, unknown>;
}

export = Item;
