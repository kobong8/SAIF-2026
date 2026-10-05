const $ = selector => document.querySelector(selector);
let slides = [], current = 0;
let tracks = {}, activeTrack = null;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function content(s) {
  const total = slides.filter(item => item.group === s.group).length;
  return `<article class="slide slide--${esc(s.kind)}">
    <div class="slide-top"><span class="eyebrow">${esc(s.section)}</span><span class="chapter-count">${s.group ? 'SESSION' : 'INTRO'} <b>${String(s.page).padStart(2,'0')}</b> / ${String(total).padStart(2,'0')}</span></div>
    <h1>${esc(s.title)}</h1><p class="subtitle">${esc(s.subtitle)}</p>
    <div class="cards ${s.cards.length === 4 ? 'four' : ''}">${s.cards.map(c => `<section class="card"><span class="card-label">${esc(c.label)}</span><h2>${esc(c.title)}</h2><ul>${c.points.map(p => `<li>${esc(p)}</li>`).join('')}</ul></section>`).join('')}</div>
    <section class="detail"><h2>${esc(s.detail.title)}</h2><div><p>${esc(s.detail.text)}</p>${(s.detail.links || []).length ? `<div class="detail-links">${s.detail.links.filter(link => /^https:\/\/www\.anthropic\.com\/engineering(?:\/|$)/.test(link.url)).map(link => `<a href="${esc(link.url)}" target="_blank" rel="noopener noreferrer">${esc(link.label)} ↗</a>`).join('')}</div>` : ''}</div></section>
    <div class="takeaway"><span>${s.nav === 'Final Takeaway' ? 'FINAL TAKEAWAY' : 'KEY TAKEAWAY'}</span><p>${esc(s.takeaway)}</p></div>
  </article>`;
}

function render() {
  if (!activeTrack || !slides.length) return;
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
  document.querySelectorAll('nav details[data-group]').forEach(group => {
    const active = Number(group.dataset.group) === s.group;
    group.classList.toggle('current-group',active);
    group.open = active;
  });
  const session = (tracks[activeTrack].sessions || []).find(item => item.groups.includes(s.group));
  document.querySelectorAll('nav details[data-session]').forEach(item => {
    const active = item.dataset.session === session?.id;
    item.open = active;
    item.classList.toggle('current-session', active);
  });
  $('.breadcrumb').textContent = `${tracks[activeTrack].label} / ${session?.name || tracks[activeTrack].name}`;
  $('#chapterPages').innerHTML = slides.map((item,i) => ({item,i})).filter(({item}) => item.group === s.group).map(({item,i}) => `<button data-index="${i}" class="${i === current ? 'selected' : ''}" aria-label="${esc(item.nav)}" ${i === current ? 'aria-current="step"' : ''}>${item.page}</button>`).join('');
  $('#chapterPages').querySelectorAll('button').forEach(button => button.onclick = () => go(Number(button.dataset.index)));
  syncNavigation();
}

function syncNavigation(force = false) {
  const navigation = $('#navigation');
  if (!activeTrack || !slides.length || !navigation.clientHeight) return;
  const group = String(slides[current].group);
  const changed = force || navigation.dataset.currentGroup !== group;
  let target = changed && group !== '0'
    ? navigation.querySelector(`details[data-group="${group}"] summary`)
    : navigation.querySelector('button[aria-current="step"]');
  const session = (tracks[activeTrack].sessions || []).find(item => item.groups.includes(Number(group)));
  if (session && navigation.dataset.currentSession !== session.id) {
    target = navigation.querySelector(`details[data-session="${session.id}"] > summary`);
  }
  navigation.dataset.currentSession = session?.id || '';
  navigation.dataset.currentGroup = group;
  if (!target) return;
  const viewport = navigation.getBoundingClientRect();
  const bounds = target.getBoundingClientRect();
  // Scroll only the sidebar, so the slide and keyboard focus stay in place.
  if (changed || bounds.top < viewport.top + 8) {
    navigation.scrollTo({top:navigation.scrollTop + bounds.top - viewport.top - 8, behavior:'instant'});
  } else if (bounds.bottom > viewport.bottom - 8) {
    navigation.scrollTo({top:navigation.scrollTop + bounds.bottom - viewport.bottom + 8, behavior:'instant'});
  }
}

