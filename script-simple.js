// Simple PersonaForge - Minimal Working Version
class PersonaForge {
    constructor() {
        this.personas = new Map();
        this.activePersona = null;
        this.chatHistory = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDemoPersonas();
        this.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Chat functionality
        document.getElementById('active-persona-select').addEventListener('change', (e) => this.selectPersona(e.target.value));
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clear-chat-btn').addEventListener('click', () => this.clearChat());
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Update persona selector in chat tab
        if (tabName === 'chat') {
            this.updatePersonaSelector();
        }
    }

    updateUI() {
        this.renderPersonas();
        this.updatePersonaSelector();
    }

    renderPersonas() {
        const grid = document.getElementById('personas-grid');
        grid.innerHTML = '';

        if (this.personas.size === 0) {
            grid.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #6c757d;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No personas yet</h3>
                    <p>Demo personas loaded automatically!</p>
                </div>
            `;
            return;
        }

        this.personas.forEach(persona => {
            const card = document.createElement('div');
            card.className = 'persona-card';
            card.innerHTML = `
                <div class="persona-card-header">
                    <h3 class="persona-name">${persona.name}</h3>
                </div>
                <p class="persona-description">${persona.description || 'No description provided'}</p>
                <div class="persona-stats">
                    <span><i class="fas fa-calendar"></i> ${new Date(persona.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="persona-traits">
                    <span class="persona-trait">${persona.profile.tone}</span>
                    <span class="persona-trait">${persona.profile.formality}</span>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    updatePersonaSelector() {
        const select = document.getElementById('active-persona-select');
        select.innerHTML = '<option value="">Select a persona to chat with...</option>';
        
        this.personas.forEach(persona => {
            const option = document.createElement('option');
            option.value = persona.id;
            option.textContent = persona.name;
            select.appendChild(option);
        });
    }

    selectPersona(personaId) {
        console.log('Selecting persona:', personaId);
        
        if (!personaId) {
            this.activePersona = null;
            this.disableChat();
            return;
        }

        this.activePersona = this.personas.get(personaId);
        console.log('Active persona set to:', this.activePersona);
        
        this.enableChat();
        this.clearChat();
        this.addSystemMessage(`Now chatting as ${this.activePersona.name}!`);
    }

    enableChat() {
        document.getElementById('chat-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
    }

    disableChat() {
        document.getElementById('chat-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
    }

    sendMessage() {
        console.log('=== SEND MESSAGE CALLED ===');
        
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        console.log('Message:', message);
        console.log('Active persona:', this.activePersona ? this.activePersona.name : 'None');
        
        if (!message || !this.activePersona) {
            console.log('No message or no active persona');
            return;
        }

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Generate simple response
        console.log('About to generate response...');
        
        setTimeout(() => {
            console.log('Timeout executed, generating response...');
            
            const response = this.generateSimpleResponse(message);
            console.log('Response generated:', response);
            
            this.addMessage(response, 'persona');
            console.log('Response added to chat');
            
        }, 100); // Very short delay
    }

    generateSimpleResponse(userMessage) {
        console.log('generateSimpleResponse called with:', userMessage);
        
        const persona = this.activePersona;
        if (!persona) {
            return "I'm not available right now.";
        }

        const message = userMessage.toLowerCase();
        
        // Simple response logic
        if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
            if (persona.id === 'demo-alex') {
                return "Hey there! Great to hear from you! 😍";
            } else {
                return "Hello! How are you doing?";
            }
        }
        
        if (message.includes('how are you') || message.includes('how\'re you')) {
            if (persona.id === 'demo-alex') {
                return "I'm doing awesome! Just been coding and stuff. How about you? 🚀";
            } else {
                return "I am doing well, thank you for asking. How are you feeling today?";
            }
        }
        
        if (message.includes('?')) {
            if (persona.id === 'demo-alex') {
                return "That's a good question! What do you think? 😂";
            } else {
                return "That is an interesting question. What are your thoughts on this?";
            }
        }
        
        // Default responses
        if (persona.id === 'demo-alex') {
            const alexResponses = [
                "That's so cool! Tell me more! 🤯",
                "OMG yes! I totally get that! 😂",
                "Dude, that's awesome! 🚀",
                "LOL, I love talking about this stuff! 😍"
            ];
            return alexResponses[Math.floor(Math.random() * alexResponses.length)];
        } else {
            const sarahResponses = [
                "That is really interesting. I would love to hear more about your thoughts.",
                "I appreciate you sharing that with me. What is your perspective on this?",
                "That sounds fascinating. Please tell me more about your experience.",
                "Thank you for bringing that up. I find it quite thought-provoking."
            ];
            return sarahResponses[Math.floor(Math.random() * sarahResponses.length)];
        }
    }

    addMessage(content, sender) {
        console.log('Adding message:', content, 'from:', sender);
        
        const messagesContainer = document.getElementById('chat-messages');
        
        // Remove welcome message if it exists
        const welcomeMsg = messagesContainer.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = sender === 'user' ? 'U' : this.activePersona.name.charAt(0).toUpperCase();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Store in chat history
        this.chatHistory.push({ content, sender, timestamp: new Date().toISOString() });
        
        console.log('Message added successfully');
    }

    addSystemMessage(content) {
        const messagesContainer = document.getElementById('chat-messages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.style.justifyContent = 'center';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.style.background = '#e3f2fd';
        messageContent.style.color = '#1976d2';
        messageContent.style.fontStyle = 'italic';
        messageContent.textContent = content;
        
        messageDiv.appendChild(messageContent);
        messagesContainer.appendChild(messageDiv);
        
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    clearChat() {
        const messagesContainer = document.getElementById('chat-messages');
        if (this.activePersona) {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-robot"></i>
                    <p>Start a conversation with ${this.activePersona.name}!</p>
                </div>
            `;
        } else {
            messagesContainer.innerHTML = `
                <div class="welcome-message">
                    <i class="fas fa-robot"></i>
                    <p>Select a persona from the dropdown above to start chatting!</p>
                </div>
            `;
        }
        this.chatHistory = [];
    }

    loadDemoPersonas() {
        const demoPersonas = [
            {
                id: 'demo-alex',
                name: 'Alex',
                description: 'A friendly, tech-savvy person who loves gaming and memes',
                profile: {
                    tone: 'positive',
                    formality: 'informal'
                },
                createdAt: new Date().toISOString()
            },
            {
                id: 'demo-sarah',
                name: 'Sarah',
                description: 'A professional, thoughtful person who enjoys reading and nature',
                profile: {
                    tone: 'positive',
                    formality: 'formal'
                },
                createdAt: new Date().toISOString()
            }
        ];

        demoPersonas.forEach(persona => {
            this.personas.set(persona.id, persona);
        });

        console.log('Demo personas loaded:', this.personas.size);
    }
}

// Initialize the application
let personaForge;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PersonaForge...');
    personaForge = new PersonaForge();
    console.log('PersonaForge initialized');
});