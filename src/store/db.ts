import Dexie, { type EntityTable } from 'dexie';
import type { Page, Slot, Sticker, AlbumConfig } from '../types';

export class AlbumDatabase extends Dexie {
  // Tabelas do banco
  pages!: EntityTable<Page, 'id'>;
  slots!: EntityTable<Slot, 'id'>;
  stickers!: EntityTable<Sticker, 'id'>;
  config!: EntityTable<AlbumConfig, 'id'>;

  constructor() {
    super('AlbumFigurinhasV2DB');
    
    // O Schema das tabelas. Os campos definidos aqui são os que podem ser buscados rapidamente (indexes).
    // Não precisamos listar todos os campos das interfaces, apenas as Primary Keys (ex: id) e os Índices.
    this.version(1).stores({
      config: 'id',
      pages: 'id, albumId, order',
      slots: 'id, pageId', // Permite buscar rápido: db.slots.where('pageId').equals('page-1')
      stickers: 'id, rarity'
    });
  }
}

export const db = new AlbumDatabase();
