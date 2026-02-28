import { s as shouldMaskNode, C as CENSORED_STRING_MARK, b as buildUrl, N as NodePrivacyLevel, a as shouldMaskAttribute, c as CENSORED_IMG_MARK, d as sanitizeIfLongDataUrl, i as isSafari, g as getTextContent, r as reducePrivacyLevel, e as getNodeSelfPrivacyLevel, P as PRIVACY_ATTR_VALUE_HIDDEN, f as PRIVACY_ATTR_NAME, h as hasChildNodes, j as isNodeShadowRoot, k as forEachChildNodes, l as isElementNode, m as getScrollX, n as getScrollY, t as timeStampNow, o as elapsed, p as getViewportDimension, q as isExperimentalFeatureEnabled, E as ExperimentalFeature, u as isNodeShadowHost, v as throttle, w as addEventListeners, x as getNodePrivacyLevel, y as addEventListener, z as initViewportObservable, A as noop, B as instrumentMethod, R as RumEventType, D as ActionType, F as instrumentSetter, G as requestIdleCallback, H as getMutationObserverConstructor, I as monitor, J as getParentNode, K as sendToExtension, L as addRecord, M as getSegmentsCount, O as addSegment, Q as addWroteData, S as isPageExitReason, T as clearTimeout, U as setTimeout, V as ONE_SECOND, W as addTelemetryMetrics, X as getEventBridge, Y as createHttpRequest, Z as canUseEventBridge, _ as addTelemetryDebug } from './index-B2sskZhK.js';
import './preload-helper-C7Zd8gLW.js';
import './host__loadShare__react__loadShare__-Cshx09tR.js';
import './_commonjsHelpers-BAGoDD49.js';
import './host__mf_v__runtimeInit__mf_v__-CjaOuR8C.js';

const RecordType = {
    FullSnapshot: 2,
    IncrementalSnapshot: 3,
    Meta: 4,
    Focus: 6,
    ViewEnd: 7,
    VisualViewport: 8,
    FrustrationRecord: 9,
    Change: 12,
};
const NodeType = {
    Document: 0,
    DocumentType: 1,
    Element: 2,
    Text: 3,
    CDATA: 4,
    DocumentFragment: 11,
};
const ChangeType = {
    AddString: 0,
    AddNode: 1,
    RemoveNode: 2,
    Attribute: 3,
    Text: 4,
    Size: 5,
    ScrollPosition: 6,
    AddStyleSheet: 7,
    AttachedStyleSheets: 8,
    MediaPlaybackState: 9,
    VisualViewport: 10,
};
const IncrementalSource = {
    Mutation: 0,
    MouseMove: 1,
    MouseInteraction: 2,
    Scroll: 3,
    ViewportResize: 4,
    Input: 5,
    TouchMove: 6,
    MediaInteraction: 7,
    StyleSheetRule: 8,
    // CanvasMutation : 9,
    // Font : 10,
};
const MouseInteractionType = {
    MouseUp: 0,
    MouseDown: 1,
    Click: 2,
    ContextMenu: 3,
    DblClick: 4,
    Focus: 5,
    Blur: 6,
    TouchStart: 7,
    TouchEnd: 9,
};
const MediaInteractionType = {
    Play: 0,
    Pause: 1,
};

/** Returns an InsertionCursor which starts positioned at the root of the document. */
function createRootInsertionCursor(nodeIds) {
    return createInsertionCursor(undefined, undefined, nodeIds);
}
function createInsertionCursor(parentId, nextSiblingId, nodeIds) {
    let cursor = {
        container: undefined,
        parentId,
        previousSiblingId: undefined,
        nextSiblingId,
    };
    const computeInsertionPoint = (nodeId) => {
        if (cursor.previousSiblingId === nodeId - 1) {
            // Use an AppendAfterPreviousInsertionPoint. (i.e., 0)
            return 0;
        }
        if (cursor.nextSiblingId !== undefined) {
            // Use an InsertBeforeInsertionPoint. We identify the next sibling using a
            // negative integer indicating the difference between the new node's id and its next
            // sibling's id.
            return cursor.nextSiblingId - nodeId;
        }
        if (cursor.parentId !== undefined) {
            // Use an AppendChildInsertionPoint. We identify the parent node using a positive
            // integer indicating the difference between the new node's id and its parent's id.
            return nodeId - cursor.parentId;
        }
        // There's no parent. Use a RootInsertionPoint. (i.e., null)
        return null;
    };
    return {
        advance(node) {
            const nodeId = nodeIds.getOrInsert(node);
            const insertionPoint = computeInsertionPoint(nodeId);
            cursor.previousSiblingId = nodeId;
            return { nodeId, insertionPoint };
        },
        ascend() {
            if (cursor.container) {
                cursor = cursor.container;
            }
        },
        descend() {
            if (cursor.previousSiblingId !== undefined) {
                cursor = {
                    container: cursor,
                    parentId: cursor.previousSiblingId,
                    previousSiblingId: undefined,
                    nextSiblingId: undefined,
                };
            }
        },
    };
}

/**
 * Get the element "value" to be serialized as an attribute or an input update record. It respects
 * the input privacy mode of the element.
 * PERFROMANCE OPTIMIZATION: Assumes that privacy level `HIDDEN` is never encountered because of earlier checks.
 */
function getElementInputValue(element, nodePrivacyLevel) {
    /*
     BROWSER SPEC NOTE: <input>, <select>
     For some <input> elements, the `value` is an exceptional property/attribute that has the
     value synced between el.value and el.getAttribute()
     input[type=button,checkbox,hidden,image,radio,reset,submit]
     */
    const tagName = element.tagName;
    const value = element.value;
    if (shouldMaskNode(element, nodePrivacyLevel)) {
        const type = element.type;
        if (tagName === 'INPUT' && (type === 'button' || type === 'submit' || type === 'reset')) {
            // Overrule `MASK` privacy level for button-like element values, as they are used during replay
            // to display their label. They can still be hidden via the "hidden" privacy attribute or class name.
            return value;
        }
        else if (!value || tagName === 'OPTION') {
            // <Option> value provides no benefit
            return;
        }
        return CENSORED_STRING_MARK;
    }
    if (tagName === 'OPTION' || tagName === 'SELECT') {
        return element.value;
    }
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
        return;
    }
    return value;
}
const URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")([^"]*)"|([^)]*))\)/gm;
const ABSOLUTE_URL = /^[A-Za-z]+:|^\/\//;
const DATA_URI = /^["']?data:.*,/i;
function switchToAbsoluteUrl(cssText, cssHref) {
    return cssText.replace(URL_IN_CSS_REF, (matchingSubstring, singleQuote, urlWrappedInSingleQuotes, doubleQuote, urlWrappedInDoubleQuotes, urlNotWrappedInQuotes) => {
        const url = urlWrappedInSingleQuotes || urlWrappedInDoubleQuotes || urlNotWrappedInQuotes;
        if (!cssHref || !url || ABSOLUTE_URL.test(url) || DATA_URI.test(url)) {
            return matchingSubstring;
        }
        const quote = singleQuote || doubleQuote || '';
        return `url(${quote}${makeUrlAbsolute(url, cssHref)}${quote})`;
    });
}
function makeUrlAbsolute(url, baseUrl) {
    try {
        return buildUrl(url, baseUrl).href;
    }
    catch (_a) {
        return url;
    }
}
const TAG_NAME_REGEX = /[^a-z1-6-_]/;
function getValidTagName(tagName) {
    const processedTagName = tagName.toLowerCase().trim();
    if (TAG_NAME_REGEX.test(processedTagName)) {
        // if the tag name is odd and we cannot extract
        // anything from the string, then we return a
        // generic div
        return 'div';
    }
    return processedTagName;
}
/**
 * Returns the tag name of the given element, normalized to ensure a consistent lowercase
 * representation regardless of whether the element is HTML, XHTML, or SVG.
 */
function normalizedTagName(element) {
    return element.tagName.toLowerCase();
}
function censoredImageForSize(width, height) {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' style='background-color:silver'%3E%3C/svg%3E`;
}

function serializeStyleSheets(cssStyleSheets, transaction) {
    if (cssStyleSheets === undefined || cssStyleSheets.length === 0) {
        return undefined;
    }
    const serializeStylesheet = (cssStyleSheet) => {
        const rules = cssStyleSheet.cssRules || cssStyleSheet.rules;
        const cssRules = Array.from(rules, (cssRule) => cssRule.cssText);
        transaction.addMetric('cssText', cssRules.reduce((totalLength, rule) => totalLength + rule.length, 0));
        const styleSheet = {
            cssRules,
            disabled: cssStyleSheet.disabled || undefined,
            media: cssStyleSheet.media.length > 0 ? Array.from(cssStyleSheet.media) : undefined,
        };
        return styleSheet;
    };
    // Safari iOS 16.x implements adoptedStyleSheets as a FrozenArray that:
    // - can't be iterated over through map or for...of
    // - can't be converted to regular array with Array.from
    // - can't be detected with Array.isArray or Object.isFrozen
    // Use index access to avoid the issue
    const styleSheets = [];
    for (let index = 0; index < cssStyleSheets.length; index++) {
        styleSheets.push(serializeStylesheet(cssStyleSheets[index]));
    }
    return styleSheets;
}

// TODO: temporarily bump the Session Replay limit to 1Mb for dataUrls
// This limit should be removed after [PANA-2843] is implemented
const MAX_ATTRIBUTE_VALUE_CHAR_LENGTH = 1000000;
function serializeAttribute(element, nodePrivacyLevel, attributeName, configuration) {
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        // dup condition for direct access case
        return null;
    }
    const attributeValue = element.getAttribute(attributeName);
    const tagName = element.tagName;
    if (shouldMaskAttribute(tagName, attributeName, attributeValue, nodePrivacyLevel, configuration)) {
        // mask image URLs
        if (tagName === 'IMG') {
            // generate image with similar dimension than the original to have the same rendering behaviour
            const image = element;
            if (image.naturalWidth > 0) {
                return censoredImageForSize(image.naturalWidth, image.naturalHeight);
            }
            const { width, height } = element.getBoundingClientRect();
            if (width > 0 || height > 0) {
                return censoredImageForSize(width, height);
            }
            // if we can't get the image size, fallback to the censored image
            return CENSORED_IMG_MARK;
        }
        if (tagName === 'SOURCE') {
            return CENSORED_IMG_MARK;
        }
        return CENSORED_STRING_MARK;
    }
    if (!attributeValue) {
        return attributeValue;
    }
    return sanitizeIfLongDataUrl(attributeValue, MAX_ATTRIBUTE_VALUE_CHAR_LENGTH);
}

