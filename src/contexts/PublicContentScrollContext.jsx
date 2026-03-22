import React, { createContext, useContext } from 'react';

/** The scrollable content root in PublicLayout (`Layout.Content` DOM node) for scroll-spy. */
export const PublicContentScrollRefContext = createContext(null);

export function usePublicContentScrollRoot() {
  return useContext(PublicContentScrollRefContext);
}

/** @deprecated Use `usePublicContentScrollRoot` */
export const usePublicContentScrollRef = usePublicContentScrollRoot;
