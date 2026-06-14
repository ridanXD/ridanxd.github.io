"use strict";

// ================= GLOBAL STATE =================
let audioContext = null;
let isMuted = false;

// ================= WEB AUDIO SYNTHESIZER =================
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSynthSound(type) {
  try {
    initAudio();
    if (isMuted) return;
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;

    if (type === 'click') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } 
    else if (type === 'beep') {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    }
    else if (type === 'error') {
      const freqs = [150, 220, 330];
      freqs.forEach((freq, idx) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = idx === 0 ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    }
    else if (type === 'startup') {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
      notes.forEach((freq, index) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (index * 0.06));
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.06, now + (index * 0.06) + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.start(now);
        osc.stop(now + 1.8);
      });
    }
  } catch (err) {
    console.error("Audio synth error: ", err);
  }
}

// Play startup sound on first interaction
window.addEventListener('click', () => {
  if (!audioContext) {
    playSynthSound('startup');
    const bgMusic = document.getElementById('bg-music');
    bgMusic.play().catch(e => console.log("Autoplay music requires user trigger."));
  }
}, { once: true });

// ================= BACKGROUND MUSIC CONTROLS =================
const music = document.getElementById("bg-music");

// ================= WINAMP CONTROLS & VISUALIZER =================
const winampPlay = document.getElementById('winamp-play');
const winampPause = document.getElementById('winamp-pause');
const winampStop = document.getElementById('winamp-stop');
const winampPrev = document.getElementById('winamp-prev');
const winampNext = document.getElementById('winamp-next');
const winampVol = document.getElementById('winamp-volume');
const winampTime = document.getElementById('winamp-time-display');

winampPlay.addEventListener('click', () => {
  music.play();
  toggleWinampBtn(winampPlay);
});
winampPause.addEventListener('click', () => {
  music.pause();
  toggleWinampBtn(winampPause);
});
winampStop.addEventListener('click', () => {
  music.pause();
  music.currentTime = 0;
  toggleWinampBtn(winampStop);
});
winampPrev.addEventListener('click', () => {
  playSynthSound('beep');
  alert("First track is the only track!");
});
winampNext.addEventListener('click', () => {
  playSynthSound('beep');
  alert("No other music files found in this local directory directory.");
});
winampVol.addEventListener('input', (e) => {
  music.volume = e.target.value;
});

function toggleWinampBtn(activeBtn) {
  document.querySelectorAll('.winamp-btn').forEach(btn => btn.classList.remove('active-btn'));
  activeBtn.classList.add('active-btn');
}

// Track Timer
setInterval(() => {
  if (music.duration) {
    const curMin = Math.floor(music.currentTime / 60).toString().padStart(2, '0');
    const curSec = Math.floor(music.currentTime % 60).toString().padStart(2, '0');
    winampTime.textContent = `${curMin}:${curSec}`;
  }
}, 500);

// Winamp Canvas visualizer (Simulated logic to look reactive & Y2K)
const canvas = document.getElementById('winamp-visualizer');
const ctx = canvas.getContext('2d');
let visBars = Array(18).fill(2);

function renderVisualizer() {
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  visBars.forEach((height, i) => {
    if (!music.paused) {
      visBars[i] = Math.max(2, Math.floor(Math.random() * 16) + 2);
    } else {
      visBars[i] = Math.max(2, height - 1); // decay
    }

    const x = i * 9;
    const h = visBars[i];
    
    let grad = ctx.createLinearGradient(x, canvas.height, x, canvas.height - h);
    grad.addColorStop(0, '#00ff00');
    grad.addColorStop(0.5, '#ffff00');
    grad.addColorStop(1, '#ff0000');
    
    ctx.fillStyle = grad;
    ctx.fillRect(x + 1, canvas.height - h, 7, h);
  });
  
  requestAnimationFrame(renderVisualizer);
}
renderVisualizer();

// ================= ASCII ART GENERATOR =================
const asciiInput = document.getElementById('ascii-input');
const asciiBtn = document.getElementById('ascii-btn');
const asciiOutput = document.getElementById('ascii-output');

