# API Examples

This document provides practical examples of how to use the Bot Content Manager APIs.

## Authentication

### Login (Management API)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Verify Token

```bash
curl -X GET http://localhost:3001/api/auth/verify \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Management API (Authenticated)

### Get All Responses

```bash
curl -X GET http://localhost:3001/api/management/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "responses": [
    {
      "key": "greeting_welcome",
      "response_text": "Hello! How can I help you today?",
      "notes": "Default welcome message",
      "last_updated": "2024-01-15 10:30:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

### Search Responses

```bash
curl -X GET "http://localhost:3001/api/management/responses?search=greeting" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create New Response

```bash
curl -X POST http://localhost:3001/api/management/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "new_response_key",
    "response_text": "This is a new response message",
    "notes": "Optional notes about this response"
  }'
```

### Update Response

```bash
curl -X PUT http://localhost:3001/api/management/responses/greeting_welcome \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "response_text": "Welcome! How may I assist you today?",
    "notes": "Updated welcome message"
  }'
```

### Delete Response

```bash
curl -X DELETE http://localhost:3001/api/management/responses/old_response_key \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Delivery API (API Key Based)

### Get Response for Bot Integration

```bash
curl -X GET http://localhost:3001/api/delivery/responses/greeting_welcome \
  -H "X-API-Key: YOUR_DELIVERY_API_KEY"
```

Response:
```json
{
  "key": "greeting_welcome",
  "response_text": "Hello! How can I help you today?",
  "last_updated": "2024-01-15 10:30:00"
}
```

### Get All Responses for Bot Integration

```bash
curl -X GET http://localhost:3001/api/delivery/responses \
  -H "X-API-Key: YOUR_DELIVERY_API_KEY"
```

Response:
```json
{
  "responses": [
    {
      "key": "greeting_welcome",
      "response_text": "Hello! How can I help you today?",
      "last_updated": "2024-01-15 10:30:00"
    }
  ],
  "total": 1
}
```

## JavaScript Examples

### Frontend Integration

```javascript
// Login and get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const { token } = await loginResponse.json();

// Use token for authenticated requests
const responsesResponse = await fetch('/api/management/responses', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const responses = await responsesResponse.json();
```

### Bot Integration

```javascript
// Get response for bot
async function getBotResponse(key) {
  const response = await fetch(`/api/delivery/responses/${key}`, {
    headers: {
      'X-API-Key': 'your-delivery-api-key'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    return data.response_text;
  } else {
    console.error('Failed to fetch response:', response.statusText);
    return 'Sorry, I encountered an error. Please try again.';
  }
}

// Usage in bot
const welcomeMessage = await getBotResponse('greeting_welcome');
console.log(welcomeMessage); // "Hello! How can I help you today?"
```

### Python Bot Integration

```python
import requests

def get_bot_response(key):
    url = f"http://localhost:3001/api/delivery/responses/{key}"
    headers = {
        'X-API-Key': 'your-delivery-api-key'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        return data['response_text']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching response: {e}")
        return "Sorry, I encountered an error. Please try again."

# Usage
welcome_message = get_bot_response('greeting_welcome')
print(welcome_message)  # "Hello! How can I help you today?"
```

## Error Handling

### Common Error Responses

#### Authentication Error (401)
```json
{
  "error": "Access token required"
}
```

#### Invalid API Key (403)
```json
{
  "error": "Invalid API key"
}
```

#### Validation Error (400)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "param": "response_text",
      "msg": "Response text is required"
    }
  ]
}
```

#### Not Found Error (404)
```json
{
  "error": "Response not found",
  "key": "nonexistent_key"
}
```

#### Rate Limit Error (429)
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

## Rate Limits

- **Management API**: 100 requests per 15 minutes per IP address
- **Delivery API**: 100 requests per 15 minutes per IP address

## Best Practices

1. **Store tokens securely**: Never expose JWT tokens in client-side code
2. **Handle errors gracefully**: Always check response status and handle errors
3. **Use appropriate timeouts**: Set reasonable timeouts for API calls
4. **Cache responses**: Consider caching bot responses to reduce API calls
5. **Monitor usage**: Keep track of API usage to stay within rate limits
6. **Validate inputs**: Always validate user inputs before sending to the API

## Testing with Postman

### Import Collection

Create a Postman collection with these requests:

1. **Login**
   - Method: POST
   - URL: `{{baseUrl}}/api/auth/login`
   - Body: `{"username": "admin", "password": "admin123"}`
   - Tests: Save token to environment variable

2. **Get Responses**
   - Method: GET
   - URL: `{{baseUrl}}/api/management/responses`
   - Headers: `Authorization: Bearer {{token}}`

3. **Create Response**
   - Method: POST
   - URL: `{{baseUrl}}/api/management/responses`
   - Headers: `Authorization: Bearer {{token}}`
   - Body: `{"key": "test_key", "response_text": "Test response"}`

### Environment Variables

Set up these environment variables in Postman:
- `baseUrl`: `http://localhost:3001`
- `token`: (set automatically from login response)
- `deliveryApiKey`: `your-delivery-api-key`
