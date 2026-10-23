// Rinrada-Dev portal: the pricing calculator, the system filter, the mail form, the Bangkok clock and the motion layer.
// Every part works without it: the calculator shows its first result in the HTML and the form falls back to mailto.

const EMAIL = 'you@example.com';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// The pricing rule of the supplier price system: markup is on cost, margin is on price; the selling price is the same either way.
const calc = document.querySelector('[data-calc]');
if (calc) {
  const money = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (n) => `${money.format(n * 100)}%`;
  const num = (v) => Number(String(v).replace(/,/g, ''));
  const show = () => {
    const cost = num(calc.cost.value);
    const p = num(calc.pct.value) / 100;
    const ok = cost > 0 && p >= 0 && (calc.mode.value === 'markup' || p < 1);
    const price = !ok ? NaN : calc.mode.value === 'markup' ? cost * (1 + p) : cost / (1 - p);
    const markup = (price - cost) / cost;
    const margin = (price - cost) / price;
    calc.querySelector('[data-price]').textContent = ok ? money.format(price) : '-';
    calc.querySelector('[data-markup]').textContent = ok ? pct(markup) : '-';
    calc.querySelector('[data-margin]').textContent = ok ? pct(margin) : '-';
  };
  calc.addEventListener('input', show);
  calc.addEventListener('submit', (e) => e.preventDefault());
}

// Filter: all systems, or only those with a demo online.
const filters = document.querySelectorAll('[data-filter]');
filters.forEach((btn) =>
  btn.addEventListener('click', () => {
    filters.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    document.querySelectorAll('.strip').forEach((s) => {
      s.hidden = btn.dataset.filter === 'live' && s.dataset.live !== 'yes';
    });
  }),
);

// The form writes the email; the visitor's own mail program sends it.
const form = document.querySelector('[data-mail]');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const who = form.who.value.trim();
    const system = form.system.value;
    const subject = `สนใจ${system}`;
    const body = `สวัสดีครับ/ค่ะ\n\nผม/ดิฉัน ${who} สนใจ${system}\nอยากเล่างานของเราให้ฟัง และขอดูเดโม\n\nขอบคุณครับ/ค่ะ`;
    const link = document.createElement('a');
    link.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
  });
}

// Local time in Bangkok, where the work is done.
const clock = document.querySelector('[data-clock]');
if (clock) {
  const fmt = new Intl.DateTimeFormat('th-TH', { timeZone: 'Asia/Bangkok', hour: '2-digit', minute: '2-digit' });
  const tick = () => (clock.textContent = `${fmt.format(new Date())} น.`);
  tick();
  setInterval(tick, 15000);
}

// A visitor who asked for less motion gets the clip's still frame; it plays only on request.
if (reduce) document.querySelectorAll('video[autoplay]').forEach((v) => {
  v.removeAttribute('autoplay');
  v.pause();
  v.controls = true;
});

// The drifting strip needs its frames twice to loop without a seam.
const run = document.querySelector('.contact__run');
if (run && !reduce) run.append(...[...run.children].map((n) => n.cloneNode(true)));

// Entrances: the parts of each section rise in turn as it arrives; the hero picture opens like a shutter.
const groups = [
  ['.hero', '.tile'],
  ['.work', '.work__rail, .strip'],
  ['.sys', '.tile'],
  ['.how', '.how__field'],
  ['.contact', '.contact__body > *'],
  ['.foot', '.tile'],
];
const shutter = document.querySelector('[data-shutter]');
if (!reduce && 'IntersectionObserver' in window) {
  for (const [section, parts] of groups) {
    document.querySelectorAll(section).forEach((root) => {
      root.querySelectorAll(parts).forEach((el, i) => {
        if (el.hasAttribute('data-shutter')) return;
        el.setAttribute('data-reveal', '');
        el.style.setProperty('--d', `${Math.min(i, 8) * 70}ms`);
      });
    });
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
  if (shutter) requestAnimationFrame(() => requestAnimationFrame(() => shutter.classList.add('is-open')));
} else if (shutter) {
  shutter.classList.add('is-open');
}
