# 🎵 MyMusic - Web Music Player

A modern browser-based music player with user authentication, playlists, likes, and playback controls built with HTML, CSS, and JavaScript.

## 🚀 Features

- User authentication (signup/login) with simple localStorage-backed account management
- Password strength indicator and validation (email, username, password complexity)
- Remember Me, forgot password prompt, logout
- Song playback (play/pause, next, previous)
- Seek progress bar + current time / duration display
- Volume slider with persistence
- Song list with likes (favorite song state saved in localStorage)
- Views: All Songs, Liked Songs, Recently Played, Search, Library, About
- Playlists:
  - Create/Delete playlists
  - Add/Remove songs from playlist
  - Save playlists in localStorage
- UI with header, sidebar, modals, and responsive controls
- Client-only app (no server required)

## 📁 Project Structure

- `index.html` - Main player UI
- `login.html` - Login page
- `signup.html` - Signup page
- `style.css` - Styling for all pages
- `script.js` - App logic: auth, playback, playlist, likes
- `README.md` - Project documentation

## 📦 Installation

**Clone the repository**:
   ```bash
   git clone https://github.com/vishwa7800/SkillTracker.git
   ```

## ▶️ How to run

1. Open the folder in your editor/OS.
2. Open `index.html` in a web browser (double-click or use Live Server/Vite, etc.).
3. Use **Sign Up** to create an account, then **Login** to access likes/playlists.
4. Click songs to play and use controls in the bottom player bar.

## 🛠️ Local Storage Keys

- `userEmail`, `user`, `pass` (hashed)
- `loggedIn`, `rememberMe`, `lastLogin`, `loginAttempts`
- `liked` (array of liked song ids)
- `recentlyPlayed` (history list)
- `playlists` (saved playlist objects)
- `volume` (slider value)

## 💡 Notes

- This app uses sample external MP3 URLs (SoundHelix) for demo playback.
- Auth is for educational/demo use only (not secure for production).
- Password hash uses a simple client-side integer-based hash function.

## 🖥️ Enhancements (future ideas)

- Add file upload (local songs)
- Persist data to a backend (Firebase / REST API)
- Better encryption and secure auth backend
- Mobile responsive improvements and theme switch
- Offline playback / service worker

 ## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
