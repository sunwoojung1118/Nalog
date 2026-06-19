import { Ionicons } from '@expo/vector-icons';
import { SymbolView } from 'expo-symbols';
import type { SFSymbol } from 'sf-symbols-typescript';
import React from 'react';

const IONICONS_MAP = {
  'house':                  'home-outline',
  'house.fill':             'home',
  'safari':                 'compass-outline',
  'person.circle':          'person-circle-outline',
  'person.circle.fill':     'person-circle',
  'square.and.pencil':      'create-outline',
  'bell':                   'notifications-outline',
  'bell.fill':              'notifications',
  'ellipsis.circle':        'ellipsis-horizontal-circle-outline',
  'photo':                  'image-outline',
  'tablecells':             'grid-outline',
  'doc':                    'document-outline',
  'checklist':              'checkbox-outline',
  'flame':                  'flame-outline',
  'flame.fill':             'flame',
  'bubble.left':            'chatbubble-outline',
  'bubble.left.fill':       'chatbubble',
  'square.and.arrow.up':    'share-outline',
  'bookmark':               'bookmark-outline',
  'bookmark.fill':          'bookmark',
  'chevron.up':             'chevron-up-outline',
  'chevron.down':           'chevron-down-outline',
  'paperclip':              'attach-outline',
  'pencil':                 'pencil-outline',
} as const;

export type IconName = keyof typeof IONICONS_MAP;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  weight?: 'ultraLight' | 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'heavy' | 'black';
};

export function Icon({ name, size = 24, color = '#000000', weight = 'regular' }: Props) {
  return (
    <SymbolView
      name={name as SFSymbol}
      size={size}
      tintColor={color}
      weight={weight}
      type="monochrome"
      fallback={
        <Ionicons
          name={IONICONS_MAP[name] as React.ComponentProps<typeof Ionicons>['name']}
          size={size}
          color={color}
        />
      }
    />
  );
}
