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
        'vertical': 'dd_v',
        'horizontal': 'dd_h',
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
        color: ActiveCaption;
        background-color: ActiveText;
        padding:2px;
}
.dd_body {
        display: flex;
        flex-direction: column;
        padding:2px;
}
.dd_h {
        display: flex;
        gap: 4px;
        flex-direction: row;
        align-items: flex-start;
        justify-content: left;
}
.dd_v {
        display: flex;
        gap: 4px;
        flex-direction: column;
        align-items: flex-start;
        justify-content: top;
}
`

function dispatchEvent(windowId, elementId, event) {
        const w = windows[windowId]
        if (w == null) return
        w.events.push([elementId, event])
        w.update()
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
        let ui = [];
        let currentUI = [];
        let events = []

        windows[windowId] = {
                update,
                events
        }

        const builder = Object.freeze({ vBox, hBox, label, button, toggle, combo })

        rebuild();

        document.body.appendChild(dialogEl)

        return { show, hide, update, move, close }

        function show() {
                dialogEl.show()
        }

        function hide() {
                dialogEl.hide()
        }

        function update() {
                rebuild()
        }

        function close() {
                dialogEl.remove()
                delete windows[windowId]
        }

        function move(x, y) {
                dialogEl.style.left = x + 'px';
                dialogEl.style.top = y + 'px';
        }

        function rebuild() {
                do {
                        currentUI.length = 0;
                        f(builder)
                } while (events.shift())

                if (ui.length != currentUI.length)
                        isDirty = true;

                ui = currentUI
                currentUI = []

                if (!isDirty) return;
                isDirty = false;

                const items = [
                        
                ];

                for (let id = 0; id < ui.length; id++) {
                        const [type, text, payload] = ui[id];
                        switch (type) {
                                case 'begin_v':
                                        items.push(`<div class="${classes.vertical}">`)
                                        break;
                                case 'end_v':
                                        items.push(`</div>`)
                                        break;
                                case 'begin_h':
                                        items.push(`<div class="${classes.horizontal}">`)
                                        break;
                                case 'end_h':
                                        items.push(`</div>`)
                                        break;
                                case 'label':
                                        items.push(`<span class="${classes.label}">${escapeHtml(text)}</span>`)
                                        break;
                                case 'button':
                                        items.push(`<button class="${classes.button}" onclick='DD.dispatchEvent("${windowId}", ${id}, "click")'>${escapeHtml(text)}</button>`)
                                        break;
                                case 'toggle':
                                        items.push(`<input class="${classes.toggle}" type="checkbox" ${text ? 'checked' : ''}/ onchange='DD.dispatchEvent("${windowId}", ${id}, ["change", this.checked])'>`);
                                        break;
                                case 'begin_combo':
                                        items.push(`<select class="${classes.select}" onchange='DD.dispatchEvent("${windowId}", ${id}, ["select", this.selectedIndex])'>`);
                                        break;
                                case 'end_combo':
                                        items.push(`</select>`);
                                        break;
                                case 'combo_item':
                                        items.push(`<option class="${classes.option}"  ${payload ? "selected" : ""}>${escapeHtml(text)}</option>`);
                                        break;
                                default:
                                        console.warn('Unknown item', type)
                        }
                }

                bodyEl.innerHTML = items.join('\n');
        }

        function appendUI(type, text, payload) {
                const prev = ui[currentUI.length];
                if (prev == null || prev[0] !== type || prev[1] !== text) {
                        isDirty = true;
                }

                const elementId = currentUI.length;
                currentUI.push([type, text, payload])
                
                if (events.length > 0 && events[0][0] == elementId) return events[0][1];
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

        function button(text) { 
                return appendUI('button', text) == 'click';
        }

        function label(text) {
                appendUI('label', text) 
        }

        function toggle(value, text) {
                if (text) label(text)
                const event = appendUI('toggle', value)
                if (event) {
                        isDirty = true;
                        if (event[0] == 'change') return event[1];
                }
                return value;
        }

        function combo(index, items) {
                const event = appendUI('begin_combo', items[index])
                if (event) {
                        isDirty = true;
                        if (event[0] == 'select') return event[1];
                }
                
                for (let i = 0; i < items.length; i++) {
                        const e = items[i];
                        appendUI('combo_item', e, i == index)
                }

                appendUI('end_combo', items[index])

                return index;
        }
}

return { window, dispatchEvent }

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