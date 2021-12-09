import { syllable } from './syllable.service';
const sentenceWeight = 0.39;
const wordWeight = 11.8;
const adjustment = 15.59;

class ReadabilityService {
	public getReadabilityScore(content: string): any {
		return fleschKincaid(content);
	}
}
export function fleschKincaid(content): any {
	try {
		const counts = {
			word: wordCounter(content),
			syllable: syllable(content),
			sentence: sentenceCounter(encodeURI(content))
		};
		console.log(counts);
		if (!counts || !counts.sentence || !counts.word || !counts.syllable) {
			return Number.NaN;
		}
		//
		const data = {
			fleschKincaid_score: Math.round(
				206.835 -
					1.015 * (counts.word / counts.sentence) -
					84.6 * (counts.syllable / counts.word)
			),
			fleschKincaid_grade: Math.round(
				sentenceWeight * (counts.word / counts.sentence) +
					wordWeight * (counts.syllable / counts.word) -
					adjustment
			),
			syllable_count: counts.syllable,
			sentence_count: counts.sentence
		};
		return data;
	} catch (ex) {
		console.log(ex);
		return {
			fleschKincaid_score: null,
			fleschKincaid_grade: null,
			syllable_count: null,
			sentence_count: null
		};
	}
}
function sentenceCounter(content: string): number {
	const count = removeEmptyElements(removeBreaks(content.split('.'))).length;
	return count || 0;
}

function syllableCounter(content: string): number {
	const arr = removeEmptyElements(removeBreaks(content.split(' ')));
	let count = 0;
	for (const i of arr) {
		if (i) {
			count += syllable_count(i.normalize('NFC'));
		}
	}
	return count;
}

export function wordCounter(content: string): number {
	return content.match(/[\w\d\’\'-]+/gi).length;
}
function removeEmptyElements(arr) {
	const index = arr.findIndex(el => el.trim() === '');
	if (index === -1) return arr;
	arr.splice(index, 1);
	return removeEmptyElements(arr);
}
function removeBreaks(arr) {
	const index = arr.findIndex(el => el.match(/\r?\n|\r/g));

	if (index === -1) return arr;

	const newArray = [
		...arr.slice(0, index),
		...arr[index].split(/\r?\n|\r/),
		...arr.slice(index + 1, arr.length)
	];

	return removeBreaks(newArray);
}
function syllable_count(word) {
	word = word.toLowerCase();
	if (word.length <= 3) {
		return 1;
	}
	word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
	word = word.replace(/^y/, '');
	if (word.match(/[aeiouy]{1,2}/g)) {
		return word.match(/[aeiouy]{1,2}/g).length;
	}
	return 0;
}
export default ReadabilityService;