const asciiFont = {
  'A': ["  /\  ", " /  \ ", "/====\\", "/    \\"],
  'B': ["|===\\", "|___/", "|===\\", "|___/"],
  'C': ["/====\\", "|     ", "|     ", "\\====/"],
  'D': ["|===\\", "|   |", "|   |", "|___/"],
  'E': ["|====","|___ ","|    ","|===="],
  'F': ["|====","|___ ","|    ","|    "],
  'G': ["/====\\","|  __","|   |","\\___/"],
  'H': ["|   |","|___|","|   |","|   |"],
  'I': ["=====","  |  ","  |  ","====="],
  'J': ["  === ","   |  ","|  |  ","\\__/  "],
  'K': ["|  / ","|__\\ ","|  \\ ","|   \\"],
  'L': ["|    ","|    ","|    ","|===="],
  'M': ["|\\ /|","| v |","|   |","|   |"],
  'N': ["|\\  |","| \\ |","|  \\|","|   |"],
  'O': ["/====\\","|  /|","|/  |","\\____/"],
  'P': ["|===\\","|___/","|    ","|    "],
  'Q': ["/====\\","|  /|","|\\ \\|","\\__\\\\/"],
  'R': ["|===\\","|___/","|  \\ ","|   \\"],
  'S': ["/=====","\\===\\ ","    \\","====/"],
  'T': ["=====","  |  ","  |  ","  |  "],
  'U': ["|   |","|   |","|   |","\\___/"],
  'V': ["\\   /"," \\ / ","  V  ","  |  "],
  'W': ["|   |","|   |","| v |","|\\_/|"],
  'X': ["\\   /"," \\ / ","  X  "," / \\ "],
  'Y': ["\\   /"," \\ / ","  |  ","  |  "],
  'Z': ["====/","   / ","  /  ","/__=="],
  ' ': ["     ","     ","     ","     "]
};

asciiBtn.addEventListener('click', () => {
  const text = asciiInput.value.toUpperCase();
  let result = ["", "", "", ""];
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const letterRows = asciiFont[char] || asciiFont[' '];
    for (let r = 0; r < 4; r++) {
      result[r] += letterRows[r] + "  ";
    }
  }
  asciiOutput.textContent = result.join("\n");
  playSynthSound('beep');
});

// ================= DISCRETE MATH GF PROBABILITY =================
const gfBtn = document.getElementById('calc-gf-btn');
const gradBtn = document.getElementById('calc-grad-btn');
const gfResult = document.getElementById('gf-result');

gfBtn.addEventListener('click', () => {
  gfResult.textContent = "Analyzing quantum parameters and emotional factors...";
  playSynthSound('click');
  setTimeout(() => {
    const prob = (Math.random() * 0.00000000000000000001).toFixed(20);
    gfResult.textContent = `Girlfriend Probability = ${prob}% (Margin of error: +99% Seblak dependency)`;
    playSynthSound('error');
  }, 1000);
});

gradBtn.addEventListener('click', () => {
  gfResult.textContent = "Querying university database and laziness coefficient...";
  playSynthSound('click');
  setTimeout(() => {
    gfResult.textContent = `Estimated Graduation ETA: Year 2099 (Caused by high levels of procrastination)`;
    playSynthSound('error');
  }, 1000);
});

// ================= VIRTUAL PET TAMAGOTCHI =================
let petCringe = 20;
const petAvatar = document.getElementById('pet-avatar');
const petBubble = document.getElementById('pet-mood-bubble');
const petCringeVal = document.getElementById('pet-cringe-val');
const petCringeBar = document.getElementById('pet-cringe-bar');

function feedPet(item) {
  playSynthSound('beep');
  if (item === 'indomie') {
    petCringe = Math.min(100, petCringe + 15);
    petBubble.textContent = "Yum! Raw Indomie is so crunchy! 🍜";
    petAvatar.textContent = "🦖";
  } else if (item === 'seblak') {
    petCringe = Math.min(100, petCringe + 25);
    petBubble.textContent = "OMG!! SPICY LEVEL 5 SEBLAK DETECTED!!! 🔥🌶️";
    petAvatar.textContent = "🔥🐲🔥";
  } else if (item === 'kopi') {
    petCringe = Math.min(100, petCringe + 10);
    petBubble.textContent = "Black coffee mode active! Can't sleep! 😳☕";
    petAvatar.textContent = "👽";
  }
  updatePetStats();
}

