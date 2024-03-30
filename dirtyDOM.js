window.DD = (() => {

let windowsCounter = 0;
const windows = {}
const classes = {
        'dialog': 'dd_dialog',
        'header': 'dd_header',
        'button': 'dd_button',
        'label': 'dd_label',
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
        border:solid 1px ActiveBorder ;
        padding:0px;
}
.dd_header {
        color: ActiveCaption;
        background-color: ActiveText;
        padding:2px;
}
.dd_v, .dd_h {
        padding: 4px;
}
`

function dispatchEvent(windowId, elementId, event) {
        const w = windows[windowId];
        if (w == null) return
        w.events.push([elementId, event])
        w.update()
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
                        appendUI('begin_v')
                        f({ label, button, combo })
                        appendUI('end_v')
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
                                        items.push(`<div class="${classes.label}">${text}</div>`)
                                        break;
                                case 'button':
                                        items.push(`<button class="${classes.button}" onclick='DD.dispatchEvent("${windowId}", ${id}, "click")'>${text}</button>`)
                                        break;
                                case 'begin_combo':
                                        items.push(`<select class="${classes.select}"  onchange='DD.dispatchEvent("${windowId}", ${id}, ["select", this.selectedIndex])'>`);
                                        break;
                                case 'end_combo':
                                        items.push(`</select>`);
                                        break;
                                case 'combo_item':
                                        items.push(`<option class="${classes.option}"  ${payload ? "selected" : ""}>${text}</option>`);
                                        break;
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

        function button(text) { 
                return appendUI('button', text) == 'click';
        }

        function label(text) {
                appendUI('label', text) 
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