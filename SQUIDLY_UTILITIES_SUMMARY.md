# Squidly Utilities Summary

This document summarizes the key utilities exported from the Squidly utility module, with emphasis on SvgPlus, ShadowElement, GridLayout, and GridIcon.

Primary source: src/Utilities/squidly-utils.js

## 1) What Squidly Utilities Provides

The utility module is a broad UI and interaction toolkit. It includes:

- DOM helpers and component base classes
- SVG and icon rendering helpers
- Grid UI primitives for card-based icon layouts
- Shadow DOM component support
- Access/input helpers and interaction classes
- Math and vector helpers
- Utility functions for transitions, timing, and platform checks

Export list is defined near the end of the module and includes SvgPlus, ShadowElement, GridLayout, GridIcon, GridCard, GridIconSymbol, Icon, Vector, AccessButton, AccessTextArea, and many utility functions.

## 2) SvgPlus

Reference: class SvgPlus in src/Utilities/squidly-utils.js

SvgPlus is the foundational class for most UI elements in this codebase.

### Core responsibilities

- Wraps/extends a DOM element with convenience APIs
- Supports both HTML and SVG element creation
- Standardizes style, attribute, and event assignment
- Provides helper methods for building component trees

### Key patterns

- Create components by extending SvgPlus
- Use createChild(type, props, ...args) to build child elements
- Use props and styles setters for declarative updates

### Commonly used capabilities

- props setter:
  - supports style/styles
  - supports events
  - supports content/innerHTML
  - maps all other keys to attributes
- styles setter:
  - sets CSS properties from an object
  - removes properties when value is null/undefined
- events setter:
  - bulk event binding from an object map
- class getter/setter:
  - convenience wrapper around class attribute
- bbox and svgBBox:
  - easy geometry access as Vector values


## 3)
## 4) ShadowElement

Reference: class ShadowElement in src/Utilities/squidly-utils.js

ShadowElement extends SvgPlus and adds structured Shadow DOM support.

### Core behavior

- Calls attachShadow({ mode: open })
- Creates a root container inside the shadow root
- Redirects appendChild and createChild to that internal root
- Loads stylesheet URLs from usedStyleSheets

### Styling model

- Define static usedStyleSheets on subclasses
- ShadowElement loads URLs once and caches them
- Uses adoptedStyleSheets when available
- Falls back to style tags in older environments

### Why it matters

- Encapsulated component styles
- Clean, reusable web component architecture
- Standard pattern used by higher-level views and editor components

## 5) Icon System

References in src/Utilities/squidly-utils.js:

- IconSourceText and IconsParsed
- class Icon
- helper isIconName(name)

### Pipeline

- Raw SVG icon strings are stored in IconSourceText
- Icons are parsed and normalized into IconsParsed
- Geometry classes and stroke/fill classes are applied
- Icon class renders by icon name and applies default icon styling

### Icon class behavior

- Constructor takes icon name and optional square viewbox behavior
- name setter updates SVG content and viewbox
- squareViewBox normalizes visual bounds for consistent icon sizing
- style variables support icon color and hover color

## 6) Grid Icons

References in src/Utilities/squidly-utils.js:

- Grid icon theme typedefs and GRID_ICON_THEMES
- CARD_RENDERERS
- class GridIconSymbol
- class GridCard
- class GridIcon

### Grid icon model

A grid icon is composed of:

- Card background shape (plain or folder)
- Symbol content (built-in icon name, image URL, text, or SVG)
- Display text and optional subtitle (markdown-capable)
- Visual state flags (hidden, disabled, display-only)

### Key classes

- GridIconSymbol:
  - renders visual symbol source
  - supports icon name, URL image, text, or svg object
- GridCard:
  - handles card type and color theme
  - updates card SVG geometry on resize
  - supports disabled/hover/active/displayOnly toggles
- GridIcon:
  - full interactive tile used in topic/menu UIs
  - supports symbol, displayValue, subtitle, accessGroup, events
  - can wait for symbol load with waitForLoad()

### Styling

- GridIcon.styleSheet returns the generated CSS URL for grid icon visuals

## 7) GridLayout

Reference: class GridLayout in src/Utilities/squidly-utils.js

GridLayout is a convenience wrapper around CSS grid placement with component-aware APIs.

### Core behavior

