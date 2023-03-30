// This code is using the Chrome browser's storage API to get settings from the extension, and 
// it creates a new instance of the View class and Escrape class defined earlier. 
// It then checks if the "show_icon" setting is true and if so, it calls the extractPageSummary function 
// to get the summary of the current page and updates the view with it. 
//If the "show_icon" setting is false, it doesn't show the summary.

chrome.storage.sync.get(null, settings => {
	const node = document.createElement('probe')
	document.body.appendChild(node)
	const view = new View(node)
	const escrape = new Escrape()
	escrape.injectCssEntries()

	if (settings.show_icon.value) {
		const summary = extractPageSummary(settings, escrape)
		view.update(summary)
	}


	// listens to chrome runtime message with listener method, on getting 'getElementContent' message, 
	// it calls extractPageSummary method and passes the summary to the callback method.

	chrome.runtime.onMessage.addListener((data, _, callback) => {
		if (data == 'getElementContent') {
			const summary = extractPageSummary(settings, escrape)
			callback(summary)
			view.update(summary)
		}
		return true
	})
})

// The extractPageSummary function takes the settings and the escrape instance as arguments.
// It first checks if the "suppress_landing" setting is true and the current URL is one of the URLs specified in the stopUrls array. 
//If so, it returns a message indicating that probe is configured to ignore landing pages.

function extractPageSummary(settings, escrape) {
	const stopUrls = ['', '/', '/search', '/search/'] // TODO: Settings.

	if (settings.suppress_landing.value && stopUrls.includes(document.location.pathname.toLowerCase()))
		return {
			success: false,
			message: 'probe is configured to ignore landing pages and search pages, as they are generally bad candidates for summarization. You may change this in the extension Options.',
		}

	
	// Then it uses the escrape instance to ignore certain elements on the page, such as abstract elements,
	// aside elements, hyperlink containers, and visual containers. 

	escrape.reset()
	escrape.ignoreAll(
		escrape.selectAbstractElements(),
		escrape.selectAsideElements(),
		escrape.selectHyperlinkContainers(),
		escrape.selectVisualContainers()
	)

	// It finds the article container using the findArticleContainer method and gets the text from it, 
	// then creates a new probeSentencesDocumentProcessor object with the text and the summary_size setting.

	const node = escrape.findArticleContainer()
	if (node) {
		let text = ''
		for (const t of escrape.getTextList(node))
			text += t + '\n'


		// It then checks if the text is long enough and the number of documents is greater than or 
		// equal to 12. If so, it gets the top sentences and topics from the content object, 
		// gets the original and summary word count, and returns a success message with the title, 
		// description, top sentences, top topics, original word count, and summary word count. 
		// If the text is not long enough or the number of documents is less than 12, 
		// it returns a failure message indicating that the page is not a good candidate for summarization.
		const content = new probeSentencesDocumentProcessor(text, settings.summary_size.value / 20)
		if (text.length >= 250 && content.documents.length >= 12) {
			const topSentences = content.getTopKDocuments()
			return {
				success: true,
				title: escrape.getPageTitle(),
				description: escrape.getPageDescription(),
				topSentences: topSentences,
				topTopics: content.getTopKTopics(),
				originalWordCount: content.documents.reduce((a, b) => a + b.words.length, 0),
				summaryWordCount: topSentences.reduce((a, b) => a + b.words.length, 0),
			}
		}
	}
	
	return {
		success: false,

		//CHANGE THIS MESSAGE
		message: 'This page is not a good candidate for summarization. Try longer pages such as news articles, blog posts, or encyclopdia entries.',
	}
}


// BRIEF OF THE CODE:

// Uses classes and methods to get the summary of a web page and update the view with the summary when 
// the extension icon is clicked or a message is received. 
// It uses escrape class to ignore certain elements on the page, 
// finds the article container, gets the text from it, 
// creates a new probeSentencesDocumentProcessor object with the text and the summary_size setting, 
// gets the top sentences and topics from it, gets the original and summary word count, and 
// returns a success message with the title, description, top sentences, top topics, original word count, 
// and summary word count.
