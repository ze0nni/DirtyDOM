```
let count = 10;
let selected = 0;
var x = false;
const w = DD.window("Hello", (b) => {
        b.label(`label ${count}`)
        b.hBox((b) => {
                if (b.button("+")) {
                        count++;
                }
                if (b.button("-")) {
                        count--;
                }
                for (let i = 0; i < count; i++) {
                        b.label(`${i}`)
                }
        })

        selected = b.combo(selected, ["1", "2", "3"])
        
        b.vBox((b) => {
                x = b.toggle(x)
                b.toggle(false)
        });
})
w.show()
w.move(100, 100)

// Repaint window with new data
w.dirty()
````

![Preview](window.png)
