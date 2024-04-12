// ipc
const { ipcRenderer } = require("electron");

const { $, convertDuration } = require("./helper");

console.log("index.html is running");

// // get element
const addBtn = $("add-to-library");
addBtn.addEventListener("click", () => {
  console.log("add music library btn clicked");
  ipcRenderer.send("add-music-window");
});

// audio player
let musicAudio = new Audio();
// song
let allTracks = [];
// current playing song
let currentTrack = null;

// 渲染音乐列表
const renderHTML = (tracks) => {
  console.log("renderHTML");
  // 渲染音乐列表
  const musicList = $("music-list-container");
  musicList.innerHTML = "";

  const musicListHTML = tracks
    .map((track) => {
      return `
      <li class="row music-item list-group-item d-flex justify-content-between align-items-center border">

        <div class="col-10">
          <i class="bi bi-music-note-beamed"></i>
          <span class="music-name">${track.fileName}</span>
        </div>

        <div class="col-2">
          <i class="bi bi-play-fill play-btn " data-id=${track.id}></i>
          <i class="bi bi-trash play-btn " data-id=${track.id}></i>
        </div>

      </li>`;
    })
    .join("");

  const emptyHTML = "<div class='alert alert-primary'>尚未添加任何音乐</div>";

  musicList.innerHTML = tracks.length > 0 ? musicListHTML : emptyHTML;
};

// 渲染进度条
const renderProgress = (currentTrack, duration) => {
  console.log("renderProgress");
  const progressBar = $("progress-container");

  const HTML = `
    <div class="col font-weight-bold">
      正在播放: ${currentTrack.fileName}
    </div>
    <div class="col">
      <span id="current-seeker">00:00</span> / ${convertDuration(duration)}
    </div>
  `;

  progressBar.innerHTML = HTML;
};

// 更新进度条与播放信息
const updateProgress = (currentTime, duration) => {
  console.log("updateProgress");
  const seeker = $("current-seeker");
  seeker.innerHTML = convertDuration(currentTime);
  const progressBar = $("player-progress-bar");
  const time = Math.floor((currentTime / duration) * 100);
  progressBar.innerHTML = time + "%";
  // style
  progressBar.style.width = time + "%";
};

// 加载完毕后获取音乐列表
ipcRenderer.on("getTracks", (event, tracks) => {
  console.log("received tracks", tracks);
  allTracks = tracks;
  // if (!currentTrack) {
  //   musicAudio.src = currentTrack.filePath;
  // }
  renderHTML(tracks);
});

// 进度条部分
musicAudio.addEventListener("loadedmetadata", () => {
  // 渲染进度条
  renderProgress(currentTrack, musicAudio.duration);
});
// 更新进度条
musicAudio.addEventListener("timeupdate", () => {
  // 渲染进度条
  updateProgress(musicAudio.currentTime, musicAudio.duration);
});

// 播放逻辑
$("music-player-container").addEventListener("click", (event) => {
  event.preventDefault();

  const { dataset, classList } = event.target;
  const id = dataset && dataset.id;

  // 播放音乐
  if (classList.contains("bi-play-fill") && id) {
    console.log("start playing music");
    if (currentTrack && currentTrack.id === id) {
      // 如果当前音乐已存在说明是暂停状态，则继续播放

      musicAudio.play();
    } else {
      currentTrack = allTracks.find((track) => track.id === id);
      musicAudio.src = currentTrack.path;
      musicAudio.play();

      // 可能之前播放的是其他歌曲，因此其他歌曲的播放按钮需要还原
      const otherMusicBtns = document.querySelectorAll(".bi-pause");
      if (otherMusicBtns.length > 0) {
        otherMusicBtns.forEach((btn) => {
          btn.classList.replace("bi-pause", "bi-play-fill");
        });
      }
    }
    classList.replace("bi-play-fill", "bi-pause");
  } else if (classList.contains("bi-trash")) {
    console.log("delete music");
    // TODO: 删除音乐

    // 发送事件

    ipcRenderer.send("delete-tracks", id);
  } else if (classList.contains("bi-pause")) {
    console.log("not play music");
    musicAudio.pause();
    classList.replace("bi-pause", "bi-play-fill");
  }
});
