import { getMetaData } from "./local-storage";

export function hasLearningData() {
	const metaData = getMetaData();
	return metaData != null;
}

export function createLearningData() {
	const 
}

export function clearStorage() {
	localStorage.clear();
}

// export function putCurrentQK () {

// }
