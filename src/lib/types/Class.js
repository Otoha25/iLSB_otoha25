// --- KeywordMap.js ---
// 学習自体，課題，取得キーワードのクラス定義

// --- 学習自体の情報を入れるためのクラス定義 ---
class Question {
  constructor (QuestionID, QuestionName, userName, date, startTime, endTime) {
    this.QuestionID = parseInt(QuestionID)
    this.QuestionName = QuestionName
    this.userName = userName
    this.date = date
    this.startTime = startTime
    this.endTime = endTime
  }
}



// --- 課題に関するクラス定義 ---
class QuestionKeyword {
  constructor (QuestionID, QuestionKeywordID, KeywordID, title, parent, QKeyType, nodeX, nodeY) {
    this.QuestionID = parseInt(QuestionID)
    this.QuestionKeywordID = parseInt(QuestionKeywordID)
    this.KeywordID = parseInt(KeywordID)
    this.title = title
    this.parent = parseInt(parent)
    this.QKeyType = QKeyType

    // ノード座標
    this.nodeX = nodeX
    this.nodeY = nodeY

    // ノードの高さ，横幅
    this.nodeWidth = 150
    this.nodeHeight = 50
  }


  // -- ノード追加・canvasに描画 --
  addQuestionKeywordNode (nodeX, nodeY) {
    // - 定数定義 -
    const RADIUS = 10
    const LINE_COLOR = null // 囲み線つけないためnull(ノード描画処理にて分岐)
    const treeViewTx = treeView.getContext('2d')
    const nodePos = { x: this.nodeX, y: this.nodeY }

    // ノードの色定義
    const DARK_BLUE = '#99F1FF'
    const LIGHT_BLUE = '#c5fffd'
    const SHADOW_COLOR = '#719bad'

    // 影の描画
    treeViewTx.shadowBlur = 3
    treeViewTx.shadowOffsetX = 0
    treeViewTx.shadowOffsetY = 2

    // ノードとテキストの描画
    nodeDraw(nodePos, this.nodeWidth, this.nodeHeight, DARK_BLUE, LIGHT_BLUE, LINE_COLOR, SHADOW_COLOR, RADIUS)
    textDraw(nodePos, this.nodeWidth, this.nodeHeight, this.title)
  }

  // -- ノード追加・色を変更しcanvasに描画 --
  addQuestionKeywordNodeChangeColor (nodeX, nodeY, color1, color2) {
    // - 定数定義 -
    const RADIUS = 10
    const LINE_COLOR = null // 囲み線つけないためnull(ノード描画処理にて分岐)
    const treeViewTx = treeView.getContext('2d')
    const nodePos = { x: this.nodeX, y: this.nodeY }

    // ノードの色定義
    const COLOR1 = color1
    const COLOR2 = color2
    const SHADOW_COLOR = '#719bad'  

    // 影の描画
    treeViewTx.shadowBlur = 3
    treeViewTx.shadowOffsetX = 0
    treeViewTx.shadowOffsetY = 2

    // ノードとテキストの描画
    nodeDraw(nodePos, this.nodeWidth, this.nodeHeight, COLOR1, COLOR2, LINE_COLOR, SHADOW_COLOR, RADIUS)
    textDraw(nodePos, this.nodeWidth, this.nodeHeight, this.title)
  }


