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

    //Perform search across all music data
    function performSearch(query, filter = 'all') {
        if (!query || query.trim() === '') {
            clearSearchResults();
            return;
        }

        state.searchQuery = query.trim();
        state.searchFilter = filter;

        // Reset search results
        state.searchResults = {
            songs: [],
            artists: [],
            playlists: [],
            albums: []
        };

        // Get all songs to search (including uploaded if enabled)
        let songsToSearch = sampleSongs;
        if (state.searchSettings.includeUploads) {
            const uploadedSongs = getUploadedSongsFromLocalStorage();
            songsToSearch = [...sampleSongs, ...uploadedSongs];
        }

        // Prepare search term (case handling)
        const searchTerm = state.searchSettings.caseSensitive ?
            state.searchQuery : state.searchQuery.toLowerCase();

        // Search songs
        if (filter === 'all' || filter === 'songs') {
            state.searchResults.songs = songsToSearch.filter(song => {
                const title = state.searchSettings.caseSensitive ?
                    song.title : song.title.toLowerCase();
                const artist = state.searchSettings.caseSensitive ?
                    song.artist : song.artist.toLowerCase();
                const album = song.album ? (state.searchSettings.caseSensitive ?
                    song.album : song.album.toLowerCase()) : '';

                return title.includes(searchTerm) ||
                    artist.includes(searchTerm) ||
                    (album && album.includes(searchTerm));
            }).slice(0, state.searchSettings.resultsLimit);
        }

        // Search artists
        if (filter === 'all' || filter === 'artists') {
            const uniqueArtists = [...new Set(songsToSearch.map(song => song.artist))];
            state.searchResults.artists = uniqueArtists.filter(artist => {
                const artistName = state.searchSettings.caseSensitive ?
                    artist : artist.toLowerCase();
                return artistName.includes(searchTerm);
            }).slice(0, state.searchSettings.resultsLimit);
        }

        // Search playlists
        if (filter === 'all' || filter === 'playlists') {
            state.searchResults.playlists = state.playlists.filter(playlist => {
                const name = state.searchSettings.caseSensitive ?
                    playlist.name : playlist.name.toLowerCase();
                const desc = playlist.description ? (state.searchSettings.caseSensitive ?
                    playlist.description : playlist.description.toLowerCase()) : '';

                return name.includes(searchTerm) ||
                    (desc && desc.includes(searchTerm));
            }).slice(0, state.searchSettings.resultsLimit);
        }

        // Search albums
        if (filter === 'all' || filter === 'albums') {
            const albumsMap = {};
            songsToSearch.forEach(song => {
                if (song.album && !albumsMap[song.album]) {
                    albumsMap[song.album] = {
                        name: song.album,
                        artist: song.artist,
                        songCount: 1,
                        albumArt: song.albumArt
                    };
                } else if (song.album) {
                    albumsMap[song.album].songCount++;
                }
            });

            const albums = Object.values(albumsMap);
            state.searchResults.albums = albums.filter(album => {
                const albumName = state.searchSettings.caseSensitive ?
                    album.name : album.name.toLowerCase();
                const albumArtist = state.searchSettings.caseSensitive ?
                    album.artist : album.artist.toLowerCase();

                return albumName.includes(searchTerm) ||
                    albumArtist.includes(searchTerm);
            }).slice(0, state.searchSettings.resultsLimit);
        }

        // Display results
        displaySearchResults();
        updateQuickSearchResults();
    }

    //Display search results in the search section
    function displaySearchResults() {
        const totalResults =
            state.searchResults.songs.length +
            state.searchResults.artists.length +
            state.searchResults.playlists.length +
            state.searchResults.albums.length;

        // Update result counts
        elements.songsResultsCount.textContent = state.searchResults.songs.length;
        elements.artistsResultsCount.textContent = state.searchResults.artists.length;
        elements.playlistsResultsCount.textContent = state.searchResults.playlists.length;
        elements.albumsResultsCount.textContent = state.searchResults.albums.length;

        // Show/hide appropriate sections
        if (totalResults === 0 && state.searchQuery.length > 0) {
            elements.searchInitialState.classList.add('d-none');
            elements.searchNoResults.classList.remove('d-none');

            elements.searchSongsResults.classList.add('d-none');
            elements.searchArtistsResults.classList.add('d-none');
            elements.searchPlaylistsResults.classList.add('d-none');
            elements.searchAlbumsResults.classList.add('d-none');

            return;
        }

        elements.searchInitialState.classList.add('d-none');
        elements.searchNoResults.classList.add('d-none');

        // Display song results
        if (state.searchResults.songs.length > 0 && (state.searchFilter === 'all' || state.searchFilter === 'songs')) {
            elements.searchSongsResults.classList.remove('d-none');
            displaySongSearchResults();
        } else {
            elements.searchSongsResults.classList.add('d-none');
        }

        // Display artist results
        if (state.searchResults.artists.length > 0 && (state.searchFilter === 'all' || state.searchFilter === 'artists')) {
            elements.searchArtistsResults.classList.remove('d-none');
            displayArtistSearchResults();
        } else {
            elements.searchArtistsResults.classList.add('d-none');
        }

        // Display playlist results
        if (state.searchResults.playlists.length > 0 && (state.searchFilter === 'all' || state.searchFilter === 'playlists')) {
            elements.searchPlaylistsResults.classList.remove('d-none');
            displayPlaylistSearchResults();
        } else {
            elements.searchPlaylistsResults.classList.add('d-none');
        }

        // Display album results
        if (state.searchResults.albums.length > 0 && (state.searchFilter === 'all' || state.searchFilter === 'albums')) {
            elements.searchAlbumsResults.classList.remove('d-none');
            displayAlbumSearchResults();
        } else {
            elements.searchAlbumsResults.classList.add('d-none');
        }
    }
    //Display song search results
    function displaySongSearchResults() {
        elements.searchSongsList.innerHTML = '';

        state.searchResults.songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'playlist-item song-item';
            songElement.innerHTML = `
                        <img src="${song.albumArt}" alt="${song.title}">
                        <div class="playlist-info">
                            <h6>${song.title}</h6>
                            <p>${song.artist} • ${song.album || 'Unknown Album'}</p>
                        </div>
                        <div class="song-duration">${song.duration}</div>
                        <div class="action-buttons ms-2">
                            <button class="btn btn-sm btn-outline-secondary play-search-song-btn" data-id="${song.id}" title="Play">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-custom add-search-song-btn" data-id="${song.id}" title="Add to Playlist">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    `;

            // Add event listeners
            const playBtn = songElement.querySelector('.play-search-song-btn');
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                playSongById(song.id);
            });

            const addBtn = songElement.querySelector('.add-search-song-btn');
            addBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                addSongToCurrentPlaylist(song.id);
            });

            // Click on song item to play
            songElement.addEventListener('click', function (e) {
                if (!e.target.classList.contains('play-search-song-btn') &&
                    !e.target.closest('.play-search-song-btn') &&
                    !e.target.classList.contains('add-search-song-btn') &&
                    !e.target.closest('.add-search-song-btn')) {
                    playSongById(song.id);
                }
            });

            elements.searchSongsList.appendChild(songElement);
        });
    }
    //Display artist search results
    function displayArtistSearchResults() {
        elements.searchArtistsList.innerHTML = '';

        state.searchResults.artists.forEach(artistName => {
            // Get songs by this artist
            const artistSongs = getAllSongs().filter(song => song.artist === artistName);
            const albumCount = [...new Set(artistSongs.map(song => song.album))].length;

            const artistElement = document.createElement('div');
            artistElement.className = 'col-md-4 mb-3';
            artistElement.innerHTML = `
                        <div class="card h-100">
                            <div class="card-body text-center">
                                <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center mx-auto mb-3" 
                                     style="width: 80px; height: 80px;">
                                    <i class="fas fa-user fa-2x text-white"></i>
                                </div>
                                <h5 class="card-title">${artistName}</h5>
                                <p class="card-text text-muted">
                                    ${artistSongs.length} song${artistSongs.length !== 1 ? 's' : ''}
                                    ${albumCount > 0 ? ` • ${albumCount} album${albumCount !== 1 ? 's' : ''}` : ''}
                                </p>
                                <button class="btn btn-sm btn-custom play-artist-btn" data-artist="${artistName}" title="Play Artist">
                                    <i class="fas fa-play me-1"></i> Play Artist
                                </button>
                            </div>
                        </div>
                    `;

            // Add event listener
            const playBtn = artistElement.querySelector('.play-artist-btn');
            playBtn.addEventListener('click', function () {
                playArtist(artistName);
            });

            elements.searchArtistsList.appendChild(artistElement);
        });
    }
    //Display playlist search results
    function displayPlaylistSearchResults() {
        elements.searchPlaylistsList.innerHTML = '';

        state.searchResults.playlists.forEach(playlist => {
            const playlistElement = document.createElement('div');
            playlistElement.className = 'col-md-4 mb-3';
            playlistElement.innerHTML = `
                        <div class="card h-100 playlist-card">
                            <img src="${playlist.image}" class="card-img-top" alt="${playlist.name}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${playlist.name}</h5>
                                <p class="card-text text-muted">${playlist.description}</p>
                                <p class="card-text"><small class="text-muted">${playlist.songs.length} songs</small></p>
                                <div class="d-flex justify-content-between playlist-actions">
                                    <button class="btn btn-sm btn-custom play-playlist-search-btn" data-id="${playlist.id}" title="Play Playlist">
                                        <i class="fas fa-play me-1"></i> Play
                                    </button>
                                    <button class="btn btn-sm btn-outline-custom edit-playlist-search-btn" data-id="${playlist.id}" title="Edit Playlist">
                                        <i class="fas fa-edit me-1"></i> Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

            // Add event listeners
            const playBtn = playlistElement.querySelector('.play-playlist-search-btn');
            playBtn.addEventListener('click', function () {
                playPlaylist(playlist.id);
                showSection('library');
            });

            const editBtn = playlistElement.querySelector('.edit-playlist-search-btn');
            editBtn.addEventListener('click', function () {
                editPlaylist(playlist.id);
            });

            elements.searchPlaylistsList.appendChild(playlistElement);
        });
    }
    //Display album search results
    function displayAlbumSearchResults() {
        elements.searchAlbumsList.innerHTML = '';

        state.searchResults.albums.forEach(album => {
            const albumElement = document.createElement('div');
            albumElement.className = 'col-md-4 mb-3';
            albumElement.innerHTML = `
                        <div class="card h-100 playlist-card">
                            <img src="${album.albumArt}" class="card-img-top" alt="${album.name}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${album.name}</h5>
                                <p class="card-text text-muted">${album.artist}</p>
                                <p class="card-text"><small class="text-muted">${album.songCount} song${album.songCount !== 1 ? 's' : ''}</small></p>
                                <div class="d-flex justify-content-between playlist-actions">
                                    <button class="btn btn-sm btn-custom play-album-btn" data-album="${album.name}" title="Play Album">
                                        <i class="fas fa-play me-1"></i> Play
                                    </button>
                                    <button class="btn btn-sm btn-outline-custom view-album-btn" data-album="${album.name}" title="View Album">
                                        <i class="fas fa-eye me-1"></i> View
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;

            // Add event listeners
            const playBtn = albumElement.querySelector('.play-album-btn');
            playBtn.addEventListener('click', function () {
                playAlbum(album.name);
            });

            const viewBtn = albumElement.querySelector('.view-album-btn');
            viewBtn.addEventListener('click', function () {
                viewAlbum(album.name);
            });

            elements.searchAlbumsList.appendChild(albumElement);
        });
    }
    //Update quick search results dropdown
    function updateQuickSearchResults() {
        const totalResults =
            state.searchResults.songs.length +
            state.searchResults.artists.length +
            state.searchResults.playlists.length +
            state.searchResults.albums.length;

        if (totalResults === 0 || !state.searchQuery) {
            elements.searchResults.style.display = 'none';
            return;
        }

        elements.searchResultsCount.textContent = `${totalResults} result${totalResults !== 1 ? 's' : ''}`;
        elements.searchResultsList.innerHTML = '';

        // Add top 3 songs
        state.searchResults.songs.slice(0, 3).forEach(song => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                        <div class="search-result-icon">
                            <i class="fas fa-music"></i>
                        </div>
                        <div class="search-result-content">
                            <div class="search-result-title">${song.title}</div>
                            <div class="search-result-subtitle">${song.artist} • ${song.album || 'Unknown Album'}</div>
                        </div>
                        <div class="search-result-type">Song</div>
                    `;

            resultItem.addEventListener('click', function () {
                playSongById(song.id);
                elements.searchResults.style.display = 'none';
                elements.globalSearchInput.value = '';
                state.searchQuery = '';
            });

            elements.searchResultsList.appendChild(resultItem);
        });

        // Add top 2 artists
        state.searchResults.artists.slice(0, 2).forEach(artist => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                        <div class="search-result-icon">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="search-result-content">
                            <div class="search-result-title">${artist}</div>
                            <div class="search-result-subtitle">Artist</div>
                        </div>
                        <div class="search-result-type">Artist</div>
                    `;

            resultItem.addEventListener('click', function () {
                playArtist(artist);
                showSection('search');
                elements.searchResults.style.display = 'none';
            });

            elements.searchResultsList.appendChild(resultItem);
        });

        // Show results dropdown
        elements.searchResults.style.display = 'block';
    }

    // Purpose: Clear search results
    function clearSearchResults() {
        state.searchQuery = '';
        state.searchResults = {
            songs: [],
            artists: [],
            playlists: [],
            albums: []
        };

        elements.globalSearchInput.value = '';
        elements.searchResults.style.display = 'none';
        elements.searchClearBtn.style.display = 'none';

        // Reset search section display
        if (elements.searchSection.classList.contains('d-none') === false) {
            elements.searchInitialState.classList.remove('d-none');
            elements.searchNoResults.classList.add('d-none');
            elements.searchSongsResults.classList.add('d-none');
            elements.searchArtistsResults.classList.add('d-none');
            elements.searchPlaylistsResults.classList.add('d-none');
            elements.searchAlbumsResults.classList.add('d-none');
        }
    }
    //Play song by ID
    function playSongById(songId) {
        const allSongs = getAllSongs();
        const song = allSongs.find(s => s.id === songId);

        if (song) {
            // Find the song in current playlist or add it
            const currentPlaylistIndex = state.currentPlaylist.findIndex(s => s.id === songId);

            if (currentPlaylistIndex !== -1) {
                playSong(currentPlaylistIndex);
            } else {
                // Add song to current playlist and play it
                state.currentPlaylist = [song];
                state.currentSongIndex = 0;
                if (state.audioElement) {
                    state.audioElement.pause();
                }
                initAudioElement();
                state.audioElement.play().catch(e => {
                    console.error("Error playing audio:", e);
                });
                updateNowPlayingList();
                showSection('library');
                updateStatus(`Playing: ${song.title}`, "ok");
            }
        }
    }
    //Add song to current playlist by ID
    function addSongToCurrentPlaylist(songId) {
        const allSongs = getAllSongs();
        const song = allSongs.find(song => song.id === songId);

        if (song) {
            // Check if song is already in playlist
            const isAlreadyInPlaylist = state.currentPlaylist.some(s => s.id === songId);

            if (!isAlreadyInPlaylist) {
                state.currentPlaylist.push(song);
                updateNowPlayingList();
                updateSearchStatistics();
                Notify.success(`"${song.title}" added to current playlist`);
                updateStatus(`Added to playlist: ${song.title}`, "ok");
            } else {
                Notify.info(`"${song.title}" is already in the playlist`);
            }
        }
    }
    // Play all songs by an artist
    function playArtist(artistName) {
        const artistSongs = getAllSongs().filter(song => song.artist === artistName);

        if (artistSongs.length > 0) {
            state.currentPlaylist = artistSongs;
            state.currentSongIndex = 0;

            if (state.audioElement) {
                state.audioElement.pause();
            }

            initAudioElement();
            state.audioElement.play().catch(e => {
                console.error("Error playing audio:", e);
            });

            showSection('library');
            Notify.success(`Now playing: ${artistName}`);
            updateStatus(`Playing artist: ${artistName}`, "ok");
        }
    }
    // Purpose:  all songs from an album
    function playAlbum(albumName) {
        const albumSongs = getAllSongs().filter(song => song.album === albumName);

        if (albumSongs.length > 0) {
            state.currentPlaylist = albumSongs;
            state.currPlayentSongIndex = 0;

            if (state.audioElement) {
                state.audioElement.pause();
            }

            initAudioElement();
            state.audioElement.play().catch(e => {
                console.error("Error playing audio:", e);
            });

            showSection('library');
            Notify.success(`Now playing: ${albumName}`);
            updateStatus(`Playing album: ${albumName}`, "ok");
        }
    }

    // View album details
    function viewAlbum(albumName) {
        const albumSongs = getAllSongs().filter(song => song.album === albumName);
        const artist = albumSongs[0]?.artist;

        Swal.fire({
            title: albumName,
            html: `
                <div class="text-start">
                    <p><strong>Artist:</strong> ${artist || 'Unknown'}</p>
                    <p><strong>Songs:</strong> ${albumSongs.length}</p>
                    <div class="mt-3">
                        <h6>Tracklist:</h6>
                        <ul class="list-group">
                            ${albumSongs.map(song => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${song.title}
                                    <span class="badge bg-primary rounded-pill">${song.duration}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Play Album',
            cancelButtonText: 'Close',
            confirmButtonColor: '#4361ee'
        }).then((result) => {
            if (result.isConfirmed) {
                playAlbum(albumName);
            }
        });
    }

    //Show playlist details
    function showPlaylistDetails(playlistId) {
        const playlist = state.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const playlistSongs = getAllSongs().filter(song => playlist.songs.includes(song.id));

        Swal.fire({
            title: playlist.name,
            html: `
                <div class="text-start">
                    <p>${playlist.description}</p>
                    <p><strong>Songs:</strong> ${playlistSongs.length}</p>
                    <div class="mt-3">
                        <h6>Tracklist:</h6>
                        <ul class="list-group">
                            ${playlistSongs.map(song => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${song.title} - ${song.artist}
                                    <span class="badge bg-primary rounded-pill">${song.duration}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Play Playlist',
            cancelButtonText: 'Close',
            confirmButtonColor: '#4361ee',
            width: '600px'
        }).then((result) => {
            if (result.isConfirmed) {
                playPlaylist(playlistId);
            }
        });
    }

    //Edit a playlist
    function editPlaylist(playlistId) {
        const playlist = state.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        // Get all available songs
        const allSongs = getAllSongs();
        const currentPlaylistSongs = allSongs.filter(song => playlist.songs.includes(song.id));

        Swal.fire({
            title: 'Edit Playlist',
            html: `
                        <div class="text-start">
                            <div class="mb-3">
                                <label class="form-label">Playlist Name</label>
                                <input type="text" id="edit-playlist-name" class="form-control" value="${playlist.name}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description</label>
                                <textarea id="edit-playlist-desc" class="form-control" rows="2">${playlist.description || ''}</textarea>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Songs in Playlist (${currentPlaylistSongs.length})</label>
                                <div class="border rounded p-2" style="max-height: 200px; overflow-y: auto;">
                                    ${currentPlaylistSongs.map(song => `
                                        <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                                            <div>
                                                <strong>${song.title}</strong>
                                                <div class="text-muted small">${song.artist}</div>
                                            </div>
                                            <button type="button" class="btn btn-sm btn-outline-danger remove-song-from-edit" data-id="${song.id}">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('')}
                                    ${currentPlaylistSongs.length === 0 ? '<p class="text-muted text-center">No songs in playlist</p>' : ''}
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Add Songs to Playlist</label>
                                <select id="add-song-select" class="form-select" multiple style="height: 150px;">
                                    ${allSongs.map(song => `
                                        <option value="${song.id}" ${playlist.songs.includes(song.id) ? 'disabled' : ''}>
                                            ${song.title} - ${song.artist}
                                        </option>
                                    `).join('')}
                                </select>
                                <div class="form-text">Hold Ctrl/Cmd to select multiple songs</div>
                            </div>
                        </div>
                    `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#4361ee',
            width: '600px',
            preConfirm: () => {
                const name = document.getElementById('edit-playlist-name').value;
                const desc = document.getElementById('edit-playlist-desc').value;

                if (!name.trim()) {
                    Swal.showValidationMessage('Please enter a playlist name');
                    return false;
                }

                return { name, desc };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Update playlist name and description
                playlist.name = result.value.name;
                playlist.description = result.value.desc;

                // Handle song removals (songs removed via the remove buttons during the edit)
                // Note: This would require additional logic to track removals

                // Handle adding new songs
                const addSongSelect = document.getElementById('add-song-select');
                if (addSongSelect) {
                    const selectedOptions = Array.from(addSongSelect.selectedOptions);
                    selectedOptions.forEach(option => {
                        const songId = parseInt(option.value);
                        if (!playlist.songs.includes(songId)) {
                            playlist.songs.push(songId);
                        }
                    });
                }

                saveToLocalStorage();
                updatePlaylistsDisplay();
                updateSidebarPlaylists();
                Notify.success('Playlist updated successfully');
                updateStatus(`Updated playlist: ${playlist.name}`, "ok");
            }
        });

        // Add event listeners for removing songs during edit
        setTimeout(() => {
            document.querySelectorAll('.remove-song-from-edit').forEach(btn => {
                btn.addEventListener('click', function () {
                    const songId = parseInt(this.getAttribute('data-id'));
                    const index = playlist.songs.indexOf(songId);
                    if (index !== -1) {
                        playlist.songs.splice(index, 1);

                        // Update the UI immediately
                        this.closest('.d-flex').remove();
                        Notify.info('Song removed from playlist');
                    }
                });
            });
        }, 100);
    }


    //Delete a playlist
    function deletePlaylist(playlistId) {
        const playlist = state.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        Swal.fire({
            title: 'Delete Playlist?',
            text: `Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const index = state.playlists.findIndex(p => p.id === playlistId);
                if (index !== -1) {
                    state.playlists.splice(index, 1);
                    saveToLocalStorage();
                    updatePlaylistsDisplay();
                    updateSidebarPlaylists();
                    updateSearchStatistics();
                    Notify.success('Playlist deleted successfully');
                    updateStatus(`Deleted playlist: ${playlist.name}`, "ok");
                }
            }
        });
    }

    // Get all songs (sample + uploaded)
    function getAllSongs() {
        const uploadedSongs = getUploadedSongsFromLocalStorage();
        return [...sampleSongs, ...uploadedSongs];
    }
    // Initialize audio element (simplified for this example)
    function initAudioElement() {
        const currentSong = state.currentPlaylist[state.currentSongIndex];
        if (!currentSong) return;

        if (state.audioElement) {
            state.audioElement.pause();
            state.audioElement = null;
        }

        state.audioElement = new Audio(currentSong.fileUrl);
        state.audioElement.volume = state.volume / 100;

        // Set up audio event listeners
        state.audioElement.addEventListener('timeupdate', updateProgress);
        state.audioElement.addEventListener('loadedmetadata', function () {
            elements.totalTimeEl.textContent = formatTime(state.audioElement.duration);
        });
        state.audioElement.addEventListener('ended', playNextSong);
        state.audioElement.addEventListener('play', function () {
            state.isPlaying = true;
            updatePlayPauseButton();
            updateNowPlayingList();
            updateLyrics();
            document.querySelector('.player-container').classList.add('playing');
        });
        state.audioElement.addEventListener('pause', function () {
            state.isPlaying = false;
            updatePlayPauseButton();
            document.querySelector('.player-container').classList.remove('playing');
        });

        updateSongInfo();
        updateNowPlayingList();
    }

    // Play a specific song by index
    function playSong(index) {
        if (index < 0 || index >= state.currentPlaylist.length) return;

        state.currentSongIndex = index;

        if (state.audioElement) {
            state.audioElement.pause();
        }

        initAudioElement();
        state.audioElement.play().catch(e => {
            console.error("Error playing audio:", e);
            Notify.error("Could not play audio. Please try another song.");
        });

        saveToLocalStorage();
    }

    // function play next song
    function playNextSong() {
        if (state.isLooping) {
            state.audioElement.currentTime = 0;
            state.audioElement.play();
            return;
        }

        let nextIndex;
        if (state.isShuffled) {
            do {
                nextIndex = Math.floor(Math.random() * state.currentPlaylist.length);
            } while (nextIndex === state.currentSongIndex && state.currentPlaylist.length > 1);
        } else {
            nextIndex = (state.currentSongIndex + 1) % state.currentPlaylist.length;
        }

        playSong(nextIndex);
    }
    // function play previous song
    function playPrevSong() {
        let prevIndex;
        if (state.currentSongIndex === 0) {
            prevIndex = state.currentPlaylist.length - 1;
        } else {
            prevIndex = state.currentSongIndex - 1;
        }

        playSong(prevIndex);
    }
    // function play a playlist
    function playPlaylist(playlistId) {
        const playlist = state.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        const playlistSongs = [];
        playlist.songs.forEach(songId => {
            const song = getAllSongs().find(s => s.id === songId);
            if (song) playlistSongs.push(song);
        });

        if (playlistSongs.length === 0) {
            Notify.warning("This playlist is empty. Add some songs first.");
            return;
        }

        state.currentPlaylist = playlistSongs;
        state.currentSongIndex = 0;

        if (state.audioElement) {
            state.audioElement.pause();
        }

        initAudioElement();
        state.audioElement.play().catch(e => {
            console.error("Error playing audio:", e);
        });

        showSection('library');
        Notify.success(`Now playing: ${playlist.name}`);
    }

    // ============================================
    // UI UPDATE FUNCTIONS
    // ============================================

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function updateProgress() {
        if (!state.audioElement) return;

        const currentTime = state.audioElement.currentTime;
        const duration = state.audioElement.duration;

        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            elements.progressBar.style.width = `${progressPercent}%`;
            elements.currentTimeEl.textContent = formatTime(currentTime);
            updateLyrics(currentTime);
        }
    }

    function updateSongInfo() {
        const currentSong = state.currentPlaylist[state.currentSongIndex];
        if (!currentSong) return;

        elements.songTitleEl.textContent = currentSong.title;
        elements.songArtistEl.textContent = currentSong.artist;
        elements.albumArtEl.src = currentSong.albumArt;
        elements.totalTimeEl.textContent = currentSong.duration;
    }

    function updatePlayPauseButton() {
        const icon = elements.playPauseBtn.querySelector('i');
        if (state.isPlaying) {
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            elements.playPauseBtn.title = "Pause";
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
            elements.playPauseBtn.title = "Play";
        }
    }

    // Update Playing List
    function updateNowPlayingList() {
        elements.nowPlayingList.innerHTML = '';

        if (state.currentPlaylist.length === 0) {
            elements.nowPlayingList.innerHTML = `
                        <div class="text-center py-5">
                            <i class="fas fa-music fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No songs in playlist</h5>
                            <p class="text-muted">Add songs from search or upload section</p>
                        </div>
                    `;
            return;
        }

        state.currentPlaylist.forEach((song, index) => {
            const isActive = index === state.currentSongIndex;

            const songElement = document.createElement('div');
            songElement.className = `playlist-item song-item ${isActive ? 'active' : ''}`;
            songElement.innerHTML = `
                        <img src="${song.albumArt}" alt="${song.title}">
                        <div class="playlist-info">
                            <h6>${song.title}</h6>
                            <p>${song.artist}</p>
                        </div>
                        <div class="song-duration">${song.duration}</div>
                        <div class="action-buttons ms-2">
                            <button class="btn btn-sm btn-outline-secondary play-song-btn" data-index="${index}" title="${isActive && state.isPlaying ? 'Pause' : 'Play'}">
                                <i class="fas fa-${isActive && state.isPlaying ? 'pause' : 'play'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger remove-song-btn" data-index="${index}" title="Remove from Playlist">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;

            songElement.addEventListener('click', function (e) {
                if (!e.target.classList.contains('play-song-btn') &&
                    !e.target.closest('.play-song-btn') &&
                    !e.target.classList.contains('remove-song-btn') &&
                    !e.target.closest('.remove-song-btn')) {
                    playSong(index);
                }
            });

            const playBtn = songElement.querySelector('.play-song-btn');
            playBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                playSong(index);
            });

            const removeBtn = songElement.querySelector('.remove-song-btn');
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                removeSongFromCurrentPlaylist(index);
            });

            elements.nowPlayingList.appendChild(songElement);
        });

        updateSearchStatistics();
    }
    // Remove song from current play list
    function removeSongFromCurrentPlaylist(index) {
        if (index >= 0 && index < state.currentPlaylist.length) {
            const songTitle = state.currentPlaylist[index].title;

            Swal.fire({
                title: 'Remove Song?',
                text: `Are you sure you want to remove "${songTitle}" from the playlist?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, remove it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    state.currentPlaylist.splice(index, 1);

                    // Adjust current song index if needed
                    if (state.currentSongIndex >= index && state.currentSongIndex > 0) {
                        state.currentSongIndex--;
                    }

                    if (state.currentPlaylist.length === 0) {
                        state.currentSongIndex = 0;
                        if (state.audioElement) {
                            state.audioElement.pause();
                            state.isPlaying = false;
                            updatePlayPauseButton();
                        }
                    } else if (state.currentSongIndex >= state.currentPlaylist.length) {
                        state.currentSongIndex = state.currentPlaylist.length - 1;
                    }

                    updateNowPlayingList();
                    updateSongInfo();
                    saveToLocalStorage();

                    Notify.success(`"${songTitle}" removed from playlist`);
                    updateStatus(`Removed: ${songTitle}`, "ok");
                }
            });
        }
    }

    function updatePlaylistsDisplay() {
        elements.playlistsContainer.innerHTML = '';

        if (state.playlists.length === 0) {
            elements.playlistsContainer.innerHTML = `
                        <div class="col-12 text-center py-5">
                            <i class="fas fa-list fa-3x text-muted mb-3"></i>
                            <h4 class="text-muted">No Playlists Yet</h4>
                            <p class="text-muted mb-4">Create your first playlist to organize your music</p>
                            <button class="btn btn-custom" id="create-first-playlist-btn">
                                <i class="fas fa-plus me-1"></i> Create Your First Playlist
                            </button>
                        </div>
                    `;

            document.getElementById('create-first-playlist-btn')?.addEventListener('click', function () {
                createNewPlaylist();
            });

            return;
        }

        state.playlists.forEach(playlist => {
            const playlistCard = document.createElement('div');
            playlistCard.className = 'col-md-4 mb-4';
            playlistCard.innerHTML = `
                        <div class="card h-100 playlist-card">
                            <img src="${playlist.image}" class="card-img-top" alt="${playlist.name}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h5 class="card-title">${playlist.name}</h5>
                                <p class="card-text text-muted">${playlist.description}</p>
                                <p class="card-text"><small class="text-muted">${playlist.songs.length} songs</small></p>
                                <div class="d-flex justify-content-between playlist-actions">
                                    <button class="btn btn-sm btn-custom play-playlist-btn" data-id="${playlist.id}" title="Play Playlist">
                                        <i class="fas fa-play me-1"></i> Play
                                    </button>
                                    <div>
                                        <button class="btn btn-sm btn-outline-custom edit-playlist-btn" data-id="${playlist.id}" title="Edit Playlist">
                                            <i class="fas fa-edit me-1"></i> Edit
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-playlist-btn ms-1" data-id="${playlist.id}" title="Delete Playlist">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;

            // Add event listeners
            const playBtn = playlistCard.querySelector('.play-playlist-btn');
            playBtn.addEventListener('click', function () {
                playPlaylist(playlist.id);
            });

            const editBtn = playlistCard.querySelector('.edit-playlist-btn');
            editBtn.addEventListener('click', function () {
                editPlaylist(playlist.id);
            });

            const deleteBtn = playlistCard.querySelector('.delete-playlist-btn');
            deleteBtn.addEventListener('click', function () {
                deletePlaylist(playlist.id);
            });

            elements.playlistsContainer.appendChild(playlistCard);
        });

        updateSidebarPlaylists();
    }
    // Update sidebar play list
    function updateSidebarPlaylists() {
        elements.sidebarPlaylists.innerHTML = '';

        state.playlists.forEach(playlist => {
            const playlistItem = document.createElement('div');
            playlistItem.className = 'd-flex align-items-center mb-2 playlist-sidebar-item';
            playlistItem.style.cursor = 'pointer';
            playlistItem.innerHTML = `
                        <div class="rounded me-2" style="width: 40px; height: 40px; background-image: url('${playlist.image}'); background-size: cover;"></div>
                        <div>
                            <p class="mb-0 fw-bold">${playlist.name}</p>
                            <p class="mb-0 small opacity-75">${playlist.songs.length} songs</p>
                        </div>
                    `;
            playlistItem.addEventListener('click', function () {
                playPlaylist(playlist.id);
                showSection('library');
            });

            elements.sidebarPlaylists.appendChild(playlistItem);
        });
    }

    // Create a new playlist
    function createNewPlaylist() {
        Swal.fire({
            title: 'Create New Playlist',
            html: `
                        <div class="text-start">
                            <div class="mb-3">
                                <label class="form-label">Playlist Name</label>
                                <input type="text" id="new-playlist-name" class="form-control" placeholder="My Awesome Playlist">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Description (Optional)</label>
                                <textarea id="new-playlist-desc" class="form-control" rows="2" placeholder="Describe your playlist..."></textarea>
                            </div>
                        </div>
                    `,
            showCancelButton: true,
            confirmButtonText: 'Create Playlist',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#4361ee',
            preConfirm: () => {
                const name = document.getElementById('new-playlist-name').value;
                const desc = document.getElementById('new-playlist-desc').value;

                if (!name.trim()) {
                    Swal.showValidationMessage('Please enter a playlist name');
                    return false;
                }

                return { name, desc };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const newPlaylist = {
                    id: Date.now(),
                    name: result.value.name,
                    description: result.value.desc,
                    songs: [],
                    image: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                };

                state.playlists.push(newPlaylist);
                saveToLocalStorage();
                updatePlaylistsDisplay();
                updateSidebarPlaylists();
                updateSearchStatistics();
                Notify.success('Playlist created successfully');
                updateStatus(`Created playlist: ${newPlaylist.name}`, "ok");


                // Ask if they want to add songs now
                Swal.fire({
                    title: 'Add Songs?',
                    text: 'Would you like to add songs to your new playlist now?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, add songs',
                    cancelButtonText: 'Later'
                }).then((addResult) => {
                    if (addResult.isConfirmed) {
                        editPlaylist(newPlaylist.id);
                    }
                });
            }
        });
    }
    // ============================================
    // FILE UPLOAD FUNCTIONS
    // ============================================

    function handleFileUpload(files) {
        let uploadedCount = 0;
        let uploadedNames = [];

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('audio/')) {
                Notify.warning(`Skipped ${file.name}: Not an audio file`);
                return;
            }

            if (file.size > 50 * 1024 * 1024) {
                Notify.warning(`Skipped ${file.name}: File too large (max 50MB)`);
                return;
            }

            const fileUrl = URL.createObjectURL(file);
            const fileName = file.name.replace(/\.[^/.]+$/, "");

            const newSong = {
                id: Date.now() + Math.floor(Math.random() * 1000),
                title: fileName,
                artist: "Unknown Artist",
                duration: "0:00",
                albumArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
                fileUrl: fileUrl,
                lyrics: [],
                album: "User Uploads",
                genre: ["Unknown"],
                year: new Date().getFullYear()
            };

            const uploadedSongs = getUploadedSongsFromLocalStorage();
            uploadedSongs.push(newSong);
            saveUploadedSongsToLocalStorage(uploadedSongs);

            uploadedCount++;
            uploadedNames.push(fileName);

            const audio = new Audio(fileUrl);
            audio.addEventListener('loadedmetadata', function () {
                newSong.duration = formatTime(audio.duration);
                const uploadedSongs = getUploadedSongsFromLocalStorage();
                const songIndex = uploadedSongs.findIndex(s => s.id === newSong.id);
                if (songIndex !== -1) {
                    uploadedSongs[songIndex].duration = newSong.duration;
                    saveUploadedSongsToLocalStorage(uploadedSongs);
                    updateUploadedSongs();
                    initializeAllSongs();
                }
            });
        });

        if (uploadedCount > 0) {
            let message = `Successfully uploaded ${uploadedCount} song(s)`;
            if (uploadedNames.length <= 3) {
                message += `: ${uploadedNames.join(', ')}`;
            } else {
                message += `: ${uploadedNames.slice(0, 3).join(', ')} and ${uploadedNames.length - 3} more`;
            }

            Notify.success(message);
            updateUploadedSongs();
            initializeAllSongs();
            updateStatus(`Uploaded ${uploadedCount} song(s)`, "ok");
        }
    }

    function updateUploadedSongs() {
        const uploadedSongs = getUploadedSongsFromLocalStorage();

        if (uploadedSongs.length === 0) {
            elements.uploadedSongs.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                            <h5 class="text-muted">No songs uploaded yet</h5>
                            <p class="text-muted">Drag and drop audio files or click "Browse Files" to upload</p>
                        </div>
                    `;
            return;
        }

        elements.uploadedSongs.innerHTML = '';

        uploadedSongs.forEach((song, index) => {
            const songElement = document.createElement('div');
            songElement.className = 'playlist-item song-item';
            songElement.innerHTML = `
                        <img src="${song.albumArt}" alt="${song.title}">
                        <div class="playlist-info">
                            <h6>${song.title}</h6>
                            <p>${song.artist || 'Unknown Artist'}</p>
                        </div>
                        <div class="song-duration">${song.duration || '0:00'}</div>
                        <div class="action-buttons ms-2">
                            <button class="btn btn-sm btn-outline-secondary play-uploaded-btn" data-index="${index}" title="Play">
                                <i class="fas fa-play"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-custom add-uploaded-to-playlist-btn" data-index="${index}" title="Add to Playlist">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-uploaded-btn" data-index="${index}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;

            const playBtn = songElement.querySelector('.play-uploaded-btn');
            playBtn.addEventListener('click', function () {
                state.currentPlaylist = [song];
                state.currentSongIndex = 0;
                initAudioElement();
                state.audioElement.play().catch(e => {
                    console.error("Error playing audio:", e);
                });
                showSection('library');
            });

            const addBtn = songElement.querySelector('.add-uploaded-to-playlist-btn');
            addBtn.addEventListener('click', function () {
                addUploadedSongToPlaylist(song);
            });

            const deleteBtn = songElement.querySelector('.delete-uploaded-btn');
            deleteBtn.addEventListener('click', function () {
                Swal.fire({
                    title: 'Delete Song?',
                    text: `Are you sure you want to delete "${song.title}"?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        const uploadedSongs = getUploadedSongsFromLocalStorage();
                        uploadedSongs.splice(index, 1);
                        saveUploadedSongsToLocalStorage(uploadedSongs);
                        updateUploadedSongs();
                        initializeAllSongs();
                        Notify.success('Song deleted successfully');
                        updateStatus(`Deleted: ${song.title}`, "ok");
                    }
                });
            });

            elements.uploadedSongs.appendChild(songElement);
        });
    }

    function addUploadedSongToPlaylist(song) {
        if (state.playlists.length === 0) {
            Swal.fire({
                title: 'No Playlists',
                text: 'You need to create a playlist first. Would you like to create one now?',
                icon: 'info',
                showCancelButton: true,
                confirmButtonText: 'Create Playlist',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    createNewPlaylist();
                }
            });
            return;
        }

        Swal.fire({
            title: 'Add to Playlist',
            text: `Add "${song.title}" to which playlist?`,
            input: 'select',
            inputOptions: state.playlists.reduce((options, playlist) => {
                options[playlist.id] = playlist.name;
                return options;
            }, {}),
            showCancelButton: true,
            confirmButtonText: 'Add',
            preConfirm: (playlistId) => {
                const playlist = state.playlists.find(p => p.id === parseInt(playlistId));
                if (playlist && !playlist.songs.includes(song.id)) {
                    playlist.songs.push(song.id);
                    saveToLocalStorage();
                    updatePlaylistsDisplay();
                    updateSidebarPlaylists();
                    return true;
                } else if (playlist && playlist.songs.includes(song.id)) {
                    Swal.showValidationMessage('This song is already in the playlist');
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                Notify.success('Song added to playlist');
                updateStatus(`Added "${song.title}" to playlist`, "ok");
            }
        });
    }
    // LOCALSTORAGE FUNCTIONS
    function saveToLocalStorage() {
        const appState = {
            currentSongIndex: state.currentSongIndex,
            isPlaying: state.isPlaying,
            isShuffled: state.isShuffled,
            isLooping: state.isLooping,
            volume: state.volume,
            playlists: state.playlists,
            currentPlaylist: state.currentPlaylist.map(song => song.id),
            searchSettings: state.searchSettings
        };

        localStorage.setItem('musicPlayerState', JSON.stringify(appState));
    }

    function loadFromLocalStorage() {
        const savedState = localStorage.getItem('musicPlayerState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);

            state.currentSongIndex = parsedState.currentSongIndex || 0;
            state.isPlaying = false;
            state.isShuffled = parsedState.isShuffled || false;
            state.isLooping = parsedState.isLooping || false;
            state.volume = parsedState.volume || 80;
            state.playlists = parsedState.playlists || samplePlaylists;
            state.searchSettings = parsedState.searchSettings || state.searchSettings;

            // Apply search settings to UI
            document.getElementById('search-include-uploads').checked = state.searchSettings.includeUploads;
            document.getElementById('search-case-sensitive').checked = state.searchSettings.caseSensitive;
            document.getElementById('search-results-limit').value = state.searchSettings.resultsLimit;
            document.getElementById('search-results-limit-value').textContent = `${state.searchSettings.resultsLimit} results per category`;

            elements.volumeSlider.value = state.volume;
            elements.shuffleBtn.classList.toggle('active', state.isShuffled);
            elements.loopBtn.classList.toggle('active', state.isLooping);
            elements.toggleShuffleBtn.classList.toggle('active', state.isShuffled);
            elements.toggleLoopBtn.classList.toggle('active', state.isLooping);

            if (parsedState.currentPlaylist) {
                state.currentPlaylist = [];
                parsedState.currentPlaylist.forEach(songId => {
                    const sampleSong = sampleSongs.find(s => s.id === songId);
                    if (sampleSong) {
                        state.currentPlaylist.push(sampleSong);
                    }

                    const uploadedSongs = getUploadedSongsFromLocalStorage();
                    const uploadedSong = uploadedSongs.find(s => s.id === songId);
                    if (uploadedSong) {
                        state.currentPlaylist.push(uploadedSong);
                    }
                });
            }

            if (state.currentPlaylist.length > 0) {
                initAudioElement();
                if (state.isPlaying) {
                    state.audioElement.play().catch(e => {
                        console.error("Error resuming playback:", e);
                    });
                }
            } else {
                state.currentPlaylist = [...sampleSongs];
                initAudioElement();
            }
        } else {
            state.currentPlaylist = [...sampleSongs];
            state.playlists = [...samplePlaylists];
            initAudioElement();
        }

        initializeAllSongs();
    }

    function getUploadedSongsFromLocalStorage() {
        const uploadedSongs = localStorage.getItem('uploadedSongs');
        return uploadedSongs ? JSON.parse(uploadedSongs) : [];
    }

    function saveUploadedSongsToLocalStorage(songs) {
        localStorage.setItem('uploadedSongs', JSON.stringify(songs));
    }
    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    function showSection(sectionName) {
        // Hide all sections
        elements.librarySection.classList.add('d-none');
        elements.playlistsSection.classList.add('d-none');
        elements.uploadSection.classList.add('d-none');
        elements.lyricsSection.classList.add('d-none');
        elements.searchSection.classList.add('d-none');
        elements.settingsSection.classList.add('d-none');

        // Hide global search in non-library/search sections
        if (sectionName !== 'library' && sectionName !== 'search') {
            elements.globalSearchContainer.classList.add('d-none');
        } else {
            elements.globalSearchContainer.classList.remove('d-none');
        }

        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Show selected section and activate corresponding nav item
        switch (sectionName) {
            case 'library':
                elements.librarySection.classList.remove('d-none');
                elements.navLibrary.parentElement.classList.add('active');
                break;
            case 'playlists':
                elements.playlistsSection.classList.remove('d-none');
                updatePlaylistsDisplay();
                elements.navPlaylists.parentElement.classList.add('active');
                break;
            case 'upload':
                elements.uploadSection.classList.remove('d-none');
                updateUploadedSongs();
                elements.navUpload.parentElement.classList.add('active');
                break;
            case 'lyrics':
                elements.lyricsSection.classList.remove('d-none');
                updateLyrics();
                elements.navLyrics.parentElement.classList.add('active');
                break;
            case 'search':
                elements.searchSection.classList.remove('d-none');
                elements.navSearch.parentElement.classList.add('active');
                // If there's a search query, perform search
                if (state.searchQuery) {
                    performSearch(state.searchQuery, state.searchFilter);
                }
                break;
            case 'settings':
                elements.settingsSection.classList.remove('d-none');
                elements.navSettings.parentElement.classList.add('active');
                break;
        }
    }

    function updateStatus(message, type = "ok") {
        elements.statusIndicator.classList.remove('d-none', 'status-ok', 'status-warning', 'status-error');
        elements.statusIndicator.classList.add(`status-${type}`);
        elements.statusMessage.textContent = message;

        clearTimeout(window.statusTimeout);
        window.statusTimeout = setTimeout(() => {
            elements.statusIndicator.classList.add('d-none');
        }, 5000);
    }

    function showQuickTutorial() {
        // Check if tutorial has been shown before
        if (localStorage.getItem('harmonystream_tutorial_shown')) return;

        Swal.fire({
            title: 'Welcome to Music Player!',
            html: `
                <div class="text-start">
                    <p><strong>Quick Guide:</strong></p>
                    <ul>
                        <li>🎵 <strong>Play/Pause:</strong> Click the big play button or press Space</li>
                        <li>🔍 <strong>Search:</strong> Type in the search bar to find music</li>
                        <li>📁 <strong>Create Playlists:</strong> Go to "Playlists" section</li>
                        <li>⬆️ <strong>Upload Music:</strong> Drag & drop or click to upload</li>
                        <li>🎛️ <strong>Controls:</strong> Use shuffle, loop, and volume controls</li>
                    </ul>
                    <p class="text-muted">You can always access help by pressing <kbd>?</kbd></p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Got it!',
            showCancelButton: true,
            cancelButtonText: 'Show me around'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.setItem('harmonystream_tutorial_shown', 'true');
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                startInteractiveTutorial();
            }
        });
    }

    function startInteractiveTutorial() {
        const steps = [
            {
                element: elements.globalSearchInput,
                message: 'Search for songs, artists, albums, or playlists here',
                position: 'bottom'
            },
            {
                element: elements.playPauseBtn,
                message: 'Play or pause music with this button',
                position: 'top'
            },
            {
                element: elements.quickSearchBtn,
                message: 'Quickly access search from anywhere',
                position: 'left'
            },
            {
                element: elements.createPlaylistBtn,
                message: 'Create and manage your playlists here',
                position: 'top'
            }
        ];
    }
});


