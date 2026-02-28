import { type PropsWithChildren, useCallback, useMemo, useState } from "react";
import {
  type BreadcrumbState,
  type Popover,
  UIContext,
} from "@ev/eva-container-api";

export const MOBILE_TOP_BAR_HEIGHT = 56;
export const DESKTOP_TOP_BAR_HEIGHT = 68;

type UIStateProviderProps = PropsWithChildren<Record<string, unknown>>;

export function UIStateProvider({ children }: UIStateProviderProps) {
  const [openDrawerList, setOpenDrawerList] = useState<string[]>([]);
  const [openPopovers, setOpenPopovers] = useState<Popover[]>([]);
  const [isLayoutDeactivated, setLayoutDeactivated] = useState<boolean>(false);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbState>({
    current: "",
    breadcrumbs: [],
  });
  const clearBreadcrumb = useCallback(
    () => setBreadcrumb({ current: "", breadcrumbs: [] }),
    [],
  );

  const getIsDrawerOpen = useCallback(
    (name: string) => openDrawerList.includes(name),
    [openDrawerList],
  );

  const setDrawerOpen = useCallback((name: string, open: boolean) => {
    setOpenDrawerList((state) =>
      open
        ? [...state, name]
        : state.filter((drawerName) => drawerName !== name),
    );
  }, []);

  const isAnyDrawerOpen = openDrawerList.length > 0;

  const contextValue = useMemo(
    () => ({
      isAnyDrawerOpen,
      getIsDrawerOpen,
      setDrawerOpen,
      breadcrumb,
      setBreadcrumb,
      clearBreadcrumb,
      isLayoutDeactivated,
      deactivateLayout: setLayoutDeactivated,
      desktopTopBarHeight: DESKTOP_TOP_BAR_HEIGHT,
      mobileTopBarHeight: MOBILE_TOP_BAR_HEIGHT,
      openPopovers,
      setOpenPopovers,
    }),
    [
      isAnyDrawerOpen,
      getIsDrawerOpen,
      setDrawerOpen,
      breadcrumb,
      setBreadcrumb,
      clearBreadcrumb,
      isLayoutDeactivated,
      setLayoutDeactivated,
      openPopovers,
      setOpenPopovers,
    ],
  );

  return <UIContext value={contextValue}>{children}</UIContext>;
}
