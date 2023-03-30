
// SECTION 1 BRIEF:


// Class Escrape is used for extracting the main content of a webpage by using various selectors 
// to locate the element that contains the main content. The class has various static methods for 
// generating selectors for different types of elements (e.g. tags, ids, classes, attributes, roles) and 
// also has a static property defaultConfig which contains a dictionary of keywords and their respective 
// scores used for scoring whether an element contributes to the article body. 
// The findArticleContainer method uses these scores to find the element that contains the main content.

class Escrape {
    /** Cache id for the next declared instance or reset. */
    static #nextCacheId = 0
    /**
     * Generates a string representing a tag selector (e.g.: `p,span,div`).
     * @param {string[]} items 
     * @returns {string}
     */
    static tagSelector(items) {
        return items.join(',')
    }
    /**
     * Generates a string representing an id selector (e.g.: `#this,#that`).
     * @param {string[]} items 
     * @returns {string}
     */
    static idSelector(items) {
        return '#' + items.join(',#')
    }
    /**
     * Generates a string representing a class selector (e.g.: `.class1,.class2`).
     * @param {string[]} items 
     * @returns {string}
     */
    static classSelector(items) {
        return '.' + items.join(',.')
    }
    /**
     * Generates a string representing an attribute selector (e.g.: `[disabled],[data]`).
     * @param {string[]} items 
     * @returns {string}
     */
    static attributeSelector(items) {
        return '[' + items.join('],[') + ']'
    }
    /**
     * Generates a string representing a role selector (e.g.: `[role=header],[role=footer]`).
     * @param {string[]} items 
     * @returns {string}
     */
    static roleSelector(items) {
        return '[role=' + items.join('],[role=') + ']'
    }
    /** Default configuration object for Escrape instances. */
    static defaultConfig = {
        /**
         * Dictionary of keywords and their respective scores, used for scoring whether an
         * element contribute to the article body. In the `findArticleContainer` method, each
         * keyword is sought in lowecase within the element's id, tag name, and/or classes.
         * 
         * Each keyword impacts the score at most once. For example, for a `span` with a class
         * of `timespan`, the keyword entry `{span:5}` would increase its score by by 5, not 10. However, multiple keywords can match the
         * However, entries `{span:10, time:5}` would increase its score by 15 because multiple
         * keywords can match the same element.
         * 
         * Use `.class`, `#id`, or `+tag` syntaxes to target specific attributes. To
         * match exact text, use a targeted prefix and a space suffix (e.g., `+i ` to target
         * the `i` tag without also matching `img`.)
         */
        selectorKeywordScores: {
            '+div ': 5,
            '+pre ': 5,
            '+section ': 5,
            '+p ': 10,
            'article': 25,
            'body': 25,
            'content': 25,
            'entry': 25,
            'hentry': 25,
            'main': 25,
            'page': 25,
            'post': 25,
            'text': 25,
            'blog': 25,
            'story': 25,
            'column': 25,
            '+dl ': -5,
            '+dt ': -5,
            '+dd ': -5,
            '+li ': -5,
            '+ol ': -5,
            '+td ': -5,
            '+ul ': -5,
            '.grid': -25,
            'attribution': -25,
            'blocks': -25,
            'combx': -25,
            'comment': -25,
            'contact': -25,
            'reference': -25,
            'foot': -25,
            'footer': -25,
            'footnote': -25,
            'infobox': -25,
            'masonry': -25,
            'masthead': -25,
            'media': -25,
            'meta': -25,
            'outbrain': -25,
            'promo': -25,
            'related': -25,
            'scroll': -25,
            'shoutbox': -25,
            'sidebar': -25,
            'sponsor': -25,
            'shopping': -25,
            'tags': -25,
            'tool': -25,
            'widget': -25,
            'community': -25,
            'disqus': -25,
            'extra': -25,
            'header': -25,
            'menu': -25,
            'remark': -25,
            'rss': -25,
            'shoutbox': -25,
            'sidebar': -25,
            'sponsor': -25,
            'ad-break': -25,
            'pagination': -25,
            'pager': -25,
            'popup': -25,
            'tweet': -25,
            'twitter': -25,
            'viewcode': -25,
        },
        /** List of 'display' style values that indicate the element should be treated as a block element (e.g.: block, inline-block). */
        blockDisplayStyles: ['block', 'flex', 'grid', 'inline-block', 'inline-flex'],
        /** List of 'position' style values that indicate the element should be treated as a block element (e.g.: absolute). */
        blockPositionStyles: ['absolute', 'fixed', 'sticky'],
        /** List of html tags that display as a block element by default (e.g.: div, h1). */
        blockTags: ['address', 'article', 'aside', 'blockquote', 'br', 'canvas', 'dd', 'div', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'noscript', 'ol', 'p', 'pre', 'section', 'table', 'td', 'th', 'tr', 'thead', 'tfoot', 'ul', 'video'],
        /** List of html tags that are often direct containers of prose (e.g.: p, span). */
        proseTags: ['p', 'pre', 'span', 'td', 'div'],
        /** List of html tags constituting section headers (e.g.: h1, h2) */
        headingTags: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        /** List of html tags that serve as non-display page infrastructure (e.g.: `script`, `style`, `meta`). */
        abstractTags: ['head', 'link', 'meta', 'noscript', 'script', 'style'],
        /** List of html tags that do contain text but are often purely for annotations (e.g.: label, address). */
        descriptiveTags: ['address', 'blockquote', 'cite', 'figcaption', 'footer', 'header', 'output', 'pre', 'sup', 'tfoot'],
        /** List of html tags for interactive, non-prose elements (e.g.: button, img, menu). */
        interactiveTags: ['button', 'canvas', 'dialog', 'embed', 'figure', 'form', 'frame', 'iframe', 'img', 'input', 'label', 'menu', 'menuitem', 'nav', 'object', 'select', 'svg', 'textarea', 'video'],
        /** List of html element roles for non-article, interactive elements (e.g.: alert, banner, tooltip). */
        asideRoles: ['alert', 'alertdialog', 'banner', 'button', 'columnheader', 'combobox', 'complementary', 'dialog', 'directory', 'figure', 'heading', 'img', 'listbox', 'marquee', 'math', 'menu', 'menubar', 'menuitem', 'navigation', 'option', 'search', 'searchbox', 'status', 'toolbar', 'tooltip'],
        /** List of css classes of typical elements like div or span that xxx. */
        asideClasses: ['blogroll', 'caption', 'citation', 'comment', 'community', 'contact', 'copyright', 'extra', 'foot', 'footer', 'footnote', 'hide-print', 'infobox', 'masthead', 'media', 'meta', 'metadata', 'mw-jump-link', 'mw-revision', 'navigation', 'navigation-not-searchable', 'noprint', 'outbrain', 'pager', 'popup', 'promo', 'reference', 'reference-text', 'references', 'related', 'related-articles', 'remark', 'rss', 's-popover', 'scroll', 'shopping', 'shoutbox', 'sidebar', 'sponsor', 'tag-cloud', 'tags', 'thumb', 'tool', 'user-info', 'widget', 'wikitable'],
        /** Minimum percentage (0-1) of text under an element that must be owned by a selector for the whole element to be considered a container of that selector. */
        containerRatioThreshold: 0.4,
        /** Minimum text length within an element to be considered textual. */
        textLengthThreshold: 75,
        /** Maximum level to traverse upward when propagating text-length scores to parents. */
        textContainerTraversalDepth: 4,
        /** CSS class applied to elements via the `subdue` and `subdueOther` methods. */
        subduedCssClass: 'escrape-deemphasized',
    }

