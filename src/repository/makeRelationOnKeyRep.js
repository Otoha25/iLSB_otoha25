// --- makeRelationOnKeyRep.js ---
// キーワードリポジトリでの関係づけ(包含関係)について

// --- 選択肢た課題キーワードに対するキーワードリポジトリの更新 ---
function refreshRepository (QuestionKeywords, Keywords, QKeyId) {
  // -- キーワードリポジトリ内のキーワード全て削除 --
  let tbody = document.getElementById('KeywordRepository').firstElementChild
  while (tbody.firstElementChild) tbody.removeChild(tbody.firstElementChild)

  // -- 表示されている課題キーワード名を選択した課題キーワードに変更 --
  let QKeyIdx = QuestionKeywords.findIndex((qkey) => { return qkey.QuestionKeywordID === QKeyId })
  let currentQuestionKeyword = QuestionKeywords[QKeyIdx]
  document.getElementById('subjectContainer').textContent = currentQuestionKeyword.title

  // -- 選択している課題キーワードで収集されたキーワードたちを配置 --
  for (let key of Keywords) {
    // 親を持たないキーワードのみ繰り返し(親があるものに関してはcreateInclusionでappend)
    if (key.QuestionKeywordID === QKeyId && (!key.parent && key.parent !== 0)) {
      tbody.appendChild(createInclusion(key, Keywords, []))
    }
  }
  reformInclusion()
  resizeFont()

  //右クリックメニューが表示されたままになっている可能性があるので消去しとく
  closeContext()
}

// --- 包含関係など作る関数(再帰でない場合は親がいない前提) ---
function createInclusion (keyword, Keywords, exist) {
  let children = Keywords.filter((key) => { return key.parent === keyword.KeywordID })
  // exist: 既にappend済みのキーワードのkeywordID格納
  exist.push(keyword.KeywordID)

  if (children.length) { // 子がある→inclusionを作って，そのInclusion全体を返す
    // parentの定義
    //let parent = createTr(keyword, Keywords, false)
    //包含関係における親もドラッグアンドドロップが可能に(2022.10.14), ってかそもそもfalseで今まで使えてたのが不思議
    let parent = createTr(keyword, Keywords, true)
    
    // <div>タグの作成
    // id: "div_?"(?: keywordID), class: dropzone, inclusion
    let div = document.createElement('div')
    div.setAttribute('id', 'div_' + keyword.KeywordID)
    div.classList.add('dropzone', 'inclusion')
    div.appendChild(parent)

    // 子ノードを再起を使ってappend
    for (let child of children) {
      div.appendChild(createInclusion(child, Keywords, exist))
    }
    return div
  } else { // 親がない場合→入力されたキーワードをtrタグで返す
    return createTr(keyword, Keywords, true)
  }
}

var rightClickID = 0 // 右クリックされたキーワードIDを一時的に格納する変数
                     // <menu>タグでは右クリックされたキーワードIDを特定できないのでグローバル変数で定義
// --- <tr>タグを作成する関数 ---
function createTr (key, Keywords, draggable) {
  var tr = document.createElement('tr')
  var td = document.createElement('td')
  var a = document.createElement('a')
  var str = document.createTextNode(key.title)

  // 属性の設定
  // 属性一覧がこれで良いか，属性付与するのがaタグで良いかは要検討
  tr.setAttribute('id', key.KeywordID)
  //td.setAttribute('contextmenu', 'menu')
  td.setAttribute('contextmenu', 'contextmenu')
  a.setAttribute('id', key.KeywordID)
  a.setAttribute('href', 'javascript:void(0)')
  a.setAttribute('draggable', draggable)
  a.setAttribute('ondragstart', 'f_dragstart(event)')
  a.classList.add('keys')
  if (draggable) {
    a.classList.add('dropzone')
  }

  // 右クリックのメニューが表示→とりあえずクリックされたIDをrightClickIDに格納
  a.addEventListener('contextmenu', (event) => { 

    let con = document.getElementById('contextmenu')

    //キーワードのID取得しとく
    rightClickID = Number(event.target.id) 

    //コンテキストメニューが中心に表示されるように調整
    let position = $(window).width()/4

    //表示
    con.style.left = position+"px"
    con.style.top = event.y+"px"
    con.classList.add('show');
  })

  // tr, td, aタグをappend
  tr.appendChild(td)
  td.appendChild(a)
  a.appendChild(str)

  return tr
}

let menu = document.getElementById("contextmenu")
menu.addEventListener("click", (event) => { rightClickOnRep(event, rightClickID) })

//画面上のどこか右クリックしたら右クリックメニューを閉じる
document.body.addEventListener('contextmenu' ,(event)=> {
  event.preventDefault()
  let con = document.getElementById('contextmenu')
  //if(con.classList.contains("show")) con.classList.remove("show")
})

//画面上のどこか左クリックしたら右クリックメニューを閉じる
document.body.addEventListener('click', ()=>{
  closeContext()
})

function closeContext(){
  let con = document.getElementById('contextmenu')
  if(con.classList.contains("show")) con.classList.remove("show")
}

// 右クリックメニューでの各機能の処理
function rightClickOnRep (event, KeyID) {
  let Keywords = allLoadKeywords()
  let KeyIdx = Keywords.findIndex((value) => { return value.KeywordID === KeyID })
  let tmpKey = Keywords[KeyIdx]
  let QuestionKeywords = allLoadQKeys()
  switch (event.target.id) {
    // キーワードを取得したリソースに戻る関数
    case "searchKeyword":
      updateTab('searchViewTabId', Keywords[KeyIdx].URL)
      break

    // キーワードの削除
    case "deleteKeyword":
      let keyParent = Keywords[KeyIdx].parent
      for (let key of Keywords) {
        if (key.parent === KeyID) {
          key.parent = keyParent
        }
      }
      Keywords.splice(KeyIdx, 1)
      refreshRepository(QuestionKeywords, Keywords, tmpKey.QuestionKeywordID)
      allSaveKeywords(Keywords)
      break

    // キーワード名の変更
    case 'changeKeyword':
      const optKeyChange = {
        text: '変更するキーワードを入力',
        content: {
          element: 'input',
          attributes: {
            value: Keywords[KeyIdx].title
          }
        }
      }
      swal(optKeyChange).then((newKeyName) => {
        Keywords = changeKey(newKeyName, Keywords[KeyIdx], Keywords)
        refreshRepository(QuestionKeywords, Keywords, tmpKey.QuestionKeywordID)
        allSaveKeywords(Keywords)
      })
      break
    default:
      break
  }
}

// --- キーワード名を変更する関数 ---
function changeKey (keyName, keyword, Keywords) {
  if (keyName) {
    let changeKeyIndex = Keywords.findIndex((key) => { return key.KeywordID === keyword.KeywordID })
    if (keyName) Keywords[changeKeyIndex].title = keyName
  } else {
    console.log('There is no new keyword name.')
  }
  return Keywords
}
