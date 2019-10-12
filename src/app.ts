import { Markov } from "./markov";

import "./styles/main.scss";

class App {
    private markov: Markov;
    private base: HTMLElement;

    public setup(): void {
        this.markov = new Markov();

        this.base = <HTMLElement>document.getElementById("app");

        for (let i = 0; i < 1; i++) {
            let sentence = this.markov.create_text_block(800);
            console.log(sentence);
            console.log(`sentence len is ${sentence.length}`);
        }
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
}
