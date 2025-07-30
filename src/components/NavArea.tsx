import { component$, useSignal, useStylesScoped$, useTask$, useVisibleTask$ } from "@builder.io/qwik";

export default component$((p: { content: string }) => {
    let content = useSignal(p.content);
    useTask$(() => {
        let back = "";
        let all = p.content.split("");
        for (const each of all) {
            back += `<span>${each}</span>`;
        }
        content.value = back
    })
    // let elem = useSignal<Element>();
    // useVisibleTask$(({ track }) => {
    //     if (!elem) return
    //     let text = elem.value?.firstElementChild?.textContent;
    //     if (!text) {
    //         console.log("no text in children")
    //         return
    //     }
    //     let back = "";
    //     let all = text.split("");
    //     for (const each in all) {
    //         back += `<span>${each}</span>`;
    //     }
    //     content.value = back
    // }, { strategy: "document-ready" })
    useStylesScoped$(`

`);
    return <div
        dangerouslySetInnerHTML={content.value}
        data-navigate-ty="parent"
        data-navigate-container="flex-char"
        class="font-mono flex flex-wrap [white-space:pre]">
    </div>
})
