import { component$, isDev, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

import "./global.css";

export const GoogleComp = component$(() => {
    useVisibleTask$(() => {
        window.onkeydown?.(((ev: KeyboardEvent) => {
            if (ev.key == "f" && ev.ctrlKey) {
                // navigate to google.com
            }
        }) as any);
    }, { strategy: "document-ready" });
    return <div />
})
export const FacebookComp = component$(() => {
    useVisibleTask$(() => {
        window.onkeydown?.(((ev: KeyboardEvent) => {
            if (ev.key == "f" && ev.ctrlKey) {
                // navigate to facebook.com
            }
        }) as any);
    }, { strategy: "document-ready" });
    return <div />
})

export default component$(() => {
    /**
     * The root of a QwikCity site always start with the <QwikCityProvider> component,
     * immediately followed by the document's <head> and <body>.
     *
     * Don't remove the `<head>` and `<body>` elements.
     */

    useStylesScoped$(`
        .bar > :global(div) { padding: 0 0.4em 
        /* TODO: if child is of different color add border! */
        }
    `);
    return (
        <QwikCityProvider>
            <head>
                <meta charset="utf-8" />
                {!isDev && (
                    <link
                        rel="manifest"
                        href={`${import.meta.env.BASE_URL}manifest.json`}
                    />
                )}
                <RouterHead />
            </head>
            <body lang="en">

                <div class="flex flex-col h-screen">
                    <div class="root flex-1 px-2 grid justify-center">
                        <RouterOutlet />
                    </div>
                    <h1 class="bar bg-slate-800 text-white flex">
                        <div class="bg-green-500 text-black">COMMAND</div>
                        <div>location: /</div>
                    </h1>
                </div>
            </body>
        </QwikCityProvider>
    );
});
