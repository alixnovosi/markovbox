import { Markov } from "./markov";

import "./styles/main.scss";

class App {
    private markov: Markov;

    public setup(): void {
        this.markov = new Markov();

        for (let i = 0; i < 10; i++) {
            let sentence = this.markov.create_sentence(100);
            console.log(sentence);
        }
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
}
