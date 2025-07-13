## What is this project is about?
This is an attempt to define UI in a keyboard-centric approach inspired by Vim text editor, aims to generalize core concept in Vim to work for any kind of appliation/UI component

Here is core aspect:

## Mutual Execlusive Mode
I think the is the core aspect that made Vim great, it is a concept that address the question: what if two different UI component assign an action to the same keystroke (let's say `ctrl` + `f`)?

```
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
```

beside the possible conflict, there is a problem in the Javascript language itself, a component can define a a `keydown` event without you being able to know that it does that AT A BUILDTIME, that means if you want to prevent all components (let's say you work with 100s of developers on a open-source project) you have to scan every line of code (like a caveman) for that violation, instead of having an `if` statement that runs at a build time and gives you a warning as part of your LSP experience (I don't think liters/develper guides are appropriate solutions), but that is a whole different rant.
