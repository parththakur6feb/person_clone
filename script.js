// PersonaForge Application
class PersonaForge {
    constructor() {
        this.personas = new Map();
        this.activePersona = null;
        this.settings = {
            safetyLevel: 'medium',
            faithfulnessLevel: 'high'
        };
        this.chatHistory = [];
        
        this.init();
    }

    init() {
        this.loadData();
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

        // Chat functionality
        document.getElementById('active-persona-select').addEventListener('change', (e) => this.selectPersona(e.target.value));
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('clear-chat-btn').addEventListener('click', () => this.clearChat());

        // Settings
        document.getElementById('safety-level').addEventListener('change', (e) => this.updateSetting('safetyLevel', e.target.value));
        document.getElementById('faithfulness-level').addEventListener('change', (e) => this.updateSetting('faithfulnessLevel', e.target.value));
        document.getElementById('delete-all-data-btn').addEventListener('click', () => this.deleteAllData());

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
        const chatData = document.getElementById('chat-data').value.trim();
        const hasConsent = document.getElementById('consent-checkbox').checked;

        if (!hasConsent) {
            this.showAlert('You must confirm consent to use the data.', 'error');
            return;
        }

        if (!name || !chatData) {
            this.showAlert('Name and chat data are required.', 'error');
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="loading"></div> Creating...';
        submitBtn.disabled = true;

        try {
            // Analyze the chat data to extract persona traits
            const personaProfile = await this.analyzePersonaData(chatData);
            
            const persona = {
                id: Date.now().toString(),
                name,
                description,
                chatData,
                profile: personaProfile,
                createdAt: new Date().toISOString(),
                consentConfirmed: true
            };

            this.personas.set(persona.id, persona);
            this.saveData();
            this.updateUI();
            this.hideModal('add-persona-modal');
            this.showAlert(`Persona "${name}" created successfully!`, 'success');
            
            // Reset form
            e.target.reset();
            
        } catch (error) {
            console.error('Error creating persona:', error);
            this.showAlert('Error creating persona: ' + error.message, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async analyzePersonaData(chatData) {
        // Simulate analysis delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Extract comprehensive traits from the chat data
        const traits = {
            tone: this.analyzeTone(chatData),
            commonPhrases: this.extractCommonPhrases(chatData),
            emojiUsage: this.analyzeEmojiUsage(chatData),
            averageMessageLength: this.calculateAverageMessageLength(chatData),
            interests: this.extractInterests(chatData),
            humor: this.analyzeHumor(chatData),
            formality: this.analyzeFormality(chatData),
            personality: this.analyzePersonality(chatData),
            vocabulary: this.analyzeVocabulary(chatData),
            responsePatterns: this.analyzeResponsePatterns(chatData)
        };

        return traits;
    }

    analyzeTone(text) {
        const positiveWords = ['great', 'awesome', 'amazing', 'love', 'happy', 'excited', 'wonderful', 'fantastic'];
        const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'sad', 'awful', 'horrible', 'disappointed'];
        
        const words = text.toLowerCase().split(/\s+/);
        let positive = 0, negative = 0;

        words.forEach(word => {
            if (positiveWords.some(w => word.includes(w))) positive++;
            else if (negativeWords.some(w => word.includes(w))) negative++;
        });

        if (positive > negative) return 'positive';
        if (negative > positive) return 'negative';
        return 'neutral';
    }

    extractCommonPhrases(text) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const phrases = {};
        
        // Count 2-word phrases
        for (let i = 0; i < words.length - 1; i++) {
            const phrase = `${words[i]} ${words[i+1]}`;
            phrases[phrase] = (phrases[phrase] || 0) + 1;
        }

        return Object.entries(phrases)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([phrase, count]) => phrase);
    }

    analyzeEmojiUsage(text) {
        const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = text.match(emojiRegex) || [];
        return {
            frequency: emojis.length / (text.split(/\s+/).length || 1),
            common: [...new Set(emojis)].slice(0, 5)
        };
    }

    calculateAverageMessageLength(text) {
        const messages = text.split(/[\n\r]+/).filter(msg => msg.trim().length > 0);
        const totalLength = messages.reduce((sum, msg) => sum + msg.trim().length, 0);
        return Math.round(totalLength / messages.length) || 0;
    }

    extractInterests(text) {
        const interestKeywords = {
            'technology': ['tech', 'computer', 'software', 'app', 'coding', 'programming', 'ai', 'internet'],
            'sports': ['game', 'team', 'player', 'match', 'football', 'basketball', 'soccer', 'tennis'],
            'music': ['song', 'music', 'band', 'concert', 'album', 'artist', 'lyrics', 'guitar'],
            'food': ['food', 'restaurant', 'cooking', 'recipe', 'delicious', 'taste', 'meal', 'dinner'],
            'travel': ['travel', 'trip', 'vacation', 'hotel', 'flight', 'beach', 'city', 'country'],
            'movies': ['movie', 'film', 'cinema', 'actor', 'director', 'netflix', 'watch', 'series']
        };

        const textLower = text.toLowerCase();
        const interests = [];

        Object.entries(interestKeywords).forEach(([interest, keywords]) => {
            const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
            if (matches > 0) {
                interests.push({ name: interest, score: matches });
            }
        });

        return interests.sort((a, b) => b.score - a.score).slice(0, 3).map(i => i.name);
    }

    analyzeHumor(text) {
        const humorIndicators = ['lol', 'haha', 'funny', 'joke', '😂', '😄', '😆', 'lmao', 'rofl'];
        const humorCount = humorIndicators.reduce((count, indicator) => {
            return count + (text.toLowerCase().split(indicator).length - 1);
        }, 0);
        
        return humorCount > 3 ? 'high' : humorCount > 0 ? 'medium' : 'low';
    }

    analyzeFormality(text) {
        const formalWords = ['please', 'thank you', 'sincerely', 'regards', 'would', 'could', 'should'];
        const informalWords = ['hey', 'yo', 'sup', 'gonna', 'wanna', 'gotta', 'yeah', 'nah'];
        
        const formalCount = formalWords.reduce((count, word) => count + (text.toLowerCase().split(word).length - 1), 0);
        const informalCount = informalWords.reduce((count, word) => count + (text.toLowerCase().split(word).length - 1), 0);
        
        if (formalCount > informalCount) return 'formal';
        if (informalCount > formalCount) return 'informal';
        return 'neutral';
    }

    analyzePersonality(text) {
        const personalityTraits = {
            extroverted: ['excited', 'party', 'friends', 'social', 'meet', 'together', 'group', 'fun'],
            introverted: ['quiet', 'alone', 'reading', 'home', 'peaceful', 'calm', 'solitude', 'thinking'],
            analytical: ['analyze', 'think', 'consider', 'logic', 'reason', 'understand', 'examine', 'study'],
            creative: ['imagine', 'creative', 'art', 'design', 'inspire', 'beautiful', 'unique', 'original'],
            empathetic: ['feel', 'understand', 'care', 'support', 'help', 'listen', 'comfort', 'compassion']
        };

        const scores = {};
        Object.keys(personalityTraits).forEach(trait => {
            scores[trait] = personalityTraits[trait].reduce((count, word) => 
                count + (text.toLowerCase().split(word).length - 1), 0);
        });

        return Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([trait, score]) => trait);
    }

