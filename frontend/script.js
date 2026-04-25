const API_BASE = '/api';

// --- Login Logic ---
const loginOverlay = document.getElementById('login-overlay');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

if (loginOverlay && loginForm) {
    if (sessionStorage.getItem('krishiai_auth') === 'true') {
        loginOverlay.classList.add('hidden');
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const uid = document.getElementById('login-id').value.trim();
        const pass = document.getElementById('login-pass').value.trim();
        
        if (uid.length > 0 && pass.length > 0) {
            sessionStorage.setItem('krishiai_auth', 'true');
            loginError.classList.add('hidden');
            loginOverlay.style.opacity = '0';
            setTimeout(() => {
                loginOverlay.classList.add('hidden');
                loginOverlay.style.opacity = '1';
            }, 300);
            
            // Allow adding a personalized greeting if desired
            // Could dynamically update navbar user profile here
        } else {
            loginError.classList.remove('hidden');
            loginError.innerText = "Please enter valid User ID and Password.";
        }
    });
}


// Fetch Weather by coordinates
async function loadWeather(lat, lon) {
    try {
        const res = await fetch(`${API_BASE}/weather/current?lat=${lat}&lon=${lon}`);
        const data = await res.json();
        
        document.getElementById('weather-loader').classList.add('hidden');
        document.getElementById('weather-data').classList.remove('hidden');
        
        document.getElementById('w-temp').innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById('w-desc').innerText = data.weather[0].description;
        document.getElementById('w-wind').innerText = data.wind.speed;
        document.getElementById('w-humidity').innerText = data.main.humidity;
        document.getElementById('w-loc').innerText = data.name;

    } catch (e) {
        console.error('Weather error:', e);
        document.getElementById('weather-loader').innerText = 'Failed to load weather.';
    }
}

