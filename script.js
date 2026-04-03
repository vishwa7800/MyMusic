// Song library - Array of all available songs
const songs = [
  { title: "Summer Vibes", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Electric Dreams", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Midnight Echo", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Ocean Waves", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { title: "Golden Hour", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { title: "Starlight Night", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { title: "Urban Jungle", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
];

// Global variables
let currentSong = 0; // Index of currently playing song
let liked = JSON.parse(localStorage.getItem("liked")) || []; // Array of liked song indexes
let isPlaying = false; // Track if music is playing
let recentlyPlayed = JSON.parse(localStorage.getItem("recentlyPlayed")) || []; // Recently played songs
let playlists = JSON.parse(localStorage.getItem("playlists")) || []; // Custom playlists
let currentPlaylistId = null; // Currently viewing playlist

// DOM element references
const audio = document.getElementById("audio");
const progressBar = document.getElementById("progress");
const playBtn = document.getElementById("playBtn");
const songList = document.getElementById("songList");
const sectionTitle = document.getElementById("sectionTitle");
const nowPlaying = document.getElementById("nowPlaying");

/* AUTH - Authentication Functions */
// Simple hash function for password security
function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate username
function isValidUsername(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username);
}

// Check password strength
function checkPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  if (strength <= 2) return { level: 'weak', text: 'Weak password', color: '#ff5252' };
  if (strength <= 3) return { level: 'medium', text: 'Medium password', color: '#ffa726' };
  return { level: 'strong', text: 'Strong password', color: '#1db954' };
}

// Update password strength indicator
function updatePasswordStrength(password) {
  const strengthDiv = document.getElementById("passwordStrength");
  if (!strengthDiv) return;
  
  if (password.length === 0) {
    strengthDiv.classList.remove('show');
    strengthDiv.innerHTML = '';
    return;
  }
  
  const strength = checkPasswordStrength(password);
  strengthDiv.classList.add('show');
  strengthDiv.innerHTML = `
    <div style="color: ${strength.color};">${strength.text}</div>
    <div class="strength-bar strength-${strength.level}"></div>
  `;
}

// Show error message
function showError(elementId, message) {
  const errorDiv = document.getElementById(elementId);
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => errorDiv.classList.remove('show'), 5000);
  } else {
    alert(message);
  }
}

// Toggle password visibility
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
}

// Create new user account with validation
function signup() {
  const email = document.getElementById("signupEmail")?.value.trim();
  const username = document.getElementById("signupUser")?.value.trim();
  const password = document.getElementById("signupPass")?.value;
  const confirmPass = document.getElementById("signupConfirmPass")?.value;
  
  // Validation checks
  if (!email || !username || !password || !confirmPass) {
    showError("signupError", "Please fill in all fields");
    return;
  }
  
  if (!isValidEmail(email)) {
    showError("signupError", "Please enter a valid email address");
    return;
  }
  
  if (!isValidUsername(username)) {
    showError("signupError", "Username must be at least 3 characters and contain only letters, numbers, and underscores");
    return;
  }
  
  if (password.length < 8) {
    showError("signupError", "Password must be at least 8 characters long");
    return;
  }
  
  if (password !== confirmPass) {
    showError("signupError", "Passwords do not match");
    return;
  }
  
  const strength = checkPasswordStrength(password);
  if (strength.level === 'weak') {
    showError("signupError", "Please use a stronger password (include uppercase, lowercase, numbers, and symbols)");
    return;
  }
  
  // Check if user already exists
  if (localStorage.getItem("userEmail") === email) {
    showError("signupError", "An account with this email already exists");
    return;
  }
  
  // Save user data with hashed password
  localStorage.setItem("userEmail", email);
  localStorage.setItem("user", username);
  localStorage.setItem("pass", hashPassword(password));
  localStorage.setItem("accountCreated", new Date().toISOString());
  
  alert("Account created successfully! Please login.");
  window.location = "login.html";
}

