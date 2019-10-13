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
        this.render(null);
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
            // cancel animation and reset some stats.
            if (this.animation_frame_id) {
                window.cancelAnimationFrame(this.animation_frame_id);
                this.animation_frame_id = null;
            }

            // fudged.
            let charwidth = 10;
            let charheight = 15;

            let padding = 15;

            let rows = Math.floor((element.offsetHeight-(2*padding)) / charheight);
            let cols = Math.floor((element.offsetWidth-(2*padding)) / charwidth);

            this.text_length = rows * cols;

            this.setup();
        }
    }
}

window.onload = () => {
    let app = new App();
    app.setup();
}
