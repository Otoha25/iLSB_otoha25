// --- operatingWebPages.js ---
// Webページ内での操作に関する処理(WebExtensionsを使用)

// Webブラウザ(Webページ)で右クリックした時にメニューを出力
browser.menus.create({
  id: 'add-keyword',
  title: 'キーワードを追加する',
  contexts: ['selection']
})

// Webページで右クリックした時の処理
function rightClickOnWebPage (info, tab) {
  switch (info.menuItemId) { // 右クリックメニューで項目何か追加したい場合はここ
    // Webページからキーワードを追加する処理
    case 'add-keyword':
      let Keywords = allLoadKeywords()
      let QuestionKeywords = allLoadQKeys()
      addKeyfromWebPage(Keywords, QuestionKeywords, info.selectionText, info.pageUrl)
      allSaveKeywords(Keywords)
      // selectedを初期化
      selected = undefined
  }
}
browser.menus.onClicked.addListener((info, tab) => { rightClickOnWebPage(info, tab) })

// Webページからキーワードを追加する関数
function addKeyfromWebPage (Keywords, QuestionKeywords, keywordTitle, URL) {
  // 変数定義
  let nextKeyID = 0
  let currentQuestion = JSON.parse(localStorage.getItem('currentQKey'))
  let currentQKeyId = currentQuestion.QuestionKeywordID

  // キーワード配列に格納される次のキーワードIDを計算
  if (Keywords.length !== 0)
    nextKeyID = Keywords[Keywords.length - 1].KeywordID + 1

  // 抽出されたキーワードをキーワード配列に格納
  let keyword = new Keyword(currentQuestion.QuestionID, currentQKeyId, nextKeyID, keywordTitle, undefined, URL)
  Keywords.push(keyword)
  refreshRepository(QuestionKeywords, Keywords, currentQKeyId)
  return keyword
}
