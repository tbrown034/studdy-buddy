# Security & Cost Control Documentation

## Current Implementation Status

### Model Configuration
- **Model**: GPT-4o Mini (gpt-4o-mini)
- **Provider**: OpenAI
- **Max Tokens**: 1000 per response
- **Temperature**: 0.7
- **Timeout**: 30 seconds

### Cost Protection Measures

#### Active Safeguards
1. **Rate Limiting**: 20 requests per minute per IP
2. **Token Limits**: Max 1000 tokens per response
3. **Context Truncation**: Max 20 messages in context
4. **Message Length**: Max 2000 characters per message
5. **Request Timeout**: 30 second timeout on API calls
6. **Input Validation**: Strict message format validation

#### Cost Monitoring
Every request logs:
- Timestamp
- Model used
- Prompt tokens
- Completion tokens
- Total tokens
- Estimated cost in USD

#### Estimated Costs
**GPT-4o Mini Pricing**:
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**With Current Limits**:
- Max cost per request: ~$0.0006 (1000 tokens)
- Max cost per minute: ~$0.012 (20 requests)
- Max cost per hour: ~$0.72 (theoretical max)
- Typical conversation: $0.001-0.003

### Security Protections

#### API Key Security
- Stored in .env.local (gitignored)
- Never exposed to client
- Server-side only processing
- .env.example provided for setup

#### Request Security
- IP-based rate limiting
- Request validation
- Error message sanitization
- Timeout protection
- Proper HTTP status codes

#### What's Protected
- API key never leaves server
- .env.local in .gitignore
- No client-side API calls
- Validated user input
- Bounded context growth

#### What's Not Protected (Production TODOs)
- No authentication system
- In-memory rate limiting (resets on deploy)
- No persistent usage tracking
- No cost alerts
- No user quotas

### API Route Details

**Endpoint**: POST /api/chat

**Rate Limits**:
- 20 requests per minute per IP
- Returns 429 on limit exceeded
- Includes X-RateLimit-Remaining header

**Request Validation**:
- Messages must be array
- Each message needs role and content
- Role must be user, assistant or system
- Content max 2000 characters
- Max 20 messages per request

**Response Headers**:
- X-RateLimit-Remaining: Shows requests left
- Retry-After: Seconds to wait (on 429)

**Error Codes**:
- 400: Invalid request format
- 429: Rate limit exceeded
- 500: Server error
- 504: Request timeout

### Configuration Constants

```typescript
const CONFIG = {
  MODEL: 'gpt-4o-mini',
  MAX_TOKENS: 1000,
  MAX_CONTEXT_MESSAGES: 20,
  MAX_MESSAGE_LENGTH: 2000,
  RATE_LIMIT_WINDOW_MS: 60000,
  MAX_REQUESTS_PER_WINDOW: 20,
  TIMEOUT_MS: 30000,
}
```

### Monitoring

**Server Logs Include**:
- Request timestamps
- Token usage per request
- Estimated costs
- Error details
- Rate limit violations

**Check logs with**:
```bash
npm run dev
# Watch console for [API Usage] and [API Error] logs
```

### Production Recommendations

1. **Add Authentication**
   - User accounts
   - API key per user
   - Session management

2. **Persistent Rate Limiting**
   - Use Redis or similar
   - Cross-instance rate limits
   - User-based quotas

3. **Cost Alerts**
   - Daily spend notifications
   - Automatic shutoff at threshold
   - Usage dashboards

4. **Enhanced Monitoring**
   - Database logging
   - Analytics integration
   - Real-time cost tracking

5. **Caching**
   - Cache common responses
   - Reduce redundant API calls
   - Lower costs significantly

### Testing Security

**Test Rate Limiting**:
```bash
# Send 21 requests quickly - should get 429 on 21st
for i in {1..21}; do
  curl -X POST http://localhost:3000/api/chat \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"test"}]}'
done
```

**Test Message Validation**:
```bash
# Should return 400 - message too long
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"'$(printf 'x%.0s' {1..2100})'"}]}'
```

### Environment Setup

1. Copy .env.example to .env.local
2. Add your OpenAI API key
3. Never commit .env.local
4. Verify .env* is in .gitignore

### Cost Estimates

**Development**:
- Testing: ~$0.10-0.50/day
- Light usage: ~$1-5/month

**Production** (estimated):
- 100 users/day: ~$3-10/month
- 1000 users/day: ~$30-100/month
- 10000 users/day: ~$300-1000/month

All estimates assume current limits and typical usage patterns.
