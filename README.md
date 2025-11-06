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