function petSleep() {
  playSynthSound('beep');
  petCringe = Math.max(0, petCringe - 10);
  petBubble.textContent = "Zzz... sleeping to escape coding responsibilities... Zzz 😴";
  petAvatar.textContent = "🛌";
  updatePetStats();
}

function updatePetStats() {
  petCringeVal.textContent = `${petCringe}%`;
  petCringeBar.style.width = `${petCringe}%`;
  
  if (petCringe >= 100) {
    petBubble.textContent = "SUPER CRINGE EVOLUTION ACTIVATED!!! 💥🦖👑";
    petAvatar.textContent = "👾👑";
    petCringeBar.style.background = "linear-gradient(to right, red, orange, yellow, green, blue, violet)";
  }
}

window.feedPet = feedPet;
window.petSleep = petSleep;

// Passive decay
setInterval(() => {
  if (petCringe > 10 && petCringe < 100) {
    petCringe -= 2;
    updatePetStats();
  }
}, 10000);

// ================= GUESTBOOK MS-DOS TERMINAL SYSTEM =================
const cmdInput = document.getElementById('terminal-cmd');
const termHistory = document.getElementById('terminal-history');

// Local storage list of messages
let guestMessages = [];
if (localStorage.getItem('guestbook_msgs')) {
  guestMessages = JSON.parse(localStorage.getItem('guestbook_msgs'));
}

// Render guestbook comments
function renderGuestbookHistory() {
  termHistory.innerHTML = '';
  guestMessages.forEach(msg => {
    termPrint(`<b>${msg.name}</b>: ${msg.text}`);
  });
}
renderGuestbookHistory();

cmdInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const rawVal = cmdInput.value;
    const cleanCmd = rawVal.trim();
    termPrint(`C:\\GUESTBOOK> ${rawVal}`);
    executeCmd(cleanCmd);
    cmdInput.value = '';
    
    // Scroll terminal
    const body = cmdInput.closest('.terminal-body');
    body.scrollTop = body.scrollHeight;
  }
});

function termPrint(txt) {
  const p = document.createElement('p');
  p.innerHTML = txt;
  termHistory.appendChild(p);
}

function executeCmd(cmd) {
  playSynthSound('click');
  
  if (cmd === '') return;
  
  const tokens = cmd.split(" ");
  const base = tokens[0].toLowerCase();

  switch(base) {
    case 'help':
      termPrint("Guestbook manual instructions:<br>" +
                "  <b>help</b>            - Show this list<br>" +
                "  <b>shout [name]:[msg]</b> - Add message! (e.g. <i>shout budi:hi friend</i>)<br>" +
                "  <b>clear</b>           - Clear history log<br>" +
                "  <b>neofetch</b>        - System specs panel<br>" +
                "  <b>mood</b>            - Query coder status info");
      break;
    case 'clear':
      termHistory.innerHTML = '';
      break;
    case 'mood':
      termPrint("Developer Mood Index: <b>15%</b>. Hates campus, lives for caffeine and noodles.");
      break;
    case 'neofetch':
      termPrint("<pre style='color: yellow; line-height: 1.1; margin:0;'>" +
                "   /\\_/\\      Site: RidanXP Hyper Portfolio<br>" +
                "  ( o.o )     OS: Windows XP Luna Theme<br>" +
                "   > ^ <      Stack: CSS 3D Bevel Engine<br>" +
                "              Features: Winamp, Tamagotchi, Terminal" +
                "</pre>");
      break;
    case 'shout':
      const content = cmd.substring(6).trim();
      if (!content.includes(':')) {
        termPrint("<span style='color: red;'>Error: Use format: shout name:message (e.g. <i>shout bob:neat site</i>)</span>");
        return;
      }
      const parts = content.split(':');
      const author = parts[0].trim();
      const text = parts.slice(1).join(':').trim();
      
      if (author === '' || text === '') {
        termPrint("<span style='color: red;'>Error: Name or Message cannot be empty.</span>");
        return;
      }
      
      guestMessages.push({ name: author, text: text });
      localStorage.setItem('guestbook_msgs', JSON.stringify(guestMessages));
      termPrint("<span style='color: lime;'>Success: Comment registered to local guestbook database.</span>");
      setTimeout(renderGuestbookHistory, 500);
      break;
    default:
      termPrint(`'${base}' is not recognized as an internal command. Type 'help' for instructions.`);
  }
}

