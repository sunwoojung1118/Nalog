import { createContext, useContext } from 'react';

export type SheetSnap = 'full' | 'bar';

export type SheetStateValue = {
  snap: SheetSnap;
  requestSnap: (next: SheetSnap) => void;
};

const noop = () => {};

export const SheetStateContext = createContext<SheetStateValue>({
  snap: 'full',
  requestSnap: noop,
});

export function useSheetSnap(): SheetStateValue {
  return useContext(SheetStateContext);
}
