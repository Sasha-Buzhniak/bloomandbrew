# Auth-Gated App Testing Playbook (Emergent Google Auth)

## Step 1: Create Test User & Session
mongosh --eval "
use('<db_name>');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"

## Step 2: Test Backend API
curl -X GET "https://bloom-and-brew-co.preview.emergentagent.com/api/auth/me" -H "Authorization: Bearer YOUR_SESSION_TOKEN"
curl -X GET "https://bloom-and-brew-co.preview.emergentagent.com/api/auth/orders" -H "Authorization: Bearer YOUR_SESSION_TOKEN"

## Step 3: Browser Testing
await page.context.add_cookies([{ "name": "session_token", "value": "YOUR_SESSION_TOKEN", "domain": "bloom-and-brew-co.preview.emergentagent.com", "path": "/", "httpOnly": true, "secure": true, "sameSite": "None" }]);
await page.goto("https://bloom-and-brew-co.preview.emergentagent.com/account");

## Checklist
- User document has custom user_id field (MongoDB _id never exposed)
- Session user_id matches user.user_id exactly
- All queries use {"_id": 0} projection
- /api/auth/me returns user data (not 401)
- /account loads profile when authenticated, sign-in prompt otherwise
- Callback detection uses useLocation().hash, not window.location.hash
- AuthProvider skips /auth/me when hash contains session_id=

## Clean test data
db.users.deleteMany({email: /test\.user\./}); db.user_sessions.deleteMany({session_token: /test_session/});
