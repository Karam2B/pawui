import { noSerialize, $, Slot, component$, isDev, useSignal, useStylesScoped$, useTask$, useVisibleTask$, NoSerialize } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";

import { RouterHead } from "./components/router-head/router-head";
import "./global.css";
import { allowedNodeEnvironmentFlags } from "process";


export type GlobalIdent = {
    plugin: string,
    id: string
}

export type Keymap = {
    action_id: GlobalIdent,
    mode: string,
    keystroke: {
        mode: "one_presdown",
        key: KeySet,
        alt_pressed: boolean,
        ctrl_pressed: boolean
    }
}

export type Mode = {
    id: string,
    allow_input_to_pass: boolean,
    view: {
        bg: string,
        fg: string,
    },
    enter_dom: () => void,
    exit_dom: () => void
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

function command_line() {

}
const core_modes = [{
    id: "navigate",
    allow_input_to_pass: false,
    view: {
        fg: "black", bg: "oklch(72.3% 0.219 149.579)"
    },
    enter_dom: () => {
        if (!window) {
            console.error("window not found");
            return
        }
        let elem = window.document.querySelector('[data-navigate="element"]');
        if (!elem) {
            console.error("navigate was not found")
            return
        }
        // @ts-ignore
        window.document.activeElement.blur();
    },
    exit_dom: () => { },
},
{
    id: "command",
    allow_input_to_pass: true,
    view: {
        fg: "black", bg: "oklch(70.4% 0.191 22.216)"
    },
    enter_dom: () => {
        if (!window) {
            console.error("window not found");
            return
        }
        let command: HTMLInputElement | null = window.document.querySelector("input[data-command]")
        if (!command) {
            return
        }
        command.focus()
    },
    exit_dom: () => {

    },
}];


const core_actions = [
    [
        navigate_left,
        "navigate",
        { key: "h", alt_pressed: false, ctrl_pressed: false }
    ],
    [
        navigate_right,
        "navigate",
        { key: "l", alt_pressed: false, ctrl_pressed: false }
    ]
] as Array<[() => void, string, null | Keymap["keystroke"]]>

const insert_actions = {
    "\\": null, "|": null, "\"": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null, "9": null, "0": null, "-": null, "=": null, "!": null, "@": null, "#": null,
    "$": null, "%": null, "^": null, "&": null, "*": null, "(": null, ")": null, "_": null, "+": null, "`": null, "~": null, "q": null, "w": null, "e": null, "r": null, "t": null, "y": null, "u": null, "i": null, "o": null, "p": null, "[": null, "]": null, "a": null, "s": null, "d": null, "f": null, "g": null, "h": null, "j": null, "k": null,
    "l": null, ";": null, "'": null, "z": null, "x": null, "c": null, "v": null, "b": null, "n": null, "m": null, ",": null, ".": null, "/": null, "Q": null, "W": null, "E": null, "R": null, "T": null, "Y": null, "U": null, "I": null, "O": null, "P": null, "{": null,
    "}": null, "A": null, "S": null, "D": null, "F": null, "G": null, "H": null, "J": null, "K": null, "L": null, ":": null, "Z": null, "X": null, "C": null, "V": null, "B": null, "N": null, "M": null, "<": null, ">": null, "?": null,
}


export default component$(() => {
    let layout_ready_in = useSignal(1);

    let actions = useSignal<Map<string, () => void>>(new Map());
    let add_action = $(async (id: GlobalIdent, action: () => void) => {
        actions.value.set(JSON.stringify([id.plugin, id.id]), action)
    });
    let fire_action = $((id: GlobalIdent) => {
        let found = actions.value.get(JSON.stringify([id.plugin, id.id]));
        if (found) {
            console.info("performing action: ", id)
            found()
        } else {
            console.error("action: ", id, " was not registered")
        }
    })

    let keymaps = useSignal<Array<Keymap>>([]);
    let add_keymap = $(async (km: Keymap) => {
        // keymaps.value = [...keymaps.value, km]
        keymaps.value.push(km)
        // console.log("keymaps", keymaps.value)
    })

    // set up core plugin!
    useVisibleTask$(async () => {
        // for (const letter in insert_actions) {
        //     add_keymap({
        //         mode: "command",
        //         action_id: {
        //             plugin: "core",
        //             id: "insert_pass",
        //         },
        //         keystroke: {
        //             mode: "one_presdown",
        //             key: letter as any,
        //             alt_pressed: false,
        //             ctrl_pressed: false
        //         }
        //     })
        // }
        for (const item of core_actions) {
            let key = item[0].name;
            let action = item[0];
            await add_action({ plugin: "core", id: key }, action);

            let keymap = item[2];
            let mode = item[1];
            if (keymap) {
                add_keymap({
                    mode: mode,
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

    let current = useSignal<Omit<Mode, "enter_dom" | "exit_dom">>({
        id: "navigate",
        allow_input_to_pass: false,
        view: {
            fg: "black", bg: "oklch(72.3% 0.219 149.579)"
        },
    });

    // registering keyboard event
    let keydown_event = $(async (ev: KeyboardEvent) => {
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
            // console.log("finding", keymap.action_id.id, keymap.keystroke.ctrl_pressed, !ev.ctrlKey)
            switch (keymap.keystroke.mode) {
                case "one_presdown": {
                    if (keymap.mode != current.value.id) {
                        return false
                    }
                    if (keymap.keystroke.key != ev.key) {
                        return false
                    }
                    if (keymap.keystroke.alt_pressed && !ev.altKey) {
                        return false
                    }
                    if (keymap.keystroke.ctrl_pressed && !ev.ctrlKey) {
                        return false
                    }

                }
            }
            return true
        })

        if (!found) { console.error("keystroke did not match any keymap"); return }
        await fire_action(found.action_id);
    });
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
    useVisibleTask$(({ cleanup, track }) => {
        track(current)

        async function prevent_def(ev: KeyboardEvent) {
            // @ts-ignore
            let found = insert_actions[ev.key];
            if (current.value.allow_input_to_pass && found == null && !ev.altKey && !ev.ctrlKey) {
                console.log("input is allowed to pass");
            } else {
                ev.preventDefault();
                await keydown_event(ev);
            }
        }
        async function keydown(ev: KeyboardEvent) { ev.preventDefault() }
        window.addEventListener("keydown", prevent_def);
        window.addEventListener("keyup", keydown);
        cleanup(() => {
            window.removeEventListener("keydown", prevent_def);
            window.removeEventListener("keyup", keydown);
        })
    }, { strategy: "document-ready" })
    let modes = useSignal<NoSerialize<Array<Mode>>>(undefined);
    useVisibleTask$(() => {
        modes.value = noSerialize(
            core_modes
        )
    }, { strategy: "document-ready" })

    let change_mode = $((id: string) => {
        let found = modes.value?.find((e) => { e.id == id })
        if (found) {
            current.value = { id: found.id, view: found.view, allow_input_to_pass: found.allow_input_to_pass }
        }
    });
    useVisibleTask$(async ({ track }) => {
        if (modes.value == undefined) {
            track(modes)
            return
        }
        await add_action({ plugin: "core", id: "go_to_navigate_mode" }, () => {
            let found = modes.value?.find((e) => {
                // console.log("find mode", e, e.id == "command");
                return e.id == "navigate"
            })
            if (found) {
                current.value = { id: found.id, view: found.view, allow_input_to_pass: found.allow_input_to_pass }
            } else {
                console.error("no mode by name: ", "navigate", "available modes are", modes.value)
            }
        });
        await add_action({ plugin: "core", id: "go_to_normal_mode" }, () => {
            let found = modes.value?.find((e) => {
                // console.log("find mode", e, e.id == "command");
                return e.id == "command"
            })
            if (found) {
                current.value = { id: found.id, view: found.view, allow_input_to_pass: found.allow_input_to_pass }
            } else {
                console.error("no mode by name: ", "command", "available modes are", modes.value)
            }
        });
        await add_keymap({
            mode: "command",
            action_id: {
                plugin: "core",
                id: "go_to_navigate_mode",
            },
            keystroke: {
                mode: "one_presdown", key: "d", ctrl_pressed: true, alt_pressed: false
            }
        })
        await add_keymap({
            mode: "navigate",
            action_id: {
                plugin: "core",
                id: "go_to_normal_mode",
            },
            keystroke: {
                mode: "one_presdown", key: ";", ctrl_pressed: true, alt_pressed: false
            }
        })
    }, { strategy: "document-ready" })
    useVisibleTask$(({ cleanup, track }) => {
        if (modes.value == undefined) {
            track(modes)
            return
        }
        track(current);
        let actions = modes.value.find((d) => d.id == current.value.id);
        if (actions == undefined) {
            console.error("error: cannot find ", current.value.id)
            return
        }
        actions.enter_dom()
        cleanup(() => actions?.exit_dom())
    }, { strategy: "document-ready" })
    useTask$(async () => {
        await change_mode("command")
        layout_ready_in.value--
    })

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
                            {layout_ready_in.value == 0 &&
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
                                        <input data-command="main" placeholder="click ctrl + ; to go to command mode" class="w-full" type="text" />
                                    </div>
                                </>
                            }
                            <RouterOutlet />
                        </div>
                    </div>
                    <div class="bar bg-slate-900 text-white flex">
                        {current.value &&
                            <div style={{ background: current.value.view.bg, color: current.value.view.fg }}>{current.value.id.toUpperCase()}</div>
                        }
                        <div>location: /</div>
                    </div>
                </div>
            </body >
        </QwikCityProvider >
    );
});

export const FeedItem = component$(() => {
    return <div class=" rounded p-2"><Slot /></div>
})

type KeySet = "tab" | ":" | "q" | "w" | "e" | "r" | "t" | "y" | "u" | "i" | "o" | "p" | "[" | "{" | "]" | "}" | "a" | "s" | "d" | "f" | "g" | "h" | "j" | "k" | "l" | ";" | ":" | "'" | "\"" | "z" | "x" | "c" | "v" | "b" | "n" | "m" | " < " | "." | " > " | " / " | " ? " | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "-" | "=" | "`" | "~" | "!" | "@" | "#" | "$" | "%" | "^" | "&" | "*" | "(" | ")" | "_" | "+"
