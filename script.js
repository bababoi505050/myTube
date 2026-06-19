// DOM Elements
const guideButton = document.getElementById("guide-button");
const guidePanel = document.getElementById("guide-panel");
const homePage = document.getElementById("home-page");
const videoGridWrapper = document.getElementById("video-grid-wrapper");
const videoPlayer = document.getElementById("video-player");
const icon = document.getElementById("icon");
const player = document.getElementById("player");
const videoSource = document.getElementById("video-source");
const uploadButton = document.getElementById("Upload-button");
const uploadContainer = document.getElementById("Upload-container");
const uploadStart = document.getElementById("Upload-start");
const uploadEdit = document.getElementById("Upload-edit");
const filePicker = document.getElementById("file-picker");
const uploadHeader = document.getElementById("Upload-header");
const videoPreviewSource = document.getElementById("video-preview-source");
const videoPlayerPreview = document.getElementById("video-player-preview");
const publishButton = document.getElementById("Publish-button");
const uploadTitleInput = document.getElementById("Upload-title");
const uploadDescInput = document.getElementById("Upload-desc");

let guideOpened = false;
let uploadOpened = false;

const GITHUB_USER = "MintyDaCat";
const GITHUB_REPO = "meTube";

const MEGA_UPLOAD_URL = "https://mega.nz/filerequest/VDHd8rxq7q8";

let vids = [];

async function initializeMediaCatalog() {
    console.log("Contacting GitHub Pages storage network...");

    const baseOrigin = window.location.origin;

    let folderPath = window.location.pathname;
    if (folderPath.endsWith('.html')) {
        folderPath = folderPath.substring(0, folderPath.lastIndexOf('/'));
    }

    if (!folderPath.endsWith('/')) {
        folderPath += '/';
    }

    const liveJsonFeedUrl = `${baseOrigin}${folderPath}database.json?t=${Date.now()}`;

    console.log("Targeting direct repository file route:", liveJsonFeedUrl);

    try {
        const response = await fetch(liveJsonFeedUrl);

        if (response.ok) {
            vids = await response.json();
            console.log(`✓ Success! Synchronized ${vids.length} media entries from database.json.`);
            if (typeof loadPage === 'function') loadPage();
        } else {
            console.warn(`Database path matched, but server returned error code: ${response.status}`);
            if (typeof loadPage === 'function') loadPage();
        }
    } catch (err) {
        console.error("Critical storage tracking failure. Falling back to empty array:", err);
        vids = [];
        if (typeof loadPage === 'function') loadPage();
    }
}

window.addEventListener('DOMContentLoaded', initializeMediaCatalog);

async function loadPage() {
    videoGridWrapper.innerHTML = "";

    player.pause();

    videoPlayer.classList.remove('active');
    homePage.classList.add('active');

    Array.from(vids).forEach(video => {
        const videoCard = document.createElement('div');
        const thumbnail = document.createElement('img');
        const title = document.createElement('p');
        const hoverOverlay = document.createElement('div');
        videoCard.classList.add("video-card");
        hoverOverlay.classList.add("hover-overlay");

        title.textContent = video.name;

        if (video.thumbnail && video.thumbnail.trim() !== "") {
            thumbnail.src = video.thumbnail;
        } else {
            const fallbackVideo = document.createElement('video');
            fallbackVideo.src = video.src;
            fallbackVideo.preload = "metadata";
            fallbackVideo.muted = true;
            fallbackVideo.playsInline = true;
            fallbackVideo.currentTime = 1;
            videoCard.appendChild(fallbackVideo);
        }

        videoCard.dataset.src = video.src;
        videoCard.dataset.name = video.name;
        videoCard.dataset.thumbnail = video.thumbnail;

        videoCard.addEventListener('click', openVideo);

        videoGridWrapper.appendChild(videoCard);
        videoCard.appendChild(thumbnail);
        videoCard.appendChild(title);
        videoCard.appendChild(hoverOverlay);
    });
}

function startUpload() {
    uploadOpened = !uploadOpened;

    console.log(uploadOpened);
    if (uploadOpened) {
        uploadHeader.classList.add("active");
        uploadStart.classList.add("active");
        uploadEdit.classList.remove("active");
    } else {
        uploadHeader.classList.remove("active");
    }
}

function openVideo(Event) {
    homePage.classList.remove('active');
    videoPlayer.classList.add('active');

    const card = Event.currentTarget;

    const videoUrl = card.dataset.src;
    const videoTitle = card.dataset.name;
    const videoThumbnail = card.dataset.thumbnail;

    console.log(videoUrl);

    videoSource.src = videoUrl;

    player.load();
    player.play().catch(e => console.log("Waiting for user context to unmute..."));
}

function toggleGuide() {
    guideOpened = !guideOpened;

    if (guideOpened) {
        guidePanel.classList.add("active");
    } else {
        guidePanel.classList.remove("active");
    }
}

async function publishContent() {
    console.log("started upload");
    const selectedFile = filePicker.files[0];
    let titleText = uploadTitleInput.value.trim();
    const descText = uploadDescInput.value.trim();

    if (!selectedFile) return;

    if (!titleText) {
        titleText = new Date().toLocaleDateString();
    }

    const uploadBundle = new FormData();
    uploadBundle.append('videoFile', selectedFile);
    uploadBundle.append('title', titleText);
    uploadBundle.append('description', descText);

    console.log('trying to fetch');

    try {
        console.log('started');
        const response = await fetch('https://igjlltuasnylbqnsbugm.supabase.co/functions/v1/github-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`,
                'apikey': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
            },
            body: uploadBundle
        });

        const data = await response.json();

        if (response.ok) {
            alert(`🎉 Success! Video uploaded safely through your secure cloud middleman.`);
        } else {
            alert(`Upload Blocked: ${data.error || 'Server error'}`);
        }

    } catch (err) {
        console.log(err);
    }

    uploadStart.classList.remove('active');
    uploadEdit.classList.remove('active');
    uploadHeader.classList.remove('active');
}

// ── MEGA upload buttons ───────────────────────────────────────────────────────

document.getElementById("mega-upload-btn")
    .addEventListener("click", () => {
        window.open(MEGA_UPLOAD_URL, "_blank");
    });

document.getElementById("mega-copy-btn")
    .addEventListener("click", () => {
        const btn = document.getElementById("mega-copy-btn").querySelector("p");
        navigator.clipboard.writeText(MEGA_UPLOAD_URL).then(() => {
            btn.textContent = "✓ Copied!";
            setTimeout(() => btn.textContent = "Copy MEGA link", 2000);
        });
    });

// ── Event listeners ───────────────────────────────────────────────────────────

guideButton.addEventListener('click', toggleGuide);
uploadButton.addEventListener('click', startUpload);
icon.addEventListener('click', loadPage);
publishButton.addEventListener('click', publishContent);

filePicker.addEventListener('change', async (e) => {
    uploadStart.classList.remove('active');
    uploadEdit.classList.add('active');

    videoPreviewSource.src = URL.createObjectURL(e.currentTarget.files[0]);
    videoPlayerPreview.load();
});
