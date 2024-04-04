declare namespace DD {
        type Window = {
                show(): void;
                hide(): void;
                dirty(): void;
                move(x: number, y: number): void;
                close(): void;
        }

        type WindowBuilder = {
                vBox(f: WindowFunction): void;
                hBox(f: WindowFunction): void;
                label(text: string): void;
                button(text: string): boolean;
                toggle(value: boolean, text?: string): boolean;
                combo<T>(selected: number, items: T[], map: (i: T) => string): number;
                combo(selected: number, items: [string, unknown][]): number;
                combo(selected: number, items: string[]): number;
                switcher<T>(selected: number, items: T[], map: (i: T) => string): number;
                switcher(selected: number, items: [string, unknown][]): number;
                switcher(selected: number, items: string[]): number;
        }

        type WindowFunction = (builder: WindowBuilder) => void;

        function window(title: string, f: WindowFunction): Window
}