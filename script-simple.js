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

        // Persona management
        document.getElementById('add-persona-btn').addEventListener('click', () => this.showAddPersonaModal());
        document.getElementById('add-persona-form').addEventListener('submit', (e) => this.handleAddPersona(e));
        document.getElementById('cancel-persona-btn').addEventListener('click', () => this.hideModal('add-persona-modal'));

        // File upload
        document.getElementById('file-upload').addEventListener('change', (e) => this.handleFileUpload(e));

        // Chat functionality
        document.getElementById('active-persona-select').addEventListener('change', (e) => this.selectPersona(e.target.value));
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clear-chat-btn').addEventListener('click', () => this.clearChat());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.hideModal(e.target.closest('.modal').id));
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModal(modal.id);
            });
        });
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

    // Modal functions
    showAddPersonaModal() {
        document.getElementById('add-persona-modal').classList.add('active');
        document.getElementById('persona-name').focus();
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    async handleAddPersona(e) {
        e.preventDefault();
        
        const name = document.getElementById('persona-name').value.trim();
        const description = document.getElementById('persona-description').value.trim();
        const inputMethod = document.getElementById('data-input-method').value;
        
        let chatData = '';
        
        if (inputMethod === 'text') {
            chatData = document.getElementById('chat-data').value.trim();
        } else {
            chatData = this.uploadedData || '';
        }
        
        const hasConsent = document.getElementById('consent-checkbox').checked;

        if (!hasConsent) {
            alert('You must confirm consent to use the data.');
            return;
        }

        if (!name || !chatData) {
            alert('Name and chat data are required.');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = 'Creating...';
        submitBtn.disabled = true;

        try {
            const persona = {
                id: Date.now().toString(),
                name,
                description,
                profile: {
                    tone: 'positive',
                    formality: 'neutral'
                },
                createdAt: new Date().toISOString()
            };

            this.personas.set(persona.id, persona);
            this.updateUI();
            this.hideModal('add-persona-modal');
            alert(`Persona "${name}" created successfully!`);
            
            // Reset form
            e.target.reset();
            this.uploadedData = '';
            document.getElementById('file-preview').innerHTML = '';
            
        } catch (error) {
            console.error('Error creating persona:', error);
            alert('Error creating persona: ' + error.message);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async handleFileUpload(e) {
        const files = Array.from(e.target.files);
        const preview = document.getElementById('file-preview');
        
        if (files.length === 0) return;

        preview.innerHTML = '<div style="color: #666;">Processing files...</div>';
        
        let allData = '';
        
        try {
            for (const file of files) {
                console.log('Processing file:', file.name, file.type);
                
                if (file.name.endsWith('.zip')) {
                    const zipData = await this.extractZipFile(file);
                    allData += zipData + '\n\n';
                } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.log') || file.name.endsWith('.md')) {
                    const textData = await this.readTextFile(file);
                    allData += textData + '\n\n';
                } else if (file.name.endsWith('.json')) {
                    const jsonData = await this.readJsonFile(file);
                    allData += jsonData + '\n\n';
                } else if (file.name.endsWith('.csv')) {
                    const csvData = await this.readCsvFile(file);
                    allData += csvData + '\n\n';
                } else {
                    console.warn('Unsupported file type:', file.name);
                }
            }
            
            this.uploadedData = allData;
            
            preview.innerHTML = `
                <div style="background: #e8f5e8; padding: 10px; border-radius: 5px; border: 1px solid #4caf50;">
                    <strong>✅ Files processed successfully!</strong><br>
                    <small>Extracted ${allData.length} characters of chat data from ${files.length} file(s)</small>
                </div>
            `;
            
        } catch (error) {
            console.error('Error processing files:', error);
            preview.innerHTML = `
                <div style="background: #fee; padding: 10px; border-radius: 5px; border: 1px solid #f44336;">
                    <strong>❌ Error processing files:</strong><br>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    async readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(new Error('Failed to read text file'));
            reader.readAsText(file);
        });
    }

    async readJsonFile(file) {
        const text = await this.readTextFile(file);
        try {
            const json = JSON.parse(text);
            // Convert JSON to readable text format
            if (Array.isArray(json)) {
                return json.map(item => {
                    if (typeof item === 'object') {
                        return Object.values(item).join(' ');
                    }
                    return String(item);
                }).join('\n');
            } else if (typeof json === 'object') {
                return Object.values(json).join('\n');
            }
            return text;
        } catch (error) {
            return text; // Return as plain text if JSON parsing fails
        }
    }

    async readCsvFile(file) {
        const text = await this.readTextFile(file);
        // Simple CSV parsing - convert to readable format
        const lines = text.split('\n');
        return lines.map(line => {
            const cells = line.split(',');
            return cells.join(' ');
        }).join('\n');
    }

    async extractZipFile(file) {
        try {
            const zip = new JSZip();
            const zipContent = await zip.loadAsync(file);
            let allText = '';
            
            for (const filename in zipContent.files) {
                const zipFile = zipContent.files[filename];
                
                if (!zipFile.dir) {
                    // Check if it's a text-based file
                    if (filename.endsWith('.txt') || 
                        filename.endsWith('.log') || 
                        filename.endsWith('.md') ||
                        filename.endsWith('.json') ||
                        filename.endsWith('.csv') ||
                        filename.includes('chat') ||
                        filename.includes('message') ||
                        filename.includes('conversation')) {
                        
                        try {
                            const content = await zipFile.async('text');
                            allText += `\n--- ${filename} ---\n${content}\n`;
                        } catch (error) {
                            console.warn(`Could not read file ${filename}:`, error);
                        }
                    }
                }
            }
            
            if (!allText) {
                throw new Error('No readable text files found in ZIP archive.');
            }
            
            return allText;
            
        } catch (error) {
            throw new Error(`Failed to extract ZIP file: ${error.message}`);
        }
    }
}

// Global function for HTML onclick
function toggleDataInput() {
    const method = document.getElementById('data-input-method').value;
    const textGroup = document.getElementById('text-input-group');
    const fileGroup = document.getElementById('file-input-group');
    
    if (method === 'file') {
        textGroup.style.display = 'none';
        fileGroup.style.display = 'block';
        document.getElementById('chat-data').removeAttribute('required');
    } else {
        textGroup.style.display = 'block';
        fileGroup.style.display = 'none';
        document.getElementById('chat-data').setAttribute('required', '');
    }
}

// Initialize the application
let personaForge;
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing PersonaForge...');
    personaForge = new PersonaForge();
    console.log('PersonaForge initialized');
});