function serializeAttributes(element, nodePrivacyLevel, transaction) {
    return {
        ...serializeDOMAttributes(element, nodePrivacyLevel, transaction),
        ...serializeVirtualAttributes(element, nodePrivacyLevel, transaction),
    };
}
function serializeDOMAttributes(element, nodePrivacyLevel, transaction) {
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return {};
    }
    const attrs = {};
    const tagName = normalizedTagName(element);
    for (let i = 0; i < element.attributes.length; i += 1) {
        const attribute = element.attributes.item(i);
        const attributeName = attribute.name;
        const attributeValue = serializeAttribute(element, nodePrivacyLevel, attributeName, transaction.scope.configuration);
        if (attributeValue !== null) {
            attrs[attributeName] = attributeValue;
        }
    }
    if (element.value &&
        (tagName === 'textarea' || tagName === 'select' || tagName === 'option' || tagName === 'input')) {
        const formValue = getElementInputValue(element, nodePrivacyLevel);
        if (formValue !== undefined) {
            attrs.value = formValue;
        }
    }
    /**
     * <Option> can be selected, which occurs if its `value` matches ancestor `<Select>.value`
     */
    if (tagName === 'option') {
        const optionElement = element;
        if (optionElement.selected && !shouldMaskNode(optionElement, nodePrivacyLevel)) {
            attrs.selected = '';
        }
        else {
            delete attrs.selected;
        }
    }
    /**
     * Forms: input[type=checkbox,radio]
     * The `checked` property for <input> is a little bit special:
     * 1. el.checked is a setter that returns if truthy.
     * 2. getAttribute returns the string value
     * getAttribute('checked') does not sync with `Element.checked`, so use JS property
     * NOTE: `checked` property exists on `HTMLInputElement`. For serializer assumptions, we check for type=radio|check.
     */
    const inputElement = element;
    if (tagName === 'input' && (inputElement.type === 'radio' || inputElement.type === 'checkbox')) {
        if (inputElement.checked && !shouldMaskNode(inputElement, nodePrivacyLevel)) {
            attrs.checked = '';
        }
        else {
            delete attrs.checked;
        }
    }
    return attrs;
}
function serializeVirtualAttributes(element, nodePrivacyLevel, transaction) {
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        return {};
    }
    const attrs = {};
    const doc = element.ownerDocument;
    const tagName = normalizedTagName(element);
    // remote css
    if (tagName === 'link') {
        const stylesheet = Array.from(doc.styleSheets).find((s) => s.href === element.href);
        const cssText = getCssRulesString(stylesheet);
        if (cssText && stylesheet) {
            transaction.addMetric('cssText', cssText.length);
            attrs._cssText = cssText;
        }
    }
    // dynamic stylesheet
    if (tagName === 'style' && element.sheet) {
        const cssText = getCssRulesString(element.sheet);
        if (cssText) {
            transaction.addMetric('cssText', cssText.length);
            attrs._cssText = cssText;
        }
    }
    /**
     * Serialize the media playback state
     */
    if (tagName === 'audio' || tagName === 'video') {
        const mediaElement = element;
        attrs.rr_mediaState = mediaElement.paused ? 'paused' : 'played';
    }
    /**
     * Serialize the scroll state for each element only for full snapshot
     */
    let scrollTop;
    let scrollLeft;
    switch (transaction.kind) {
        case 0 /* SerializationKind.INITIAL_FULL_SNAPSHOT */:
            scrollTop = Math.round(element.scrollTop);
            scrollLeft = Math.round(element.scrollLeft);
            if (scrollTop || scrollLeft) {
                transaction.scope.elementsScrollPositions.set(element, { scrollTop, scrollLeft });
            }
            break;
        case 1 /* SerializationKind.SUBSEQUENT_FULL_SNAPSHOT */:
            if (transaction.scope.elementsScrollPositions.has(element)) {
                ({ scrollTop, scrollLeft } = transaction.scope.elementsScrollPositions.get(element));
            }
            break;
    }
    if (scrollLeft) {
        attrs.rr_scrollLeft = scrollLeft;
    }
    if (scrollTop) {
        attrs.rr_scrollTop = scrollTop;
    }
    return attrs;
}
function getCssRulesString(cssStyleSheet) {
    if (!cssStyleSheet) {
        return null;
    }
    let rules;
    try {
        rules = cssStyleSheet.rules || cssStyleSheet.cssRules;
    }
    catch (_a) {
        // if css is protected by CORS we cannot access cssRules see: https://www.w3.org/TR/cssom-1/#the-cssstylesheet-interface
    }
    if (!rules) {
        return null;
    }
    const styleSheetCssText = Array.from(rules, isSafari() ? getCssRuleStringForSafari : getCssRuleString).join('');
    return switchToAbsoluteUrl(styleSheetCssText, cssStyleSheet.href);
}
function getCssRuleStringForSafari(rule) {
    // Safari does not escape attribute selectors containing : properly
    // https://bugs.webkit.org/show_bug.cgi?id=184604
    if (isCSSStyleRule(rule) && rule.selectorText.includes(':')) {
        // This regex replaces [foo:bar] by [foo\\:bar]
        const escapeColon = /(\[[\w-]+[^\\])(:[^\]]+\])/g;
        return rule.cssText.replace(escapeColon, '$1\\$2');
    }
    return getCssRuleString(rule);
}
function getCssRuleString(rule) {
    // If it's an @import rule, try to inline sub-rules recursively with `getCssRulesString`. This
    // operation can fail if the imported stylesheet is protected by CORS, in which case we fallback
    // to the @import rule CSS text.
    return (isCSSImportRule(rule) && getCssRulesString(rule.styleSheet)) || rule.cssText;
}
function isCSSImportRule(rule) {
    return 'styleSheet' in rule;
}
function isCSSStyleRule(rule) {
    return 'selectorText' in rule;
}

function serializeNode(node, parentNodePrivacyLevel, transaction) {
    switch (node.nodeType) {
        case node.DOCUMENT_NODE:
            return serializeDocumentNode(node, parentNodePrivacyLevel, transaction);
        case node.DOCUMENT_FRAGMENT_NODE:
            return serializeDocumentFragmentNode(node, parentNodePrivacyLevel, transaction);
        case node.DOCUMENT_TYPE_NODE:
            return serializeDocumentTypeNode(node, transaction);
        case node.ELEMENT_NODE:
            return serializeElementNode(node, parentNodePrivacyLevel, transaction);
        case node.TEXT_NODE:
            return serializeTextNode(node, parentNodePrivacyLevel, transaction);
        case node.CDATA_SECTION_NODE:
            return serializeCDataNode(node, transaction);
        default:
            return null;
    }
}
function serializeChildNodes(node, parentNodePrivacyLevel, transaction) {
    const result = [];
    forEachChildNodes(node, (childNode) => {
        const serializedChildNode = serializeNode(childNode, parentNodePrivacyLevel, transaction);
        if (serializedChildNode) {
            result.push(serializedChildNode);
        }
    });
    return result;
}
function serializeDocumentNode(document, parentNodePrivacyLevel, transaction) {
    return {
        type: NodeType.Document,
        id: transaction.assignId(document),
        childNodes: serializeChildNodes(document, parentNodePrivacyLevel, transaction),
        adoptedStyleSheets: serializeStyleSheets(document.adoptedStyleSheets, transaction),
    };
}
function serializeDocumentFragmentNode(element, parentNodePrivacyLevel, transaction) {
    const isShadowRoot = isNodeShadowRoot(element);
    if (isShadowRoot) {
        transaction.scope.shadowRootsController.addShadowRoot(element, transaction.scope);
    }
    return {
        type: NodeType.DocumentFragment,
        id: transaction.assignId(element),
        childNodes: serializeChildNodes(element, parentNodePrivacyLevel, transaction),
        isShadowRoot,
        adoptedStyleSheets: isShadowRoot ? serializeStyleSheets(element.adoptedStyleSheets, transaction) : undefined,
    };
}
function serializeDocumentTypeNode(documentType, transaction) {
    return {
        type: NodeType.DocumentType,
        id: transaction.assignId(documentType),
        name: documentType.name,
        publicId: documentType.publicId,
        systemId: documentType.systemId,
    };
}
/**
 * Serializing Element nodes involves capturing:
 * 1. HTML ATTRIBUTES:
 * 2. JS STATE:
 * - scroll offsets
 * - Form fields (input value, checkbox checked, option selection, range)
 * - Canvas state,
 * - Media (video/audio) play mode + currentTime
 * - iframe contents
 * - webcomponents
 * 3. CUSTOM PROPERTIES:
 * - height+width for when `hidden` to cover the element
 * 4. EXCLUDED INTERACTION STATE:
 * - focus (possible, but not worth perf impact)
 * - hover (tracked only via mouse activity)
 * - fullscreen mode
 */
function serializeElementNode(element, parentNodePrivacyLevel, transaction) {
    const tagName = getValidTagName(element.tagName);
    const isSVG = isSVGElement$1(element) || undefined;
    // For performance reason, we don't use getNodePrivacyLevel directly: we leverage the
    // parentNodePrivacyLevel option to avoid iterating over all parents
    const nodePrivacyLevel = reducePrivacyLevel(getNodeSelfPrivacyLevel(element), parentNodePrivacyLevel);
    if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
        const { width, height } = element.getBoundingClientRect();
        return {
            type: NodeType.Element,
            id: transaction.assignId(element),
            tagName,
            attributes: {
                rr_width: `${width}px`,
                rr_height: `${height}px`,
                [PRIVACY_ATTR_NAME]: PRIVACY_ATTR_VALUE_HIDDEN,
            },
            childNodes: [],
            isSVG,
        };
    }
    // Ignore Elements like Script and some Link, Metas
    if (nodePrivacyLevel === NodePrivacyLevel.IGNORE) {
        return null;
    }
    const id = transaction.assignId(element);
    const attributes = serializeAttributes(element, nodePrivacyLevel, transaction);
    let childNodes = [];
    if (hasChildNodes(element) &&
        // Do not serialize style children as the css rules are already in the _cssText attribute
        tagName !== 'style') {
        childNodes = serializeChildNodes(element, nodePrivacyLevel, transaction);
    }
    return {
        type: NodeType.Element,
        id,
        tagName,
        attributes,
        childNodes,
        isSVG,
    };
}
function isSVGElement$1(el) {
    return el.tagName === 'svg' || el instanceof SVGElement;
}
/**
 * Text Nodes are dependant on Element nodes
 * Privacy levels are set on elements so we check the parentElement of a text node
 * for privacy level.
 */
