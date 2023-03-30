
// SECTION 1:

// DETAIL:

// Class "probeNLP" has several methods which can be used to perform different natural
//  language processing tasks, such as converting text to a "bag of words" representation extracting "topics" 
// from text, and calculating the similarity between different pieces of text.

//  The constructor for the class takes an optional parameter called "stopwords", 
// which is an array of words that should be ignored when processing text (e.g. "the", "and", etc.). 
// If no value is provided for this parameter, it defaults to an array called "defaultStopwords".

class probeNLP {
    constructor(stopwords = defaultStopwords) {
        this.stopwords = stopwords
    }


// The "toBagOfWords" method takes two parameters: an array of words, and a boolean indicating whether 
// stopwords should be removed (defaults to true). It returns a map where the keys are the unique words
// from the input array, and the values are the number of times each word appears in the input array. 
// If the "remove_stopwords" parameter is true, any words that are in the "stopwords" array are removed from 
// the input array before the bag of words is created.


    toBagOfWords(words, remove_stopwords = true) {
        const countByWord = new Map()
        countByWord.innerLength = words.length
        for (const w of words)
            if (!remove_stopwords || !this.stopwords.includes(w.toLowerCase()))
                countByWord.set(w, (countByWord.get(w) ?? 0) + 1)
        return countByWord
    }

// The "toTopics" method takes three parameters: an array of arrays of words, an integer indicating the 
// context length, and a boolean (remove stopwords) indicating whether stopwords should be removed (defaults to true). 
// It returns a map where the keys are phrases extracted from the input text, and the values are an object 
// containing information about the phrase (e.g. its "score" and "count").
// The method first removes stopwords if the "remove_stopwords" parameter is true, then iterates through each word
// in each list of words, adding it to a "context" array, and for each context, 
//it adds the context to the topics map with its count and score.


    toTopics(wordLists, contextLength = 4, remove_stopwords = true) {
        let topics = new Map()
        for (let list of wordLists) {
            if (remove_stopwords)
                list = this.remove_stopwords(list)
            const context = []
            for (const w of list) {
                if (context.length == contextLength)
                    context.shift()
                context.push(w)
                for (let i = 0, l = context.length; i < l - 1; i++) {
                    const asArray = context.slice(i, l)
                    const str = asArray.join(' ')
                    const value = topics.get(str) ?? { asArray: asArray, score: 0, count: 0, }
                    value.count += 1
                    value.score += 1 + 0.1 * (l - i)
                    topics.set(str, value)
                }
            }
        }


        // The method has already extracted a set of topics from the input text and stored 
        //them in the "topics" variable, which is a Map where the keys are phrases and the values are objects 
        //containing information about the phrase (e.g. its "score" and "count").

        // The first line of code here filters the "topics" map, keeping only the entries where the score of the 
        //topic is greater than 3.

        //The next lines of code filter the "topics" map again, this time keeping only the entries where:

            // 1. the score of the topic is less than or equal to the score of the other topic.
            // 2. the length of the array representing the topic is less than the length of the array representing the other topic.
            // 3. the words of the topic array do not include all the words of the other topic array.
            // Then, the topics are sorted first by descending order of the length of the key and then by descending order of the score of the value.

        //Finally, a new Map is returned with the filtered and sorted topics as entries.


        
        //In short: filtering and sorting the extracted topics based on their scores and lengths, 
        // and returning the filtered and sorted set of topics.
        topics = [...topics.entries()].filter(t => t[1].score > 3)
        topics = topics
            .filter(([_, t]) => topics.every(([__, t2]) => t2.score <= t.score || t2.asArray.length < t.asArray.length || !t.asArray.every(w => t2.asArray.includes(w))))
            .sort((a, b) => b[0].length - a[0].length)
            .sort((a, b) => b[1].score - a[1].score)
        return new Map(topics)
    }


    // The "remove_stopwords" method takes an array of words, and returns a new array with all the words that 
    // are in the "stopwords" array removed
    remove_stopwords(listOfWords) {
        return listOfWords.filter(w => !this.stopwords.includes(w.toLowerCase()))
    }

    // The "toVocabulary" method takes an arbitrary number of arrays of words, 
    // and returns an array of all the unique words from those arrays.
    toVocabulary(...listOfWords) {
        return Array.from(new Set([].concat.apply([], listOfWords)))
    }


    // The "find_similarity_scores" method takes two parameters: normalize, 
    // and an arbitrary number of "bag of words" maps. 
    // It returns an array of similarity scores between each pair of bags of words.
    find_similarity_scores(normalize, ...bagOfWords) {
        const matrix = this.find_similarity_matrix(...bagOfWords)
        return this.scoreSimilarityMatrix(matrix, normalize)
    }


