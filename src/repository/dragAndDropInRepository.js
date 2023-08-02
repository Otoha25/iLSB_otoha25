//  --- dragAndDropInRepository.js---
// リポジトリ内におけるドラッグ&ドロップに関するリポジトリ
let draggedItem // ドラッグしている要素を格納するためのグロバール関数

// --- キーワードリポジトリ内でドラッグがスタートした時の処理 ---
function dragstartEvent (event) {
  console.log('dragstart')
  draggedItem = event.target
  selected = undefined // ページ内でハイライトした後にリポジトリ内でドラッグ&ドロップした時にバグらないための対処
  event.target.style.opacity = 0.5
}
document.addEventListener('dragstart', dragstartEvent)


// --- ドロップされた時に発生 ---
function dropEvent (event, draggedItem) {
  console.log('drop')
  event.preventDefault()//ドロップ処理を一旦なかったことにする
  let Keywords = allLoadKeywords()
  let QuestionKeywords = allLoadQKeys()
  if (selected) { // 学習者がリポジトリに学んだキーワードを追加する処理
    // (変数selected，urlはkeywordRepository.js内のhandleMessage関数でWebページ等から抽出される)
    let keyword = addKeyfromWebPage(Keywords, QuestionKeywords, selected, url) // operatingWebPages.jsで定義
    makeRelationship(Keywords, QuestionKeywords, event.target, keyword.KeywordID)
  } else if (draggedItem) { // 学習者がリポジトリで関係付けしている時の処理
    makeRelationship(Keywords, QuestionKeywords, event.target, draggedItem.id)
  }
  allSaveKeywords(Keywords)
  draggedItem = undefined
  resizeWindow() // KeywordRepository.jsで定義

  return draggedItem
}
document.addEventListener('drop', (event) => { console.log(event); draggedItem = dropEvent(event, draggedItem) })

// --- リポジトリ内の親子関係をクラスとして設定する関数 ---
function makeRelationship (Keywords, QuestionKeywords, droppedItem, droppingKeyID) {
  // 変数宣言
  let droppingKeyIdx = Keywords.findIndex((key) => { return key.KeywordID === Number(droppingKeyID) })
  let tmpParent = Keywords[droppingKeyIdx].parent
  let currentQKeyID = JSON.parse(localStorage.getItem('currentQKey')).QuestionKeywordID

  // 親がないキーワードに対してドロップした時
  if (droppedItem.classList.contains('keys')) {
    Keywords[droppingKeyIdx].parent = Number(droppedItem.id)
    //キーワードが消えてしまわないようにエラー対処
    if(Keywords[droppingKeyIdx].parent == Keywords[droppingKeyIdx].KeywordID){
      Keywords[droppingKeyIdx].parent = null
    }
  // 包含関係内にドロップした時の処理
  } else if (droppedItem.classList.contains('inclusion')) {
    let droppedItemID = Number(droppedItem.id.replace('div_', ''))
    let droppedKeyIdx = Keywords.findIndex((key) => { return key.KeywordID === Number(droppedItemID) })
    Keywords[droppingKeyIdx].parent = droppedItemID
    if (checkLoop(Keywords, droppedItemID, [])) { // ループ構造のチェック
      Keywords[droppedKeyIdx].parent = tmpParent
    }
  } else {
    Keywords[droppingKeyIdx].parent = null
  }
  refreshRepository(QuestionKeywords, Keywords, currentQKeyID)
}


// --- 親子構造がループ構造になってないか確認する関数 ---
// ループ→true, ループでない→false
function checkLoop (Keywords, keyID, exists) {
  let keyIdx = Keywords.findIndex((value) => { return value.KeywordID === keyID })
  if (keyIdx !== -1) { // キーワード格納配列に該当キーワードある時のみ探す
    if (Object.keys(Keywords[keyIdx]).indexOf('parent')) {
      const parent = Keywords[keyIdx].parent
      exists.push(keyID)
      if (parent || parent === 0) {
        if (exists.indexOf(parent) === -1) { // 親がいれば再起してその親もチェック
          return checkLoop(Keywords, parent, exists)
        } else { // keyIDが既に親IDとしてexistsに格納済み→それはループ
          return true
        }
      } else { // 親が存在してなければ失敗
        return false
      }
    } else { // 'parent'のキーがなければ失敗
      return false
    }
  } else { // キーワード配列にkeyIDがなければ失敗
    return false
  }
}

document.addEventListener('dragover', dragoverEvent, false)
function dragoverEvent(event) {
  // ドロップを許可するためのデフォルトの保護
  event.preventDefault()
}
