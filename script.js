let currentMusic = new Audio();
let musics = [];
let currFolder = "";

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;
    return `${mins}:${secs}`;
}

async function getMusics(folder) {
    currFolder = folder;
    let res = await fetch(`/${folder}/`);
    let html = await res.text();    
    if (mins < 10) mins = "0" + mins;
    if (secs < 10) secs = "0" + secs;

    return `${mins}:${secs}`;
}


async function getMusics(folder) {
    currFolder = folder;
    let res = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let html = await res.text();

    let div = document.createElement("div");
    div.innerHTML = html;
    let as = div.getElementsByTagName("a");

    musics = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3")) {
            musics.push(decodeURIComponent(a.href.split("/").pop()));
        }
    }

    
    let musicUl = document.querySelector(".songlist ul");
    musicUl.innerHTML = "";
    for (let music of musics) {
        musicUl.innerHTML += `
      <li>
        <img src="images/music.png" alt="">
        <div class="info">
          <div class="songname">${music.replaceAll("%20", " ")}</div>
          <div class="songartist">Song Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="images/playnow.png" alt="">
        </div>
      </li>`;
    }

    
    Array.from(musicUl.getElementsByTagName("li")).forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".songname").innerText.trim();
            playMusic(track);
        });
    });
}


function playMusic(track, pause = false) {
    currentMusic.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentMusic.play();
        play.src = "images/pause.png";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
}


async function displayAlbums() {
    let res = await fetch(`http://127.0.0.1:3000/music/`);
    let html = await res.text();
    let div = document.createElement("div");
    div.innerHTML = html;

    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardcontainer");

    for (let a of anchors) {
        if (a.href.includes("/music/")) {
            let folder = a.href.split("/").slice(-2)[0];
            
            let infoRes = await fetch(`http://127.0.0.1:3000/music/${folder}/info.json`);
            let info = await infoRes.json();
            cardContainer.innerHTML += `
        <div data-folder="${folder}" class="card">
          <img src="music/${folder}/cover.jpg" alt="">
          <h3>${info.title}</h3>
          <p>${info.description}</p>
        </div>`;
        }
    }
}


async function main() {
    
    await getMusics("music/punjabi hits");
    playMusic(musics[0], true);

    
    await displayAlbums();

    
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            await getMusics(`music/${card.dataset.folder}`);
            playMusic(musics[0], true);
        });
    });

    
    play.addEventListener("click", () => {
        if (currentMusic.paused) {
            currentMusic.play();
            play.src = "images/pause.png";
        } else {
            currentMusic.pause();
            play.src = "images/play.png";
        }
    });

    
    currentMusic.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText =
            `${formatTime(currentMusic.currentTime)} / ${formatTime(currentMusic.duration)}`;
        document.querySelector(".circle").style.left =
            (currentMusic.currentTime / currentMusic.duration) * 100 + "%";
    });

    
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width);
        currentMusic.currentTime = percent * currentMusic.duration;
    });

    
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    
    previous.addEventListener("click", () => {
        let index = musics.indexOf(currentMusic.src.split("/").pop());
        if (index > 0) playMusic(musics[index - 1]);
    });
    next.addEventListener("click", () => {
        let index = musics.indexOf(currentMusic.src.split("/").pop());
        if (index < musics.length - 1) playMusic(musics[index + 1]);
    });

    
    document.querySelector(".range input").addEventListener("change", e => {
        currentMusic.volume = e.target.value / 100;
    });
    
    document.querySelector(".volume>img").addEventListener("click", e => {
        
        if (e.target.src.includes("volume.png")) {
            e.target.src = e.target.src.replace("volume.png", "mute.png")
            currentMusic.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0
        }
        else{
            e.target.src = e.target.src.replace("mute.png", "volume.png")
            currentMusic.volume = .1;
            
            document.querySelector(".range").getElementsByTagName("input")[0].value=10

        }
    })
}

main();
