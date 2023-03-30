
// predefined lists
const defaultStopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','that\'ll','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','th','nd','can','will','just','don','should','now','d','ll','m','o','re','ve','y','ain','aren','couldn','didn','doesn','hadn','hasn','haven','isn','ma','mightn','mustn','needn','shan','shouldn','wasn','weren','won','wouldn','www','com','also'];
const defaultAbbreviations = ['abr','apr','aug','ave','cir','ct','dec','dr','ed','etc','et al','feb','gen','inc','jan','jr','jul','jun','ln','mar','mr','mrs','nov','oct','pp','prof','rep','rd','rev','sen','sep','sr','st','vol','vs'];


// Class probeSentenceDocument which is a constructor function that creates an object for each sentence 
// in the text. It takes in original sentence text, words, vocabulary, score and sortOrder properties and 
// assigns them to the object.

class probeSentenceDocument {
	constructor(original, words, vocabulary, score, sortOrder) {
		this.original = original
		this.words = words
		this.vocabulary = vocabulary
		this.score = score
		this.sortOrder = sortOrder
	}
}


// Class probeSentencesDocumentProcessor that is used for natural language processing tasks. 
// It takes in a text, a topPercent value (default is 0.1), a list of stopwords (predefined list), 
// and a list of abbreviations (predefined list). 
// The class has a constructor function that sets the text, stopwords, abbreviations,
// and other properties of the class.

// It also initializes probeNLP with the stopwords and 
// creates regular expression patterns for sentence and word terminators. It then uses these regular expressions 
// to split the text into sentences and words, and lowercases all the words.

// The class also includes a method which processes the text and 
// returns an array of probeSentenceDocument objects. This method takes in a text and tokenizes 
// it into sentences and words, removes stop words and abbreviations, and then uses a scoring system 
// to determine the importance of each sentence.


class probeSentencesDocumentProcessor {
	constructor(text, topPercent=0.1, stopwords=defaultStopwords, abbreviations=defaultAbbreviations) {
		this.text = text
		this.stopwords = stopwords
		this.abbreviations = abbreviations
		this.documents = []
		this.topics = []
		this.topPercent = topPercent
		this.nlp = new probeNLP(this.stopwords)
		this.terminators = {
			sentence: new RegExp('(?:[\\!\\?\\r\\n]+[\"\']?)|(?:(?<!\\b(?:' + this.abbreviations.join('|') + '|[a-z]))\\.+(?![\\w\\.\\!\\?])[\"\']?)', 'gi'),
			word: new RegExp('(?:^\\[.*\\])|(?:[^a-z\\.\\s]+)|(?:(?<!\\b[a-z])\\.)|(?:(?<!\\b[a-z]\\.)\\s)|(?:\\s(?![a-z]\\.))', 'gi'),
		}
		const docs = text
			.replace('."', '".')
			.replace('.\'', '\'.')
			.replace('?"', '"?')
			.replace('?\'', '\'?')
			.replace('!"', '"!')
			.replace('!\'', '\'!')
			.split(this.terminators.sentence)
			.map(s => s && s.trim())
			.filter(n => n)
		const lists = docs.map(d => d.toLowerCase().split(this.terminators.word).map(w => w && w.trim()).filter(w => w))
		this.topics = this.nlp.toTopics(lists, 4, true)

		//  Creating a new array of 'bags' by mapping over the 'lists' array and applying the 'toBagOfWords' 
		// method from the probeNLP class to each element of the array. 
		// The method returns a bag of words representation of the input text, which is a list of all the unique 
		// words in the text, and the number of times each word appears in the text.

		// It then creates a new array called 'scores' by calling the 'find_similarity_scores' method on the 
		// probeNLP class and passing in the 'bags' array and a boolean value. 
		// This method is used to calculate the similarity between the different bags of words

		// Finally, it creates a new array called 'documents' by mapping over the 'docs' array and 
		// creating a new probeSentenceDocument object for each element in the array. It passes in the 
		// original sentence text, the corresponding element in the 'lists' and 'bags' arrays, the 
		// corresponding element in the 'scores' array, and the current index of the iteration as the 
		// 'sortOrder' value.

		const bags = lists.map(s => this.nlp.toBagOfWords(s, true))
		const scores = this.nlp.find_similarity_scores(false, ...bags)
		this.documents = docs.map((s, i) => new probeSentenceDocument(s, lists[i], bags[i], scores[i], i))
	}


	// The 'getTopKValue' method calculates the value of 'k' which is the number of top-scoring documents 
	// or topics that should be returned. It does this by multiplying the 'topPercent' property of the class by the length of the 'documents' array and rounding up to the nearest integer.


	getTopKValue() {
		return Math.ceil(this.topPercent * this.documents.length)
	}

	// The 'getTopKDocuments' method returns the top k documents by first filtering out any documents with a score 
	// less than 0, then sorting the remaining documents by score in descending order, and then slicing the 
	// array to get the top k documents, and finally sorting the documents by their sortOrder property.

	getTopKDocuments() {
		return this.documents
			.filter(d => d.score > 0)
			.sort((a,b) => b.score-a.score)
			.slice(0, this.getTopKValue())
			.sort((a,b) => a.sortOrder-b.sortOrder)
	}

	// The 'getTopKTopics' method returns the top k topics by first calculating the value of k, then a 
	// topic2K value which is equal to 2 * topPercent * topics.size, 
	// then creating an array of the topics and their counts from the topics property, then counting the number of 
	// topics that have a count greater than k and storing it in mainTopicCount. 
	// Then it sorts the topics array by the score of each topic in descending order, slices the array to get 
	// the top k or topic2K or mainTopicCount topics, whichever is greater.

	getTopKTopics() {
		const k = this.getTopKValue()
		const topic2K = Math.ceil(2 * this.topPercent * this.topics.size)
		const topics = [...this.topics.entries()]
		const mainTopicCount = topics.reduce((a,b) => a + (b.count > k ? 1 : 0), 0)
		return topics
			.sort((a, b) => b[1].score - a[1].score)
			.slice(0, Math.max(mainTopicCount, Math.min(topic2K, k)))
    }
}