function serializeTextNode(textNode, parentNodePrivacyLevel, transaction) {
    const textContent = getTextContent(textNode, parentNodePrivacyLevel);
    if (textContent === undefined) {
        return null;
    }
    return {
        type: NodeType.Text,
        id: transaction.assignId(textNode),
        textContent,
    };
}
function serializeCDataNode(node, transaction) {
    return {
        type: NodeType.CDATA,
        id: transaction.assignId(node),
        textContent: '',
    };
}

function serializeDocument(document, transaction) {
    const defaultPrivacyLevel = transaction.scope.configuration.defaultPrivacyLevel;
    const serializedNode = serializeNode(document, defaultPrivacyLevel, transaction);
    // We are sure that Documents are never ignored, so this function never returns null
    return serializedNode;
}

function serializeNodeAsChange(cursor, node, parentPrivacyLevel, transaction) {
    let privacyLevel;
    const selfPrivacyLevel = getNodeSelfPrivacyLevel(node);
    if (selfPrivacyLevel) {
        privacyLevel = reducePrivacyLevel(selfPrivacyLevel, parentPrivacyLevel);
    }
    else {
        privacyLevel = parentPrivacyLevel;
    }
    if (privacyLevel === NodePrivacyLevel.HIDDEN) {
        serializeHiddenNodePlaceholder(cursor, node, transaction);
        return;
    }
    // Totally ignore risky or unwanted elements. (e.g. <script>, some <link> and <meta> elements)
    if (privacyLevel === NodePrivacyLevel.IGNORE) {
        return;
    }
    switch (node.nodeType) {
        case node.CDATA_SECTION_NODE:
            serializeCDataNodeAsChange(cursor, node, transaction);
            break;
        case node.DOCUMENT_NODE:
            serializeDocumentNodeAsChange(cursor, node, transaction);
            break;
        case node.DOCUMENT_FRAGMENT_NODE:
            serializeDocumentFragmentNodeAsChange(cursor, node, transaction);
            break;
        case node.DOCUMENT_TYPE_NODE:
            serializeDocumentTypeNodeAsChange(cursor, node, transaction);
            break;
        case node.ELEMENT_NODE:
            serializeElementNodeAsChange(cursor, node, privacyLevel, transaction);
            break;
        case node.TEXT_NODE:
            serializeTextNodeAsChange(cursor, node, privacyLevel, transaction);
            break;
        default:
            return;
    }
    // If this node can't have children, we're done.
    switch (node.nodeType) {
        case node.CDATA_SECTION_NODE:
        case node.DOCUMENT_TYPE_NODE:
        case node.TEXT_NODE:
            return;
    }
    // Ignore the children of <style> elements; the CSS rules they contain are already
    // serialized as StyleSheetSnapshots.
    if (node.nodeName === 'STYLE') {
        return;
    }
    cursor.descend();
    forEachChildNodes(node, (childNode) => {
        serializeNodeAsChange(cursor, childNode, privacyLevel, transaction);
    });
    cursor.ascend();
}
function serializeDocumentNodeAsChange(cursor, document, transaction) {
    const { nodeId, insertionPoint } = cursor.advance(document);
    transaction.addNode(insertionPoint, '#document');
    transaction.setScrollPosition(nodeId, getScrollX(), getScrollY());
    serializeStyleSheetsAsChange(document.adoptedStyleSheets, nodeId, transaction);
}
function serializeDocumentFragmentNodeAsChange(cursor, documentFragment, transaction) {
    const { nodeId, insertionPoint } = cursor.advance(documentFragment);
    const isShadowRoot = isNodeShadowRoot(documentFragment);
    if (!isShadowRoot) {
        transaction.addNode(insertionPoint, '#document-fragment');
        return;
    }
    transaction.addNode(insertionPoint, '#shadow-root');
    transaction.scope.shadowRootsController.addShadowRoot(documentFragment, transaction.scope);
    serializeStyleSheetsAsChange(documentFragment.adoptedStyleSheets, nodeId, transaction);
}
function serializeDocumentTypeNodeAsChange(cursor, documentType, transaction) {
    const { insertionPoint } = cursor.advance(documentType);
    transaction.addNode(insertionPoint, '#doctype', documentType.name, documentType.publicId, documentType.systemId);
}
function serializeElementNodeAsChange(cursor, element, privacyLevel, transaction) {
    const { nodeId, insertionPoint } = cursor.advance(element);
    const domAttributes = Object.entries(serializeDOMAttributes(element, privacyLevel, transaction));
    transaction.addNode(insertionPoint, encodedElementName(element), ...domAttributes);
    const { _cssText: cssText, rr_mediaState: mediaState, rr_scrollLeft: scrollLeft, rr_scrollTop: scrollTop, } = serializeVirtualAttributes(element, privacyLevel, transaction);
    const linkOrStyle = element;
    if (cssText !== undefined && linkOrStyle.sheet) {
        const sheetId = transaction.scope.styleSheetIds.getOrInsert(linkOrStyle.sheet);
        transaction.addStyleSheet(cssText);
        transaction.attachStyleSheets(nodeId, [sheetId]);
    }
    if (mediaState === 'played') {
        transaction.setMediaPlaybackState(nodeId, MediaInteractionType.Play);
    }
    else if (mediaState === 'paused') {
        transaction.setMediaPlaybackState(nodeId, MediaInteractionType.Pause);
    }
    if (scrollLeft !== undefined || scrollTop !== undefined) {
        transaction.setScrollPosition(nodeId, scrollLeft || 0, scrollTop || 0);
    }
}
function serializeTextNodeAsChange(cursor, textNode, privacyLevel, transaction) {
    const textContent = getTextContent(textNode, privacyLevel);
    if (textContent === undefined) {
        return;
    }
    const { insertionPoint } = cursor.advance(textNode);
    transaction.addNode(insertionPoint, '#text', textContent);
}
function serializeCDataNodeAsChange(cursor, cdataNode, transaction) {
    const { insertionPoint } = cursor.advance(cdataNode);
    transaction.addNode(insertionPoint, '#cdata-section');
}
function serializeHiddenNodePlaceholder(cursor, node, transaction) {
    // We only generate placeholders for element nodes; other hidden nodes are simply not
    // serialized.
    if (!isElementNode(node)) {
        return;
    }
    const { nodeId, insertionPoint } = cursor.advance(node);
    transaction.addNode(insertionPoint, encodedElementName(node), [PRIVACY_ATTR_NAME, PRIVACY_ATTR_VALUE_HIDDEN]);
    const { width, height } = node.getBoundingClientRect();
    transaction.setSize(nodeId, width, height);
}
function serializeStyleSheetsAsChange(sheets, nodeId, transaction) {
    if (!sheets || sheets.length === 0) {
        return undefined;
    }
    transaction.attachStyleSheets(nodeId, sheets.map((sheet) => serializeStyleSheetAsChange(sheet, transaction)));
}
function serializeStyleSheetAsChange(sheet, transaction) {
    const rules = Array.from(sheet.cssRules || sheet.rules, (rule) => rule.cssText);
    const mediaList = sheet.media.length > 0 ? Array.from(sheet.media) : undefined;
    transaction.addMetric('cssText', rules.reduce((totalLength, rule) => totalLength + rule.length, 0));
    transaction.addStyleSheet(rules, mediaList, sheet.disabled);
    return transaction.scope.styleSheetIds.getOrInsert(sheet);
}
function encodedElementName(element) {
    const nodeName = element.nodeName;
    if (isSVGElement(element)) {
        return `svg>${nodeName}`;
    }
    return nodeName;
}
function isSVGElement(element) {
    return element.namespaceURI === 'http://www.w3.org/2000/svg';
}

function createSerializationStats() {
    return {
        cssText: {
            count: 0,
            max: 0,
            sum: 0,
        },
        serializationDuration: {
            count: 0,
            max: 0,
            sum: 0,
        },
    };
}
function updateSerializationStats(stats, metric, value) {
    stats[metric].count += 1;
    stats[metric].max = Math.max(stats[metric].max, value);
    stats[metric].sum += value;
}
function aggregateSerializationStats(aggregateStats, stats) {
    for (const metric of ['cssText', 'serializationDuration']) {
        aggregateStats[metric].count += stats[metric].count;
        aggregateStats[metric].max = Math.max(aggregateStats[metric].max, stats[metric].max);
        aggregateStats[metric].sum += stats[metric].sum;
    }
}

function createChangeEncoder(stringIds) {
    let pendingChanges = {};
    // A helper that searches for strings in arbitrarily-nested arrays, inserts any strings
    // it finds into the string table, and replaces the strings with string table
    // references.
    const convertStringsToStringReferences = (array) => {
        for (let index = 0, length = array.length; index < length; index++) {
            const item = array[index];
            if (typeof item === 'string') {
                const previousSize = stringIds.size;
                array[index] = stringIds.getOrInsert(item);
                if (stringIds.size > previousSize) {
                    add(ChangeType.AddString, item);
                }
            }
            else if (Array.isArray(item)) {
                convertStringsToStringReferences(item);
            }
        }
    };
    const add = (type, data) => {
        if (!(type in pendingChanges)) {
            pendingChanges[type] = [type];
        }
        if (type !== ChangeType.AddString && Array.isArray(data)) {
            convertStringsToStringReferences(data);
        }
        pendingChanges[type].push(data);
    };
    const flush = () => {
        const changes = [];
        [
            ChangeType.AddString,
            ChangeType.AddNode,
            ChangeType.RemoveNode,
            ChangeType.Attribute,
            ChangeType.Text,
            ChangeType.Size,
            ChangeType.ScrollPosition,
            ChangeType.AddStyleSheet,
            ChangeType.AttachedStyleSheets,
            ChangeType.MediaPlaybackState,
            ChangeType.VisualViewport,
        ].forEach((changeType) => {
            const change = pendingChanges[changeType];
            if (change) {
                changes.push(change);
            }
        });
        pendingChanges = {};
        return changes;
    };
    return { add, flush };
}

