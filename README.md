# 🚀 Enhanced Chat Widget CDN

A highly customizable, embeddable chat widget for customer support with extensive UI customization options.

## ✨ Features

- **Real-time Chat** - Instant messaging with Socket.IO
- **AI & Human Agents** - Seamless handoff between AI and human support
- **Mobile Responsive** - Works perfectly on all devices
- **Customizable Themes** - Light and dark themes available
- **Zero Dependencies** - Only requires Socket.IO
- **Easy Integration** - Just 3 lines of code to set up
- **🎨 Extensive UI Customization** - Colors, icons, positioning, text, and more!

## 🎨 New UI Customization Options

### Colors

Customize every aspect of the widget's color scheme:

```javascript
colors: {
    primary: '#667eea',        // Main brand color
    secondary: '#764ba2',      // Secondary brand color
    accent: '#ff6b6b',         // Accent/highlight color
    success: '#51cf66',        // Success states
    warning: '#ffd43b',        // Warning states
    error: '#ff4444',          // Error states
    background: '#ffffff',      // Widget background
    surface: '#f8f9fa',        // Secondary surfaces
    text: '#333333',           // Primary text
    textSecondary: '#666666',  // Secondary text
    border: '#e9ecef',         // Borders
    shadow: 'rgba(0,0,0,0.12)' // Shadows
}
```

### Floating Button Customization

Customize the appearance and behavior of the floating chat button:

```javascript
button: {
    size: 60,                    // Width and height in pixels
    shape: 'circle',            // 'circle', 'rounded', 'square'
    icon: 'default',            // 'default', 'message', 'chat', 'support', 'help', 'custom'
    customIcon: null,           // SVG string for custom icon
    backgroundColor: null,       // Override default gradient
    hoverEffect: 'scale',       // 'scale', 'glow', 'bounce', 'none'
    showNotification: false,    // Show notification indicator
    notificationColor: '#ff4444' // Notification color
}
```

### Position and Layout

Position the widget anywhere on the page with custom offsets:

```javascript
position: {
    corner: 'bottom-right',     // 'bottom-right', 'bottom-left', 'top-right', 'top-left'
    offset: { x: 20, y: 20 },  // Custom offset from corner
    zIndex: 9999                // Z-index for layering
}
```

### Widget Dimensions

Customize the size of the chat widget:

```javascript
dimensions: {
    width: 350,                 // Widget width
    height: 500,                // Widget height
    minWidth: 300,              // Minimum width
    maxWidth: 500,              // Maximum width
    minHeight: 400,             // Minimum height
    maxHeight: 600              // Maximum height
}
```

### Typography

Customize fonts, sizes, and line heights:

```javascript
typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,               // Base font size
    headerFontSize: 16,         // Header font size
    titleFontSize: 18,          // Title font size
    buttonFontSize: 14,         // Button font size
    lineHeight: 1.4             // Line height
}
```

### Text Content

Customize all text content throughout the widget:

```javascript
text: {
    companyName: 'Support',
    welcomeMessage: 'Hello! How can we help you today?',
    buttonText: 'Chat with us',
    connectingText: 'Connecting to chat service...',
    startChatText: 'Please provide your details to start chatting:',
    nameLabel: 'Name *',
    phoneLabel: 'Phone *',
    emailLabel: 'Email',
    startChatButton: 'Start Chat',
    minimizeButton: 'Minimize',
    closeButton: 'Close',
    sendButton: 'Send',
    typingText: 'Agent is typing...',
    placeholderText: 'Type your message...',
    noMessagesText: 'No messages yet. Start the conversation!'
}
```

### Animations and Effects

Customize entrance animations and hover effects:

```javascript
animations: {
    entrance: 'slide-up',       // 'slide-up', 'slide-down', 'fade-in', 'bounce-in', 'none'
    duration: 300,              // Animation duration in milliseconds
    easing: 'ease-out',         // CSS easing function
    hoverEffects: true,         // Enable hover effects
    typingIndicator: true       // Show typing indicator
}
```

### Borders and Shadows

Customize borders and shadow effects:

```javascript
styling: {
    borderRadius: 12,           // Border radius
    borderWidth: 0,             // Border width
    borderColor: 'transparent', // Border color
    shadow: '0 8px 40px rgba(0,0,0,0.12)',      // Default shadow
    shadowHover: '0 12px 50px rgba(0,0,0,0.15)' // Hover shadow
}
```

## 🚀 Quick Setup

### Step 1: Include Socket.IO

```html
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
```

### Step 2: Include Chat Widget Files

```html
<link rel="stylesheet" href="https://your-cdn.com/chat-widget.css" />
<script src="https://your-cdn.com/chat-widget.js"></script>
```

