document.addEventListener('DOMContentLoaded', () => {
    // Starta laddning av data och konfigurera event listeners
    initApp();
});

async function initApp() {
    await loadData();
    await renderAlbumDetails();  // Körs om vi befinner oss på album-details.html
    await renderMemberDetails(); // Körs om vi befinner oss på member-details.html
    renderFavoriteTracks();
}

async function loadData() {
    try {
        const [albumsRes, membersRes] = await Promise.all([
            fetch('data/albums.json'),
            fetch('data/members.json')
        ]);

        if (!albumsRes.ok || !membersRes.ok) {
            throw new Error('Fel vid hämtning av JSON-data');
        }

        const albums = await albumsRes.json();
        const members = await membersRes.json();

        renderMembers(members);
        renderAlbums(albums);

    } catch (error) {
        console.error('Ett fel uppstod:', error);
        const albumsContainer = document.querySelector('.albums-grid');
        if (albumsContainer) {
            albumsContainer.innerHTML = '<p class="error-message">Kunde inte ladda data. Kontrollera att JSON-filerna finns.</p>';
        }
    }
}

function renderMembers(members) {
    const container = document.querySelector('.members-grid');
    if (!container) return;

    container.innerHTML = members.map(m => `
        <article class="card">
            <a href="member-details.html?id=${m.id}" class="card-link">
                <img src="${m.image}" alt="${m.name}">
                <div class="card-body">
                    <h3 class="card-title">${m.name}</h3>
                    <p class="card-subtitle">${m.role}</p>
                    <p class="card-text">${m.bio}</p>
                </div>
            </a>
        </article>
    `).join('');
}

function renderAlbums(albums) {
    const container = document.querySelector('.albums-grid');
    if (!container) return;

    container.innerHTML = albums.map(a => `
        <article class="card">
            <a href="album-details.html?id=${a.id}" class="card-link">
                <img src="${a.cover}" alt="${a.title}">
                <div class="card-body">
                    <h3 class="card-title">${a.title} (${a.year})</h3>
                    <p class="card-text">${a.description}</p>
                    <p class="card-subtitle">
                        Spår i urval: ${a.tracks ? a.tracks.slice(0, 3).join(', ') + '...' : ''}
                    </p>
                </div>
            </a>
        </article>
    `).join('');
}

async function renderAlbumDetails() {
    const container = document.querySelector('#album-detail-container') || document.querySelector('.album-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const albumId = urlParams.get('id');

    if (!albumId) {
        container.innerHTML = '<p class="error-message">Inget album har valts.</p>';
        return;
    }

    try {
        const response = await fetch('data/albums.json');
        if (!response.ok) throw new Error('Kunde inte hämta albumdata.');

        const albums = await response.json();
        const album = albums.find(a => a.id === albumId);

        if (!album) {
            container.innerHTML = '<p class="error-message">Albumet kunde inte hittas.</p>';
            return;
        }

        const savedFavorites = getFavoriteTracks();

        container.innerHTML = `
            <article class="album-detail-card">
                <img src="${album.cover}" alt="${album.title}">
                <div class="album-detail-info">
                    <h2>${album.title} (${album.year})</h2>
                    <p class="description">${album.description}</p>
                    ${album.tracks ? `
                        <h3>Låtlista</h3>
                        <ol class="track-list">
                            ${album.tracks.map(track => {
                                const isSaved = savedFavorites.some(f => f.track === track && f.album === album.title);
                                return `
                                    <li class="track-item">
                                        <span class="track-name">${track}</span>
                                        <button 
                                            class="fav-btn ${isSaved ? 'saved' : ''}" 
                                            data-track="${track}" 
                                            data-album="${album.title}">
                                            ${isSaved ? '✓ Sparad' : '＋ Spara'}
                                        </button>
                                    </li>
                                `;
                            }).join('')}
                        </ol>
                    ` : ''}
                </div>
            </article>
        `;

        container.querySelectorAll('.fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const track = e.target.dataset.track;
                const albumTitle = e.target.dataset.album;
                toggleFavoriteTrack(track, albumTitle, e.target);
            });
        });

    } catch (error) {
        console.error('Fel vid laddning av albumdetaljer:', error);
        container.innerHTML = '<p class="error-message">Kunde inte ladda albuminformation.</p>';
    }
}

async function renderMemberDetails() {
    const container = document.querySelector('#member-detail-container') || document.querySelector('.member-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        container.innerHTML = '<p class="error-message">Ingen medlem har valts.</p>';
        return;
    }

    try {
        const response = await fetch('data/members.json');
        if (!response.ok) throw new Error('Kunde inte hämta medlemsdata.');

        const members = await response.json();
        const member = members.find(m => m.id === memberId);

        if (!member) {
            container.innerHTML = '<p class="error-message">Medlemmen kunde inte hittas.</p>';
            return;
        }

        container.innerHTML = `
            <article class="album-detail-card">
                <img src="${member.image}" alt="${member.name}">
                <div class="album-detail-info">
                    <h2>${member.name}</h2>
                    <p class="card-subtitle">${member.role}</p>
                    ${member.born ? `<p class="description"><strong>Född:</strong> ${member.born}</p>` : ''}
                    <p class="description">${member.bio}</p>
                    
                    ${member.instruments ? `
                        <h3>Instrument</h3>
                        <ul class="track-list">
                            ${member.instruments.map(inst => `<li>${inst}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            </article>
        `;
    } catch (error) {
        console.error('Fel vid laddning av medlemsdetaljer:', error);
        container.innerHTML = '<p class="error-message">Kunde inte ladda medlemsinformation.</p>';
    }
}

function getFavoriteTracks() {
    const saved = localStorage.getItem('zeppelinfavTracks');
    return saved ? JSON.parse(saved) : [];
}

function toggleFavoriteTrack(track, albumTitle, buttonElement) {
    let favorites = getFavoriteTracks();
    const index = favorites.findIndex(f => f.track === track && f.album === albumTitle);

    if (index > -1) {
        favorites.splice(index, 1);
        buttonElement.textContent = '＋ Spara';
        buttonElement.classList.remove('saved');
    } else {
        favorites.push({ track: track, album: albumTitle });
        buttonElement.textContent = '✓ Sparad';
        buttonElement.classList.add('saved');
    }

    localStorage.setItem('zeppelinfavTracks', JSON.stringify(favorites));
    renderFavoriteTracks();
}

function renderFavoriteTracks() {
    const container = document.querySelector('#favorite-tracks-container');
    if (!container) return;

    const favorites = getFavoriteTracks();

    if (favorites.length === 0) {
        container.innerHTML = '<p class="no-favorites">Du har inga sparade favoritlåtar än. Gå till ett album och klicka på "＋ Spara".</p>';
        return;
    }

    container.innerHTML = `
        <ul class="favorite-list">
            ${favorites.map((item, i) => `
                <li>
                    <span><strong>${item.track}</strong> — <em>${item.album}</em></span>
                    <button class="remove-fav-btn" data-index="${i}">Ta bort</button>
                </li>
            `).join('')}
        </ul>
    `;

    container.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            removeFavoriteByIndex(index);
        });
    });
}

function removeFavoriteByIndex(index) {
    let favorites = getFavoriteTracks();
    favorites.splice(index, 1);
    localStorage.setItem('zeppelinfavTracks', JSON.stringify(favorites));
    renderFavoriteTracks();
}