/**
 * Perform serialization within a transaction. At the end of the transaction, the
 * generated records and statistics will be emitted.
 */
function serializeInTransaction(kind, emitRecord, emitStats, scope, serialize) {
    const records = [];
    const stats = createSerializationStats();
    const transaction = {
        add(record) {
            records.push(record);
        },
        addMetric(metric, value) {
            updateSerializationStats(stats, metric, value);
        },
        assignId(node) {
            const id = scope.nodeIds.getOrInsert(node);
            if (transaction.serializedNodeIds) {
                transaction.serializedNodeIds.add(id);
            }
            return id;
        },
        kind,
        scope,
    };
    const start = timeStampNow();
    serialize(transaction);
    updateSerializationStats(stats, 'serializationDuration', elapsed(start, timeStampNow()));
    for (const record of records) {
        emitRecord(record);
    }
    emitStats(stats);
}
function serializeChangesInTransaction(kind, emitRecord, emitStats, scope, timestamp, serialize) {
    const encoder = createChangeEncoder(scope.stringIds);
    const stats = createSerializationStats();
    const transaction = {
        addMetric(metric, value) {
            updateSerializationStats(stats, metric, value);
        },
        addNode(...change) {
            encoder.add(ChangeType.AddNode, change);
        },
        addStyleSheet(rules, mediaList, disabled) {
            if (disabled) {
                encoder.add(ChangeType.AddStyleSheet, [rules, mediaList || [], disabled]);
            }
            else if (mediaList) {
                encoder.add(ChangeType.AddStyleSheet, [rules, mediaList]);
            }
            else {
                encoder.add(ChangeType.AddStyleSheet, [rules]);
            }
        },
        attachStyleSheets(nodeId, sheetIds) {
            const change = [nodeId];
            for (const sheetId of sheetIds) {
                change.push(sheetId);
            }
            encoder.add(ChangeType.AttachedStyleSheets, change);
        },
        setMediaPlaybackState(nodeId, state) {
            encoder.add(ChangeType.MediaPlaybackState, [nodeId, state]);
        },
        setScrollPosition(nodeId, x, y) {
            encoder.add(ChangeType.ScrollPosition, [nodeId, x, y]);
        },
        setSize(nodeId, width, height) {
            encoder.add(ChangeType.Size, [nodeId, width, height]);
        },
        kind,
        scope,
    };
    const start = timeStampNow();
    serialize(transaction);
    updateSerializationStats(stats, 'serializationDuration', elapsed(start, timeStampNow()));
    const changes = encoder.flush();
    if (changes.length > 0) {
        emitRecord({
            data: changes,
            type: RecordType.Change,
            timestamp,
        });
    }
    emitStats(stats);
}

/**
 * Browsers have not standardized various dimension properties. Mobile devices typically report
 * dimensions in reference to the visual viewport, while desktop uses the layout viewport. For example,
 * Mobile Chrome will change innerWidth when a pinch zoom takes place, while Chrome Desktop (mac) will not.
 *
 * With the new Viewport API, we now calculate and normalize dimension properties to the layout viewport.
 * If the VisualViewport API is not supported by a browser, it isn't reasonably possible to detect or normalize
 * which viewport is being measured. Therefore these exported functions will fallback to assuming that the layout
 * viewport is being measured by the browser
 */
// Scrollbar widths vary across properties on different devices and browsers
const TOLERANCE = 25;
/**
 * Use the Visual Viewport API's properties to measure scrollX/Y in reference to the layout viewport
 * in order to determine if window.scrollX/Y is measuring the layout or visual viewport.
 * This finding corresponds to which viewport mouseEvent.clientX/Y and window.innerWidth/Height measures.
 */
function isVisualViewportFactoredIn(visualViewport) {
    return (Math.abs(visualViewport.pageTop - visualViewport.offsetTop - window.scrollY) > TOLERANCE ||
        Math.abs(visualViewport.pageLeft - visualViewport.offsetLeft - window.scrollX) > TOLERANCE);
}
const convertMouseEventToLayoutCoordinates = (clientX, clientY) => {
    const visualViewport = window.visualViewport;
    const normalized = {
        layoutViewportX: clientX,
        layoutViewportY: clientY,
        visualViewportX: clientX,
        visualViewportY: clientY,
    };
    if (!visualViewport) {
        // On old browsers, we cannot normalize, so fallback to clientX/Y
        return normalized;
    }
    else if (isVisualViewportFactoredIn(visualViewport)) {
        // Typically Mobile Devices
        normalized.layoutViewportX = Math.round(clientX + visualViewport.offsetLeft);
        normalized.layoutViewportY = Math.round(clientY + visualViewport.offsetTop);
    }
    else {
        // Typically Desktop Devices
        normalized.visualViewportX = Math.round(clientX - visualViewport.offsetLeft);
        normalized.visualViewportY = Math.round(clientY - visualViewport.offsetTop);
    }
    return normalized;
};
const getVisualViewport = (visualViewport) => ({
    scale: visualViewport.scale,
    offsetLeft: visualViewport.offsetLeft,
    offsetTop: visualViewport.offsetTop,
    pageLeft: visualViewport.pageLeft,
    pageTop: visualViewport.pageTop,
    height: visualViewport.height,
    width: visualViewport.width,
});

function startFullSnapshots(lifeCycle, emitRecord, emitStats, flushMutations, scope) {
    takeFullSnapshot(timeStampNow(), 0 /* SerializationKind.INITIAL_FULL_SNAPSHOT */, emitRecord, emitStats, scope);
    const { unsubscribe } = lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, (view) => {
        flushMutations();
        takeFullSnapshot(view.startClocks.timeStamp, 1 /* SerializationKind.SUBSEQUENT_FULL_SNAPSHOT */, emitRecord, emitStats, scope);
    });
    return {
        stop: unsubscribe,
    };
}
function takeFullSnapshot(timestamp, kind, emitRecord, emitStats, scope) {
    const { width, height } = getViewportDimension();
    emitRecord({
        data: {
            height,
            href: window.location.href,
            width,
        },
        type: RecordType.Meta,
        timestamp,
    });
    emitRecord({
        data: {
            has_focus: document.hasFocus(),
        },
        type: RecordType.Focus,
        timestamp,
    });
    if (isExperimentalFeatureEnabled(ExperimentalFeature.USE_CHANGE_RECORDS)) {
        if (kind === 1 /* SerializationKind.SUBSEQUENT_FULL_SNAPSHOT */) {
            scope.resetIds();
        }
        serializeChangesInTransaction(kind, emitRecord, emitStats, scope, timestamp, (transaction) => {
            serializeNodeAsChange(createRootInsertionCursor(scope.nodeIds), document, scope.configuration.defaultPrivacyLevel, transaction);
        });
    }
    else {
        serializeInTransaction(kind, emitRecord, emitStats, scope, (transaction) => {
            transaction.add(serializeFullSnapshotRecord(timestamp, transaction));
        });
    }
    if (window.visualViewport) {
        emitRecord({
            data: getVisualViewport(window.visualViewport),
            type: RecordType.VisualViewport,
            timestamp,
        });
    }
}
function serializeFullSnapshotRecord(timestamp, transaction) {
    return {
        data: {
            node: serializeDocument(document, transaction),
            initialOffset: {
                left: getScrollX(),
                top: getScrollY(),
            },
        },
        type: RecordType.FullSnapshot,
        timestamp,
    };
}

function createEventIds() {
    return createWeakIdMap(1 /* EventIdConstants.FIRST_ID */);
}
function createNodeIds() {
    return createWeakIdMap(0 /* NodeIdConstants.FIRST_ID */);
}
function createStringIds() {
    return createIdMap(0 /* StringIdConstants.FIRST_ID */);
}
function createStyleSheetIds() {
    return createWeakIdMap(0 /* StyleSheetIdConstants.FIRST_ID */);
}
function createIdMap(firstId) {
    return createItemIds(() => new Map(), firstId);
}
function createWeakIdMap(firstId) {
    return createItemIds(() => new WeakMap(), firstId);
}
function createItemIds(createMap, firstId) {
    let map = createMap();
    let nextId = firstId;
    const get = (object) => map.get(object);
    return {
        clear() {
            map = createMap();
            nextId = firstId;
        },
        get,
        getOrInsert(object) {
            // Try to reuse any existing id.
            let id = get(object);
            if (id === undefined) {
                id = nextId++;
                map.set(object, id);
            }
            return id;
        },
        get size() {
            return nextId - firstId;
        },
    };
}

function createRecordingScope(configuration, elementsScrollPositions, shadowRootsController) {
    const eventIds = createEventIds();
    const nodeIds = createNodeIds();
    const stringIds = createStringIds();
    const styleSheetIds = createStyleSheetIds();
    return {
        resetIds() {
            eventIds.clear();
            nodeIds.clear();
            stringIds.clear();
            styleSheetIds.clear();
        },
        configuration,
        elementsScrollPositions,
        eventIds,
        nodeIds,
        shadowRootsController,
        stringIds,
        styleSheetIds,
    };
}

function createElementsScrollPositions() {
    const scrollPositionsByElement = new WeakMap();
    return {
        set(element, scrollPositions) {
            if (element === document && !document.scrollingElement) {
                // cf https://drafts.csswg.org/cssom-view/#dom-document-scrollingelement,
                // in some cases scrolling elements can not be defined, we don't support those for now
                return;
            }
            scrollPositionsByElement.set(element === document ? document.scrollingElement : element, scrollPositions);
        },
        get(element) {
            return scrollPositionsByElement.get(element);
        },
        has(element) {
            return scrollPositionsByElement.has(element);
        },
    };
}