    /** Cache id of this instance. See note on `reset` method. */
    #cacheId
    /**
     * Constructs a new Escrape instance. No processing occurs during construction, so
     * you may create new instances cheaply.
     * @param {object} config Configuration object. See documentation on `defaultConfig` and `setConfig`.
     * @param {HTMLElement} element Root element that will be scraped. Typically document.body.
     */
    constructor(config = Escrape.defaultConfig, element = document.body) {
        this.setConfig(config)
        this.reset()
        this.rootNode = element
    }

    /**
     * Updates the configuration object with the config provided. If only a partial object
     * is supplied, then only those settings will be updated and any missing settings will
     * either stay their current value or, if unset, use the default Escrape configuration
     * for that setting.
     * @param {object} config Full or partial configuration object
     */
    setConfig(config) {
        this.config = {...Escrape.defaultConfig, ...config}
    }

    /**
     * Creates and injects a new `style` element with default CSS defined for classes
     * used or assigned by Escrape.
     * 
     * E.g., assigns `{opacity: 0.3 !important}` to the css class defined in
     * `config.subduedCssClass`.
     * @param {HTMLElement} node Element under which to inject a new `style` element.
     */
     injectCssEntries(node = this.rootNode) {
        const newNode = node.ownerDocument.createElement('style')
        newNode.textContent = `
            .${this.config.subduedCssClass} { opacity: 0.3 !important; }
        `
        node.appendChild(newNode)
    }


