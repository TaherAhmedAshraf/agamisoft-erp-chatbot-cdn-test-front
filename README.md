# Chat Widget CDN 🚀

A powerful, easy-to-integrate customer support chat widget that can be embedded into any website with just a few lines of code. Built with Socket.IO for real-time communication and designed for seamless integration with AI and human agent support systems.

## ✨ Features

- **Real-time Messaging**: Instant communication using Socket.IO
- **Session Persistence**: Maintains chat sessions across page refreshes
- **AI & Human Agent Support**: Seamless handoff between AI and human agents
- **Mobile Responsive**: Perfect experience on all devices
- **Customizable Themes**: Light and dark themes included
- **Zero Dependencies**: Only requires Socket.IO
- **Easy Integration**: Just 3 lines of code to set up
- **Auto-scroll**: Smart scrolling that doesn't interrupt reading
- **Typing Indicators**: Shows when agents are typing
- **Message Receipts**: Track message delivery and read status
- **Error Handling**: Robust error handling and retry mechanisms
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

### Step 1: Include Socket.IO
```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
```

### Step 2: Include Chat Widget Files
```html
<link rel="stylesheet" href="https://your-cdn.com/chat-widget.css">
<script src="https://your-cdn.com/chat-widget.js"></script>
```

### Step 3: Initialize the Widget
```html
<script>
  ChatWidget.init({
    serverUrl: 'http://your-backend-url',
    companyName: 'Your Company',
    welcomeMessage: 'Hello! How can we help you today?'
  });
</script>
```

## ⚙️ Configuration Options

```javascript
ChatWidget.init({
  // Required
  serverUrl: 'http://your-backend-url',    // Your socket server URL

  // Appearance
  position: 'bottom-right',                // 'bottom-right' or 'bottom-left'
  theme: 'default',                        // 'default' or 'dark'
  companyName: 'Your Company',             // Company name shown in header
  
  // Messages
  welcomeMessage: 'Hello! How can we help?', // Initial welcome message
  buttonText: 'Chat with us',              // Tooltip for chat button
  
  // Behavior
  showMinimizeButton: true,                // Show minimize button in header
  autoOpen: false,                         // Auto-open widget on page load
  debug: false                             // Enable debug logging
});
```

## 🎮 API Methods

```javascript
// Open the chat widget
ChatWidget.open();

// Close the chat widget
ChatWidget.close();

// Get current widget state
const state = ChatWidget.getState();
console.log(state);
// Returns: { isConnected, isChatStarted, isOpen, messagesCount, session, agentInfo }

// Clear session manually (useful for testing)
ChatWidget.clearSession();

// Destroy the widget completely
ChatWidget.destroy();
```

## 💾 Session Persistence

The widget automatically saves chat sessions to localStorage and restores them when the page is refreshed or revisited. This provides a seamless experience for users.

### How It Works
- **Auto-Save**: Sessions are automatically saved when a chat starts
- **Auto-Restore**: When the page loads, the widget checks for existing sessions
- **Session Validation**: Sessions are validated with the server to ensure they're still active
- **Expiration**: Sessions automatically expire after 24 hours
- **History Restoration**: Previous messages are restored from the server

### Session Events
Your server should handle these additional events for session management:

```javascript
// Customer attempts to resume a session
socket.on('customer-resume-session', (data) => {
  // data: { customerId, chatSessionId, customerName }
  // Validate session and respond with 'session-resumed' or 'session-resume-error'
});

// Validate if a session is still active
socket.on('validate-session', (data) => {
  // data: { customerId, chatSessionId }
  // Check if session is valid
});

// Request chat history for resumed session
socket.on('get-chat-history', (data) => {
  // data: { chatSessionId }
  // Respond with 'chat-history' event containing previous messages
});
```

### Server Response Events
```javascript
// Session successfully resumed
socket.emit('session-resumed', {
  customerId: 'customer-123',
  chatSessionId: 'session-456',
  customerName: 'John Doe',
  status: 'active'
});

// Session resume failed (expired or invalid)
socket.emit('session-resume-error', {
  error: 'Session expired',
  code: 'SESSION_EXPIRED'
});

// Chat history for resumed session
socket.emit('chat-history', {
  chatSessionId: 'session-456',
  messages: [
    {
      id: 'msg-1',
      message: 'Hello!',
      senderType: 'customer',
      timestamp: '2023-12-01T10:00:00Z'
    },
    // ... more messages
  ]
});
```

### Manual Session Management
```javascript
// Check if there's an active session
const state = ChatWidget.getState();
if (state.session.chatSessionId) {
  console.log('Active session:', state.session.chatSessionId);
}

// Clear session manually (e.g., for logout)
ChatWidget.clearSession();
```

## 🎨 Themes

The widget comes with two built-in themes:

### Default Theme (Light)
```javascript
ChatWidget.init({
  theme: 'default',
  // ... other options
});
```

### Dark Theme
```javascript
ChatWidget.init({
  theme: 'dark',
  // ... other options
});
```

## 📱 Responsive Design

The widget automatically adapts to different screen sizes:
- **Desktop**: Fixed position widget (350px × 500px)
- **Mobile**: Full-screen overlay for optimal mobile experience
- **Tablet**: Responsive sizing with touch-friendly controls

## 🔧 Complete Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    
    <!-- Socket.IO -->
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    
    <!-- Chat Widget -->
    <link rel="stylesheet" href="https://your-cdn.com/chat-widget.css">
    <script src="https://your-cdn.com/chat-widget.js"></script>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Your website content here...</p>
    
    <script>
        // Initialize chat widget
        ChatWidget.init({
            serverUrl: 'ws://localhost:3000',
            companyName: 'My Company Support',
            welcomeMessage: 'Hi there! How can we help you today?',
            theme: 'default',
            position: 'bottom-right',
            showMinimizeButton: true,
            autoOpen: false
        });
        
        // Optional: Handle events
        setTimeout(() => {
            const state = ChatWidget.getState();
            if (state.isConnected) {
                console.log('Chat widget connected successfully');
            }
        }, 1000);
    </script>
</body>
</html>
```

## 🔌 Backend Integration

Your Socket.IO server should handle these events:

### Customer Events (Sent by Widget)
```javascript
// Customer joins chat
socket.on('customer-join', (data) => {
  // data: { name, phone, email }
  // Respond with 'chat-started' event
});

// Customer attempts to resume session
socket.on('customer-resume-session', (data) => {
  // data: { customerId, chatSessionId, customerName }
  // Respond with 'session-resumed' or 'session-resume-error'
});

// Customer sends message
socket.on('send-message', (data) => {
  // data: { message, chatId, senderType, source, chatSessionId }
});

// Customer typing indicator
socket.on('typing', (data) => {
  // data: { chatId, isTyping, senderType }
});

// Customer ends chat
socket.on('customer-end-chat', (data) => {
  // data: { chatSessionId }
});

// Validate session
socket.on('validate-session', (data) => {
  // data: { customerId, chatSessionId }
});

// Get chat history
socket.on('get-chat-history', (data) => {
  // data: { chatSessionId }
});

// Message read receipt
socket.on('mark-message-as-read', (data) => {
  // data: { messageId, sessionId }
});
```

### Server Events (Sent to Widget)
```javascript
// Start chat session
socket.emit('chat-started', {
  customerId: 'customer-123',
  chatSessionId: 'session-456',
  message: 'Welcome! How can we help you today?'
});

// Session resumed successfully
socket.emit('session-resumed', {
  customerId: 'customer-123',
  chatSessionId: 'session-456',
  customerName: 'John Doe',
  status: 'active'
});

// Session resume failed
socket.emit('session-resume-error', {
  error: 'Session expired',
  code: 'SESSION_EXPIRED'
});

// Chat history for resumed session
socket.emit('chat-history', {
  chatSessionId: 'session-456',
  messages: [
    {
      id: 'msg-1',
      message: 'Hello!',
      senderType: 'customer',
      timestamp: '2023-12-01T10:00:00Z'
    }
    // ... more messages
  ]
});

// Send message to customer
socket.emit('receive-message', {
  id: 'msg-789',
  message: 'Hello! I am here to help.',
  senderType: 'agent', // or 'ai'
  timestamp: new Date().toISOString()
});

