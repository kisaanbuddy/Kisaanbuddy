"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
/** Viewport state is only consumed by the mobile stylesheet. No desktop styles change. */
export function MobileLayoutState() {
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.dataset.mobilePage = (pathname || "/").split("/")[1] || "home";
  }, [pathname]);
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const active = document.activeElement;
      const editing = active instanceof HTMLElement && (active.matches("input, textarea, select") || active.isContentEditable);
      document.documentElement.toggleAttribute("data-mobile-keyboard", window.innerWidth < 768 && Boolean(editing) && Boolean(viewport && window.innerHeight - viewport.height > 120));
    };
    viewport?.addEventListener("resize", update);
    window.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => { viewport?.removeEventListener("resize", update); window.removeEventListener("resize", update); document.removeEventListener("focusin", update); document.removeEventListener("focusout", update); document.documentElement.removeAttribute("data-mobile-keyboard"); };
  }, []);
  return null;
}
