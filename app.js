(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.querySelector('#deck');
  const prevButton = document.querySelector('#prev');
  const nextButton = document.querySelector('#next');
  const counter = document.querySelector('#counter');
  const progressBar = document.querySelector('#progressBar');
  const fullscreenButton = document.querySelector('#fullscreen');
  const notesButton = document.querySelector('#notesToggle');
  const speakerPanel = document.querySelector('#speakerPanel');
  const speakerText = document.querySelector('#speakerText');
  const closeNotes = document.querySelector('#closeNotes');
  const help = document.querySelector('#help');
  const helpToggle = document.querySelector('#helpToggle');
  const closeHelp = document.querySelector('#closeHelp');
  const imageViewer = document.querySelector('#imageViewer');
  const viewerImage = document.querySelector('#viewerImage');
  const viewerCaption = document.querySelector('#viewerCaption');
  const closeViewer = document.querySelector('#closeViewer');
  let index = Math.max(0, Number(location.hash.replace('#', '')) - 1 || 0);

  const pad = (number) => String(number).padStart(2, '0');

  slides.forEach((slide, i) => {
    const page = slide.querySelector('.slide-head b');
    if (page) page.textContent = `${pad(i + 1)} / ${pad(slides.length)}`;
  });

  function render(nextIndex, pushHash = true) {
    const targetIndex = Math.max(0, Math.min(slides.length - 1, nextIndex));
    deck.dataset.direction = targetIndex < index ? 'backward' : 'forward';
    index = targetIndex;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
      slide.classList.toggle('is-before', i < index);
      slide.setAttribute('aria-hidden', i === index ? 'false' : 'true');
    });
    counter.textContent = `${pad(index + 1)} / ${pad(slides.length)}`;
    progressBar.style.width = `${((index + 1) / slides.length) * 100}%`;
    prevButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1;
    speakerText.textContent = slides[index].querySelector('.notes')?.textContent.trim() || '';
    const clientName = document.querySelector('meta[name="description"]')?.content.match(/为\s*(.*?)\s*准备/)?.[1] || 'Client';
    document.title = `${pad(index + 1)} · ${slides[index].dataset.title}｜流域科技 × ${clientName}`;
    if (pushHash) history.replaceState(null, '', `#${index + 1}`);
  }

  function step(direction) { render(index + direction); }
  function toggleNotes(force) {
    const open = typeof force === 'boolean' ? force : !speakerPanel.classList.contains('is-open');
    speakerPanel.classList.toggle('is-open', open);
    speakerPanel.setAttribute('aria-hidden', String(!open));
  }
  function toggleHelp(force) {
    const open = typeof force === 'boolean' ? force : !help.classList.contains('is-open');
    help.classList.toggle('is-open', open);
    help.setAttribute('aria-hidden', String(!open));
  }
  function closeImageViewer() {
    imageViewer.classList.remove('is-open');
    imageViewer.setAttribute('aria-hidden', 'true');
    viewerImage.removeAttribute('src');
  }
  function openImageViewer(image) {
    viewerImage.src = image.src;
    viewerImage.alt = image.alt;
    viewerCaption.textContent = image.closest('figure')?.querySelector('figcaption')?.textContent
      || image.closest('article')?.querySelector('b')?.textContent
      || image.alt;
    imageViewer.classList.add('is-open');
    imageViewer.setAttribute('aria-hidden', 'false');
  }
  async function toggleFullscreen() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.();
    else await document.exitFullscreen?.();
  }

  prevButton.addEventListener('click', () => step(-1));
  nextButton.addEventListener('click', () => step(1));
  fullscreenButton.addEventListener('click', toggleFullscreen);
  notesButton.addEventListener('click', () => toggleNotes());
  helpToggle.addEventListener('click', () => toggleHelp());
  closeNotes.addEventListener('click', () => toggleNotes(false));
  closeHelp.addEventListener('click', () => toggleHelp(false));
  help.addEventListener('click', (event) => { if (event.target === help) toggleHelp(false); });
  closeViewer.addEventListener('click', closeImageViewer);
  imageViewer.addEventListener('click', (event) => { if (event.target === imageViewer) closeImageViewer(); });
  document.querySelectorAll('.evidence-shot').forEach((image) => {
    image.addEventListener('click', () => openImageViewer(image));
  });

  document.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); step(1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); step(-1); }
    if (event.key === 'Home') render(0);
    if (event.key === 'End') render(slides.length - 1);
    if (event.key.toLowerCase() === 'n') toggleNotes();
    if (event.key.toLowerCase() === 'f') toggleFullscreen();
    if (event.key.toLowerCase() === 'h' || event.key === '?') toggleHelp();
    if (event.key === 'Escape') { toggleNotes(false); toggleHelp(false); closeImageViewer(); }
  });

  let touchStart = 0;
  document.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (event) => {
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 60) step(delta < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener('hashchange', () => render(Number(location.hash.replace('#', '')) - 1, false));
  render(index, false);
})();
