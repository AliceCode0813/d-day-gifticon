import { createContext, useContext } from 'react';
import { GifticonContextValue } from '../hooks/useGifticons';

export const GifticonContext = createContext<GifticonContextValue | null>(null);

export function useGifticonContext(): GifticonContextValue {
  const context = useContext(GifticonContext);
  if (!context) {
    throw new Error('useGifticonContext must be used within GifticonProvider');
  }
  return context;
}
