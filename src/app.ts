import { Markov } from "./markov";

import "./styles/main.scss";

class App {
    private markov: Markov;

    public setup(): void {
        this.markov = new Markov(32, 4712, "study_in_scarlett.txt");
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
}