// Verify user credentials and login
function login() {
  const userInput = document.getElementById("loginUser")?.value.trim();
  const password = document.getElementById("loginPass")?.value;
  const rememberMe = document.getElementById("rememberMe")?.checked;
  
  if (!userInput || !password) {
    showError("loginError", "Please enter both username/email and password");
    return;
  }
  
  const storedEmail = localStorage.getItem("userEmail");
  const storedUsername = localStorage.getItem("user");
  const storedPass = localStorage.getItem("pass");
  
  // Check if account exists
  if (!storedEmail || !storedUsername || !storedPass) {
    showError("loginError", "No account found. Please sign up first.");
    return;
  }
  
  // Verify credentials (allow login with email or username)
  const isEmailMatch = userInput === storedEmail;
  const isUsernameMatch = userInput === storedUsername;
  const isPasswordMatch = hashPassword(password) === storedPass;
  
  if ((isEmailMatch || isUsernameMatch) && isPasswordMatch) {
    localStorage.setItem("loggedIn", true);
    localStorage.setItem("lastLogin", new Date().toISOString());
    
    if (rememberMe) {
      localStorage.setItem("rememberMe", true);
    }
    
    window.location = "index.html";
  } else {
    showError("loginError", "Invalid email/username or password");
    
    // Track failed login attempts
    let attempts = parseInt(localStorage.getItem("loginAttempts") || "0");
    attempts++;
    localStorage.setItem("loginAttempts", attempts.toString());
    
    if (attempts >= 3) {
      showError("loginError", "Multiple failed login attempts. Please check your credentials carefully.");
    }
  }
}

// Forgot password functionality
function forgotPassword() {
  const email = prompt("Enter your registered email address:");
  if (!email) return;
  
  const storedEmail = localStorage.getItem("userEmail");
  
  if (email === storedEmail) {
    alert("Password reset link would be sent to: " + email + "\n(In a real app, this would send an email)");
  } else {
    alert("No account found with this email address");
  }
}

// Logout user and clear session data
function logout() {
  const confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) return;
  
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("lastLogin");
  localStorage.removeItem("rememberMe");
  localStorage.setItem("loginAttempts", "0");
  window.location = "index.html";
}

