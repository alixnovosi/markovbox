export class TextBox {
    public textbox: HTMLElement;
    private text: string;
    private pointer: HTMLElement;

    // characters per second
    private speed: number = 64;

    private timer: number = 0;

    constructor(textbox: HTMLElement) {
        this.textbox = textbox;
    }

    private draw_invisible_text(): void {
        // write all text as invisible spans.
        for (let i = 0; i < this.text.length; i++) {
            let span: HTMLElement = document.createElement("span");
            span.classList.add("hidden-text");
            span.classList.add("character");

            if (!this.pointer) {
                this.pointer = span;

            }

            // stick trailing whitespace in with the preceding character,
            // so that it "doesn't count".
            if (i+1 < this.text.length && this.text[i+1] === " ") {
                span.textContent = this.text[i] + this.text[i+1];
                i++;
            } else {
                span.textContent = this.text[i];
            }

            this.textbox.appendChild(span);
        }
    }

    public render_step(dt: DOMHighResTimeStamp): boolean {
        // dt is milliseconds, so we need to convert.
        this.timer += ((dt) * this.speed);

        while (this.timer >= 1000) {
            this.timer -= 1000;
            this.pointer.classList.remove("hidden-text");
            this.pointer = this.pointer.nextSibling as HTMLElement;

            if (this.pointer === null) {
                return false;
            }
        }

        return true;
    }

    // setter for text, which resets the textbox, too.
    public set_text(text: string): void {
        this.text = text;
        this.clean_textbox_elem();
        this.draw_invisible_text();
    }

    // remove all children of textbox so it's ready to go again.
    public clean_textbox_elem(): void {
        let child: HTMLElement = this.textbox.firstChild as HTMLElement;
        while (child) {
            let oldchild = child;
            child = child.nextSibling as HTMLElement;
            if (oldchild.classList.contains("character")) {
                this.textbox.removeChild(oldchild);
            }
        }
    }
}
