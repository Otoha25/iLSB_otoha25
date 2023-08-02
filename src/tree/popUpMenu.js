// --- popUpMenu.js ---
// 右クリックで表示されるメニュー(ポップアップメニュー)での処理

// popupQKeyMenuと他の関数が連動して起こるためグローバル変数として定義
let rClickedNodeID
let rClickedLinkID

function typeOrLink(e, judge){

  //let ul = document.getElementById('popmenu')

  if(judge == 'qkey'){
    let con = document.getElementById('contextmenu_1')
    //マウスカーソルの現在位置を取得
    con.style.left=e.x+"px";
    con.style.top=e.y+"px";
    //コンテキストメニューの背景部分を生成
    con.classList.add('show_1');

  }else if(judge == 'link'){
    let con = document.getElementById('contextmenu_2')
    //マウスカーソルの現在位置を取得
    con.style.left=e.x+"px";
    con.style.top=e.y+"px";
    //コンテキストメニューの背景部分を生成
    con.classList.add('show_2');   

  }
}

// --- ポップアップメニューの表示 ---
function popupMenu (e) {
  displayNone()
  // デフォルトの右クリックメニューを封じる
  e.preventDefault();

  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  treeViewMode = NO_MODE

  // クリックしているノード/リンクを同定
  const mousePos = getMousePos(e.clientX, e.clientY)
  rClickedNodeID = mouseOnNode(mousePos, QuestionKeywords)
  rClickedLinkID = mouseOnLinkNode(mousePos, QuestionKeywords, Links)
  
  // ノードの右クリックメニュー
  if (rClickedNodeID >= 0) {

    typeOrLink(e, 'qkey')

    // notify to keywordRepository
    browser.runtime.sendMessage({ clicked: rClickedNodeID });

  // リンクの右クリックメニュー
  } else if (rClickedLinkID >= 0) typeOrLink(e, 'link')


  //クリックしているノードのIDとリンクのIDを返す
  return [rClickedNodeID, rClickedLinkID]
}

treeView.addEventListener('contextmenu', (e) => {
  [rClickedNodeID, rClickedLinkID] = popupMenu(e)
  
  //右クリックを左クリックと同定してしまうための対処
  movingNodeIdx = -1;
})

//左右クリック時にコンテキストメニューを閉じる関数
function displayNone(){

  //コンテキストメニューの要素の取得
  let con_1 = document.getElementById('contextmenu_1')
  let con_2 = document.getElementById('contextmenu_2')

  //コンテキストメニューが表示されていたら閉じる
  if(con_1.classList.contains('show_1')) {
    con_1.classList.remove('show_1');
  }
  else if(con_2.classList.contains('show_2')) con_2.classList.remove('show_2');
}
//htmlの画面のどこをクリックしてもコンテキストメニューが閉じる
document.body.addEventListener('click', displayNone)


// --- マウス操作位置のノードidを返す関数 ---
function mouseOnNode (mousePos, QKeywords) {
  let clickedQkeyID

  // 新しい課題の方が上なので，課題を逆順で探索
  QKeywords.reverse()
  for (let qkey of QKeywords) {
    // 課題キーワードのタイプのサイズ
    const QTYPE_BOX_WIDTH = 80 // 属性表示領域横幅
    const QTYPE_BOX_HEIGHT = 30 // 属性表示領域高さ

    // 課題キーワードタイプの場所
    const QTYPE_BOX_X = qkey.nodeX - 10
    const QTYPE_BOX_Y = qkey.nodeY - 20

    // 課題タイプ部分やノードの範囲内でクリックされたか？
    // 条件分岐長くなるので，フラグで省略
    let isClickOnNodeX = qkey.nodeX < mousePos.x && (qkey.nodeX + qkey.nodeWidth) > mousePos.x
    let isClickOnNodeY = qkey.nodeY < mousePos.y && (qkey.nodeY + qkey.nodeHeight) > mousePos.y
    let isClickOnAttrX = QTYPE_BOX_X < mousePos.x && (QTYPE_BOX_X + QTYPE_BOX_WIDTH) > mousePos.x
    let isClickOnAttrY = QTYPE_BOX_Y < mousePos.y && (QTYPE_BOX_Y + QTYPE_BOX_HEIGHT) > mousePos.y

    // ノード/課題タイプの範囲内でクリックされていれば，課題キーワードIDを返す
    if ((isClickOnNodeX && isClickOnNodeY) || (isClickOnAttrX && isClickOnAttrY)) {
      clickedQkeyID = qkey.QuestionKeywordID
      break
    }
  }
  QKeywords.reverse() // 戻さないと，キャッシュ等の関係でそのままの順で以降のプロセスが続いてしまう．
  return clickedQkeyID
}