- Construct with rows and cols
- size setter updates:
  - grid-template-rows
  - grid-template-columns
  - CSS variables for row/col counts

### Item placement APIs

- add(item, ...posArgs)
  - places a SvgPlus item at explicit grid coordinates
- addItemInstance(Class, item, ...posArgs)
  - creates an instance then places it
- addGridIcon(item, ...posArgs)
  - convenience constructor for one GridIcon
- addItems(items, ...posArgs)
  - place 1D or 2D arrays of existing SvgPlus elements
- addItemInstances(Class, items, ...posArgs)
  - instantiate and place many items from data arrays
- addGridIcons(items, ...posArgs)
  - convenience for multiple GridIcon items

### Position argument behavior

Position inputs are normalized by parseCellPosition and support:

- start row/col
- optional row/col end spans
- tuple forms for ranges

## 7) Practical Usage In This Repo

- nview.js imports and uses GridIcon, GridLayout, ShadowElement, SvgPlus for layout and navigation controls.
- views.js also uses GridLayout and GridIcon-based composition patterns.

This confirms the intended architecture:

- SvgPlus as base abstraction
- ShadowElement for encapsulated view roots
- GridLayout for structural placement
- GridIcon for visual interactive tiles

## 8) Quick Mental Model

- SvgPlus: base element abstraction and DOM utility layer
- ShadowElement: component shell with style isolation
- Icon: low-level SVG icon renderer
- GridCard: themed card shell
- GridIcon: complete interactive tile
- GridLayout: placement engine for tiles/components

If you are building new UI panels, prefer composing with GridLayout + GridIcon inside ShadowElement-based components.

## 9) AccessButton And Access Events

References in src/Utilities/squidly-utils.js:

- class AccessEvent
- class AccessClickEvent
- class AccessButtonsLookupTable
- class AccessButtonRoot (registered as custom element access-button)
- class AccessButton (SvgPlus wrapper around access-button)

### Access button architecture

- AccessButtonRoot extends HTMLElement and implements the core accessibility/click behavior.
- The custom element is registered as access-button.
- AccessButton extends SvgPlus and creates/accesses access-button instances using the SvgPlus API.
- GridIcon extends GridCard with super("access-button", ...), so GridIcons participate directly in this access-button system.

### Grouping and ordering

- Each button supports:
  - access-group attribute via group property
  - access-order attribute via order property
- AccessButtonsLookupTable tracks connected buttons by group.
- getVisibleGroups() returns visible buttons grouped and sorted:
  - within group: order first (numeric), then unspecified order
  - groups sorted alphabetically by key
- getVisibleButtonsInGroup(group) returns visible, sorted buttons for one group.
- Global helper window.getButtonGroups() exposes visible groups.

### Visibility and hit testing

- isVisible is derived from getIsVisible().
- Default visibility check calls isPointInElement(center).
- center is computed from getBoundingClientRect().
- clickBoxElement can be set to a proxy element for hit-testing.
- Hit testing uses elementsFromPoint and skips access-transparent elements.

### Core event flow

- Native click listener on AccessButtonRoot calls:
  - accessClick("click", e)
- accessClick(mode, timeout):
  - creates AccessClickEvent
  - dispatches access-click
  - applies active animation (active attribute for ~200ms)
  - awaits async handlers via event.waitAll(timeout)

### AccessEvent model

- AccessEvent extends Event with:
  - clickMode: click | dwell | switch
  - initialEvent: root event context
  - eventPromises: queue of async handler promises
- waitFor(promise, stopImmediatePropagation):
  - appends promise to initial event queue
  - optionally stops immediate propagation
  - awaits that promise
- waitAll(timeout):
  - waits for all queued promises
  - optional timeout via Promise.race

### Practical usage pattern for listeners

- Listen for access-click on a button-like component.
- For async work, call event.waitFor(promise) inside handler so upstream accessClick can await completion.
- Use mode to branch behavior for click vs dwell vs switch triggers if needed.

Example:

```js
button.addEventListener("access-click", async (event) => {
  await event.waitFor(doSomethingAsync());
});
```

### Speech support

- Buttons support utteranceText and utterance aliases.
- Setting utterance preloads text via loadUtterances.
- speakUtterance()/speak() trigger Text2SpeechManager.speak().
