// ---- treeView.js ----
// treeView内(canvas)での処理全般(ノードの移動やリンクの処理等)
/*
 *** メモ ***
動かす時→動かし初めと動かし終わりでlocalStorageに格納．
動かしている最中は配列に格納
じゃないとロードに時間がかかって動きがカクカクするので．
*/
let mousemoveID = 0
let key_json = {
  "key": "",
	"rootkey": ""
}

// treeViewをクリックした時の処理
function clickOnTreeView (event, treeViewMode) {
  let Links = allLoadLinks()
  let QuestionKeywords = allLoadQKeys()
  let Keywords = allLoadKeywords()

  // マウスの場所の座標を取得
  let mousePos = getMousePos(event.clientX, event.clientY)


  // リポジトリにメッセージ送信
  let clickedNodeID = mouseOnNode(mousePos, QuestionKeywords)
  browser.runtime.sendMessage({ clicked: clickedNodeID })

  // デバッグ用
  // リポジトリ内のキーワード数を数える
  let keywordCount = 0
  let clickedNodeIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === clickedNodeID })
  for (let Key of Keywords){
    if(Key.QuestionKeywordID === clickedNodeIdx){keywordCount++}
  }
  console.log(document.getElementById("windowTitle_2").textContent)

  // 削除モードでの処理
  if (treeViewMode === DELETE_MODE) {
    let clickedNodeIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === clickedNodeID })
    if (clickedNodeIdx !== -1) {
      QuestionKeywords[clickedNodeIdx].deleteQuestionKeyword(QuestionKeywords, Links, true)
    }
    reDraw(QuestionKeywords, Links, treeViewMode)
  }
}
treeView.addEventListener('click', (event) => { clickOnTreeView(event, treeViewMode) })




// treeViewをダブルクリックした時の処理(クリックした課題キーワードを検索する)
function mousedblClick (event, treeViewMode) {
  // マウスの位置取得
  const mousePos = getMousePos(event.clientX, event.clientY)
  let QuestionKeywords = allLoadQKeys()
  let Keywords = allLoadKeywords()

  const clickedNodeID = mouseOnNode(mousePos, QuestionKeywords)
  const clickedNodeIdx = QuestionKeywords.findIndex((qkey) => { return qkey.QuestionKeywordID === clickedNodeID })
  const searchKeyword = QuestionKeywords[clickedNodeIdx].title

  // Webページ推薦モードでの処理
  if(treeViewMode === RECOMMEND_PAGES_MODE){
    // デバッグ用
    // console.log(Keywords)

    if ($('#attribution').css('display') === 'none') {
      let centerPos = QuestionKeywords[clickedNodeIdx].getCenterPos()
      if (centerPos.x < 350) centerPos.x = 350 // ウインドウの横幅700pxの半分
      if (centerPos.y < 0) centerPos.y = 0

      // ウインドウの場所を調整
      $('#attribution').css({ 'top': centerPos.y + 'px', 'left': (centerPos.x - 350) + 'px' })

      //　推薦ウインドウのタイトル
      $('#windowTitle').text("「"+ searchKeyword +"」に関連する単語を含むWebページ")

      // $('#title').text(searchKeyword +"と関連する単語を含むWebページ")

      // ウインドウ表示
      $('#attribution').fadeIn()
      // updateTab('recommendPagesTabId', '../../server_ilsb/test.html')

      // key_json['key'] = searchKeyword
      // key_json['rootkey'] = QuestionKeywords[0]["title"]

      // data = sendKey(searchKeyword, QuestionKeywords[0]["title"])
      //document.getElementById('keywords').innerHTML = data

      // console.log(key_json)
      words = []
      for (let key in Keywords) {
        words.push(Keywords[key].title)
      }

      //console.log(words)
      sendKey(searchKeyword, QuestionKeywords[0]["title"], words)

      //let setinterval = setInterval(checkKey(key), 1000)

      /*
      testFunc(function(searchKeyword) {
 
        console.log('即時関数が実行されました');
        browser.runtime.sendMessage({ recommend: true, key: searchKeyword})
      }, searchKeyword, QuestionKeywords[0]["title"])
      */
      
    }

  } else {
    updateTab('searchViewTabId', 'https://google.com/search?q=' + searchKeyword)
  }
}
treeView.addEventListener('dblclick', (event) => {mousedblClick(event, treeViewMode)})



