/**
 * jsdom doesn't implement matchMedia. Client components that gate on
 * prefers-reduced-motion / (hover: hover) / (pointer: fine) call it
 * during useEffect and crash the render tests without this stub.
 *
 * The stub defaults to matches:false (motion allowed / hover:hover) so
 * the "motion-enabled" branch is what render tests exercise. Individual
 * tests can override by monkey-patching window.matchMedia before render
 * (see photo-grid.render.test.tsx patterns for future reduced-motion
 * assertions).
 */
if (typeof window !== "undefined" && typeof window.matchMedia !== "function") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