function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
function getEventTarget(event) {
    if (event.composed === true && isNodeShadowHost(event.target)) {
        return event.composedPath()[0];
    }
    return event.target;
}

function assembleIncrementalSnapshot(source, data) {
    return {
        data: {
            source,
            ...data,
        },
        type: RecordType.IncrementalSnapshot,
        timestamp: timeStampNow(),
    };
}

const MOUSE_MOVE_OBSERVER_THRESHOLD = 50;
function trackMove(emitRecord, scope) {
    const { throttled: updatePosition, cancel: cancelThrottle } = throttle((event) => {
        const target = getEventTarget(event);
        const id = scope.nodeIds.get(target);
        if (id === undefined) {
            return;
        }
        const coordinates = tryToComputeCoordinates(event);
        if (!coordinates) {
            return;
        }
        const position = {
            id,
            timeOffset: 0,
            x: coordinates.x,
            y: coordinates.y,
        };
        emitRecord(assembleIncrementalSnapshot(isTouchEvent(event) ? IncrementalSource.TouchMove : IncrementalSource.MouseMove, { positions: [position] }));
    }, MOUSE_MOVE_OBSERVER_THRESHOLD, {
        trailing: false,
    });
    const { stop: removeListener } = addEventListeners(scope.configuration, document, ["mousemove" /* DOM_EVENT.MOUSE_MOVE */, "touchmove" /* DOM_EVENT.TOUCH_MOVE */], updatePosition, {
        capture: true,
        passive: true,
    });
    return {
        stop: () => {
            removeListener();
            cancelThrottle();
        },
    };
}
function tryToComputeCoordinates(event) {
    let { clientX: x, clientY: y } = isTouchEvent(event) ? event.changedTouches[0] : event;
    if (window.visualViewport) {
        const { visualViewportX, visualViewportY } = convertMouseEventToLayoutCoordinates(x, y);
        x = visualViewportX;
        y = visualViewportY;
    }
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return undefined;
    }
    return { x, y };
}

const eventTypeToMouseInteraction = {
    // Listen for pointerup DOM events instead of mouseup for MouseInteraction/MouseUp records. This
    // allows to reference such records from Frustration records.
    //
    // In the context of supporting Mobile Session Replay, we introduced `PointerInteraction` records
    // used by the Mobile SDKs in place of `MouseInteraction`. In the future, we should replace
    // `MouseInteraction` by `PointerInteraction` in the Browser SDK so we have an uniform way to
    // convey such interaction. This would cleanly solve the issue since we would have
    // `PointerInteraction/Up` records that we could reference from `Frustration` records.
    ["pointerup" /* DOM_EVENT.POINTER_UP */]: MouseInteractionType.MouseUp,
    ["mousedown" /* DOM_EVENT.MOUSE_DOWN */]: MouseInteractionType.MouseDown,
    ["click" /* DOM_EVENT.CLICK */]: MouseInteractionType.Click,
    ["contextmenu" /* DOM_EVENT.CONTEXT_MENU */]: MouseInteractionType.ContextMenu,
    ["dblclick" /* DOM_EVENT.DBL_CLICK */]: MouseInteractionType.DblClick,
    ["focus" /* DOM_EVENT.FOCUS */]: MouseInteractionType.Focus,
    ["blur" /* DOM_EVENT.BLUR */]: MouseInteractionType.Blur,
    ["touchstart" /* DOM_EVENT.TOUCH_START */]: MouseInteractionType.TouchStart,
    ["touchend" /* DOM_EVENT.TOUCH_END */]: MouseInteractionType.TouchEnd,
};
function trackMouseInteraction(emitRecord, scope) {
    const handler = (event) => {
        const target = getEventTarget(event);
        const id = scope.nodeIds.get(target);
        if (id === undefined ||
            getNodePrivacyLevel(target, scope.configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN) {
            return;
        }
        const type = eventTypeToMouseInteraction[event.type];
        let interaction;
        if (type !== MouseInteractionType.Blur && type !== MouseInteractionType.Focus) {
            const coordinates = tryToComputeCoordinates(event);
            if (!coordinates) {
                return;
            }
            interaction = { id, type, x: coordinates.x, y: coordinates.y };
        }
        else {
            interaction = { id, type };
        }
        emitRecord({
            id: scope.eventIds.getOrInsert(event),
            ...assembleIncrementalSnapshot(IncrementalSource.MouseInteraction, interaction),
        });
    };
    return addEventListeners(scope.configuration, document, Object.keys(eventTypeToMouseInteraction), handler, {
        capture: true,
        passive: true,
    });
}

const SCROLL_OBSERVER_THRESHOLD = 100;
function trackScroll(target, emitRecord, scope) {
    const { throttled: updatePosition, cancel: cancelThrottle } = throttle((event) => {
        const target = getEventTarget(event);
        if (!target) {
            return;
        }
        const id = scope.nodeIds.get(target);
        if (id === undefined ||
            getNodePrivacyLevel(target, scope.configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN) {
            return;
        }
        const scrollPositions = target === document
            ? {
                scrollTop: getScrollY(),
                scrollLeft: getScrollX(),
            }
            : {
                scrollTop: Math.round(target.scrollTop),
                scrollLeft: Math.round(target.scrollLeft),
            };
        scope.elementsScrollPositions.set(target, scrollPositions);
        emitRecord(assembleIncrementalSnapshot(IncrementalSource.Scroll, {
            id,
            x: scrollPositions.scrollLeft,
            y: scrollPositions.scrollTop,
        }));
    }, SCROLL_OBSERVER_THRESHOLD);
    const { stop: removeListener } = addEventListener(scope.configuration, target, "scroll" /* DOM_EVENT.SCROLL */, updatePosition, {
        capture: true,
        passive: true,
    });
    return {
        stop: () => {
            removeListener();
            cancelThrottle();
        },
    };
}

const VISUAL_VIEWPORT_OBSERVER_THRESHOLD = 200;
function trackViewportResize(emitRecord, scope) {
    const viewportResizeSubscription = initViewportObservable(scope.configuration).subscribe((data) => {
        emitRecord(assembleIncrementalSnapshot(IncrementalSource.ViewportResize, data));
    });
    return {
        stop: () => {
            viewportResizeSubscription.unsubscribe();
        },
    };
}
function trackVisualViewportResize(emitRecord, scope) {
    const visualViewport = window.visualViewport;
    if (!visualViewport) {
        return { stop: noop };
    }
    const { throttled: updateDimension, cancel: cancelThrottle } = throttle(() => {
        emitRecord({
            data: getVisualViewport(visualViewport),
            type: RecordType.VisualViewport,
            timestamp: timeStampNow(),
        });
    }, VISUAL_VIEWPORT_OBSERVER_THRESHOLD, {
        trailing: false,
    });
    const { stop: removeListener } = addEventListeners(scope.configuration, visualViewport, ["resize" /* DOM_EVENT.RESIZE */, "scroll" /* DOM_EVENT.SCROLL */], updateDimension, {
        capture: true,
        passive: true,
    });
    return {
        stop: () => {
            removeListener();
            cancelThrottle();
        },
    };
}

function trackMediaInteraction(emitRecord, scope) {
    return addEventListeners(scope.configuration, document, ["play" /* DOM_EVENT.PLAY */, "pause" /* DOM_EVENT.PAUSE */], (event) => {
        const target = getEventTarget(event);
        if (!target) {
            return;
        }
        const id = scope.nodeIds.get(target);
        if (id === undefined ||
            getNodePrivacyLevel(target, scope.configuration.defaultPrivacyLevel) === NodePrivacyLevel.HIDDEN) {
            return;
        }
        emitRecord(assembleIncrementalSnapshot(IncrementalSource.MediaInteraction, {
            id,
            type: event.type === "play" /* DOM_EVENT.PLAY */ ? MediaInteractionType.Play : MediaInteractionType.Pause,
        }));
    }, {
        capture: true,
        passive: true,
    });
}

function trackStyleSheet(emitRecord, scope) {
    function checkStyleSheetAndCallback(styleSheet, callback) {
        if (!styleSheet || !styleSheet.ownerNode) {
            return;
        }
        const id = scope.nodeIds.get(styleSheet.ownerNode);
        if (id === undefined) {
            return;
        }
        callback(id);
    }
    const instrumentationStoppers = [
        instrumentMethod(CSSStyleSheet.prototype, 'insertRule', ({ target: styleSheet, parameters: [rule, index] }) => {
            checkStyleSheetAndCallback(styleSheet, (id) => emitRecord(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                id,
                adds: [{ rule, index }],
            })));
        }),
        instrumentMethod(CSSStyleSheet.prototype, 'deleteRule', ({ target: styleSheet, parameters: [index] }) => {
            checkStyleSheetAndCallback(styleSheet, (id) => emitRecord(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                id,
                removes: [{ index }],
            })));
        }),
    ];
    if (typeof CSSGroupingRule !== 'undefined') {
        instrumentGroupingCSSRuleClass(CSSGroupingRule);
    }
    else {
        instrumentGroupingCSSRuleClass(CSSMediaRule);
        instrumentGroupingCSSRuleClass(CSSSupportsRule);
    }
    function instrumentGroupingCSSRuleClass(cls) {
        instrumentationStoppers.push(instrumentMethod(cls.prototype, 'insertRule', ({ target: styleSheet, parameters: [rule, index] }) => {
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, (id) => {
                const path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index || 0);
                    emitRecord(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                        id,
                        adds: [{ rule, index: path }],
                    }));
                }
            });
        }), instrumentMethod(cls.prototype, 'deleteRule', ({ target: styleSheet, parameters: [index] }) => {
            checkStyleSheetAndCallback(styleSheet.parentStyleSheet, (id) => {
                const path = getPathToNestedCSSRule(styleSheet);
                if (path) {
                    path.push(index);
                    emitRecord(assembleIncrementalSnapshot(IncrementalSource.StyleSheetRule, {
                        id,
                        removes: [{ index: path }],
                    }));
                }
            });
        }));
    }
    return {
        stop: () => {
            instrumentationStoppers.forEach((stopper) => stopper.stop());
        },
    };
}
function getPathToNestedCSSRule(rule) {
    const path = [];
    let currentRule = rule;
    while (currentRule.parentRule) {
        const rules = Array.from(currentRule.parentRule.cssRules);
        const index = rules.indexOf(currentRule);
        path.unshift(index);
        currentRule = currentRule.parentRule;
    }
    // A rule may not be attached to a stylesheet
    if (!currentRule.parentStyleSheet) {
        return;
    }
    const rules = Array.from(currentRule.parentStyleSheet.cssRules);
    const index = rules.indexOf(currentRule);
    path.unshift(index);
    return path;
}

