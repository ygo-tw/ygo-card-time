import { Schema } from 'mongoose';
export type ModelNames =
  | 'admin'
  | 'backend_token'
  | 'banner'
  | 'battle_paper'
  | 'calendar'
  | 'cards'
  | 'decks'
  | 'forbidden_card_list'
  | 'frontend_token'
  | 'jurisprudence'
  | 'meta_deck'
  | 'permission'
  | 'product_information'
  | 'product_information_type'
  | 'rules'
  | 'series_story'
  | 'tag'
  | 'useful_card_introduction'
  | 'price_archive';

export type SchemaObject = {
  hasGetterSetter?: Schema;
  hasPopulate?: Schema;
  originSchema: Schema;
};

export type ModelSchema = { [key in ModelNames]?: SchemaObject };