  // -- 課題タイプの描画 --
  addQuestionKeywordType (QKeywords, QKeyType) {
    const treeViewTx = treeView.getContext('2d')
    const RADIUS = 3.0
    const NODE_TYPE_WIDTH = 80
    const NODE_TYPE_HEIGHT = 30


    const COLOR1 = "#ff8c00";
    const COLOR2 = "#ffa500";
    const SHADOW_COLOR = "#a2553c";
    const LINE_COLOR = null; // 囲み線つけない
    let typePos = { x: this.nodeX - 10, y: this.nodeY - 20 }
    //console.log(typePos)
    // 属性変更
    this.QKeyType = QKeyType;

    // 影をなしに
    treeViewTx.shadowBlur = 0
    treeViewTx.shadowOffsetX = 0
    treeViewTx.shadowOffsetY = 0

    // 課題タイプあり→ノードとテキストの描画
    if (this.QKeyType) {
      nodeDraw(typePos, NODE_TYPE_WIDTH, NODE_TYPE_HEIGHT, COLOR1, COLOR2, LINE_COLOR, SHADOW_COLOR, RADIUS)
      textDraw(typePos, NODE_TYPE_WIDTH, NODE_TYPE_HEIGHT, this.QKeyType)
    } else { // それ以外→アラートアイコン
      iconDraw(typePos, 'QKeyType')
    }
  }


  // -- ノードの中心の座標取得する関数 --
  getCenterPos () {
    let nodeCenterX = this.nodeX + this.nodeWidth / 2
    let nodeCenterY = this.nodeY + this.nodeHeight / 2
    let nodeCenterPos = { x: nodeCenterX, y: nodeCenterY }
    return nodeCenterPos
  }


  // -- リンクとノードの交点座標導出メソッド(矢印先端位置の同定) --
  findContactPoint (linkStart, linkEnd) {
    // 各辺とリンク(始点：親課題の中心座標，終点：子課題の中心座標)の交点を配列に格納(ない場合はundefined)
    let contactPosPart = []
    contactPosPart.push(contactPos({ x: this.nodeX, y: this.nodeY }, { x: this.nodeX + this.nodeWidth, y: this.nodeY }, linkStart, linkEnd))
    contactPosPart.push(contactPos({ x: this.nodeX, y: this.nodeY + this.nodeHeight },{ x: this.nodeX + this.nodeWidth, y: this.nodeY + this.nodeHeight }, linkStart, linkEnd))
    contactPosPart.push(contactPos({x: this.nodeX + this.nodeWidth, y: this.nodeY}, {x: this.nodeX + this.nodeWidth, y: this.nodeY + this.nodeHeight}, linkStart, linkEnd))
    contactPosPart.push(contactPos({x: this.nodeX, y:this.nodeY}, {x: this.nodeX, y: this.nodeY + this.nodeHeight}, linkStart, linkEnd))

    // 交点があるものを取得
    // (交点は1つなはずなので，2つ以上出たとしても，座標は同じはずなため，undefinedじゃない一番最初の要素を接点として定義)
    let contactPoint = contactPosPart.find((pos) => { return pos !== undefined })
    return contactPoint
  }


  // 課題キーワードのタイトルの更新
  editQuestionKeyword (newTitle) {
    this.title = newTitle;
    browser.runtime.sendMessage({ clicked: this.QuestionKeywordID, title: newTitle })
  }


  // 課題キーワードの削除
  deleteQuestionKeyword (QKeywords, Links) {
    // 変数定義
    const optDelete = {
      text: `${this.title}を削除します．よろしいですか？`,
      buttons: {
        true: 'はい',
        false: 'いいえ'
      }
    }
    let deleteNodeID = this.QuestionKeywordID
    let Keywords = allLoadKeywords()

    // 消すかどうかをプロンプト提示
    if (deleteNodeID > 0) { // 初期課題以外
      swal(optDelete).then((isDelete) => {
        if (JSON.parse(isDelete)) {
          [QKeywords, Links, Keywords] = execDeleteQKeys(QKeywords, Links, Keywords, deleteNodeID)

          // サイドバーのリポジトリを親課題or初期課題
          let currentQKeyId = 0
          if (this.parent) currentQKeyId = this.parent
          browser.runtime.sendMessage({ clicked: currentQKeyId })

          // 課題の再描画
          reDraw(QKeywords, Links, treeViewMode)

          // 変更内容をローカルストレージに保存
          allSaveQKeys(QKeywords)
          allSaveLinks(Links)
          allSaveKeywords(Keywords)
        }
      })
    } else { // 初期課題の場合は消せない
      swal('この課題は消せません！', '', 'warning')
    }
  }
}




