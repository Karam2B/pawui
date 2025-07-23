import { noSerialize, $, Slot, component$, isDev, useSignal, useStylesScoped$, useTask$, useVisibleTask$, NoSerialize } from "@builder.io/qwik";
import * as v from "valibot"
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";
import "./global.css";


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
    block_20_7e: "never" | "change_at_runtime" | "always",
    view: {
        bg: string,
        fg: string,
    },
    enter_dom: () => void,
    exit_dom: () => void
    runtime_value_schema: v.GenericSchema
}




const core_modes: Array<Mode> = [{
    id: "navigate",
    block_20_7e: "always",
    view: {
        fg: "black", bg: "oklch(72.3% 0.219 149.579)"
    },
    runtime_value_schema: v.object({}),
    enter_dom: () => {
        if (!window) {
            console.error("window not found");
            return
        }
        let elem = window.document.querySelector('[data-navigate-ty="cursor"]');
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
    block_20_7e: "never",
    view: {
        fg: "black", bg: "oklch(70.4% 0.191 22.216)"
    },
    runtime_value_schema: v.object({}),
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


// const core_actions = [
//     [
//         navigate_left,
//         "navigate",
//         { key: "h", alt_pressed: false, ctrl_pressed: false }
//     ],
//     [
//         navigate_right,
//         "navigate",
//         { key: "l", alt_pressed: false, ctrl_pressed: false }
//     ]
// ] as Array<[() => Promise<void>, string, null | Keymap["keystroke"]]>

const keys_20_7e = {
    " ": null, "\\": null, "|": null, "\"": null, "1": null, "2": null, "3": null, "4": null, "5": null, "6": null, "7": null, "8": null, "9": null, "0": null, "-": null, "=": null, "!": null, "@": null, "#": null,
    "$": null, "%": null, "^": null, "&": null, "*": null, "(": null, ")": null, "_": null, "+": null, "`": null, "~": null, "q": null, "w": null, "e": null, "r": null, "t": null, "y": null, "u": null, "i": null, "o": null, "p": null, "[": null, "]": null, "a": null, "s": null, "d": null, "f": null, "g": null, "h": null, "j": null, "k": null,
    "l": null, ";": null, "'": null, "z": null, "x": null, "c": null, "v": null, "b": null, "n": null, "m": null, ",": null, ".": null, "/": null, "Q": null, "W": null, "E": null, "R": null, "T": null, "Y": null, "U": null, "I": null, "O": null, "P": null, "{": null,
    "}": null, "A": null, "S": null, "D": null, "F": null, "G": null, "H": null, "J": null, "K": null, "L": null, ":": null, "Z": null, "X": null, "C": null, "V": null, "B": null, "N": null, "M": null, "<": null, ">": null, "?": null,
}


export default component$(() => {
    let layout_ready_in = useSignal(1);

    let actions = useSignal<Map<string, () => void>>(new Map());
    let add_action = $(async (id: GlobalIdent, action: () => Promise<void>) => {
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


    useVisibleTask$(() => {
        let id = 0;
        let prev = "null";
        let prev_container;

        let containers = window.document.querySelectorAll("[data-navigate-container]");
        for (const container of containers) {
            container.setAttribute("data-navigate-id", String(id))
            container.setAttribute("data-navigate-prev", prev)
            container.setAttribute("data-navigate-next", "null")
            prev = String(id);
            prev_container?.setAttribute("data-navigate-next", String(id))
            id++
            prev_container = container;
        }
        prev_container?.lastElementChild?.setAttribute("data-navigate-ty", "cursor");
    }, { strategy: "document-ready" });

    let x_dim = useSignal<number | null>(null);
    let y_dim = useSignal<number | null>(null);

    let navigate_right = $(() => {
        if (!window) { return }
        let nav = window.document.querySelector("[data-navigate-ty=\"cursor\"]");
        if (!nav) {
            return
        }
        let parent = window.document.querySelector("[data-navigate-ty=\"parent\"]");
        if (!parent) {
            return
        }
        x_dim.value = null;
        let prev = nav.nextElementSibling;
        if (prev) {
            nav.removeAttribute("data-navigate-ty");
            prev.setAttribute("data-navigate-ty", "cursor");
        } else {
            // let prev_cont = window.document.querySelectorAll(`[data-container]`);
            // // if (prev_cont) {
            // //
            // // }
        }
    });
    let navigate_left = $(() => {
        if (!window) { return }
        let nav = window.document.querySelector("[data-navigate-ty=\"cursor\"]");
        if (!nav) {
            return
        }
        let parent = window.document.querySelector("[data-navigate-ty=\"parent\"]");
        if (!parent) {
            return
        }
        x_dim.value = null;
        let prev = nav.previousElementSibling;
        if (prev) {
            nav.removeAttribute("data-navigate-ty");
            prev.setAttribute("data-navigate-ty", "cursor");
        } else {
            // let prev_cont = window.document.querySelectorAll(`[data-container]`);
            // // if (prev_cont) {
            // //
            // // }
        }
    });
    let navigate_up = $(() => {
        if (!window) { return }
        let cursor = window.document.querySelector("[data-navigate-ty=\"cursor\"]");
        if (!cursor) {
            return
        }
        let parent = cursor.parentElement;
        let prev_id = parent?.getAttribute("data-navigate-prev");
        let next_parent: Element | null | undefined;
        if (prev_id === "null") {
            next_parent = null
        } else {
            next_parent = window.document.querySelector("[data-navigate-id=\"" + prev_id + "\"")?.lastElementChild;
        }

        let parent_type = parent?.getAttribute("data-navigate-container");

        if (!parent || !parent_type || !prev_id || next_parent === undefined) {
            console.error("missing information for navigating", { parent, parent_type, prev_id, prev: next_parent })
            return
        }
        y_dim.value = null;

        let cursor_rect = cursor.getBoundingClientRect();
        let parent_rect = parent.getBoundingClientRect();
        let x_new = cursor_rect.x + (cursor_rect.width / 2) - parent_rect.x;
        if (x_dim.value === null) {
            x_dim.value = x_new;
        }
        let x = x_dim.value;
        let y = cursor_rect.y;
        let move_to = cursor.previousElementSibling;
        if (move_to === null) {
            move_to = next_parent
        }
        while (move_to != null) {
            let move_to_rect = move_to.getBoundingClientRect();
            let left = move_to_rect.x - parent_rect.x;
            let right = move_to_rect.x + move_to_rect.width - parent_rect.x;
            let top = move_to_rect.y;
            if (top < y && ((left < x && x < right) || (left < x && right < x))) {
                break
            }

            // console.log({ look_backward: look_backward.firstChild?.textContent, top, x, y, left })
            let lookbackwardx = move_to.previousElementSibling;
            if (!lookbackwardx) {
                move_to = next_parent
            } else {
                move_to = lookbackwardx
            }
        }

        if (move_to != null) {
            cursor.removeAttribute("data-navigate-ty");
            move_to.setAttribute("data-navigate-ty", "cursor");
        }
    });
    let navigate_down = $(() => {
        if (!window) { return }
        let cursor = window.document.querySelector("[data-navigate-ty=\"cursor\"]");
        if (!cursor) {
            return
        }
        let parent = cursor.parentElement;
        let prev_id = parent?.getAttribute("data-navigate-next");
        let next_container_child: Element | null | undefined;
        if (prev_id === "null") {
            next_container_child = null
        } else {
            next_container_child = window.document.querySelector("[data-navigate-id=\"" + prev_id + "\"")?.firstElementChild;
        }

        let parent_type = parent?.getAttribute("data-navigate-container");

        if (!parent || !parent_type || !prev_id || next_container_child === undefined) {
            console.error("missing information for navigating", { parent, parent_type, prev_id, prev: next_container_child })
            return
        }
        y_dim.value = null;

        let cursor_rect = cursor.getBoundingClientRect();
        let parent_rect = parent.getBoundingClientRect();
        let x_new = cursor_rect.x + (cursor_rect.width / 2) - parent_rect.x;
        if (x_dim.value === null) {
            x_dim.value = x_new;
        }
        let x = x_dim.value;
        let y = cursor_rect.y;
        let move_to = cursor.nextElementSibling;
        if (move_to === null) {
            move_to = next_container_child
        }
        while (move_to != null) {
            let move_to_rect = move_to.getBoundingClientRect();
            let left = move_to_rect.x - parent_rect.x;
            let right = move_to_rect.x + move_to_rect.width - parent_rect.x;
            let top = move_to_rect.y;
            if (top > y && ((left < x && x < right) || (left > x && right > x))) {
                break
            }

            // console.log({ look_backward: move_to.firstChild?.textContent, top, x, y, left })
            let lookbackwardx = move_to.nextElementSibling;
            if (!lookbackwardx && next_container_child !== null) {
                move_to = next_container_child
            }
            // else if (!lookbackwardx) {
            //     break
            // } 
            else {
                move_to = lookbackwardx
            }
        }

        if (move_to != null) {
            cursor.removeAttribute("data-navigate-ty");
            move_to.setAttribute("data-navigate-ty", "cursor");
        }
    });

    useVisibleTask$(async () => {
        add_action({ plugin: "core", id: "navigate_right" }, navigate_right);
        add_action({ plugin: "core", id: "navigate_left" }, navigate_left);
        add_action({ plugin: "core", id: "navigate_down" }, navigate_down);
        add_action({ plugin: "core", id: "navigate_up" }, navigate_up);
        add_keymap({ action_id: { plugin: "core", id: "navigate_right" }, mode: "navigate", keystroke: { mode: "one_presdown", key: "l", alt_pressed: false, ctrl_pressed: false } });
        add_keymap({ action_id: { plugin: "core", id: "navigate_left" }, mode: "navigate", keystroke: { mode: "one_presdown", key: "h", alt_pressed: false, ctrl_pressed: false } });
        add_keymap({ action_id: { plugin: "core", id: "navigate_down" }, mode: "navigate", keystroke: { mode: "one_presdown", key: "j", alt_pressed: false, ctrl_pressed: false } });
        add_keymap({ action_id: { plugin: "core", id: "navigate_up" }, mode: "navigate", keystroke: { mode: "one_presdown", key: "k", alt_pressed: false, ctrl_pressed: false } });
    }, { strategy: "document-ready" });

    // set up core plugin!
    // useVisibleTask$(async () => {
    //     for (const item of core_actions) {
    //         let key = item[0].name;
    //         let action = item[0];
    //         await add_action({ plugin: "core", id: key }, action);
    //
    //         let keymap = item[2];
    //         let mode = item[1];
    //         if (keymap) {
    //             add_keymap({
    //                 mode: mode,
    //                 action_id: {
    //                     plugin: "core",
    //                     id: key,
    //                 },
    //                 keystroke: {
    //                     mode: "one_presdown",
    //                     key: keymap.key,
    //                     alt_pressed: keymap.alt_pressed,
    //                     ctrl_pressed: keymap.ctrl_pressed,
    //                 }
    //             })
    //         }
    //     }
    // }, { strategy: "document-ready" });

    let current = useSignal<{ block_20_7e_val: boolean } & Omit<Mode, "runtime_value_schema" | "enter_dom" | "exit_dom">>({
        id: "navigate",
        block_20_7e: "never",
        block_20_7e_val: false,
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
            let found = keys_20_7e[ev.key];
            if (current.value.block_20_7e_val && found == null && !ev.altKey && !ev.ctrlKey) {
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
            current.value = { id: found.id, view: found.view, block_20_7e_val: found.block_20_7e == "always" ? true : false, block_20_7e: found.block_20_7e }
        }
    });
    useVisibleTask$(async ({ track }) => {
        if (modes.value == undefined) {
            track(modes)
            return
        }
        await add_action({ plugin: "core", id: "go_to_navigate_mode" }, async () => {
            let found = modes.value?.find((e) => {
                // console.log("find mode", e, e.id == "command");
                return e.id == "navigate"
            })
            if (found) {
                current.value = { id: found.id, view: found.view, block_20_7e_val: true, block_20_7e: found.block_20_7e }
            } else {
                console.error("no mode by name: ", "navigate", "available modes are", modes.value)
            }
        });
        await add_action({ plugin: "core", id: "go_to_normal_mode" }, async () => {
            let found = modes.value?.find((e) => {
                // console.log("find mode", e, e.id == "command");
                return e.id == "command"
            })
            if (found) {
                current.value = { id: found.id, view: found.view, block_20_7e_val: false, block_20_7e: found.block_20_7e }
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
       [data-navigate-ty="cursor"] {background: red}
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
                <div class="flex flex-col h-screen px-1">
                    <div class="w-[400px] [align-self:center] root flex-1 overflow-y-auto justify-center">
                        <div class="feed w-max-full flex flex-col h-full">
                            <div class="flex-1" />
                            <div>
                                {layout_ready_in.value == 0 && <>
                                    <div data-navigate-ty="parent" data-navigate-container="flex-row" class=" flex flex flex-wrap gap-1 ">
                                        <div>porro</div> <div>porro</div> <div>quisquam</div> <div>est</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>quisquam</div> <div>est</div> <div>qui</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>world</div> </div>
                                    <div data-navigate-ty="parent" data-navigate-container="flex-row" class=" flex flex flex-wrap gap-1 ">
                                        <div>porro</div> <div>porro</div> <div>quisquam</div> <div>est</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>quisquam</div> <div>est</div> <div>qui</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>world</div> </div>
                                    <div data-navigate-ty="parent" data-navigate-container="flex-row" class=" flex flex flex-wrap gap-1 ">
                                        <div>porro</div> <div>porro</div> <div>quisquam</div> <div>est</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>quisquam</div> <div>est</div> <div>qui</div> <div>dolorem</div> <div>ipsum</div> <div>quia</div> <div>dolor</div> <div>sit</div> <div>amet</div> <div>hi </div> <div>world</div> </div>
                                    <div data-navigate-ty="parent" data-navigate-container="flex-row" class=" grid grid-cols-16 gap-1">
                                        <div>0</div><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div><div>15</div><div>16</div><div>17</div><div>18</div><div>19</div><div>20</div><div>21</div><div>22</div><div>23</div><div>24</div><div>25</div><div>26</div><div>27</div><div>28</div><div>29</div><div>30</div><div>31</div><div>32</div><div>33</div><div>34</div><div>35</div><div>36</div><div>37</div><div>38</div><div>39</div><div>40</div>
                                    </div>
                                </>
                                }
                            </div>
                        </div>
                    </div>
                    <div class="rounded w-[400px] [align-self:center] m-4 p-1 px-3 bg-200 focus-within:bg-100 focus-within:ring focus-within:ring-1 focus-within:ring-slate">
                        <input data-command="main" placeholder="click ctrl + ; to go to command mode" class="w-full" type="text" />
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
