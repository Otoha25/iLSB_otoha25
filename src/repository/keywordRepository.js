//  --- keywordRepository.js---
// 関係づけ以外の関数やイベントを定義

// キーワードリポジトリで用いるグローバル変数を定義
let clickedKeyword = 0 // treeViewでクリックしているキーワードのid
let selected
let url
let offset = [0, 0]
function disp(url){

	Win_kotei = window.open(url, "window_name", "width=300,height=200,scrollbars=yes");
  Win_kotei.focus()

}
// --- iLSB起動時の処理 ---
function loadRepository (event) {
  localStorage.removeItem('ProblemInformation')
  const optContinue = {
    text: '前回の続きから始めますか？',
    buttons: {
      'begin': '初めから',
      'continue': '続きから'
    }
  }
  // 以前学習者がiLSBで調べ学習をした場合に，学習開始前に前回の続きから行うかどうかを聞く
  if (localStorage.getItem('QStorage')) {
    swal(optContinue).then((isContinue) => { checkContinue(optContinue, isContinue) })
  } else {
    alertInit()
  }
}
window.addEventListener('load', loadRepository)

// --- 前回のログがあった場合，そのログを使って続きからやるかどうか？ ---
function checkContinue (optContinue, isContinue) {
  switch (isContinue) {
    // -- 「続きから」を選択した場合 --
    case 'continue':
      let currentQuestion = JSON.parse(localStorage.getItem('QStorage'))
      let QuestionKeywords = allLoadQKeys()
      let Keywords = allLoadKeywords()
      updateTab('treeViewTabId', '../treeView/treeView.html')
      updateTab('searchViewTabId', 'https://google.com/search?q=' + currentQuestion.QuestionName)
      refreshRepository(QuestionKeywords, Keywords, 0) // 初期課題のリポジトリを表示
      break
      // -- 「はじめから」を選択した場合 --
    case 'begin':
      alertInit()
      break
    // -- 他のエリアをクリックした場合 --
    default:
      swal(optContinue).then(checkContinue)
      break
  }
}

// --- はじめからを選択した場合→学習者の名前の入力と初期課題キーワード名の入力 ---
function alertInit () {
  const optQuestion = {
    text: '学習する課題を入力',
    content: 'input'
  }
  const optName = {
    text: '自分の名前を入力',
    content: 'input'
  }

  localStorage.clear()
  swal(optQuestion).then((QName) => {
    if (QName) askName(optName, QName)
    else alertInit()
  })

  function askName (optName, QName) {
    swal(optName).then((Name) => {
      if (Name) initSetData(QName, Name)
      else askName(optName, QName)
    })
  }

  // --- 調べ学習の初期データ(日付，課題設定等)を設定したあと，調べ学習を開始 ---
  function initSetData (QName, learnername) {
    const time = new Date()
    let date = String(time.getYear() + 1900) + '/' + String(time.getMonth()) + '/' + String(time.getDate())
    let startTime = String(time.getHours()) + ':' + String(time.getMinutes()) + ':' + String(time.getSeconds())

    // 初期課題と課題キーワードのデータを格納
    let currentQuestion = new Question(9999, QName, learnername, date, startTime, null)
    let currentQuestionKeyword = new QuestionKeyword(9999, 0, null, QName, null, undefined, 150, 50)
    let QuestionKeywords = new Array(currentQuestionKeyword)
    localStorage.setItem('QStorage', JSON.stringify(currentQuestion))
    allSaveQKeys(QuestionKeywords)
    localStorage.setItem('currentQKey', JSON.stringify(currentQuestionKeyword))
    document.getElementById('subjectContainer').textContent = currentQuestionKeyword.title

    // create treeView/searchView Tab
    // treeViewタブや検索窓のタブを作成
    updateTab('treeViewTabId', '../treeView/treeView.html')
    updateTab('searchViewTabId', 'https://google.com/search?q=' + currentQuestionKeyword.title)
  }
}

// リポジトリのボタンを押した時の処理
// save関数やload関数はsave_load.jsで定義
function buttonClick (event) {
  switch (event.target.id) {
    case 'showTreeViewButton':
      updateTab('treeViewTabId', '../treeView/treeView.html')
      break
    /*case 'ProblemGenerateButton':
      save_b();
      break*/
    case 'saveDataButton':
      save()
      break
    case 'loadDataButton':
      load()
      break
    default:
      break
  }
}
const buttons = document.getElementById("buttons")
buttons.addEventListener("click", buttonClick)

// --- サイドバーの横幅取得してCSSに反映させる ---
// この中で用いている関数全てdragAndDropInRepository.jsで定義
function resizeWindow () {
  reformInclusion()
  resizeFont()
}
window.addEventListener('resize', resizeWindow)


// --- サイドバーの横幅に応じてえキーワードの横幅を変更 ---
function reformInclusion () {
  let divs = document.getElementsByTagName('DIV')
  // 一個一個のdivタグに対してwidth指定
  for (let div of divs) {
    let trs = div.childNodes
    let width = parseInt((div.currentStyle || document.defaultView.getComputedStyle(div, '')).width)
    for (let tr of trs) {
      // 余白は1，本体は8の割合で
      if (tr.nodeName === 'TR') {
        tr.firstElementChild.style.width = width * 0.8 + 'px'
        tr.style.right = -width * 0.1 + 'px'
      }
    }
  }
}

// --- fontSizeの調整 ---
function resizeFont () {
  var As = document.getElementsByTagName('A')
  for (var a of As) {
    var width = parseInt((a.currentStyle || document.defaultView.getComputedStyle(a, '')).width)
    var height = parseInt((a.currentStyle || document.defaultView.getComputedStyle(a, '')).height)
    var fontsize = parseFloat(width - 6) / a.innerHTML.length
    if (fontsize > height - 5) fontsize = height - 5
    a.style.fontSize = fontsize + 'px'
  }
}


// treeViewやcontent-scriptから通知がきたメッセージ
function handleMessage (request, sender, sendResponse) {
  console.log(request);
  let QuestionKeywords = allLoadQKeys()
  switch (Object.keys(request)[0]) {
    // 学習者がWebページをハイライトしたときの処理(content-script.jsからのメッセージ)
    case 'selection':
      selected = request.selection
      url = sender.url
      break

    // treeViewでノードをクリックした時の処理 (treeView.jsからのメッセージ)
    case 'clicked':
      // 有効な課題キーワードIDだった時，リポジトリの内容をクリックしている課題に対応
      if (request.clicked >= 0) {
        let Keywords = allLoadKeywords()
        let currentQKey = QuestionKeywords.find((qkey) => { return qkey.QuestionKeywordID === request.clicked })
        localStorage.setItem('currentQKey', JSON.stringify(currentQKey))
        refreshRepository(QuestionKeywords, Keywords, currentQKey.QuestionKeywordID)
      }
      break

    case 'finish':
      save()
      location.reload()
      break
  }
}
browser.runtime.onMessage.addListener(handleMessage)