// --- クリックしているリンクのIDを返す関数 ---
function mouseOnLinkNode (mousePos, QKeywords, Links) {
  // -- 変数定義 --
  let clickedLinkID
  let linkNodeWidth
  let linkNodeHeight

  // -- 新しいリンクの方が上なので，リンクを逆順で探索 --
  Links.reverse()
  for (let link of Links) {
    // リンクの中心座標取得
    let parentQKey = QKeywords.find((value) => { return value.QuestionKeywordID === link.parentNodeID })
    let childQKey = QKeywords.find((value) => { return value.QuestionKeywordID === link.childNodeID })
    let linkStart = parentQKey.getCenterPos()
    let linkEnd = childQKey.getCenterPos()
    let linkCenterPos = { x: (linkStart.x + linkEnd.x) / 2, y: (linkStart.y + linkEnd.y) / 2 }

    // リンクの高さ，横幅を定義(リンクの属性があるかどうかで異なる)
    if (link.AttributeName) {
      linkNodeWidth = 100
      linkNodeHeight = 30
    } else {
      linkNodeWidth = 50
      linkNodeHeight = 50
    }

    // 属性表示部分をクリックしているかX軸方向，y軸方向で判定判定
    let linkTopLeftPos = { x: linkCenterPos.x - linkNodeWidth/2 , y: linkCenterPos.y - linkNodeHeight / 2 }
    let isLinkClickX = linkTopLeftPos.x < mousePos.x && mousePos.x < linkTopLeftPos.x + linkNodeWidth
    let isLinkClickY = linkTopLeftPos.y < mousePos.y && mousePos.y < linkTopLeftPos.y + linkNodeHeight

    // 属性表示部分をクリックしていた場合のみclickedLinkIDにリンクのIDを格納し，結果を返す．
    if (isLinkClickX && isLinkClickY) {
      clickedLinkID = link.LinkID
      break
    }
  }
  Links.reverse() // 戻さないと，キャッシュ等の関係でそのままの順で以降のプロセスが続いてしまう．
  return clickedLinkID
}



// コンテキストメニュー->削除
function deleteQKeyRight (rClickedNodeID) {
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()
  let deleteQKeyIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === rClickedNodeID })

  // 削除＆更新処理
  QuestionKeywords[deleteQKeyIdx].deleteQuestionKeyword(QuestionKeywords, Links)
  reDraw(QuestionKeywords, Links, treeViewMode)
}
document.getElementById('deleteQKeywordRight').addEventListener('click', (e) => {
  deleteQKeyRight(rClickedNodeID);
  rClickedNodeID = undefined;
  displayNone()
})



// --- コンテキストメニュー->キーワード名変更 ---
function editQKey (rClickedNodeID) {
  // -- 変数定義 --
  let QuestionKeywords = allLoadQKeys()
  let deleteQKeyIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === rClickedNodeID })
  console.log(QuestionKeywords[deleteQKeyIdx].title);
  let Links = allLoadLinks()
  const optNewTitle = {
    text: '変更するキーワードを入力',
    content: {
      element: 'input',
      attributes: {
        value: QuestionKeywords[deleteQKeyIdx].title
      }
    }
  }

  // プロンプト提示＆入力された時の処理
  if (rClickedNodeID > 0) {
    swal(optNewTitle).then((newTitle) => {
      if(newTitle){
        QuestionKeywords[deleteQKeyIdx].editQuestionKeyword(newTitle)
      }else{
        QuestionKeywords[deleteQKeyIdx].editQuestionKeyword(QuestionKeywords[deleteQKeyIdx].title)
      }
      reDraw(QuestionKeywords, Links, treeViewMode)
    })
  } else {
    swal('この課題の課題名は変更できません！', '', 'warning')
  }
}

document.getElementById('editQKeyword').addEventListener('click', (e) => {
  editQKey(rClickedNodeID);
  rClickedNodeID = undefined;
  displayNone()
})



// コンテキストメニュー->検索
function searchQKey (rClickedNodeID) {
  let QuestionKeywords = allLoadQKeys()
  let clickedQKeyIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === rClickedNodeID })
  let searchKeyword = QuestionKeywords[clickedQKeyIdx].title
  updateTab('searchViewTabId', 'https://google.com/search?q=' + searchKeyword)
}
document.getElementById('searchQKeyword').addEventListener('click', () => {
  rClickedNodeID = searchQKey(rClickedNodeID);
  rClickedNodeID = undefined;
  displayNone()
})



// --- 右クリックメニューで課題タイプ一覧表示 ---
function QkeyType () {
  // #attributionのcssがnoneの時のみ表示
  if ($('#attribution').css('display') === 'none') {
    let QuestionKeywords = allLoadQKeys()
    let clickIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === rClickedNodeID })

    // 表示するウインドウの中心を調整
    let centerPos = QuestionKeywords[clickIdx].getCenterPos()
    if (centerPos.x < 350) centerPos.x = 350 // ウインドウの横幅700pxの半分
    if (centerPos.y < 0) centerPos.y = 0

    // ウインドウの場所を調整
    $('#attribution').css({ 'top': centerPos.y + 'px', 'left': (centerPos.x - 350) + 'px' })

    // 課題タイプ一覧のウインドウ作成
    $('#windowTitle').text(QuestionKeywords[clickIdx].title + 'の課題タイプ一覧')

    // ウインドウ表示
    $('#attribution').fadeIn()

    // attribution.jsに表示しているかと選択課題キーワードを送信
    browser.runtime.sendMessage({ type: true, clickedNodeID: rClickedNodeID })
  }
  // 右クリックしたノードを初期化
  rClickedNodeID = undefined
  displayNone()
}
document.getElementById('QkeyType').addEventListener('click', QkeyType, false)



