# 524 Environment Setup - Summary

## ✅ What We've Created

### Environment Files
All `.env.example` files have been created in the following locations:

```
524/
├── .env.example                          # Root environment variables
└── packages/
    ├── api/.env.example                  # API server configuration
    ├── web/.env.example                  # Next.js web dashboard
    ├── mobile/.env.example               # React Native mobile app
    ├── database/.env.example             # Database configuration
    └── notifications/.env.example        # SMS/notification service
```

### Documentation
- **ENV_CHECKLIST.md** - Interactive checklist to track your API key setup
- **docs/ENV_SETUP.md** - Detailed setup guide with examples
- **scripts/setup-env.sh** - Automated script to copy .env.example → .env

### Services Configured

#### ✅ Included (Based on your requirements)
- **Kakao** - OAuth login + Kakao Pay
- **Naver** - OAuth login + Maps + Cloud SENS (SMS)
- **Toss** - Payments
- **National Tax Service** - Business verification
- **AWS** - S3 storage + CloudFront CDN
- **PostgreSQL** - Database
- **Redis** - Caching
- **JWT** - Session management
- **Encryption** - Sensitive data protection

#### ❌ Not Included (As per your request)
- ~~Apple Sign In~~
- ~~Firebase~~
- ~~Naver Pay~~

## 🚀 Next Steps

### 1. Create Your Environment Files
```bash
# Run the setup script
./scripts/setup-env.sh

# This creates:
# - .env (root)
# - packages/api/.env
# - packages/web/.env.local (Next.js convention)
# - packages/mobile/.env
# - packages/database/.env
# - packages/notifications/.env
```

### 2. Get API Keys

Use the **ENV_CHECKLIST.md** file to track which services you need to register for:

#### Priority 1 (Essential for MVP)
1. **Kakao Developers** - Auth, Maps, Pay
2. **Naver Developers** - Auth, Maps
3. **Naver Cloud** - SENS (SMS)
4. **Toss Payments** - Payment processing
5. **PostgreSQL** - Local or cloud instance
6. **Redis** - Local or cloud instance

#### Priority 2 (For Production)
1. **AWS** - S3 and CloudFront
2. **National Tax Service API** - Business verification
3. **Sentry** - Error monitoring (optional)

### 3. Generate Secrets

```bash
# JWT Secret (copy output to JWT_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# JWT Refresh Secret (copy output to JWT_REFRESH_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Encryption Key (copy output to ENCRYPTION_KEY)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# NextAuth Secret (copy output to NEXTAUTH_SECRET)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Local Development

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@15

# Start Redis (macOS with Homebrew)
brew services start redis

# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start all development servers
npm run dev
```

### 5. Mobile App - Special Notes

For the mobile app, the `API_URL` depends on where you're running:

```bash
# iOS Simulator
API_URL=http://localhost:3000

# Android Emulator
API_URL=http://10.0.2.2:3000

# Physical Device
# Find your computer's IP: ifconfig | grep "inet "
API_URL=http://192.168.1.XXX:3000
```

## 📚 Reference Documents

1. **ENV_CHECKLIST.md** - Track what you've set up
2. **docs/ENV_SETUP.md** - Detailed instructions for each service
3. **ai/context/524-technical-specification.md** - Full technical architecture

## 🔐 Security Reminders

✅ **DO:**
- Keep `.env` files in `.gitignore` (already configured)
- Use different secrets for dev/staging/production
- Rotate secrets regularly in production
- Use strong random values for all secrets

❌ **DON'T:**
- Commit `.env` files to git
- Share API keys in public channels
- Use production keys in development
- Reuse the example values in production

## 💡 Pro Tips

### Testing Without Full Setup
You can start development with just:
- PostgreSQL
- Redis
- Generated JWT secrets

Then add Korean service APIs (Kakao, Naver, etc.) as needed.

### Shared Environment Variables
Most services use the root `.env` file. Package-specific `.env` files are for:
- Different ports (API vs Web)
- Package-specific configs
- Overriding root values

### Environment File Priority
```
packages/api/.env  →  Overrides root .env for API
packages/web/.env.local  →  Overrides for Web
packages/mobile/.env  →  Overrides for Mobile
```

## 🆘 Need Help?

### Common Issues

**"Can't connect to database"**
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres

# Create database
createdb beauty_marketplace
```

**"Redis connection refused"**
```bash
# Check Redis is running
redis-cli ping
# Should respond: PONG
```

**"Module not found" errors**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

**Mobile app can't reach API**
- Check firewall settings
- Ensure API and mobile are on same network
- Use correct IP address for your device type

## 📞 Support

- Technical Specification: `ai/context/524-technical-specification.md`
- Environment Details: `docs/ENV_SETUP.md`
- Checklist: `ENV_CHECKLIST.md`

---

**Ready to start?** Run `./scripts/setup-env.sh` and check off items in `ENV_CHECKLIST.md` as you go! 🎉