function trackFocus(emitRecord, scope) {
    return addEventListeners(scope.configuration, window, ["focus" /* DOM_EVENT.FOCUS */, "blur" /* DOM_EVENT.BLUR */], () => {
        emitRecord({
            data: { has_focus: document.hasFocus() },
            type: RecordType.Focus,
            timestamp: timeStampNow(),
        });
    });
}

function trackFrustration(lifeCycle, emitRecord, scope) {
    const frustrationSubscription = lifeCycle.subscribe(12 /* LifeCycleEventType.RAW_RUM_EVENT_COLLECTED */, (data) => {
        var _a, _b;
        if (data.rawRumEvent.type === RumEventType.ACTION &&
            data.rawRumEvent.action.type === ActionType.CLICK &&
            ((_b = (_a = data.rawRumEvent.action.frustration) === null || _a === void 0 ? void 0 : _a.type) === null || _b === void 0 ? void 0 : _b.length) &&
            'events' in data.domainContext &&
            data.domainContext.events &&
            data.domainContext.events.length) {
            emitRecord({
                timestamp: data.rawRumEvent.date,
                type: RecordType.FrustrationRecord,
                data: {
                    frustrationTypes: data.rawRumEvent.action.frustration.type,
                    recordIds: data.domainContext.events.map((e) => scope.eventIds.getOrInsert(e)),
                },
            });
        }
    });
    return {
        stop: () => {
            frustrationSubscription.unsubscribe();
        },
    };
}

function trackViewEnd(lifeCycle, emitRecord, flushMutations) {
    const viewEndSubscription = lifeCycle.subscribe(5 /* LifeCycleEventType.VIEW_ENDED */, () => {
        flushMutations();
        emitRecord({
            timestamp: timeStampNow(),
            type: RecordType.ViewEnd,
        });
    });
    return {
        stop: () => {
            viewEndSubscription.unsubscribe();
        },
    };
}

