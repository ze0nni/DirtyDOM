window.DD = (() => {

let windowsCounter = 0;
const windows = {}
const classes = {
        'dialog': 'dd_dialog',
        'body': 'dd_body',
        'header': 'dd_header',
        'button': 'dd_button',
        'label': 'dd_label',
        'toggle': 'dd_toggle',
        'select': 'dd_select',
        'option': 'dd_option',
        'switcher': 'dd_switcher',
        'switcher_on': 'dd_switcher_btn dd_switcher_btn_on',
        'switcher_off': 'dd_switcher_btn dd_switcher_btn_off',
        'vertical': 'dd_v',
        'horizontal': 'dd_h',
        'line': 'bb_line'
}

const styleEl = document.createElement('style')
styleEl.type = 'text/css';
document.head.appendChild(styleEl);
styleEl.innerHTML = `
.dd_dialog {
        color:WindowText;
        background-color: ButtonFace;
        border:solid 1px ActiveBorder;
        margin: 0px;
        padding:0px;
}
.dd_header {
        color: SelectedItemText;
        background-color: SelectedItem;
        padding:2px;
}
.dd_body {
        display: flex;
        flex-direction: column;
        padding:2px;
        gap: 4px;
}
.dd_h {
        flex-grow: 1;
        display: flex;
        gap: 4px;
        flex-direction: row;
        align-items: stretch;
        justify-content: left;
}
.dd_v {
        display: flex;
        gap: 4px;
        flex-direction: column;
        align-items: stretch;
        justify-content: top;
}
.dd_button {
        flex-grow: 1;
}
.dd_select {
        display: flex;
        flex-grow: 1;
}
.dd_switcher {
        flex-grow: 1;
        display: flex;
        flex-direction: row;
        align-items: stretch;
        justify-content: left;
        border-top: 1px solid SelectedItem;
	border-left: 1px solid SelectedItem;
}
.dd_switcher_btn {
        flex: 1;
}
.dd_switcher_btn {
        cursor: default;
        text-align: center;
        padding: 4px;
        border-right: 1px solid SelectedItem;
        border-bottom: 1px solid SelectedItem;
}
.dd_switcher_btn_on {
        color: SelectedItemText;
        background-color: SelectedItem;
}
.dd_switcher_btn_off {
        cursor: pointer;
}
.dd_switcher_btn_off:hover {
        cursor: pointer;
        background-color: color-mix(in srgb, SelectedItem, transparent 50%);
}
.bb_line {
        display: flex;
        flex-grow: 1;
        min-width: 1px;
        min-height: 1px;
        background-color: GrayText;
}

.bb_input_filter {
        padding-right: 1.5em;
        background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDI0IDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNS4yNSAwYTguMjUgOC4yNSAwIDAgMC02LjE4IDEzLjcyTDEgMjIuODhsMS4xMiAxIDguMDUtOS4xMkE4LjI1MSA4LjI1MSAwIDEgMCAxNS4yNS4wMXptMCAxNWE2Ljc1IDYuNzUgMCAxIDEgMC0xMy41IDYuNzUgNi43NSAwIDAgMSAwIDEzLjUiLz48L3N2Zz4=" ) no-repeat right;
        background-size: 1em;
        color: WindowText;
        background-color: Window;
}
.bb_input_filter_content {
        background-color: Window;
        border:solid 1px ActiveBorder;
        overflow-y: scroll;
}
`

const minWidth = 250;

function dispatchEvent(windowId, elementId, event) {
        const w = windows[windowId]
        if (w == null) return
        w.events.push([elementId, event])
        w.dirty();
}

function setFocus(windowId, elementId) {
        return;
        const w = windows[windowId];
        if (w == null) return
        w.focusId = elementId;
}

function escapeHtml(text) {
        return text;
}

function window(title, f)  {
        const windowId = `window_${windowsCounter++}`;
        const dialogEl = document.createElement('dialog')
        dialogEl.className = classes.dialog;

        const headerEl = document.createElement('header')
        headerEl.className = classes.header
        headerEl.append(title)
        dialogEl.appendChild(headerEl)        

        const bodyEl = document.createElement('div')
        bodyEl.className = classes.body
        dialogEl.appendChild(bodyEl)

        makeDraggable(dialogEl, headerEl)
        
        let isDirty = false;
        let isChanged = false;
        let ui = [];
        let currentUI = [];
        let events = []
        const postRender = [
        ]
        const nextStyles = [];

        const wnd = {
                dirty,
                events
        }
        windows[windowId] = wnd;

        const builder = Object.freeze({ vBox, hBox, expand, space, hr, label, header, button, toggle, combo, switcher, text, textarea, filter, pushStyle })

        size(minWidth);
        dirty();

        document.body.appendChild(dialogEl)

        return { show, hide, dirty, move, size, close }

        function show() {
                dialogEl.show()
        }

        function hide() {
                dialogEl.hide()
        }

        function dirty() {
                if (isDirty) return;
                isDirty = true;

                requestAnimationFrame(() => {
                        try {
                                rebuild()
                        } finally {
                                isDirty = false;
                        }
                        for (var p of postRender) {
                                p();
                        }
                        postRender.length = 0;
                })
        }

        function close() {
                dialogEl.remove()
                delete windows[windowId]
        }

        function move(x, y) {
                dialogEl.style.left = x + 'px';
                dialogEl.style.top = y + 'px';
        }

        function size(size) {
                dialogEl.style.minWidth = size + 'px';
        }

        function styleAttr() {
                if (nextStyles.length == 0) return '';
                const s = nextStyles.map(([s, v]) => `${s}: ${v}`).join(';');
                nextStyles.length = 0;
                return s;
        }

        function rebuild() {
                postRender.length = 0;
                do {
                        currentUI.length = 0;
                        f(builder)
                } while (events.shift())

                if (ui.length != currentUI.length)
                        isChanged = true;

                ui = currentUI
                currentUI = []

                if (!isChanged) return;
                isChanged = false;

                const items = [
                        
                ];

                for (let id = 0; id < ui.length; id++) {
                        const [type, text, payload, style] = ui[id];
                        switch (type) {
                                case 'begin_v':
                                        items.push(`<div class="${classes.vertical}" style="${style}"}>`)
                                        break;
                                case 'end_v':
                                        items.push(`</div>`)
                                        break;
                                case 'begin_h':
                                        items.push(`<div
                                                class="${classes.horizontal}"
                                                style="${style}"}>`)
                                        break;
                                case 'end_h':
                                        items.push(`</div>`)
                                        break;
                                case 'expand':
                                        items.push(`<span
                                        style="${text};${style}"
                                                ></span>`)
                                        break;
                                case 'space':
                                        items.push(`<span 
                                                style="width: 1em; height: 1em;${style}"
                                                ></span>`);
                                        break;
                                case 'hr':
                                        items.push(`<div
                                                class="${classes.line}"
                                                style="${style}"
                                                ></div>`);
                                        break;
                                case 'label':
                                        items.push(`<span
                                                class="${classes.label}"
                                                style="${style}"
                                                >${escapeHtml(text)}</span>`)
                                        break;
                                case 'header':
                                        items.push(`<span
                                                class="${classes.header}"
                                                style="${style}"
                                                >${escapeHtml(text)}</span>`)
                                        break;
                                case 'button':
                                        items.push(`<button 
                                                class="${classes.button}"
                                                style="${style}"
                                                onclick='DD.dispatchEvent("${windowId}", ${id}, "click")'
                                                >${escapeHtml(text)}</button>`)
                                        break;
                                case 'toggle':
                                        items.push(`<div>
                                                <input
                                                id="dd_${windowId}_${id}"
                                                class="${classes.toggle}"
                                                style="${style}"
                                                type="checkbox" ${payload ? 'checked' : ''} 
                                                onchange='DD.dispatchEvent("${windowId}", ${id}, ["change", this.checked])'
                                                >
                                                <label for="dd_${windowId}_${id}">${text??''}</label>
                                                </div>`);
                                        break;
                                case 'begin_combo':
                                        items.push(`<select
                                                class="${classes.select}"
                                                style="${style}"
                                                onchange='DD.dispatchEvent("${windowId}", ${id}, ["select", this.selectedIndex])'
                                                >`);
                                        break;
                                case 'end_combo':
                                        items.push(`</select>`);
                                        break;
                                case 'combo_item':
                                        items.push(`<option
                                                class="${classes.option}"
                                                style="${style}"
                                                ${payload ? "selected" : ""}
                                                >${escapeHtml(text)}</option>`);
                                        break;
                                case 'begin_switcher':
                                        items.push(`<div class="${classes.switcher}" ${styleAttr()}>`)
                                        break;
                                case 'end_switcher':
                                        items.push(`</div>`)
                                        break;
                                case 'switch_button':
                                        items.push(`<nav
                                                class="${payload[0] ? classes.switcher_on : classes.switcher_off }"
                                                style="${style}"
                                                onclick='DD.dispatchEvent("${windowId}", ${payload[1]}, ["select", ${payload[2]}])'
                                                >${text}</nav>`)
                                        break;
                                case 'text':
                                        items.push(`<input
                                                id='element-${windowId}-${id}'
                                                type='text'
                                                style="${style}"
                                                value="${escapeHtml(text)}"
                                                onfocus='DD.setFocus("${windowId}", ${id})'
                                                onblur='DD.dispatchEvent("${windowId}", ${id}, ["changed", this.value])'
                                                >`)
                                        break;
                                case 'textarea':
                                        items.push(`<textarea
                                                id='element-${windowId}-${id}'
                                                type='text'
                                                style="resize: none;${style}"
                                                ${ payload ? `rows="${payload}"` : ''}
                                                onfocus='DD.setFocus("${windowId}", ${id})'
                                                onblur='DD.dispatchEvent("${windowId}", ${id}, ["changed", this.value])'
                                                >${escapeHtml(text)}</textarea>`)
                                        break;

                                case 'filter':
                                        items.push(`<input
                                                id='element-${windowId}-${id}'
                                                type='text'
                                                style="${style}"
                                                class="bb_input_filter"
                                                value=""
                                                placeholder="Filter"
                                                onchange='DD.dispatchEvent("${windowId}", ${id}, "changed")'
                                                onkeydown='DD.dispatchEvent("${windowId}", ${id}, "changed")'
                                                onpaste='DD.dispatchEvent("${windowId}", ${id}, "changed")'
                                                input='DD.dispatchEvent("${windowId}", ${id}, "changed")'
                                                >`);
                                        items.push(`<div
                                                id='element-${windowId}-${id}-content'
                                                style="height:8em;${style}"
                                                class="bb_input_filter_content"
                                                >
                                                </div>`);
                                        postRender.push(() => dispatchEvent(windowId, id, "changed"))
                                        if (payload.scrollTop) {
                                                postRender.push(() => dispatchEvent(windowId, id, ['scroll-top', payload.scrollTop]));
                                        }
                                        break;

                                default:
                                        console.warn('Unknown item', type)
                        }
                }

                bodyEl.innerHTML = items.join('\n');

                const focusId = wnd.focusId;
                delete wnd.focusId

                if (focusId !== undefined) {
                        const el = document.getElementById(`element-${windowId}-${focusId}`);
                        if (el) {
                                el.focus();
                        }
                }
        }

        function appendUI(type, text, payload) {
                const prev = ui[currentUI.length];
                if (prev == null || prev[0] !== type || prev[1] !== text) {
                        isChanged = true;
                }

                const elementId = currentUI.length;
                currentUI.push([type, text, payload, styleAttr()])
                
                if (events.length > 0 && events[0][0] == elementId) return events[0][1];
        }

        function getLastElementId() {
                return currentUI.length - 1;
        }

        function vBox(g) {
                appendUI('begin_v')
                g(builder)
                appendUI('end_v')
        }

        function hBox(g) {
                appendUI('begin_h')
                g(builder)
                appendUI('end_h')
        }

        function expand(grow) {
                appendUI('expand', `flex-grow: ${(grow ?? 1) * 1000}`);
        }

        function space() {
                appendUI('space')
        }

        function hr() {
                appendUI('hr')
        }

        function button(text) { 
                return appendUI('button', text) == 'click';
        }

        function label(text) {
                appendUI('label', text) 
        }

        function header(text) {
                appendUI('header', text) 
        }

        function toggle(value, text) {
                const event = appendUI('toggle', text, value)
                if (event) {
                        isChanged = true;
                        if (event[0] == 'change') return event[1];
                }
                return value;
        }

        function combo(index, items, map) {
                index = Math.max(0, Math.min(index, items.length - 1));

                const event = appendUI('begin_combo', items[index])
                if (event) {
                        isChanged = true;
                        if (event[0] == 'select') return event[1];
                }
                
                for (let i = 0; i < items.length; i++) {
                        const e = items[i];
                        const text = 
                                typeof e == 'string' && map == undefined ? e :
                                Array.isArray(e) && map == undefined ? e[0] :
                                map(e);
                        appendUI('combo_item', text, i == index)
                }

                appendUI('end_combo', items[index])

                return index;
        }

        function switcher(index, items, map) {
                index = Math.max(0, Math.min(index, items.length - 1));

                const event = appendUI('begin_switcher', items[index])
                const switcherId = currentUI.length - 1;
                if (event) {
                        isChanged = true;
                        if (event[0] == 'select') return event[1];
                }
                
                for (let i = 0; i < items.length; i++) {
                        const e = items[i];
                        const text = 
                                typeof e == 'string' && map == undefined ? e :
                                Array.isArray(e) && map == undefined ? e[0] :
                                map(e);
                        appendUI('switch_button', text, [i == index, switcherId, i])
                }

                appendUI('end_switcher', items[index])

                return index;
        }

        function text(value) {
                const event = appendUI('text', value);

                if (event) {
                        isChanged = true;
                        if (event[0] == 'changed') {
                                return event[1];
                        }
                }
                return value;
        }

        function textarea(value, rows) {
                const event = appendUI('textarea', value, rows);

                if (event) {
                        isChanged = true;
                        if (event[0] == 'changed') {
                                return event[1];
                        }
                }
                return value;
        }

        function filter(selected, items, map, filter) {
                const payload = {

                }
                const event = appendUI('filter', "", payload);

                const contentEl = document.getElementById(`element-${windowId}-${getLastElementId()}-content`);
                if (contentEl) {
                        payload.scrollTop = contentEl.scrollTop;
                }

                if (event == 'changed') {
                        rebuildFilter(getLastElementId(), selected, items, map, filter);

                        if (Array.isArray(selected)) return false;
                        return selected;
                }

                if (event && event[0] == 'click') {
                        const itemIndex = event[1];

                        if (Array.isArray(selected)) {
                                const selectedIndex = selected.indexOf(itemIndex);
                                if (selectedIndex == -1) {
                                        selected.unshift(itemIndex);
                                } else {
                                        selected.splice(selectedIndex, 1);
                                }

                                isChanged = true;
                                return true;
                        } else {
                                isChanged = true;
                                return itemIndex;
                        }
                }

                if (event && event[0] == 'scroll-top') {
                        const contentEl = document.getElementById(`element-${windowId}-${getLastElementId()}-content`);
                        if (contentEl) {
                                contentEl.scrollTop = event[1];
                        }
                }

                if (Array.isArray(selected)) {
                        for (let i = items.length; i --> 0;) {
                                if (items[i] >= items.length) {
                                        items.splice(i, 1);
                                }
                        }
                        return false;
                }
                return selected;
        }


        function rebuildFilter(id, selected, items, map, filter) {
                const inputEl = document.getElementById(`element-${windowId}-${id}`);
                const contentEl = document.getElementById(`element-${windowId}-${id}-content`);
                if (inputEl == null || contentEl == null) {
                        contentEl.warn('filter el not found')
                        return;
                }

                const filterText = inputEl.value;
                {
                        for (let i = contentEl.children.length; 
                                i < items.length; 
                                i++) 
                        {
                                const lineEl = document.createElement('div');
                                contentEl.appendChild(lineEl);
                                lineEl.onclick = () => dispatchEvent(windowId, id, ['click', i]);
                        }
                }

                let counter = 0;

                const isSelectedArray = Array.isArray(selected);

                for (let lineEl of contentEl.children) {
                        const index = counter++;
                        const item = items[index];

                        let skip = false;
                        if (item == null) skip = true;

                        const text = item == null ? null
                                : map == null ? item
                                : map(item)

                        if (!skip && text !== null && filter && !filter(filterText, item))
                                skip = true;
                        if (!skip && !filter && typeof text == 'string' && text.indexOf(filterText) == -1)
                                skip = true;

                        if (skip) {
                                lineEl.style.display = "none";
                                continue;
                        }

                        lineEl.style.display = "block";
                        const isSelected = isSelectedArray 
                                ? selected.indexOf(index) != -1
                                : selected == index;

                        if (isSelected) {
                                lineEl.classList.add('dd_switcher_btn_on');
                                lineEl.classList.remove('dd_switcher_btn_off');
                        } else {
                                lineEl.classList.remove('dd_switcher_btn_on');
                                lineEl.classList.add('dd_switcher_btn_off');
                        }

                        lineEl.innerHTML = text;
                }
        }

        function pushStyle(style, value) {
                nextStyles.push([style, value])
        }
}

return { window, dispatchEvent, setFocus }

//https://codepen.io/marcusparsons/pen/NMyzgR
function makeDraggable (element, elementTop) {
        // Make an element draggable (or if it has a .window-top class, drag based on the .window-top element)
        let currentPosX = 0, currentPosY = 0, previousPosX = 0, previousPosY = 0;
        elementTop.onmousedown = dragMouseDown;
    
        function dragMouseDown (e) {
            // Prevent any default action on this element (you can remove if you need this element to perform its default action)
            e.preventDefault();
            // Get the mouse cursor position and set the initial previous positions to begin
            previousPosX = e.clientX;
            previousPosY = e.clientY;
            // When the mouse is let go, call the closing event
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves
            document.onmousemove = elementDrag;
        }
    
        function elementDrag (e) {
            // Prevent any default action on this element (you can remove if you need this element to perform its default action)
            e.preventDefault();
            // Calculate the new cursor position by using the previous x and y positions of the mouse
            currentPosX = previousPosX - e.clientX;
            currentPosY = previousPosY - e.clientY;
            // Replace the previous positions with the new x and y positions of the mouse
            previousPosX = e.clientX;
            previousPosY = e.clientY;
            // Set the element's new position
            element.style.top = (element.offsetTop - currentPosY) + 'px';
            element.style.left = (element.offsetLeft - currentPosX) + 'px';
        }
    
        function closeDragElement () {
            // Stop moving when mouse button is released and release events
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

})();