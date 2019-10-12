#!/usr/bin/env python3

import argparse
import collections
import re

# keep generated text reasonably wrapped.
LINELENGTH = 100

def main():
    parser = argparse.ArgumentParser(
        description="Tokenize a file into a list in a typescript file.",
    )

    parser.add_argument(
        "INFILE",
        help="file to be split into tokens",
        type=str,
    )

    parser.add_argument(
        "--out-name",
        dest="out_name",
        help="out-name for typescript output file. TS will be appended.",
        type=str,
    )

    parser.add_argument(
        "--class-name",
        dest="class_name",
        default=None,
        help="class_name if it shouldn't be Tokens.",
        type=str,
    )

    parser.add_argument(
        "--start-line",
        dest="start_line",
        default=None,
        help="line to start at in the file, if not 1. 1-based index, please. inclusive.",
        type=int,
    )

    parser.add_argument(
        "--end-line",
        dest="end_line",
        default=None,
        help=(
            "line to end at in the file, if not whatever the length is. 1-based index, please. "
            "inclusive."
        ),
        type=int,
    )

    args = parser.parse_args()

    if args.class_name is None:
        class_name = "Tokens"
    else:
        class_name = args.class_name

    outfile = f"{args.out_name}.ts"

    indent_level = 0;

    # hm
    listjoin = lambda x: " "*4*indent_level + "\"" + "\", \"".join(x) + "\","
    formatline = lambda indent, string: f"{' '*indent*4}{string}\n"

    # generate out lines and write all at once.
    out_lines = []

    # wrap in typescript stuff.
    out_lines.append(formatline(indent_level, f"export default class {class_name} " + "{"))
    indent_level += 1

    out_lines.append(formatline(indent_level, f"public tokens: string[] = ["))
    indent_level += 1

    raw_lines = []
    isalpha_pattern = re.compile(r"[0-9a-zA-Z]")
    with open(args.INFILE, mode="r", encoding="UTF-8") as rf:
        for i, line in enumerate(rf):
            # respect start/end lines.
            # start/end line args 1-based indices.
            if args.start_line and i+1 < args.start_line:
                continue

            if args.end_line and i+1 > args.end_line:
                continue

            cleaned = line.strip()
            if len(cleaned) > 0:
                raw_lines.append(cleaned)

    pattern = re.compile(r"\[[0-9]+\]")

    tokenline = collections.deque()
    for i, line in enumerate(raw_lines):
        print(f"processed line {i+1} of {len(raw_lines)}")

        # add in new words from the line we're on.
        for raw_word in line.split(" "):
            # filter out citations.
            word = pattern.sub("", raw_word)

            if len(word) > 0:
                tokenline.append(word)

        # break proposed line into chunks that fit under linelength.
        proposed_line = listjoin(tokenline)
        while len(proposed_line) > LINELENGTH:

            chunk = collections.deque()
            proposed_chunk = listjoin(chunk)
            while len(proposed_chunk) < LINELENGTH:
                chunk.append(tokenline.popleft())
                proposed_chunk = listjoin(chunk)

            # remove that last chunk that pushed us over the limit.
            if len(proposed_chunk) >= LINELENGTH:
                tokenline.appendleft(chunk.pop())
                proposed_chunk = listjoin(chunk)

            # write chunk and update proposed line.
            out_lines.append(formatline(0, proposed_chunk))
            proposed_line = listjoin(tokenline)

        # with what's left over,
        # write it if it's more than 3/4 the linelength,
        # otherwise save to be overflow.
        # because we don't want to output lines that are too short.
        # we're trying to break up line breaks in the original text, essentially.
        if len(proposed_line) > (LINELENGTH * 3)//4:
            out_lines.append(formatline(0, proposed_line))
            tokenline = collections.deque()

    # don't forget leftover overflow.
    # doesn't wrap properly.
    if len(tokenline) > 0:
        proposed_line = listjoin(tokenline)
        out_lines.append(formatline(0, proposed_line))

    # trailing outfile nonsense
    indent_level -= 1;
    out_lines.append(formatline(indent_level, "];"))

    indent_level -= 1;
    out_lines.append(formatline(indent_level, "}"))

    open(outfile, mode="w", encoding="UTF-8").write("".join(out_lines))


if __name__ == "__main__":
    main()
