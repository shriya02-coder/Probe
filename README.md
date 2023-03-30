# Probe: Intelligent Browsing Extension 

Probe is a browser extension for Google Chrome that summarizes any open webpage that is primarily text-based, such as a news article, encyclopedia entry, or blog post. It displays the primary sentences and topics of the page.

## Implementation Instructions 
probe is not presently on the Google Chrome store, so you must install the extension manually. If you do not have Chrome, you may download it from google.com/chrome.

First, download the probe extension source code from GitHub.com using the following command:

> git clone https://github.com/devinsburke/probe.git C:\probe

Next, open Google Chrome and navigate to the extensions page by visiting chrome://extensions/ or by clicking the **puzzle piece** icon and choosing **Manage extensions**. From the **Extensions** page, enable **Developer mode** by clicking the toggle in the page’s top-right corner. Three buttons will appear in the upper half of the screen. Click **Load unpacked**, and then browse to *C:\probe\chrome*. If you downloaded the GitHub repository to a different folder, input that folder and select the **chrome** subfolder within. The **probe 1.0** extension will then appear in your extension list.

## Usage Instructions
### Automatic Summarization 

By default, the probe icon (denoted by a sigma symbol) will appear in the bottom-right corner of each webpage you visit, if the page has at least a dozen sentences of prose content. The best candidates are news articles, encyclopedia entries, and blog posts. The visibility of this icon is configurable (see *Manual Summarization*).

Also, by default, probe will not attempt to summarize any website’s landing page or search page. For example, *website.com* will not be summarized, but *website.com/mypost* will. The reason these pages are suppressed is that they typically contain lists of pages or excessive visual content rather than prose, and thus the summarization results are typically quite poor. This suppression is configurable in the Options screen (see *Configuration*).

When enabled, hover over the probe icon in the bottom-right of a page to see the summary. The generated summary includes the follwing content:

* **Official Description**:  
  Meta data description from the page, usually shown on search engines.

* **Topics (Word Clusters)**:  
  Most frequent word combinations on the page. You can often guess an article’s subject given these topics.
  
* **Summary (Key Sentences)**:  
  List of the most relevant sentences on the page, in order that they appear on the page. Relevance is judged by how similar each sentence is to the whole page. For example, a sentence about one specific player probably won’t be included because the words in that sentence don’t appear many times in the overall page. To adjust the number of sentences shown, see *Configuration*.
  
### Manual Summarization 
You may disable the probe icon displaying automatically (see *Configuration*). In this case, when you wish to summarize an open page, you may still do so by clicking the extension icon in the Chrome browser toolbar, denoted by a puzzle piece. Then, click **probe** to view the generated summary in a popup window. You may permanently show probe in your toolbar by clicking the **Pin** icon to the right of the extension.

## Configuration 

The extension has settings to adjust visibility, summarization length, and suppression on certain pages. To access these options, click the Extension (puzzle) icon in the top-right of your Chrome toolbar, then click the three dots next to probe, and finally click **Options**. Alternatively, if you pinned the probe icon in your toolbar, you may simply right-click it and click **Options**.

This will open a new tab that allows you to maintain the following settings:

1. **Show probe icon on all pages**:  
  When enabled, the probe extension icon will be shown on the bottom right corner of all pages deemed applicable to summarize. This allows for quick utilization of the extensions summarization capability by simply hovering over the injected icon.

2. **Suppress probe icon on landing and search pages**:  
  When enabled, the extension icon will not be visible on any website landing page, meaning the home page of a given website. Home pages often do not contain large amounts of text and are mostly used for navigation purposes, meaning summarization is extremely unlikely to be useful. In addition, the icon will be hidden on search engine pages such as Google or Bing, as these results are also very navigation focused 

3. **Summary size**:  
  This setting allows modification of the length of the generated page summary, with 3 available options of 5%, 10%, and 15%. By default, 10% is the selected option, meaning when a page is summarized it will target a summarization size of 10% of the original text-based content. 
