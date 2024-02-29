document.addEventListener('DOMContentLoaded', function() {
    const clientId = '08b02b8351a54205b7e5615e4cdf4435'; // Replace with your Spotify client ID
    const clientSecret = '58e3602ff35040b393d3bc2c9ac92a47'; // Replace with your Spotify client secret
    const searchInput = document.getElementById('search');
    const resultsContainer = document.getElementById('results');
    const audioPlayer = document.getElementById('audio-player');
    const songDuration = document.getElementById('song-duration');

    let accessToken = '';

    // Function to fetch access token from Spotify API
    async function getAccessToken() {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        accessToken = data.access_token;
    }

    // Function to search for songs using Spotify API
    async function searchSongs(query) {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        const data = await response.json();
        return data.tracks.items;
    }

    // Function to play the selected song
    function playSong(previewUrl) {
        if (!previewUrl) {
            alert('Preview not available for this song.');
            return;
        }
        audioPlayer.src = previewUrl;
        audioPlayer.play();
    }

    // Event listener for search input
    searchInput.addEventListener('input', async function() {
        const query = this.value.trim();
        if (query !== '') {
            try {
                if (!accessToken) {
                    await getAccessToken();
                }
                const songs = await searchSongs(query);
                displayResults(songs);
            } catch (error) {
                console.error('Error searching songs:', error);
            }
        } else {
            resultsContainer.innerHTML = '';
        }
    });

    // Function to display search results
    function displayResults(songs) {
        resultsContainer.innerHTML = '';
        if (songs.length === 0) {
            resultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }
        songs.forEach(song => {
            const div = document.createElement('div');
            div.classList.add('card');

            const img = document.createElement('img');
            img.src = song.album.images[0].url; // Get the first image in the album
            img.alt = 'Album Cover';
            img.classList.add('card-img-top');
            div.appendChild(img);

            const divCardBody = document.createElement('div');
            divCardBody.classList.add('card-body');
            div.appendChild(divCardBody);

            const h5 = document.createElement('h5');
            h5.classList.add('card-title');
            h5.textContent = song.name;
            divCardBody.appendChild(h5);

            const p = document.createElement('p');
            p.classList.add('card-text');
            p.textContent = song.artists[0].name; // Get the first artist
            divCardBody.appendChild(p);

            const button = document.createElement('button');
            button.classList.add('play-btn');
            button.textContent = 'Play';
            button.addEventListener('click', function() {
                playSong(song.preview_url);
            });
            divCardBody.appendChild(button);

            resultsContainer.appendChild(div);
        });
    }

    // Event listener for loaded metadata of the audio player
    audioPlayer.addEventListener('loadedmetadata', function() {
        const duration = formatTime(audioPlayer.duration);
        songDuration.textContent = duration;
    });

    // Event listener for time update of the audio player
    audioPlayer.addEventListener('timeupdate', function() {
        const currentTime = formatTime(audioPlayer.currentTime);
        songDuration.textContent = `${currentTime} / ${formatTime(audioPlayer.duration)}`;
    });

    // Function to format time (seconds to MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainderSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainderSeconds < 10 ? '0' : ''}${remainderSeconds}`;
    }
});
