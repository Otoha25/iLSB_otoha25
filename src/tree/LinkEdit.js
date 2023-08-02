// --- LinkEdit.js ---
// treeViewでのリンク編集関連

let mouseStartX, mouseStartY
// --- リンク接続編集関係 ---
// 入力：QKeywords:課題キーワード配列，Links:リンク配列，
//      mDownNode:マウスを下ろした時のノードのQKeyID，mUpNode:マウスをあげた時のノードのQKeyID
function editBranchFunc (QKeywords, Links, mDownNodeIdx, mUpNodeIdx) {
// リンクの接続元ノードと接続先ノードが違うとき→リンク接続
  if ((mUpNodeIdx >= 0 && mDownNodeIdx >= 0) && (mUpNodeIdx !== mDownNodeIdx)) {
    // 親指定済→削除
    if (QKeywords[mUpNodeIdx].parent === QKeywords[mDownNodeIdx].QuestionKeywordID) {
      QKeywords[mUpNodeIdx].parent = null // 親の参照解除
      Links = deleteLink(Links, QKeywords[mUpNodeIdx].QuestionKeywordID) // リンクを消去
    } else if (QKeywords[mDownNodeIdx].parent === QKeywords[mUpNodeIdx].QuestionKeywordID) {
      QKeywords[mDownNodeIdx].parent = null // 親の参照解除
      Links = deleteLink(Links, QKeywords[mDownNodeIdx].QuestionKeywordID) // リンクを消去
    // 親未指定→リンク接続
    } else {
      [QKeywords, Links] = connectLink(QKeywords, Links, mDownNodeIdx, mUpNodeIdx)
    }
  }
  return [QKeywords, Links]
}



// --- リンクを接続する関数 ---
function connectLink (QKeywords, Links, mDownNodeIdx, mUpNodeIdx) {
  // 変数定義
  let Keywords = allLoadKeywords()
  let mDownNodeID = QKeywords[mDownNodeIdx].QuestionKeywordID
  let mUpNodeID = QKeywords[mUpNodeIdx].QuestionKeywordID

  // 親課題キーワードが展開元課題である場合のみ実行，でないときはアラート
  const isParent = checkParentNodeRep(QKeywords, QKeywords[mDownNodeIdx], QKeywords[mUpNodeIdx], Keywords)
  if (isParent) {
    // 次のリンクのLinkIDの設定
    let nextLinkID
    if (Links.length === 0) nextLinkID = 0
    else nextLinkID = Links[Links.length - 1].LinkID + 1

    // リンクの追加
    let link = new LinkType(nextLinkID, mDownNodeID, mUpNodeID, undefined)
    Links.push(link)

    // QKeywordの親の参照を追加
    QKeywords[mUpNodeIdx].parent = mDownNodeID
  } else {
    swal('展開元が誤っています！', 'キーワードを取り出したリポジトリの課題を展開元としてください．', 'warning')
  }
  return [QKeywords, Links]
}



// --- 親課題キーワードのリポジトリ内に子課題キーワードのキーワードがあるかどうかをtrue/falseで返す関数 ---
function checkParentNodeRep (QKeys, parent, child, Keys) {
  // 課題キーワードであるchildの展開元のキーワードIDを探す
  let KeywordChild = Keys.find((value) => { return value.KeywordID === child.KeywordID })

  // childの展開元のキーワードがparentのリポジトリ内にあるか？
  // リポジトリ内にあるかどうかはQuestionKeywordのマッチングで判断
  if (KeywordChild) {
    return KeywordChild.QuestionKeywordID === parent.QuestionKeywordID
  } else {
    return false
  }
}



// リンクの削除
// 入力：Links: リンク配列，deleteIdx: 課題キーワード配列の削除した課題キーワードのインデックス
function deleteLink (Links, deleteIdx) {
  let deleteLinkIdx = Links.findIndex((link) => { return link.childNodeID === deleteIdx})
  Links.splice(deleteLinkIdx, 1)
  /*for (let link of Links){
    if(link.LinkID > deleteLinkIdx){
      link.LinkID--;
    }
  }*/
  return Links
}
