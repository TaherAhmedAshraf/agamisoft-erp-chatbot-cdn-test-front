/**
 * Customer Chat Widget SDK
 * A simple, embeddable chat widget for customer support
 * 
 * Usage:
 * <script src="https://your-cdn.com/chat-widget.js"></script>
 * <script>
 *   ChatWidget.init({
 *     serverUrl: 'http://your-backend-url',
 *     position: 'bottom-right', // or 'bottom-left'
 *     theme: 'default', // or 'dark'
 *     welcomeMessage: 'Hello! How can we help you today?'
 *   });
 * </script>
 */

(function (window, document) {
    'use strict';

    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
        console.error('ChatWidget: Socket.IO library is required. Please include it before this script.');
        return;
    }

    const ChatWidget = {
        // Configuration
        config: {
            serverUrl: 'http://localhost:3000',
            position: 'bottom-right',
            theme: 'default',
            welcomeMessage: 'Hello! How can we help you today?',
            buttonText: 'Chat with us',
            companyName: 'Support',
            showMinimizeButton: true,
            autoOpen: false,
            debug: false
        },

        // State
        state: {
            isInitialized: false,
            isConnected: false,
            isChatStarted: false,
            isOpen: false,
            isTyping: false,
            agentTyping: false,
            messages: [],
            session: {
                customerId: null,
                chatSessionId: null
            },
            agentInfo: null,
            customerInfo: {
                name: '',
                phone: '',
                email: ''
            }
        },

        // Socket reference
        socket: null,

        // DOM elements
        elements: {
            container: null,
            widget: null,
            button: null,
            header: null,
            messages: null,
            input: null,
            form: null,
            startForm: null
        },

        // Typing timeout reference
        typingTimeout: null,

        /**
         * Initialize the chat widget
         */
        init: function (options) {
            if (this.state.isInitialized) {
                console.warn('ChatWidget: Already initialized');
                return;
            }

            // Merge configuration
            this.config = Object.assign({}, this.config, options || {});

            if (!this.config.serverUrl) {
                console.error('ChatWidget: serverUrl is required');
                return;
            }

            this.log('Initializing ChatWidget...');

            // Create widget elements
            this.createWidget();

            // Check for existing session before initializing socket
            this.checkExistingSession();

            // Mark as initialized
            this.state.isInitialized = true;

            this.log('ChatWidget initialized successfully');
        },

        /**
         * Create the widget DOM structure
         */
        createWidget: function () {
            // Create container
            this.elements.container = document.createElement('div');
            this.elements.container.className = 'chat-widget-container ' + this.config.position + ' ' + this.config.theme;
            this.elements.container.innerHTML = this.getWidgetHTML();

            // Append to body
            document.body.appendChild(this.elements.container);

            // Get element references
            this.elements.widget = this.elements.container.querySelector('.chat-widget');
            this.elements.button = this.elements.container.querySelector('.chat-toggle-button');
            this.elements.header = this.elements.container.querySelector('.chat-header');
            this.elements.messages = this.elements.container.querySelector('.chat-messages');
            this.elements.input = this.elements.container.querySelector('.chat-input');
            this.elements.form = this.elements.container.querySelector('.chat-input-form');
            this.elements.startForm = this.elements.container.querySelector('.chat-start-form');

            // Bind events
            this.bindEvents();

            // Auto-open if configured
            if (this.config.autoOpen) {
                this.openWidget();
            }
        },

        /**
         * Get the widget HTML structure
         */
        getWidgetHTML: function () {
            return `
                <!-- Chat Toggle Button -->
                <button class="chat-toggle-button" title="${this.config.buttonText}">
                    <svg class="chat-icon" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                    <svg class="close-icon" viewBox="0 0 24 24" width="24" height="24" style="display: none;">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                </button>

                <!-- Chat Widget -->
                <div class="chat-widget" style="display: none;">
                    <!-- Header -->
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <h3 class="chat-title">${this.config.companyName}</h3>
                            <span class="chat-status">Connect to start chatting</span>
                        </div>
                        <div class="chat-header-actions">
                            ${this.config.showMinimizeButton ? '<button class="chat-minimize-btn" title="Minimize">−</button>' : ''}
                            <button class="chat-close-btn" title="Close">×</button>
                        </div>
                    </div>

                    <!-- Chat Body - Restructured for fixed input -->
                    <div class="chat-body">
                        <!-- Connection Status -->
                        <div class="chat-connecting" style="display: block;">
                            <div class="connecting-spinner"></div>
                            <p>Connecting to chat service...</p>
                        </div>

                        <!-- Start Chat Form -->
                        <div class="chat-start" style="display: none;">
                            <div class="chat-welcome">
                                <p>${this.config.welcomeMessage}</p>
                                <p>Please provide your details to start chatting:</p>
                            </div>
                            <form class="chat-start-form">
                                <div class="form-group">
                                    <label for="customer-name">Name *</label>
                                    <input type="text" id="customer-name" name="name" required>
                                </div>
                                <div class="form-group">
                                    <label for="customer-phone">Phone *</label>
                                    <input type="tel" id="customer-phone" name="phone" required>
                                </div>
                                <div class="form-group">
                                    <label for="customer-email">Email</label>
                                    <input type="email" id="customer-email" name="email">
                                </div>
                                <button type="submit" class="chat-start-btn">Start Chat</button>
                            </form>
                        </div>

                        <!-- Chat Messages Container -->
                        <div class="chat-conversation" style="display: none;overflow:scroll;max-height:300px;">
                            <div class="chat-messages-container">
                                <div class="chat-messages"></div>
                                <div class="chat-typing-indicator" style="display: none;">
                                    <div class="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span class="typing-text">Agent is typing...</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Chat Input - Fixed to bottom -->
                    <div class="chat-input-container" style="display: none;">
                        <form class="chat-input-form">
                            <input type="text" class="chat-input" placeholder="Type your message..." maxlength="1000">
                            <button type="submit" class="chat-send-btn" disabled>
                                <svg viewBox="0 0 24 24" width="20" height="20">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                                </svg>
                            </button>
                        </form>
                        <div class="chat-actions">
                            <button class="chat-end-btn">End Chat</button>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Bind event listeners
         */
        bindEvents: function () {
            const self = this;

            // Toggle button
            this.elements.button.addEventListener('click', function () {
                self.toggleWidget();
            });

            // Minimize button
            const minimizeBtn = this.elements.container.querySelector('.chat-minimize-btn');
            if (minimizeBtn) {
                minimizeBtn.addEventListener('click', function () {
                    self.minimizeWidget();
                });
            }

            // Close button
            const closeBtn = this.elements.container.querySelector('.chat-close-btn');
            closeBtn.addEventListener('click', function () {
                self.closeWidget();
            });

            // Start chat form
            if (this.elements.startForm) {
                this.elements.startForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    self.handleStartChat(e);
                });
            }

            // Chat input form
            if (this.elements.form) {
                this.elements.form.addEventListener('submit', function (e) {
                    e.preventDefault();
                    self.handleSendMessage(e);
                });

                // Input events
                this.elements.input.addEventListener('input', function () {
                    self.handleInputChange();
                });

                this.elements.input.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        self.handleSendMessage(e);
                    }
                });
            }

            // End chat button
            const endBtn = this.elements.container.querySelector('.chat-end-btn');
            if (endBtn) {
                endBtn.addEventListener('click', function () {
                    self.endChat();
                });
            }

            // Click outside to close (optional)
            document.addEventListener('click', function (e) {
                if (!self.elements.container.contains(e.target) && self.state.isOpen) {
                    // Optionally close widget when clicking outside
                    // self.closeWidget();
                }
            });

            // Session persistence event listeners
            document.addEventListener('visibilitychange', function () {
                if (!document.hidden && self.socket && self.state.session.chatSessionId) {
                    self.validateSession();
                }
            });

            // Warn before leaving page if chat is active
            window.addEventListener('beforeunload', function (e) {
                if (self.state.isChatStarted && self.state.session.chatSessionId) {
                    e.preventDefault();
                    e.returnValue = 'You have an active chat session. Are you sure you want to leave?';
                    return e.returnValue;
                }
            });
        },

        /**
         * Initialize socket connection
         */
        initSocket: function () {
            const self = this;

            try {
                this.socket = io(this.config.serverUrl, {
                    transports: ['websocket', 'polling'],
                    withCredentials: true
                });

                // Connection events
                this.socket.on('connect', function () {
                    self.log('Connected to chat server with ID:', self.socket.id);
                    self.state.isConnected = true;
                    self.updateConnectionStatus('connected');

                    // Try to resume session if we have stored session data
                    if (self.state.session.chatSessionId) {
                        self.socket.emit('customer-resume-session', {
                            customerId: self.state.session.customerId,
                            chatSessionId: self.state.session.chatSessionId,
                            customerName: self.state.customerInfo.name
                        });
                    }
                });

                this.socket.on('disconnect', function () {
                    self.log('Disconnected from chat server');
                    self.state.isConnected = false;
                    self.updateConnectionStatus('disconnected');
                });

                this.socket.on('connect_error', function (error) {
                    self.log('Connection error:', error);
                    self.state.isConnected = false;
                    self.updateConnectionStatus('error');
                });

                // Chat events
                this.socket.on('chat-started', function (data) {
                    self.handleChatStarted(data);
                });

                // Session management events
                this.socket.on('session-resumed', function (data) {
                    self.handleSessionResumed(data);
                });

                this.socket.on('session-resume-error', function (error) {
                    self.handleSessionResumeError(error);
                });

                this.socket.on('chat-history', function (data) {
                    self.handleChatHistory(data);
                });

                this.socket.on('receive-message', function (message) {
                    self.handleReceiveMessage(message);
                });

                this.socket.on('agent-assigned', function (data) {
                    self.handleAgentAssigned(data);
                });

                this.socket.on('agent-typing', function (data) {
                    self.handleAgentTyping(data);
                });

                this.socket.on('chat-ended', function (data) {
                    self.handleChatEnded(data);
                });

                // Error events
                this.socket.on('error', function (error) {
                    self.handleError(error);
                });

                this.socket.on('message-error', function (error) {
                    self.handleMessageError(error);
                });

                this.socket.on('end-chat-error', function (error) {
                    self.handleEndChatError(error);
                });

                // Message receipts
                this.socket.on('mark-message-as-read-response', function (response) {
                    self.log('Message receipt:', response);
                });

            } catch (error) {
                console.error('ChatWidget: Failed to initialize socket connection:', error);
                this.updateConnectionStatus('error');
            }
        },

        /**
         * Update connection status UI
         */
        updateConnectionStatus: function (status) {
            const connectingEl = this.elements.container.querySelector('.chat-connecting');
            const startEl = this.elements.container.querySelector('.chat-start');
            const statusEl = this.elements.container.querySelector('.chat-status');

            switch (status) {
                case 'connecting':
                    connectingEl.style.display = 'block';
                    startEl.style.display = 'none';
                    statusEl.textContent = 'Connecting...';
                    break;
                case 'connected':
                    connectingEl.style.display = 'none';
                    startEl.style.display = 'block';
                    statusEl.textContent = 'Connected';
                    break;
                case 'disconnected':
                    statusEl.textContent = 'Disconnected';
                    break;
                case 'error':
                    connectingEl.style.display = 'none';
                    startEl.style.display = 'block';
                    statusEl.textContent = 'Connection Error';
                    break;
            }
        },

        /**
         * Handle chat started event
         */
        handleChatStarted: function (data) {
            this.log('Chat started:', data);

            this.state.isChatStarted = true;
            this.state.session = {
                customerId: data.customerId,
                chatSessionId: data.chatSessionId
            };

            // Store session for persistence
            this.storeSession(data);

            // Update UI
            this.elements.container.querySelector('.chat-start').style.display = 'none';
            this.elements.container.querySelector('.chat-conversation').style.display = 'flex';
            this.elements.container.querySelector('.chat-input-container').style.display = 'block';
            this.elements.container.querySelector('.chat-status').textContent = 'Online';

            // Add welcome message
            this.addMessage({
                id: 'welcome',
                message: data.message,
                sender_type: 1,
                timestamp: new Date()
            });

            // Focus input
            this.elements.input.focus();
        },

        /**
         * Handle received message
         */
        handleReceiveMessage: function (message) {
            this.log('Message received:', message);

            // Hide typing indicator
            this.state.agentTyping = false;
            this.updateTypingIndicator();

            // Add message to UI
            this.addMessage({
                id: message.id,
                message: message.message,
                sender_type: message.sender_type,
                timestamp: new Date(message.timestamp || Date.now())
            });

            // Mark as read
            if (message.id && this.state.session.chatSessionId) {
                this.socket.emit('mark-message-as-read', {
                    messageId: message.id,
                    sessionId: this.state.session.chatSessionId
                });
            }

            // Show notification if widget is closed
            if (!this.state.isOpen) {
                this.showNotification();
            }
        },

        /**
         * Handle agent assigned
         */
        handleAgentAssigned: function (data) {
            this.log('Agent assigned:', data);

            this.state.agentInfo = {
                name: data.agentName,
                id: data.agentId
            };

            // Update UI
            this.elements.container.querySelector('.chat-title').textContent = `${this.config.companyName} - ${data.agentName}`;
            this.elements.container.querySelector('.chat-status').textContent = `Chatting with ${data.agentName}`;

            // Add system message
            this.addMessage({
                id: 'system-agent-assigned',
                message: `${data.agentName} has joined the chat.`,
                sender_type: 0,
                timestamp: new Date()
            });
        },

        /**
         * Handle agent typing
         */
        handleAgentTyping: function (data) {
            this.state.agentTyping = data.isTyping;
            this.updateTypingIndicator();
        },

        /**
         * Handle chat ended
         */
        handleChatEnded: function (data) {
            this.log('Chat ended:', data);

            // Add end message
            this.addMessage({
                id: 'system-chat-ended',
                message: data.message || 'Chat has ended.',
                sender_type: 0,
                timestamp: new Date()
            });

            // Update UI
            this.elements.container.querySelector('.chat-input-container').style.display = 'none';
            this.elements.container.querySelector('.chat-status').textContent = 'Chat Ended';

            // Clear stored session
            this.clearStoredSession();

            // Reset state after delay
            setTimeout(() => {
                this.resetChatState();
            }, 5000);
        },

        /**
         * Handle session resumed event
         */
        handleSessionResumed: function (data) {
            this.log('Session resumed successfully:', data);

            this.state.isChatStarted = true;
            this.state.session = {
                customerId: data.customerId,
                chatSessionId: data.chatSessionId
            };

            // Update stored session with fresh data
            this.storeSession(data);

            // Update UI
            this.elements.container.querySelector('.chat-start').style.display = 'none';
            this.elements.container.querySelector('.chat-conversation').style.display = 'flex';
            this.elements.container.querySelector('.chat-input-container').style.display = 'block';
            this.elements.container.querySelector('.chat-status').textContent = 'Session Resumed';

            // Request chat history
            this.socket.emit('get-chat-history', {
                chatSessionId: data.chatSessionId
            });

            // Focus input
            if (this.elements.input) {
                this.elements.input.focus();
            }

            // Show success message
            this.addMessage({
                id: 'system-session-resumed',
                message: 'Session resumed successfully.',
                sender_type: 0,
                timestamp: new Date()
            });
        },

        /**
         * Handle session resume error
         */
        handleSessionResumeError: function (error) {
            this.log('Session resume failed:', error);

            // Clear invalid session
            this.clearStoredSession();

            // Show user a message
            this.addMessage({
                id: 'system-session-expired',
                message: 'Previous session expired. Please start a new chat.',
                sender_type: 0,
                timestamp: new Date()
            });

            // Show start form
            this.updateConnectionStatus('connected');
        },

        /**
         * Handle chat history event
         */
        handleChatHistory: function (data) {
            this.log('Received chat history:', data.messages?.length || 0, 'messages');

            // Clear current messages
            this.state.messages = [];
            this.elements.messages.innerHTML = '';

            // Add historical messages
            if (data.messages && data.messages.length > 0) {
                data.messages.forEach(msg => {
                    this.addMessage({
                        id: msg.id,
                        message: msg.message,
                        sender_type: msg.sender_type,
                        timestamp: new Date(msg.timestamp || msg.createdAt)
                    });
                });
            }

            // Scroll to bottom
            this.autoScrollToBottom();
        },

        /**
         * Handle errors
         */
        handleError: function (error) {
            this.log('Socket error:', error);
            this.showErrorMessage('An error occurred with the chat connection');
        },

        handleMessageError: function (error) {
            this.log('Message error:', error);
            this.showErrorMessage('Failed to send message. Please try again.');

            // Mark pending message as failed
            this.markMessageAsFailed(error.originalMessage);
        },

        handleEndChatError: function (error) {
            this.log('End chat error:', error);
            this.showErrorMessage('Failed to end chat. Please try again.');
        },

        /**
         * Handle start chat form submission
         */
        handleStartChat: function (e) {
            const formData = new FormData(e.target);

            this.state.customerInfo = {
                name: formData.get('name').trim(),
                phone: formData.get('phone').trim(),
                email: formData.get('email').trim()
            };

            if (!this.state.customerInfo.name || !this.state.customerInfo.phone) {
                this.showErrorMessage('Name and phone are required');
                return;
            }

            if (!this.state.isConnected) {
                this.showErrorMessage('Not connected to chat service');
                return;
            }

            this.socket.emit('customer-join', this.state.customerInfo);
        },

        /**
         * Handle send message
         */
        handleSendMessage: function (e) {
            const message = this.elements.input.value.trim();

            if (!message || !this.state.session.chatSessionId) {
                return;
            }

            const messageData = {
                message: message,
                chatId: this.state.session.chatSessionId,
                sender_type: 2,
                source: 'web',
                chatSessionId: this.state.session.chatSessionId
            };

            this.socket.emit('send-message', messageData);

            // Add message to UI immediately (optimistic)
            this.addMessage({
                id: 'pending-' + Date.now(),
                message: message,
                sender_type: 2,
                senderId: this.state.session.customerId,
                timestamp: new Date(),
                isPending: true
            });

            // Clear input and stop typing
            this.elements.input.value = '';
            this.updateSendButton();
            this.stopTyping();
        },

        /**
         * Handle input change for typing indicator
         */
        handleInputChange: function () {
            const message = this.elements.input.value.trim();
            this.updateSendButton();

            if (!this.state.session.chatSessionId) return;

            // Start typing if not already
            if (!this.state.isTyping && message) {
                this.state.isTyping = true;
                this.socket.emit('typing', {
                    chatId: this.state.session.chatSessionId,
                    isTyping: true,
                    sender_type: 2
                });
            }

            // Reset typing timeout
            clearTimeout(this.typingTimeout);
            this.typingTimeout = setTimeout(() => {
                this.stopTyping();
            }, 1000);
        },

        /**
         * Stop typing indicator
         */
        stopTyping: function () {
            if (this.state.isTyping) {
                this.state.isTyping = false;
                if (this.state.session.chatSessionId) {
                    this.socket.emit('typing', {
                        chatId: this.state.session.chatSessionId,
                        isTyping: false,
                        sender_type: 2
                    });
                }
            }
            clearTimeout(this.typingTimeout);
        },

        /**
         * End chat
         */
        endChat: function () {
            if (!this.state.session.chatSessionId) return;

            this.socket.emit('customer-end-chat', {
                chatSessionId: this.state.session.chatSessionId
            });
        },

        /**
         * Add message to UI
         */
        addMessage: function (messageData) {
            this.state.messages.push(messageData);

            // Check if user is near bottom before adding message
            const shouldAutoScroll = this.isNearBottom();

            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${messageData.sender_type === 0 ? 'system' : messageData.sender_type === 1 ? 'agent' : 'customer'} ${messageData.isPending ? 'pending' : ''}`;
            messageEl.dataset.messageId = messageData.id;

            if (messageData.sender_type === 0) {
                messageEl.innerHTML = `
                    <div class="message-content system-message">${this.escapeHtml(messageData.message)}</div>
                `;
            } else {
                messageEl.innerHTML = `
                    <div class="message-content">${this.escapeHtml(messageData.message)}</div>
                    <div class="message-time">${this.formatTime(messageData.timestamp)}</div>
                    ${messageData.isPending ? '<div class="message-status">Sending...</div>' : ''}
                `;
            }

            this.elements.messages.appendChild(messageEl);

            // Auto-scroll only if user was near bottom or it's their own message
            if (shouldAutoScroll || messageData.sender_type === 2) {
                this.autoScrollToBottom();
            }
        },

        /**
         * Mark message as failed
         */
        markMessageAsFailed: function (originalMessage) {
            const pendingMessages = this.elements.messages.querySelectorAll('.chat-message.pending');

            pendingMessages.forEach(msgEl => {
                const content = msgEl.querySelector('.message-content').textContent;
                if (content === originalMessage) {
                    msgEl.classList.remove('pending');
                    msgEl.classList.add('failed');

                    const statusEl = msgEl.querySelector('.message-status');
                    if (statusEl) {
                        statusEl.textContent = 'Failed to send';
                        statusEl.style.color = '#f44336';
                    }
                }
            });
        },

        /**
         * Update typing indicator
         */
        updateTypingIndicator: function () {
            const typingEl = this.elements.container.querySelector('.chat-typing-indicator');

            if (this.state.agentTyping) {
                typingEl.style.display = 'flex';
                this.autoScrollToBottom();
            } else {
                typingEl.style.display = 'none';
            }
        },

        /**
         * Update send button state
         */
        updateSendButton: function () {
            const sendBtn = this.elements.container.querySelector('.chat-send-btn');
            const hasText = this.elements.input.value.trim().length > 0;

            sendBtn.disabled = !hasText || !this.state.isChatStarted;
        },

        /**
         * Widget state management
         */
        toggleWidget: function () {
            if (this.state.isOpen) {
                this.closeWidget();
            } else {
                this.openWidget();
            }
        },

        openWidget: function () {
            this.state.isOpen = true;
            this.elements.widget.style.display = 'block';
            this.elements.button.querySelector('.chat-icon').style.display = 'none';
            this.elements.button.querySelector('.close-icon').style.display = 'block';
            this.elements.container.classList.add('open');

            // Focus input if chat is active
            if (this.state.isChatStarted && this.elements.input) {
                setTimeout(() => this.elements.input.focus(), 100);
            }

            // Clear notification
            this.clearNotification();
        },

        closeWidget: function () {
            this.state.isOpen = false;
            this.elements.widget.style.display = 'none';
            this.elements.button.querySelector('.chat-icon').style.display = 'block';
            this.elements.button.querySelector('.close-icon').style.display = 'none';
            this.elements.container.classList.remove('open');
        },

        minimizeWidget: function () {
            this.closeWidget();
        },

        /**
         * Reset chat state
         */
        resetChatState: function () {
            this.state.isChatStarted = false;
            this.state.messages = [];
            this.state.session = { customerId: null, chatSessionId: null };
            this.state.agentInfo = null;
            this.state.agentTyping = false;

            // Clear stored session
            this.clearStoredSession();

            // Reset UI
            this.elements.container.querySelector('.chat-conversation').style.display = 'none';
            this.elements.container.querySelector('.chat-input-container').style.display = 'none';
            this.elements.container.querySelector('.chat-start').style.display = 'block';
            this.elements.container.querySelector('.chat-title').textContent = this.config.companyName;
            this.elements.container.querySelector('.chat-status').textContent = this.state.isConnected ? 'Connected' : 'Disconnected';
            this.elements.messages.innerHTML = '';

            // Reset form
            if (this.elements.startForm) {
                this.elements.startForm.reset();
            }
        },

        /**
         * Notification system
         */
        showNotification: function () {
            this.elements.button.classList.add('has-notification');
        },

        clearNotification: function () {
            this.elements.button.classList.remove('has-notification');
        },

        /**
         * Error handling
         */
        showErrorMessage: function (message) {
            // Create temporary error message
            const errorEl = document.createElement('div');
            errorEl.className = 'chat-error-message';
            errorEl.textContent = message;

            const chatBody = this.elements.container.querySelector('.chat-body');
            chatBody.appendChild(errorEl);

            // Remove after 5 seconds
            setTimeout(() => {
                if (errorEl.parentNode) {
                    errorEl.parentNode.removeChild(errorEl);
                }
            }, 5000);
        },

        /**
         * Scroll messages to bottom with smooth animation
         */
        scrollToBottom: function (force = false) {
            // Find the scrollable container (messages-container or messages)
            const messagesContainer = this.elements.container?.querySelector('.chat-messages-container');
            const messagesElement = this.elements.messages;
            const scrollableElement = messagesContainer || messagesElement;

            if (scrollableElement) {
                // Use smooth scrolling for better UX
                const scrollOptions = {
                    top: scrollableElement.scrollHeight,
                    behavior: force ? 'auto' : 'smooth'
                };

                // Try modern scrollTo method first
                if (scrollableElement.scrollTo) {
                    scrollableElement.scrollTo(scrollOptions);
                } else {
                    // Fallback for older browsers
                    scrollableElement.scrollTop = scrollableElement.scrollHeight;
                }

                // Also ensure any nested scroll containers are at bottom
                if (messagesElement && messagesElement !== scrollableElement) {
                    if (messagesElement.scrollTo) {
                        messagesElement.scrollTo({
                            top: messagesElement.scrollHeight,
                            behavior: force ? 'auto' : 'smooth'
                        });
                    } else {
                        messagesElement.scrollTop = messagesElement.scrollHeight;
                    }
                }
            }
        },

        /**
         * Auto-scroll to bottom when new messages arrive
         */
        autoScrollToBottom: function () {
            // Add a small delay to ensure the message is fully rendered
            setTimeout(() => {
                this.scrollToBottom();
            }, 50);
        },

        /**
         * Check if user is near bottom of messages (within 100px)
         */
        isNearBottom: function () {
            const messagesContainer = this.elements.container?.querySelector('.chat-messages-container');
            const scrollableElement = messagesContainer || this.elements.messages;

            if (!scrollableElement) return true;

            const threshold = 100; // pixels from bottom
            const scrollTop = scrollableElement.scrollTop;
            const scrollHeight = scrollableElement.scrollHeight;
            const clientHeight = scrollableElement.clientHeight;

            return scrollTop + clientHeight >= scrollHeight - threshold;
        },

        formatTime: function (date) {
            return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },

        escapeHtml: function (text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        log: function () {
            if (this.config.debug) {
                console.log('[ChatWidget]', ...arguments);
            }
        },

        /**
         * Session Management Methods
         */
        checkExistingSession: function () {
            const storedSession = this.getStoredSession();

            if (storedSession) {
                this.log('Found stored session:', storedSession.chatSessionId);
                this.resumeSession(storedSession);
            } else {
                this.log('No stored session found, initializing fresh');
                this.initSocket();
            }
        },

        resumeSession: function (sessionData) {
            this.log('Attempting to resume session:', sessionData.chatSessionId);

            // Update UI to show loading state
            this.updateConnectionStatus('connecting');

            // Initialize socket first
            this.initSocket();

            // Store session data temporarily
            this.state.session = {
                customerId: sessionData.customerId,
                chatSessionId: sessionData.chatSessionId
            };
            this.state.customerInfo = {
                name: sessionData.customerName,
                phone: sessionData.customerPhone,
                email: sessionData.customerEmail
            };
        },

        storeSession: function (sessionData) {
            const dataToStore = {
                customerId: sessionData.customerId,
                chatSessionId: sessionData.chatSessionId,
                customerName: sessionData.customerName || this.state.customerInfo.name,
                customerPhone: sessionData.customerPhone || this.state.customerInfo.phone,
                customerEmail: sessionData.customerEmail || this.state.customerInfo.email,
                timestamp: Date.now(),
                status: 'active'
            };

            try {
                localStorage.setItem('chat_widget_session', JSON.stringify(dataToStore));
                this.log('Session stored:', dataToStore.chatSessionId);
            } catch (error) {
                this.log('Failed to store session:', error);
            }
        },

        getStoredSession: function () {
            try {
                const stored = localStorage.getItem('chat_widget_session');
                if (stored) {
                    const session = JSON.parse(stored);
                    // Check if session is valid (within 24 hours)
                    const isValid = (Date.now() - session.timestamp) < (24 * 60 * 60 * 1000);
                    if (isValid) {
                        return session;
                    } else {
                        this.clearStoredSession();
                    }
                }
            } catch (error) {
                this.log('Error reading stored session:', error);
                this.clearStoredSession();
            }
            return null;
        },

        clearStoredSession: function () {
            try {
                localStorage.removeItem('chat_widget_session');
                this.log('Session cleared from storage');
            } catch (error) {
                this.log('Error clearing session:', error);
            }
        },

        validateSession: function () {
            if (this.state.session.chatSessionId && this.socket) {
                this.socket.emit('validate-session', {
                    customerId: this.state.session.customerId,
                    chatSessionId: this.state.session.chatSessionId
                });
            }
        },

        /**
         * Public API methods
         */
        open: function () {
            this.openWidget();
        },

        close: function () {
            this.closeWidget();
        },

        destroy: function () {
            if (this.socket) {
                this.socket.disconnect();
            }

            if (this.elements.container) {
                this.elements.container.parentNode.removeChild(this.elements.container);
            }

            // Clear stored session
            this.clearStoredSession();

            clearTimeout(this.typingTimeout);
            this.state.isInitialized = false;
        },

        // Get current state (useful for debugging)
        getState: function () {
            return {
                isConnected: this.state.isConnected,
                isChatStarted: this.state.isChatStarted,
                isOpen: this.state.isOpen,
                messagesCount: this.state.messages.length,
                session: this.state.session,
                agentInfo: this.state.agentInfo
            };
        },

        // Clear session manually (useful for testing)
        clearSession: function () {
            this.clearStoredSession();
            this.resetChatState();
        }
    };

    // Expose to global scope
    window.ChatWidget = ChatWidget;

})(window, document);
