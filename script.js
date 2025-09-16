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
        
        const formData = new FormData(e.target);
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
            responsePatterns: this.analyzeResponsePatterns(chatData),
            emotionalRange: this.analyzeEmotionalRange(chatData),
            communicationStyle: this.analyzeCommunicationStyle(chatData)
        };

        return traits;
    }

    analyzeTone(text) {
        const positiveWords = ['great', 'awesome', 'amazing', 'love', 'happy', 'excited', 'wonderful', 'fantastic'];
        const negativeWords = ['bad', 'terrible', 'hate', 'angry', 'sad', 'awful', 'horrible', 'disappointed'];
        const neutralWords = ['okay', 'fine', 'alright', 'sure', 'maybe', 'probably'];

        const words = text.toLowerCase().split(/\s+/);
        let positive = 0, negative = 0, neutral = 0;

        words.forEach(word => {
            if (positiveWords.some(w => word.includes(w))) positive++;
            else if (negativeWords.some(w => word.includes(w))) negative++;
            else if (neutralWords.some(w => word.includes(w))) neutral++;
        });

        if (positive > negative && positive > neutral) return 'positive';
        if (negative > positive && negative > neutral) return 'negative';
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
            empathetic: ['feel', 'understand', 'care', 'support', 'help', 'listen', 'comfort', 'compassion'],
            practical: ['practical', 'useful', 'efficient', 'work', 'task', 'organize', 'plan', 'system']
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
        
        // Calculate vocabulary diversity
        const diversity = uniqueWords.size / totalWords;
        
        // Identify complex words (longer than 6 characters)
        const complexWords = words.filter(word => word.length > 6);
        const complexity = complexWords.length / totalWords;
        
        // Identify slang and casual language
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
            ellipsisUsage: 0,
            capitalization: 0,
            shortResponses: 0,
            longResponses: 0
        };

        messages.forEach(message => {
            const trimmed = message.trim();
            
            if (trimmed.includes('?')) patterns.questionAsking++;
            if (trimmed.includes('!')) patterns.exclamationUsage++;
            if (trimmed.includes('...')) patterns.ellipsisUsage++;
            if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) patterns.capitalization++;
            if (trimmed.length < 20) patterns.shortResponses++;
            if (trimmed.length > 100) patterns.longResponses++;
        });

        return {
            questionFrequency: patterns.questionAsking / messages.length,
            exclamationFrequency: patterns.exclamationUsage / messages.length,
            ellipsisFrequency: patterns.ellipsisUsage / messages.length,
            capsFrequency: patterns.capitalization / messages.length,
            shortResponseRatio: patterns.shortResponses / messages.length,
            longResponseRatio: patterns.longResponses / messages.length
        };
    }

    analyzeEmotionalRange(text) {
        const emotions = {
            joy: ['happy', 'excited', 'joy', 'cheerful', 'delighted', 'thrilled', 'ecstatic'],
            sadness: ['sad', 'depressed', 'down', 'blue', 'melancholy', 'gloomy', 'sorrowful'],
            anger: ['angry', 'mad', 'furious', 'irritated', 'annoyed', 'rage', 'livid'],
            fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified', 'panic'],
            surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'bewildered'],
            disgust: ['disgusted', 'revolted', 'sickened', 'repulsed', 'appalled', 'horrified']
        };

        const emotionScores = {};
        Object.keys(emotions).forEach(emotion => {
            emotionScores[emotion] = emotions[emotion].reduce((count, word) => 
                count + (text.toLowerCase().split(word).length - 1), 0);
        });

        const totalEmotions = Object.values(emotionScores).reduce((sum, score) => sum + score, 0);
        const dominantEmotions = Object.entries(emotionScores)
            .filter(([emotion, score]) => score > 0)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([emotion, score]) => ({ emotion, intensity: score / totalEmotions }));

        return {
            dominantEmotions,
            emotionalDiversity: dominantEmotions.length,
            overallIntensity: totalEmotions / (text.split(/\s+/).length || 1)
        };
    }

    analyzeCommunicationStyle(text) {
        const styles = {
            direct: ['yes', 'no', 'definitely', 'absolutely', 'never', 'always', 'sure'],
            indirect: ['maybe', 'perhaps', 'might', 'could be', 'possibly', 'sort of', 'kind of'],
            supportive: ['great', 'wonderful', 'amazing', 'love it', 'perfect', 'excellent', 'fantastic'],
            critical: ['but', 'however', 'although', 'despite', 'unfortunately', 'problem', 'issue'],
            collaborative: ['we', 'us', 'together', 'team', 'group', 'let\'s', 'our'],
            individual: ['i', 'me', 'my', 'mine', 'myself', 'personally', 'individually']
        };

        const styleScores = {};
        Object.keys(styles).forEach(style => {
            styleScores[style] = styles[style].reduce((count, word) => 
                count + (text.toLowerCase().split(word).length - 1), 0);
        });

        return Object.entries(styleScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([style, score]) => style);
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
                <div class="no-personas">
                    <i class="fas fa-users" style="font-size: 3rem; color: #6c757d; opacity: 0.5; margin-bottom: 1rem;"></i>
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

        // Generate persona response
        setTimeout(() => {
            const response = this.generatePersonaResponse(message);
            this.addMessage(response, 'persona');
        }, 1000 + Math.random() * 2000); // Simulate thinking time
    }

    generatePersonaResponse(userMessage) {
        const persona = this.activePersona;
        const profile = persona.profile;
        
        // Analyze the user's message to understand context
        const messageContext = this.analyzeMessageContext(userMessage);
        
        // Check for conversation history to maintain context
        const conversationContext = this.getConversationContext();
        
        // Generate response based on persona's comprehensive traits
        let response = this.generateContextualResponse(userMessage, messageContext, profile, conversationContext);
        
        // Apply persona's communication patterns
        response = this.applyPersonaPatterns(response, profile);
        
        // Add personality-specific elements
        response = this.addPersonalityElements(response, profile);
        
        // Ensure response matches persona's style
        response = this.finalizePersonaStyle(response, profile);
        
        return response;
    }

    getConversationContext() {
        // Get recent conversation history for context
        const recentMessages = this.chatHistory.slice(-4); // Last 4 messages
        return {
            recentMessages,
            conversationLength: this.chatHistory.length,
            lastUserMessage: recentMessages.filter(msg => msg.sender === 'user').pop(),
            lastPersonaMessage: recentMessages.filter(msg => msg.sender === 'persona').pop()
        };
    }

    analyzeMessageContext(userMessage) {
        const message = userMessage.toLowerCase();
        
        // Detect question types
        const isQuestion = message.includes('?');
        const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)/.test(message);
        const isGoodbye = /^(bye|goodbye|see you|talk to you later)/.test(message);
        
        // Detect topics
        const topics = [];
        const topicKeywords = {
            work: ['work', 'job', 'career', 'office', 'meeting', 'project'],
            personal: ['family', 'friend', 'relationship', 'personal', 'private'],
            entertainment: ['movie', 'music', 'game', 'book', 'show', 'fun'],
            technology: ['tech', 'computer', 'phone', 'app', 'software', 'internet'],
            food: ['food', 'eat', 'restaurant', 'cooking', 'meal', 'hungry'],
            travel: ['travel', 'trip', 'vacation', 'holiday', 'flight', 'hotel']
        };
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            if (keywords.some(keyword => message.includes(keyword))) {
                topics.push(topic);
            }
        });
        
        // Detect emotional context
        const emotionalContext = {
            positive: ['great', 'awesome', 'amazing', 'love', 'happy', 'excited', 'wonderful'],
            negative: ['bad', 'terrible', 'hate', 'angry', 'sad', 'awful', 'horrible', 'problem'],
            neutral: ['okay', 'fine', 'alright', 'sure', 'maybe', 'probably']
        };
        
        let detectedEmotion = 'neutral';
        Object.entries(emotionalContext).forEach(([emotion, words]) => {
            if (words.some(word => message.includes(word))) {
                detectedEmotion = emotion;
            }
        });
        
        return {
            isQuestion,
            isGreeting,
            isGoodbye,
            topics,
            emotionalContext: detectedEmotion,
            messageLength: userMessage.length,
            hasExclamation: userMessage.includes('!'),
            hasEmojis: /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(userMessage)
        };
    }

    generateContextualResponse(userMessage, context, profile, conversationContext) {
        // Start with persona's common phrases if applicable
        let response = '';
        
        // Handle greetings
        if (context.isGreeting) {
            response = this.generateGreetingResponse(profile, conversationContext);
        }
        // Handle goodbyes
        else if (context.isGoodbye) {
            response = this.generateGoodbyeResponse(profile, conversationContext);
        }
        // Handle questions
        else if (context.isQuestion) {
            response = this.generateQuestionResponse(userMessage, context, profile, conversationContext);
        }
        // Handle emotional responses
        else if (context.emotionalContext !== 'neutral') {
            response = this.generateEmotionalResponse(userMessage, context, profile, conversationContext);
        }
        // Handle topic-based responses
        else if (context.topics.length > 0) {
            response = this.generateTopicResponse(userMessage, context, profile, conversationContext);
        }
        // Handle follow-up responses based on conversation context
        else if (conversationContext.lastPersonaMessage) {
            response = this.generateFollowUpResponse(userMessage, context, profile, conversationContext);
        }
        // Default conversational response
        else {
            response = this.generateConversationalResponse(userMessage, context, profile, conversationContext);
        }
        
        return response;
    }

    generateGreetingResponse(profile) {
        const greetings = {
            positive: [
                "Hey there! Great to hear from you!",
                "Hi! I'm so excited to chat with you!",
                "Hello! This is going to be fun!",
                "Hey! I've been looking forward to talking with you!"
            ],
            neutral: [
                "Hello! How are you doing?",
                "Hi there! What's on your mind?",
                "Hey! Good to see you.",
                "Hello! How can I help you today?"
            ],
            negative: [
                "Hi... I'm here if you need to talk.",
                "Hello. What's going on?",
                "Hey. Everything okay?",
                "Hi there. What's on your mind?"
            ]
        };
        
        const toneGreetings = greetings[profile.tone] || greetings.neutral;
        return toneGreetings[Math.floor(Math.random() * toneGreetings.length)];
    }

    generateGoodbyeResponse(profile) {
        const goodbyes = {
            positive: [
                "Bye! It was awesome talking with you!",
                "See you later! This was so much fun!",
                "Goodbye! Can't wait to chat again!",
                "Bye for now! Take care!"
            ],
            neutral: [
                "Goodbye! Talk to you later.",
                "See you around!",
                "Bye! Take care.",
                "Goodbye! Have a good one."
            ],
            negative: [
                "Bye... hope things get better.",
                "Goodbye. Take care of yourself.",
                "See you later... stay safe.",
                "Bye. I'm here if you need me."
            ]
        };
        
        const toneGoodbyes = goodbyes[profile.tone] || goodbyes.neutral;
        return toneGoodbyes[Math.floor(Math.random() * toneGoodbyes.length)];
    }

    generateQuestionResponse(userMessage, context, profile) {
        // Use persona's interests and personality to answer questions
        const interests = profile.interests || [];
        const personality = profile.personality || [];
        
        let response = '';
        
        // If question relates to persona's interests
        if (interests.length > 0 && context.topics.some(topic => 
            interests.some(interest => this.topicsMatch(interest, topic)))) {
            response = this.generateInterestBasedAnswer(userMessage, interests, profile);
        }
        // If persona is analytical, ask follow-up questions
        else if (personality.includes('analytical')) {
            response = this.generateAnalyticalResponse(userMessage, profile);
        }
        // If persona is empathetic, show understanding
        else if (personality.includes('empathetic')) {
            response = this.generateEmpatheticResponse(userMessage, profile);
        }
        // Default question response
        else {
            response = this.generateDefaultQuestionResponse(userMessage, profile);
        }
        
        return response;
    }

    generateEmotionalResponse(userMessage, context, profile) {
        const emotionalResponses = {
            positive: {
                positive: [
                    "That's amazing! I'm so happy for you!",
                    "Wow, that sounds incredible! Tell me more!",
                    "I love hearing good news like this!",
                    "That's fantastic! You must be thrilled!"
                ],
                neutral: [
                    "That sounds really nice!",
                    "I'm glad to hear that!",
                    "That's great news!",
                    "Sounds like things are going well!"
                ],
                negative: [
                    "I'm sorry to hear that... but I'm here for you.",
                    "That must be really tough. Want to talk about it?",
                    "I can't imagine how hard that must be.",
                    "I'm here if you need someone to listen."
                ]
            },
            negative: {
                positive: [
                    "I'm sorry you're feeling that way... but things will get better.",
                    "I understand you're going through a tough time.",
                    "I'm here for you, even when things are hard.",
                    "You're not alone in this."
                ],
                neutral: [
                    "I can see why you'd feel that way.",
                    "That sounds really difficult.",
                    "I'm sorry you're dealing with that.",
                    "That must be really hard."
                ],
                negative: [
                    "I'm really sorry you're going through this.",
                    "That sounds absolutely terrible.",
                    "I can't imagine how difficult this must be.",
                    "I'm here for you, no matter what."
                ]
            }
        };
        
        const responses = emotionalResponses[profile.tone]?.[context.emotionalContext] || 
                         emotionalResponses.neutral?.[context.emotionalContext] ||
                         ["I understand.", "That's interesting.", "Tell me more about that."];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateTopicResponse(userMessage, context, profile) {
        const interests = profile.interests || [];
        const personality = profile.personality || [];
        
        // If topic matches persona's interests
        if (interests.length > 0 && context.topics.some(topic => 
            interests.some(interest => this.topicsMatch(interest, topic)))) {
            return this.generatePassionateResponse(userMessage, context, profile);
        }
        
        // If persona is creative, add creative elements
        if (personality.includes('creative')) {
            return this.generateCreativeResponse(userMessage, context, profile);
        }
        
        // If persona is practical, give practical advice
        if (personality.includes('practical')) {
            return this.generatePracticalResponse(userMessage, context, profile);
        }
        
        // Default topic response
        return this.generateDefaultTopicResponse(userMessage, context, profile);
    }

    generateConversationalResponse(userMessage, context, profile) {
        const personality = profile.personality || [];
        const communicationStyle = profile.communicationStyle || [];
        
        // If persona is extroverted, be more engaging
        if (personality.includes('extroverted')) {
            return this.generateExtrovertedResponse(userMessage, profile);
        }
        
        // If persona is introverted, be more thoughtful
        if (personality.includes('introverted')) {
            return this.generateIntrovertedResponse(userMessage, profile);
        }
        
        // If persona is collaborative, use "we" language
        if (communicationStyle.includes('collaborative')) {
            return this.generateCollaborativeResponse(userMessage, profile);
        }
        
        // Default conversational response
        return this.generateDefaultConversationalResponse(userMessage, profile);
    }

    // Helper methods for response generation
    topicsMatch(interest, topic) {
        const mappings = {
            'technology': ['technology', 'entertainment'],
            'sports': ['entertainment'],
            'music': ['entertainment'],
            'food': ['food'],
            'travel': ['travel'],
            'movies': ['entertainment']
        };
        return mappings[interest]?.includes(topic) || interest === topic;
    }

    generateInterestBasedAnswer(userMessage, interests, profile) {
        const interest = interests[0]; // Use primary interest
        const responses = {
            technology: [
                "Oh, I love talking about tech stuff! That's right up my alley!",
                "Technology is my passion! Tell me more about what you're working on.",
                "I'm always excited to discuss tech topics! What's your experience been like?",
                "Tech is where I feel most at home! I'd love to hear your thoughts."
            ],
            entertainment: [
                "Entertainment is my thing! I could talk about this all day!",
                "I'm so into entertainment! What's your favorite part about it?",
                "This is totally my jam! I love discussing entertainment!",
                "Entertainment is my passion! Tell me everything!"
            ],
            food: [
                "Food is life! I'm always excited to talk about culinary adventures!",
                "I love everything about food! What's your favorite cuisine?",
                "Food conversations are the best! Tell me about your experience!",
                "I'm a total foodie! I'd love to hear more about this!"
            ]
        };
        
        const interestResponses = responses[interest] || responses.technology;
        return interestResponses[Math.floor(Math.random() * interestResponses.length)];
    }

    generateAnalyticalResponse(userMessage, profile) {
        const responses = [
            "That's a really interesting question. Let me think about this...",
            "I need to analyze this properly. What are the key factors here?",
            "This requires some careful consideration. What's your reasoning?",
            "I want to understand this better. Can you break it down for me?",
            "Let me think through this systematically. What's the context?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateEmpatheticResponse(userMessage, profile) {
        const responses = [
            "I really understand where you're coming from. That must be difficult.",
            "I can feel what you're going through. You're not alone in this.",
            "I hear you, and I want you to know I care about how you're feeling.",
            "That sounds really challenging. I'm here to support you.",
            "I can sense this is important to you. Tell me more about how you feel."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateDefaultQuestionResponse(userMessage, profile) {
        const responses = [
            "That's a good question! What made you think of that?",
            "I'm curious about that too. What's your perspective?",
            "That's interesting! I'd love to hear your thoughts on it.",
            "Good question! What do you think about it?",
            "I'm not sure, but I'd like to understand better. What's your take?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generatePassionateResponse(userMessage, context, profile) {
        const responses = [
            "Oh my gosh, I'm so excited you brought this up! This is my favorite topic!",
            "YES! I love talking about this! You have no idea how much this means to me!",
            "This is absolutely my thing! I could talk about this for hours!",
            "I'm so passionate about this! Tell me everything you know!",
            "This is what I live for! I'm so happy you mentioned this!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateCreativeResponse(userMessage, context, profile) {
        const responses = [
            "That's such an interesting perspective! It makes me think of...",
            "I love how creative that sounds! It reminds me of...",
            "That's a beautiful way to think about it! I imagine...",
            "What a unique approach! It's like...",
            "I'm inspired by that! It makes me want to..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generatePracticalResponse(userMessage, context, profile) {
        const responses = [
            "That's a practical approach. Here's what I think would work best...",
            "Let me think about this from a practical standpoint...",
            "That makes sense. The most efficient way would be...",
            "I like your thinking. Here's how we could make this work...",
            "That's a solid plan. Let me suggest some practical steps..."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateDefaultTopicResponse(userMessage, context, profile) {
        const responses = [
            "That's really interesting! Tell me more about that.",
            "I'd love to hear more about your experience with that.",
            "That sounds fascinating! What's it like?",
            "I'm curious about that. What do you think?",
            "That's cool! How did you get into that?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateExtrovertedResponse(userMessage, profile) {
        const responses = [
            "I'm so excited to talk about this! Let's dive right in!",
            "This is going to be so much fun to discuss! I love conversations like this!",
            "I'm totally energized by this topic! Tell me everything!",
            "I'm buzzing with excitement about this! What's your favorite part?",
            "I love how engaging this conversation is! Let's keep it going!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateIntrovertedResponse(userMessage, profile) {
        const responses = [
            "That's really thoughtful. I appreciate you sharing that with me.",
            "I like how you think about things. It's nice to have a quiet conversation.",
            "That's a peaceful way to look at it. I enjoy these kinds of discussions.",
            "I find that really calming to think about. Thank you for that.",
            "That's a gentle perspective. I like how you express yourself."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateCollaborativeResponse(userMessage, profile) {
        const responses = [
            "I love how we can work together on this! What do you think we should do?",
            "This is such a great opportunity for us to collaborate!",
            "I'm excited about what we can accomplish together!",
            "Let's figure this out as a team! What's your idea?",
            "I love working with you on things like this! Let's make it happen!"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateDefaultConversationalResponse(userMessage, profile) {
        const responses = [
            "That's really interesting! I'd love to hear more about that.",
            "I'm curious about your thoughts on this. What do you think?",
            "That's a good point. Tell me more about your experience.",
            "I find that fascinating! How did you come to that conclusion?",
            "That's really thoughtful. I appreciate you sharing that."
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    applyPersonaPatterns(response, profile) {
        const patterns = profile.responsePatterns || {};
        
        // Apply exclamation frequency
        if (patterns.exclamationFrequency > 0.3 && !response.includes('!')) {
            response = response.replace(/\.$/, '!');
        }
        
        // Apply question frequency
        if (patterns.questionFrequency > 0.2 && !response.includes('?')) {
            const questionEndings = ['What do you think?', 'How about you?', 'What\'s your take?', 'Don\'t you think?'];
            response += ' ' + questionEndings[Math.floor(Math.random() * questionEndings.length)];
        }
        
        // Apply ellipsis usage
        if (patterns.ellipsisFrequency > 0.1 && Math.random() < 0.3) {
            response = response.replace(/\.$/, '...');
        }
        
        return response;
    }

    addPersonalityElements(response, profile) {
        const personality = profile.personality || [];
        const commonPhrases = profile.commonPhrases || [];
        
        // Add common phrases occasionally
        if (commonPhrases.length > 0 && Math.random() < 0.3) {
            const phrase = commonPhrases[Math.floor(Math.random() * commonPhrases.length)];
            response = phrase + ' ' + response.toLowerCase();
        }
        
        // Add personality-specific elements
        if (personality.includes('creative') && Math.random() < 0.4) {
            const creativeElements = ['I imagine', 'It\'s like', 'I picture', 'I envision'];
            const element = creativeElements[Math.floor(Math.random() * creativeElements.length)];
            response = element + ', ' + response.toLowerCase();
        }
        
        return response;
    }

    finalizePersonaStyle(response, profile) {
        // Apply formality
        if (profile.formality === 'formal') {
            response = this.makeFormal(response);
        } else if (profile.formality === 'informal') {
            response = this.makeInformal(response);
        }
        
        // Add emojis based on persona's emoji usage
        if (profile.emojiUsage && profile.emojiUsage.frequency > 0.1) {
            const emojis = profile.emojiUsage.common;
            if (emojis.length > 0 && Math.random() < 0.4) {
                response += ' ' + emojis[Math.floor(Math.random() * emojis.length)];
            }
        }
        
        // Adjust message length to match persona's average
        const targetLength = profile.averageMessageLength || 50;
        if (response.length > targetLength * 1.5) {
            // Shorten if too long
            const sentences = response.split(/[.!?]+/);
            response = sentences[0] + (sentences[0].endsWith('.') ? '' : '.');
        } else if (response.length < targetLength * 0.5) {
            // Add more content if too short
            const additions = [
                ' What do you think about that?',
                ' I\'d love to hear your thoughts.',
                ' Tell me more about that.',
                ' How do you feel about it?'
            ];
            response += additions[Math.floor(Math.random() * additions.length)];
        }
        
        return response;
    }

    makeFormal(text) {
        return text.replace(/I'm/g, 'I am')
                  .replace(/don't/g, 'do not')
                  .replace(/can't/g, 'cannot')
                  .replace(/won't/g, 'will not')
                  .replace(/gonna/g, 'going to')
                  .replace(/wanna/g, 'want to');
    }

    makeInformal(text) {
        return text.replace(/I am/g, "I'm")
                  .replace(/do not/g, "don't")
                  .replace(/cannot/g, "can't")
                  .replace(/will not/g, "won't")
                  .replace(/going to/g, "gonna")
                  .replace(/want to/g, "wanna");
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
        document.getElementById('chat-messages').innerHTML = `
            <div class="welcome-message">
                <i class="fas fa-robot"></i>
                <p>Start a conversation with ${this.activePersona ? this.activePersona.name : 'a persona'}!</p>
            </div>
        `;
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
                
                <h5>Emoji Usage:</h5>
                <p>Frequency: ${(persona.profile.emojiUsage.frequency * 100).toFixed(1)}%</p>
                <p>Common: ${persona.profile.emojiUsage.common.join(' ') || 'None'}</p>
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
                    responsePatterns: { questionFrequency: 0.15, exclamationFrequency: 0.45, ellipsisFrequency: 0.05, capsFrequency: 0.1, shortResponseRatio: 0.3, longResponseRatio: 0.1 },
                    emotionalRange: { dominantEmotions: [{ emotion: 'joy', intensity: 0.6 }, { emotion: 'surprise', intensity: 0.3 }], emotionalDiversity: 2, overallIntensity: 0.4 },
                    communicationStyle: ['direct', 'supportive']
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
                    responsePatterns: { questionFrequency: 0.25, exclamationFrequency: 0.05, ellipsisFrequency: 0.0, capsFrequency: 0.0, shortResponseRatio: 0.1, longResponseRatio: 0.4 },
                    emotionalRange: { dominantEmotions: [{ emotion: 'joy', intensity: 0.4 }], emotionalDiversity: 1, overallIntensity: 0.2 },
                    communicationStyle: ['indirect', 'collaborative']
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
