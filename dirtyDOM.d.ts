declare namespace DD {
        declare type Window = readonly {
                show();
                hide();
                update();
                close();
        }

        declare type WindowBuilder = readonly {
                vGroup(f: WindowFunction): void;
                hGroup(f: WindowFunction): void;
                label(text: string): void;
                button(text: string): bool;
                toggle(value: boolean, text?: string): bool;
                combo(selected: number, items: string[]): number;
        }

        declare type WindowFunction = (builder: WindowBuilder) => void;

        declare function window(title: string, f: WindowFunction): Window
}