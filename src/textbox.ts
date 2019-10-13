export class TextBox {
    public textbox: HTMLElement;
    private text: string;
    private pointer: HTMLElement;

    // characters per second
    private speed: number = 64;

    private timer: number = 0;

    constructor(textbox: HTMLElement, text: string) {
        this.text = text;
        this.textbox = textbox;

        // write all text as invisible spans.
        for (let i = 0; i < this.text.length; i++) {
            let span: HTMLElement = document.createElement("span");
            span.classList.add("hidden-text");

            // stick trailing whitespace in with the preceding character,
            // so that it "doesn't count".
            if (i+1 < this.text.length && this.text[i+1] === " ") {
                span.textContent = this.text[i] + this.text[i+1];
            } else {
                span.textContent = this.text[i];
            }

            this.textbox.appendChild(span);
        }

        this.pointer = this.textbox.firstChild as HTMLElement;
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
}
