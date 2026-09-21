export const colors = {
  bg: '#F3F5F8',
  surface: '#FFFFFF',
  ink: '#1B2530',
  muted: '#66727F',
  faint: '#95A0AB',
  line: '#D5DCE4',
  soft: '#E6EAF0',
  good: '#1B7F4F',
  warn: '#B4530A',
  bad: '#B3261E',
};

// One strong colour and one light tint per subject.
export const palette: { strong: string; tint: string }[] = [
  { strong: '#C2255C', tint: '#FBE7EE' }, // raspberry
  { strong: '#2A5BD7', tint: '#E5ECFC' }, // cobalt
  { strong: '#1B7F4F', tint: '#DFF2E8' }, // green
  { strong: '#B4530A', tint: '#FBEADB' }, // orange
  { strong: '#6D3FC9', tint: '#EDE6FA' }, // violet
  { strong: '#0E7C8C', tint: '#DAF0F3' }, // teal
  { strong: '#66740E', tint: '#EEF2D3' }, // olive
  { strong: '#B3261E', tint: '#FBE4E2' }, // crimson
];

export function colorFor(index: number): { strong: string; tint: string } {
  return palette[Math.abs(Math.floor(index)) % palette.length];
}

// React Native needs one font file per weight.
export const font = {
  regular: 'BricolageGrotesque_400Regular',
  medium: 'BricolageGrotesque_500Medium',
  semibold: 'BricolageGrotesque_600SemiBold',
  bold: 'BricolageGrotesque_700Bold',
  extrabold: 'BricolageGrotesque_800ExtraBold',
} as const;

export type FontWeightName = keyof typeof font;
