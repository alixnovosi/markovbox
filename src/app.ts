import { Markov } from "./markov";
import { TextBox } from "./textbox";

import "./styles/main.scss";

class App {
    private base: HTMLElement;
    private markov: Markov;
    private textbox: TextBox;

    // track old time so we can provide dt to textbox.
    private old_time: number;

    public setup(): void {
        this.markov = new Markov();

        this.base = document.getElementById("app") as HTMLElement;

        let text = this.markov.create_text_block(800);
        this.textbox = new TextBox(this.base, text);

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
            requestAnimationFrame(this.render.bind(this));
        }
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
}
