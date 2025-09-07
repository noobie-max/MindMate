// Use a safe storage key even when user is not logged in
const CHAT_USER_EMAIL = (typeof currentUser !== 'undefined' && currentUser && currentUser.email) ? currentUser.email : 'guest';
let chatHistory = JSON.parse(localStorage.getItem(`chatHistory_${CHAT_USER_EMAIL}`)) || [];
let conversationContext = [];

// NOTE: For security and compatibility we do NOT call third-party AI services directly from client-side
// If you have a server-side proxy / API key, set GEMINI_API_KEY securely on the server and call it from there.
const GEMINI_API_KEY = ""; // intentionally empty to avoid exposing secrets in the client
const GEMINI_API_URL = GEMINI_API_KEY ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}` : null;

const systemPrompt = "You are MindMate, an AI-powered mental wellness companion. Your purpose is to provide a secure, empathetic, and supportive environment for users to track their mood, practice mindfulness, and build healthier habits. Your responses should be encouraging, non-judgmental, and focused on helping users improve their mental well-being. You can provide information, suggest activities, and offer a listening ear. Do not provide medical advice, but you can suggest seeking professional help if a user seems to be in distress. Keep your responses concise and easy to understand.";

document.addEventListener('DOMContentLoaded', function() {
    loadChatHistory();
});

// When Firebase is ready, load chat from Firestore for authenticated user
FirebaseApp.onReady(() => {
    FirebaseApp.auth.onAuthStateChanged(async (user) => {
        if (user) {
            // override CHAT_USER_EMAIL for logged in users
            // note: we won't mutate the const, but will use user.email when saving/loading
            await loadChatFromFirestore(user);
        }
    });
});

async function sendMessage() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    // Add to conversation context
    conversationContext.push({ role: 'user', parts: [{text: message}] });
    
    // Keep context manageable
    if (conversationContext.length > 10) {
        conversationContext = conversationContext.slice(-10);
    }
    
    showTypingIndicator();
    try {
        const response = await generateAIResponse(conversationContext);
        hideTypingIndicator();
        addMessage(response, 'ai');
        
        // Add AI response to context
        conversationContext.push({ role: 'model', parts: [{text: response}] });
        
        // Save chat history
        saveChatHistory();
    } catch (error) {
        hideTypingIndicator();
        addMessage("Sorry, I'm having trouble connecting to the AI. Please try again later.", 'ai');
        console.error('Error generating AI response:', error);
    }
}

async function generateAIResponse(history) {
    // Safeguard to ensure history is in the correct format
    const sanitizedHistory = history.map(item => {
        if (item.content) {
            return {
                role: item.role,
                parts: [{ text: item.content }]
            };
        }
        return item;
    });

    console.log(JSON.stringify(sanitizedHistory, null, 2));

    // Normalize roles: the API expects only 'user' or 'model' roles in contents
    const normalizedContents = sanitizedHistory.map(item => {
        const role = (item.role === 'user') ? 'user' : 'model';
        return {
            role,
            parts: item.parts
        };
    });

    // If there's no server-side API key configured, fall back to a lightweight, local response.
    if (!GEMINI_API_KEY || !GEMINI_API_URL) {
        // Basic mock response: echo the last user message with an empathetic prompt.
        const lastUser = sanitizedHistory.slice().reverse().find(h => h.role === 'user')?.parts?.[0]?.text || '';
        await new Promise(r => setTimeout(r, 400)); // simulate latency
        return `I hear you: "${lastUser}" — I'm here to listen. Tell me more or ask for an activity to try.`;
    }

    const data = {
        contents: normalizedContents,
        system_instruction: {
            parts: [{
                text: systemPrompt
            }]
        }
    };

    const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        console.error('API Error:', error || response.statusText);
        throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

function quickResponse(message) {
    document.getElementById('chat-input').value = message;
    sendMessage();
}

function addMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-bubble flex items-start space-x-3';
    
    if (sender === 'user') {
        messageDiv.className += ' flex-row-reverse space-x-reverse';
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-sm">
                👤
            </div>
            <div class="bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl rounded-tr-sm p-4 max-w-xs">
                <p class="text-white">${message}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm">
                🧠
            </div>
            <div class="bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-xs">
                <p class="text-white">${message}</p>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'flex items-start space-x-3';
    typingDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm">
            🧠
        </div>
        <div class="bg-gray-800 rounded-2xl rounded-tl-sm p-4">
            <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style="animation-delay: 0.2s;"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full typing-indicator" style="animation-delay: 0.4s;"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function clearChat() {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `
        <div class="chat-bubble flex items-start space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm">
                🧠
            </div>
            <div class="bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-xs">
                <p class="text-white">Hello! I'm MindMate, your AI wellness companion. I'm here to support your mental health journey. How are you feeling today?</p>
            </div>
        </div>
    `;
    conversationContext = [];
    chatHistory = [];
    localStorage.removeItem(`chatHistory_${CHAT_USER_EMAIL}`);
}

function saveChatHistory() {
    const chatKey = `chatHistory_${CHAT_USER_EMAIL}`;
    localStorage.setItem(chatKey, JSON.stringify(conversationContext));
}

async function saveChatToFirestore(user) {
    if (!FirebaseApp.initialized || !user) return;
    try {
        const userRef = FirebaseApp.db.collection('chats').doc(user.uid);
        // Save entire conversation as a single document field for simplicity
        await userRef.set({ conversation: conversationContext, updatedAt: window.firebase.firestore.FieldValue.serverTimestamp() });
    } catch (err) {
        console.error('saveChatToFirestore error', err);
    }
}

async function loadChatFromFirestore(user) {
    if (!FirebaseApp.initialized || !user) return;
    try {
        const userRef = FirebaseApp.db.collection('chats').doc(user.uid);
        const doc = await userRef.get();
        if (doc.exists) {
            const data = doc.data();
            if (data && Array.isArray(data.conversation)) {
                conversationContext = data.conversation;
                // render messages
                const chatMessages = document.getElementById('chat-messages');
                if (chatMessages) chatMessages.innerHTML = '';
                conversationContext.forEach(msg => {
                    if (msg.role === 'user') addMessage(msg.parts[0].text, 'user');
                    else addMessage(msg.parts[0].text, 'ai');
                });
            }
        }
    } catch (err) {
        console.error('loadChatFromFirestore error', err);
    }
}

function loadChatHistory() {
    const chatKey = `chatHistory_${CHAT_USER_EMAIL}`;
    const stored = localStorage.getItem(chatKey);
        if (stored) {
            const history = JSON.parse(stored);
            // Convert old format to new format
            conversationContext = history.map(item => {
                if (item.content) {
                    return {
                        role: item.role,
                        parts: [{ text: item.content }]
                    };
                }
                return item;
            });
            
            // Restore chat messages
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = `
                <div class="chat-bubble flex items-start space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-sm">
                        🧠
                    </div>
                    <div class="bg-gray-800 rounded-2xl rounded-tl-sm p-4 max-w-xs">
                        <p class="text-white">Hello! I'm MindMate, your AI wellness companion. I'm here to support your mental health journey. How are you feeling today?</p>
                    </div>
                </div>
            `;
            
            conversationContext.forEach(msg => {
                if (msg.role === 'user') {
                    addMessage(msg.parts[0].text, 'user');
                } else if (msg.role === 'model') {
                    addMessage(msg.parts[0].text, 'ai');
                }
            });
        }
}

// Handle Enter key in chat input
const chatInputEl = document.getElementById('chat-input');
if (chatInputEl) {
    chatInputEl.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}