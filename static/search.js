// Search the already loaded presentation data; no external requests or persistence.
(() => {
  const dialog = document.querySelector('#searchDialog');
  const input = document.querySelector('#searchInput');
  const scope = document.querySelector('#searchScope');
  const results = document.querySelector('#searchResults');
  const status = document.querySelector('#searchStatus');
  const normalize = value => String(value).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  let entries = [], indexedTracks = null, opener = null, composing = false;

  function indexContent() {
    if (indexedTracks === tracks) return;
    indexedTracks = tracks;
    entries = Object.entries(tracks).flatMap(([trackId, track]) => track.slides.map((slide, index) => {
      const speaker = track.speakers.find(item => item.id === slide.group);
      const fields = [slide.title, slide.nav, speaker?.topic || '', speaker?.name || '',
        speaker?.affiliation || '', slide.subtitle,
        ...slide.cards.flatMap(card => [card.label, card.title, ...card.points]),
        slide.detail.title, slide.detail.text, slide.takeaway];
      return {trackId, trackName:track.name, slide, index, speaker,
        fields, text:normalize(fields.join(' ')), heading:normalize(slide.title + ' ' + slide.nav)};
    }));
  }

  function highlight(value, tokens) {
    const text = String(value).normalize('NFKC').replace(/\s+/g, ' ');
    const pattern = tokens.map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).sort((a,b) => b.length-a.length).join('|');
    const regex = new RegExp(pattern, 'giu');
    let output = '', end = 0;
    for (const match of text.matchAll(regex)) {
      output += esc(text.slice(end, match.index)) + '<mark>' + esc(match[0]) + '</mark>';
      end = match.index + match[0].length;
    }
    return output + esc(text.slice(end));
  }

  function excerpt(entry, tokens) {
    const field = entry.fields.slice(5).find(value => tokens.some(token => normalize(value).includes(token)))
      || entry.slide.takeaway;
    const text = String(field).normalize('NFKC').replace(/\s+/g, ' ');
    const lower = text.toLocaleLowerCase();
    const positions = tokens.map(token => lower.indexOf(token)).filter(index => index >= 0);
    const start = Math.max(0, (positions.length ? Math.min(...positions) : 0) - 40);
    const end = Math.min(text.length, start + 180);
    return (start ? '…' : '') + highlight(text.slice(start, end), tokens) + (end < text.length ? '…' : '');
  }

  function search() {
    indexContent();
    results.innerHTML = '';
    results.scrollTop = 0;
    if (!entries.length) {
      status.textContent = '자료를 아직 불러오지 못했습니다. 잠시 후 검색창을 다시 열어 주세요.';
      return;
    }
    const tokens = [...new Set(normalize(input.value).split(' ').filter(Boolean))];
    if (!tokens.length) {
      status.textContent = '검색어를 입력하세요. 결과를 선택하면 해당 슬라이드로 이동합니다.';
      return;
    }
    const matches = entries.filter(entry => (scope.value === 'all' || entry.trackId === scope.value)
      && tokens.every(token => entry.text.includes(token)))
      .map(entry => ({...entry, score:tokens.reduce((score, token) => score + (entry.heading.includes(token) ? 1 : 0), 0)}))
      .sort((a,b) => b.score-a.score);
    status.textContent = matches.length
      ? `${matches.length}개 슬라이드 · 제목 일치 우선${scope.value === 'all' ? ' · 공통 키노트는 Track별로 표시합니다.' : ''}`
      : '검색 결과가 없습니다. 다른 단어를 입력하거나 검색 범위를 넓혀 보세요.';
    results.innerHTML = matches.map(entry => `<li><a class="search-result" href="#/${entry.trackId}/slide-${entry.index+1}">
      <span class="search-result-meta">${esc(entry.trackName)} · 전체 ${entry.index+1}장 · ${entry.slide.group ? `${String(entry.slide.group).padStart(2,'0')}번 발표` : '도입'}</span>
      <strong>${highlight(entry.slide.title, tokens)}</strong>
      <span class="search-result-speaker">${highlight(entry.speaker ? `${entry.speaker.topic} · ${entry.speaker.name} · ${entry.speaker.affiliation}` : '포럼의 핵심 메시지와 요약', tokens)}</span>
      <span class="search-excerpt">${excerpt(entry, tokens)}</span>
    </a></li>`).join('');
  }

  function openSearch() {
    if (dialog.open) { input.focus(); return; }
    opener = document.activeElement;
    scope.value = activeTrack || 'all';
    dialog.showModal();
    document.body.classList.add('search-open');
    search();
    input.focus();
    input.select();
  }

  document.querySelectorAll('[data-open-search]').forEach(button => button.addEventListener('click', openSearch));
  document.querySelector('#closeSearch').onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    document.body.classList.remove('search-open');
    if (opener?.isConnected && opener.getClientRects().length) opener.focus({preventScroll:true});
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; search(); });
  input.addEventListener('input', () => { if (!composing) search(); });
  scope.addEventListener('change', search);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('a')?.focus(); }
    if (event.key === 'Enter') { event.preventDefault(); results.querySelector('a')?.click(); }
  });
  results.addEventListener('click', event => {
    const link = event.target.closest('a.search-result');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener = null;
    dialog.close();
    history.pushState(null, '', link.getAttribute('href'));
    fromHash();
    document.querySelector('#main').focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.isComposing && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openSearch();
    }
  });
})();
