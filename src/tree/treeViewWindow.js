// --- treeViewWindow.js ---
// treeView.htmlをロードしたりサイズ変更したり，上部のメニューをクリックした時の処理

// --- 定数定義(treeViewのモード) ---
const NO_MODE = 0
const DELETE_MODE = 1
const EDIT_LINK_MODE = 2
const RECOMMEND_PAGES_MODE = 5

// --- グローバル変数定義 ---
let treeViewMode = NO_MODE


// 課題やリンクの配列をロードする
function QTreeOnLoadEvent () {
  let QuestionKeywords = allLoadQKeys() // ローカルストレージから読み込み
  let Links = allLoadLinks()
  const TREEVIEW_MODE = 10
  localStorage.setItem('DROP_MODE',TREEVIEW_MODE);
  reDraw(QuestionKeywords, Links, treeViewMode) // 再描画
}
window.addEventListener('load', QTreeOnLoadEvent)



// canvasのサイズ動的変更
function canvas_resize () {
  console.log("resize");
  const WINDOW_WIDTH = window.innerWidth
  const WINDOW_HEIGHT = window.innerHeight
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  treeView.setAttribute('width', WINDOW_WIDTH - 3*2)
  treeView.setAttribute('height', WINDOW_HEIGHT - 100 -3*4)
  reDraw(QuestionKeywords, Links, treeViewMode)
}
// ロードした時にサイズ変更
canvas_resize() // addEventListenerでロードするよりこちらの方が自然に対応するので．
window.addEventListener('resize', canvas_resize)



// --- 上部メニューに関する関数 ---
// 削除ボタンをクリックした時の処理
function deleteQKey (treeViewMode) {
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()
  if (treeViewMode !== DELETE_MODE) {
    treeViewMode = DELETE_MODE
    reDraw(QuestionKeywords, Links, treeViewMode)
    swal('削除するノードをクリックしてください')
  } else {
    treeViewMode = NO_MODE
    reDraw(QuestionKeywords, Links, treeViewMode)
  }
  return treeViewMode
}
document.getElementById('deleteQKeyword').addEventListener('click', (event) => { treeViewMode = deleteQKey(treeViewMode) })



// 編集ボタンをクリックした時の処理
function editBranch (treeViewMode) {
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  if (treeViewMode !== EDIT_LINK_MODE) {
    treeViewMode = EDIT_LINK_MODE
  } else {
    treeViewMode = NO_MODE
  }
  reDraw(QuestionKeywords, Links, treeViewMode)
  return treeViewMode
}
document.getElementById('editQKeyBranch').addEventListener('click', (event) => { treeViewMode = editBranch(treeViewMode) })



// Webページ推薦ボタンをクリックした時の処理
function recommendPages (treeViewMode){
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  if (treeViewMode !== RECOMMEND_PAGES_MODE){
    treeViewMode = RECOMMEND_PAGES_MODE
  } else {
    treeViewMode = NO_MODE
  }
  reDraw(QuestionKeywords, Links, treeViewMode)
  return treeViewMode
}
document.getElementById('recommendWebPages').addEventListener('click', (event) => { treeViewMode = recommendPages(treeViewMode) })

// --- 学習終了ボタンを押した時の処理 ---
function finishCreateTree() {
  // -- 変数定義 --
  let QuestionKeywords = allLoadQKeys()
  let Keywords = allLoadKeywords()
  let isFin = true;
  let alertQKeywords = [];

  // -- 全ての課題が学習済みかチェック(全リポジトリにキーワードが入っているかチェック) --
  for (let qkey of QuestionKeywords) {
    let keyIdxInThisRep = Keywords.findIndex((key) => { return key.QuestionKeywordID === qkey.QuestionKeywordID })
    if (keyIdxInThisRep === -1) {
      swal("未学習の課題が残っています")
      isFin = false
      break
    }
  }
  if (isFin) {
    browser.runtime.sendMessage({ finish: true })
    swal("学習を終了しました．")
  }
}
document.getElementById("finishCreateTree").addEventListener("click", finishCreateTree, false);