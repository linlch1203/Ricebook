# Assignment 5 - Frontend Design

## Student Information

- **netid**: cl278
- **frontend**: https://outrageous-table.surge.sh

## JSON Placeholder Users

You can log in with any of the 10 JSON Placeholder users. Use their username and street name as password:

| Username         | Password (Street Name) |
| ---------------- | ---------------------- |
| Bret             | Kulas Light            |
| Antonette        | Victor Plains          |
| Samantha         | Douglas Extension      |
| Karianne         | Hoeger Mall            |
| Kamren           | Skiles Walks           |
| Leopoldo_Corkery | Norberto Crossing      |
| Elwyn.Skiles     | Rex Trail              |
| Maxime_Nienow    | Ellsworth Summit       |
| Delphine         | Dayna Park             |
| Moriah.Stanton   | Kattie Turnpike        |

## Project Structure

\`\`\`
src/
├── App.tsx # Main app with routing
├── App.css
├── index.css
├── main.tsx
├── components/
│ ├── auth/
│ │ ├── Landing.tsx # Landing/Login/Registration page
│ │ └── Landing.css
│ ├── main/
│ │ ├── Main.tsx # Main feed page
│ │ └── Main.css
│ └── profile/
│ ├── Profile.tsx # Profile edit page
│ └── Profile.css
└── services/
└── api.ts # JSON Placeholder API service
\`\`\`

## Testing & Build

- `npm test -- --run` – runs Vitest logic suite with coverage reports in `coverage/`
- `npm run build` – compiles the production bundle with Vite

## Backend Service (Assignment 6)

Backend code lives in `backend/`. It is a standalone Express + MongoDB server (with in-memory fallback for tests) that implements the required endpoints and seeds the grading account.

- **Backend test user** – username `joey`, password `pass`
- **Local URL** – `http://localhost:3000`
- **Production URL** – `https://cl278-backend-ee56d2df6a76.herokuapp.com`

### Backend commands

```bash
cd backend
npm install
npm run dev       # start with nodemon
npm start         # start once
npm test          # run jasmine + junit-report.xml
```

The Jasmine flow registers a random `testUser<ID>`, logs in, posts an article, verifies `/articles` and `/articles/:id`, updates the headline, and ensures `/articles` is blocked after logout. A `junit-report.xml` file is emitted for submission.

### Deploying to Heroku

```bash
cd backend
heroku create cl278-backend
heroku buildpacks:set heroku/nodejs -a cl278-backend
heroku config:set MONGODB_URI="mongodb+srv://cl278_db_user:dVqQw8sEisQdRNcQ@hans.xpuov71.mongodb.net/ricebook?retryWrites=true&w=majority&appName=Hans" -a cl278-backend
git init && git add . && git commit -m "Backend"
git push heroku main
heroku ps:scale web=1 -a cl278-backend
```

After deployment, verify `/register`, `/login`, `/articles`, `/article`, `/headline`, and `/logout` on the Heroku URL and update the Production URL noted above.

### Deployment verification (2025-11-19)

Hit the live backend at `https://cl278-backend-ee56d2df6a76.herokuapp.com`:

```bash
curl -c cookie -H "Content-Type: application/json" \
	-d '{"username":"joey","password":"pass"}' \
	https://cl278-backend-ee56d2df6a76.herokuapp.com/login
curl -b cookie https://cl278-backend-ee56d2df6a76.herokuapp.com/articles
curl -b cookie -H "Content-Type: application/json" \
	-d '{"text":"hello from curl","image":""}' \
	https://cl278-backend-ee56d2df6a76.herokuapp.com/article
curl -b cookie https://cl278-backend-ee56d2df6a76.herokuapp.com/articles/1
curl -b cookie -X PUT -H "Content-Type: application/json" \
	-d '{"headline":"new headline from curl"}' \
	https://cl278-backend-ee56d2df6a76.herokuapp.com/headline
curl -b cookie -X PUT https://cl278-backend-ee56d2df6a76.herokuapp.com/logout
```

Responses confirmed successful login, article CRUD, headline update, and logout. All Jasmine specs pass locally via `npm test` (7 specs, 0 failures) which refreshed `backend/junit-report.xml`.
