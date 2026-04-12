// ============================================================
      // STOPWORDS
      // ============================================================
      const CORE_STOPWORDS = [
        'the','and','of','to','in','that','is','was','he','for','it','with','as',
        'his','on','be','at','by','this','had','not','are','but','from','or','have',
        'they','which','one','you','were','her','all','she','there','would','their',
        'we','him','been','has','when','who','will','no','more','if','out','so','up',
        'what','than','into','them','can','only','other','some','could','then','do',
        'first','any','my','now','such','like','our','over','me','after','did',
        'before','through','where','your','should','because','each','just','those',
        'how','too','here','between','both','being','while','might','us','upon',
        'against','does','yet','though','am'
      ];

      const COURSE_STOPWORDS = [
        'the','and','of','to','a','in','that','is','was','he','for','it','with','as',
        'his','on','be','at','by','i','this','had','not','are','but','from','or','have',
        'an','they','which','one','you','were','her','all','she','there','would','their',
        'we','him','been','has','when','who','will','no','more','if','out','so','up',
        'said','what','its','about','than','into','them','can','only','other','new',
        'some','could','time','these','two','may','then','do','first','any','my','now',
        'such','like','our','over','man','me','even','most','made','after','also','did',
        'many','before','must','through','back','years','where','much','your','way',
        'well','down','should','because','each','just','those','people','how','too',
        'little','state','good','very','make','world','still','own','see','men','work',
        'long','get','here','between','both','life','being','under','never','day','same',
        'another','know','while','last','might','us','great','old','year','off','come',
        'since','against','go','came','right','used','take','three','upon','himself',
        'went','every','without','again','shall','say','does','yet','though','got','am',
        'nothing','oh','mr','mrs','miss','sir','dear','ye','thy','thou','thee','s','t'
      ];

      const LITERARY_STOPWORDS = [...new Set([
        ...COURSE_STOPWORDS,
        'madam','lady','lord','thine','thyself','unto','tis','twas','oft','nay','hath'
      ])];

      const STOPWORD_PRESETS = {
        course: COURSE_STOPWORDS,
        core: CORE_STOPWORDS,
        literary: LITERARY_STOPWORDS
      };

      const DEFAULT_STOPWORD_PRESET = 'course';
      const STORAGE_KEY = 'dh-reading-lab-state-v1';

      // ============================================================
      // APP STATE
      // ============================================================
      let currentText = '';
      let activeStopwords = new Set(STOPWORD_PRESETS[DEFAULT_STOPWORD_PRESET]);

      // ============================================================
      // INIT
      // ============================================================
      document.addEventListener('DOMContentLoaded', init);

      function init() {
        populateTextSelect();
        initializeStopwordSettings();
        bindEvents();
        restoreSessionState();
        updateSelectedTextUI({ shouldApplyText: false, shouldSave: false });
        renderSearchPrompts();
      }

      function populateTextSelect() {
        const select = document.getElementById('text-select');
        PRESET_TEXTS.forEach((item) => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = getPresetLabel(item) + (getPresetText(item) ? ' • Ready' : '');
          select.appendChild(option);
        });
      }

      function bindEvents() {
        document.getElementById('text-select').addEventListener('change', () => {
          updateSelectedTextUI();
          updateAnalyzeReady();
        });
        document.getElementById('text-input').addEventListener('input', () => {
          document.getElementById('text-input').dataset.source = 'user';
          updateAnalyzeReady();
          renderTextStatus();
          saveSessionState();
        });
        document.getElementById('btn-analyze').addEventListener('click', goToAnalysis);
        document.getElementById('btn-back-home').addEventListener('click', () => showScreen('home'));
        document.getElementById('btn-reset-session').addEventListener('click', resetSession);
        document.getElementById('btn-kwic').addEventListener('click', runKWIC);
        document.getElementById('btn-dist').addEventListener('click', runDistribution);
        document.getElementById('stopword-toggle').addEventListener('change', () => {
          renderStopwordSummary();
          updateFrequency();
          saveSessionState();
        });
        document.getElementById('freq-limit').addEventListener('change', () => {
          updateFrequency();
          saveSessionState();
        });
        document.getElementById('stopword-preset').addEventListener('change', saveSessionState);
        document.getElementById('btn-load-stopword-preset').addEventListener('click', loadSelectedStopwordPreset);
        document.getElementById('btn-clear-stopwords').addEventListener('click', clearStopwords);
        document.getElementById('stopword-input').addEventListener('input', () => {
          syncStopwordsFromInput();
          saveSessionState();
        });
        document.getElementById('kwic-input').addEventListener('input', saveSessionState);
        document.getElementById('dist-input').addEventListener('input', saveSessionState);
        document.getElementById('kwic-window').addEventListener('change', saveSessionState);
        document.getElementById('freq-results').addEventListener('click', handleFrequencyWordClick);

        document.querySelectorAll('.tab').forEach((tab) => {
          tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        document.getElementById('kwic-input').addEventListener('keydown', (e) => {
          if (e.key === 'Enter') runKWIC();
        });
        document.getElementById('dist-input').addEventListener('keydown', (e) => {
          if (e.key === 'Enter') runDistribution();
        });
      }

      function initializeStopwordSettings() {
        document.getElementById('stopword-preset').value = DEFAULT_STOPWORD_PRESET;
        setStopwordInputValue(STOPWORD_PRESETS[DEFAULT_STOPWORD_PRESET]);
        syncStopwordsFromInput(false);
      }

      function getSelectedPreset() {
        const id = document.getElementById('text-select').value;
        return PRESET_TEXTS.find((item) => item.id === id) || null;
      }

      function getPresetText(item) {
        return item ? (item.text || '') : '';
      }

      function getPresetLabel(item) {
        return item.week === 1
          ? `Week ${item.week}: ${item.title}`
          : `Week ${item.week}: ${item.author} — ${item.title}`;
      }

      // ============================================================
      // NAVIGATION
      // ============================================================
      function showScreen(name) {
        document.querySelectorAll('.screen').forEach((screen) => {
          screen.classList.toggle('active', screen.id === `screen-${name}`);
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      function switchTab(name) {
        document.querySelectorAll('.tab').forEach((tab) => {
          tab.classList.toggle('active', tab.dataset.tab === name);
        });
        document.querySelectorAll('.panel').forEach((panel) => {
          panel.classList.toggle('active', panel.id === `tab-${name}`);
        });
      }

      // ============================================================
      // TEXT SELECTION
      // ============================================================
      function updateSelectedTextUI({ shouldApplyText = true, shouldSave = true } = {}) {
        const selected = getSelectedPreset();
        const textarea = document.getElementById('text-input');

        const questionBox = document.getElementById('core-question');
        const questionText = document.getElementById('core-question-text');
        const keywordsBox = document.getElementById('suggested-keywords-box');
        const keywordsContainer = document.getElementById('suggested-keywords');

        if (!selected) {
          questionBox.style.display = 'none';
          keywordsBox.style.display = 'none';
          keywordsContainer.innerHTML = '';
          renderAnalysisContext();
          renderTextStatus();
          if (shouldSave) saveSessionState();
          return;
        }

        if (selected.coreQuestion) {
          questionText.textContent = `${selected.coreQuestion.ja} / ${selected.coreQuestion.en}`;
          questionBox.style.display = 'block';
        } else {
          questionBox.style.display = 'none';
        }

        renderKeywordChips(keywordsContainer, selected.suggestedKeywords || [], (keyword) => {
          setSearchWord(keyword, false);
        });
        keywordsBox.style.display = keywordsContainer.children.length ? 'block' : 'none';

        if (shouldApplyText) {
          const presetText = getPresetText(selected);
          if (presetText) {
            textarea.value = presetText;
            textarea.dataset.source = 'preset';
          } else if (textarea.dataset.source === 'preset') {
            textarea.value = '';
            textarea.dataset.source = '';
          }
        }

        renderAnalysisContext();
        renderTextStatus();
        if (shouldSave) saveSessionState();
      }

      function renderKeywordChips(container, keywords, onClick) {
        container.innerHTML = '';
        keywords.forEach((keyword) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.className = 'chip';
          chip.textContent = keyword;
          chip.addEventListener('click', () => onClick(keyword));
          container.appendChild(chip);
        });
      }

      function updateAnalyzeReady() {
        const text = document.getElementById('text-input').value.trim();
        document.getElementById('btn-analyze').disabled = text.length < 20;
      }

      function renderTextStatus() {
        const selected = getSelectedPreset();
        const text = document.getElementById('text-input').value.trim();
        const statusText = document.getElementById('text-status-text');
        const builtInText = getPresetText(selected);

        if (!selected && !text) {
          statusText.textContent = '作品を選ぶか、本文を貼り付けると分析の準備が始まります / Choose a preset or paste a text to get started.';
          return;
        }

        if (selected && !text) {
          statusText.textContent = builtInText
            ? `${getPresetLabel(selected)} の本文は読み込み済みです。分析開始を押すとすぐに見られます / ${getPresetLabel(selected)} is ready in the app.`
            : `${getPresetLabel(selected)} の問いとおすすめ語を表示しています。分析するには課題テキストを下に貼り付けてください / This preset gives you the question and keywords. Paste the assigned text below to analyze it.`;
          return;
        }

        const wordCount = getWordCount(text).toLocaleString();
        if (selected && builtInText && text === builtInText.trim()) {
          statusText.textContent = `${getPresetLabel(selected)} を読み込みました。${wordCount} 語の本文を分析できます / ${getPresetLabel(selected)} is loaded and ready to analyze (${wordCount} words).`;
          return;
        }

        if (selected) {
          statusText.textContent = `${getPresetLabel(selected)} の問いを使いながら、貼り付けた本文を分析できます / Your pasted text is ready to analyze with the ${getPresetLabel(selected)} prompt.`;
          return;
        }

        statusText.textContent = `貼り付けた本文を分析できます。現在 ${wordCount} 語です / Your pasted text is ready to analyze (${wordCount} words).`;
      }

      function renderAnalysisContext() {
        const selected = getSelectedPreset();
        const sourceText = currentText || document.getElementById('text-input').value.trim();
        const contextBox = document.getElementById('analysis-context');
        const contextTitle = document.getElementById('analysis-context-title');
        const contextQuestion = document.getElementById('analysis-context-question');
        const keywordsBox = document.getElementById('analysis-keywords-box');
        const keywordsContainer = document.getElementById('analysis-keywords');

        if (!selected && !sourceText) {
          contextBox.style.display = 'none';
          keywordsBox.style.display = 'none';
          keywordsContainer.innerHTML = '';
          return;
        }

        contextBox.style.display = 'block';
        contextTitle.textContent = selected
          ? getPresetLabel(selected)
          : '貼り付けたテキスト / Pasted Text';

        if (selected && selected.coreQuestion) {
          contextQuestion.textContent = `${selected.coreQuestion.ja} / ${selected.coreQuestion.en}`;
          contextQuestion.style.display = 'block';
        } else if (sourceText) {
          contextQuestion.textContent = `${getWordCount(sourceText).toLocaleString()} words ready to inspect`;
          contextQuestion.style.display = 'block';
        } else {
          contextQuestion.style.display = 'none';
        }

        renderKeywordChips(keywordsContainer, selected ? (selected.suggestedKeywords || []) : [], (keyword) => {
          setSearchWord(keyword, true);
        });
        keywordsBox.style.display = keywordsContainer.children.length ? 'block' : 'none';
      }

      function setSearchWord(keyword, shouldRun) {
        document.getElementById('kwic-input').value = keyword;
        document.getElementById('dist-input').value = keyword;
        saveSessionState();

        if (shouldRun) {
          switchTab('kwic');
          runKWIC();
        }
      }

      function renderSearchPrompts() {
        const hasText = Boolean(currentText);
        document.getElementById('kwic-results').innerHTML = hasText
          ? '<p class="empty-state">頻出語またはおすすめ検索語から 1 語選んでください / Choose one word from the frequent-word list or keyword chips.</p>'
          : '<p class="empty-state">先に本文を読み込み、分析開始を押してください / Load a text first, then start the analysis.</p>';
        document.getElementById('dist-chart').innerHTML = hasText
          ? '<p class="empty-state">1語を入れると、テキストのどこに集中しているかを表示します / Enter one word to see where it clusters in the text.</p>'
          : '<p class="empty-state">先に本文を読み込み、分析開始を押してください / Load a text first, then start the analysis.</p>';
      }

      // ============================================================
      // ANALYSIS
      // ============================================================
      function goToAnalysis() {
        currentText = document.getElementById('text-input').value.trim();
        if (!currentText) return;

        document.getElementById('stat-words').textContent = getWordCount(currentText).toLocaleString();
        document.getElementById('stat-unique').textContent = getUniqueWordCount(currentText).toLocaleString();
        document.getElementById('stat-sentences').textContent = getSentenceCount(currentText).toLocaleString();
        document.getElementById('stat-avg-len').textContent = getAvgSentenceLength(currentText);

        renderAnalysisContext();
        renderSearchPrompts();
        switchTab('freq');
        updateFrequency();
        showScreen('analysis');
        saveSessionState();
      }

      // ============================================================
      // TEXT PROCESSING
      // ============================================================
      function normalizeQuotes(text) {
        return text.replace(/[’]/g, '\'');
      }

      function tokenize(text) {
        return normalizeQuotes(text).toLowerCase()
          .replace(/[^a-z'\s-]/g, ' ')
          .split(/\s+/)
          .filter((word) => word.length > 1);
      }

      function getWordCount(text) {
        return tokenize(text).length;
      }

      function getUniqueWordCount(text) {
        return new Set(tokenize(text)).size;
      }

      function getSentenceCount(text) {
        return text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
      }

      function getAvgSentenceLength(text) {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
        if (!sentences.length) return 0;
        const total = sentences.reduce((sum, s) => sum + tokenize(s).length, 0);
        return Math.round((total / sentences.length) * 10) / 10;
      }

      function normalizeWord(word) {
        return normalizeQuotes(word).toLowerCase()
          .replace(/[^a-z'-]/g, '')
          .replace(/^[-']+|[-']+$/g, '');
      }

      function parseSingleSearchTerm(value) {
        const terms = value
          .split(/[\s,;]+/)
          .map(normalizeWord)
          .filter((word) => word.length > 0);

        if (!terms.length) {
          return { term: '', error: 'empty' };
        }

        if (terms.length > 1) {
          return { term: '', error: 'multiple' };
        }

        return { term: terms[0], error: '' };
      }

      function parseStopwordInput(value) {
        return [...new Set(
          value
            .split(/[\s,;]+/)
            .map(normalizeWord)
            .filter((word) => word.length > 0)
        )];
      }

      function setStopwordInputValue(words) {
        document.getElementById('stopword-input').value = words.join(', ');
      }

      function syncStopwordsFromInput(shouldRefresh = true) {
        activeStopwords = new Set(parseStopwordInput(document.getElementById('stopword-input').value));
        renderStopwordSummary();
        if (shouldRefresh) updateFrequency();
      }

      function renderStopwordSummary() {
        const summary = document.getElementById('stopword-summary');
        const count = activeStopwords.size;
        const preview = Array.from(activeStopwords).slice(0, 6).join(', ');
        const isEnabled = document.getElementById('stopword-toggle').checked;

        if (!count) {
          summary.textContent = isEnabled
            ? '現在の stop words は 0 語です / No active stopwords'
            : 'ストップワード除去はオフです。現在のリストは 0 語です / Stopword removal is off. Current list: 0 words';
          return;
        }

        summary.textContent = isEnabled
          ? `現在 ${count} 語を除去します / Removing ${count} stopwords. 例: ${preview}${count > 6 ? ', ...' : ''}`
          : `ストップワード除去はオフです。保存中のリスト: ${count} 語 / Stopword removal is off. Saved list: ${count} words`;
      }

      function loadSelectedStopwordPreset() {
        const presetName = document.getElementById('stopword-preset').value;
        setStopwordInputValue(STOPWORD_PRESETS[presetName] || []);
        syncStopwordsFromInput();
        saveSessionState();
      }

      function clearStopwords() {
        setStopwordInputValue([]);
        syncStopwordsFromInput();
        saveSessionState();
      }

      // ============================================================
      // FREQUENCY
      // ============================================================
      function getFrequencies(text, removeStopwords) {
        const words = tokenize(text);
        const counts = {};
        words.forEach((word) => {
          if (removeStopwords && activeStopwords.has(word)) return;
          counts[word] = (counts[word] || 0) + 1;
        });
        return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([word, count]) => ({ word, count }));
      }

      function updateFrequency() {
        const removeStopwords = document.getElementById('stopword-toggle').checked;
        const limit = Number(document.getElementById('freq-limit').value);
        const container = document.getElementById('freq-results');

        if (!currentText) {
          container.innerHTML = '<p class="empty-state">本文を読み込むと頻出語が表示されます / Frequent words appear once a text is loaded.</p>';
          return;
        }

        const rows = getFrequencies(currentText, removeStopwords).slice(0, limit);

        if (!rows.length) {
          container.innerHTML = removeStopwords
            ? '<p class="empty-state">表示できる語がありません。stop words を減らすか、除去をオフにしてみてください / No words remain. Try reducing the stopwords or turning stopword removal off.</p>'
            : '<p class="empty-state">語が見つかりません / No words found.</p>';
          return;
        }

        const max = rows[0].count;
        let html = '<table class="freq-table"><thead><tr><th>#</th><th>語 / Word</th><th>回数 / Count</th><th></th></tr></thead><tbody>';
        rows.forEach((row, i) => {
          const width = Math.round((row.count / max) * 100);
          html += `<tr>
            <td>${i + 1}</td>
            <td><button type="button" class="word-link" data-word="${escapeHtml(row.word)}">${escapeHtml(row.word)}</button></td>
            <td>${row.count}</td>
            <td style="width:120px"><div class="freq-bar" style="width:${width}%"></div></td>
          </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }

      // ============================================================
      // KWIC
      // ============================================================
      function kwicSearch(text, keyword, windowSize) {
        const target = normalizeWord(keyword);
        if (!target) return [];
        const rawWords = text.split(/\s+/);
        const normalized = rawWords.map((w) => normalizeWord(w));
        const results = [];
        normalized.forEach((word, i) => {
          if (word === target) {
            results.push({
              left: rawWords.slice(Math.max(0, i - windowSize), i).join(' '),
              match: rawWords[i],
              right: rawWords.slice(i + 1, i + 1 + windowSize).join(' ')
            });
          }
        });
        return results;
      }

      function runKWIC() {
        const keyword = document.getElementById('kwic-input').value.trim();
        const windowSize = Number(document.getElementById('kwic-window').value);
        const container = document.getElementById('kwic-results');
        const parsed = parseSingleSearchTerm(keyword);

        if (!currentText) {
          container.innerHTML = '<p class="empty-state">先に本文を読み込み、分析開始を押してください / Load a text first, then start the analysis.</p>';
          return;
        }

        if (parsed.error === 'empty') {
          container.innerHTML = '<p class="empty-state">検索語を入力してください / Enter a word to search</p>';
          return;
        }

        if (parsed.error === 'multiple') {
          container.innerHTML = '<p class="empty-state">1語ずつ検索してください / Search one word at a time</p>';
          return;
        }

        const results = kwicSearch(currentText, parsed.term, windowSize);
        if (!results.length) {
          container.innerHTML = `<p class="empty-state">"${escapeHtml(parsed.term)}" は見つかりませんでした / not found</p>`;
          return;
        }

        let html = `<p><strong>"${escapeHtml(parsed.term)}"</strong> : ${results.length} 件 / occurrences</p>
          <table class="kwic-table"><tbody>`;
        results.forEach((item) => {
          html += `<tr>
            <td class="kwic-left">${escapeHtml(item.left)}</td>
            <td class="kwic-match">${escapeHtml(item.match)}</td>
            <td class="kwic-right">${escapeHtml(item.right)}</td>
          </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;
      }

      // ============================================================
      // DISTRIBUTION
      // ============================================================
      function getDistribution(text, keyword, segments) {
        const target = normalizeWord(keyword);
        const words = tokenize(text);
        const dist = new Array(segments).fill(0);
        const segmentSize = Math.ceil(words.length / segments);
        words.forEach((word, i) => {
          if (word === target) {
            const seg = Math.min(Math.floor(i / segmentSize), segments - 1);
            dist[seg] += 1;
          }
        });
        return dist;
      }

      function runDistribution() {
        const keyword = document.getElementById('dist-input').value.trim();
        const container = document.getElementById('dist-chart');
        const parsed = parseSingleSearchTerm(keyword);

        if (!currentText) {
          container.innerHTML = '<p class="empty-state">先に本文を読み込み、分析開始を押してください / Load a text first, then start the analysis.</p>';
          return;
        }

        if (parsed.error === 'empty') {
          container.innerHTML = '<p class="empty-state">検索語を入力してください / Enter a word to search</p>';
          return;
        }

        if (parsed.error === 'multiple') {
          container.innerHTML = '<p class="empty-state">1語ずつ検索してください / Search one word at a time</p>';
          return;
        }

        const dist = getDistribution(currentText, parsed.term, 20);
        const total = dist.reduce((sum, n) => sum + n, 0);

        if (!total) {
          container.innerHTML = `<p class="empty-state">"${escapeHtml(parsed.term)}" は見つかりませんでした / not found</p>`;
          return;
        }

        const max = Math.max(...dist, 1);
        let html = `<p><strong>"${escapeHtml(parsed.term)}"</strong> &nbsp; 合計 / total: <strong>${total}</strong> 回</p>
          <div class="dist-container">`;
        dist.forEach((count, i) => {
          const height = Math.max((count / max) * 100, 2);
          html += `<div class="dist-bar" style="height:${height}%" title="区間 ${i + 1}: ${count} 回"></div>`;
        });
        html += `</div>
          <div class="dist-labels">
            <span>始め / Beginning</span>
            <span>中間 / Middle</span>
            <span>終わり / End</span>
          </div>`;
        container.innerHTML = html;
      }

      // ============================================================
      // UTILITIES
      // ============================================================
      function handleFrequencyWordClick(event) {
        const button = event.target.closest('[data-word]');
        if (!button) return;
        setSearchWord(button.dataset.word, true);
      }

      function getSessionState() {
        return {
          selectedTextId: document.getElementById('text-select').value,
          textInput: document.getElementById('text-input').value,
          stopwordToggle: document.getElementById('stopword-toggle').checked,
          stopwordPreset: document.getElementById('stopword-preset').value,
          stopwordInput: document.getElementById('stopword-input').value,
          freqLimit: document.getElementById('freq-limit').value,
          kwicInput: document.getElementById('kwic-input').value,
          kwicWindow: document.getElementById('kwic-window').value,
          distInput: document.getElementById('dist-input').value
        };
      }

      function saveSessionState() {
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getSessionState()));
        } catch (error) {
          // Ignore storage failures so the app still works in restricted browsers.
        }
      }

      function restoreSessionState() {
        let state = null;

        try {
          state = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
        } catch (error) {
          state = null;
        }

        if (!state) {
          return;
        }

        if (typeof state.selectedTextId === 'string') {
          document.getElementById('text-select').value = state.selectedTextId;
        }

        if (typeof state.textInput === 'string') {
          document.getElementById('text-input').value = state.textInput;
          document.getElementById('text-input').dataset.source = state.textInput === getPresetText(getSelectedPreset()) && state.textInput
            ? 'preset'
            : 'user';
        } else if (getPresetText(getSelectedPreset())) {
          document.getElementById('text-input').value = getPresetText(getSelectedPreset());
          document.getElementById('text-input').dataset.source = 'preset';
        }

        if (state.stopwordToggle === false) {
          document.getElementById('stopword-toggle').checked = false;
        }

        if (typeof state.stopwordPreset === 'string' && STOPWORD_PRESETS[state.stopwordPreset]) {
          document.getElementById('stopword-preset').value = state.stopwordPreset;
        }

        if (typeof state.stopwordInput === 'string') {
          document.getElementById('stopword-input').value = state.stopwordInput;
        }

        if (['20', '50', '100'].includes(String(state.freqLimit))) {
          document.getElementById('freq-limit').value = String(state.freqLimit);
        }

        if (['3', '5', '8', '10'].includes(String(state.kwicWindow))) {
          document.getElementById('kwic-window').value = String(state.kwicWindow);
        }

        if (typeof state.kwicInput === 'string') {
          document.getElementById('kwic-input').value = state.kwicInput;
        }

        if (typeof state.distInput === 'string') {
          document.getElementById('dist-input').value = state.distInput;
        }

        syncStopwordsFromInput(false);
      }

      function resetSession() {
        const confirmed = window.confirm('保存中の本文・検索語・stop words をこのブラウザから消しますか？ / Reset the saved text, searches, and stopwords in this browser?');
        if (!confirmed) return;

        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          // Ignore storage failures and still reset the visible form.
        }

        currentText = '';
        document.getElementById('text-select').value = '';
        document.getElementById('text-input').value = '';
        document.getElementById('text-input').dataset.source = '';
        document.getElementById('kwic-input').value = '';
        document.getElementById('dist-input').value = '';
        document.getElementById('kwic-window').value = '5';
        document.getElementById('freq-limit').value = '50';
        document.getElementById('stopword-toggle').checked = true;

        initializeStopwordSettings();
        updateSelectedTextUI({ shouldApplyText: false, shouldSave: false });
        renderTextStatus();
        renderAnalysisContext();
        renderSearchPrompts();
        updateFrequency();
        updateAnalyzeReady();
        showScreen('home');
      }

      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }
