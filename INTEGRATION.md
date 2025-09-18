# Chat Widget Integration Examples

This document provides practical examples of how to integrate the Chat Widget CDN into various scenarios.

## Basic Integration

### Minimal Setup
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
    <link rel="stylesheet" href="chat-widget.css">
</head>
<body>
    <h1>Welcome to my website</h1>
    
    <!-- Required: Socket.IO -->
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    <!-- Chat Widget -->
    <script src="chat-widget.min.js"></script>
    
    <script>
        ChatWidget.init({
            serverUrl: 'ws://localhost:3000'
        });
    </script>
</body>
</html>
```

## Advanced Configurations

### Corporate Website
```html
<script>
ChatWidget.init({
    serverUrl: 'wss://chat.yourcompany.com',
    companyName: 'Acme Corp Support',
    welcomeMessage: 'Hello! Welcome to Acme Corp. How can our support team assist you today?',
    theme: 'default',
    position: 'bottom-right',
    showMinimizeButton: true,
    autoOpen: false
});
</script>
```

### E-commerce Store
```html
<script>
ChatWidget.init({
    serverUrl: 'wss://support.mystore.com',
    companyName: 'MyStore Support',
    welcomeMessage: 'Hi! Need help with your order or have questions about our products?',
    theme: 'default',
    position: 'bottom-right',
    buttonText: 'Need help? Chat with us!',
    autoOpen: false
});
</script>
```

### SaaS Application
```html
<script>
ChatWidget.init({
    serverUrl: 'wss://help.mysaas.com',
    companyName: 'MySaaS Support',
    welcomeMessage: 'Welcome! Our technical support team is here to help you.',
    theme: 'dark', // Matches dark app theme
    position: 'bottom-left', // Avoid conflict with app's sidebar
    showMinimizeButton: true,
    debug: true // Enable for development
});
</script>
```

## Framework Integrations

### React Integration
```jsx
import { useEffect } from 'react';

function App() {
    useEffect(() => {
        // Initialize chat widget after component mounts
        if (window.ChatWidget) {
            window.ChatWidget.init({
                serverUrl: process.env.REACT_APP_CHAT_SERVER,
                companyName: 'Our Support Team',
                theme: 'default'
            });
        }

        // Cleanup on unmount
        return () => {
            if (window.ChatWidget) {
                window.ChatWidget.destroy();
            }
        };
    }, []);

    const openChat = () => {
        window.ChatWidget.open();
    };

    return (
        <div>
            <h1>My React App</h1>
            <button onClick={openChat}>Contact Support</button>
        </div>
    );
}
```

### Vue.js Integration
```vue
<template>
    <div>
        <h1>My Vue App</h1>
        <button @click="openChat">Contact Support</button>
    </div>
</template>

<script>
export default {
    mounted() {
        this.initChatWidget();
    },
    beforeDestroy() {
        if (window.ChatWidget) {
            window.ChatWidget.destroy();
        }
    },
    methods: {
        initChatWidget() {
            if (window.ChatWidget) {
                window.ChatWidget.init({
                    serverUrl: process.env.VUE_APP_CHAT_SERVER,
                    companyName: 'Vue Support',
                    theme: 'default'
                });
            }
        },
        openChat() {
            window.ChatWidget.open();
        }
    }
}
</script>
```

### Angular Integration
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

declare global {
    interface Window {
        ChatWidget: any;
    }
}

@Component({
    selector: 'app-root',
    template: `
        <h1>My Angular App</h1>
        <button (click)="openChat()">Contact Support</button>
    `
})
export class AppComponent implements OnInit, OnDestroy {
    ngOnInit() {
        this.initChatWidget();
    }

    ngOnDestroy() {
        if (window.ChatWidget) {
            window.ChatWidget.destroy();
        }
    }

    initChatWidget() {
        if (window.ChatWidget) {
            window.ChatWidget.init({
                serverUrl: 'wss://chat.myapp.com',
                companyName: 'Angular Support',
                theme: 'default'
            });
        }
    }

    openChat() {
        window.ChatWidget.open();
    }
}
```

## Conditional Loading

### Load Only on Specific Pages
```html
<script>
// Only load chat widget on support or contact pages
const shouldLoadChat = 
    window.location.pathname.includes('/support') ||
    window.location.pathname.includes('/contact') ||
    window.location.pathname.includes('/help');

if (shouldLoadChat) {
    ChatWidget.init({
        serverUrl: 'wss://chat.example.com',
        companyName: 'Support Team'
    });
}
</script>
```

### Load Based on User Status
```html
<script>
// Example: Only show chat for logged-in users
const userLoggedIn = document.body.classList.contains('user-logged-in');

if (userLoggedIn) {
    ChatWidget.init({
        serverUrl: 'wss://chat.example.com',
        companyName: 'Member Support',
        welcomeMessage: 'Welcome back! How can we help you today?'
    });
}
</script>
```

## Event Handling

### Listen for Widget Events
```html
<script>
ChatWidget.init({
    serverUrl: 'wss://chat.example.com',
    companyName: 'Support'
});

// Check connection status
setInterval(() => {
    const state = ChatWidget.getState();
    
    if (!state.isConnected) {
        console.warn('Chat widget disconnected');
        // Maybe show a notification to user
    }
    
    if (state.isChatStarted) {
        console.log('User is in an active chat');
        // Maybe disable other help options
    }
}, 5000);
</script>
```

## Custom Styling

### Override Default Colors
```css
/* Add after the widget CSS */
.chat-widget-container .chat-header {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4) !important;
}

.chat-widget-container .chat-send-btn {
    background: #FF6B6B !important;
}

.chat-widget-container .chat-start-btn {
    background: linear-gradient(135deg, #FF6B6B, #4ECDC4) !important;
}
```

### Custom Positioning
```css
.chat-widget-container {
    bottom: 100px !important; /* Space for your footer */
    right: 30px !important;
}

/* Mobile adjustments */
@media (max-width: 768px) {
    .chat-widget-container {
        bottom: 80px !important; /* Space for mobile navigation */
    }
}
```

## Testing Setup

### Local Development
```bash
# Install dependencies
npm install

# Start test server
npm start

# Open browser to http://localhost:3000
```

### Integration Testing
```javascript
// Test script to verify integration
function testChatWidget() {
    // Check if widget is loaded
    if (typeof ChatWidget === 'undefined') {
        console.error('❌ ChatWidget not loaded');
        return false;
    }

    // Check if Socket.IO is available
    if (typeof io === 'undefined') {
        console.error('❌ Socket.IO not loaded');
        return false;
    }

    // Initialize widget
    try {
        ChatWidget.init({
            serverUrl: 'ws://localhost:3000',
            debug: true
        });
        console.log('✅ ChatWidget initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ ChatWidget initialization failed:', error);
        return false;
    }
}

// Run test
testChatWidget();
```

## Production Deployment

### CDN Setup
```html
<!-- Production CDN links -->
<link rel="stylesheet" href="https://cdn.yourcompany.com/chat-widget/v1.0.0/chat-widget.css">
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
<script src="https://cdn.yourcompany.com/chat-widget/v1.0.0/chat-widget.min.js"></script>

<script>
ChatWidget.init({
    serverUrl: 'wss://chat-api.yourcompany.com',
    companyName: 'Your Company Support',
    theme: 'default'
});
</script>
```

### Performance Optimization
```html
<!-- Lazy load chat widget -->
<script>
// Load widget only when user shows intent to chat
let chatWidgetLoaded = false;

function loadChatWidget() {
    if (chatWidgetLoaded) return;
    
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.yourcompany.com/chat-widget.css';
    document.head.appendChild(cssLink);
    
    const script = document.createElement('script');
    script.src = 'https://cdn.yourcompany.com/chat-widget.min.js';
    script.onload = () => {
        ChatWidget.init({
            serverUrl: 'wss://chat-api.yourcompany.com',
            autoOpen: true // Open immediately after loading
        });
    };
    document.head.appendChild(script);
    
    chatWidgetLoaded = true;
}

// Trigger loading on user interaction
document.addEventListener('scroll', loadChatWidget, { once: true });
document.addEventListener('click', loadChatWidget, { once: true });
setTimeout(loadChatWidget, 10000); // Fallback after 10 seconds
</script>
```

## Security Best Practices

### Server-Side Validation
```javascript
// Example server-side validation
socket.on('customer-join', (data) => {
    // Validate and sanitize input
    const name = validator.escape(data.name || '').trim();
    const phone = validator.escape(data.phone || '').trim();
    const email = validator.isEmail(data.email || '') ? data.email : '';
    
    if (!name || !phone) {
        socket.emit('error', { message: 'Invalid input data' });
        return;
    }
    
    // Rate limiting
    if (rateLimiter.isBlocked(socket.handshake.address)) {
        socket.emit('error', { message: 'Too many requests' });
        return;
    }
    
    // Continue with chat creation...
});
```

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://cdn.socket.io 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline'; 
               connect-src 'self' wss://chat-api.yourcompany.com;">
```

This integration guide covers the most common scenarios for implementing the Chat Widget CDN. Adjust the configurations based on your specific needs and server setup.
