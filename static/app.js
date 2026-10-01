const $ = selector => document.querySelector(selector);
let slides = [], current = 0;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function content(s) {
  const total = slides.filter(item => item.group === s.group).length;
  return `<article class="slide slide--${esc(s.kind)}">
    <div class="slide-top"><span class="eyebrow">${esc(s.section)}</span><span class="chapter-count">${s.group ? 'SESSION' : 'INTRO'} <b>${String(s.page).padStart(2,'0')}</b> / ${String(total).padStart(2,'0')}</span></div>
    <h1>${esc(s.title)}</h1><p class="subtitle">${esc(s.subtitle)}</p>
    <div class="cards ${s.cards.length === 4 ? 'four' : ''}">${s.cards.map(c => `<section class="card"><span class="card-label">${esc(c.label)}</span><h2>${esc(c.title)}</h2><ul>${c.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>`).join('')}</div>
    <section class="detail"><h2>${esc(s.detail.title)}</h2><p>${esc(s.detail.text)}</p></section>
    <div class="takeaway"><span>KEY TAKEAWAY</span><p>${esc(s.takeaway)}</p></div>
  </article>`;
}

function render() {
  if (!slides.length) return;
  const s = slides[current];
  $('#slide').innerHTML = content(s);
  $('#counter').textContent = `${String(current+1).padStart(2,'0')} / ${slides.length}`;
  $('#speakerName').textContent = s.group ? s.speaker : '요약';
  $('#prev').disabled = current === 0;
  $('#next').disabled = current === slides.length-1;
  $('#progressFill').style.width = `${(current+1)/slides.length*100}%`;
  $('.progress').setAttribute('aria-valuenow', String(current+1));
  $('.progress').setAttribute('aria-valuemax', String(slides.length));
  $('#jumpSelect').value = String(current);
  document.querySelectorAll('nav button[data-index]').forEach(button => {
    const active = Number(button.dataset.index) === current;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current','step');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('nav details').forEach(group => {
    const active = Number(group.dataset.group) === s.group;
    group.classList.toggle('current-group',active);
    group.open = active;
  });
  $('#chapterPages').innerHTML = slides.map((item,i) => ({item,i})).filter(({item}) => item.group === s.group).map(({item,i}) => `<button data-index="${i}" class="${i === current ? 'selected' : ''}" aria-label="${esc(item.nav)}" ${i === current ? 'aria-current="step"' : ''}>${item.page}</button>`).join('');
  $('#chapterPages').querySelectorAll('button').forEach(button => button.onclick = () => go(Number(button.dataset.index)));
}

function go(index) {
  if (!slides.length) return;
  const next = Math.max(0,Math.min(slides.length-1,index));
  if (current === next) return;
  current = next;
  history.replaceState(null,'',`#slide-${current+1}`);
  render();
  window.scrollTo({top:0,behavior:'instant'});
}

function fromHash() {
  const match = location.hash.match(/^#slide-(\d+)$/);
  current = match ? Math.max(0,Math.min(slides.length-1,Number(match[1])-1)) : 0;
  render();
}

function setPresentation(enabled) {
  document.body.classList.toggle('presenting',enabled);
  $('#presentButton').innerHTML = enabled ? '발표 종료 <kbd>F</kbd>' : '발표 모드 <kbd>F</kbd>';
  $('#presentButton').setAttribute('aria-pressed',String(enabled));
}

async function togglePresentation() {
  const enabled = !document.body.classList.contains('presenting');
  setPresentation(enabled);
  try {
    if(enabled && !document.fullscreenElement) await document.documentElement.requestFullscreen();
    else if(!enabled && document.fullscreenElement) await document.exitFullscreen();
  } catch { /* The presentation layout also works without fullscreen. */ }
}

document.addEventListener('fullscreenchange',() => {
  if(!document.fullscreenElement) setPresentation(false);
});
$('#presentButton').onclick = togglePresentation;
$('#prev').onclick = () => go(current-1);
$('#next').onclick = () => go(current+1);
$('#jumpSelect').onchange = event => go(Number(event.target.value));
window.addEventListener('hashchange',fromHash);
document.addEventListener('keydown',event => {
  if(!slides.length || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  if(event.code === 'Space' && /BUTTON|A|SUMMARY/.test(event.target.tagName)) return;
  if(['ArrowRight','PageDown'].includes(event.key) || event.code === 'Space') {event.preventDefault();go(current+1);}
  else if(['ArrowLeft','PageUp'].includes(event.key)) {event.preventDefault();go(current-1);}
  else if(event.key === 'Home') {event.preventDefault();go(0);}
  else if(event.key === 'End') {event.preventDefault();go(slides.length-1);}
  else if(event.key.toLowerCase() === 'f') togglePresentation();
  else if(event.key === 'Escape' && document.body.classList.contains('presenting')) togglePresentation();
});

function navButton(s,index) {
  return `<button data-index="${index}"><span class="num">${String(s.page).padStart(2,'0')}</span><span>${esc(s.nav)}</span></button>`;
}

async function init() {
  try {
    const response = await fetch('./slides.json',{cache:'no-store'});
    if(!response.ok) throw new Error('Load failed');
    const data = await response.json();
    slides = data.slides;
    if(!Array.isArray(slides) || !slides.length || !Array.isArray(data.speakers)) throw new Error('Invalid data');
    let navigation = `<div class="intro-links">${slides.map((s,i) => s.group === 0 ? navButton(s,i) : '').join('')}</div>`;
    data.speakers.forEach(speaker => {
      navigation += `<details data-group="${speaker.id}"><summary><span class="group-number">${String(speaker.id).padStart(2,'0')}</span><span class="group-heading"><strong>${esc(speaker.topic)}</strong><small>${esc(speaker.name)}</small></span><span class="chevron">⌄</span></summary><div class="group-slides">${slides.map((s,i) => s.group === speaker.id ? navButton(s,i) : '').join('')}</div></details>`;
    });
    $('#navigation').innerHTML = navigation;
    document.querySelectorAll('nav button[data-index]').forEach(button => button.onclick = () => go(Number(button.dataset.index)));
    $('#jumpSelect').innerHTML = slides.map((s,i) => `<option value="${i}">${s.group ? esc(s.speaker)+' · ' : ''}${esc(s.nav)}</option>`).join('');
    fromHash();
  } catch {
    $('#slide').innerHTML = '<h1>자료를 불러오지 못했습니다.</h1><p>잠시 후 페이지를 새로고침해 주세요.</p>';
  }
}
init();
