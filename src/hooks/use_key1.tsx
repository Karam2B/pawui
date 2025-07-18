
import { $, Signal, component$, createContextId, useContext, useContextProvider, useSignal, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { GlobalIdent, Keymap, core_ctx } from "~/root";

type use_key_type = { kind: "loading" } | { kind: "action", action_id: GlobalIdent } | { kind: "keymap", keymap: Keymap };
const use_key_ctx = createContextId<Signal<use_key_type>>("use_key");

export const useKey = (action_id: GlobalIdent, opt: any) => {
    let core = useContext(core_ctx);
    let found = useSignal<use_key_type>({ kind: "loading" });
    useContextProvider(use_key_ctx, found);

    useVisibleTask$(async () => {
        let found_key = core.keymaps.find((e) => {
            JSON.stringify(e.action_id) == JSON.stringify(action_id)
        })
        if (!found_key) {
            found.value = { kind: "action", action_id }
        } else {
            found.value = { kind: "keymap", keymap: found_key }
        }
        await opt.loading_boundary()
    }, { strategy: "document-ready" });
    const InnerComponent = component$(() => {
        const out = useContext(use_key_ctx);
        useStylesScoped$(`
kbd + kbd { margin-left: 0 } 
kbd {
   margin: 0px 5px;
   box-shadow: 0 2px 0px 1px rgba(0,0,0,0.3);
}
.action {
background
}
`);
        switch (out.value.kind) {
            case "loading": {
                return <span></span>
            }
            case "keymap": {
                let keymap = out.value.keymap;

                switch (keymap.keystroke.mode) {
                    case "chord": {
                        let chord = keymap.action_id
                        return <span><kbd>s</kbd></span>
                    } case "one_presdown": {
                        let keystroke = keymap.keystroke;

                        return <span>{keystroke.alt_pressed && <kbd>alt</kbd>}{keystroke.ctrl_pressed && <kbd>ctrl</kbd>}<kbd>{keystroke.key}</kbd></span>
                    }
                }
            }
            case "action": {
                let action = out.value.action_id;
                return <span class="bg-slate-300 px-1 rounded">{action.plugin}::{action.id}</span>
            }
        }
    })
    return [found, InnerComponent] as const
}

const wtf = (...args: any[]) => {

    return args[0] + args[1]
}
