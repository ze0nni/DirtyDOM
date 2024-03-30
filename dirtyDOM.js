window.DD = (() => {

let windowsCounter = 0;
const windows = {}

function dispatchEvent(windowId, elementId, event) {
        const w = windows[windowId];
        if (w == null) return
        w.events.push([elementId, event])
        w.update()
}

function window(title, f)  {
        const windowId = `window_${windowsCounter++}`;
        const dialogEl = document.createElement('dialog')
        
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
                        f({ label, button })
                } while (events.shift())

                if (ui.length != currentUI.length)
                        isDirty = true;

                ui = currentUI
                currentUI = []

                if (!isDirty) return;
                isDirty = false;

                const items = [
                        `<header>${title}</header>`
                ];

                for (let id = 0; id < ui.length; id++) {
                        const [type, text] = ui[id];
                        switch (type) {
                                case 'label':
                                        items.push(`<div>${text}</div>`)
                                        break;
                                case 'button':
                                        items.push(`<button onclick='DD.dispatchEvent("${windowId}", ${id}, "click")'>${text}</button>`)
                                        break;
                        }
                }

                dialogEl.innerHTML = items.join('\n');
        }

        function appendUI(type, text) {
                const prev = ui[currentUI.length];
                if (prev == null || prev[0] != type || prev[1] != text) {
                        isDirty = true;
                }

                const elementId = currentUI.length;
                currentUI.push([type, text])
                
                if (events.length > 0 && events[0][0] == elementId) return events[0][1];
        }

        function button(text) {
                return appendUI('button', text) == 'click';
        }

        function label(text) {

                appendUI('label', text)
        }
}

return {window, dispatchEvent }

})();