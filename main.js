// Rinrada-Dev portal: full-size screenshot viewer, the mail form, and a light fade-in on scroll.
// Without it the page still reads in full and the form falls back to mailto.

const EMAIL = 'you@example.com';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Click a screenshot to see it whole.
const viewer = document.querySelector('.viewer');
const viewerImg = viewer?.querySelector('img');
document.querySelectorAll('[data-view]').forEach((btn) =>
  btn.addEventListener('click', () => {
    if (!viewer?.showModal) return;
    viewerImg.src = btn.dataset.view;
    viewerImg.alt = btn.querySelector('img')?.alt ?? '';
    viewer.showModal();
  }),
);
viewer?.addEventListener('click', (e) => {
  if (e.target === viewer) viewer.close();
});

// The form writes the email; the visitor's own mail program sends it.
const form = document.querySelector('[data-mail]');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const who = form.who.value.trim();
  const system = form.system.value;
  const note = form.note.value.trim();
  const subject = `สนใจ${system}`;
  const body = [`ชื่อและองค์กร: ${who}`, `ระบบที่สนใจ: ${system}`, note && `\n${note}`].filter(Boolean).join('\n');
  const link = document.createElement('a');
  link.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  link.click();
});

// A visitor who asked for less motion gets the clip's still frame and plays it on request.
if (reduce) {
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
    v.controls = true;
  });
}

// Sections fade in once as they arrive.
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  document.querySelectorAll('.overview .wrap, .sys, .how .wrap, .contact').forEach((el) => {
    el.classList.add('reveal');
    io.observe(el);
  });
}
