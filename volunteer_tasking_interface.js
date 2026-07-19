document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('start-task-btn');
  const viewMapBtn = document.getElementById('view-map-btn');
  const openToolBtn = document.getElementById('open-tool-btn');
  const holdBtn = document.getElementById('hold-to-speak-btn');
  const playBtn = document.getElementById('play-audio-btn');
  const aiInsight = document.getElementById('ai-insight');
  const aiDismiss = document.getElementById('ai-insight-dismiss');

  if (startBtn) {
    startBtn.addEventListener('click', function () {
      const task = ApexData.updateTask('t1', { status: 'IN_PROGRESS' });
      startBtn.disabled = true;
      startBtn.style.opacity = '0.6';
      startBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Task In Progress';
      ApexData.toast('Task started: ' + (task ? task.title : 'Assist Mateo'));
    });
  }

  if (viewMapBtn) {
    viewMapBtn.addEventListener('click', function () {
      window.location.href = 'stadium_operations_map.html';
    });
  }

  if (openToolBtn) {
    openToolBtn.addEventListener('click', function () {
      document.querySelector('.bg-surface-container-highest.rounded-xl.p-md.border')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      ApexData.toast('Translation tool ready.');
    });
  }

  const inputEl = document.getElementById('translation-input');
  const eqContainer = document.getElementById('equalizer-container');
  const outputContainer = document.getElementById('translation-output-container');
  const outputEl = document.getElementById('translation-output');
  const placeholderEl = document.getElementById('translation-result-placeholder');

  function updateButtonState() {
    if (inputEl && inputEl.value.trim().length > 0) {
      holdBtn.innerHTML = '<span class="material-symbols-outlined">translate</span> TRANSLATE TEXT';
    } else {
      holdBtn.innerHTML = '<span class="material-symbols-outlined">mic</span> HOLD TO SPEAK';
    }
  }

  if (inputEl) {
    inputEl.addEventListener('input', updateButtonState);
    inputEl.addEventListener('keypress', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        performTranslation();
      }
    });
  }

  async function performTranslation() {
    const textToTranslate = inputEl.value.trim();
    if (!textToTranslate) return;

    if (eqContainer) eqContainer.classList.add('hidden');
    if (outputContainer) outputContainer.classList.remove('hidden');

    const currentSettings = ApexData.getProfileSettings();
    const translationOption = currentSettings.translation || 'Spanish to English';
    const [sourceLang, targetLang] = translationOption.split(' to ');

    holdBtn.disabled = true;
    holdBtn.style.opacity = '0.7';
    if (placeholderEl) placeholderEl.textContent = 'Translating: "' + textToTranslate + '"...';

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToTranslate,
          sourceLang: sourceLang,
          targetLang: targetLang
        })
      });

      if (!response.ok) {
        throw new Error('Translation request failed');
      }

      const data = await response.json();
      if (outputEl) {
        outputEl.textContent = '"' + data.translatedText + '"';
      }
      if (placeholderEl) {
        placeholderEl.innerHTML = '<span class="text-emerald-500 font-semibold flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">check_circle</span> Translation Complete</span>';
      }
      ApexData.toast('Translated successfully');
    } catch (err) {
      console.error(err);
      if (placeholderEl) {
        placeholderEl.innerHTML = '<span class="text-red-500 font-semibold">Error translating. Please try again.</span>';
      }
      ApexData.toast('Translation error');
    } finally {
      holdBtn.disabled = false;
      holdBtn.style.opacity = '1';
      updateButtonState();
    }
  }

  if (holdBtn) {
    let recording = false;
    holdBtn.addEventListener('click', function () {
      if (inputEl && inputEl.value.trim().length > 0) {
        performTranslation();
        return;
      }

      if (recording) return;
      recording = true;
      
      const currentSettings = ApexData.getProfileSettings();
      const translationOption = currentSettings.translation || 'Spanish to English';
      const [sourceLang, targetLang] = translationOption.split(' to ');

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        
        const recLocales = {
          "Hindi": "hi-IN",
          "Marathi": "mr-IN",
          "English": "en-US",
          "Spanish": "es-ES",
          "French": "fr-FR",
          "Portuguese": "pt-PT"
        };
        recognition.lang = recLocales[sourceLang] || 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
          holdBtn.innerHTML = '<span class="material-symbols-outlined animate-pulse">graphic_eq</span> Listening...';
          if (eqContainer) eqContainer.classList.remove('hidden');
          if (outputContainer) outputContainer.classList.add('hidden');
          if (placeholderEl) placeholderEl.textContent = 'Listening for speech in ' + sourceLang + '...';
        };

        recognition.onresult = function (event) {
          const transcript = event.results[0][0].transcript;
          if (inputEl) {
            inputEl.value = transcript;
            updateButtonState();
          }
          recording = false;
          if (eqContainer) eqContainer.classList.add('hidden');
          if (outputContainer) outputContainer.classList.remove('hidden');
          performTranslation();
        };

        recognition.onerror = function (event) {
          console.error('Speech recognition error:', event.error);
          recording = false;
          if (eqContainer) eqContainer.classList.add('hidden');
          if (outputContainer) outputContainer.classList.remove('hidden');
          if (placeholderEl) placeholderEl.textContent = 'Speech error: ' + event.error;
          updateButtonState();
        };

        recognition.onend = function () {
          recording = false;
          if (eqContainer) eqContainer.classList.add('hidden');
          if (outputContainer) outputContainer.classList.remove('hidden');
          updateButtonState();
        };

        recognition.start();
      } else {
        // Fallback for automation / unsupported environments
        holdBtn.innerHTML = '<span class="material-symbols-outlined animate-pulse">graphic_eq</span> Listening...';
        if (eqContainer) eqContainer.classList.remove('hidden');
        if (outputContainer) outputContainer.classList.add('hidden');
        if (placeholderEl) placeholderEl.textContent = 'Listening (Mock)...';

        setTimeout(function () {
          recording = false;
          if (eqContainer) eqContainer.classList.add('hidden');
          if (outputContainer) outputContainer.classList.remove('hidden');
          
          let mockSpeech = "Elevator 4B is around the corner.";
          if (sourceLang === "Hindi") mockSpeech = "लिफ्ट 4B कोने के पास है।";
          else if (sourceLang === "Marathi") mockSpeech = "लिफ्ट 4B कोपऱ्याजवळ आहे.";
          else if (sourceLang === "Spanish") mockSpeech = "el ascensor 4b está a la vuelta de la esquina.";
          else if (sourceLang === "French") mockSpeech = "l'ascenseur 4b est au coin de la rue.";
          else if (sourceLang === "Portuguese") mockSpeech = "o elevador 4b está ao virar da esquina.";
          
          if (inputEl) {
            inputEl.value = mockSpeech;
            updateButtonState();
          }
          performTranslation();
        }, 2000);
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', function () {
      const textToSpeak = outputEl ? outputEl.textContent.replace(/"/g, '') : '';
      if (!textToSpeak) {
        ApexData.toast('No translation text to play.');
        return;
      }

      const currentSettings = ApexData.getProfileSettings();
      const translationOption = currentSettings.translation || 'Spanish to English';
      const [_, targetLang] = translationOption.split(' to ');

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      
      const voiceLocales = {
        "Hindi": "hi-IN",
        "Marathi": "mr-IN",
        "English": "en-US",
        "Spanish": "es-ES",
        "French": "fr-FR",
        "Portuguese": "pt-PT"
      };
      utterance.lang = voiceLocales[targetLang] || 'en-US';

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang.startsWith(voiceLocales[targetLang] || 'en'));
        if (matchingVoice) utterance.voice = matchingVoice;
        
        window.speechSynthesis.speak(utterance);
        ApexData.toast('Speaking translation out loud...');
      } else {
        ApexData.toast('Speech synthesis not supported in this browser.');
      }
    });
  }

  ['task-item-t2', 'task-item-t3'].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function () {
      const taskId = id.replace('task-item-', '');
      const task = ApexData.getTasks().find(t => t.id === taskId);
      if (task) {
        ApexData.toast(task.title + ' acknowledged — added to your route.');
        ApexData.updateTask(taskId, { status: 'ACKNOWLEDGED' });
      }
    });
  });

  if (aiDismiss && aiInsight) {
    aiDismiss.addEventListener('click', function () {
      aiInsight.style.display = 'none';
    });
  }

  const session = ApexData.getSession();
  if (session) {
    const prefixEl = document.querySelector('[data-user-name-prefix]');
    if (prefixEl) {
      const firstName = session.fullName.split(' ')[0];
      prefixEl.textContent = prefixEl.textContent.replace(/^\w+,/, firstName + ',');
    }
  }

  const settings = ApexData.getProfileSettings();
  const translationLabel = document.getElementById('translation-label');
  if (translationLabel && settings && settings.translation) {
    const parts = settings.translation.split(' to ');
    if (parts.length === 2) {
      translationLabel.innerHTML = '<span class="material-symbols-outlined text-[16px]">translate</span> ' + parts[0] + ' <span class="material-symbols-outlined text-[16px]">arrow_forward</span> ' + parts[1];
    }
  }
});
