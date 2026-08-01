zurai02 Development - Secure Roblox Script Platform
A secure Roblox script execution platform with OAuth 2.0 authentication, script encryption, and monetization integration.
Features
Script Protection: Scripts are encrypted and only accessible through verified executors
OAuth 2.0 Authentication: Login with Google and Roblox
Account Linking: Link Linkvertise and LootLabs accounts
Execution Tracking: Real-time execution counter and statistics
Multi-Format Support: .lz, .lua, and .txt script formats
OAuth Configuration
Roblox OAuth 2.0
Client ID: 3255755288279625071
Client Secret: RBX-cE3K03ijx0OmTf3zok1KFZNrrSDUkjhebgC36p_ifgh2lF-Jbe6XFMGcYpi6yW06
Redirect URI: https://zurai02.is-a.dev/redirect.html
Scopes: openid, profile
Google OAuth 2.0
Client ID: YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
Redirect URI: https://zurai02.is-a.dev/redirect.html
Scopes: openid, email, profile
File Structure
plain
zurai02_platform/
├── index.html          # Main platform page
├── styles.css          # Styling and themes
├── app.js              # Main application logic
├── privacy.html        # Privacy Policy
├── tos.html            # Terms of Service
├── redirect.html       # OAuth redirect handler
└── scripts/
    └── sample_protected.lz  # Example encrypted script
Setup Instructions
Replace YOUR_GOOGLE_CLIENT_ID in app.js and redirect.html with your actual Google OAuth Client ID
Configure your Roblox OAuth app with the provided Client ID and Secret
Set the redirect URI to https://yourdomain.com/redirect.html in both Google and Roblox developer consoles
Deploy all files to your web server
Ensure HTTPS is enabled for OAuth security
Security Notes
Client secrets should ideally be handled server-side
Script encryption uses client-side XOR for demo - use AES-256 in production
Always use HTTPS for OAuth flows
Implement rate limiting on your backend
License
MIT License - zurai02 Development 2026
