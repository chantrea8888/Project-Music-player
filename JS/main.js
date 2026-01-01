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

});