function go(index) {
  if (!activeTrack || !slides.length) return;
  const next = Math.max(0,Math.min(slides.length-1,index));
  if (current === next) return;
  current = next;
  history.replaceState(null,'',`#/${activeTrack}/slide-${current+1}`);
  render();
  window.scrollTo({top:0,behavior:'instant'});
}

function fromHash() {
  const legacy = location.hash.match(/^#slide-(\d+)$/);
  const match = location.hash.match(/^#\/(ai-technology|ax-innovation)(?:\/slide-(\d+))?\/?$/);
  const trackId = legacy ? 'ax-innovation' : match?.[1];
  if (!trackId || !tracks[trackId]) {
    const wasTrack = activeTrack !== null;
    activeTrack = null;
    slides = [];
    document.body.classList.add('is-home');
    document.title = 'SAIF 2026 · Tracks';
    if (wasTrack) {
      $('#landing').focus({preventScroll:true});
      window.scrollTo({top:0,behavior:'instant'});
    }
    return;
  }
  const changed = activeTrack !== trackId;
  activeTrack = trackId;
  const track = tracks[trackId];
  slides = track.slides;
  document.body.classList.remove('is-home');
  document.title = `SAIF 2026 · ${track.name}`;
  $('#trackLabel').textContent = track.name.toUpperCase();
  $('#speakerCount').textContent = `${track.speakers.length} SPEAKERS`;
  $('.breadcrumb').textContent = `${track.label} / ${track.name}`;
  if (changed) buildNavigation(track);
  const requestedPage = Number(legacy?.[1] || match?.[2] || 1);
  // The two-page intro now matches the original AX page numbering.
  const page = requestedPage;
  current = Math.max(0, Math.min(slides.length-1, page-1));
  render();
  if (changed) {
    $('#main').focus({preventScroll:true});
    window.scrollTo({top:0,behavior:'instant'});
  }
}

function setPresentation(enabled) {
  document.body.classList.toggle('presenting',enabled);
  ['#presentButton', '#landingPresentButton'].forEach(selector => {
    $(selector).innerHTML = enabled ? '발표 종료 <kbd>F</kbd>' : '발표 모드 <kbd>F</kbd>';
    $(selector).setAttribute('aria-pressed',String(enabled));
  });
  if (!enabled) syncNavigation(true);
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
$('#landingPresentButton').onclick = togglePresentation;
$('#prev').onclick = () => go(current-1);
$('#next').onclick = () => go(current+1);
$('#jumpSelect').onchange = event => go(Number(event.target.value));
window.addEventListener('hashchange',fromHash);
document.addEventListener('keydown',event => {
  if (document.querySelector('#searchDialog[open]')) return;
  if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
  if(event.key.toLowerCase() === 'f') {event.preventDefault();togglePresentation();return;}
  if(event.key === 'Escape' && document.body.classList.contains('presenting')) {togglePresentation();return;}
  if(!activeTrack || !slides.length) return;
  if(event.code === 'Space' && /BUTTON|A|SUMMARY/.test(event.target.tagName)) return;
  if(['ArrowRight','PageDown'].includes(event.key) || event.code === 'Space') {event.preventDefault();go(current+1);}
  else if(['ArrowLeft','PageUp'].includes(event.key)) {event.preventDefault();go(current-1);}
  else if(event.key === 'Home') {event.preventDefault();go(0);}
  else if(event.key === 'End') {event.preventDefault();go(slides.length-1);}
});

function navButton(s,index) {
  return `<button data-index="${index}"><span class="num">${String(s.page).padStart(2,'0')}</span><span>${esc(s.nav)}</span></button>`;
}

function buildNavigation(track) {
    let navigation = `<div class="intro-links">${slides.map((s,i) => s.group === 0 ? navButton(s,i) : '').join('')}</div>`;
    const speakerNavigation = speaker => `<details data-group="${speaker.id}"><summary><span class="group-number">${String(speaker.id).padStart(2,'0')}</span><span class="group-heading"><strong>${esc(speaker.topic)}</strong><small>${esc(speaker.name)} · ${esc(speaker.affiliation)}</small></span><span class="chevron">⌄</span></summary><div class="group-slides">${slides.map((s,i) => s.group === speaker.id ? navButton(s,i) : '').join('')}</div></details>`;
    const sessions = track.sessions || [];
    track.speakers.filter(speaker => !sessions.some(session => session.groups.includes(speaker.id))).forEach(speaker => {
      navigation += speakerNavigation(speaker);
    });
    sessions.forEach(session => {
      navigation += `<details class="topic-session" data-session="${esc(session.id)}"><summary><span class="group-heading"><strong>${esc(session.name)}</strong></span><span class="chevron">⌄</span></summary>${session.groups.map(id => speakerNavigation(track.speakers.find(speaker => speaker.id === id))).join('')}</details>`;
    });
    $('#navigation').innerHTML = navigation;
    delete $('#navigation').dataset.currentGroup;
    delete $('#navigation').dataset.currentSession;
    document.querySelectorAll('nav button[data-index]').forEach(button => button.onclick = () => go(Number(button.dataset.index)));
    const option = (s,i) => `<option value="${i}">${s.group ? esc(s.speaker)+' · ' : ''}${esc(s.nav)}</option>`;
    $('#jumpSelect').innerHTML = sessions.length
      ? [{name:'도입부 · 공통 키노트', groups:[0,1,2,3,4]}, ...sessions].map(session => `<optgroup label="${esc(session.name)}">${slides.map((s,i) => session.groups.includes(s.group) ? option(s,i) : '').join('')}</optgroup>`).join('')
      : slides.map(option).join('');
}

function renderLanding() {
  $('#trackCards').innerHTML = Object.entries(tracks).map(([id, track]) => {
    const trackStart = track.slides.findIndex(slide => slide.group === 5);
    return `<article class="card track-card">
    <span class="card-label">${esc(track.label)}</span>
    <h2>${esc(track.name)}</h2>
    <p class="track-question">${esc(track.question)}</p>
    <p class="track-summary">${esc(track.summary)}</p>
    <p class="track-themes">${esc(track.themes)}</p>
    <div class="track-conclusion"><span>CONCLUSION</span><p>${esc(track.conclusion)}</p></div>
    <a class="track-link" href="#/${esc(id)}/slide-1" aria-label="${esc(track.name)} 발표 정리 자료 보기">발표 정리 자료 보기 <span aria-hidden="true">→</span></a>
    ${trackStart >= 0 ? `<a class="skip-keynote" href="#/${esc(id)}/slide-${trackStart+1}" aria-label="${esc(track.name)} 키노트 건너 뛰기">키노트 건너 뛰기 <span aria-hidden="true">↗</span></a>` : ''}
    ${track.video_url ? `<a class="video-link" href="${esc(track.video_url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(track.name)} YouTube 발표 영상 보기 (새 탭)">YouTube 발표 영상 보기</a>` : ''}
  </article>`;
  }).join('');
}

async function init() {
  try {
    const response = await fetch('./slides.json',{cache:'no-store'});
    if(!response.ok) throw new Error('Load failed');
    const data = await response.json();
    if (!data.tracks || !['ai-technology','ax-innovation'].every(id =>
      Array.isArray(data.tracks[id]?.slides) && data.tracks[id].slides.length &&
      Array.isArray(data.tracks[id]?.speakers))) throw new Error('Invalid data');
    tracks = data.tracks;
    renderLanding();
    fromHash();
  } catch {
    document.body.classList.add('is-home');
    $('#trackCards').innerHTML = '<p role="alert">자료를 불러오지 못했습니다. 잠시 후 페이지를 새로고침해 주세요.</p>';
  }
}
init();
