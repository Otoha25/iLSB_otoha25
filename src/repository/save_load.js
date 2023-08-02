// --- save_load.js ---
// 学習ログのsaveやloadする関数

// 学習ログをsaveする関数
function save (option = "") {
  let outPutArray = []

  // ローカルストレージのロード
  let currentQuestion = JSON.parse(localStorage.getItem('QStorage'))
  let QuestionKeywords = allLoadQKeys()
  let Keywords = allLoadKeywords()
  let Links = JSON.parse(localStorage.getItem('LinkTypeStorage'))
  
  outPutArray.push(currentQuestion)
  outPutArray.push(QuestionKeywords)
  outPutArray.push(Keywords)
  outPutArray.push(Links)


  // 時間の設定
  let time = new Date()
  currentQuestion.endTime = String(time.getHours()) + ':' + String(time.getMinutes()) + ':' + String(time.getSeconds()) // 終えた時間

  // convert to JSON style
  let parseJSON = JSON.stringify(outPutArray, null, '\t')

  // Blobオブジェクトを作って、JSONファイル作成の下準備
  var blob = new Blob([parseJSON], { type : 'application/json' })

  // 一時的にaタグを作成
  var aTag = document.createElement('a')
  aTag.setAttribute('download', currentQuestion.userName + '\'s_' + currentQuestion.QuestionName + '_' + option + 'scenario.json') // HTML5以上
  aTag.href = URL.createObjectURL(blob)

  // aタグを自動でクリックし，学習ログをJSONファイルとしてダウンロード
  var evt = document.createEvent('MouseEvents')
  evt.initEvent('click', false, true)
  aTag.dispatchEvent(evt)
  allSaveQKeys(QuestionKeywords)
  allSaveKeywords(Keywords)
}



// --- JSONファイルをロードしてローカルストレージにデータを格納 ---
// TODO: 互換性保つために，クラスの属性変えた部分を変更
function load () {
  // 一時的に<input>タグを作成
  var input = document.createElement('input')
  input.setAttribute('type', 'file')

  // <input>タグをクリックJSONファイルのロード
  // JSONファイルを選択した時にimportFile関数を実行
  var evt = document.createEvent('MouseEvents')
  evt.initEvent('click', false, true)
  input.dispatchEvent(evt)
  input.addEventListener('change', importFile, false)
}


// --- ファイルをインポートして機械が扱える形(オブジェクト)にする ---
function importFile (event) {
  var imFile = event.target.files[0]
  var reader = new FileReader()
  reader.onload = setlocalStorage
  reader.readAsText(imFile)
}


// --- ファイル読み込んだ時に発火する関数 ---
function setlocalStorage (event) {
  // 取り入れたJSONを配列として取得
  let inputtedJSON = event.target.result
  let JSONArray

  // 過去のバージョン(配列で格納していない)か，現在のバージョン(配列で格納)か?
  if (inputtedJSON.match(/^\[/))
    JSONArray = JSON.parse(inputtedJSON)
  else
    JSONArray = parseVersion(inputtedJSON)

  console.log(JSONArray);

  // 学習ログをlocalStorageにセットする．
  localStorage.clear() // localStorageのリセット
  localStorage.setItem('QStorage', JSON.stringify(JSONArray[0]))
  localStorage.setItem('QKeyStorage', JSON.stringify(JSONArray[1]))
  if (JSONArray[2]) localStorage.setItem('KeysStorage', JSON.stringify(JSONArray[2]))
  if (JSONArray[3]) localStorage.setItem('LinkTypeStorage', JSON.stringify(JSONArray[3]))

  // リポジトリとtreeViewを更新する
  refreshRepository(JSONArray[1], JSONArray[2], 0)
  updateTab('treeViewTabId', '../treeView/treeView.html')
  document.getElementById('subjectContainer').textContent = JSONArray[1][0].title
}



// --- 過去のバージョンとの互換性保つために変換する関数 ---
function parseVersion (inputtedJSON) {
  let JSONArray = inputtedJSON.split(/,(?=\[)/)
  JSONArray[0] = JSON.parse(JSONArray[0])
  JSONArray[1] = JSON.parse(JSONArray[1])
  JSONArray[2] = JSON.parse(JSONArray[2])
  JSONArray[3] = JSON.parse(JSONArray[3])

  // 学習クラスの消去したクラス属性
  JSONArray[0].QuestionType = undefined
  JSONArray[1].Category = undefined

  // 課題キーワードの配列
  for (let qkey of JSONArray[1]) {
    // 新バージョンで追加したクラス属性
    qkey.nodeWidth = 150
    qkey.nodeHeight = 50

    // 新バージョンで名前等修正したクラス属性
    qkey.KeywordID = qkey.RepositoryID
    qkey.RepositoryID = undefined
    qkey.QKeyType = qkey.attribute
    qkey.attribute = undefined
  }

  // リンクの配列
  for (let link of JSONArray[3]) {
    // 新バージョンで名前等修正したクラス属性
    link.AttributeName = link.LinkTypeName
    link.LinkTypeName = undefined

    // 新バージョンでクラス属性消したもの
    link.LinkTypeID = undefined
  }
  return JSONArray
}
