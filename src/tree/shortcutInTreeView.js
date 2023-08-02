// --- shortcutInTreeView.js ---
// treeViewでのショートカットを定義

// --- キーボードのキーを押した時の処理 ---
function keyDown (event, treeViewMode) {
  // ショートカット追加時は以下のswitch文に追加
  switch (event.key) {
    // Shiftキーを押したらリンク編集モード
    case 'Shift':
      treeViewMode = EDIT_LINK_MODE
      break
  }
  return treeViewMode
}
window.addEventListener('keydown', (event) => { treeViewMode = keyDown(event, treeViewMode) })



// --- キーボードのキーを離した時の処理 ---
function keyUp (event, treeViewMode) {
  // ショートカット追加時は以下のswitch文に追加
  switch (event.key) {
    // Shiftキーを押したらリンク編集モード解除し，reDrawで解除
    case 'Shift':
      let Links = allLoadLinks()
      let QuestionKeywords = allLoadQKeys()
      treeViewMode = NO_MODE
      reDraw(QuestionKeywords, Links, treeViewMode)
      break
  }
  return treeViewMode
}
window.addEventListener('keyup', (event) => { treeViewMode = keyUp(event, treeViewMode) })
