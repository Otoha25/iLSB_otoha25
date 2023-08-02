
// リポジトリからQuestionTreeViewにドラッグ&ドロップする関数
function dragendEvent (event, draggedItem) {
  console.log('dragend')

  // 変数定義
  let windowWidth = window.innerWidth // キーワードリポジトリの横幅
  let droppedXOnScreen = event.screenX - window.screenX // (ウインドウの右端からのX座標)
  let currentMode = Number(localStorage.getItem('DROP_MODE'))//ドロップする場所の判定値
  treeViewDrop(event, draggedItem, windowWidth, droppedXOnScreen);

  // 背景や透過をリセット
  event.target.style.opacity = ''
  event.target.style.background = ''

  // ドラッグされた項目をリセット
  draggedItem = undefined
  return draggedItem
}
document.addEventListener('dragend', (event) => { draggedItem = dragendEvent(event, draggedItem) })

function treeViewDrop(event, draggedItem, windowWidth, droppedXOnScreen){
  // ドラッグ先がリポジトリの外(treeView)
  // ブラウザがtreeViewの時のみにドロップする時には，アクティブなタブがtreeViewのタブかどうかを判定する処理がここに必要
  if (droppedXOnScreen >= windowWidth) { // キーワードリポジトリより外(Question Tree側)にドロップ
    // load localStorage
    let QuestionKeywords = allLoadQKeys()
    let Keywords = allLoadKeywords()
    let currentQuestion = JSON.parse(localStorage.getItem('QStorage'))

    // 抽出したキーワードをQKeywordとして定義
    let QKeyId = QuestionKeywords[QuestionKeywords.length - 1].QuestionKeywordID + 1 // 一番後ろのQKeyのQKeyID + 1
    let draggedItemID = Number(draggedItem.id)
    let draggedItemIdx = Keywords.findIndex((key) => { return key.KeywordID === draggedItemID })

    // register new Qkey to array of question keywords
    // QKeys配列にtreeViewに追加したキーワードを新たなQKeyとして追加
    let QKey = new QuestionKeyword(currentQuestion.QuestionID, QKeyId, draggedItemID, Keywords[draggedItemIdx].title)
    QuestionKeywords.push(QKey)
    allSaveQKeys(QuestionKeywords)

    // 追加されたか項目をtreeViewに通知
    // 縮尺変えた時にバグる
    // やっぱtreeViewから座標を吸い上げないといけない．
    let droppedYOnScreen = event.screenY - window.screenY // windowの上部のy座標
    let droppedPlaceOnTreeView = { x: droppedXOnScreen - windowWidth, y: droppedYOnScreen }

    // treeViewにドラッグされたことを通知
    browser.runtime.sendMessage({ dropPlace: droppedPlaceOnTreeView })
  }
}