import { Markov } from "./markov";

import "./styles/main.scss";

class App {
    private markov: Markov;

    public setup(): void {
        this.markov = new Markov();

        console.log(this.markov.mark_dict);
    }
}

window.onload = () => {
    let app = new App();

    app.setup();
}