// --- treeViewのリンクのクラス ---
class LinkType {
  constructor (LinkID, parentNodeID, childNodeID, AttributeName) {
    this.LinkID = LinkID
    this.parentNodeID = parentNodeID
    this.childNodeID = childNodeID
    this.AttributeName = AttributeName
  }


  // --- リンクの描画 ---
  drawLink (QKeys, startPos, contactPoint, endPos) {
    // 変数定義
    const treeViewTx = treeView.getContext('2d')
    // リンク属性の大きさ
    const LINK_NODE_WIDTH = 100
    const LINK_NODE_HEIGHT = 30
    let linkAttrBoxPos = { x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 }

    // 矢印の描画
    drawBranch(startPos, contactPoint)

    // 影の描画をなしにする
    treeViewTx.shadowBlur = 0
    treeViewTx.shadowOffsetX = 0
    treeViewTx.shadowOffsetY = 0

    // 属性表示部分の設定
    if (this.AttributeName) {
      const RADIUS = 3 // 半径
      // 影の色設定
      const color1 = '#ffffff'
      const color2 = '#ffffff'
      const lineColor = '#ff8c00'
      const shadowColor = '#a2553c'

      linkAttrBoxPos.x -= LINK_NODE_WIDTH / 2
      linkAttrBoxPos.y -= LINK_NODE_HEIGHT / 2

      nodeDraw(linkAttrBoxPos, LINK_NODE_WIDTH, LINK_NODE_HEIGHT, color1, color2, lineColor, shadowColor, RADIUS) // ノードの描画
      textDraw(linkAttrBoxPos, LINK_NODE_WIDTH, LINK_NODE_HEIGHT, this.AttributeName) // 文字の描画

    } else {
      iconDraw(linkAttrBoxPos, 'Attribute')
    }
  }

  drawLinkChangeColor (QKeys, startPos, contactPoint, endPos, color) {
    // 変数定義
    const treeViewTx = treeView.getContext('2d')
    // リンク属性の大きさ
    const LINK_NODE_WIDTH = 100
    const LINK_NODE_HEIGHT = 30
    let linkAttrBoxPos = { x: (startPos.x + endPos.x) / 2, y: (startPos.y + endPos.y) / 2 }

    // 矢印の描画
    drawBranch(startPos, contactPoint)

    // 影の描画をなしにする
    treeViewTx.shadowBlur = 0
    treeViewTx.shadowOffsetX = 0
    treeViewTx.shadowOffsetY = 0

    // 属性表示部分の設定
    if (this.AttributeName) {
      const RADIUS = 3 // 半径
      // 影の色設定
      const color1 = color
      const color2 = color
      const lineColor = '#ff8c00'
      const shadowColor = '#a2553c'

      linkAttrBoxPos.x -= LINK_NODE_WIDTH / 2
      linkAttrBoxPos.y -= LINK_NODE_HEIGHT / 2

      nodeDraw(linkAttrBoxPos, LINK_NODE_WIDTH, LINK_NODE_HEIGHT, color1, color2, lineColor, shadowColor, RADIUS) // ノードの描画
      textDraw(linkAttrBoxPos, LINK_NODE_WIDTH, LINK_NODE_HEIGHT, this.AttributeName) // 文字の描画

    } else {
      iconDraw(linkAttrBoxPos, 'Attribute')
    }
  }
}




// --- リポジトリ内のキーワードのクラス ---
class Keyword {
  constructor (QuestionID, QuestionKeywordID, KeywordID, title, parent, URL) {
    this.QuestionID = parseInt(QuestionID)
    this.QuestionKeywordID = parseInt(QuestionKeywordID)
    this.KeywordID = parseInt(KeywordID)
    this.title = title
    this.parent = parseInt(parent)
    this.URL = URL
    //問題に答えたかどうかのログのため、また正解した時にノードを緑に着色するために用いる
    //this.AnswerJudge = parseInt(AnswerJudge)
  }
}
