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
});

