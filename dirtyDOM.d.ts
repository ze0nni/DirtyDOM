declare namespace DD {
        type Window = {
                show(): void;
                hide(): void;
                dirty(): void;
                move(x: number, y: number): void;
                size(minWidth: number): void;
                close(): void;
        }

        type WindowBuilder = {
                vBox(f: WindowFunction): void;
                hBox(f: WindowFunction): void;
                space(): void;
                hr(): void;
                expand(grow?: number): void;
                label(text: string): void;
                header(text: string): void;
                button(text: string): boolean;
                toggle(value: boolean, text?: string): boolean;
                combo<T>(selected: number, items: readonly T[], map: (i: T) => string): number;
                combo(selected: number, items: readonly [string, unknown][]): number;
                combo(selected: number, items: readonly string[]): number;
                switcher<T>(selected: number, items: readonly T[], map: (i: T) => string): number;
                switcher(selected: number, items: readonly [string, unknown][]): number;
                switcher(selected: number, items: readonly string[]): number;
                text(value: string): string;
                textarea(value: string, rows?: number): string;
                filter<T>(selected: number, items: readonly T[], map: (i: T) => string, filter?: (s: string, i: T) => boolean|'disabled'): number;
                filter<T>(selected: number[], items: readonly T[], map: (i: T) => string, filter?: (s: string, i: T) => boolean|'disabled'): boolean;
                
                pushStyle(style: string, value: string): WindowBuilder;
        }

        type WindowFunction = (builder: WindowBuilder) => void;

        function window(title: string, f: WindowFunction): Window
}