// 推薦ウインドウを消去
function unVisible_2 () {
  // 変数定義
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  // ウインドウをフェードアウト
  $('#recommendPages').fadeOut()

  // 再描画
  reDraw(QuestionKeywords, Links, treeViewMode)
}
document.getElementById('unVisible_2').addEventListener('click', unVisible_2, false)



// --- ノードを動かしたりリンク張ったりする処理 ---
// ノードを移動させたりリンク付けさせたりする時に用いるグローバル変数
let QKeys = new Array()
let Links = new Array()
let movingNodeIdx = -1
let nodeCenterCoordinate = { x: 0, y: 0 } // ノードの左上を原点とした時のノードの中心座標


// --- ボタンを押下時 ---
function mouseDown (event, QKeys, Links, treeViewMode, nodeCenterCoordinate) {
  QKeys = allLoadQKeys()
  Links = allLoadLinks()

  // マウスの場所の取得
  const mousePos = getMousePos(event.clientX, event.clientY)
  let movingNodeID = mouseOnNode(mousePos, QKeys)
  let movingNodeIdx = QKeys.findIndex((qkey) => { return qkey.QuestionKeywordID === movingNodeID })

  if (movingNodeIdx >= 0) {
    nodeCenterCoordinate.x = mousePos.x - QKeys[movingNodeIdx].nodeX
    nodeCenterCoordinate.y = mousePos.y - QKeys[movingNodeIdx].nodeY
  }
  return [QKeys, Links, movingNodeIdx, nodeCenterCoordinate, treeViewMode]
}
treeView.addEventListener('mousedown', (event) => {
  let tmpRes = mouseDown(event, QKeys, Links, treeViewMode, nodeCenterCoordinate);
  [QKeys, Links, movingNodeIdx, nodeCenterCoordinate, treeViewMode] = tmpRes;
})



// --- マウスの移動 ---
function mouseMove (event, treeViewMode, QKeys, Links, movingNodeIdx, nodeCenterCoordinate) {
  if (movingNodeIdx >= 0) {
    const mousePos = getMousePos(event.clientX, event.clientY)
    switch (treeViewMode) {
      case NO_MODE:
        QKeys[movingNodeIdx] = calcNodeCoordinate(QKeys[movingNodeIdx], mousePos, nodeCenterCoordinate)
        reDraw(QKeys, Links, treeViewMode)
        break

      case EDIT_LINK_MODE: // 右上ボタンからリンク編集
        reDraw(QKeys, Links, treeViewMode) // 矢印以外を描画
        let startPoint = { x: QKeys[movingNodeIdx].nodeX + nodeCenterCoordinate.x, y: QKeys[movingNodeIdx].nodeY + nodeCenterCoordinate.y }
        drawBranch(startPoint, mousePos) // 矢印を描画
        break
    }
  }
}
treeView.addEventListener('mousemove', (event) => {
  mouseMove(event, treeViewMode, QKeys, Links, movingNodeIdx, nodeCenterCoordinate);
})



// --- ボタン離したとき ---
function mouseUp (event, treeViewMode, QKeys, Links, movingNodeIdx) {

  if (movingNodeIdx >= 0) {
    let mousePos = getMousePos(event.clientX, event.clientY)
    switch (treeViewMode) {
      // ノードの移動
      case NO_MODE:
        calcNodeCoordinate(QKeys[movingNodeIdx], mousePos, movingNodeIdx)
        break

      // リンクの編集
      case EDIT_LINK_MODE:
        let mouseUpNodeID = mouseOnNode(mousePos, QKeys);
        let mouseUpNodeIdx = QKeys.findIndex((qkey) => { return qkey.QuestionKeywordID === mouseUpNodeID });

        [QKeys, Links] = editBranchFunc(QKeys, Links, movingNodeIdx, mouseUpNodeIdx)

        if (event.shift) treeViewMode = NO_MODE
        break
    }
    allSaveQKeys(QKeys)
    allSaveLinks(Links)
    reDraw(QKeys, Links, treeViewMode)
  }
  movingNodeIdx = -1
  return [treeViewMode, movingNodeIdx]
}
treeView.addEventListener('mouseup', (event) => {
  [treeViewMode, movingNodeIdx] = mouseUp(event, treeViewMode, QKeys, Links, movingNodeIdx)
})



