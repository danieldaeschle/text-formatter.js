/**
 * @file Main JS file for TextFormatterJS
 * @author Daniel Däschle
 */

 /** Own Scope */
 (function() {
    /** @type {boolean} */
    var textSelected = false;
    /** @type {number | null} */
    var delayedVisibleSetter = null;
    /** @type {boolean} */
    var isTextFormatterVisible = false;
    /** @type {boolean} */
    var fadingIn = false;
    /** @const {string} */
    var textFormatterTooltipElement = '<div id="highlightTooltip">'+
                                        '<button class="text-formatter-button" id="formatBoldButton"><i class="material-icons">format_bold</i></button>'+
                                        '<button class="text-formatter-button" id="formatItalicButton"><i class="material-icons">format_italic</i></button>'+
                                        '<button class="text-formatter-button" id="formatUnderlineButton"><i class="material-icons">format_underline</i></button>'+
                                        '<button class="text-formatter-button" id="fontSizeDownButton"><i style="padding: 3px" class="material-icons md-18">format_size</i></button>'+
                                        '<button class="text-formatter-button" id="fontSizeUpButton"><i class="material-icons">format_size</i></button>'+
                                        '</div>';

    /**  Writes the required HTML DOM into the document */
    window.onload = (function() {
        document.querySelector('body').innerHTML += textFormatterTooltipElement;

        var formatBoldButton = document.getElementById('formatBoldButton');
        var formatItalicButton = document.getElementById('formatItalicButton');
        var formatUnderlineButton = document.getElementById('formatItalicButton');
        var fontSizeDownButton = document.getElementById('fontSizeDownButton');
        var fontSizeUpButton = document.getElementById('fontSizeUpButton');

        formatBoldButton.onclick = (function() {
            document.execCommand('bold', false, null);
        });
        formatItalicButton.onclick = (function() {
            document.execCommand('italic', false, null);
        });
        formatUnderlineButton.onclick = (function() {
            document.execCommand('underline', false, null);
        });
        fontSizeDownButton.onclick = (function() {
            changeSize(false);
        });
        fontSizeUpButton.onclick = (function() {
            changeSize(true);
        });
    });

    /** Toggles the textSelected variable when the highlighting/selection changes */
    document.onselectionchange = (function() {
        var text = getSelectedText();
        textSelected = text !== '';

        /** Hides the tooltip if the text get unselected */
        if (!textSelected && isTextFormatterVisible) {
            hideTooltip();
        }
    });

    /** Shows the highlightTooltip on mouseUp and keyUp events and sets the tooltip to its position */
    document.onmouseup = document.onkeyup = (function() {
        if (textSelected) {
            var coordinates = getSelectionCoordinates();
            var highlightTooltip = document.getElementById('highlightTooltip');
            if (coordinates.y > 60) {
                highlightTooltip.style.top = coordinates.y - 55 + 'px';
            } else {
                highlightTooltip.style.top = coordinates.y + 25 + 'px';
            }
            if (coordinates.x < 55) {
                highlightTooltip.style.left = 5 + 'px';
            } else {
                highlightTooltip.style.left = coordinates.x - 50 + 'px';
            }
            fadeIn(document.getElementById('highlightTooltip'), 200);
            delayedVisibleSetter = setTimeout(function() {
                isTextFormatterVisible = true;
            }, 50);
        }
    });

    /** Hides the text formatter tooltip */
    var hideTooltip = (function() {
        if (delayedVisibleSetter) {
            clearTimeout(delayedVisibleSetter);
        }
        fadeOut(document.getElementById('highlightTooltip'), 200);
        isTextFormatterVisible = false;
    });

    /**
     * Executes the fontSize command by adding/removing the size
     * @param {boolean} increase
     */
    var changeSize = (function(increase) {
        var fontSize = document.queryCommandValue("fontSize") || 3;
        var value = parseInt(fontSize) + parseInt(increase ? 1 : -1);
        document.execCommand('fontSize', false, value);
    });

    /**
     * Returns the highlighted/selected text
     * @returns {string}
     */
    var getSelectedText = (function() {
        if (window.getSelection) {
            var selection = window.getSelection();
            if (selection.anchorNode && selection.anchorNode.parentNode.isContentEditable !== false) {
                return selection.toString();
            }
        }
        return '';
    });

    /**
     * Returns the coordinates of the highlighted/selected text
     * @returns {object} containing x and y
     */
    var getSelectionCoordinates = (function() {
        var sel = document.selection, range, rect;
        var x = 0, y = 0;
        if (sel) {
            if (sel.type !== "Control") {
                range = sel.createRange();
                range.collapse(true);
                x = range.boundingLeft;
                y = range.boundingTop;
            }
        } else if (window.getSelection) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getClientRects) {
                    range.collapse(true);
                    if (range.getClientRects().length>0){
                        rect = range.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                    }
                }
                if (x === 0 && y === 0) {
                    var span = document.createElement("span");
                    if (span.getClientRects) {
                        span.appendChild( document.createTextNode("\u200b") );
                        range.insertNode(span);
                        rect = span.getClientRects()[0];
                        x = rect.left;
                        y = rect.top;
                        var spanParent = span.parentNode;
                        spanParent.removeChild(span);
                        spanParent.normalize();
                    }
                }
            }
        }
        return { x: x, y: y };
    });

    /**
     * Fade in animation for DOM objects
     * @param {object} el
     * @param {number} duration 
     * @param {string} display 
     */
    var fadeIn = (function(el, duration) {
        var s = el.style, step = 25 / (duration || 300);
        s.opacity = s.opacity || 0;
        s.display = 'block';
        fadingIn = true;
        (function fade() {
            if ((s.opacity = parseFloat(s.opacity) + step) > 1) {
                s.opacity = 1;
                fadingIn = false;
            } else {
                setTimeout(fade, 25);
            }
        })();
    });

    /**
     * Fade out animation for DOM objects
     * @param {object} el 
     * @param {number} duration 
     */
    var fadeOut = (function(el, duration) {
        var s = el.style, step = 25/(duration || 300);
        s.opacity = s.opacity || 1;
        (function fade() {
            if (!fadingIn) {
                (s.opacity -= step) < 0 ? s.display = 'none' : setTimeout(fade, 25);
            }
        })();
    });
 })();