/* MUSIC - Player Functions */
// Display songs in the song list
function loadSongs(list) {
  if (!songList) return;
  
  songList.innerHTML = "";
  
  list.forEach((song) => {
    const originalIndex = songs.findIndex(s => s.title === song.title);
    const isLiked = liked.includes(originalIndex);
    
    const div = document.createElement("div");
    div.className = "song";
    if (currentSong === originalIndex && isPlaying) {
      div.classList.add("active");
    }
    
    div.innerHTML = `
      <div class="song-info">
        <span class="song-title">${song.title}</span>
      </div>
      <div class="song-actions">
        ${localStorage.getItem("loggedIn") ? `<button class="song-action-btn" onclick="event.stopPropagation(); likeSong(${originalIndex})" title="Like">
          ${isLiked ? '❤️' : '🤍'}
        </button>` : `<button class="song-action-btn" onclick="event.stopPropagation(); showLoginMessage()" title="Login to like songs">
          🤍
        </button>`}
        ${currentPlaylistId ? `<button class="song-action-btn" onclick="event.stopPropagation(); removeSongFromPlaylist('${song.title.replace(/'/g, "&#39;")}')" title="Remove from playlist">－</button>` : `<button class="song-action-btn" onclick="event.stopPropagation(); addSongToPlaylistFromRow('${song.title.replace(/'/g, "&#39;")}')" title="Add to playlist">＋</button>`}
      </div>
    `;
    div.onclick = () => playSong(originalIndex);
    songList.appendChild(div);
  });
}

// Play a specific song by index
function playSong(index) {
  currentSong = index;
  audio.src = songs[index].src;
  audio.play();
  isPlaying = true;
  updatePlayButton();
  nowPlaying.innerText = `Now Playing: ${songs[index].title}`;
  highlightCurrentSong();
  
  // Add to recently played
  addToRecentlyPlayed(index);
}

// Play or pause the current song
function togglePlay() {
  if (!audio.src) {
    playSong(0);
    return;
  }
  
  if (audio.paused) {
    audio.play();
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  updatePlayButton();
}

// Update play button icon (play/pause)
function updatePlayButton() {
  if (playBtn) {
    playBtn.innerText = isPlaying ? "⏸" : "▶";
  }
}

// Play next song in list
function nextSong() {
  playSong((currentSong + 1) % songs.length);
}

// Play previous song in list
function prevSong() {
  playSong((currentSong - 1 + songs.length) % songs.length);
}

// Add or remove song from liked list
function likeSong(index) {
  if (!localStorage.getItem("loggedIn")) {
    showLoginMessage();
    return;
  }
  
  if (liked.includes(index)) {
    liked = liked.filter(i => i !== index);
  } else {
    liked.push(index);
  }
  localStorage.setItem("liked", JSON.stringify(liked));
  
  // Only update the specific song's like button, don't reload entire list
  const songElements = document.querySelectorAll('.song');
  songElements.forEach((el, idx) => {
    const songIndex = songs.findIndex(s => s.title === el.querySelector('.song-title')?.textContent);
    if (songIndex !== -1) {
      const likeBtn = el.querySelector('.song-action-btn');
      if (likeBtn && likeBtn.title === "Like") {
        likeBtn.innerHTML = liked.includes(songIndex) ? '❤️' : '🤍';
      }
    }
  });
}

// Display only liked songs
function showLiked() {
  if (!localStorage.getItem("loggedIn")) {
    showLoginMessage();
    return;
  }
  
  currentPlaylistId = null;
  const likedSongs = liked.map(i => songs[i]);
  sectionTitle.innerText = "Liked Songs";
  loadSongs(likedSongs);
}

// Display all songs (home view)
function showHome() {
  currentPlaylistId = null;
  sectionTitle.innerText = "All Songs";
  loadSongs(songs);
}

// Display about page information
function showAbout() {
  sectionTitle.innerText = "About MyMusic";
  songList.innerHTML = `
    <div style="padding: 20px; background: #181818; border-radius: 6px;">
      <h3>Welcome to MyMusic</h3>
      <p style="margin-top: 10px; line-height: 1.6; color: #b3b3b3;">
        MyMusic is a modern music player application that lets you enjoy your favorite songs.
        <br><br>
        <strong>Features:</strong>
        <ul style="margin-top: 10px; margin-left: 20px;">
          <li>Stream music from various sources</li>
          <li>Like your favorite songs</li>
          <li>Manage your playlists</li>
          <li>Beautiful and intuitive UI</li>
        </ul>
        <br>
        <strong>Get Started:</strong>
        <br>Create an account to save your liked songs and access personalized features.
      </p>
    </div>
  `;
}

// Display search interface
function showSearch() {
  currentPlaylistId = null;
  sectionTitle.innerText = "Search";
  songList.innerHTML = `
    <div style="padding: 20px; background: #181818; border-radius: 6px;">
      <input type="text" id="searchInput" placeholder="Search for songs..." 
        style="width: 100%; padding: 12px; border: none; border-radius: 5px; background: #282828; color: white; font-size: 14px;"
        onkeyup="performSearch(this.value)">
      <div id="searchResults" style="margin-top: 20px;"></div>
    </div>
  `;
}

// Search for songs by title
function performSearch(query) {
  const results = songs.filter(song => 
    song.title.toLowerCase().includes(query.toLowerCase())
  );
  
  const searchResults = document.getElementById("searchResults");
  if (query.trim() === "") {
    searchResults.innerHTML = "";
    return;
  }
  
  if (results.length === 0) {
    searchResults.innerHTML = "<p style='color: #b3b3b3;'>No songs found</p>";
  } else {
    loadSongs(results);
  }
}

// Display user's library summary
function showLibrary() {
  currentPlaylistId = null;
  sectionTitle.innerText = "Your Library";
  songList.innerHTML = `
    <div style="padding: 20px; background: #181818; border-radius: 6px;">
      <h3>Your Music Library</h3>
      <p style="margin-top: 10px; color: #b3b3b3;">
        ${liked.length} liked songs
      </p>
      <button onclick="showLiked()" 
        style="margin-top: 20px; padding: 12px 24px; background: #1db954; border: none; border-radius: 25px; color: white; font-weight: bold; cursor: pointer;">
        View Liked Songs
      </button>
    </div>
  `;
}

// Alert user to login before liking
function showLoginMessage() {
  alert("Please login or sign up to access this feature!");
}

// Add song to recently played
function addToRecentlyPlayed(index) {
  const songTitle = songs[index].title;
  recentlyPlayed = recentlyPlayed.filter(item => item.title !== songTitle);
  recentlyPlayed.unshift({ title: songTitle, date: new Date().toISOString() });
  if (recentlyPlayed.length > 20) recentlyPlayed.pop();
  localStorage.setItem("recentlyPlayed", JSON.stringify(recentlyPlayed));
}

// Display recently played songs
function showRecentlyPlayed() {
  currentPlaylistId = null;
  sectionTitle.innerText = "Recently Played";
  const recentSongs = recentlyPlayed.map(item => 
    songs.find(s => s.title === item.title)
  ).filter(s => s);
  
  if (recentSongs.length === 0) {
    songList.innerHTML = '<p style="color: #b3b3b3; padding: 20px;">No recently played songs yet</p>';
  } else {
    loadSongs(recentSongs);
  }
}

// Create new playlist
function createNewPlaylist() {
  if (!localStorage.getItem("loggedIn")) {
    showLoginMessage();
    return;
  }
  openPlaylistModal();
}

// Open playlist modal
function openPlaylistModal() {
  const modal = document.getElementById("playlistModal");
  const input = document.getElementById("playlistNameInput");
  const error = document.getElementById("playlistError");
  if (!modal || !input || !error) return;

  error.textContent = "";
  input.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => input.focus(), 50);
}

// Close playlist modal
function closePlaylistModal() {
  const modal = document.getElementById("playlistModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

// Confirm playlist creation from modal
function confirmCreatePlaylist() {
  const input = document.getElementById("playlistNameInput");
  const error = document.getElementById("playlistError");
  if (!input || !error) return;

  const playlistName = input.value.trim();

  if (playlistName === "") {
    error.textContent = "Playlist name cannot be empty";
    return;
  }

  if (playlists.some(p => p.name.toLowerCase() === playlistName.toLowerCase())) {
    error.textContent = "A playlist with this name already exists";
    return;
  }

  const newPlaylist = {
    id: Date.now(),
    name: playlistName,
    songs: []
  };

  playlists.push(newPlaylist);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  loadPlaylists();
  closePlaylistModal();
  alert(`Playlist "${playlistName}" created!`);
}

// Load playlists in sidebar
function loadPlaylists() {
  const playlistsList = document.getElementById("playlistsList");
  if (!playlistsList) return;
  
  playlistsList.innerHTML = "";
  
  playlists.forEach(playlist => {
    const div = document.createElement("div");
    div.style.cssText = "padding: 8px 16px; color: #b3b3b3; font-size: 13px; cursor: pointer; border-radius: 5px; margin: 2px 0; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s ease;";
    div.onmouseover = () => div.style.background = "#282828";
    div.onmouseout = () => div.style.background = "transparent";
    
    div.innerHTML = `
      <span onclick="viewPlaylist(${playlist.id})" style="flex: 1; cursor: pointer;">📌 ${playlist.name}</span>
      <span onclick="deletePlaylist(${playlist.id}); event.stopPropagation();" style="cursor: pointer; color: #ff5252; font-size: 16px;">✕</span>
    `;
    playlistsList.appendChild(div);
  });
}

// View playlist songs
function viewPlaylist(playlistId) {
  const playlist = playlists.find(p => p.id === playlistId);
  if (!playlist) return;
  
  currentPlaylistId = playlistId;
  sectionTitle.innerText = `📌 ${playlist.name}`;
  
  if (playlist.songs.length === 0) {
    songList.innerHTML = `
      <div style="padding: 20px; background: #181818; border-radius: 6px; text-align: center;">
        <p style="color: #b3b3b3;">No songs in this playlist yet</p>
        <button onclick="addSongsToPlaylist()" style="margin-top: 10px; padding: 8px 16px; background: #1db954; border: none; border-radius: 5px; color: white; cursor: pointer;">Add Songs</button>
      </div>
    `;
  } else {
    const playlistSongs = playlist.songs.map(title => songs.find(s => s.title === title)).filter(s => s);
    loadSongs(playlistSongs);
  }
}

// Add songs to current playlist
function addSongsToPlaylist() {
  if (!currentPlaylistId) return;

  openAddSongModal("", currentPlaylistId);
}

// Open add song modal
function openAddSongModal(songTitle = "", selectedPlaylistId = null) {
  const modal = document.getElementById("addSongModal");
  const input = document.getElementById("addSongInput");
  const error = document.getElementById("addSongError");
  if (!modal || !input || !error) return;

  error.textContent = "";
  input.value = songTitle;
  modal.classList.remove("hidden");
  populatePlaylistSelect(selectedPlaylistId);
  setTimeout(() => input.focus(), 50);
}

// Populate playlist select
function populatePlaylistSelect(selectedPlaylistId = null) {
  const select = document.getElementById("addSongPlaylistSelect");
  const error = document.getElementById("addSongError");
  if (!select) return;

  select.innerHTML = "";

  if (playlists.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No playlists available";
    select.appendChild(option);
    select.disabled = true;
    if (error) error.textContent = "Create a playlist first";
    return;
  }

  select.disabled = false;
  playlists.forEach((playlist) => {
    const option = document.createElement("option");
    option.value = playlist.id;
    option.textContent = playlist.name;
    select.appendChild(option);
  });

  if (selectedPlaylistId) {
    select.value = String(selectedPlaylistId);
  }
}

// Close add song modal
function closeAddSongModal() {
  const modal = document.getElementById("addSongModal");
  if (!modal) return;
  modal.classList.add("hidden");
}

// Confirm add song to playlist
function confirmAddSongToPlaylist() {
  const input = document.getElementById("addSongInput");
  const error = document.getElementById("addSongError");
  const select = document.getElementById("addSongPlaylistSelect");
  if (!input || !error || !select) return;

  if (select.disabled) {
    error.textContent = "Create a playlist first";
    return;
  }

  const songTitle = input.value.trim();
  if (songTitle === "") {
    error.textContent = "Song title cannot be empty";
    return;
  }

  const song = songs.find(s => s.title.toLowerCase().includes(songTitle.toLowerCase()));
  if (!song) {
    error.textContent = "Song not found";
    return;
  }

  const selectedPlaylistId = parseInt(select.value, 10);
  const playlist = playlists.find(p => p.id === selectedPlaylistId);
  if (!playlist) {
    error.textContent = "Please choose a playlist";
    return;
  }

  if (playlist.songs.includes(song.title)) {
    error.textContent = "Song already in playlist";
    return;
  }

  playlist.songs.push(song.title);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  closeAddSongModal();
  viewPlaylist(selectedPlaylistId);
}

// Open add-song modal from a song row
function addSongToPlaylistFromRow(title) {
  if (!localStorage.getItem("loggedIn")) {
    showLoginMessage();
    return;
  }
  openAddSongModal(title, currentPlaylistId);
}

// Remove song from current playlist
function removeSongFromPlaylist(songTitle) {
  if (!currentPlaylistId) return;
  
  const playlist = playlists.find(p => p.id === currentPlaylistId);
  if (!playlist) return;
  
  playlist.songs = playlist.songs.filter(title => title !== songTitle);
  localStorage.setItem("playlists", JSON.stringify(playlists));
  viewPlaylist(currentPlaylistId);
}

// Delete playlist
function deletePlaylist(playlistId) {
  if (confirm("Delete this playlist?")) {
    playlists = playlists.filter(p => p.id !== playlistId);
    localStorage.setItem("playlists", JSON.stringify(playlists));
    loadPlaylists();
    if (currentPlaylistId === playlistId) {
      showHome();
    }
  }
}

// Set volume
function setVolume(value) {
  audio.volume = value / 100;
  const volumePercent = document.getElementById("volumePercent");
  if (volumePercent) {
    volumePercent.innerText = value + "%";
  }
  localStorage.setItem("volume", value);
}

// Highlight the currently playing song
function highlightCurrentSong() {
  document.querySelectorAll('.song').forEach((el) => {
    el.classList.remove('active');
  });
  
  const songElements = document.querySelectorAll('.song');
  if (songElements[currentSong]) {
    songElements[currentSong].classList.add('active');
  }
}

// Convert seconds to MM:SS format
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Audio event listeners - Handle playback events
if (audio) {
  // Update progress bar as song plays
  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      progressBar.value = (audio.currentTime / audio.duration) * 100;
      const currentTimeEl = document.getElementById("currentTime");
      const durationEl = document.getElementById("duration");
      if (currentTimeEl) currentTimeEl.innerText = formatTime(audio.currentTime);
      if (durationEl) durationEl.innerText = formatTime(audio.duration);
    }
  }, false);

  // Auto-play next song when current ends
  audio.addEventListener('ended', nextSong, false);

  // Update UI when song plays
  audio.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButton();
    highlightCurrentSong();
  }, false);

  // Update UI when song pauses
  audio.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButton();
  }, false);

  // Allow user to seek by dragging progress bar
  if (progressBar) {
    progressBar.addEventListener('input', (e) => {
      const time = (e.target.value / 100) * audio.duration;
      audio.currentTime = time;
    }, false);
  }

  // Volume control
  const volumeSlider = document.getElementById("volumeSlider");
  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      setVolume(e.target.value);
    }, false);
  }
}

// Initialize app on page load - Display all songs
if (songList) {
  loadSongs(songs);
}

// Show/hide login/logout buttons based on auth status
function updateAuthButtons() {
  const loginLink = document.getElementById("loginLink");
  const signupLink = document.getElementById("signupLink");
  const logoutLink = document.getElementById("logoutLink");
  
  if (localStorage.getItem("loggedIn")) {
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "inline-block";
  } else {
    if (loginLink) loginLink.style.display = "inline-block";
    if (signupLink) signupLink.style.display = "inline-block";
    if (logoutLink) logoutLink.style.display = "none";
  }
}

// Check if user is logged in and update buttons
updateAuthButtons();

// Add event listeners for password strength checking on signup page
document.addEventListener('DOMContentLoaded', function() {
  const signupPass = document.getElementById("signupPass");
  if (signupPass) {
    signupPass.addEventListener('input', function(e) {
      updatePasswordStrength(e.target.value);
    });
  }
  
  // Reset login attempts on successful page load
  const loginUser = document.getElementById("loginUser");
  if (loginUser) {
    localStorage.setItem("loginAttempts", "0");
  }
  
  // Auto-fill username if "remember me" was checked
  if (localStorage.getItem("rememberMe") && loginUser) {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      loginUser.value = storedEmail;
    }
  }
  
  // Load playlists in sidebar
  loadPlaylists();

  // Playlist modal keyboard + backdrop handling
  const playlistModal = document.getElementById("playlistModal");
  const playlistNameInput = document.getElementById("playlistNameInput");
  if (playlistModal) {
    playlistModal.addEventListener("click", (e) => {
      if (e.target === playlistModal) closePlaylistModal();
    });
  }
  if (playlistNameInput) {
    playlistNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmCreatePlaylist();
      if (e.key === "Escape") closePlaylistModal();
    });
  }

  // Add song modal keyboard + backdrop handling
  const addSongModal = document.getElementById("addSongModal");
  const addSongInput = document.getElementById("addSongInput");
  if (addSongModal) {
    addSongModal.addEventListener("click", (e) => {
      if (e.target === addSongModal) closeAddSongModal();
    });
  }
  if (addSongInput) {
    addSongInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") confirmAddSongToPlaylist();
      if (e.key === "Escape") closeAddSongModal();
    });
  }
  
  // Set volume from saved value
  const volumeSlider = document.getElementById("volumeSlider");
  if (volumeSlider) {
    const savedVolume = localStorage.getItem("volume") || "100";
    volumeSlider.value = savedVolume;
    setVolume(savedVolume);
  }
});