function trackInput(target, emitRecord, scope) {
    const defaultPrivacyLevel = scope.configuration.defaultPrivacyLevel;
    const lastInputStateMap = new WeakMap();
    const isShadowRoot = target !== document;
    const { stop: stopEventListeners } = addEventListeners(scope.configuration, target, 
    // The 'input' event bubbles across shadow roots, so we don't have to listen for it on shadow
    // roots since it will be handled by the event listener that we did add to the document. Only
    // the 'change' event is blocked and needs to be handled on shadow roots.
    isShadowRoot ? ["change" /* DOM_EVENT.CHANGE */] : ["input" /* DOM_EVENT.INPUT */, "change" /* DOM_EVENT.CHANGE */], (event) => {
        const target = getEventTarget(event);
        if (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target instanceof HTMLSelectElement) {
            onElementChange(target);
        }
    }, {
        capture: true,
        passive: true,
    });
    let stopPropertySetterInstrumentation;
    if (!isShadowRoot) {
        const instrumentationStoppers = [
            instrumentSetter(HTMLInputElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLInputElement.prototype, 'checked', onElementChange),
            instrumentSetter(HTMLSelectElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLTextAreaElement.prototype, 'value', onElementChange),
            instrumentSetter(HTMLSelectElement.prototype, 'selectedIndex', onElementChange),
        ];
        stopPropertySetterInstrumentation = () => {
            instrumentationStoppers.forEach((stopper) => stopper.stop());
        };
    }
    else {
        stopPropertySetterInstrumentation = noop;
    }
    return {
        stop: () => {
            stopPropertySetterInstrumentation();
            stopEventListeners();
        },
    };
    function onElementChange(target) {
        const nodePrivacyLevel = getNodePrivacyLevel(target, defaultPrivacyLevel);
        if (nodePrivacyLevel === NodePrivacyLevel.HIDDEN) {
            return;
        }
        const type = target.type;
        let inputState;
        if (type === 'radio' || type === 'checkbox') {
            if (shouldMaskNode(target, nodePrivacyLevel)) {
                return;
            }
            inputState = { isChecked: target.checked };
        }
        else {
            const value = getElementInputValue(target, nodePrivacyLevel);
            if (value === undefined) {
                return;
            }
            inputState = { text: value };
        }
        // Can be multiple changes on the same node within the same batched mutation observation.
        createRecordIfStateChanged(target, inputState);
        // If a radio was checked, other radios with the same name attribute will be unchecked.
        const name = target.name;
        if (type === 'radio' && name && target.checked) {
            document.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`).forEach((el) => {
                if (el !== target) {
                    // TODO: Consider the privacy implications for various differing input privacy levels
                    createRecordIfStateChanged(el, { isChecked: false });
                }
            });
        }
    }
    /**
     * There can be multiple changes on the same node within the same batched mutation observation.
     */
    function createRecordIfStateChanged(target, inputState) {
        const id = scope.nodeIds.get(target);
        if (id === undefined) {
            return;
        }
        const lastInputState = lastInputStateMap.get(target);
        if (!lastInputState ||
            lastInputState.text !== inputState.text ||
            lastInputState.isChecked !== inputState.isChecked) {
            lastInputStateMap.set(target, inputState);
            emitRecord(assembleIncrementalSnapshot(IncrementalSource.Input, {
                id,
                ...inputState,
            }));
        }
    }
}

/**
 * Maximum duration to wait before processing mutations. If the browser is idle, mutations will be
 * processed more quickly. If the browser is busy executing small tasks (ex: rendering frames), the
 * mutations will wait MUTATION_PROCESS_MAX_DELAY milliseconds before being processed. If the
 * browser is busy executing a longer task, mutations will be processed after this task.
 */
const MUTATION_PROCESS_MAX_DELAY = 100;
/**
 * Minimum duration to wait before processing mutations. This is used to batch mutations together
 * and be able to deduplicate them to save processing time and bandwidth.
 * 16ms is the duration of a frame at 60fps that ensure fluid UI.
 */
const MUTATION_PROCESS_MIN_DELAY = 16;
function createMutationBatch(processMutationBatch) {
    let cancelScheduledFlush = noop;
    let pendingMutations = [];
    function flush() {
        cancelScheduledFlush();
        processMutationBatch(pendingMutations);
        pendingMutations = [];
    }
    const { throttled: throttledFlush, cancel: cancelThrottle } = throttle(flush, MUTATION_PROCESS_MIN_DELAY, {
        leading: false,
    });
    return {
        addMutations: (mutations) => {
            if (pendingMutations.length === 0) {
                cancelScheduledFlush = requestIdleCallback(throttledFlush, { timeout: MUTATION_PROCESS_MAX_DELAY });
            }
            pendingMutations.push(...mutations);
        },
        flush,
        stop: () => {
            cancelScheduledFlush();
            cancelThrottle();
        },
    };
}

/**
 * Buffers and aggregate mutations generated by a MutationObserver into MutationPayload
 */
function trackMutation(target, emitRecord, emitStats, scope) {
    const MutationObserver = getMutationObserverConstructor();
    if (!MutationObserver) {
        return { stop: noop, flush: noop };
    }
    const mutationBatch = createMutationBatch((mutations) => {
        serializeInTransaction(2 /* SerializationKind.INCREMENTAL_SNAPSHOT */, emitRecord, emitStats, scope, (transaction) => processMutations(mutations.concat(observer.takeRecords()), transaction));
    });
    const observer = new MutationObserver(monitor(mutationBatch.addMutations));
    observer.observe(target, {
        attributeOldValue: true,
        attributes: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return {
        stop: () => {
            observer.disconnect();
            mutationBatch.stop();
        },
        flush: () => {
            mutationBatch.flush();
        },
    };
}
function processMutations(mutations, transaction) {
    const nodePrivacyLevelCache = new Map();
    mutations
        .filter((mutation) => mutation.type === 'childList')
        .forEach((mutation) => {
        mutation.removedNodes.forEach((removedNode) => {
            traverseRemovedShadowDom(removedNode, transaction.scope.shadowRootsController.removeShadowRoot);
        });
    });
    // Discard any mutation with a 'target' node that:
    // * isn't injected in the current document or isn't known/serialized yet: those nodes are likely
    // part of a mutation occurring in a parent Node
    // * should be hidden or ignored
    const filteredMutations = mutations.filter((mutation) => mutation.target.isConnected &&
        idsAreAssignedForNodeAndAncestors(mutation.target, transaction.scope.nodeIds) &&
        getNodePrivacyLevel(mutation.target, transaction.scope.configuration.defaultPrivacyLevel, nodePrivacyLevelCache) !== NodePrivacyLevel.HIDDEN);
    const { adds, removes, hasBeenSerialized } = processChildListMutations(filteredMutations.filter((mutation) => mutation.type === 'childList'), nodePrivacyLevelCache, transaction);
    const texts = processCharacterDataMutations(filteredMutations.filter((mutation) => mutation.type === 'characterData' && !hasBeenSerialized(mutation.target)), nodePrivacyLevelCache, transaction);
    const attributes = processAttributesMutations(filteredMutations.filter((mutation) => mutation.type === 'attributes' && !hasBeenSerialized(mutation.target)), nodePrivacyLevelCache, transaction);
    if (!texts.length && !attributes.length && !removes.length && !adds.length) {
        return;
    }
    transaction.add(assembleIncrementalSnapshot(IncrementalSource.Mutation, {
        adds,
        removes,
        texts,
        attributes,
    }));
}
function processChildListMutations(mutations, nodePrivacyLevelCache, transaction) {
    // First, we iterate over mutations to collect:
    //
    // * nodes that have been added in the document and not removed by a subsequent mutation
    // * nodes that have been removed from the document but were not added in a previous mutation
    //
    // For this second category, we also collect their previous parent (mutation.target) because we'll
    // need it to emit a 'remove' mutation.
    //
    // Those two categories may overlap: if a node moved from a position to another, it is reported as
    // two mutation records, one with a "removedNodes" and the other with "addedNodes". In this case,
    // the node will be in both sets.
    const addedAndMovedNodes = new Set();
    const removedNodes = new Map();
    for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
            addedAndMovedNodes.add(node);
        });
        mutation.removedNodes.forEach((node) => {
            if (!addedAndMovedNodes.has(node)) {
                removedNodes.set(node, mutation.target);
            }
            addedAndMovedNodes.delete(node);
        });
    }
    // Then, we sort nodes that are still in the document by topological order, for two reasons:
    //
    // * We will serialize each added nodes with their descendants. We don't want to serialize a node
    // twice, so we need to iterate over the parent nodes first and skip any node that is contained in
    // a precedent node.
    //
    // * To emit "add" mutations, we need references to the parent and potential next sibling of each
    // added node. So we need to iterate over the parent nodes first, and when multiple nodes are
    // siblings, we want to iterate from last to first. This will ensure that any "next" node is
    // already serialized and have an id.
    const sortedAddedAndMovedNodes = Array.from(addedAndMovedNodes);
    sortAddedAndMovedNodes(sortedAddedAndMovedNodes);
    // Then, we iterate over our sorted node sets to emit mutations. We collect the newly serialized
    // node ids in a set to be able to skip subsequent related mutations.
    transaction.serializedNodeIds = new Set();
    const addedNodeMutations = [];
    for (const node of sortedAddedAndMovedNodes) {
        if (hasBeenSerialized(node)) {
            continue;
        }
        const parentNodePrivacyLevel = getNodePrivacyLevel(node.parentNode, transaction.scope.configuration.defaultPrivacyLevel, nodePrivacyLevelCache);
        if (parentNodePrivacyLevel === NodePrivacyLevel.HIDDEN || parentNodePrivacyLevel === NodePrivacyLevel.IGNORE) {
            continue;
        }
        const serializedNode = serializeNode(node, parentNodePrivacyLevel, transaction);
        if (!serializedNode) {
            continue;
        }
        const parentNode = getParentNode(node);
        addedNodeMutations.push({
            nextId: getNextSibling(node),
            parentId: transaction.scope.nodeIds.get(parentNode),
            node: serializedNode,
        });
    }
    // Finally, we emit remove mutations.
    const removedNodeMutations = [];
    removedNodes.forEach((parent, node) => {
        const parentId = transaction.scope.nodeIds.get(parent);
        const id = transaction.scope.nodeIds.get(node);
        if (parentId !== undefined && id !== undefined) {
            removedNodeMutations.push({ parentId, id });
        }
    });
    return { adds: addedNodeMutations, removes: removedNodeMutations, hasBeenSerialized };
    function hasBeenSerialized(node) {
        var _a;
        const id = transaction.scope.nodeIds.get(node);
        return id !== undefined && ((_a = transaction.serializedNodeIds) === null || _a === void 0 ? void 0 : _a.has(id));
    }
    function getNextSibling(node) {
        let nextSibling = node.nextSibling;
        while (nextSibling) {
            const id = transaction.scope.nodeIds.get(nextSibling);
            if (id !== undefined) {
                return id;
            }
            nextSibling = nextSibling.nextSibling;
        }
        return null;
    }
}
function processCharacterDataMutations(mutations, nodePrivacyLevelCache, transaction) {
    var _a;
    const textMutations = [];
    // Deduplicate mutations based on their target node
    const handledNodes = new Set();
    const filteredMutations = mutations.filter((mutation) => {
        if (handledNodes.has(mutation.target)) {
            return false;
        }
        handledNodes.add(mutation.target);
        return true;
    });
    // Emit mutations
    for (const mutation of filteredMutations) {
        const value = mutation.target.textContent;
        if (value === mutation.oldValue) {
            continue;
        }
        const id = transaction.scope.nodeIds.get(mutation.target);
        if (id === undefined) {
            continue;
        }
        const parentNodePrivacyLevel = getNodePrivacyLevel(getParentNode(mutation.target), transaction.scope.configuration.defaultPrivacyLevel, nodePrivacyLevelCache);
        if (parentNodePrivacyLevel === NodePrivacyLevel.HIDDEN || parentNodePrivacyLevel === NodePrivacyLevel.IGNORE) {
            continue;
        }
        textMutations.push({
            id,
            value: (_a = getTextContent(mutation.target, parentNodePrivacyLevel)) !== null && _a !== void 0 ? _a : null,
        });
    }
    return textMutations;
}
function processAttributesMutations(mutations, nodePrivacyLevelCache, transaction) {
    const attributeMutations = [];
    // Deduplicate mutations based on their target node and changed attribute
    const handledElements = new Map();
    const filteredMutations = mutations.filter((mutation) => {
        const handledAttributes = handledElements.get(mutation.target);
        if (handledAttributes && handledAttributes.has(mutation.attributeName)) {
            return false;
        }
        if (!handledAttributes) {
            handledElements.set(mutation.target, new Set([mutation.attributeName]));
        }
        else {
            handledAttributes.add(mutation.attributeName);
        }
        return true;
    });
    // Emit mutations
    const emittedMutations = new Map();
    for (const mutation of filteredMutations) {
        const uncensoredValue = mutation.target.getAttribute(mutation.attributeName);
        if (uncensoredValue === mutation.oldValue) {
            continue;
        }
        const id = transaction.scope.nodeIds.get(mutation.target);
        if (id === undefined) {
            continue;
        }
        const privacyLevel = getNodePrivacyLevel(mutation.target, transaction.scope.configuration.defaultPrivacyLevel, nodePrivacyLevelCache);
        const attributeValue = serializeAttribute(mutation.target, privacyLevel, mutation.attributeName, transaction.scope.configuration);
        let transformedValue;
        if (mutation.attributeName === 'value') {
            const inputValue = getElementInputValue(mutation.target, privacyLevel);
            if (inputValue === undefined) {
                continue;
            }
            transformedValue = inputValue;
        }
        else if (typeof attributeValue === 'string') {
            transformedValue = attributeValue;
        }
        else {
            transformedValue = null;
        }
        let emittedMutation = emittedMutations.get(mutation.target);
        if (!emittedMutation) {
            emittedMutation = { id, attributes: {} };
            attributeMutations.push(emittedMutation);
            emittedMutations.set(mutation.target, emittedMutation);
        }
        emittedMutation.attributes[mutation.attributeName] = transformedValue;
    }
    return attributeMutations;
}
function sortAddedAndMovedNodes(nodes) {
    nodes.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        /* eslint-disable no-bitwise */
        if (position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            return -1;
        }
        else if (position & Node.DOCUMENT_POSITION_CONTAINS) {
            return 1;
        }
        else if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return 1;
        }
        else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return -1;
        }
        /* eslint-enable no-bitwise */
        return 0;
    });
}
function traverseRemovedShadowDom(removedNode, shadowDomRemovedCallback) {
    if (isNodeShadowHost(removedNode)) {
        shadowDomRemovedCallback(removedNode.shadowRoot);
    }
    forEachChildNodes(removedNode, (childNode) => traverseRemovedShadowDom(childNode, shadowDomRemovedCallback));
}
function idsAreAssignedForNodeAndAncestors(node, nodeIds) {
    let current = node;
    while (current) {
        if (nodeIds.get(current) === undefined && !isNodeShadowRoot(current)) {
            return false;
        }
        current = getParentNode(current);
    }
    return true;
}

const initShadowRootsController = (emitRecord, emitStats) => {
    const controllerByShadowRoot = new Map();
    const shadowRootsController = {
        addShadowRoot: (shadowRoot, scope) => {
            if (controllerByShadowRoot.has(shadowRoot)) {
                return;
            }
            const mutationTracker = trackMutation(shadowRoot, emitRecord, emitStats, scope);
            // The change event does not bubble up across the shadow root, we have to listen on the shadow root
            const inputTracker = trackInput(shadowRoot, emitRecord, scope);
            // The scroll event does not bubble up across the shadow root, we have to listen on the shadow root
            const scrollTracker = trackScroll(shadowRoot, emitRecord, scope);
            controllerByShadowRoot.set(shadowRoot, {
                flush: () => mutationTracker.flush(),
                stop: () => {
                    mutationTracker.stop();
                    inputTracker.stop();
                    scrollTracker.stop();
                },
            });
        },
        removeShadowRoot: (shadowRoot) => {
            const entry = controllerByShadowRoot.get(shadowRoot);
            if (!entry) {
                // unidentified root cause: observed in some cases with shadow DOM added by browser extensions
                return;
            }
            entry.stop();
            controllerByShadowRoot.delete(shadowRoot);
        },
        stop: () => {
            controllerByShadowRoot.forEach(({ stop }) => stop());
        },
        flush: () => {
            controllerByShadowRoot.forEach(({ flush }) => flush());
        },
    };
    return shadowRootsController;
};

function record(options) {
    const { emitRecord, emitStats, configuration, lifeCycle } = options;
    // runtime checks for user options
    if (!emitRecord || !emitStats) {
        throw new Error('emit functions are required');
    }
    const processRecord = (record) => {
        emitRecord(record);
        sendToExtension('record', { record });
        const view = options.viewHistory.findView();
        addRecord(view.id);
    };
    const shadowRootsController = initShadowRootsController(processRecord, emitStats);
    const scope = createRecordingScope(configuration, createElementsScrollPositions(), shadowRootsController);
    const { stop: stopFullSnapshots } = startFullSnapshots(lifeCycle, processRecord, emitStats, flushMutations, scope);
    function flushMutations() {
        shadowRootsController.flush();
        mutationTracker.flush();
    }
    const mutationTracker = trackMutation(document, processRecord, emitStats, scope);
    const trackers = [
        mutationTracker,
        trackMove(processRecord, scope),
        trackMouseInteraction(processRecord, scope),
        trackScroll(document, processRecord, scope),
        trackViewportResize(processRecord, scope),
        trackInput(document, processRecord, scope),
        trackMediaInteraction(processRecord, scope),
        trackStyleSheet(processRecord, scope),
        trackFocus(processRecord, scope),
        trackVisualViewportResize(processRecord, scope),
        trackFrustration(lifeCycle, processRecord, scope),
        trackViewEnd(lifeCycle, processRecord, flushMutations),
    ];
    return {
        stop: () => {
            shadowRootsController.stop();
            trackers.forEach((tracker) => tracker.stop());
            stopFullSnapshots();
        },
        flushMutations,
        shadowRootsController,
    };
}

function buildReplayPayload(data, metadata, stats, rawSegmentBytesCount) {
    const formData = new FormData();
    formData.append('segment', new Blob([data], {
        type: 'application/octet-stream',
    }), `${metadata.session.id}-${metadata.start}`);
    const metadataAndSegmentSizes = {
        raw_segment_size: rawSegmentBytesCount,
        compressed_segment_size: data.byteLength,
        ...metadata,
    };
    const serializedMetadataAndSegmentSizes = JSON.stringify(metadataAndSegmentSizes);
    formData.append('event', new Blob([serializedMetadataAndSegmentSizes], { type: 'application/json' }));
    return {
        data: formData,
        bytesCount: data.byteLength,
        cssText: stats.cssText,
        isFullSnapshot: metadata.index_in_view === 0,
        rawSize: rawSegmentBytesCount,
        recordCount: metadata.records_count,
        serializationDuration: stats.serializationDuration,
    };
}

function createSegment({ context, creationReason, encoder, }) {
    let encodedBytesCount = 0;
    const viewId = context.view.id;
    const indexInView = getSegmentsCount(viewId);
    const metadata = {
        start: Infinity,
        end: -Infinity,
        creation_reason: creationReason,
        records_count: 0,
        has_full_snapshot: false,
        index_in_view: indexInView,
        source: 'browser',
        ...context,
    };
    const serializationStats = createSerializationStats();
    addSegment(viewId);
    function addRecord(record, callback) {
        metadata.start = Math.min(metadata.start, record.timestamp);
        metadata.end = Math.max(metadata.end, record.timestamp);
        metadata.records_count += 1;
        metadata.has_full_snapshot || (metadata.has_full_snapshot = record.type === RecordType.FullSnapshot || (record.type === RecordType.Change && metadata.index_in_view === 0));
        const prefix = encoder.isEmpty ? '{"records":[' : ',';
        encoder.write(prefix + JSON.stringify(record), (additionalEncodedBytesCount) => {
            encodedBytesCount += additionalEncodedBytesCount;
            callback(encodedBytesCount);
        });
    }
    function addStats(stats) {
        aggregateSerializationStats(serializationStats, stats);
    }
    function flush(callback) {
        if (encoder.isEmpty) {
            throw new Error('Empty segment flushed');
        }
        encoder.write(`],${JSON.stringify(metadata).slice(1)}\n`);
        encoder.finish((encoderResult) => {
            addWroteData(metadata.view.id, encoderResult.rawBytesCount);
            callback(metadata, serializationStats, encoderResult);
        });
    }
    return { addRecord, addStats, flush };
}

const SEGMENT_DURATION_LIMIT = 5 * ONE_SECOND;
/**
 * beacon payload max queue size implementation is 64kb
 * ensure that we leave room for logs, rum and potential other users
 */
let SEGMENT_BYTES_LIMIT = 60000;
function startSegmentCollection(lifeCycle, configuration, sessionManager, viewHistory, httpRequest, encoder) {
    return doStartSegmentCollection(lifeCycle, () => computeSegmentContext(configuration.applicationId, sessionManager, viewHistory), httpRequest, encoder);
}
function doStartSegmentCollection(lifeCycle, getSegmentContext, httpRequest, encoder) {
    let state = {
        status: 0 /* SegmentCollectionStatus.WaitingForInitialRecord */,
        nextSegmentCreationReason: 'init',
    };
    const { unsubscribe: unsubscribeViewCreated } = lifeCycle.subscribe(2 /* LifeCycleEventType.VIEW_CREATED */, () => {
        flushSegment('view_change');
    });
    const { unsubscribe: unsubscribePageMayExit } = lifeCycle.subscribe(11 /* LifeCycleEventType.PAGE_MAY_EXIT */, (pageMayExitEvent) => {
        flushSegment(pageMayExitEvent.reason);
    });
    function flushSegment(flushReason) {
        if (state.status === 1 /* SegmentCollectionStatus.SegmentPending */) {
            state.segment.flush((metadata, stats, encoderResult) => {
                const payload = buildReplayPayload(encoderResult.output, metadata, stats, encoderResult.rawBytesCount);
                if (isPageExitReason(flushReason)) {
                    httpRequest.sendOnExit(payload);
                }
                else {
                    httpRequest.send(payload);
                }
            });
            clearTimeout(state.expirationTimeoutId);
        }
        if (flushReason !== 'stop') {
            state = {
                status: 0 /* SegmentCollectionStatus.WaitingForInitialRecord */,
                nextSegmentCreationReason: flushReason,
            };
        }
        else {
            state = {
                status: 2 /* SegmentCollectionStatus.Stopped */,
            };
        }
    }
    return {
        addRecord: (record) => {
            if (state.status === 2 /* SegmentCollectionStatus.Stopped */) {
                return;
            }
            if (state.status === 0 /* SegmentCollectionStatus.WaitingForInitialRecord */) {
                const context = getSegmentContext();
                if (!context) {
                    return;
                }
                state = {
                    status: 1 /* SegmentCollectionStatus.SegmentPending */,
                    segment: createSegment({ encoder, context, creationReason: state.nextSegmentCreationReason }),
                    expirationTimeoutId: setTimeout(() => {
                        flushSegment('segment_duration_limit');
                    }, SEGMENT_DURATION_LIMIT),
                };
            }
            state.segment.addRecord(record, (encodedBytesCount) => {
                if (encodedBytesCount > SEGMENT_BYTES_LIMIT) {
                    flushSegment('segment_bytes_limit');
                }
            });
        },
        addStats: (stats) => {
            if (state.status === 1 /* SegmentCollectionStatus.SegmentPending */) {
                state.segment.addStats(stats);
            }
        },
        stop: () => {
            flushSegment('stop');
            unsubscribeViewCreated();
            unsubscribePageMayExit();
        },
    };
}
function computeSegmentContext(applicationId, sessionManager, viewHistory) {
    const session = sessionManager.findTrackedSession();
    const viewContext = viewHistory.findView();
    if (!session || !viewContext) {
        return undefined;
    }
    return {
        application: {
            id: applicationId,
        },
        session: {
            id: session.id,
        },
        view: {
            id: viewContext.id,
        },
    };
}

function startSegmentTelemetry(telemetry, requestObservable) {
    if (!telemetry.metricsEnabled) {
        return { stop: noop };
    }
    const { unsubscribe } = requestObservable.subscribe((requestEvent) => {
        if (requestEvent.type === 'failure' ||
            requestEvent.type === 'queue-full' ||
            (requestEvent.type === 'success' && requestEvent.payload.isFullSnapshot)) {
            const metrics = createSegmentMetrics(requestEvent.type, requestEvent.bandwidth, requestEvent.payload);
            // monitor-until: 2026-07-01
            addTelemetryMetrics("Segment network request metrics" /* TelemetryMetrics.SEGMENT_METRICS_TELEMETRY_NAME */, { metrics });
        }
    });
    return {
        stop: unsubscribe,
    };
}
function createSegmentMetrics(result, bandwidthStats, payload) {
    return {
        cssText: {
            count: payload.cssText.count,
            max: payload.cssText.max,
            sum: payload.cssText.sum,
        },
        encoding: {
            fullSnapshot: isExperimentalFeatureEnabled(ExperimentalFeature.USE_CHANGE_RECORDS) ? 'change' : 'v1',
            incrementalSnapshot: 'v1',
        },
        isFullSnapshot: payload.isFullSnapshot,
        ongoingRequests: {
            count: bandwidthStats.ongoingRequestCount,
            totalSize: bandwidthStats.ongoingByteCount,
        },
        recordCount: payload.recordCount,
        result,
        serializationDuration: {
            count: payload.serializationDuration.count,
            max: payload.serializationDuration.max,
            sum: payload.serializationDuration.sum,
        },
        size: {
            compressed: payload.bytesCount,
            raw: payload.rawSize,
        },
    };
}

function startRecordBridge(viewHistory) {
    const bridge = getEventBridge();
    return {
        addRecord: (record) => {
            // Get the current active view, not at the time of the record, aligning with the segment logic.
            // This approach could potentially associate the record to an incorrect view, in case the record date is in the past (e.g. frustration records).
            // However the risk is minimal. We could address the issue when potential negative impact are identified.
            const view = viewHistory.findView();
            bridge.send('record', record, view.id);
        },
    };
}

function startRecording(lifeCycle, configuration, sessionManager, viewHistory, encoder, telemetry, httpRequest) {
    const cleanupTasks = [];
    const reportError = (error) => {
        lifeCycle.notify(14 /* LifeCycleEventType.RAW_ERROR_COLLECTED */, { error });
        // monitor-until: forever, to keep an eye on the errors reported to customers
        addTelemetryDebug('Error reported to customer', { 'error.message': error.message });
    };
    const replayRequest = httpRequest || createHttpRequest([configuration.sessionReplayEndpointBuilder], reportError, SEGMENT_BYTES_LIMIT);
    let addRecord;
    let addStats;
    if (!canUseEventBridge()) {
        const segmentCollection = startSegmentCollection(lifeCycle, configuration, sessionManager, viewHistory, replayRequest, encoder);
        addRecord = segmentCollection.addRecord;
        addStats = segmentCollection.addStats;
        cleanupTasks.push(segmentCollection.stop);
        const segmentTelemetry = startSegmentTelemetry(telemetry, replayRequest.observable);
        cleanupTasks.push(segmentTelemetry.stop);
    }
    else {
        ({ addRecord } = startRecordBridge(viewHistory));
        addStats = noop;
    }
    const { stop: stopRecording } = record({
        emitRecord: addRecord,
        emitStats: addStats,
        configuration,
        lifeCycle,
        viewHistory,
    });
    cleanupTasks.push(stopRecording);
    return {
        stop: () => {
            cleanupTasks.forEach((task) => task());
        },
    };
}

export { startRecording };
