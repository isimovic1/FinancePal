import type { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Kuća i režije', type: 'expense', icon: 'home-outline', color: '#1C7EF2' },
  { id: 'food', name: 'Hrana', type: 'expense', icon: 'cart-outline', color: '#22A86B' },
  { id: 'transport', name: 'Prijevoz', type: 'expense', icon: 'car-outline', color: '#8B5CF6' },
  { id: 'fun', name: 'Zabava', type: 'expense', icon: 'game-controller-outline', color: '#F2A11C' },
  { id: 'dining', name: 'Kafići i restorani', type: 'expense', icon: 'cafe-outline', color: '#D97706' },
  { id: 'health', name: 'Zdravlje', type: 'expense', icon: 'medkit-outline', color: '#E5484D' },
  { id: 'clothes', name: 'Odjeća', type: 'expense', icon: 'shirt-outline', color: '#EC4899' },
  { id: 'subscriptions', name: 'Pretplate', type: 'expense', icon: 'repeat-outline', color: '#0EA5E9' },
  { id: 'savings', name: 'Štednja', type: 'expense', icon: 'wallet-outline', color: '#14B8A6', isSavings: true },
  { id: 'other-expense', name: 'Ostalo', type: 'expense', icon: 'ellipsis-horizontal-circle-outline', color: '#6B7686' },
  { id: 'salary', name: 'Plaća', type: 'income', icon: 'briefcase-outline', color: '#22A86B' },
  { id: 'extra', name: 'Dodatni prihod', type: 'income', icon: 'cash-outline', color: '#0EA5E9' },
  { id: 'other-income', name: 'Ostali prihodi', type: 'income', icon: 'add-circle-outline', color: '#6B7686' },
];

/** Choices offered when the user creates a category. */
export const CATEGORY_ICONS = [
  'home-outline', 'cart-outline', 'car-outline', 'game-controller-outline', 'cafe-outline', 'medkit-outline',
  'shirt-outline', 'repeat-outline', 'wallet-outline', 'briefcase-outline', 'cash-outline', 'airplane-outline',
  'paw-outline', 'school-outline', 'gift-outline', 'barbell-outline', 'phone-portrait-outline', 'flash-outline',
  'water-outline', 'beer-outline', 'build-outline', 'heart-outline', 'card-outline', 'ellipsis-horizontal-circle-outline',
];

export const CATEGORY_COLORS = [
  '#1C7EF2', '#22A86B', '#8B5CF6', '#F2A11C', '#D97706', '#E5484D', '#EC4899', '#0EA5E9', '#14B8A6', '#6B7686',
];