    // SECTION 2 BRIEF:

    // This class appears to have various methods for working with web pages, such as 'subdue' 
    // which applies a specific CSS class to an element and subdueOther which applies the same CSS class 
    // to topmost elements that are not ancestors of a specified node. 
    // The 'reset' method unignores all elements and resets text length, score, and container estimations 
    // that had been cached for performance. 
    // The 'getPageDescription' method retrieves the host-provided description of the page based on meta tags or, 
    // if meta tags are absent, common description elements. 
    // The 'getPageTitle' method retrieves the host-provided title of the page based on the H1 tag or,
    // if there is not precisely one h1, the title tag. 
    // The select method finds container elements whose text content is predominantly owned by child 
    // elements that match a set of selectors and returns a generator of elements that match the 
    // provided selector, excluding those that are hidden or ignored.


    /**
     * Applies the CSS class defined in `config.subduedCssClass` to the provided element.
     * @param {HTMLElement} node Element to subdue.
     */
    subdue(node) {
        node.classList.toggle(this.config.subduedCssClass, true)
    }
    
    /**
     * Applies the CSS class defined in `config.subduedCssClass` to the each topmost
     * element not an ancestor to the specified `node`. If `subdueIgnored` is true,
     * applies the same CSS class to ignored elements descending from `node`.
     * @param {HTMLElement} node Element of which to subdue surrounding elements.
     * @param {boolean} subdueIgnored If true, subdues ignored elements descending from `node`.
     */
    subdueOther(node, subdueIgnored = true) {
        let parent = node
        while (parent) {
            let sibling = parent
            while (sibling = sibling.previousElementSibling)
                this.subdue(sibling)
            sibling = parent
            while (sibling = sibling.nextElementSibling)
                this.subdue(sibling)
            parent = parent.parentNode
        }

        if (subdueIgnored) {
            const traverseFn = n => {
                for (const c of n.children) {
                    if (this.isIgnored(c))
                        this.subdue(c)
                    else
                        traverseFn(c)
                }
            }
            traverseFn(node)
        }
    }
    
    /**
     * Unignores all elements and resets text length, score, and container estimations
     * that had been cached for performance. Most useful when the configuration or page
     * content change significantly.
     */
    reset() {
        this.#cacheId = Escrape.#nextCacheId++
    }

    /**
     * Retrieves the host-provided description of the page based on `meta` tags or, if
     * `meta` tags are absent, common description elements.
     * @param {HTMLElement} The root DOM node to search for the page description. 
     * @returns {string} A string containing the page description if available.
     */
    getPageDescription(node = this.rootNode) {
        const metas = node.querySelectorAll('meta[description],meta[name=description],meta[property=og\\:description]')
        for (const meta of metas) {
            if (meta.description)
                return meta.description
            if (meta.content)
                return meta.content
        }
        const shortDescription = node.querySelectorAll('.shortdescription')
        if (shortDescription.length == 1)
            return shortDescription[0].innerText

        return ''
    }

