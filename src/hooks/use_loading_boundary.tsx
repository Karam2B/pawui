import { Signal, Slot, component$, createContextId, useContext, useContextProvider, useSignal } from "@builder.io/qwik"

type internal_type = { kind: "loading" } | { kind: "display" }

const internal_ctx = createContextId<{ internal: Signal<internal_type>, children: Signal<number> }>("loading_boundary")

export const decrement = () => {

}

export const useLoadingBoundary = (num: number) => {
    let internal = useSignal<internal_type>({ kind: "display" });
    let children = useSignal(num);
    useContextProvider(internal_ctx, { internal, children });
    const h = component$(() => {
        const internal = useContext(internal_ctx);
        switch (internal.internal.value.kind) {
            case "loading": {
                return <div>loading</div>
            } case "display": {
                return <div><Slot /></div>
            }
        }
    });

    //     switch (internal.value.kind) {
    //         case "loading": {
    //             return <div>< /div>
    //         }
    //                 case "display": {
    //             return <div>hi</div>
    //         }
    //     }
    // });
    return [0, h] as const
}
