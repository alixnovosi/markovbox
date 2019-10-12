import HolmesScarlett from "./HolmesScarlett";

export class Markov {
    private punctuation: string[] = [".", ",", "?", "!"];
    public mark_dict: Map<string, string[]> = new Map();

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

                    if (clean_next_token === "on!") {
                        console.log(`clean next is ${clean_next_token}`);
                    }
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
}
