import HolmesScarlett from "./HolmesScarlett";

export class Markov {
    private ending_punctuation: string[] = [".", "?", "!"];
    private punctuation: string[] = [",", ";", ...this.ending_punctuation];
    public mark_dict: Map<string, string[]> = new Map();
    public mark_keys: string[] = [];

    // words that naïve code might think have punctuation in them.
    private fake_punctuation: string[] = ["Mr.", "Mrs."];

    // return ending char if token ends in comma/period/something else
    // which logically should be special cased.
    private ends_punct(token: string): string|null {
        // catch fake punctuation.
        if (this.fake_punctuation.indexOf(token) !== -1) {
            return null;
        }

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
        let one_ago = null;
        let two_ago = null;
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

            // TODO I think we can unify a lot of code in these two cases.
            if (token_punct !== null) {
                // if we found punctuation,
                // mark that the next token can come after that punctuation.

                //////// FIRST ORDER ///////
                let current_entries = this.mark_dict.get(token_punct);
                if (next_token && current_entries.indexOf(next_token) === -1) {
                    this.mark_dict.get(token_punct).push(
                        // clean tokens we put in dict without punctuation.
                        clean_next_token
                    );
                }

                // mark that punctuation can come after current token.
                current_entries = this.mark_dict.get(clean_token);
                if (current_entries.indexOf(token_punct) === -1) {
                    current_entries.push(token_punct);
                }

                //////// SECOND ORDER ///////
                //////// THIRD ORDER  ///////
                // we also do second/third order here.
                // we need to init the dictionary.
                let punct_one = [one_ago, token_punct].join(" ");
                let punct_two = [two_ago, one_ago, token_punct].join(" ");
                if (one_ago) {
                    if (!this.mark_dict.get(punct_one)) {
                        this.mark_dict.set(punct_one, []);
                        this.mark_keys.push(punct_one);
                    }

                    this.mark_dict.get(punct_one).push(clean_next_token);
                }

                if (two_ago) {
                    if (!this.mark_dict.get(punct_two)) {
                        this.mark_dict.set(punct_two, []);
                        this.mark_keys.push(punct_two);
                    }

                    this.mark_dict.get(punct_two).push(clean_next_token);
                }

                // update one_ago, two_ago.
                two_ago = one_ago;
                one_ago = token_punct;

            } else {
                // otherwise, add this token to the map if necessary and then
                // say next_token comes after token.
                let current_entries = this.mark_dict.get(clean_token);
                if (next_token && current_entries.indexOf(clean_next_token) === -1) {
                    current_entries.push(
                        clean_next_token
                    );
                }

                //////// SECOND ORDER ///////
                //////// THIRD ORDER  ///////
                // we also do second/third order here.
                // we need to init the dictionary.
                let this_and_one = [one_ago, clean_token].join(" ");
                if (one_ago && !this.mark_dict.has(this_and_one)) {
                    this.mark_dict.set(this_and_one, []);
                    this.mark_keys.push(this_and_one);
                }

                let this_and_two = [two_ago, one_ago, clean_token].join(" ");
                if (two_ago && !this.mark_dict.has(this_and_two)) {
                    this.mark_dict.set(this_and_two, []);
                    this.mark_keys.push(this_and_two);
                }

                if (one_ago) {
                    if (!this.mark_dict.get(this_and_one)) {
                        this.mark_dict.set(this_and_one, []);
                    }

                    this.mark_dict.get(this_and_one).push(clean_next_token);
                }

                if (two_ago) {
                    if (!this.mark_dict.get(this_and_two)) {
                        this.mark_dict.set(this_and_two, []);
                    }

                    this.mark_dict.get(this_and_two).push(clean_next_token);
                }

                // update one_ago, two_ago.
                two_ago = one_ago;
                one_ago = clean_token;
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

        let two_ago = null;
        let one_ago = null;

        // get a random word AFTER a punctuation character.
        // so that we start a sensible sentence.
        let key = this.ending_punctuation[Math.floor(Math.random() *
                                                     this.ending_punctuation.length)];

        let entries = this.mark_dict.get(key);

        key = entries[Math.floor(Math.random() * entries.length)];

        // run once because the loop will fail otherwise.
        // this can't be a do-while because we don't want to put the punctuation
        // we used to start our phrase into the start of the sentence.
        out.push(key);
        entries = this.mark_dict.get(key);
        key = entries[Math.floor(Math.random() * entries.length)];

        while (this.ending_punctuation.indexOf(key) === -1) {
            if (this.punctuation.indexOf(key) === -1) {
                out.push(" ");
            }
            out.push(key);

            entries = null;
            // try third order, then two if that fails, then one.
            if (two_ago && one_ago) {
                entries = this.mark_dict.get([two_ago, one_ago, key].join(" "));
            }

            if (one_ago && !entries) {
                entries = this.mark_dict.get([one_ago, key].join(" "));
            }

            if (!entries) {
                entries = this.mark_dict.get(key);
            }

            two_ago = one_ago;
            one_ago = key;

            // TODO a hack to fail out if necessary.
            if (!entries || entries.length === 0) {
                key = ".";
            } else {
                key = entries[Math.floor(Math.random() * entries.length)];
            }
        }

        // don't forget to add trailing punctuation.
        out.push(key);

        return out.join("");
    }
}
