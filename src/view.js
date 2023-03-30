// Class "View" is used to create and update the elements of a webpage. 
// The constructor method creates various elements (such as meta tags, headings, and lists) and appends 
// them to a node that is passed in as an argument. 


class View {
	constructor(node) {
		this.node = node

		const meta = this.#create('meta')
		meta.setAttribute('http-equiv', 'Content-Type')
		meta.setAttribute('content', 'text/html charset=UTF-8')


		// The #create method is a private method that is used to create elements and set their attributes. 
		
		this.#create('probe-span', {text: 'P'})
		this.#create('probe-bg')
		this.#create('probe-h1', {id: 'probe-title'})
		this.#create('probe-insight-subtitle', {id: 'probe-subtitle'})

		this.#create('probe-h2', {text: 'Brief Description'})

		this.#create('probe-description', {id: 'probe-description'})

		this.#create('probe-h2', {id: 'probe-topic-title', text: 'Word Clusters'})

		this.#create('probe-topic-ul', {id: 'probe-topic-list'})
		this.#create('probe-h2', {id: 'probe-sentence-title', text: 'Summarization'})
		this.#create('probe-ul', {id: 'probe-sentence-list'})
	}

	// Σ

	#create(tag, attr = {}) {
		const el = document.createElement(tag)
		this.node.appendChild(el)
		if (attr.id)
			el.id = attr.id
		if (attr.text)
			el.innerText = attr.text
		return el
	}

	// The update method is used to update the elements on the webpage with new data, such as the title, 
	// description, and sentences of a document. If the data received is not successful, 
	// it sets an attribute on the node with a message.

	update(data) {
		if (!data.success) {
			this.node.setAttribute('data-probe-message', data.message)
			return
		}
		

		// The update method also updates the number of topics and sentences displayed by setting the 'data-count' attribute 
		// on the appropriate elements.
		//  It also clears the previous content of the topic and sentence lists before adding new data. 


		this.node.removeAttribute('data-probe-message')
		document.getElementById('probe-title').innerText = data.title

		// changes the text of an element 
		document.getElementById('probe-subtitle').innerText = 'Summarized a ' + data.originalWordCount + ' document in ' + data.summaryWordCount + ' words, reducing the reading time by ' + Math.round((data.originalWordCount - data.summaryWordCount) / 200, 2) + ' minutes'
		
		document.getElementById('probe-description').innerText = data.description
		
		document.getElementById('probe-topic-title').setAttribute('data-count', data.topTopics.length)
		const topicList = document.getElementById('probe-topic-list')
		topicList.innerHTML = ''
		for (const [topic, {count}] of data.topTopics) {
			const li = document.createElement('probe-li')
			li.setAttribute('data-count', count)
			li.innerText = topic
			topicList.appendChild(li)
		}

		document.getElementById('probe-sentence-title').setAttribute('data-count', data.topSentences.length)
		const sentenceList = document.getElementById('probe-sentence-list')
		sentenceList.innerHTML = ''
		for (const doc of data.topSentences) {
			const li = document.createElement('probe-li')
			li.innerText = doc.original
			sentenceList.appendChild(li)
		}
	}
}