// Agent assigned to chat
socket.emit('agent-assigned', {
  agentName: 'John Doe',
  agentId: 'agent-123',
  source: 'web',
  chatSessionId: 'session-456'
});

// Agent typing indicator
socket.emit('agent-typing', {
  agentId: 'agent-123',
  isTyping: true,
  agentName: 'John Doe'
});

// Chat ended
socket.emit('chat-ended', {
  message: 'Chat has ended. Thank you for contacting us!'
});

// Error handling
socket.emit('error', { message: 'Connection error' });
socket.emit('message-error', { originalMessage: 'Failed message' });
socket.emit('end-chat-error', { message: 'Failed to end chat' });
```

## 🎯 Event Flow

### New Chat Session
1. **Widget Initialization**: Widget connects to Socket.IO server
2. **Customer Join**: Customer fills form and clicks "Start Chat"
3. **Chat Started**: Server creates session and sends welcome message
4. **Session Storage**: Widget automatically saves session to localStorage
5. **Messaging**: Real-time message exchange with typing indicators
6. **Agent Assignment**: Human agent can join the conversation
7. **Chat End**: Either party can end the chat session

### Resumed Session
1. **Widget Initialization**: Widget checks localStorage for existing session
2. **Session Resume**: Widget attempts to resume stored session with server
3. **Validation**: Server validates session and responds with success/error
4. **History Restoration**: If valid, server sends chat history
5. **Continue Chat**: User can continue from where they left off

## 📋 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Considerations

- Always use HTTPS in production
- Implement proper CORS settings on your server
- Validate all input data on the server side
- Use authentication tokens for sensitive operations
- Rate limit socket connections and messages

## 🎨 Customization

### Custom CSS
You can override the default styles by adding custom CSS after the widget CSS:

```css
/* Custom theme colors */
.chat-widget-container .chat-header {
    background: linear-gradient(135deg, #your-color1, #your-color2);
}

.chat-widget-container .chat-send-btn {
    background: #your-brand-color;
}
```

### Custom Positioning
```javascript
// Custom positioning using CSS
ChatWidget.init({
    position: 'bottom-right', // Start with default
    // ... other options
});

// Then add custom CSS
document.querySelector('.chat-widget-container').style.bottom = '30px';
document.querySelector('.chat-widget-container').style.right = '30px';
```

## 🐛 Troubleshooting

### Common Issues

1. **Widget not appearing**
   - Check that Socket.IO is loaded before the widget script
   - Verify the CSS file is properly linked
   - Check browser console for errors

2. **Connection issues**
   - Verify the `serverUrl` is correct and accessible
   - Check CORS settings on your server
   - Ensure Socket.IO server is running

3. **Styling issues**
   - Make sure CSS file is loaded after other stylesheets
   - Check for CSS conflicts with your site's styles
   - Verify viewport meta tag is present

### Debug Mode
Enable debug mode to see detailed logs:

```javascript
ChatWidget.init({
    debug: true,
    // ... other options
});
```

## 📦 File Structure

```
cdn/
├── chat-widget.js          # Full development version
├── chat-widget.min.js      # Minified production version
├── chat-widget.css         # Complete stylesheet
└── index.html             # Demo and documentation
```

## 🚀 Production Deployment

### Using CDN (Recommended)
```html
<!-- Production files from your CDN -->
<link rel="stylesheet" href="https://your-cdn.com/chat-widget.css">
<script src="https://your-cdn.com/chat-widget.min.js"></script>
```

### Self-Hosted
1. Upload files to your web server
2. Update file paths in your HTML
3. Ensure proper MIME types are set

### Performance Optimization
- Use the minified version (`chat-widget.min.js`) in production
- Enable gzip compression for all files
- Set proper cache headers for static assets
- Consider using a CDN for global distribution

## 📄 License

This project is available for use in both personal and commercial projects. Please ensure you comply with Socket.IO's licensing terms as well.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Check the troubleshooting section above
- Review browser console for error messages
- Ensure your Socket.IO server implements the required events

---

**Made with ❤️ for better customer support experiences**
#   a g a m i s o f t - e r p - c h a t b o t - c d n - t e s t - f r o n t  
 