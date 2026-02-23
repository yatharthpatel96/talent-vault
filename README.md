# Talent Vault

Semiconductor Career & Research Hub — connect candidates, employers, and professors in the world of chips.

## Tech Stack

- React 18 (Vite)
- React Router v6
- Plain CSS (global + component-level)

## Run instructions

```bash
npm install
npm run dev
```

Then open the URL shown in the terminal (e.g. `http://localhost:5173`).

### Other commands

```bash
npm run build   # production build
npm run preview # preview production build
```

## Project structure

```
.
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── vite.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── styles/
│   │   └── global.css
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Navbar.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   └── pages/
│       ├── Home.jsx / Home.css
│       ├── Candidate.jsx / Candidate.css
│       ├── Employer.jsx / Employer.css
│       ├── Professor.jsx / Professor.css
│       ├── Resources.jsx / Resources.css
│       └── Login.jsx / Login.css
└── README.md
```

## Routes

| Path        | Page      |
|------------|-----------|
| `/`        | Home      |
| `/candidate` | Candidate |
| `/employer`  | Employer  |
| `/professor` | Professor |
| `/resources` | Resources |
| `/login`     | Login     |

## License

MIT.