    // The "find_similarity_matrix" method takes an arbitrary number of "bag of words" maps, 
    // and returns a matrix (i.e. an array of arrays) of similarity scores between each pair of bags of words.

    find_similarity_matrix(...bagOfWords) {
        const length = bagOfWords.length
        const matrix = this.buildMatrix(length, 2)
        matrix.innerLength = 0

        for (var i = 0; i < length - 1; i++) {
            const currentBag = bagOfWords[i]
            matrix.innerLength += currentBag.innerLength
            matrix[i].innerLength = currentBag.innerLength

            for (var j = i + 1; j < length; j++) {
                const similarity = this.getSimilarity(currentBag, bagOfWords[j])
                matrix[i][j] = similarity
                matrix[j][i] = similarity
            }
        }
        return matrix
    }



    // The "buildMatrix" method takes two parameters: an integer indicating the length of the matrix, 
    // and an integer indicating the number of dimensions. It returns a matrix (i.e. an array of arrays) 
    // with the specified length and number of dimensions, filled with zeroes.
    buildMatrix(length, dimensions) {
        if (dimensions == 1) {
            return Array(length).fill(0)
        } else {
            return Array(length).fill().map(_ => this.buildMatrix(length, dimensions - 1))
        }
    }



    // The "getSimilarity" method takes two "bag of words" maps, and returns a similarity
    // score between them using cosine similarity and normalizing the words to a vocabulary.

    getSimilarity(bagOfWords1, bagOfWords2) {
        if (bagOfWords1.size == 0 || bagOfWords2.size == 0)
            return 0

        const vocab = this.toVocabulary(
            [...bagOfWords1.keys()],
            [...bagOfWords2.keys()]
        )
        return this.cosineSimilarity(
            this.normalize_words_to_vocab(vocab, bagOfWords1),
            this.normalize_words_to_vocab(vocab, bagOfWords2)
        )
    }


    // SECTION 2:

    // BRIEF: In summary, the code defines methods for normalizing an array of words to a vocab and for 
    // calculating the cosine similarity between two vectors. Then it defines the scoreSimilarityMatrix method 
    // that takes a matrix of similarity scores and a normalize parameter, 
    // calculates the average score, and returns an array of scores where each element is the sum of the 
    // corresponding row of the matrix, multiplied by a factor based on the number of elements in that row and
    // the average of the number of elements in all the rows. And also it normalizes the scores if the normalize
    // parameter is true.


    // DETAIL:


    // The "normalize_words_to_vocab" method takes two parameters: an array of words (vocab) 
    // and a "bag of words" map (bagOfWords). It returns an array where each element 
    // is the count of the corresponding word in the vocab array in the bagOfWords map. 
    // If the word is not in the bagOfWords map, the element is 0.

    normalize_words_to_vocab(vocab, bagOfWords) {
        return vocab.map(v => bagOfWords.get(v) || 0)
    }


    // The "cosineSimilarity" method takes two parameters: two arrays of numbers (vectors) 
    // it returns the cosine similarity between the two vectors. 
    // The cosine similarity is calculated as the dot product of the two vectors divided by the product 
    // of the magnitudes of the two vectors. The dot product and magnitudes are calculated using the 
    // "getDotProduct" method which takes two vectors and returns their dot product, and the Math.sqrt 
    // method which takes a number and returns its square root.
    cosineSimilarity(vector1, vector2) {
        const ab = this.getDotProduct(vector1, vector2)
        const aa = this.getDotProduct(vector1, vector1)
        const bb = this.getDotProduct(vector2, vector2)
        return ab / (Math.sqrt(aa) * Math.sqrt(bb))
    }

    getDotProduct(vector1, vector2) {
        return vector1.reduce((accum, val, i) => accum + val * vector2[i] || accum, 0)
    }


    // The "scoreSimilarityMatrix" method takes two parameters: a matrix of similarity scores and a boolean 
    // indicating whether scores should be normalized (defaults to false). It returns an array of scores
    // where each element is the sum of the corresponding row of the matrix, multiplied by a factor that is 
    // based on the number of elements in that row and the average of the number of elements in all the rows. 
    // If the normalize parameter is true, the scores are normalized using the "normalizeScoreList" method which 
    // takes an array of scores and returns a new array where each element is the corresponding element in the 
    // input array divided by the sum of all elements in the input array.

    scoreSimilarityMatrix(matrix, normalize = false) {
        const average = matrix.innerLength / matrix.length
        const scores = matrix.map(m => m.innerLength < 4 ? 0 : m.reduce((a, b) => a + b * Math.min(m.innerLength / average, 1) || a), 0)
        return normalize ? this.normalizeScoreList(scores) : scores
    }

    normalizeScoreList(scores) {
        const total = scores.reduce((a, b) => a + b || a, 0)
        return scores.map(m => m / total)
    }
}