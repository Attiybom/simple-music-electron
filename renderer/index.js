// ipc
const { ipcRenderer } = require('electron')

const { $ } = require('./helper')

console.log('index.html is running')

// // get element
const addBtn = $('add-to-library')
addBtn.addEventListener('click', () => {
  console.log('add music library btn clicked')
  ipcRenderer.send('add-music-window')
})