// Fetch Weather by City Name
async function loadWeatherByCity(city) {
    try {
        document.getElementById('weather-loader').classList.remove('hidden');
        document.getElementById('weather-loader').innerText = 'Searching weather...';
        document.getElementById('weather-data').classList.add('hidden');

        const res = await fetch(`${API_BASE}/weather/current?q=${encodeURIComponent(city)}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.detail || "Location Not Found");
        
        document.getElementById('weather-loader').classList.add('hidden');
        document.getElementById('weather-data').classList.remove('hidden');
        
        document.getElementById('w-temp').innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById('w-desc').innerText = data.weather[0].description;
        document.getElementById('w-wind').innerText = data.wind.speed;
        document.getElementById('w-humidity').innerText = data.main.humidity;
        document.getElementById('w-loc').innerText = data.name;

    } catch (e) {
        console.error('Weather error:', e);
        document.getElementById('weather-loader').innerText = e.message;
        document.getElementById('weather-loader').classList.remove('hidden');
        document.getElementById('weather-data').classList.add('hidden');
    }
}

// Attach Search Handlers
const weatherSearchBtn = document.getElementById('weather-search-btn');
const weatherSearchInput = document.getElementById('weather-search-input');
if (weatherSearchBtn && weatherSearchInput) {
    weatherSearchBtn.addEventListener('click', () => {
        if (weatherSearchInput.value.trim()) loadWeatherByCity(weatherSearchInput.value.trim());
    });
    weatherSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && weatherSearchInput.value.trim()) {
            loadWeatherByCity(weatherSearchInput.value.trim());
        }
    });
}

// Location wrapper
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        pos => loadWeather(pos.coords.latitude, pos.coords.longitude),
        err => {
            console.warn("Location denied, using defaults (Delhi)");
            loadWeather(28.61, 77.23); // Default New Delhi
        }
    );
} else {
    loadWeather(28.61, 77.23);
}

// Fetch Schemes
async function loadSchemes() {
    try {
        const res = await fetch(`${API_BASE}/schemes/`);
        const data = await res.json();
        
        const list = document.getElementById('schemes-list');
        list.innerHTML = '';
        
        data.schemes.forEach(s => {
            list.innerHTML += `
                <div class="glass-panel border border-glass-border rounded-3xl p-6 bg-white/5 shadow-xl hover:-translate-y-2 hover:border-blue-500/30 transition-all duration-300 group flex flex-col">
                    <h3 class="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-4">${s.name}</h3>
                    <p class="text-gray-400 text-sm leading-relaxed mb-6 flex-1">${s.description}</p>
                    <a href="${s.link}" target="_blank" class="inline-flex items-center justify-center w-full py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-500 transition-all font-semibold">
                        Apply Now <i class="fa-solid fa-arrow-right ml-2 text-sm transition-transform group-hover:translate-x-1"></i>
                    </a>
                </div>
            `;
        });
    } catch (e) {
        document.getElementById('schemes-list').innerHTML = '<p>Failed to load schemes.</p>';
    }
}
loadSchemes();

// Submit ML Prediction
document.getElementById('crop-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const ogText = btn.innerHTML;
    btn.innerHTML = 'Predicting... <i class="fa-solid fa-spinner fa-spin"></i>';
    
    const payload = {
        N: parseFloat(document.getElementById('inp-n').value),
        P: parseFloat(document.getElementById('inp-p').value),
        K: parseFloat(document.getElementById('inp-k').value),
        temperature: parseFloat(document.getElementById('inp-temp').value),
        humidity: parseFloat(document.getElementById('inp-hum').value),
        ph: parseFloat(document.getElementById('inp-ph').value),
        rainfall: parseFloat(document.getElementById('inp-rain').value)
    };

    try {
        const res = await fetch(`${API_BASE}/ml/recommend`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        const mlResultWrapper = document.getElementById('ml-result-wrapper');
        if (mlResultWrapper) {
            const icon = mlResultWrapper.querySelector('.ml-result-icon');
            const desc = mlResultWrapper.querySelector('.ml-result-desc');
            if(icon) icon.classList.add('hidden');
            if(desc) desc.classList.add('hidden');
        }
        document.getElementById('ml-result').classList.remove('hidden');
        document.getElementById('ml-result').classList.add('flex');
        document.getElementById('predicted-crop').innerText = data.recommended_crop;
    } catch(err) {
        alert("Prediction failed. " + err.message);
    } finally {
        btn.innerHTML = ogText;
    }
});

// --- AI Chatbot & Voice Assistant ---
const voiceBtn = document.getElementById('voice-btn');
const voiceStatus = document.getElementById('voice-status');
const chatBox = document.getElementById('chat-box');

// Setup Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    // Set to Hindi (India) for Indian accent and speech recognition
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        voiceBtn.classList.add('recording');
        voiceStatus.innerText = "Listening...";
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        voiceStatus.innerText = "Processing...";
        
        // Add User Message to UI
        addMessage(transcript, 'user-message');
        
        // Send to backend
        sendToChatbot(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error("Speech Recognition Error", event.error);
        voiceBtn.classList.remove('recording');
        voiceStatus.innerText = "Error: " + event.error + ". Tap to try again.";
    };
    
    recognition.onend = function() {
        voiceBtn.classList.remove('recording');
    };
} else {
    voiceStatus.innerText = "Voice recognition not supported in this browser.";
    voiceBtn.disabled = true;
}

voiceBtn.addEventListener('click', () => {
    if (recognition) {
        try {
            recognition.start();
        } catch(e) {
            console.error("Recognition already started or error:", e);
        }
    }
});

function addMessage(text, className) {
    const isUser = className === 'user-message';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex gap-4 fade-in-up ${isUser ? 'flex-row-reverse self-end ml-auto' : ''}`;
    
    const iconHTML = isUser ? `<i class="fa-solid fa-user text-white text-xs"></i>` : `<i class="fa-solid fa-leaf text-white text-xs"></i>`;
    const iconBg = isUser ? `bg-blue-600 shadow-blue-500/30` : `bg-primary shadow-primary/30`;
    const bubbleBg = isUser ? `bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none shadow-md border-transparent` : `bg-white/10 text-gray-200 rounded-2xl rounded-tl-none border-white/5`;

    msgDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full ${iconBg} flex items-center justify-center shrink-0 shadow-lg mt-1">
            ${iconHTML}
        </div>
        <div class="${bubbleBg} border p-4 text-sm max-w-[85%] leading-relaxed backdrop-blur-md">
            ${text}
        </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendToChatbot(message) {
    try {
        const res = await fetch(`${API_BASE}/chat/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        
        const data = await res.json();
        
        // Add Bot Message to UI
        addMessage(data.reply, 'bot-message');
        
        // Speak response out loud
        speakText(data.reply);
        
        if (voiceStatus.innerText === "Processing...") {
            voiceStatus.innerText = "Tap microphone to speak again.";
        }
    } catch(err) {
        console.error("Chatbot API Error:", err);
        addMessage("Sorry, I am having trouble connecting to the server.", 'bot-message');
        voiceStatus.innerText = "Connection failed. Try again.";
    }
}

function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'hi-IN'; // Indian Accent
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
    }
}
