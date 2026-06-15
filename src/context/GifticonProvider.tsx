import { ReactNode } from 'react';
import { GifticonContext } from './GifticonContext';
import { useGifticons } from '../hooks/useGifticons';

export function GifticonProvider({ children }: { children: ReactNode }) {
  const value = useGifticons();
  return <GifticonContext.Provider value={value}>{children}</GifticonContext.Provider>;
}
