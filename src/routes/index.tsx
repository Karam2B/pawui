import { Slot, component$, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

type KeySet = "tab" | "shift" | "ctrl" | ":" | "q" | "w" | "e" | "r" | "t" | "y" | "u" | "i" | "o" | "p" | "[" | "{" | "]" | "}" | "a" | "s" | "d" | "f" | "g" | "h" | "j" | "k" | "l" | ";" | ":" | "'" | "\"" | "z" | "x" | "c" | "v" | "b" | "n" | "m" | " < " | "." | " > " | " / " | " ? " | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "-" | "=" | "`" | "~" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")" | "_" | "+"

export const Key = component$((p: { item: KeySet }) => {
    useStylesScoped$(`
.key + .key { margin-left: 0 } 
.key {
   margin: 0px 5px;
   box-shadow: 0 2px 0px 1px rgba(0,0,0,0.3);
}`);
    return <key class="key bg-slate-300 rounded px-1 shadow-md">{p.item}</key>
})

export const FeedItem = component$(() => {
    return <div class=" rounded p-2"><Slot /></div>
})



export default component$(() => {
    useStylesScoped$(`
        .bar > :global(div) { padding: 0 0.4em 
        /* TODO: if child is of different color add border! */
        }
        .feed > :global(div) { margin: 0.3em 0em; padding: 0.2em 0.5em }
        .feed > :global(div:last-child) { margin-bottom: 0.6em }
    `);

    return (
            <div class="feed w-max-full w-[400px] flex flex-col">
                <div class="flex-1" />
                <FeedItem>Click <Key item="ctrl" /><Key item="n" /> to go to navigate mode from anywhere</FeedItem>
                <FeedItem>Click <Key item="ctrl" /><Key item=":" /> to go to command mode</FeedItem>
                <div class="rounded m-4 px-1 bg-slate-200 focus-within:bg-white focus-within:ring focus-within:ring-1 focus-within:ring-slate">
                    <input placeholder="click ctrl+: to go to command mode" class="w-full" type="text" />
                </div>
            </div>
    );
});

export const head: DocumentHead = {
    title: "Welcome to Qwik",
    meta: [
        {
            name: "description",
            content: "Qwik site description",
        },
    ],
};
