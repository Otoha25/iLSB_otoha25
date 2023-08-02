// --- attribution.js ---
// 属性一覧や課題タイプ一覧を表示する時のプロセス

const ATTR_CLASS = ['時間関係', '因果関係', '論理関係', '階層関係', '全体部分関係', '比較関係'] // 属性の種類
const ATTR_INIT = ['起源', '原因', '背景', '影響', '作用', '対策', 'その他', '原理', 'クラス', 'インスタンス', '構成要素', '構造', '特徴', '類似概念', '対比概念'] // 属性の初期値
const ATTR_LIST = [['起源'], // 属性タイプの種類に対応した全属性一覧
						   		 ['原因', '背景', '影響', '作用', '対策', 'その他'],
						 	 	   ['原理'],
						 	 	   ['クラス', 'インスタンス'],
 					 	 	 	   ['構成要素', '構造', '特徴'],
								   ['類似概念', '対比概念']]

const TYPE_CLASS = ['事柄', '時', '人間性', '自然', '社会活動', '人造物・技術'] // 課題タイプの種類
const TYPE_INIT = ['事柄', '現象', '事件', '事故', '行事', '時', '年代', '期間', '季節', '肉体', // 課題タイプ(初期値)
								   '生理', '病気', '人物', '能力', '感情', '自然', '天文', '天候', '地域', '生物',
								   '物質', '社会活動', '命', '人間関係', '社会階層', '組織', '産業', '職業',
								   '生活', '娯楽', '行動', '人造物', '宗教', '学問', '制度', '文明・文化']
const TYPE_LIST = [['事柄', '現象', '事件', '事故', '行事'], // 課題タイプの種類に対応した課題タイプ一覧
								   ['時', '年代', '期間', '季節'],
								   ['肉体', '生理', '病気', '人物', '能力', '感情'],
							     ['自然', '天文', '天候', '地域', '生物', '物質'],
								   ['社会活動', '命', '人間関係', '社会階層', '組織', '産業', '職業', '生活', '娯楽', '行動'],
								   ['人造物', '宗教', '学問', '制度', '文明・文化']]
let attrTypeRel

// 課題タイプと属性の対応関係をファイルからインポート
$.getJSON('../../lib/attributeType.json', (data) => { attrTypeRel = data })

// --- popUpMenu.jsからメッセージ受信時の処理 ---
// (現状は属性/課題タイプ一覧を開いた時の処理のみ)
function handleMessage (request,  sender,  sendResponse) {
  // --- 変数代入 ---
  let QuestionKeywords = allLoadQKeys()
  let Links = allLoadLinks()
  let clickedNodeId = request.clickedNodeID
  let attrList // 選択した課題の課題タイプに対する属性値一覧

  switch (Object.keys(request)[0]) {
    // 属性の表示
    case 'attr':
      console.log('AttributeList')
      // クリックしたリンクのID取得
      let link = Links.find((value) => { return value.LinkID === clickedNodeId })

      // 課題タイプに合致する属性の一覧取得
      if (link.parentNodeID >= 0) {
        let QKeyIdx = QuestionKeywords.findIndex((value) => { return value.QuestionKeywordID === link.parentNodeID })
        let type = QuestionKeywords[QKeyIdx].QKeyType

        if (type) {
          console.log('課題タイプ:' + type)
          attrList = attrTypeRel.find((value) => { return value[type] })[type]
        } else { // 課題タイプが設定されてないときは全属性を表示
          attrList = ATTR_INIT
        }
      }
      // 属性一覧表作成
      tableReset()
      textReset()
      tableReflection(ATTR_CLASS, attrList, ATTR_LIST)
			document.addEventListener('click', function test (event) {
				clickTbody(event, clickedNodeId, attrList);
				if (event.target.className === 'value') {
					this.removeEventListener('click', test);
				}
			})
      break

    // 課題タイプ一覧表示の時
    case 'type':
      console.log('QuestionTypeList')
      tableReset() // テーブルをリセット
      textReset()
      tableReflection(TYPE_CLASS, TYPE_INIT, TYPE_LIST) // テーブルを作成(反映)
      document.addEventListener('click', function test (event) {
				clickTbody(event, clickedNodeId, attrList);
				this.removeEventListener('click', test);
			})
      break

    // Webページ推薦モードの時
    case 'recommend':
      console.log('recommendPages')
      console.log(request)
      tableReset()
      textDraw(request.key)
      //textDraw(sendKey(request.key, "地球温暖化"))
      
      break
  }
}
browser.runtime.onMessage.addListener(handleMessage)


