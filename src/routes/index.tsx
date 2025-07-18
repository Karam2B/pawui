import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
    return (
        <div />
    );
});

export const head: DocumentHead = {
    title: "Welcome to PawUI",
    meta: [
        {
            name: "description",
            content: "PawUI is keyboard-centric approach to UI",
        },
    ],
};
