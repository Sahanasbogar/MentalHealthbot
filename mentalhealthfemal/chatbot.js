const chatWindow = document.getElementById('chat');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const micBtn = document.getElementById('mic-btn');

const moods = ["happy", "sad", "anxious", "stressed", "calm", "angry"];

const tips = {
  happy: "Keep up the positive vibes! 😊",
  sad: "It's okay to feel sad. Talk to a friend. 💙",
  anxious: "Take deep breaths and relax. 🧘‍♂",
  stressed: "Stretch or take a break. 🌿",
  calm: "Enjoy the peace. 🌸",
  angry: "Count to 10 or go for a walk. 🚶‍♂"
};

const jokes = {
  happy: ["Why don't scientists trust atoms? Because they make up everything! 😄"],
  sad: ["Why did the cookie cry? Because his mom was a wafer too long! 🍪"],
  anxious: ["Why did the scarecrow win an award? He was outstanding in his field! 🌾"],
  stressed: ["Why don't programmers like nature? Too many bugs! 🐞"],
  calm: ["What do you call a sleeping bull? A bulldozer! 🐂"],
  angry: ["Why was the computer cold? It forgot to close its Windows! 🖥"]
};

let state = 'greet';
let userName = null;
let moodHistory = [];

function speakText(text) {
  if (!('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(text.replace(/<[^>]+>/g, ''));
  utterance.lang = 'en-GB';
  const maleVoice = speechSynthesis.getVoices().find(v => v.name.includes("Daniel") || v.name.includes("Male"));
  if (maleVoice) utterance.voice = maleVoice;
  speechSynthesis.speak(utterance);
}

function appendMessage(text, sender = 'bot') {
  const bubble = document.createElement('div');
  bubble.classList.add('chat-bubble', sender);
  bubble.innerHTML = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  if (sender === 'bot') speakText(text);
}

function getRandomJoke(mood) {
  const moodJokes = jokes[mood] || [];
  return moodJokes[Math.floor(Math.random() * moodJokes.length)];
}

function saveMood(mood) {
  const today = new Date().toLocaleDateString();
  moodHistory.push({ mood, date: today });
  localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
}

function showMoodChart() {
  const ctx = document.getElementById('moodChart').getContext('2d');
  document.getElementById('moodChart').style.display = 'block';
  const countMap = {};
  moodHistory.forEach(entry => countMap[entry.mood] = (countMap[entry.mood] || 0) + 1);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(countMap),
      datasets: [{
        label: 'Mood Frequency',
        data: Object.values(countMap),
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Your Mood Summary' }
      }
    }
  });
}

function showMoodHistory() {
  if (moodHistory.length === 0) {
    appendMessage("You don't have any mood history yet!", 'bot');
    return;
  }
  appendMessage("<strong>Your Mood History:</strong>", 'bot');
  moodHistory.slice().reverse().forEach(entry => {
    appendMessage(`${entry.date} — ${entry.mood}`, 'bot');
  });
  showMoodChart();
}

function handleUserInput(input) {
  const text = input.trim().toLowerCase();

  if (["hi", "hello", "hey"].includes(text) && state === 'greet') {
    appendMessage("Hi there! What's your name?", 'bot');
    state = 'askName';
    return;
  }

  if (state === 'askName') {
    if (text.length < 2) {
      appendMessage("Please enter a valid name.", 'bot');
    } else {
      userName = input.trim();
      moodHistory = [];
      appendMessage(`Nice to meet you, <strong>${userName}</strong>! How are you feeling today? (happy, sad, anxious, stressed, calm, angry)`, 'bot');
      state = 'askMood';
    }
  } else if (state === 'askMood') {
    if (!moods.includes(text)) {
      appendMessage("I didn't recognize that mood. Please type one of: happy, sad, anxious, stressed, calm, angry.", 'bot');
    } else {
      saveMood(text);
      appendMessage(`Thanks for sharing, <strong>${userName}</strong>! Here's a tip: "${tips[text]}"<br><br>And a joke for you: "${getRandomJoke(text)}"`, 'bot');
      appendMessage("Would you like to check in another mood? (yes/no)", 'bot');
      state = 'askContinue';
    }
  } else if (state === 'askContinue') {
    if (text.startsWith('y')) {
      appendMessage("How are you feeling now?", 'bot');
      state = 'askMood';
    } else if (text.startsWith('n')) {
      appendMessage(`Alright, ${userName}! Here's a summary of your mood history:`, 'bot');
      showMoodHistory();
      appendMessage("Thanks for chatting! Come back anytime. 😊", 'bot');
      state = 'end';
    } else {
      appendMessage("Please type 'yes' or 'no'.", 'bot');
    }
  } else if (state === 'end') {
    appendMessage("If you want to chat again, refresh the page. 💬", 'bot');
  }
}

chatForm.addEventListener('submit', e => {
  e.preventDefault();
  const input = chatInput.value;
  if (!input.trim()) return;
  appendMessage(input, 'user');
  chatInput.value = '';
  setTimeout(() => handleUserInput(input), 500);
});

if (window.SpeechRecognition || window.webkitSpeechRecognition) {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  micBtn.addEventListener('click', () => recognition.start());
  recognition.onresult = e => {
    chatInput.value = e.results[0][0].transcript;
    chatForm.requestSubmit();
  };
} else {
  micBtn.disabled = true;
  micBtn.title = "Voice not supported";
}

window.onload = () => {
  localStorage.removeItem('userName');
  localStorage.removeItem('moodHistory');
  appendMessage("👋 Welcome! Type 'hello' to begin.", 'bot');
};
