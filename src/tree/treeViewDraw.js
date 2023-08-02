// --- treeViewDraw.js ---
// treeView上での描画関連の関数

// --- treeView.jsにノード，リンク描画する関数 ---
function reDraw (QKeywords, Links, editMode) {
  // -- 変数定義 --
  const treeViewTx = treeView.getContext('2d')
  let ModeName = ''
  let ModeAreaWidth = 0

  // -- キャンバスの初期化 --
  treeViewTx.clearRect(0, 0, treeView.width, treeView.height)

  // -- キャンバスの設定 --
  // フォントの定義
  treeViewTx.font = "15px 'Meiryo'"
  // 枠表示色設定
  treeViewTx.strokeStyle = '#000000'
  treeViewTx.fillStyle = '#ffffff'
  // 影の設定：影をなくす
  treeViewTx.shadowBlur = 0          // 影のぼかしレベル
  treeViewTx.shadowOffsetX = 0       // 影を右側に0px落とす
  treeViewTx.shadowOffsetY = 0       // 影を下側に0px落とす

  // -- キャンバス背景描画 --
  switch (editMode) {
    // ノード削除モード
    case DELETE_MODE:
      treeView.style.backgroundColor = '#f6ced8'
      ModeName = 'ノード削除中'
      ModeAreaWidth = treeViewTx.measureText(ModeName).width
      treeViewTx.fillRect(0, 0, ModeAreaWidth + 10, 20)
      treeViewTx.strokeRect(0, 0, ModeAreaWidth + 10, 20)
      break
    // リンク編集モード
    case EDIT_LINK_MODE:
      treeView.style.backgroundColor = '#cee3f6'
      ModeName = 'リンク編集中'
      ModeAreaWidth = treeViewTx.measureText(ModeName).width
      treeViewTx.fillRect(0, 0, ModeAreaWidth + 10, 20)
      treeViewTx.strokeRect(0, 0, ModeAreaWidth + 10, 20)
      break
    // Webページ推薦モード
    case RECOMMEND_PAGES_MODE:
      treeView.style.backgroundColor = "#7cd9cb";
      ModeName = "Webページ推薦モード";
      ModeAreaWidth = treeViewTx.measureText(ModeName).width
      treeViewTx.fillRect(0, 0, ModeAreaWidth + 10, 20);
      treeViewTx.strokeRect(0, 0, ModeAreaWidth + 10, 20);
      break;
    // 通常の状態
    default:
      treeView.style.backgroundColor = '#ffffff'
      ModeName = ''
      break
  }

  // -- モード部分の文字の描画 --
  treeViewTx.fillStyle = '#000000' // 文字色
  treeViewTx.fillText(ModeName, 5, 15) // 描画

  // -- リンクの描画 --
  for (let link of Links) {
    let parentQKey = QKeywords.find((qkey) => { return qkey.QuestionKeywordID === link.parentNodeID })
    let childQKey = QKeywords.find((qkey) => { return qkey.QuestionKeywordID === link.childNodeID })
    // 各ノードの中心座標取得
    let linkStart = parentQKey.getCenterPos()
    let linkEnd = childQKey.getCenterPos()

    // リンクと子ノードの接点取得
    let contactPoint = childQKey.findContactPoint(linkStart, linkEnd)
    if (contactPoint) {

      // Webページ推薦モードの時、属性の色を変える
      if(editMode === RECOMMEND_PAGES_MODE){
        const color = '#ffefe0' // 薄いオレンジ色
        link.drawLinkChangeColor (QKeywords, linkStart, contactPoint, linkEnd, color)
      } else {
        link.drawLink(QKeywords, linkStart, contactPoint, linkEnd)
      }
    }
  }

  let Keywords = allLoadKeywords()

  // -- ノードの描画 --
  // (リンクの描画が全部終わってから描画しないと，ノードの上にリンクの線が出る)
  for (let QKey of QKeywords) {
    if (editMode === RECOMMEND_PAGES_MODE){

      let keywordCount = 0
      const colors = [
        {color1: "#FFFFFF", color2: "#FFFFFF"},
        {color1: "#CCE1FF", color2: "#E1F5FF"},
        {color1: "#99C2FF", color2: "#C2EBFF"},
        {color1: "#66A4FF", color2: "#A4E1FF"},
        {color1: "#3385FF", color2: "#85D7FF"},
        {color1: "#0066FF", color2: "#66CCFF"}
      ]

      // リポジトリ内のキーワード数を数える
      for (let Key of Keywords){
        if (Key.QuestionKeywordID === QKey.QuestionKeywordID){keywordCount++}
      }

      let color1 = colors[0].color1
      let color2 = colors[0].color2
      
      // キーワードの数に応じて色を変更
      if(keywordCount < 6){
        color1 = colors[keywordCount].color1
        color2 = colors[keywordCount].color2
      } else {
        color1 = colors[5].color1
        color2 = colors[5].color2
      }

      //console.log(color1_num, color1)
      QKey.addQuestionKeywordNodeChangeColor(QKey.nodeX, QKey.nodeY, color1, color2)
    } else {
      QKey.addQuestionKeywordNode(QKey.nodeX, QKey.nodeY)
    }
    QKey.addQuestionKeywordType(QKeywords, QKey.QKeyType)
  }
  allSaveQKeys(QKeywords)
}