// 右クリックメニューで属性一覧表示
function editLinkAttribute () {
  // #attributionのcssがnoneの時のみ表示
  if ($('#attribution').css('display') === 'none') {
    let QuestionKeywords = allLoadQKeys()
    let Links = allLoadLinks()
    let clickIdx = Links.findIndex((value) => { return value.LinkID === rClickedLinkID })
    let parentIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === Links[clickIdx].parentNodeID })
    let childIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === Links[clickIdx].childNodeID })
    let parentKey = QuestionKeywords[parentIdx].title
    let childKey = QuestionKeywords[childIdx].title

    // 属性一覧のウインドウ作成
    $('#windowTitle').text(parentKey + 'から' + childKey + 'へのリンクに対する属性一覧')

    // 表示するウインドウの中心を調整
    let parentCenterPos = QuestionKeywords[parentIdx].getCenterPos()
    let childCenterPos = QuestionKeywords[childIdx].getCenterPos()
    let linkCenterPos = { x: (parentCenterPos.x + childCenterPos.x) / 2, y: (parentCenterPos.y + childCenterPos.y) / 2 }
    if (linkCenterPos.x < 350) linkCenterPos.x = 350 // ウインドウの横幅700pxの半分
    if (linkCenterPos.y < 0) linkCenterPos.y = 0

    // ウインドウの場所を調整
    $('#attribution').css({ 'top': linkCenterPos.y + 'px', 'left': (linkCenterPos.x - 350) + 'px' })

    // ウインドウ表示
    $('#attribution').fadeIn()

    // attribution.jsに表示しているかと選択リンクを送信
    browser.runtime.sendMessage({ attr:true, clickedNodeID: rClickedLinkID})
  }
  // クリックしたリンクの初期化
  rClickedLinkID = undefined
  displayNone()
}
document.getElementById('editLinkTypeMenu').addEventListener('click', editLinkAttribute, false)



// --- iframe消えた時の処理(attribute.jsから呼び出し) ---
function unVisible () {
  // 変数定義
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()

  // ウインドウをフェードアウト
  $('#attribution').fadeOut()

  document.getElementById('attribution').childNodes[1].blur() // iframeのフォーカスを外す

  // 再描画
  reDraw(QuestionKeywords, Links, treeViewMode)
}
document.getElementById('unVisible').addEventListener('click', unVisible, false)



// ---- 属性/課題タイプ一覧ウィンドウをドラッグ処理 ----
let dragFlag = false // ドラッグしているかのフラグ
let iframeOffset = [0,0] // iframeの左端からクリックしたところまでのOffset

let dragFlag_recommendPages = false
let iframeOffset_recommendPages = [0,0] 

// --- ドラッグし始めた時の処理 ---
function initDragWindow (event) {
  dragFlag = true
  // iframeのどの部分をドラッグしているか計算
  iframeOffset[0] = parseInt(document.getElementById('attribution').style.left) - event.pageX
  iframeOffset[1] = parseInt(document.getElementById('attribution').style.top) - event.pageY
}
document.getElementById('windowBar').addEventListener('mousedown', initDragWindow)

function initDragRecommendWindow (event) {
  dragFlag_recommendPages = true
  // frame_recommendPagesのどの部分をドラッグしているか計算
  iframeOffset_recommendPages[0] = parseInt(document.getElementById('recommendPages').style.left) - event.pageX
  iframeOffset_recommendPages[1] = parseInt(document.getElementById('recommendPages').style.top) - event.pageY
}
document.getElementById('windowBar_2').addEventListener('mousedown', initDragRecommendWindow)

// --- ドラッグ中の処理をする関数 ---
function windowDrag (event) {
  // ドラッグフラグが立っている時のみiframeの場所を更新
  if (dragFlag) {
    let iframeWindow = document.getElementById('attribution')

    iframeWindow.style.left = event.pageX + iframeOffset[0] + 'px'
    iframeWindow.style.top = event.pageY + iframeOffset[1] + 'px'

  } else if (dragFlag_recommendPages) {
    let iframeWindow = document.getElementById('recommendPages')

    iframeWindow.style.left = event.pageX + iframeOffset_recommendPages[0] + 'px'
    iframeWindow.style.top = event.pageY + iframeOffset_recommendPages[1] + 'px'
  }
}
document.addEventListener('mousemove', windowDrag) // ドラッグ処理にはならないはずなので，mousemoveで定義
document.addEventListener('mouseup', (event) => {
  dragFlag = false
  dragFlag_recommendPages = false
}) // mouseUp→ドラッグフラグ初期化