### Step 3: Initialize with Customization

```html
<script>
  ChatWidget.init({
    serverUrl: "http://your-backend-url",

    // Basic configuration
    theme: "default",
    autoOpen: false,

    // Enhanced UI customization
    colors: {
      primary: "#667eea",
      secondary: "#764ba2",
      accent: "#ff6b6b",
    },

    button: {
      size: 70,
      shape: "rounded",
      icon: "support",
      hoverEffect: "glow",
    },

    position: {
      corner: "top-right",
      offset: { x: 30, y: 30 },
    },

    text: {
      companyName: "My Company",
      welcomeMessage: "Hi there! How can we help?",
      buttonText: "Need help?",
    },
  });
</script>
```

## 🔧 Live Configuration Updates

Update the widget configuration on the fly without reinitializing:

```javascript
// Update colors
ChatWidget.updateColors({
  primary: "#ff6b6b",
  secondary: "#4ecdc4",
});

// Update button style
ChatWidget.updateButton({
  shape: "square",
  hoverEffect: "bounce",
});

// Update position
ChatWidget.updatePosition({
  corner: "top-left",
  offset: { x: 50, y: 50 },
});

// Update text content
ChatWidget.updateText({
  companyName: "New Company Name",
  welcomeMessage: "Updated welcome message!",
});

// Update multiple options at once
ChatWidget.updateConfig({
  colors: { primary: "#ff6b6b" },
  button: { size: 80 },
  position: { corner: "bottom-left" },
});
```

## 🎮 API Methods

```javascript
// Open/close the chat widget
ChatWidget.open();
ChatWidget.close();

// Get current state
const state = ChatWidget.getState();

// Destroy the widget
ChatWidget.destroy();

// Update configuration
ChatWidget.updateConfig(options);
ChatWidget.updateColors(colors);
ChatWidget.updateButton(buttonConfig);
ChatWidget.updatePosition(position);
ChatWidget.updateText(textConfig);
```

## 🎨 Icon Options

Choose from built-in icons or use custom SVG:

- **default** - Standard chat bubble
- **message** - Message icon
- **chat** - Chat conversation icon
- **support** - Support/checkmark icon
- **help** - Question mark icon
- **custom** - Your own SVG string

## 📍 Positioning Options

- **bottom-right** - Bottom right corner (default)
- **bottom-left** - Bottom left corner
- **top-right** - Top right corner
- **top-left** - Top left corner

## 🔄 Hover Effects

- **scale** - Button scales up on hover
- **glow** - Button glows with brand color
- **bounce** - Button bounces on hover
- **none** - No hover effects

## 📱 Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Complete Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Website</title>
    
    <!-- Socket.IO -->
    <script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>
    
    <!-- Chat Widget -->
    <link rel="stylesheet" href="https://your-cdn.com/chat-widget.css" />
    <script src="https://your-cdn.com/chat-widget.js"></script>
</head>
<body>
    <h1>Welcome to My Website</h1>
    <p>Your website content here...</p>
    
    <script>
      // Initialize chat widget with full customization
        ChatWidget.init({
        serverUrl: "ws://localhost:3000",

        // Enhanced UI customization
        colors: {
          primary: "#667eea",
          secondary: "#764ba2",
          accent: "#ff6b6b",
          background: "#ffffff",
          text: "#333333",
        },

        button: {
          size: 70,
          shape: "rounded",
          icon: "support",
          hoverEffect: "glow",
          showNotification: true,
        },

        position: {
          corner: "bottom-right",
          offset: { x: 25, y: 25 },
        },

        dimensions: {
          width: 380,
          height: 550,
        },

        text: {
          companyName: "My Company Support",
          welcomeMessage: "Hi there! How can we help you today?",
          buttonText: "Need help? Chat with us!",
        },

        animations: {
          entrance: "bounce-in",
          duration: 400,
        },
      });
    </script>
</body>
</html>
```

## 🎯 Use Cases

- **Brand Consistency** - Match your website's color scheme and typography
- **Custom Positioning** - Place the widget where it fits best in your layout
- **Localization** - Customize all text content for different languages
- **A/B Testing** - Easily test different button styles and positions
- **Seasonal Themes** - Update colors and styles for holidays or campaigns
- **Accessibility** - Adjust sizes and colors for better usability

## 🔄 Migration from v1

If you're upgrading from the previous version, update your configuration:

```javascript
// Old way
ChatWidget.init({
  position: "bottom-right",
  companyName: "Support",
});

// New way
ChatWidget.init({
  position: { corner: "bottom-right", offset: { x: 20, y: 20 } },
  text: { companyName: "Support" },
});
```

## 📄 License

MIT License - feel free to use in your projects!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
