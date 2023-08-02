// content-script.js(このJSファイルをブラウザ画面に埋め込んでる)

// ---選択したデータをリポジトリ(dragAndDropInRepository.js)に送る ---
function getSelectionData () {
  const select = window.getSelection().toString()
  browser.runtime.sendMessage({ selection: select })
}
document.addEventListener('mouseup', getSelectionData)

function resetSelectionData () {
  browser.runtime.sendMessage({ selection: undefined })
}
//document.addEventListener('mouseup', resetSelectionData)
