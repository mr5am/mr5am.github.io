/* ── Category config ────────────────────────────────────────────────────────── */
const CATEGORIES = ['GAME', 'APP', 'ART', 'VIDEO', 'MUSIC', 'WEB'];
const CAT_JP   = { ART:'芸術', APP:'アプリ', VIDEO:'映像', MUSIC:'音楽', GAME:'ゲーム', WEB:'ウェブ' };
const CAT_DESC = { ART:'Generative & Painterly', APP:'Product & Interface', VIDEO:'Anime & Motion', MUSIC:'Generative & Ambient', GAME:'Indie · iPhone & Web', WEB:'Systems & Interfaces' };

/* Art is explored, products are shipped. Calling a released App Store app a
   "study" undersells it, so the noun follows the medium. Unknown categories
   fall back to STUDY, keeping the site's original voice as the default. */
const CAT_NOUN = {
  ART:['STUDY','STUDIES'], VIDEO:['STUDY','STUDIES'], MUSIC:['STUDY','STUDIES'],
  APP:['PROJECT','PROJECTS'], GAME:['PROJECT','PROJECTS'], WEB:['PROJECT','PROJECTS'],
};
const catNoun  = (cat, n) => (CAT_NOUN[cat] || CAT_NOUN.ART)[n === 1 ? 0 : 1];
const viewVerb = tag => `VIEW ${(CAT_NOUN[tag] || CAT_NOUN.ART)[0]}`;

/* Every real destination a work offers, oldest-format entries included. */
const workLinks = work => {
  if (Array.isArray(work.links) && work.links.length) return work.links;
  if (work.link) return [{ label: work.linkLabel || `${viewVerb(work.tag)} ↗`, href: work.link }];
  return [];
};

/* Shared keyboard activation for div-based cards. */
const onActivateKey = fn => e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
};

/* ── Status chip ───────────────────────────────────────────────────────────── */
function StatusChip({ status, acc, dim }) {
  if (!status) return null;
  return (
    <span className="chip chip-status" style={{ color:acc, borderColor:`${acc}66`, background:'rgba(0,0,0,0.5)', opacity: dim ? .85 : 1 }}>
      <span className="chip-dot" style={{ background:acc, boxShadow:`0 0 8px ${acc}` }} />
      {status}
    </span>
  );
}

