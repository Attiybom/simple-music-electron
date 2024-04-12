const Store = require("electron-store");

const path = require("path");

const { v4: uuid } = require("uuid");
// const store = new Store();

class MusicDataStore extends Store {
  constructor(settings) {
    super(settings);
    this.tracks = this.get("tracks") || [];
  }

  saveTracks() {
    this.set("tracks", this.tracks);
    return this;
  }

  getTracks() {
    return this.tracks || [];
  }

  addTracks(tracks) {
    const tracksWithProps = tracks
      .map((track) => {
        return {
          path: track,
          id: uuid(),
          fileName: path.basename(track),
        };
      })
      .filter((track) => {
        // 拿到路径
        const currentTracksPath = this.getTracks().map((t) => t.path);

        // 判断是否已经存在
        return currentTracksPath.indexOf(track.path) < 0;
      });

    this.tracks = this.tracks.concat(tracksWithProps);

    return this.saveTracks();
  }
}

module.exports = MusicDataStore;
