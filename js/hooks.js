/* ── useReveal ───────────────────────────────────────────────────────────── */
/* Adds .in class to element when it enters viewport (fires once). */
function useReveal(m = '-60px') {
  const ref = useRef();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('in'); obs.disconnect(); }
    }, { rootMargin: m });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ── FadeImg ─────────────────────────────────────────────────────────────
   Lazy image that fades in once decoded instead of popping in. Handles the
   cached case where `load` fires before React attaches the handler. */
function FadeImg({ className = '', alt = '', eager = false, ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);
  return (
    <img
      ref={ref}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={`img-fade${loaded ? ' is-loaded' : ''} ${className}`.trim()}
      {...rest}
    />
  );
}
