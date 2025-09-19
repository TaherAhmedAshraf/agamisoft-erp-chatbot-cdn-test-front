# File Access Implementation Summary

## Overview
The chat widget has been updated to handle secure file access through an API endpoint instead of direct URI access.

## Key Changes

### 1. Configuration
- Added `accessEndpoint` to the fileUpload configuration
- Example: `accessEndpoint: '/api/private/storage'`

### 2. Async File Access Function
```javascript
getFileAccessUrl: async function (fileUri) {
  if (!this.config.fileUpload?.accessEndpoint) {
    return fileUri; // Fallback to original URI
  }
  
  try {
    const fileName = fileUri.split('/').pop();
    const response = await axios.get(`${this.config.fileUpload.accessEndpoint}/${fileName}`);
    return response.data.url || response.data.accessUrl || response.data;
  } catch (error) {
    console.warn('Failed to get file access URL:', error);
    return fileUri; // Fallback to original URI
  }
}
```

### 3. Placeholder-Based Rendering
- Images and attachments are rendered immediately with placeholder URLs
- Each element includes a `data-file-uri` attribute for later URL resolution
- Actual URLs are loaded asynchronously after rendering

### 4. Async URL Resolution
- After a message is added to the DOM, the widget scans for elements with `data-file-uri` attributes
- Makes API calls to get actual access URLs
- Updates image `src` and link `href` attributes with the real URLs
- Graceful error handling - keeps placeholder if API fails

## API Endpoint Requirements

The access endpoint should:
- Accept GET requests to `/api/private/storage/:fileName`
- Return a JSON response with the actual file URL
- Handle authentication/authorization as needed

Example response formats supported:
```json
// Option 1: Direct URL string
"https://storage.example.com/actual-file-url"

// Option 2: Object with 'url' property
{
  "url": "https://storage.example.com/actual-file-url"
}

// Option 3: Object with 'accessUrl' property
{
  "accessUrl": "https://storage.example.com/actual-file-url"
}
```

## Benefits

1. **Security**: Files cannot be accessed directly by URI
2. **Authentication**: Access control handled by the API
3. **Performance**: Messages render immediately with placeholders
4. **Graceful Degradation**: Falls back to original URI if API fails
5. **Flexible**: Supports various API response formats

## Usage

Configure the widget with the access endpoint:

```javascript
const chatWidget = new ChatWidget({
  // ... other config
  fileUpload: {
    enabled: true,
    endpoint: '/api/files/upload',
    accessEndpoint: '/api/private/storage', // New property
    maxFileSize: 10 * 1024 * 1024,
    allowedTypes: ['image/*', '.pdf', '.doc', '.docx']
  }
});
```

The widget will automatically handle secure file access for all uploaded attachments.