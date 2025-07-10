import { component$, useStylesScoped$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    useStylesScoped$(`
        .bar > div { padding: 0 0.5em }

    `);

    return (
        <div class="flex flex-col h-screen">
            <div class="root flex-1">
                hello world
            </div>
            <h1 class="bar bg-slate-800 text-white flex">
                <div class="bg-green-500 text-black">COMMAND</div>
                <div>/</div>
            </h1>
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