// --- treeView上のマウスの場所取得 ---
// 入力：(clientX, clientY):画面上のマウスクリックした座標
function getMousePos (clientX, clientY) {
  // canvasの左上端の座標を取得
  // aquire top left coordinate of treeView
  const offsetX = treeView.getBoundingClientRect().left
  const offsetY = treeView.getBoundingClientRect().top

  // マウスが押された座標を取得
  let mousePos = { x: clientX - offsetX, y: clientY - offsetY }
  return mousePos
}



// --- ノードの左上の座標を計算 ---
function calcNodeCoordinate (qkey, mousePos, nodeCenterCoordinate) {
  // マウスの場所を中心としたいので，マウスの場所-マウスの左上を原点としたノードの中心の座標
  let nodeX = mousePos.x - nodeCenterCoordinate.x
  let nodeY = mousePos.y - nodeCenterCoordinate.y

  // 画面外に出ないようにする制御
  if (nodeX > 0) qkey.nodeX = nodeX
  if (nodeY > 0) qkey.nodeY = nodeY

  return qkey
}



// --- メッセージを取得した時の処理 ---
function handleMessage (request, sender, sendResponse) {
  // リポジトリからtreeViewからドロップした時の処理(dropToTreeViewFromRepository.jsからの通知)
  // とりあえずmousemoveした時にノードを配置，ドロップしてからマウスを動かさないとドロップされない感じになってしまう．
  if (request.dropPlace) {
    document.addEventListener('mousemove', dropNode)
  }
}
browser.runtime.onMessage.addListener(handleMessage)



// treeViewにノードを置いた時の処理
function dropNode (event) {
  // 変数定義
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()
  let dropPlace = { x: event.clientX, y: event.clientY }

  // ドロップしたものを配置&再描画
  QuestionKeywords = getQKeywordFromRepository(dropPlace, 0, 0, QuestionKeywords)
  reDraw(QuestionKeywords, Links, treeViewMode)
  allSaveQKeys(QuestionKeywords)

  // EventListenrを解除する
  document.removeEventListener('mousemove', dropNode)
}



// --- リポジトリからドロップしたノードの配置・再描画 ---
// 入力：(posX, posY):配置する座標，(offsetX, offsetY):オフセットの座標，QuestionKeywords:課題キーワード配列
function getQKeywordFromRepository (pos, offsetX, offsetY, QuestionKeywords) {
  const NODEWIDTH = 150
  const NODEHEIGHT = 50
  let QKeywordsIdx = QuestionKeywords.length

  // 課題キーワードの座標を計算
  QuestionKeywords[QKeywordsIdx - 1].nodeX = pos.x - offsetX - NODEWIDTH / 2
  QuestionKeywords[QKeywordsIdx - 1].nodeY = pos.y - offsetY - NODEHEIGHT / 2 - 80
  return QuestionKeywords
}



function sendKey(key, rootkey, words){
  let senddic = [{"key":key, "rootkey":rootkey, "words":words}];

  browser.runtime.sendMessage({recommend: true, key: 'webページ探索中'})

  let url = "http://localhost:3000/"
  
  fetch(url, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify(senddic)
  })
  .then(response => response.json())
  .then(data => {

  const obj = JSON.parse(data)
  console.log(obj)
  console.log(typeof(obj))

  let text = ""

  if (Object.keys(obj[0])[0] === "error") {
    text = obj[0].error
  } else {
    for (let i = 0; i < obj.length; i++){
      text += '<a href="'+obj[i].url+'" target="_blank" rel="noopener noreferrer">'+obj[i].title+'</a><br>'
    }
  }
  
  browser.runtime.sendMessage({recommend: true, key: text})
  return data
  })
  .catch((error) => {
  console.error('Error:', error)
  })
}
