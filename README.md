## What is this project is about?
This is an attempt to define UI in a keyboard-centric approach inspired by Vim text editor, aims to generalize the core aspects in Vim to work for any kind of appliation/UI component beside text-editors.

I came up with this project because 1. I was getting frusterated with Vscode's Vim plugin, I always thought Vscode and Vim are inherently incompatible and I keep going back to Vscode because of how buggy nvim is 2. I hate NeoVim (a completely different rant) this project's aim is similar to nvim's -- to scale vi -- but I think nvim did so poorly 3. I get frusterating whenever I want to make a small frontend interface to my backend I have to figure out navigation component and figure out how to distribute my application to different pages, and I'm not a fan of CLIs either, below I explained below how I think this will get rid of navigation

Here is core aspect:

## Mutual Execlusive Mode
I think the is the core aspect that made Vim great, it is a the problem of the following question: what if two different UI component assign an action to the same keystroke (let's say `ctrl` + `f`)?

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

There are two approaches that I think problematic, I want to go through them before explaining why mutual execlusive mode is a genius solution:
1. HTML (events bubbling and capturing)
Most inner component recieve the keyboard press as an event, and it will bubble it to the parent element unless they decide to stop the bubbling `stopPropagation`, here is the problem with that:

a. bad solution for developers: that logic is entirely and only known at runtime there is no way to know if using certain component will stop probagation of an event that you are interesting in handling, you have to scan the code line by line (like a caveman)
b. bad solution for users: at the consumer ends the user cannot know what happens when they click a key, will an action be fired or not, what kind of probagation logic is implemented.
c. this is just a lazy developer's idea that uses observer pattern to solve every and any software problem.

2. VS Code ('when' property)
every keymap have an optional 'when' property. here is the problem:

a. there is no way to guarantee `when` claus of two different actions that compete on the same key are mutually execlusive! that means you can install a plugin and it may ruine your experience unexpectedly
b. when clauses will get extremely ugly very quick, I mean look at this `{ "key": "ctrl+alt+pageup", "command": "editor.action.accessibleViewPreviousCodeBlock", "when": "accessibleViewContainsCodeBlocks && accessibleViewCurrentProviderId == 'inlineChat' || accessibleViewContainsCodeBlocks && accessibleViewCurrentProviderId == 'panelChat' || accessibleViewContainsCodeBlocks && accessibleViewCurrentProviderId == 'quickChat'" }` 
c. competing at the same global namespace (no modes) will result in complicated chords keymaps like `{ "key": "ctrl+k ctrl+shift+alt+c", "command": "copyRelativeFilePath", "when": "editorFocus" }`
d. combination of JSON and Javascript looks ugly to me. it is a lazy solution. 

### The solution
The solution to that is not something modern and sleek like asking ChatGBT to generate a complicated `when` clause or writing brain-numbing Javascript event handling logic, it is something discovered in 1970s: ✨VI modes💅. this repo is ongoing progress to figure out the details of how to scale this concept beyond text editors but here is my rough idea:

There is only two global modes (or namespace) "navigate" and "command", no UI component (or plugin) can assign any keymap to these two namespaces, if a component want to listen to keyboard keystrokes, it will have to define a new mode, idealy it should not take away the ability to go back to "navigate mode", if such thing happened an error will be issued and has to be handled by the developer of the plugin or propagated for the user to handle (`?` syntax in rust).

If a plugin want to set keymaps in navigate mode, it should prompt the user for permission, that make sense because that would be an invasive decision the user have to be aware of, and we should be able to handle any conflict when we install a given plugin before being suprised by unkown behavior at runtime. 

I think defining a new mode is a little bit involved and the vast majority of components will not need to implement one. Declaring command that are accissible in command mode is one way you can interact with the plugin, or I can highlight any UI element that have `onclick` event attached to it and having some mechanisim to ineract with them in navigate mode, probably a mechanisim similar to `github.com/ggandor/leap.nvim` nvim plugin, here is an advantage to that:

setting keymaps are no longer the developer responsibility, the developer only care to associate actions to commands and buttons, and if the user thinks an action is important they can assign a keymap to quickly perform that action!

## Quick Thoughts:
*what about inserting text?*: insert can be one of these "imersive experience" where a if the UI component want text input from you will have to go to its own "insert mode", I think 80% of applications do not need user input, it makes sense to have a seperate mode for it that is not part of the core functionality of this repo.

*navigating is utterly useless*: a common frusturation I used to have is having to distribute your application throught different pages and having to design a navigating bar. now all actions/UI components are one step away from command mode!

*what about highlighting/copying?*: I'm not a fan of visual mode in Vim, I think Vim's marks and registeries are good enough, set a certain location to a given mark, and a single action will copy all content from the current location to that mark inside some registery. different actions will handle the sitiuation of "v-line" and "v-block" modes!

*what about drag and drop?*: this is one things that I think will become obselete, registeries are good enough, dragging with a mouse always derives me crazy! 

*will this replace the mouse?*: I don't think the goal should be to replace the mouse completely, think of application that need access to pressure-sensitive pens like drawing in photoshop, will a keyboard ever replace that! but I think the idea of mutualy execlusive modes is worthy in these types of applications because almost always you will have a free hand available and it would be nice if you have a spectial mode that take drawing-related actions from one hand and drawing with the pen using the other hand (instead of having multiple button on that pen).

*what about searching*: hmm, this is tricky, in vim searching is an extention to command line, when you click `/`, you will go to command-mode-like but not quite so, I think this is not elegant, I think it should be a completly different plugin with its own mode, but I need to figure that out.

*pseudo-class :focus vs :focus-within vs :focus-visible*: one of the goals of this project is to split a big application into small components, that means that you can get rid of hierarchies and all focusable items are flat and :focus-whithin is not necessary
*tabindex*: tab index is designed for sequentual navigation, I think 2d navigation will make this obselete
*ARIA and tabindex attribute*: I'm mixed whether ARIA in general and tabindex in specific are created for different aim compare to this project and should be regarded, or whether the specification here can be a reasonable extention to ARIA where accessibility to the UI is not restricted!
*pseudo-class :active*: I think this will not be needed because it seems activating anything is intentional enough, no UI should display alternative view based on that
*pseudo-class :hover*: maybe that is the only state that navigate mode is interested in
