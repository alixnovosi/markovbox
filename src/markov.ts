import HolmesScarlett from "./HolmesScarlett";

export class Markov {
    private ending_punctuation: string[] = [".", "?", "!"];
    private punctuation: string[] = [",", ";", ...this.ending_punctuation];
    public mark_dict: Map<string, string[]> = new Map();
    public mark_keys: string[] = [];

    // return ending char if token ends in comma/period/something else
    // which logically should be special cased.
    private ends_punct(token: string): string|null {
        let token_length = token.length;
        let last = token[token_length-1];
        for (let punct of this.punctuation) {
            if (last === punct) {
                return last;
            }
        }

        return null;
    }

    constructor() {
        for (let punct of this.punctuation) {
            this.mark_dict.set(punct, []);
            this.mark_keys.push(punct);
        }

        // build markov dict.
        // order one for now.
        let tokens = new HolmesScarlett().tokens;
        let j = 1;
        for (let i = 0; i < tokens.length; i++, j++) {
            let token = tokens[i];

            // get next token or indicate we're at the end of the text.
            let next_token: string|null;
            let next_punct;
            // clean up next token as well.
            let clean_next_token: string;
            if (j < tokens.length) {
                next_token = tokens[j];
                next_punct = this.ends_punct(next_token);

                if (next_punct !== null) {
                    clean_next_token = next_token.substring(0, next_token.length-1);
                } else {
                    clean_next_token = next_token;
                }
            } else {
                next_token = null;
            }

            // check punctuation first.
            let token_punct = this.ends_punct(token);
            let clean_token: string;
            if (token_punct !== null) {
                clean_token = token.substring(0, token.length-1);
            } else {
                clean_token = token;
            }

            // ensure we always have an entry for this token.
            if (!this.mark_dict.has(clean_token)) {
                this.mark_dict.set(clean_token, []);
                this.mark_keys.push(clean_token);
            }

            if (token_punct !== null) {
                // if we found punctuation,
                // mark that the next token can come after that punctuation.
                let current_entries = this.mark_dict.get(token_punct);
                if (next_token && current_entries.indexOf(next_token) === -1) {
                    this.mark_dict.get(token_punct).push(
                        // clean tokens we put in dict without punctuation.
                        clean_next_token
                    );
                }

                current_entries = this.mark_dict.get(clean_token);
                if (current_entries.indexOf(token_punct) === -1) {
                    current_entries.push(token_punct);
                }

            } else {
                // otherwise, add this token to the map if necessary and then
                // say next_token comes after token.
                let current_entries = this.mark_dict.get(clean_token);
                if (next_token && current_entries.indexOf(clean_next_token) === -1) {
                    current_entries.push(
                        clean_next_token
                    );
                }
            }
        }
    }

    // create text block with hard-capped length.
    public create_text_block(len: number): string {
        let output: string[] = [];
        let joined = output.join(" ");

        // don't try to exactly fill the length, leave a possibility of a gap.
        while (joined.length < (len * (9/10))) {
            let sentence = this.create_capped_sentence();
            output.push(sentence);
            joined = output.join(" ");

            if (joined.length > len) {
                output.pop();
                joined = output.join(" ");
            }
        }

        return joined;
    }

    // create sentence ended with punctuation.
    public create_capped_sentence(): string {
        let out: string[] = [];

        // get a random word AFTER a punctuation character.
        // so that we start a sensible sentence.
        let i = Math.floor(Math.random() * this.ending_punctuation.length);

        let key = this.ending_punctuation[i];
        let entries = this.mark_dict.get(key);
        key = entries[Math.floor(Math.random() * entries.length)];

        // run once because the loop will fail otherwise.
        // this can't be a do-while because we don't want to put the punctuation
        // we used to start our phrase into the start of the sentence.
        out.push(key);
        entries = this.mark_dict.get(key);
        key = entries[Math.floor(Math.random() * entries.length)];

        while (this.ending_punctuation.indexOf(key) === -1) {
            if (this.punctuation.indexOf(key) !== -1) {
                out.push(`${key}`);
            } else {
                out.push(` ${key}`);
            }

            entries = this.mark_dict.get(key);
            key = entries[Math.floor(Math.random() * entries.length)];
        }

        // don't forget to add trailing punctuation.
        out.push(`${key}`);

        return out.join("");
    }

    // create sentence hard-capped to a length.
    // does not care if it ends in punctuation.
    public create_sentence(length: number): string {
        // get a random word AFTER a punctuation character.
        // so that we start a sensible sentence.
        let i = Math.floor(Math.random() * (this.punctuation.length-2)) + 2;

        let key = this.punctuation[i];
        let entries = this.mark_dict.get(key);
        key = entries[Math.floor(Math.random() * entries.length)];

        let phrase: string = "";

        // TODO keep going until a punctuation, or something.
        while (phrase.length < length) {
            if (this.punctuation.indexOf(key) !== -1) {
                phrase += `${key}`;
            } else {
                phrase += ` ${key}`;
            }

            entries = this.mark_dict.get(key);
            key = entries[Math.floor(Math.random() * entries.length)];
        }

        return phrase;
    }
}