    analyzeVocabulary(text) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
        const uniqueWords = new Set(words);
        const totalWords = words.length;
        
        const diversity = uniqueWords.size / totalWords;
        const complexWords = words.filter(word => word.length > 6);
        const complexity = complexWords.length / totalWords;
        
        const slangWords = ['lol', 'omg', 'btw', 'tbh', 'imo', 'fr', 'ngl', 'lowkey', 'highkey'];
        const slangCount = slangWords.reduce((count, word) => count + (text.toLowerCase().split(word).length - 1), 0);
        
        return {
            diversity: Math.round(diversity * 100) / 100,
            complexity: Math.round(complexity * 100) / 100,
            slangUsage: slangCount,
            level: complexity > 0.3 ? 'advanced' : complexity > 0.15 ? 'intermediate' : 'basic'
        };
    }

    analyzeResponsePatterns(text) {
        const messages = text.split(/[\n\r]+/).filter(msg => msg.trim().length > 0);
        
        const patterns = {
            questionAsking: 0,
            exclamationUsage: 0,
            ellipsisUsage: 0
        };

        messages.forEach(message => {
            const trimmed = message.trim();
            if (trimmed.includes('?')) patterns.questionAsking++;
            if (trimmed.includes('!')) patterns.exclamationUsage++;
            if (trimmed.includes('...')) patterns.ellipsisUsage++;
        });

        return {
            questionFrequency: patterns.questionAsking / messages.length,
            exclamationFrequency: patterns.exclamationUsage / messages.length,
            ellipsisFrequency: patterns.ellipsisUsage / messages.length
        };
    }

    updateUI() {
        this.renderPersonas();
        this.updatePersonaSelector();
        this.updateSettings();
    }

    renderPersonas() {
        const grid = document.getElementById('personas-grid');
        grid.innerHTML = '';

        if (this.personas.size === 0) {
            grid.innerHTML = `
                <div class="no-personas" style="text-align: center; padding: 3rem; color: #6c757d;">
                    <i class="fas fa-users" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No personas yet</h3>
                    <p>Click "Add New Persona" to create your first digital persona!</p>
                </div>
            `;
            return;
        }

        this.personas.forEach(persona => {
            const card = this.createPersonaCard(persona);
            grid.appendChild(card);
        });
    }

    createPersonaCard(persona) {
        const card = document.createElement('div');
        card.className = 'persona-card';
        card.innerHTML = `
            <div class="persona-card-header">
                <h3 class="persona-name">${persona.name}</h3>
                <div class="persona-actions">
                    <button class="btn btn-sm btn-secondary" onclick="personaForge.viewPersonaDetails('${persona.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="personaForge.deletePersona('${persona.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="persona-description">${persona.description || 'No description provided'}</p>
            <div class="persona-stats">
                <span><i class="fas fa-calendar"></i> ${new Date(persona.createdAt).toLocaleDateString()}</span>
                <span><i class="fas fa-comments"></i> ${persona.profile.averageMessageLength} chars avg</span>
            </div>
            <div class="persona-traits">
                <span class="persona-trait">${persona.profile.tone}</span>
                <span class="persona-trait">${persona.profile.formality}</span>
                <span class="persona-trait">${persona.profile.humor} humor</span>
            </div>
        `;
        return card;
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
        if (!personaId) {
            this.activePersona = null;
            this.disableChat();
            return;
        }

        this.activePersona = this.personas.get(personaId);
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
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (!message || !this.activePersona) return;

        // Add user message
        this.addMessage(message, 'user');
        input.value = '';

        // Generate persona response with error handling
        setTimeout(() => {
            try {
                console.log('Generating response for:', message);
                const response = this.generatePersonaResponse(message);
                console.log('Generated response:', response);
                this.addMessage(response, 'persona');
            } catch (error) {
                console.error('Error generating response:', error);
                this.addMessage("Sorry, I'm having trouble responding right now. Can you try again?", 'persona');
            }
        }, 500); // Much shorter delay for testing
    }

    generatePersonaResponse(userMessage) {
        try {
            const persona = this.activePersona;
            if (!persona || !persona.profile) {
                return "I'm not sure how to respond to that.";
            }
            
            const profile = persona.profile;
            
            // Simple but effective response generation
            const messageContext = this.analyzeMessageContext(userMessage);
            let response = this.getBaseResponse(messageContext, profile);
            
            // Apply persona traits
            response = this.applyPersonaTraits(response, profile);
            
            return response || "That's interesting! Tell me more.";
            
        } catch (error) {
            console.error('Error in generatePersonaResponse:', error);
            return "I'm having trouble understanding. Can you rephrase that?";
        }
    }

    analyzeMessageContext(userMessage) {
        try {
            const message = userMessage.toLowerCase();
            
            return {
                isQuestion: message.includes('?'),
                isGreeting: /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(message),
                isGoodbye: /^(bye|goodbye|see you|talk to you later)/.test(message),
                isPositive: ['great', 'awesome', 'amazing', 'love', 'happy', 'excited'].some(word => message.includes(word)),
                isNegative: ['bad', 'terrible', 'hate', 'angry', 'sad', 'awful'].some(word => message.includes(word)),
                topics: this.detectTopics(message)
            };
        } catch (error) {
            console.error('Error in analyzeMessageContext:', error);
            return {
                isQuestion: false,
                isGreeting: false,
                isGoodbye: false,
                isPositive: false,
                isNegative: false,
                topics: []
            };
        }
    }

    detectTopics(message) {
        try {
            const topics = [];
            const topicKeywords = {
                technology: ['tech', 'computer', 'phone', 'app', 'software', 'internet', 'coding', 'ai'],
                entertainment: ['movie', 'music', 'game', 'book', 'show', 'fun', 'play'],
                work: ['work', 'job', 'career', 'office', 'meeting', 'project'],
                personal: ['family', 'friend', 'relationship', 'personal']
            };
            
            Object.entries(topicKeywords).forEach(([topic, keywords]) => {
                if (keywords.some(keyword => message.includes(keyword))) {
                    topics.push(topic);
                }
            });
            
            return topics;
        } catch (error) {
            console.error('Error in detectTopics:', error);
            return [];
        }
    }

    getBaseResponse(context, profile) {
        try {
            // Handle greetings
            if (context.isGreeting) {
                const greetings = {
                    positive: ["Hey there! Great to hear from you!", "Hi! I'm so excited to chat!", "Hello! This is awesome!"],
                    neutral: ["Hello! How are you doing?", "Hi there! What's on your mind?", "Hey! Good to see you."],
                    negative: ["Hi... I'm here if you need to talk.", "Hello. What's going on?", "Hey. Everything okay?"]
                };
                const responses = greetings[profile.tone] || greetings.neutral;
                return responses[Math.floor(Math.random() * responses.length)];
            }
        
        // Handle goodbyes
        if (context.isGoodbye) {
            const goodbyes = {
                positive: ["Bye! It was awesome talking!", "See you later! This was fun!", "Goodbye! Take care!"],
                neutral: ["Goodbye! Talk to you later.", "See you around!", "Bye! Take care."],
                negative: ["Bye... hope things get better.", "Goodbye. Take care of yourself.", "See you later..."]
            };
            const responses = goodbyes[profile.tone] || goodbyes.neutral;
            return responses[Math.floor(Math.random() * responses.length)];
        }
        
        // Handle questions
        if (context.isQuestion) {
            const questions = [
                "That's a good question! What made you think of that?",
                "I'm curious about that too. What's your perspective?",
                "Interesting question! I'd love to hear your thoughts.",
                "Good question! What do you think about it?",
                "That's something I've wondered about too!"
            ];
            return questions[Math.floor(Math.random() * questions.length)];
        }
        
        // Handle topic-based responses
        if (context.topics.length > 0) {
            const topic = context.topics[0];
            if (profile.interests && profile.interests.includes(topic)) {
                const passionate = [
                    "Oh wow, I love talking about this! Tell me more!",
                    "This is totally my thing! I'm so excited you brought this up!",
                    "I'm passionate about this topic! What's your experience?",
                    "Yes! This is one of my favorite subjects!"
                ];
                return passionate[Math.floor(Math.random() * passionate.length)];
            }
        }
        
        // Handle emotional responses
        if (context.isPositive) {
            const positive = [
                "That sounds amazing! I'm so happy for you!",
                "Wow, that's fantastic! Tell me more!",
                "I love hearing good news like this!",
                "That's wonderful! You must be thrilled!"
            ];
            return positive[Math.floor(Math.random() * positive.length)];
        }
        
        if (context.isNegative) {
            const negative = [
                "I'm sorry to hear that. Want to talk about it?",
                "That sounds really tough. I'm here for you.",
                "I can imagine how difficult that must be.",
                "That's hard. How are you dealing with it?"
            ];
            return negative[Math.floor(Math.random() * negative.length)];
        }
        
            // Default responses
            const defaults = [
                "That's really interesting! Tell me more about that.",
                "I'd love to hear more about your thoughts on this.",
                "That's fascinating! What's your take on it?",
                "I'm curious about that. How do you feel about it?",
                "That's cool! What made you think of that?"
            ];
            return defaults[Math.floor(Math.random() * defaults.length)];
            
        } catch (error) {
            console.error('Error in getBaseResponse:', error);
            return "That's interesting! Tell me more.";
        }
    }

    applyPersonaTraits(response, profile) {
        try {
            if (!response || !profile) return response || "I'm not sure what to say.";
            
            // Apply formality
            if (profile.formality === 'formal') {
                response = response.replace(/I'm/g, 'I am')
                                  .replace(/don't/g, 'do not')
                                  .replace(/can't/g, 'cannot');
            } else if (profile.formality === 'informal') {
                response = response.replace(/I am/g, "I'm")
                                  .replace(/do not/g, "don't")
                                  .replace(/cannot/g, "can't");
            }
            
            // Add exclamations for high excitement
            if (profile.responsePatterns && profile.responsePatterns.exclamationFrequency > 0.3) {
                if (!response.includes('!') && Math.random() < 0.5) {
                    response = response.replace(/\.$/, '!');
                }
            }
            
            // Add emojis if persona uses them
            if (profile.emojiUsage && profile.emojiUsage.frequency > 0.1) {
                const emojis = profile.emojiUsage.common;
                if (emojis && emojis.length > 0 && Math.random() < 0.4) {
                    response += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
                }
            }
            
            // Add common phrases occasionally
            if (profile.commonPhrases && profile.commonPhrases.length > 0 && Math.random() < 0.3) {
                const phrase = profile.commonPhrases[Math.floor(Math.random() * profile.commonPhrases.length)];
                if (Math.random() < 0.5) {
                    response = phrase + ', ' + response.toLowerCase();
                } else {
                    response = response + ' ' + phrase + '!';
                }
            }
            
            return response;
            
        } catch (error) {
            console.error('Error in applyPersonaTraits:', error);
            return response || "I'm not sure what to say.";
        }
    }

    addMessage(content, sender) {
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

    viewPersonaDetails(personaId) {
        const persona = this.personas.get(personaId);
        if (!persona) return;

        const modal = document.getElementById('persona-details-modal');
        const title = document.getElementById('persona-details-title');
        const content = document.getElementById('persona-details-content');

        title.textContent = `${persona.name} - Details`;
        
        content.innerHTML = `
            <div class="persona-profile">
                <h4>Persona Profile</h4>
                <div class="persona-traits">
                    <span class="persona-trait">Tone: ${persona.profile.tone}</span>
                    <span class="persona-trait">Formality: ${persona.profile.formality}</span>
                    <span class="persona-trait">Humor: ${persona.profile.humor}</span>
                    <span class="persona-trait">Avg Length: ${persona.profile.averageMessageLength} chars</span>
                </div>
                
                <h5>Common Phrases:</h5>
                <p>${persona.profile.commonPhrases.join(', ') || 'None detected'}</p>
                
                <h5>Interests:</h5>
                <p>${persona.profile.interests.join(', ') || 'None detected'}</p>
                
                <h5>Personality Traits:</h5>
                <p>${persona.profile.personality.join(', ') || 'None detected'}</p>
            </div>
            
            <div class="persona-info">
                <h4>Information</h4>
                <p><strong>Description:</strong> ${persona.description || 'No description'}</p>
                <p><strong>Created:</strong> ${new Date(persona.createdAt).toLocaleString()}</p>
                <p><strong>Consent Confirmed:</strong> ${persona.consentConfirmed ? 'Yes' : 'No'}</p>
            </div>
        `;

        modal.classList.add('active');
    }

    deletePersona(personaId) {
        const persona = this.personas.get(personaId);
        if (!persona) return;

        if (confirm(`Are you sure you want to delete "${persona.name}"? This action cannot be undone.`)) {
            this.personas.delete(personaId);
            this.saveData();
            this.updateUI();
            
            if (this.activePersona && this.activePersona.id === personaId) {
                this.activePersona = null;
                this.disableChat();
                document.getElementById('active-persona-select').value = '';
            }
            
            this.showAlert(`Persona "${persona.name}" deleted successfully.`, 'success');
        }
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveData();
    }

    updateSettings() {
        document.getElementById('safety-level').value = this.settings.safetyLevel;
        document.getElementById('faithfulness-level').value = this.settings.faithfulnessLevel;
    }

    deleteAllData() {
        if (confirm('Are you sure you want to delete ALL data? This will permanently remove all personas and chat history. This action cannot be undone.')) {
            this.personas.clear();
            this.chatHistory = [];
            this.activePersona = null;
            this.saveData();
            this.updateUI();
            this.disableChat();
            this.showAlert('All data has been deleted successfully.', 'success');
        }
    }

    loadDemoPersonas() {
        if (this.personas.size > 0) return; // Don't load demo if user has personas

        const demoPersonas = [
            {
                id: 'demo-alex',
                name: 'Alex',
                description: 'A friendly, tech-savvy person who loves gaming and memes',
                chatData: `Hey! How's it going? I just finished playing this amazing new game. The graphics are insane! 😍

Lol, you should totally check it out. It's got this cool multiplayer mode where you can team up with friends.

I'm so excited about the new tech conference next month. Gonna be epic! 🚀

BTW, did you see that new AI tool everyone's talking about? It's pretty wild what it can do.

Haha, I spent like 3 hours yesterday just messing around with it. So much fun! 😂

Yeah, I'm really into coding and stuff. Been working on this side project for a while now.

OMG, you have to try this new app I found! It's absolutely mind-blowing! 🤯

I'm always down to talk about tech stuff. It's literally my passion!`,
                profile: {
                    tone: 'positive',
                    commonPhrases: ['hey', 'how\'s it going', 'totally check', 'so excited', 'pretty wild', 'gonna be epic', 'btw', 'omg'],
                    emojiUsage: { frequency: 0.18, common: ['😍', '🚀', '😂', '🤯'] },
                    averageMessageLength: 42,
                    interests: ['technology', 'entertainment'],
                    humor: 'high',
                    formality: 'informal',
                    personality: ['extroverted', 'analytical'],
                    vocabulary: { diversity: 0.75, complexity: 0.12, slangUsage: 8, level: 'intermediate' },
                    responsePatterns: { questionFrequency: 0.15, exclamationFrequency: 0.45, ellipsisFrequency: 0.05 }
                },
                createdAt: new Date().toISOString(),
                consentConfirmed: true
            },
            {
                id: 'demo-sarah',
                name: 'Sarah',
                description: 'A professional, thoughtful person who enjoys reading and nature',
                chatData: `Good morning! I hope you're having a wonderful day. I just finished reading this fascinating book about mindfulness and meditation.

The author makes some really compelling points about the importance of being present in the moment. I've been trying to incorporate some of these practices into my daily routine.

I went for a lovely walk in the park yesterday. The autumn colors are absolutely breathtaking this year. There's something so peaceful about being surrounded by nature.

I'm planning to start a book club with some friends. We're thinking of reading some classic literature and contemporary fiction. Would you be interested in joining us?

I find that reading helps me unwind after a long day at work. There's nothing quite like getting lost in a good story.

Thank you for sharing that with me. I really appreciate your perspective on this topic.

I believe that meaningful conversations are one of life's greatest pleasures. What are your thoughts on this?

I would love to hear more about your experiences. Please feel free to share whatever you're comfortable with.`,
                profile: {
                    tone: 'positive',
                    commonPhrases: ['good morning', 'hope you\'re having', 'really compelling', 'absolutely breathtaking', 'thank you for sharing', 'i believe that', 'i would love to'],
                    emojiUsage: { frequency: 0.01, common: [] },
                    averageMessageLength: 85,
                    interests: ['movies'],
                    humor: 'low',
                    formality: 'formal',
                    personality: ['introverted', 'empathetic'],
                    vocabulary: { diversity: 0.88, complexity: 0.28, slangUsage: 0, level: 'advanced' },
                    responsePatterns: { questionFrequency: 0.25, exclamationFrequency: 0.05, ellipsisFrequency: 0.0 }
                },
                createdAt: new Date().toISOString(),
                consentConfirmed: true
            }
        ];

        demoPersonas.forEach(persona => {
            this.personas.set(persona.id, persona);
        });

        this.saveData();
    }

    showAlert(message, type = 'info') {
        // Remove existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());

        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Insert at the top of the current tab content
        const activeTab = document.querySelector('.tab-content.active');
        activeTab.insertBefore(alert, activeTab.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    saveData() {
        const data = {
            personas: Array.from(this.personas.entries()),
            settings: this.settings,
            chatHistory: this.chatHistory
        };
        localStorage.setItem('personaForge', JSON.stringify(data));
    }

    loadData() {
        try {
            const data = localStorage.getItem('personaForge');
            if (data) {
                const parsed = JSON.parse(data);
                
                if (parsed.personas) {
                    this.personas = new Map(parsed.personas);
                }
                
                if (parsed.settings) {
                    this.settings = { ...this.settings, ...parsed.settings };
                }
                
                if (parsed.chatHistory) {
                    this.chatHistory = parsed.chatHistory;
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
}

// Initialize the application
let personaForge;
document.addEventListener('DOMContentLoaded', () => {
    personaForge = new PersonaForge();
});