    /**
     * Retrieves the host-provided title of the page based on the H1 tag or, if there is
     * not precisely one h1, the title tag.
     * @param {HTMLElement} The root DOM node to search for the page title.
     * @returns {string} A string containing the page title if available.
     */
    getPageTitle(node = this.rootNode) {
        const h1s = node.querySelectorAll('h1')
        if (h1s.length == 1)
            return h1s[0].textContent
        if (node.ownerDocument.title)
            return node.ownerDocument.title.split(/( - | \| )/)[0].trim()
    }

    /**
     * Retrieves a list of elements that match the provided selector, excluding those that
     * are hidden or ignored.
     * @param {HTMLElement} node Parent element under which to find elements.
     * @returns {Generator<HTMLElement>} List of elements matching the selector, excluding those that are hidden or ignored.
     */
    *select(selector, node = this.rootNode) {
        for (const n of node.querySelectorAll(selector))
            if (!this.isIgnored(n) && !this.isHidden(n))
                yield n
    }

    /**
     * Finds container elements whose text content is predominantly owned by child elements
     * that match a particular selector. Predominance is defined by meething the threshold
     * in `config.containerRatioThreshold`.
     * @param {string} selector 
     * @param {string} title Description of the containers, used to chained uses of this method.
     * @param {HTMLElement} node Parent element under which to find elements.
     * @returns {Generator<HTMLElement>} List of elements that are predominantly composed by selected elements, excluding those that are hidden or ignored.
     */
    *selectContainersOf(selector, title = '', node = this.rootNode) {
        const nodes = [...this.select(selector, node)]
        const property = `${title}Container`

        let currentNode
        while (currentNode = nodes.shift()) {
            this.#cacheSet(property, true, currentNode)
            yield currentNode

            const parent = currentNode.parentNode
            if (parent && this.#cacheGet(property, parent) == null) {
                const isContainer = this.calculateTextFill(selector, node) > this.config.containerRatioThreshold
                this.#cacheSet(property, isContainer, parent)
                if (isContainer)
                    nodes.push(parent)
            }
        }
    }

    *selectHyperlinkContainers(node = this.rootNode, minimumHyperlinks = 3) {
        for (const n of this.selectContainersOf('a', 'link', node))
            if (n.tagName.toLowerCase() != 'a') {
                if (this.isBlock(n))
                    yield n
                else if (this.select('a', n).length >= minimumHyperlinks)
                    yield n
            }
    }

    /**
     * Retrieves a list of elements that match the `config.proseTags` selector and contain
     * a minimum amount of text, defined by `config.textLengthThreshold`. Excludes hidden
     * and ignored elements.
     * @param {HTMLElement} node Parent element under which to find elements.
     * @returns {Generator<HTMLElement>} List of elements matching the `config.proseTags` selector, excluding those that are hidden or ignored.
     */
    *selectProseElements(node = this.rootNode) {
        const selector = Escrape.tagSelector(this.config.proseTags)
        for (const n of this.select(selector, node))
            if (this.isSignificantTextLength(n))
                yield n
    }

    /**
     * Retrieves a list of elements that provide basic page infrastructure, often located
     * in the page's `head` (e.g.: `script`, `style`, `meta`).
     * @param {HTMLElement} node Parent element under which to find abstract elements.
     * @returns {Generator<HTMLElement>} List of elements matching the `config.abstractTags` selector, excluding those that are hidden or ignored.
     */
    selectAbstractElements(node = this.rootNode) {
        const selector = Escrape.tagSelector(this.config.abstractTags)
        return this.select(selector, node)
    }

    /**
     * Retrieves a list of elements that are typically noise, such as citations.
     * @param {HTMLElement} node Parent element under which to find aside elements.
     * @returns {Generator<HTMLElement>} List of elements matching the `config.asideClasses` and `config.asideRoles` selectors, excluding those that are hidden or ignored.
     */
    selectAsideElements(node = this.rootNode) {
        const selector = Escrape.classSelector(this.config.asideClasses)
            + ',' + Escrape.roleSelector(this.config.asideRoles)
        return this.select(selector, node)
    }

