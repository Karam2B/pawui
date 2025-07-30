import { $, Slot, component$, createContextId, useContext, useContextProvider, useId, useSignal, useStore, useStylesScoped$, useVisibleTask$ } from "@builder.io/qwik";
import { Action as Action, Keystroke, core_id } from "~/root";

export const leap = createContextId<ReturnType<typeof use_leap_no_provider>>("leap");

export const use_leap_no_provider = () => {
    let leaps = useStore<Record<string, Action | null>>({});
    let set = useSignal({
        main: "d", second: [
            "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/",
        ] as string[]
    });

    return { leaps, set }
}

export const use_leap_provider = () => {
    let core = useContext(core_id);



    let ret = use_leap_no_provider();

    useVisibleTask$(async () => {
        let id = { plugin: "core", id: "leap_first_range" };
        await core.add_action(
            id,
            { recieve_last_stroke: true },
            $(async (d: any) => {
                let last_record: Keystroke | undefined = d.last_keystroke;
                if (last_record === undefined) {
                    console.error("action should be of type keystroke")
                    return
                }
                let s = ret.leaps[last_record.key];
                if (s && "plugin" in s) {
                    await core.fire_action(s, {})
                } else {
                    console.info("keymap is no op")
                    return
                }
            }),
        );
        await core.add_keymap({
            mode: "navigate",
            action_id: id,
            keyevent: {
                mode: "recieve_last_stroke",
                first_keystroke: { key: "d", alt_pressed: false, ctrl_pressed: false, },
            },
        });
    }, { strategy: "document-ready" })

    useContextProvider(leap, ret)
}

export const Leap = component$((p: { action: Action }) => {
    let ctx = useContext(leap);

    useStylesScoped$(`
div > :global(button) > :global(span.visual) {
    font-family: monospace;
    background: red;
    text: white;
    margin-left: 5px;
    display: inline-block;
}
`);
    let id = useId();
    let keymap = useSignal<string>("..");
    useVisibleTask$(({ track, cleanup }) => {
        let item = ctx.set.value.second.pop();
        if (!item) {
            console.error("set is exauhsted");
            return
        }
        keymap.value = "d" + item;
        ctx.leaps[item] = p.action
        cleanup(() => {
            ctx.leaps[item] = null;
            ctx.set.value.second.push(item)
        })
    }, { strategy: "intersection-observer" })
    useVisibleTask$(({ track }) => {
        track(keymap);
        let button = window.document.querySelector(`[data-leap="${id}"] > button`)
        if (button === null) {
            console.error("any leap component should have a button as child");
            return
        }
        // TODO: I should have component called LeapVisual and 
        // on execute the following code when that component is 
        // not added as children to this component
        let elem = window.document.createElement("span");
        elem.classList.add("visual")
        elem.innerHTML = keymap.value
        button.appendChild(elem);
    }, { strategy: "intersection-observer" })

    return <div data-leap={id}><Slot /></div>
})
