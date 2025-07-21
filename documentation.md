# core.navigate (mode)

## DOM attributes
name | type | description
|---|---|---|
data-navigate-ty | "cursor" \|  "parent" | determine where are you at when you navigate, determined at a runtime
data-navigate-container | "flex-row" \| "flex-col"\| "grid" | decide the behavior of how to navigate throught the children, determined when you generate the html

## actions
name | input_type | despcription
|---|---|---|
navigate_left | {} | navigate left
navigate_right | {} | navigate right
navigate_up | {} | navigate up
navigate_down | {} | navigate down

## 20-7E mask
this mode ALWAYS block ASCII charachters from 20 "SP" to 7e "~"

## Runtime Value