    /**
     * Retrieves a list of containers of display-oriented elements that are descriptive
     * (`h2`, `address`, etc.) or interactive (`button`, `menu`, etc.).
     * See `selectContainersOf` for a better understanding of containers and thresholds. 
     * @param {HTMLElement} node Parent element under which to find aside elements.
     * @returns {Generator<HTMLElement>} List of elements matching the `config.descriptiveTags`, `config.interactiveTags`, `config.headingTags` selectors, excluding those that are hidden or ignored.
     */
    selectVisualContainers(node = this.rootNode) {
        const selector = Escrape.tagSelector(this.config.descriptiveTags)
            + ',' + Escrape.tagSelector(this.config.interactiveTags)
            + ',' + Escrape.tagSelector(this.config.headingTags)
        return this.selectContainersOf(selector, 'visual', node)
    }
    

    // SECTION 3 BRIEF: 

    // This class has a method 'findArticleContainer which scores all containers of prose,
    // and returns the highest ranking container element. It specifically evaluates and scores 
    // the parent of each (visible, unignored) element matching the config.proseSelector and traverses to a 
    // limit defined by config.textContainerTraversalDepth. 

    // There is also a method 'getTextNodes' which retrieves the 
    // text nodes (Nodes of TEXT_NODE type) descending from a provided node, any text nodes descending from hidden or 
    // ignored elements are omitted. 
    
    // The method 'getTextList' retrieves strings representing all text descending from node, 
    // omitting hidden and ignored elements. Each list item signifies a continuous text in a block element. 

    // The method 'getTextLength' returns the text length of an element and all its descendants, 
    // excluding hidden and ignored elements. Text length is cached on each downstream element.

    // The class also has methods for determining if an element is ignored, hidden or a block element, 
    // as well as methods for calculating text length and scoring elements based on certain criteria.
    // It appears to use caching to improve performance and make efficient use of traversing the DOM tree. 
    // Additionally, it also has a method selectProseElements which returns a generator of elements that match 
    // the selector defined in config.proseSelector, and are not ignored or hidden.



