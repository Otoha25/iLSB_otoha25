import { confirm, promptForcely } from "../lib/dialog";
import { hasLearningData } from "../lib/store";
import { displayRepositoryContent } from "./view";

async function onWindowLoad() {
	const isContinued =
		hasLearningData() && (await confirm("前回の続きから始めますか？"));

	// if (isContinued) {
	//     const currentQuekeyId = getCurrentQuekeyId();
	//     const currentQuekey = getQuekeyById(currentQuekeyId);
	//     const segkeysAsTree = getSegkeysAsTree(currentQuekeyId);
	//     displayRepositoryContent(currentQuekeyId, segkeysAsTree);
	// } else {
	//     const rootQueKeyTitle = await promptForcely("学習する課題を入力");
	//     const username = await promptForcely("自分の名前を入力");

	//     setUsername(username);
	//     const rootQueKey = createQueKey(rootQueKeyTitle);
	//     const rootQueKeyId = rootQueKey.id;
	//     setRootQueKeyId(rootQueKeyId);
	// }
}

function onTreeTabOpenRequest() {}

function onExportRequest() {}

function onImportRequest() {}

function onMessageReceive() {}

function onKeywordDragStart() {}

function onKeywordDrop() {}

window.addEventListener("load", onWindowLoad);
// window.
