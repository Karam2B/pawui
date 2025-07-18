import { $, QRL, Signal, Slot, component$, createContextId, isDev, useContext, useContextProvider, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

import { RouterHead } from "./components/router-head/router-head";
import "./global.css";
import { useLoadingBoundary } from "./hooks/use_loading_boundary";
import { useKey } from "./hooks/use_key1";

export const core_ctx = createContextId<ReturnType<typeof useGenContextData>>("core");

export type GlobalIdent = {
    plugin: string,
    id: string
}

export type Keymap = {
    action_id: GlobalIdent,
    keystroke: {
        mode: "one_presdown",
        key: KeySet,
        alt_pressed: boolean,
        ctrl_pressed: boolean
    }
}

export type ModeTraitObject = {
    id: string,
}

function navigate_right() {
    if (!window) { return }
    let nav = window.document.querySelector("[data-navigate=\"element\"]");
    if (!nav) {
        return
    }
    let parent = window.document.querySelector("[data-navigate=\"parent\"]");
    if (!parent) {
        return
    }
    let prev = nav.nextElementSibling;
    if (prev) {
        nav.removeAttribute("data-navigate");
        prev.setAttribute("data-navigate", "element");
    } else {
        let prev_cont = window.document.querySelectorAll(`[data-container]`);
        // if (prev_cont) {
        //
        // }
    }
}
function navigate_left() {
    if (!window) { return }
    let nav = window.document.querySelector("[data-navigate=\"element\"]");
    if (!nav) {
        return
    }
    let parent = window.document.querySelector("[data-navigate=\"parent\"]");
    if (!parent) {
        return
    }
    let prev = nav.previousElementSibling;
    if (prev) {
        nav.removeAttribute("data-navigate");
        prev.setAttribute("data-navigate", "element");
    } else {
        let prev_cont = window.document.querySelectorAll(`[data-container]`);
        // if (prev_cont) {
        //
        // }
    }
}

const core_actions = {
    navigate_left: [
        navigate_left,
        { key: "h", alt_pressed: false, ctrl_pressed: false }
    ], navigate_right: [
        navigate_right,
        { key: "l", alt_pressed: false, ctrl_pressed: false }
    ]

} as Record<string, [() => void, null | Omit<Keymap["keystroke"], "mode">]>


const useGenContextData = () => {
    let actions = useSignal<Map<string, () => void>>(new Map());
    let keymaps = useSignal<Array<Keymap>>([]);

    // set up core plugin!
    useVisibleTask$(() => {
        for (const key in core_actions) {
            let action = core_actions[key][0];
            actions.value.set(JSON.stringify(["core", key]), action);

            let keymap = core_actions[key][1];
            if (keymap) {
                keymaps.value.push({
                    action_id: {
                        plugin: "core",
                        id: key,
                    },
                    keystroke: {
                        mode: "one_presdown",
                        key: keymap.key,
                        alt_pressed: keymap.alt_pressed,
                        ctrl_pressed: keymap.ctrl_pressed,
                    }
                })
            }
        }
    }, { strategy: "document-ready" });

    // registering keyboard event
    useVisibleTask$(({ cleanup, track }) => {
        track(() => keymaps);
        async function keydown(ev: KeyboardEvent) {
            if (ev.key == "Control" || ev.key == "Shift" || ev.key == "Alt") {
                return
            }

            let evk = {
                key: ev.key,
                alt: ev.altKey,
                ctrl: ev.ctrlKey,
            };
            console.info(`firing: ${JSON.stringify(evk)}`)
            let found = keymaps.value.find((keymap: Keymap) => {
                switch (keymap.keystroke.mode) {
                    case "one_presdown": {
                        if (keymap.keystroke.key != ev.key) {
                            return false
                        }
                        if (keymap.keystroke.alt_pressed && !ev.altKey) {
                            return false
                        }
                        if (keymap.keystroke.ctrl_pressed && !ev.ctrlKey) {
                            return false
                        }
                        return true

                    }
                }
            })

            if (!found) { console.info("keystroke did not match any keymap"); return }
            let action = actions.value.get(JSON.stringify([found.action_id.plugin, found.action_id.id]));
            if (!action) {
                console.error("action was not registered")
            } else {
                console.info("performing action")
                action()
            }
        }
        window.addEventListener("keydown", keydown);
        cleanup(() => {
            window.removeEventListener("keydown", keydown);
        })
    }, { strategy: "document-ready" })

    // prevent mouse input for now
    useVisibleTask$(({ cleanup }) => {
        function event_cb(ev: MouseEvent) {
            console.error("mouse input is not supported for now")
            ev.preventDefault();
        }
        window.addEventListener("mousedown", event_cb);
        cleanup(() => {
            window.removeEventListener("mousedown", event_cb);
        })
    }, { strategy: "document-ready" })

    // prevent brawser from capturing event
    useVisibleTask$(({ cleanup }) => {
        function prevent_def(ev: KeyboardEvent) {
            ev.preventDefault();
        }
        window.addEventListener("keydown", prevent_def);
        window.addEventListener("keyup", prevent_def);
        cleanup(() => {
            window.removeEventListener("keydown", prevent_def);
            window.removeEventListener("keyup", prevent_def);
        })
    }, { strategy: "document-ready" })

    return {}
}

export default component$(() => {
    let d = useGenContextData();
    useContextProvider(core_ctx, d);

    useStylesScoped$(`
        .bar > :global(div) { padding: 0 0.4em }
    `);

    useStylesScoped$(`
        .feed > :global(div) { margin: 0.3em 0em; padding: 0.2em 0.5em }
        .feed > :global(div:last-child) { margin-bottom: 0.6em }
    `);

    useStylesScoped$(`
       [data-navigate="element"] {background: red}
    `);

    let count = useSignal(0);
    // let [f, NavMode] = useKey({ plugin: "core", id: "navigate_mode" }, {
    //     loading_boundary: $(() => {
    //         count.value -= 1
    //     })
    // });

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
            <body lang="en" class="bg-100" style={{ userSelect: "none" }}>
                <div class="flex flex-col h-screen">
                    <div class="root flex-1 px-2 grid justify-center">
                        <div class="feed w-max-full w-[400px] flex flex-col">
                            {count.value == 0 &&
                                <>
                                    <div class="flex-1 " />
                                    <div data-navigate="parent" data-container="flex-row"
                                        class=" flex flex flex-wrap gap-1 ">
                                        <div>porro</div>
                                        <div>quisquam</div>
                                        <div>est</div>
                                        <div data-navigate={"element"} >qui</div>
                                        <div>dolorem</div>
                                        <div>ipsum</div>
                                        <div>quia</div>
                                        <div>dolor</div>
                                        <div>sit</div>
                                        <div>amet</div>
                                        <div>hi </div>
                                        <div>world</div>
                                    </div>
                                    <div class="rounded m-4 px-1 bg-200 focus-within:bg-100 focus-within:ring focus-within:ring-1 focus-within:ring-slate">
                                        <input placeholder="click ctrl+: to go to command mode" class="w-full" type="text" />
                                    </div>
                                </>
                            }
                            <RouterOutlet />
                        </div>
                    </div>
                    <h1 class="bar bg-slate-900 text-white flex">
                        <div class="bg-green-500 text-black">COMMAND</div>
                        <div>location: /</div>
                    </h1>
                </div>
            </body>
        </QwikCityProvider>
    );
});

export const FeedItem = component$(() => {
    return <div class=" rounded p-2"><Slot /></div>
})



type KeySet = "tab" | ":" | "q" | "w" | "e" | "r" | "t" | "y" | "u" | "i" | "o" | "p" | "[" | "{" | "]" | "}" | "a" | "s" | "d" | "f" | "g" | "h" | "j" | "k" | "l" | ";" | ":" | "'" | "\"" | "z" | "x" | "c" | "v" | "b" | "n" | "m" | " < " | "." | " > " | " / " | " ? " | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "-" | "=" | "`" | "~" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")" | "_" | "+"
