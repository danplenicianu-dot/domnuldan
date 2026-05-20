const screens = [...document.querySelectorAll('.screen')];
const answerBox = document.getElementById('answerBox');
const promptBox = document.getElementById('prompt');
const endpointInput = document.getElementById('endpoint');
let currentScreen = 'home';
let focusIndex = 0;
let lastPrompt = '';

const STORAGE_KEY = 'domnuldan.gptlite.endpoint';
endpointInput.value = localStorage.getItem(STORAGE_KEY) || '';

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle('active', screen.dataset.screen === id));
  currentScreen = id;
  focusIndex = 0;
  setTimeout(focusCurrent, 40);
}

function focusables() {
  const active = document.querySelector('.screen.active');
  return [...active.querySelectorAll('.focusable')].filter(el => !el.disabled);
}

function focusCurrent() {
  const items = focusables();
  document.querySelectorAll('.focused').forEach(el => el.classList.remove('focused'));
  if (!items.length) return;
  focusIndex = Math.max(0, Math.min(focusIndex, items.length - 1));
  const el = items[focusIndex];
  el.classList.add('focused');
  el.focus({ preventScroll: true });
}

function moveFocus(delta) {
  const items = focusables();
  if (!items.length) return;
  focusIndex = (focusIndex + delta + items.length) % items.length;
  focusCurrent();
}

function setAnswer(text) {
  answerBox.textContent = text;
  showScreen('answer');
}

async function askBackend(text) {
  const endpoint = localStorage.getItem(STORAGE_KEY);
  if (!endpoint) {
    setAnswer('Nu este configurat încă un backend securizat.\n\nCe poți face acum:\n1. Apasă „Deschide ChatGPT”.\n2. Sau setează un backend în Setări.\n\nImportant: cheia OpenAI nu se pune niciodată direct în acest webapp.');
    return;
  }

  setAnswer('Gândesc...');
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        system: 'Răspunde în română, foarte scurt, cu pași clari. Utilizatorul este domnul Dan.'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const reply = data.reply || data.message || data.text || JSON.stringify(data, null, 2);
    setAnswer(reply);
  } catch (err) {
    setAnswer('Nu am putut contacta backend-ul.\n\nVerifică endpoint-ul din Setări sau folosește butonul „Deschide ChatGPT”.\n\nDetaliu: ' + err.message);
  }
}

function startVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    promptBox.value = 'Browserul acesta nu oferă dictare web. Scrie întrebarea aici.';
    showScreen('ask');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'ro-RO';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  setAnswer('Ascult... vorbește acum.');
  recognition.onresult = event => {
    const text = event.results[0][0].transcript;
    lastPrompt = text;
    promptBox.value = text;
    askBackend(text);
  };
  recognition.onerror = event => {
    setAnswer('Dictarea nu a pornit sau nu are permisiune.\n\nPoți reveni și scrie întrebarea manual.\n\nDetaliu: ' + event.error);
  };
  recognition.start();
}

function openChatGPT() {
  const text = encodeURIComponent(lastPrompt || promptBox.value || 'Salut. Răspunde-mi scurt în română.');
  window.open(`https://chatgpt.com/?q=${text}`, '_blank', 'noopener,noreferrer');
}

function handleAction(action, target) {
  if (action === 'voice') return startVoice();
  if (action === 'type') return showScreen('ask');
  if (action === 'quick') return showScreen('quick');
  if (action === 'settings') return showScreen('settings');
  if (action === 'back') return showScreen('home');
  if (action === 'backhome') return showScreen('home');
  if (action === 'again') return showScreen('ask');
  if (action === 'openchatgpt') return openChatGPT();
  if (action === 'copy') {
    navigator.clipboard?.writeText(promptBox.value || '').then(() => setAnswer('Text copiat.'));
    return;
  }
  if (action === 'send') {
    const text = promptBox.value.trim();
    if (!text) return setAnswer('Scrie întâi întrebarea.');
    lastPrompt = text;
    return askBackend(text);
  }
  if (action === 'saveSettings') {
    const value = endpointInput.value.trim();
    if (value && !value.startsWith('https://')) return setAnswer('Endpoint-ul trebuie să înceapă cu https://');
    localStorage.setItem(STORAGE_KEY, value);
    return setAnswer(value ? 'Backend salvat.' : 'Setările au fost salvate fără endpoint.');
  }
  if (action === 'clearSettings') {
    localStorage.removeItem(STORAGE_KEY);
    endpointInput.value = '';
    return setAnswer('Endpoint șters.');
  }
}

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action], .quick');
  if (!button) return;
  if (button.classList.contains('quick')) {
    promptBox.value = button.dataset.prompt;
    showScreen('ask');
    return;
  }
  handleAction(button.dataset.action, button);
});

document.addEventListener('keydown', event => {
  const key = event.key;
  const isTyping = ['TEXTAREA', 'INPUT'].includes(document.activeElement.tagName);

  if (key === 'Escape') {
    event.preventDefault();
    showScreen('home');
    return;
  }

  if (isTyping && !['ArrowUp', 'ArrowDown'].includes(key)) return;

  if (key === 'ArrowDown' || key === 'ArrowRight') {
    event.preventDefault();
    moveFocus(1);
  }
  if (key === 'ArrowUp' || key === 'ArrowLeft') {
    event.preventDefault();
    moveFocus(-1);
  }
  if (key === 'Enter') {
    const items = focusables();
    const el = items[focusIndex];
    if (el && el.tagName === 'BUTTON') {
      event.preventDefault();
      el.click();
    }
  }
});

window.addEventListener('load', () => {
  showScreen('home');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