    /**
     * Scores all containers of prose, and returns the highest ranking container (element).
     * If all containers have negative scores, nothing is returned.
     * 
     * Specifically, the parent of each (visible, unignored) element matching the
     * `config.proseSelector` are evaluated and scored, traversed to a limit defined by
     * `config.textContainerTraversalDepth`.
     * 
     * @param {HTMLElement} node Parent element under which to search.
     * @returns {HTMLElement} Highest-scoring ...
     */
    findArticleContainer(node = this.rootNode) {
        let nodes = []
        for (const n of this.selectProseElements(node)) {
            let weight = Math.min(this.calculateTextLength(n) / this.config.textLengthThreshold, 10) - 1
            let depth = this.config.textContainerTraversalDepth
            const decrement = weight / depth
            
            let p = n.parentNode
            while (p.parentNode && --depth) {
                if (this.#score(weight, p))
                    nodes.push(p)
                weight -= decrement
                p = p.parentNode
            }
        }

        let bestNode
        let bestScore = 0
        for (const n of nodes) {
            const score = this.#cacheGet('score', n)
            if (score > bestScore) {
                bestNode = n
                bestScore = score
            }
        }
        return bestNode
    }

    /**
     * Retrieves the text nodes (`Node`s of `TEXT_NODE` type) descending from the provided
     * `node`. Any text nodes descending from hidden or ignored elements are omitted.
     * @param {HTMLElement} node Element under which to retrieve text nodes.
     * @param {boolean} addBlockWrapperNodes If `true`, text nodes of `\n` will be inserted before and after each block node.
     * @returns {Generator<HTMLElement>} Generator of text nodes.
     */
    *getTextNodes(node = this.rootNode, addBlockWrapperNodes = true) {
        let isBlock = false
        const blockWrapper = document.createTextNode('\n')
        blockWrapper._preserveWhitespace = true

        for (let child = node.firstChild; child; child = child.nextSibling) {
            if (child.nodeType == Node.TEXT_NODE) {
                yield child
                isBlock = false
            } else if (child.nodeType == Node.ELEMENT_NODE
                && !this.isIgnored(child)
                && !this.isHidden(child)
            ) {
                const lastBlock = isBlock
                isBlock = addBlockWrapperNodes && blockWrapper && this.isBlock(child)
                if (isBlock && !lastBlock)
                    yield blockWrapper
                yield* this.getTextNodes(child)
                if (isBlock)
                    yield blockWrapper
            }
        }
    }

    /**
     * Retrieves strings representing all text descending from `node`, omitting hidden and
     * ignored elements. Each list item signifies a continuous text in a block element.
     * @param {HTMLElement} node Element under which to retrieve text nodes.
     * @param {boolean} collapseWhitespace If `true`, all contiguous whitespace is converted to a single space character.
     * @returns {Generator<HTMLElement>} Generator of strings.
     */
    *getTextList(node = this.rootNode, collapseWhitespace = true) {
        let text = ''
        for (const n of this.getTextNodes(node)) {
            if (!n._preserveWhitespace) {
                text += collapseWhitespace
                    ? n.textContent.replace(/\s+/g, ' ')
                    : n.textContent
            } else if (text.trim()) {
                yield text.trim()
                text = ''
            }
        }
        if (text)
            yield text
    }

    /**
     * Returns the text length of an element and all its descendants, excluding hidden and
     * ignored elements. Text length is cached on each downstream element.
     * @param {HTMLElement} node Element to evaluate.
     * @returns {int} Character count of relevant text under this node.
     */
    calculateTextLength(node = this.rootNode) {
        let len = this.#cacheGet('textlength', node) || 0
        if (!len) {
            for (let child = node.firstChild; child; child = child.nextSibling) {
                if (child.nodeType == Node.TEXT_NODE) {
                    len += child.textContent.replace(/\s+/g, ' ').trim().length
                } else if (child.nodeType == Node.ELEMENT_NODE
                    && !this.isIgnored(child)
                    && !this.isHidden(child)
                ) {
                    len += this.calculateTextLength(child)
                }
            }
            this.#cacheSet('textlength', len, node)
        }
        return len
    }
    
    calculateTextFill(selector, node = this.rootNode) {
        const textLength = this.calculateTextLength(node)
        if (textLength == 0)
            return 0
        let selectedTextLength = 0
        for (const n of this.select(selector, node))
            if ((!n.parentNode || !n.parentNode.closest(selector)))
                selectedTextLength += this.calculateTextLength(n)
        return selectedTextLength / textLength
    }

    /**
     * Ignores every node in one or more node lists.
     * 
     * Ignored elements will not be followed or considered during selection or text-length
     * analysis by scoring methods. To unignore all ignored elements, call `reset()`.
     * @param  {...NodeList} nodeList List of nodes to ignore. Each parameter must be a separate `NodeList`.
     */
    ignoreAll(...nodeList) {
        for (const list of nodeList)
            for (const e of list)
                this.ignore(e)
    }

    /**
     * Marks the provided node and all its descendents as 'ignored.'
     * 
     * Ignored elements will not be followed or considered during selection or text-length
     * analysis by scoring methods. To unignore all ignored elements, simply declare a new
     * instance of `Escrape`.
     * @param {HTMLElement} node Element to ignore.
     */
    ignore(node = this.rootNode) {
        if (!this.isIgnored(node)) {
            this.#cacheSet('ignored', true, node)
            this.#cacheSet('textlength', 0, node)

            for (const n of node.children)
                this.ignore(n)
        }
    }

    /**
     * Determines if the element has been marked as 'ignored' by the current `Escrape`
     * instance.
     * 
     * Ignored elements will not be followed or considered during selection or text-length
     * analysis by scoring methods. To unignore all ignored elements, simply declare a new
     * instance of `Escrape`.
     * @param {HTMLElement} node Element to evaluate.
     * @returns {boolean} `true` if element is ignored.
     */
    isIgnored(node = this.rootNode) {
        return this.#cacheGet('ignored', node)
    }

    /**
     * Determines if visible, unignored text descending form `node` meets the length
     * threshold defined in `config.textLengthThreshold`.
     * @param {HTMLElement} node Element to evaluate.
     * @returns {boolean} `true` if text length exceeds
     */
    isSignificantTextLength(node = this.rootNode) {
        return this.calculateTextLength(node) >= this.config.textLengthThreshold
    }

    /**
     * Determines if an element is hidden, having zero flow impact to the page. Elements
     * styled as 'visibility: hidden' are considered visible because they have shape and
     * affect document flow.
     * @param {HTMLElement} node Element to assess. 
     * @param {boolean} autoIgnore Whether to automatically `ignore` the element if it is hidden.
     * @returns {boolean} Boolean indicating if the node is hidden.
     */
    isHidden(node = this.rootNode, autoIgnore = true) {
        const hidden = !node.offsetWidth && !node.getClientRects()
        if (hidden && autoIgnore)
            this.ignore(node)
        return hidden
    }

    /**
     * Performantly estimates if the node is a block element based on the display or
     * position style explicitly set on the element (i.e., not set via stylesheet), or, if
     * none, the default display value of the tag.
     * @param {HTMLElement} node Element to assess. 
     * @returns {boolean} `true` if the node is probably block-style.
     */
    isBlock(node = this.rootNode) {
        const display = node.style.display
        if (display && this.config.blockDisplayStyles.includes(display.toLowerCase()))
            return true
        const position = node.style.position
        if (position && this.config.blockPositionStyles.includes(position.toLowerCase()))
            return true
        return this.config.blockTags.includes(node.tagName.toLowerCase())
    }

    /**
     * Retrieves a value from the cache of a specified element. To reset the cache, use
     * the `reset` method.
     * @param {string} property Name of the property to seek in the cache.
     * @param {HTMLElement} node Element whose cache is being queried.
     * @returns {any} Value from the specified element's cache, if there is one.
     */
    #cacheGet(property, node = this.rootNode) {
        if (node._escrape && node._escrape[this.#cacheId])
            return node._escrape[this.#cacheId][property]
    }

    /**
     * Sets a value in the cache of a specified element.
     * @param {string} property Name of the property to set in the cache.
     * @param {any} value Value to assign to the property specified.
     * @param {HTMLElement} node Element whose cache is being updated.
     */
    #cacheSet(property, value, node = this.rootNode) {
        node._escrape ??= {}
        node._escrape[this.#cacheId] ??= {}
        node._escrape[this.#cacheId][property] = value        
    }

    /**
     * Assigns an element a score based on the presence of keywords in the class, tag name, or id. 
     * @param {int} weight Length-based incremental score to add to the element.
     * @param {HTMLElement} node Element to evaluate.
     * @returns {boolean} `True` if calculating the initial score; `False` if updating the cached score.
     */


    // SECTION 4 BRIEF: 

   // The 'score' method is used to score a specific node based on its tag name, class name, and id. 
   // It first checks if the score of the node is already cached, if it is, it adds the current weight to the cached score
   // and returns false. If the score is not cached, it converts the class name, id and tag name to lowercase and 
   // creates a search string. Then it loops through the config.selectorKeywordScores object, 
   // checking if the search string includes any of the keys. 
   // If it does, it checks if the value of the key is higher than the current highest value, and if it is, 
   // it sets the highest value to that value. It also checks if the value is lower than the current lowest value, 
   // if it is, it sets the lowest value to that value. 
   // Finally, it caches the score (highest + lowest + weight) for the node and returns true.



    #score(weight, node = this.rootNode) {
        const currentScore = this.#cacheGet('score', node)        
        if (currentScore != null) {
            this.#cacheSet('score', currentScore + weight, node)
            return false
        }
        const tagName = node.tagName.toLowerCase()
        const searchStr =`.${node.className.toLowerCase().replace(' ', ' .')} #${node.id.toLowerCase()} +${tagName} `
        let highest = 0
        let lowest = 0
        for (const k in this.config.selectorKeywordScores)
            if (searchStr.includes(k)) {
                const val = this.config.selectorKeywordScores[k]
                if (val > highest)
                    highest = val
                else if (val < lowest)
                    lowest = val
            }
        this.#cacheSet('score', highest + lowest + weight, node)
        return true
    }
}