// -- 属性/課題タイプ一覧のどれかクリックした時の関数 --
function clickTbody (event, clickedNodeId, attrList) {
  if (event.target.className === 'value') { // 一覧のどれかの値をクリックした時のみ起動
    console.log('click')
    // 課題タイプ/属性をローカルストレージに反映
    if (TYPE_INIT.some((value) => { return value === event.target.firstChild.data })) { // 課題タイプの時の処理
      reflectType(event.target.firstChild.data, clickedNodeId)
    } else if (attrList.some((value) => { return value === event.target.firstChild.data })) { // 属性タイプの時の処理
      reflectAttr(event.target.firstChild.data, clickedNodeId)
    }
    window.parent.unVisible() // タイプ選択画面を非表示にする
  }
}




// --- 属性をテーブルに反映させる関数 ---
function tableReflection (keys, attrList, relations) {
  let thWidth = window.innerWidth / keys.length // セルの横の長さ
  let thead = document.getElementById('head')

  // テーブルのhead部分作成
  for (let key of keys) {
    let th = document.createElement('th')
    let str = document.createTextNode(key)
    th.appendChild(str)
    th.width = thWidth
    thead.appendChild(th)
  }
  setValue(attrList, relations) // 属性をテーブルにセット
}



// --- テーブルのbody部分(属性一覧)をセットする関数 ---
function setValue (attrList, relations) {
  let maxLen = 0 // relationsの最大長格納変数
  let tbody = document.getElementById('relations')
  for (let rel of relations) {
    if (rel.length > maxLen) maxLen = rel.length // relations(多次元配列)はインデックスによって長さ変わるので，最大長格納
  }
  let matrix = JSON.parse(JSON.stringify(new Array(maxLen).fill((new Array(relations.length)).fill(null)))) // 6*6のnull行列作成(属性格納用)
  let tmpMatrix = JSON.parse(JSON.stringify(new Array(maxLen).fill((new Array(relations.length)).fill(null)))) // 6*6のnull行列作成(一時的な属性格納用)


  // 属性一覧を課題タイプ別に分けて配列に格納(転置前)
  for (let relIdx in relations) {
    for (let atrIdx in relations[relIdx]) {
      tmpMatrix[relIdx][atrIdx] = attrList.find(key => key === relations[relIdx][atrIdx]) // 属性全体から親課題の課題タイプにおける属性一覧にあるものを行列表現
    }
    tmpMatrix[relIdx] = tmpMatrix[relIdx].filter(v => v) // 配列null, undefinedがあるものの前詰め
  }

  // tmpMatrixを転置してmatrixに格納
  for (let relIdx in matrix) {
    for (let atrIdx in matrix[relIdx]) {
      matrix[atrIdx][relIdx] = tmpMatrix[relIdx][atrIdx]
    }
  }

  // iframeに配置
  for (let matIdx in matrix) {
    let tr = createTr4atr(matrix[matIdx])
    tbody.appendChild(tr)
  }
}



// --- trタグ作成(属性提示用) ---
function createTr4atr (attrs) {
  let tr = document.createElement('tr')
  for (let attr of attrs) {
    let td = document.createElement('td')
    if (attr) {
      let a = document.createElement('a')
      a.classList.add('value')
      let str = document.createTextNode(attr)
      a.appendChild(str)
      td.appendChild(a)
    }
    tr.appendChild(td)
  }
  return tr
}



// --- テーブルをリセットする関数 ---
function tableReset () {
  let tbody = document.getElementById('relations')
  let thead = document.getElementById('head')
  // テーブルヘッダー削除(表に要素があった時のみ)
  if (thead.childNodes.length !== 0) {
    for (let i = 0; thead.childNodes.length; i++) {
      thead.removeChild(thead.firstChild)
    }
  }
  // テーブル要素削除
  if (tbody.childNodes.length !== 0) {
    for (let i = 0; tbody.childNodes.length; i++) {
      tbody.removeChild(tbody.firstChild)
    }
  }
}



// --- 課題タイプをlocalStorageに反映する処理 ---
function reflectType (Qtype, clickId) {
  let QuestionKeywords = allLoadQKeys()
  let qkey = QuestionKeywords.find((value) => { return value.QuestionKeywordID === clickId })
  qkey.QKeyType = Qtype
  allSaveQKeys(QuestionKeywords)
}



// --- 属性をlocalStorageに反映する時の処理 ---
function reflectAttr (AttributeName, clickId) {
  let Links = allLoadLinks()
  let link = Links.find((value) => { return value.LinkID === clickId })
  link.AttributeName = AttributeName
  allSaveLinks(Links)
}

function textDraw(text){
  document.getElementById('text').innerHTML = text
}

function textReset(){
  document.getElementById('text').innerHTML = ""
}