// --- リンクの描画関数 ---
function drawBranch (start, end) {
  // 定数定義
  const treeViewTx = treeView.getContext('2d')

  // -- 矢印の描画
  treeViewTx.beginPath() // 描画開始

  // 影の描画
  treeViewTx.shadowBlur = 3          // 影のぼかしレベル
  treeViewTx.shadowOffsetX = 1       // 影を右側に1px落とす
  treeViewTx.shadowOffsetY = 1       // 影を下側に1px落とす
  treeViewTx.shadowColor = '#bc611e'   // 影の色

  const arrow = drawArrow(end, start) // 矢印の先端部分の計算・取得

  treeViewTx.lineWidth = 1
  treeViewTx.strokeStyle = '#ffa500'
  treeViewTx.fillStyle = '#ffa500'  //文字色

  // リンクの描画
  treeViewTx.moveTo(start.x, start.y) //始点に移動
  treeViewTx.lineTo(end.x, end.y) //終点へ向かって線を引く
  treeViewTx.stroke()  //線の描画
  treeViewTx.lineTo(arrow.Lx, arrow.Ly)  //終点から左側の根の端へ
  treeViewTx.lineTo(arrow.Rx, arrow.Ry)  //左から右へ
  treeViewTx.lineTo(end.x, end.y)  //右から始点へ
  treeViewTx.fill()  //描画終了(塗りつぶし)
  treeViewTx.closePath() //線を繋げる
}

// --- 鏃(矢印の先端の▼)の座標計算 ---
function drawArrow (contactPoint, linkStart) {
  // 定数定義
  const WIDTH = 9 // 鏃の根の幅（片方）
  const HEIGHT = 20 // 鏃の長さ

  // 基本ベクトル
  const Vx = contactPoint.x - linkStart.x
  const Vy = contactPoint.y - linkStart.y

  // 基本ベクトル長
  const V = Math.sqrt(Vx * Vx + Vy * Vy)

  // 基本単位ベクトル
  const Ux = Vx / V
  const Uy = Vy / V

  // 鏃の根の両端
  const arraw = new Object()

  // L: 矢印の▲の左側の頂点，R: ▲の右側の頂点
  arraw.Lx = contactPoint.x - Uy * WIDTH - Ux * HEIGHT
  arraw.Ly = contactPoint.y + Ux * WIDTH - Uy * HEIGHT
  arraw.Rx = contactPoint.x + Uy * WIDTH - Ux * HEIGHT
  arraw.Ry = contactPoint.y - Ux * WIDTH - Uy * HEIGHT

  return arraw
}



