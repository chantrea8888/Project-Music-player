document.addEventListener('DOMContentLoaded', function () {
    const state = {
        // Core audio state
        currentSongIndex: 0,
        isPlaying: false,
        isShuffled: false,
        isLooping: false,
        volume: 80,
        muted: false,

        // Data state
        playlists: [],
        currentPlaylist: [],
        allSongs: [], // Combined songs from sample and uploads

        // Web Audio API components
        audioContext: null,
        audioSourceNode: null,
        gainNode: null,
        analyserNode: null,
        audioElement: null,

        // Crossfade feature
        crossfadeEnabled: true,
        crossfadeDuration: 3.0,
        nextSongScheduled: false,

        // Visualization
        animationFrameId: null,

        // Search feature
        searchQuery: '',
        searchFilter: 'all',
        searchResults: {
            songs: [],
            artists: [],
            playlists: [],
            albums: []
        },
        searchSettings: {
            includeUploads: true,
            caseSensitive: false,
            resultsLimit: 20
        },

        // UI state
        tutorialMode: false
    };

    // ============================================
    // SAMPLE DATA
    // ============================================

    const sampleSongs = [
        {
            id: 1,
            title: "Blinding Lights",
            artist: "The Weeknd",
            duration: "3:20",
            albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            fileUrl: "https://assets.codepen.io/4358584/Blinding-Lights.mp3",
            lyrics: [
                { time: 0, text: "I been tryna call" },
                { time: 5, text: "I been on my own for long enough" },
                { time: 10, text: "Maybe you can show me how to love, maybe" },
                { time: 15, text: "I'm going through withdrawals" },
                { time: 20, text: "You don't even have to do too much" },
                { time: 25, text: "You can turn me on with just a touch, baby" }
            ],
            album: "After Hours",
            genre: ["Pop", "R&B", "Synthwave"],
            year: 2019
        },
        {
            id: 2,
            title: "Stay",
            artist: "The Kid LAROI, Justin Bieber",
            duration: "2:21",
            albumArt: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            fileUrl: "https://assets.codepen.io/4358584/Stay.mp3",
            lyrics: [
                { time: 0, text: "I do the same thing I told you that I never would" },
                { time: 5, text: "I told you I'd change, even when I knew I never could" },
                { time: 10, text: "I know that I can't find nobody else as good as you" },
                { time: 15, text: "I need you to stay, need you to stay, hey" }
            ],
            album: "F*CK LOVE 3: OVER YOU",
            genre: ["Pop", "Hip Hop"],
            year: 2021
        },
        {
            id: 3,
            title: "Good 4 U",
            artist: "Olivia Rodrigo",
            duration: "2:58",
            albumArt: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            fileUrl: "https://assets.codepen.io/4358584/Good-4-U.mp3",
            lyrics: [
                { time: 0, text: "Well, good for you, I guess you moved on really easily" },
                { time: 5, text: "You found a new girl and it only took a couple weeks" },
                { time: 10, text: "Remember when you said that you wanted to give me the world?" },
                { time: 15, text: "And good for you, I guess that you've been working on yourself" }
            ],
            album: "SOUR",
            genre: ["Pop Punk", "Pop Rock"],
            year: 2021
        },
        {
            id: 4,
            title: "Levitating",
            artist: "Dua Lipa",
            duration: "3:23",
            albumArt: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            fileUrl: "https://assets.codepen.io/4358584/Levitating.mp3",
            lyrics: [
                { time: 0, text: "If you wanna run away with me, I know a galaxy" },
                { time: 5, text: "And I can take you for a ride" },
                { time: 10, text: "I had a premonition that we fell into a rhythm" },
                { time: 15, text: "Where the music don't stop for life" }
            ],
            album: "Future Nostalgia",
            genre: ["Disco", "Pop"],
            year: 2020
        },
        {
            id: 5,
            title: "Heat Waves",
            artist: "Glass Animals",
            duration: "3:58",
            albumArt: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
            fileUrl: "https://assets.codepen.io/4358584/Heat-Waves.mp3",
            lyrics: [
                { time: 0, text: "Road shimmer, wiggling the vision" },
                { time: 5, text: "Heat heat waves, I'm swimming in a mirror" },
                { time: 10, text: "Road shimmer, wiggling the vision" },
                { time: 15, text: "Heat heat waves, I'm swimming in a" }
            ],
            album: "Dreamland",
            genre: ["Indie Pop", "Alternative"],
            year: 2020
        }
    ];

    const samplePlaylists = [
        {
            id: 1,
            name: "Favorites",
            description: "My all-time favorite tracks",
            songs: [1, 2, 5],
            image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 2,
            name: "Workout Mix",
            description: "High-energy songs for workouts",
            songs: [1, 4, 5],
            image: "https://images.unsplash.com/photo-1536922246289-88c42f957773?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        },
        {
            id: 3,
            name: "Chill Vibes",
            description: "Relaxing music for winding down",
            songs: [2, 3],
            image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
        }
    ];


    // ============================================
    // DOM ELEMENTS
    // ============================================

    const elements = {
        // Player controls
        playPauseBtn: document.getElementById('play-pause-btn'),
        prevBtn: document.getElementById('prev-btn'),
        nextBtn: document.getElementById('next-btn'),
        shuffleBtn: document.getElementById('shuffle-btn'),
        loopBtn: document.getElementById('loop-btn'),
        volumeSlider: document.getElementById('volume-slider'),

        // Progress and time
        progressBar: document.getElementById('song-progress'),
        currentTimeEl: document.getElementById('current-time'),
        totalTimeEl: document.getElementById('total-time'),

        // Song info
        songTitleEl: document.getElementById('song-title'),
        songArtistEl: document.getElementById('song-artist'),
        albumArtEl: document.getElementById('album-art'),

        // Playlists and lists
        nowPlayingList: document.getElementById('now-playing-list'),
        playlistsContainer: document.getElementById('playlists-container'),
        sidebarPlaylists: document.getElementById('sidebar-playlists'),
        uploadedSongs: document.getElementById('uploaded-songs'),
        clearPlaylistBtn: document.getElementById('clear-playlist-btn'),

        // Lyrics
        lyricsContainer: document.getElementById('lyrics-container'),

        // Visualization
        visualizerCanvas: document.getElementById('visualizer-canvas'),
        visualizerCtx: null,

        // Crossfade
        crossfadeToggle: document.getElementById('crossfade-toggle'),
        crossfadeDurationSlider: document.getElementById('crossfade-duration'),
        crossfadeValueDisplay: document.getElementById('crossfade-value'),

        // SEARCH ELEMENTS
        globalSearchContainer: document.getElementById('global-search-container'),
        globalSearchInput: document.getElementById('global-search-input'),
        searchClearBtn: document.getElementById('search-clear-btn'),
        searchResults: document.getElementById('search-results'),
        searchResultsList: document.getElementById('search-results-list'),
        searchResultsCount: document.getElementById('search-results-count'),
        quickSearchBtn: document.getElementById('quick-search-btn'),
        sidebarSearch: document.getElementById('sidebar-search'),
        sidebarSearchBtn: document.getElementById('sidebar-search-btn'),

        // Search filters
        searchFilterBtns: document.querySelectorAll('.search-filter-btn'),

        // Search section elements
        searchSongsResults: document.getElementById('search-songs-results'),
        searchArtistsResults: document.getElementById('search-artists-results'),
        searchPlaylistsResults: document.getElementById('search-playlists-results'),
        searchAlbumsResults: document.getElementById('search-albums-results'),
        searchNoResults: document.getElementById('search-no-results'),
        searchInitialState: document.getElementById('search-initial-state'),
        searchSongsList: document.getElementById('search-songs-list'),
        searchArtistsList: document.getElementById('search-artists-list'),
        searchPlaylistsList: document.getElementById('search-playlists-list'),
        searchAlbumsList: document.getElementById('search-albums-list'),
        songsResultsCount: document.getElementById('songs-results-count'),
        artistsResultsCount: document.getElementById('artists-results-count'),
        playlistsResultsCount: document.getElementById('playlists-results-count'),
        albumsResultsCount: document.getElementById('albums-results-count'),
        advancedSearchBtn: document.getElementById('advanced-search-btn'),

        // Search statistics
        totalSongsCount: document.getElementById('total-songs-count'),
        totalArtistsCount: document.getElementById('total-artists-count'),
        totalPlaylistsCount: document.getElementById('total-playlists-count'),
        uploadedCount: document.getElementById('uploaded-count'),
        nowPlayingCount: document.getElementById('now-playing-count'),
        uploadedSongsCount: document.getElementById('uploaded-songs-count'),

        // Navigation
        navLibrary: document.getElementById('nav-library'),
        navPlaylists: document.getElementById('nav-playlists'),
        navUpload: document.getElementById('nav-upload'),
        navLyrics: document.getElementById('nav-lyrics'),
        navSearch: document.getElementById('nav-search'),
        navSettings: document.getElementById('nav-settings'),

        // Sections
        librarySection: document.getElementById('library-section'),
        playlistsSection: document.getElementById('playlists-section'),
        uploadSection: document.getElementById('upload-section'),
        lyricsSection: document.getElementById('lyrics-section'),
        searchSection: document.getElementById('search-section'),
        settingsSection: document.getElementById('settings-section'),

        // File upload
        fileInput: document.getElementById('file-input'),
        uploadArea: document.getElementById('upload-area'),
        browseFilesBtn: document.getElementById('browse-files-btn'),

        // Other buttons
        toggleShuffleBtn: document.getElementById('toggle-shuffle'),
        toggleLoopBtn: document.getElementById('toggle-loop'),
        addToPlaylistBtn: document.getElementById('add-to-playlist'),
        createPlaylistBtn: document.getElementById('create-playlist-btn'),
        uploadLyricsBtn: document.getElementById('upload-lyrics-btn'),

        // Status indicator
        statusIndicator: document.getElementById('status-indicator'),
        statusMessage: document.getElementById('status-message'),

        // Keyboard hint
        keyboardHint: document.getElementById('keyboard-hint')
    };

    // Initialize canvas context
    if (elements.visualizerCanvas) {
        elements.visualizerCtx = elements.visualizerCanvas.getContext('2d');
    }

    // ============================================
    // SEARCH FEATURE FUNCTIONS
    // ============================================

    // Purpose: Initialize all songs data (sample + uploaded)
    function initializeAllSongs() {
        const uploadedSongs = getUploadedSongsFromLocalStorage();
        state.allSongs = [...sampleSongs, ...uploadedSongs];
        updateSearchStatistics();
    }

    //Update search statistics display
    function updateSearchStatistics() {
        const uploadedSongs = getUploadedSongsFromLocalStorage();
        const allSongs = [...sampleSongs, ...uploadedSongs];

        // Get unique artists
        const artists = [...new Set(allSongs.map(song => song.artist))];

        elements.totalSongsCount.textContent = allSongs.length;
        elements.totalArtistsCount.textContent = artists.length;
        elements.totalPlaylistsCount.textContent = state.playlists.length;
        elements.uploadedCount.textContent = uploadedSongs.length;
        elements.nowPlayingCount.textContent = `${state.currentPlaylist.length} songs`;
        elements.uploadedSongsCount.textContent = `${uploadedSongs.length} songs`;
    }

});