// Hacker Typer on Terminal Box Keypresses (outside command line)
const terminalContainer = document.querySelector('.terminal-container');
const hackerPhrases = [
  "\n[INJECT] bypass_firewall_v2(ip='192.168.1.100');",
  "\n[LOAD] loading_seblak_database... [OK]",
  "\n[ERROR] ex_girlfriend_contact_not_found. Emotional core dumped.",
  "\n[HACK] wget http://nasa.gov/mainframe_access_key.key -q"
];

terminalContainer.addEventListener('keydown', e => {
  if (document.activeElement !== cmdInput) {
    playSynthSound('beep');
    const index = Math.floor(Math.random() * hackerPhrases.length);
    termPrint(`<pre style='color: lime; margin:0;'>${hackerPhrases[index]}</pre>`);
    const body = cmdInput.closest('.terminal-body');
    body.scrollTop = body.scrollHeight;
  }
});

// ================= SUSPICIOUS FILE ACTIONS =================
window.openCdTray = function() {
  playSynthSound('beep');
  alert("CD-ROM Tray opened! 💿\nYou can now place your coffee mug or Indomie plate on your computer disc holder. Enjoy! ☕");
};

// ================= LOCAL STORAGE FOR MOOD STATUS =================
const notepadTextarea = document.getElementById('notepad-textarea');
const notepadAutocringe = document.getElementById('notepad-autocringe');
const notepadClear = document.getElementById('notepad-clear');

if (localStorage.getItem('ridan_notepad_content')) {
  notepadTextarea.value = localStorage.getItem('ridan_notepad_content');
}

notepadTextarea.addEventListener('keyup', () => {
  localStorage.setItem('ridan_notepad_content', notepadTextarea.value);
});

const cringeDiaryEntries = [
  "Diary Entry 104: Nobody understands my code... Python syntax is so dark... 🥀\n",
  "Diary Entry 42: Spilled black coffee on my motherboard. Clippy is gone, who will save me now? 😭\n",
  "Diary Entry 13: Matrix rain is my only friend. I am the true cyber overlord of 2001. 👾\n",
  "Diary Entry 99: University exam is tomorrow. Time to code another CSS layout to escape reality.\n"
];

notepadAutocringe.addEventListener('click', () => {
  playSynthSound('click');
  const index = Math.floor(Math.random() * cringeDiaryEntries.length);
  notepadTextarea.value += cringeDiaryEntries[index];
  localStorage.setItem('ridan_notepad_content', notepadTextarea.value);
});

notepadClear.addEventListener('click', () => {
  playSynthSound('click');
  notepadTextarea.value = "";
  localStorage.removeItem('ridan_notepad_content');
});

// ================= COLLAPSIBLE SIDEBAR TOGGLING =================
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.querySelector('.sidebar');
const pageContainer = document.querySelector('.page-container');

menuToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  playSynthSound('click');
  
  if (window.innerWidth <= 768) {
    // Mobile: Toggle slide-in drawer
    sidebar.classList.toggle('open');
  } else {
    // Desktop: Toggle collapsed grid structure
    pageContainer.classList.toggle('sidebar-collapsed');
  }
});

// Close sidebar on mobile when clicking on document body
document.body.addEventListener('click', (e) => {
  if (window.innerWidth <= 768 && sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggleBtn) {
    sidebar.classList.remove('open');
  }
});

// ================= SMOOTH SCROLL JUMP LINKS WITH HEADER OFFSET =================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    playSynthSound('click');
    
    const targetId = link.getAttribute('href');
    const targetSec = document.querySelector(targetId);
    
    if (targetSec) {
      // Offset by 64px to clear the sticky header bar
      const topOffset = targetSec.offsetTop - 64;
      
      window.scrollTo({
        top: topOffset,
        behavior: 'smooth'
      });
      
      // Close sidebar drawer if on mobile
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('open');
      }
    }
  });
});
