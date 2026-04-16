Frontend/
│
├── public/
│
├── src/
│   ├── app/                    # Redux store setup
│   │   ├── store.js
│   │   └── hooks.js
│
│   ├── features/              # Redux slices (feature-based)
│   │   ├── auth/
│   │   │   ├── authSlice.js
│   │   │   
│   │   │
│   │   ├── player/
│   │   │   ├── playerSlice.js
│   │   │  
│   │   │
│   │   ├── playlist/
│   │   │   ├── playlistSlice.js
│   │   │   
│   │   │
│   │   └── recent/
│   │       ├── recentSlice.js
│   │      
│
│   ├── pages/                 # Route pages
│   │   ├── Home.jsx
│   │   ├── Search.jsx
│   │   ├── Playlist.jsx
│   │   ├── Login.jsx
│   │   └── NotFound.jsx
│
│   ├── components/            # Reusable UI
│   │   ├── ui/                # Buttons, cards, loaders
│   │   ├── layout/            # Navbar, Sidebar, Footer
│   │   ├── music/             # SongCard, PlayerBar
│   │   └── common/            # Modal, Skeleton, EmptyState
│
│   ├── services/              # API layer
│   │   ├── apiClient.js       # axios config
│   │   ├── auth.service.js
│   │   ├── audio.service.js
│   │   ├── playlist.service.js
│   │   ├── recent.service.js
│   │   └── search.service.js
│
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useAudio.js
│   │   ├── useDebounce.js
│   │   └── usePlayer.js
│
│   ├── utils/                 # Helpers
│   │   ├── formatTime.js
│   │   ├── constants.js
│   │   └── validators.js
│
│   ├── routes/                # Routing config
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│
│   ├── styles/
│   │   └── index.css
│
│   ├── App.jsx
│   └── main.jsx
│
├── index.html
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json