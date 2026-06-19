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

// 1. Point these to your real repository metrics
const GITHUB_USER = "MintyDaCat";
const GITHUB_REPO = "meTube";

// Leave your master memory array open and blank
let vids = []; 

// 2. ⚡️ THE AUTOMATIC DATABASE FETCH LOADER ⚡️
async function initializeMediaCatalog() {
    console.log("Contacting GitHub storage pipelines...");
    
    // Add a timestamp query to stop the browser from aggressively caching old versions!
    const liveJsonFeedUrl = `https://githubusercontent.com{GITHUB_USER}/${GITHUB_REPO}/main/database.json?t=${Date.now()}`;
    
    try {
        const response = await fetch(liveJsonFeedUrl);
        
        if (response.ok) {
            // Unpack the JSON file rows directly into your vids variable array
            vids = await response.json();
            console.log(`✓ Synchronized ${vids.length} media records from cloud database.`);
            
            // Fire your working NRY factory loop to draw all cards onto the homepage grid!
            loadPage(); 
        } else {
            console.warn("Database loaded but returned an error status.");
            loadPage();
        }
    } catch (err) {
        console.error("Critical storage tracking failure. Falling back to empty array:", err);
        vids = [];
        loadPage();
    }
}

// ⚡️ INITIALIZE AUTOMATICALLY ON PAGE LOAD ⚡️
// Replace your old casual loadPage() startup call with this cloud fetch check line:
window.addEventListener('DOMContentLoaded', initializeMediaCatalog);

function loadPage() {
    videoGridWrapper.innerHTML = ""

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

        thumbnail.src = video.thumbnail;

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

    console.log(uploadOpened)
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

    console.log(videoUrl)

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
    let titleText = uploadTitleInput.value.trim()
    const descText = uploadDescInput.value.trim()

    if (!selectedFile) {
        return;
    }

    if (!titleText) {
        titleText = new Date().toLocaleDateString();
    }

    const uploadBundle = new FormData();
    uploadBundle.append('videoFile', selectedFile);
    uploadBundle.append('title', titleText);
    uploadBundle.append('description', descText);

    console.log('trying to fetch')
    
    try {
        console.log('started')
        const response = await fetch('https://igjlltuasnylbqnsbugm.supabase.co/functions/v1/github-upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`, 
                'apikey': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` // 💥 ADD THIS LINE TO CURE THE UNAUTHORIZED ERROR!
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
    };

    uploadStart.classList.remove('active');
    uploadEdit.classList.remove('active');
    uploadHeader.classList.remove('active');
}

guideButton.addEventListener('click', toggleGuide);
uploadButton.addEventListener('click', startUpload);
icon.addEventListener('click', loadPage);
publishButton.addEventListener('click', publishContent);

loadPage()

filePicker.addEventListener('change', async (e) => {
    uploadStart.classList.remove('active');
    uploadEdit.classList.add('active');

    videoPreviewSource.src = URL.createObjectURL(e.currentTarget.files[0]);
    videoPlayerPreview.load();
})
