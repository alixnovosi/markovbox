import { Markov } from "./markov";
import { TextBox } from "./textbox";

import ElementResizeDetector from "element-resize-detector";

import "./styles/main.scss";

class App {
    private base: HTMLElement;
    private textbox_elem: HTMLElement;

    private markov: Markov;

    private textbox: TextBox;
    private text_length: number = 500;

    private erd: ElementResizeDetector.Erd;

    // track old time so we can provide dt to textbox.
    private old_time: number = null;

    // track animation id to cancel it.
    private animation_frame_id: number;

    constructor() {
        this.markov = new Markov();

        this.base = document.getElementById("app") as HTMLElement;

        // hold on to this so it can be cleaned up when we make new textboxes.
        this.textbox_elem = document.createElement("div");
        this.textbox_elem.classList.add("textbox");
        this.textbox_elem.id = "markovbox";

        this.base.appendChild(this.textbox_elem);
        this.erd = new ElementResizeDetector({
            callOnAdd: false,
            strategy: "scroll",
        });
    }

    public setup(): void {
        console.log("setup ran");

        let text = this.markov.create_text_block(this.text_length);
        this.textbox = new TextBox(this.textbox_elem, text);

        this.erd.listenTo(this.textbox_elem, (element) => {
            this.resize_callback(element.offsetHeight, element.offsetWidth);
        });

        this.render(null);
    }

    // render as long as there's text left TO render.
    public render(timestamp: DOMHighResTimeStamp): void {
        let dt: number = 0;
        if (timestamp && this.old_time) {
            dt = timestamp - this.old_time;
        }

        let res = this.textbox.render_step(dt);

        if (res) {
            this.old_time = timestamp;
            this.animation_frame_id = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    // remove all children of textbox so it's ready to go again.
    public clean_textbox_elem() {
        this.erd.removeAllListeners(this.textbox_elem);

        while (this.textbox_elem.firstChild) {
            this.textbox_elem.removeChild(this.textbox_elem.firstChild);
        }

        this.textbox_elem.classList.add("textbox");
        this.textbox_elem.id = "markovbox";
    }

    // called in textbox when textbox is resized to new dimensions.
    public resize_callback(height: number, width: number) {
        console.log(`height ${height} width ${width}`);

        // cancel animation and reset some stats.
        if (this.animation_frame_id) {
            window.cancelAnimationFrame(this.animation_frame_id);
            this.animation_frame_id = null;
        }

        this.old_time = null;

        // fudged.
        let charwidth = 10;
        let charheight = 15;

        let rows = Math.floor(height / charheight);
        let cols = Math.floor(width / charwidth);

        this.text_length = rows * cols;

        this.clean_textbox_elem();
        this.setup();
    }
}

window.onload = () => {
    let app = new App();
    app.setup();
}