/* ── Project Overlay ────────────────────────────────────────────────────────── */
function ProjectOverlay({ work, cfg, isDark, onClose }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef();
  const closeBtnRef = useRef();
  const openerRef = useRef(null);
  const titleId = `proj-title-${work.id}`;

  const close = () => { setOpen(false); setTimeout(onClose, 520); };

  useEffect(() => {
    openerRef.current = document.activeElement;
    const t = setTimeout(() => setOpen(true), 10);
    const f = setTimeout(() => closeBtnRef.current && closeBtnRef.current.focus({ preventScroll:true }), 60);
    const onKey = e => {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab' || !panelRef.current) return;
      // Keep Tab inside the dialog while it is open.
      const focusables = panelRef.current.querySelectorAll('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t); clearTimeout(f);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      // Hand focus back to the card that opened the dialog.
      const opener = openerRef.current;
      if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus({ preventScroll:true });
    };
  }, []);

  const bg = isDark ? '#080808' : '#f5f4f0';
  const fg = isDark ? '#f0ece4' : '#111';
  const sub = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.5)';
  const hasMedia = work.video || work.img;
  const links = workLinks(work);
  const meta = [
    work.platform && ['Platform', work.platform],
    work.engine && ['Engine', work.engine],
    work.phase && ['Where it is', work.phase],
  ].filter(Boolean);

  return ReactDOM.createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:800, pointerEvents: open ? 'all' : 'none' }}>
      <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.72)', backdropFilter:'blur(5px)', opacity:open?1:0, transition:'opacity .4s' }} />
      <div ref={panelRef} className="proj-ov-panel" role="dialog" aria-modal="true" aria-labelledby={titleId} style={{
        position:'absolute', bottom:0, left:0, right:0, maxHeight:'90vh', overflowY:'auto',
        background:bg, borderRadius:'14px 14px 0 0', borderTop:`1px solid ${cfg.acc}44`,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
      }}>
        {work.video ? (
          <div style={{ height:'clamp(240px,45vh,480px)', overflow:'hidden', position:'relative', background:'#000' }}>
            <video
              src={work.video}
              poster={work.img || undefined}
              controls autoPlay muted loop playsInline
              style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            />
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:`linear-gradient(to top,${bg},transparent)`, pointerEvents:'none' }} />
          </div>
        ) : work.img ? (
          <div style={{ height:'42vh', overflow:'hidden', position:'relative', background:'#000' }}>
            <FadeImg src={work.img} alt={work.title} eager style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(to top,${bg} 0%,transparent 55%)` }} />
          </div>
        ) : null}
        <div className="proj-ov-body" style={{ marginTop: hasMedia ? -48 : 0, paddingTop: hasMedia ? 0 : 40 }}>
          <div style={{ display:'flex', justifyContent:'flex-end', paddingBottom:16 }}>
            <button ref={closeBtnRef} onClick={close} className="proj-ov-close" style={{ color:fg, border:`1px solid ${cfg.acc}66`, background: isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)' }}>ESC / CLOSE</button>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', marginBottom:14 }}>
            <div style={{ fontFamily:'Space Mono', fontSize:8, color:cfg.acc, letterSpacing:'.22em' }}>{work.tag} · {work.year}</div>
            <StatusChip status={work.status} acc={cfg.acc} />
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:18, flexWrap:'wrap' }}>
            {work.icon && <img src={work.icon} alt="" width="56" height="56" style={{ width:56, height:56, borderRadius:14, flexShrink:0, boxShadow:'0 10px 30px rgba(0,0,0,.35)', marginBottom:8 }} />}
            <h2 id={titleId} style={{ fontFamily:'Bebas Neue', fontSize:'clamp(52px,8vw,120px)', lineHeight:.88, color:fg, marginBottom:8, letterSpacing:'.02em' }}>{work.title}</h2>
          </div>
          <div style={{ fontFamily:'Noto Sans JP', fontWeight:700, fontSize:15, color:`${cfg.acc}80`, marginBottom:20 }}>{work.jp}</div>
          <div style={{ fontFamily:'Space Mono', fontSize:11, color:sub, lineHeight:2 }}>{work.type}</div>
          {work.tagline && (
            <div style={{ marginTop:18, fontFamily:'Bebas Neue', fontSize:26, letterSpacing:'.04em', color:fg, opacity:.85 }}>{work.tagline}</div>
          )}
          {work.blurb && (
            <p style={{ marginTop:18, maxWidth:620, fontFamily:'Space Mono', fontSize:11, lineHeight:2, color:sub }}>
              {work.blurb}
            </p>
          )}
          {meta.length > 0 && (
            <dl className="proj-ov-meta" style={{ borderColor:`${cfg.acc}22` }}>
              {meta.map(([k, v]) => (
                <div key={k}>
                  <dt style={{ color:sub }}>{k}</dt>
                  <dd style={{ color:fg }}>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {/* Rendered only when the work has somewhere to go. This used to be an
              unconditional href="#", so every project offered a CTA that did
              nothing — worse than offering none. */}
          {links.length > 0 && (
            <div style={{ marginTop:36, display:'flex', gap:14, flexWrap:'wrap' }}>
              {links.map((l, i) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
                  className={`proj-ov-cta${i === 0 ? ' is-primary' : ''}`}
                  style={{ color: i === 0 ? '#000' : cfg.acc, background: i === 0 ? cfg.acc : 'transparent', border:`1px solid ${cfg.acc}` }}
                  onMouseEnter={e=>{ e.currentTarget.style.background = i === 0 ? '#fff' : cfg.acc; e.currentTarget.style.color = '#000'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background = i === 0 ? cfg.acc : 'transparent'; e.currentTarget.style.color = i === 0 ? '#000' : cfg.acc; }}
                >{l.label}</a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  , document.body);
}

/* ── Work Card V ──────────────────────────────────────────────────────────────────────── */
function WorkCardV({ work, cfg, isDark, index, onOpen }) {
  const [hov, setHov] = useState(false);
  const ref = useReveal('-80px');
  const isMobile = navigator.maxTouchPoints > 0;
  const open = () => onOpen(work);
  return (
    <div ref={ref} className="rv work-v"
      role="button" tabIndex={0}
      aria-label={`${work.title}: ${work.type}. ${viewVerb(work.tag).toLowerCase()}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      onClick={open}
      onKeyDown={onActivateKey(open)}
      style={{ borderBottom:`1px solid ${cfg.acc}18` }}
    >
      {work.img
        ? <FadeImg src={work.img} alt="" className="work-v-img" style={{ filter: isDark ? 'brightness(0.55)' : 'brightness(0.5) saturate(1.1)' }} />
        : <div style={{ position:'absolute', inset:0, background:`repeating-linear-gradient(45deg,${cfg.acc}06,${cfg.acc}06 1px,transparent 1px,transparent 22px)` }} />
      }
      {work.video && !isMobile && (
        <video
          autoPlay muted loop playsInline
          src={work.video}
          style={{
            position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
            opacity: hov ? 1 : 0,
            transition: 'opacity 0.45s ease',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(0,0,0,.7) 0%,rgba(0,0,0,.15) 55%,rgba(0,0,0,0) 100%)' }} />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,.65) 0%,rgba(0,0,0,0) 55%)' }} />
      <div style={{ position:'absolute', inset:0, background:`${cfg.acc}18`, opacity:hov?1:0, transition:'opacity .6s', mixBlendMode:'screen' }} />
      <div className="work-v-num" style={{ color:'rgba(255,255,255,0.05)' }}>
        {String(index+1).padStart(2,'0')}
      </div>
      <div className="work-v-tags">
        <span className="chip chip-tag" style={{ borderColor:`${cfg.acc}55` }}>{work.tag}</span>
        <StatusChip status={work.status} acc={cfg.acc} />
      </div>
      <div className="work-v-body" style={{ transform:hov?'translateY(0)':'translateY(10px)', transition:'transform .5s cubic-bezier(.22,1,.36,1)' }}>
        <div style={{ fontFamily:'Noto Sans JP', fontWeight:900, fontSize:10, color:`rgba(255,255,255,${hov?.65:.3})`, letterSpacing:'.08em', marginBottom:6, transition:'color .3s' }}>
          {work.jp} · {work.year}
        </div>
        <h3 style={{ fontFamily:'Bebas Neue', fontSize:'clamp(34px,4.5vw,68px)', lineHeight:.9, letterSpacing:'.02em', color:'#fff', marginBottom:10 }}>{work.title}</h3>
        <div style={{ fontFamily:'Space Mono', fontSize:10, color:'rgba(255,255,255,0.45)', marginBottom:14 }}>{work.type}</div>
        <div style={{ display:'flex', alignItems:'center', gap:10, opacity:hov?1:0, transform:hov?'translateX(0)':'translateX(-14px)', transition:'all .4s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ width:28, height:1, background:cfg.acc }} />
          <span style={{ fontFamily:'Space Mono', fontSize:9, color:cfg.acc, letterSpacing:'.16em' }}>{viewVerb(work.tag)}</span>
          <span style={{ color:cfg.acc, fontSize:13 }}>→</span>
        </div>
      </div>
    </div>
  );
}

/* ── Category Tile ─────────────────────────────────────────────────────────────────── */
function CategoryTile({ category, works, cfg, isDark, onSelect }) {
  const [hov, setHov] = useState(false);
  const ref = useReveal('-60px');
  const coverImg = works.find(w => w.img)?.img || null;
  const select = () => onSelect(category);
  return (
    <div ref={ref} className="rv cat-tile"
      role="button" tabIndex={0}
      aria-label={`${category}: ${works.length ? `${works.length} ${catNoun(category, works.length).toLowerCase()}` : 'coming soon'}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      onClick={select}
      onKeyDown={onActivateKey(select)}
      style={{ borderBottom:`1px solid ${cfg.acc}18` }}
    >
      {coverImg
        ? <FadeImg src={coverImg} alt="" className="cat-tile-img" />
        : <div style={{ position:'absolute', inset:0, background:`repeating-linear-gradient(45deg,${cfg.acc}05,${cfg.acc}05 1px,transparent 1px,transparent 22px)` }} />
      }
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right,rgba(0,0,0,.88) 0%,rgba(0,0,0,.55) 45%,rgba(0,0,0,.18) 100%)' }} />
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:cfg.acc, opacity:hov?1:0.25, transition:'opacity .3s' }} />
      <div className="cat-tile-inner">
        <div>
          <div style={{ fontFamily:'Space Mono', fontSize:8, color:cfg.acc, letterSpacing:'.22em', marginBottom:4 }}>{CAT_JP[category]}</div>
          <div className="cat-tile-title" style={{ transform: hov ? 'translateX(8px)' : 'translateX(0)' }}>{category}</div>
          <div style={{
            fontFamily:'Space Mono', fontSize:9, color:'rgba(255,255,255,0.38)', letterSpacing:'.1em', marginTop:7,
            opacity: hov ? 1 : 0, transform: hov ? 'translateY(0)' : 'translateY(6px)', transition:'all .35s .05s',
          }}>{CAT_DESC[category]}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
          {works.length > 0 ? (
            <div style={{ fontFamily:'Space Mono', fontSize:10, color:'rgba(255,255,255,.5)', letterSpacing:'.12em' }}>
              {works.length} {catNoun(category, works.length)}
            </div>
          ) : (
            <div style={{ fontFamily:'Space Mono', fontSize:8, color:cfg.acc, letterSpacing:'.18em', border:`1px solid ${cfg.acc}55`, padding:'4px 12px' }}>SOON</div>
          )}
          <div style={{
            fontFamily:'Bebas Neue', fontSize:34, color:cfg.acc,
            opacity: hov ? 1 : 0.25, transform: hov ? 'translateX(6px)' : 'translateX(0)', transition:'all .35s',
          }}>→</div>
        </div>
      </div>
    </div>
  );
}

/* ── Category Detail ───────────────────────────────────────────────────────────── */
function CategoryDetail({ category, works, cfg, isDark, onBack, onOpen }) {
  const hRef = useReveal();
  const heading = isDark ? '#f0ece4' : '#111';
  const sub = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.5)';
  return (
    <div>
      <div ref={hRef} className="rv" style={{ padding:'0 32px 44px' }}>
        <button onClick={onBack} className="back-btn" style={{ color:cfg.acc, border:`1px solid ${cfg.acc}44` }}
          onMouseEnter={e => e.currentTarget.style.borderColor = cfg.acc}
          onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.acc}44`}
        >
          <span>←</span><span>ALL MEDIUMS</span><span className="back-btn-hint">ESC</span>
        </button>
        <SectionLabel n="003" label={`ARCHIVE · ${category}`} cfg={cfg} />
        <div className="section-head">
          <h2 style={{ fontFamily:'Bebas Neue', fontSize:'clamp(52px,7vw,108px)', lineHeight:.92, letterSpacing:'.02em', color:heading }}>
            {category}<br />
            <span style={{ WebkitTextStroke:`1px ${cfg.acc}`, color:'transparent' }}>{CAT_JP[category]}</span>
          </h2>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontFamily:'Space Mono', fontSize:9, color:sub, letterSpacing:'.12em' }}>{works.length} {catNoun(category, works.length)}</div>
            <div style={{ fontFamily:'Space Mono', fontSize:9, color:sub, letterSpacing:'.1em', marginTop:4 }}>{CAT_DESC[category]}</div>
          </div>
        </div>
      </div>
      {works.length === 0 ? (
        <div style={{ margin:'0 32px 60px', padding:'80px 32px', textAlign:'center', border:`1px solid ${cfg.acc}22`, display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
          <div style={{ fontFamily:'Bebas Neue', fontSize:52, color:cfg.acc, opacity:.3 }}>IN PROGRESS</div>
          <div style={{ fontFamily:'Space Mono', fontSize:9, color:sub, letterSpacing:'.18em' }}>{catNoun(category, 2)} IN PROGRESS</div>
        </div>
      ) : (
        works.map((work, idx) => (
          <WorkCardV key={work.id} work={work} cfg={cfg} isDark={isDark} index={idx} onOpen={onOpen} />
        ))
      )}
    </div>
  );
}

/* ── Works Section ───────────────────────────────────────────────────────────────── */
function WorksSection({ mode, isDark }) {
  const cfg = MODES[mode];
  const hRef = useReveal();
  const [selectedCat, setSelectedCat] = useState(null);
  const [activeWork, setActiveWork] = useState(null);
  const firstRender = useRef(true);
  const heading = isDark ? '#f0ece4' : '#111';

  const worksByCat = useMemo(() =>
    Object.fromEntries(CATEGORIES.map(c => [c, WORKS.filter(w => w.tag === c)])),
    []
  );

  // Drilling into a medium swaps the tile stack for a list; without this the
  // viewport stayed wherever the clicked tile was, often past the new header.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const el = document.getElementById('work');
    if (el) el.scrollIntoView({ behavior:'smooth', block:'start' });
  }, [selectedCat]);

  // ESC backs out of a medium when no dialog is open above it.
  useEffect(() => {
    if (!selectedCat || activeWork) return;
    const onKey = e => { if (e.key === 'Escape') setSelectedCat(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [selectedCat, activeWork]);

  return (
    <section id="work" className="anchor-target" style={{ paddingTop:80, borderTop:`1px solid ${tx(cfg.acc+'18',cfg.acc+'28',isDark)}` }}>
      {selectedCat ? (
        <CategoryDetail
          category={selectedCat}
          works={worksByCat[selectedCat]}
          cfg={cfg}
          isDark={isDark}
          onBack={() => setSelectedCat(null)}
          onOpen={setActiveWork}
        />
      ) : (
        <>
          <div ref={hRef} className="rv" style={{ padding:'0 32px 44px' }}>
            <SectionLabel n="003" label="ARCHIVE" cfg={cfg} />
            <div className="section-head">
              <h2 style={{ fontFamily:'Bebas Neue', fontSize:'clamp(52px,7vw,108px)', lineHeight:.92, letterSpacing:'.02em', color:heading }}>
                MADE<br /><span style={{ WebkitTextStroke:`1px ${cfg.acc}`, color:'transparent' }}>IN MOTION</span>
              </h2>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:'Space Mono', fontSize:9, color:tx('rgba(255,255,255,0.28)','rgba(0,0,0,0.38)',isDark), letterSpacing:'.12em' }}>{WORKS.length} WORKS</div>
                <div style={{ fontFamily:'Noto Sans JP', fontWeight:900, fontSize:13, color:tx('rgba(255,255,255,0.12)','rgba(0,0,0,0.15)',isDark), marginTop:2 }}>選ばれた作品</div>
              </div>
            </div>
            <p style={{ marginTop:14, maxWidth:640, fontFamily:'Space Mono', fontSize:11, lineHeight:1.9, color:tx('rgba(255,255,255,0.42)','rgba(0,0,0,0.58)',isDark) }}>
              The full body of work arranged by medium: games, apps, image, motion, sound, and systems.
            </p>
          </div>
          {CATEGORIES.map(cat => (
            <CategoryTile key={cat} category={cat} works={worksByCat[cat]} cfg={cfg} isDark={isDark} onSelect={setSelectedCat} />
          ))}
        </>
      )}
      {activeWork && <ProjectOverlay work={activeWork} cfg={cfg} isDark={isDark} onClose={() => setActiveWork(null)} />}
    </section>
  );
}
