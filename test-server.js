/**
 * Simple test server for Chat Widget CDN
 * This is a basic Socket.IO server for testing the chat widget
 * 
 * To run:
 * 1. npm install socket.io express cors
 * 2. node test-server.js
 * 3. Open index.html in your browser
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
    cors: {
        origin: "*", // In production, specify your domain
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Serve static files (for testing)
app.use(cors());
app.use(express.static(__dirname));

// In-memory storage for demo (use database in production)
const chatSessions = new Map();
const customers = new Map();

// Utility functions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function createChatSession(customerId, customerInfo) {
    const sessionId = `session_${generateId()}`;
    const session = {
        id: sessionId,
        customerId: customerId,
        customerInfo: customerInfo,
        messages: [],
        status: 'active',
        createdAt: new Date(),
        agentId: null,
        agentName: null
    };

    chatSessions.set(sessionId, session);
    return session;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Customer joins chat
    socket.on('customer-join', (customerInfo) => {
        console.log('Customer joining:', customerInfo);

        try {
            // Validate required fields
            if (!customerInfo.name || !customerInfo.phone) {
                socket.emit('error', { message: 'Name and phone are required' });
                return;
            }

            // Create customer record
            const customerId = `customer_${generateId()}`;
            customers.set(customerId, {
                id: customerId,
                ...customerInfo,
                socketId: socket.id,
                joinedAt: new Date()
            });

            // Create chat session
            const session = createChatSession(customerId, customerInfo);

            // Join socket room for this session
            socket.join(session.id);

            // Store session info in socket
            socket.customerId = customerId;
            socket.chatSessionId = session.id;

            // Send chat started event
            socket.emit('chat-started', {
                customerId: customerId,
                chatSessionId: session.id,
                message: `Hello ${customerInfo.name}! Welcome to our support chat. How can we help you today?`
            });

            console.log(`Chat session created: ${session.id} for customer: ${customerId}`);

            // Simulate agent assignment after 3 seconds (for demo)
            setTimeout(() => {
                const agentName = 'Demo Agent';
                const agentId = 'agent_demo';

                session.agentId = agentId;
                session.agentName = agentName;

                socket.emit('agent-assigned', {
                    agentName: agentName,
                    agentId: agentId,
                    source: 'web',
                    chatSessionId: session.id
                });

                console.log(`Agent ${agentName} assigned to session: ${session.id}`);
            }, 3000);

        } catch (error) {
            console.error('Error in customer-join:', error);
            socket.emit('error', { message: 'Failed to start chat session' });
        }
    });

    // Customer sends message
    socket.on('send-message', (messageData) => {
        console.log('Message received:', messageData);

        try {
            const { message, chatId, senderType, chatSessionId } = messageData;

            if (!chatSessionId || !chatSessions.has(chatSessionId)) {
                socket.emit('message-error', {
                    message: 'Invalid chat session',
                    originalMessage: message
                });
                return;
            }

            const session = chatSessions.get(chatSessionId);
            const messageId = `msg_${generateId()}`;
            const timestamp = new Date().toISOString();

            // Store message
            const messageObj = {
                id: messageId,
                message: message,
                senderType: senderType,
                senderId: socket.customerId,
                timestamp: timestamp,
                chatSessionId: chatSessionId
            };

            session.messages.push(messageObj);

            // Echo message back to sender (confirmation)
            socket.emit('receive-message', {
                id: messageId,
                message: message,
                senderType: senderType,
                timestamp: timestamp
            });

            console.log(`Message sent in session ${chatSessionId}: ${message}`);

            // Simulate AI/Agent response after 1-3 seconds
            setTimeout(() => {
                const responses = [
                    "Thank you for your message! I'm here to help.",
                    "I understand your concern. Let me assist you with that.",
                    "That's a great question! Let me provide you with the information.",
                    "I'm looking into this for you right now.",
                    "Thanks for reaching out! I'll be happy to help you with this."
                ];

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const responseId = `msg_${generateId()}`;
                const responseTimestamp = new Date().toISOString();

                const responseMessage = {
                    id: responseId,
                    message: randomResponse,
                    senderType: session.agentId ? 'agent' : 'ai',
                    senderId: session.agentId || 'ai_system',
                    timestamp: responseTimestamp,
                    chatSessionId: chatSessionId
                };

                session.messages.push(responseMessage);

                socket.emit('receive-message', responseMessage);

                console.log(`Auto-response sent in session ${chatSessionId}: ${randomResponse}`);
            }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds

        } catch (error) {
            console.error('Error in send-message:', error);
            socket.emit('message-error', {
                message: 'Failed to send message',
                originalMessage: messageData.message
            });
        }
    });

    // Typing indicator
    socket.on('typing', (data) => {
        console.log('Typing indicator:', data);

        const { chatId, isTyping, senderType } = data;

        if (senderType === 'customer') {
            // Simulate agent typing response
            setTimeout(() => {
                socket.emit('agent-typing', {
                    agentId: 'agent_demo',
                    isTyping: Math.random() > 0.7, // Sometimes show typing
                    agentName: 'Demo Agent'
                });
            }, 500);
        }
    });

    // Mark message as read
    socket.on('mark-message-as-read', (data) => {
        console.log('Message marked as read:', data);

        socket.emit('mark-message-as-read-response', {
            success: true,
            data: data
        });
    });

    // Customer ends chat
    socket.on('customer-end-chat', (data) => {
        console.log('Customer ending chat:', data);

        try {
            const { chatSessionId } = data;

            if (chatSessionId && chatSessions.has(chatSessionId)) {
                const session = chatSessions.get(chatSessionId);
                session.status = 'ended';
                session.endedAt = new Date();

                socket.emit('chat-ended', {
                    message: 'Chat has ended. Thank you for contacting us! Have a great day!'
                });

                console.log(`Chat session ended: ${chatSessionId}`);

                // Leave the room
                socket.leave(chatSessionId);
            } else {
                socket.emit('end-chat-error', { message: 'Invalid chat session' });
            }
        } catch (error) {
            console.error('Error in customer-end-chat:', error);
            socket.emit('end-chat-error', { message: 'Failed to end chat' });
        }
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id} - ${reason}`);

        // Clean up customer data
        if (socket.customerId) {
            customers.delete(socket.customerId);
        }

        // Mark chat session as disconnected
        if (socket.chatSessionId && chatSessions.has(socket.chatSessionId)) {
            const session = chatSessions.get(socket.chatSessionId);
            session.status = 'disconnected';
            session.disconnectedAt = new Date();
        }
    });

    // General error handling
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// API routes for demo/testing
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/sessions', (req, res) => {
    const sessions = Array.from(chatSessions.values());
    res.json(sessions);
});

app.get('/api/customers', (req, res) => {
    const customerList = Array.from(customers.values());
    res.json(customerList);
});

app.get('/api/session/:id', (req, res) => {
    const session = chatSessions.get(req.params.id);
    if (session) {
        res.json(session);
    } else {
        res.status(404).json({ error: 'Session not found' });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Chat Widget Test Server running on http://localhost:${PORT}`);
    console.log(`📊 Admin Dashboard: http://localhost:${PORT}/api/sessions`);
    console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
    console.log('');
    console.log('To test the chat widget:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Click the chat button in the bottom-right corner');
    console.log('3. Fill in the form and start chatting!');
    console.log('');
    console.log('The server will automatically respond to messages with AI-like responses.');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };
