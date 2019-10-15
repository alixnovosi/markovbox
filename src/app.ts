import { Markov } from "./markov";
import { TextBox } from "./textbox";

import ElementResizeDetector from "element-resize-detector";

import "./styles/main.scss";

class App {
    private base: HTMLElement;

    private markov: Markov;

    private textbox: TextBox = null;
    private text_length: number = 500;

    private erd: ElementResizeDetector.Erd;

    // track old time so we can provide dt to textbox.
    private old_time: number = null;

    // track animation id to cancel it.
    private animation_frame_id: number;

    // to make sure we only schedule one redraw at once.
    private redraw_in_progress = false;

    constructor() {
        this.markov = new Markov();

        this.erd = new ElementResizeDetector({
            callOnAdd: false,
            strategy: "scroll",
        });

        this.base = document.getElementById("app") as HTMLElement;

        let textbox_elem = document.createElement("div");
        textbox_elem.classList.add("textbox");
        textbox_elem.id = "markovbox";

        this.base.appendChild(textbox_elem);

        this.textbox = new TextBox(textbox_elem);

        this.erd.listenTo(
            document.getElementById("markovbox"),
            this.resize_callback(),
        );
    }

    public setup(): void {
        let text = this.markov.create_text_block(this.text_length);

        this.textbox.set_text(text);

        this.old_time = null;
    }

    // render as long as there's text left TO render.
    public render(timestamp: DOMHighResTimeStamp): void {
        this.animation_frame_id = null;

        let dt: number = 0;
        if (timestamp && this.old_time) {
            dt = timestamp - this.old_time;
        }

        let res = this.textbox.render_step(dt);

        if (res && !this.animation_frame_id) {
            this.old_time = timestamp;
            this.animation_frame_id = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    // called in textbox when textbox is resized to new dimensions.
    public resize_callback(): (element: HTMLElement) => void {
        return (element: HTMLElement) => {
            if (this.redraw_in_progress) {
                return;
            }

            this.redraw_in_progress = true;
            // cancel animation and reset some stats.
            if (this.animation_frame_id) {
                window.cancelAnimationFrame(this.animation_frame_id);
                this.animation_frame_id = null;
            }

            // fudged.
            let charwidth = 10;
            let charheight = 15;

            let padding = 15;

            // do some loose row calculations,
            // at every point estimating low so we ideally don't overshoot the box.
            let rows = Math.floor((element.offsetHeight-(2*padding)) / charheight)-1;
            let cols = Math.floor((element.offsetWidth-(2*padding)) / charwidth);

            let old_text_length = this.text_length;

            this.text_length = rows * cols;

            // don't bother doing anything for unchanged length.
            if (old_text_length !== this.text_length) {
                this.setup();
            } else {
                this.text_length = old_text_length;
            }

            this.redraw_in_progress = false;
            this.render(null);
        }
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
    app.render(null);
}