// --- undefinedの時にアラートアイコンを表示する関数 ---
function iconDraw (iconCenterPos, typeOrAttr) {
  // 定数定義
  const treeViewTx = treeView.getContext('2d')
  const ICONSIZE = 50

  // 画像取り込み
  let img = new Image()
  img.src = '../../lib/caution.png'

  // 左上の座標格納変数定義
  let iconTopLeftX
  let iconTopLeftY
  // undefined時のアイコンの左上の座標を計算
  switch (typeOrAttr) {
    case 'QKeyType':
      iconTopLeftX = iconCenterPos.x - ICONSIZE / 8
      iconTopLeftY = iconCenterPos.y - ICONSIZE / 8
      break
    case 'Attribute':
      iconTopLeftX = iconCenterPos.x - ICONSIZE / 2
      iconTopLeftY = iconCenterPos.y - ICONSIZE / 2
      break
  }
  // 画像を描画
  treeViewTx.drawImage(img, iconTopLeftX, iconTopLeftY, ICONSIZE, ICONSIZE) // 400x300に縮小表示
}



// --- treeViewにノードを描く ---
function nodeDraw (nodePos, nodeWidth, nodeHeight, color1, color2, lineColor, shadowColor, r) {
  const treeViewTx = treeView.getContext('2d') // canvasに描画するためのAPIにアクセスするオブジェクト'

  const grad = treeViewTx.createLinearGradient(nodePos.x, nodePos.y, nodePos.x, nodePos.y + nodeHeight)
  treeViewTx.shadowColor = shadowColor

  // グラデーションの設定
  grad.addColorStop(0, color2)
  grad.addColorStop(0.3, color1)
  grad.addColorStop(0.7, color1)
  grad.addColorStop(1, color2)

  // グラデーションで塗る
  treeViewTx.strokeStyle = grad
  if (lineColor) { // 線の色指定（＝リンク上の属性ノード）
    treeViewTx.strokeStyle = lineColor
    treeViewTx.globalAlpha = 0.8
  }
  treeViewTx.fillStyle = grad

  // -- ノードの描画 --
  // 描画開始
  treeViewTx.beginPath()

  // 角丸四角描画
  treeViewTx.arc(nodePos.x + nodeWidth - r, nodePos.y + r, r, 0, -Math.PI/2, true)
  treeViewTx.arc(nodePos.x + r, nodePos.y + r, r, -Math.PI/2, Math.PI, true)
  treeViewTx.arc(nodePos.x + r, nodePos.y + nodeHeight - r, r, Math.PI, Math.PI/2, true)
  treeViewTx.arc(nodePos.x + nodeWidth - r, nodePos.y + nodeHeight - r, r, Math.PI/2, 0, true)

  // 描画終了
  treeViewTx.closePath()
  treeViewTx.stroke()
  treeViewTx.fill()
  treeViewTx.globalAlpha = 1.0
}



// --- 文字の描画 ---
function textDraw (nodePos, nodeWidth, nodeHeight, title) {
  // -- 変数定義 --
  const treeViewTx = treeView.getContext('2d')
  let textWidth = treeViewTx.measureText(title).width // テキスト自体の横幅
  let fontSize

  // -- 文字表示部の色の設定 --
  treeViewTx.strokeStyle = '#000000'
  //treeViewTx.fillStyle = '#FFFFDD'
  treeViewTx.fillStyle = '#000000'

  // -- 文字表示位置・フォントサイズの調整 --
  treeViewTx.font = "15px 'Meiryo'"
  if (textWidth < nodeWidth - 5) {
    fontSize = 15
  } else if (textWidth > nodeWidth * 2 - 5) { // 文字数全角20程度以上は7px固定(はみでる)
    fontSize = 7
  } else { // ある程度文字が小さくなるまでは可変
    fontSize = (nodeWidth - 5) * 15 / textWidth // 比で考える(ちょっと余裕を持たせるために-5．15は元が15pxのため)
  }

  // -- 変更後のフォントサイズの横幅に対応したテキスト自体の横幅 --
  textWidth = treeViewTx.measureText(title).width

  // -- 影をなしに --
  treeViewTx.shadowBlur = 0
  treeViewTx.shadowOffsetX = 0
  treeViewTx.shadowOffsetY = 0

  // -- 最終的なフォントの大きさや場所の設定と描画 --
  // テキストのX座標：(ノード右端)-ノード幅半分-テキスト幅半分
  let textPosX = (nodePos.x + nodeWidth) - nodeWidth / 2 - textWidth / 2
  treeViewTx.font = fontSize + "px 'Meiryo'"
  treeViewTx.fillText(title, textPosX, nodePos.y + nodeHeight * 2 / 3)
}