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
.dd_body, .dd_v, .dd_h {
        display: flex;
        gap: 4px;
}
.dd_body {
        flex-direction: 'column';
        padding:2px;
}
.dd_v {
        flex-direction: 'row';
}
.dd_v {
        flex-direction: 'column';
}
`

function dispatchEvent(windowId, elementId, event) {
        const w = windows[windowId];
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
        
        let isDirty = false;
        let ui = [];
        let currentUI = [];
        let events = []

        windows[windowId] = {
                update,
                events
        }

        const builder = Object.freeze({ vGroup, hGroup, label, button, toggle, combo })

        rebuild();

        document.body.appendChild(dialogEl)

        return { show, hide, update, close }

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

        function rebuild() {
                do {
                        currentUI.length = 0;
                        appendUI('begin_b')
                        f(builder)
                        appendUI('end_b')
                } while (events.shift())

                if (ui.length != currentUI.length)
                        isDirty = true;

                ui = currentUI
                currentUI = []

                if (!isDirty) return;
                isDirty = false;

                const items = [
                        `<header class="${classes.header}">${title}</header>`
                ];

                for (let id = 0; id < ui.length; id++) {
                        const [type, text, payload] = ui[id];
                        switch (type) {
                                case 'begin_b':
                                        items.push(`<div class="${classes.body}">`)
                                        break;
                                case 'end_b':
                                        items.push(`</div>`)
                                        break;
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

                dialogEl.innerHTML = items.join('\n');
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

        function vGroup(g) {
                appendUI('begin_v')
                g(builder)
                appendUI('end_v')
        }

        function hGroup(g) {
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

})();