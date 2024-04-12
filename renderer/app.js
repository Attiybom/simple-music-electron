const { ipcRenderer } = require('electron')

const path = require('path')

const { $ } = require('./helper')

console.log('app.html is running')

// render list
let musicFilePaths = []

// get element
const selectBtn = $('select-music')
selectBtn.addEventListener('click', () => {
  console.log('select-music btn clicked')
  ipcRenderer.send('open-music-file')
})

const importBtn = $('import-music')
importBtn.addEventListener('click', () => {
  console.log('import-music btn clicked')
  ipcRenderer.send('add-tracks', musicFilePaths)
})


const renderListHTML = (files) => {
  // 拿到dom
  const musicList = $('music-list')

  const musicListHTML = files.map(file => {
    return `<li class="list-group-item">${path.basename(file)}</li>`
  }).join('')

  musicList.innerHTML = `<ul class="list-group">${musicListHTML}</ul>`

}

ipcRenderer.on('selected-files', (event, filePath) => {
  if (!Array.isArray(filePath)) return

  console.log('selected-files event', filePath)

  // 保存到全局变量
  musicFilePaths = [...filePath]

  // 重新渲染列表
  renderListHTML(filePath)
  // selectBtn.innerHTML = filePath
})
