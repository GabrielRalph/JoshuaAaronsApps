import { GridLayout, SvgPlus, delay } from "../squidly-utils.js";

const ITEMS = {
  beachBall: { name: "rainbow ball", svg: beachBallSvg },
  eggs: { name: "eggs", svg: eggsSvg },
  vanilla: { name: "vanilla", svg: vanillaSvg },
  redVelvet: { name: "red velvet", svg: redVelvetSvg },
  orange: { name: "orange", svg: orangeSvg },
  lemon: { name: "lemon", svg: lemonSvg },
  milk: { name: "milk", svg: milkSvg },
  bread: { name: "bread", svg: breadSvg },
  apple: { name: "apple", svg: appleSvg },
  carrot: { name: "carrot", svg: carrotSvg },
  juice: { name: "juice", svg: juiceSvg },
  banana: { name: "banana", svg: bananaSvg },
  cheese: { name: "cheese", svg: cheeseSvg },
  cereal: { name: "cereal", svg: cerealSvg },
  strawberries: { name: "strawberries", svg: strawberriesSvg },
  yogurt: { name: "yogurt", svg: yogurtSvg },
  cupcake: { name: "cupcake", svg: cupcakeSvg },
  donut: { name: "donut", svg: donutSvg },
  cookie: { name: "cookie", svg: cookieSvg },
  sprinkles: { name: "sprinkles", svg: sprinklesSvg },
  gummies: { name: "gummy bears", svg: gummiesSvg },
  jam: { name: "jam", svg: jamSvg },
  partyHat: { name: "party hat", svg: partyHatSvg },
  present: { name: "present", svg: presentSvg },
  partyHorn: { name: "party horn", svg: partyHornSvg },
  sandwich: { name: "sandwich", svg: sandwichSvg },
  watermelon: { name: "watermelon", svg: watermelonSvg },
  waterBottle: { name: "water bottle", svg: waterBottleSvg },
  pancakes: { name: "pancakes", svg: pancakesSvg },
  toast: { name: "toast", svg: toastSvg },
  honey: { name: "honey", svg: honeySvg },
  grapes: { name: "grapes", svg: grapesSvg },
  pear: { name: "pear", svg: pearSvg },
  pineapple: { name: "pineapple", svg: pineappleSvg },
  iceCream: { name: "ice cream", svg: iceCreamSvg },
  lollipop: { name: "lollipop", svg: lollipopSvg },
  chocolate: { name: "chocolate", svg: chocolateSvg },
  balloons: { name: "balloons", svg: balloonsSvg },
  candles: { name: "candles", svg: candlesSvg },
  partyCup: { name: "party cup", svg: partyCupSvg },
  partyPlate: { name: "party plate", svg: partyPlateSvg },
  invitation: { name: "invitation", svg: invitationSvg },
  confettiPopper: { name: "confetti popper", svg: confettiPopperSvg },
  cakeSlice: { name: "cake slice", svg: cakeSliceSvg },
  picnicBlanket: { name: "picnic blanket", svg: picnicBlanketSvg },
  lemonade: { name: "lemonade", svg: lemonadeSvg },
  chips: { name: "chips", svg: chipsSvg },
  salad: { name: "salad", svg: saladSvg },
  crackers: { name: "crackers", svg: crackersSvg },
  napkins: { name: "napkins", svg: napkinsSvg },
  picnicBasket: { name: "picnic basket", svg: picnicBasketSvg },
  trailMix: { name: "trail mix", svg: trailMixSvg },
  waffles: { name: "waffles", svg: wafflesSvg },
  oatmeal: { name: "oatmeal", svg: oatmealSvg },
  butter: { name: "butter", svg: butterSvg },
  bagel: { name: "bagel", svg: bagelSvg },
  tea: { name: "tea", svg: teaSvg },
  syrup: { name: "syrup", svg: syrupSvg },
  kiwi: { name: "kiwi", svg: kiwiSvg },
  mango: { name: "mango", svg: mangoSvg },
  peach: { name: "peach", svg: peachSvg },
  cherries: { name: "cherries", svg: cherriesSvg },
  blueberries: { name: "blueberries", svg: blueberriesSvg },
  cottonCandy: { name: "cotton candy", svg: cottonCandySvg },
  popcorn: { name: "popcorn", svg: popcornSvg },
  marshmallows: { name: "marshmallows", svg: marshmallowsSvg },
  pudding: { name: "pudding", svg: puddingSvg },
  candyCane: { name: "candy cane", svg: candyCaneSvg },
  jellyBeans: { name: "jelly beans", svg: jellyBeansSvg },
  caramel: { name: "caramel", svg: caramelSvg },
};

const ROUND_SIZES = [2, 3, 4, 5];
const SQUIDLY_STATE_PATH = "game/state";
const SQUIDLY_STATE_VERSION = 1;
const SQUIDLY_VALUE_LIMIT = 5000;

const SHELF_POOL = [
  "partyHat",
  "present",
  "partyHorn",
  "beachBall",
  "redVelvet",
  "vanilla",
  "cupcake",
  "balloons",
  "candles",
  "partyCup",
  "partyPlate",
  "invitation",
  "confettiPopper",
  "cakeSlice",
  "bread",
  "cheese",
  "sandwich",
  "watermelon",
  "waterBottle",
  "carrot",
  "picnicBlanket",
  "lemonade",
  "chips",
  "salad",
  "crackers",
  "napkins",
  "picnicBasket",
  "trailMix",
  "eggs",
  "milk",
  "cereal",
  "yogurt",
  "pancakes",
  "toast",
  "honey",
  "banana",
  "waffles",
  "oatmeal",
  "butter",
  "bagel",
  "tea",
  "syrup",
  "apple",
  "orange",
  "lemon",
  "strawberries",
  "grapes",
  "pear",
  "pineapple",
  "juice",
  "jam",
  "kiwi",
  "mango",
  "peach",
  "cherries",
  "blueberries",
  "donut",
  "cookie",
  "sprinkles",
  "gummies",
  "iceCream",
  "lollipop",
  "chocolate",
  "cottonCandy",
  "popcorn",
  "marshmallows",
  "pudding",
  "candyCane",
  "jellyBeans",
  "caramel",
];

const SHOPPING_THEMES = [
  {
    name: "Birthday Party",
    className: "theme-birthday",
    icon: "party",
    items: ["partyHat", "present", "partyHorn", "beachBall", "redVelvet", "vanilla", "cupcake", "balloons", "candles", "partyCup", "partyPlate", "invitation", "confettiPopper", "cakeSlice"],
    stickers: ["star", "crown", "heart", "ribbon"],
  },
  {
    name: "Picnic",
    className: "theme-picnic",
    icon: "picnic",
    items: ["bread", "cheese", "sandwich", "watermelon", "waterBottle", "carrot", "picnicBlanket", "lemonade", "chips", "salad", "crackers", "napkins", "picnicBasket", "trailMix"],
    stickers: ["sun", "heart", "cart", "star"],
  },
  {
    name: "Breakfast",
    className: "theme-breakfast",
    icon: "breakfast",
    items: ["eggs", "milk", "cereal", "yogurt", "pancakes", "toast", "honey", "banana", "waffles", "oatmeal", "butter", "bagel", "tea", "syrup"],
    stickers: ["sun", "ribbon", "star", "cart"],
  },
  {
    name: "Fruit Shop",
    className: "theme-fruit",
    icon: "fruit",
    items: ["apple", "orange", "lemon", "strawberries", "grapes", "pear", "pineapple", "juice", "jam", "kiwi", "mango", "peach", "cherries", "blueberries"],
    stickers: ["sun", "star", "heart", "cart"],
  },
  {
    name: "Treat Day",
    className: "theme-treat",
    icon: "treat",
    items: ["donut", "cookie", "sprinkles", "gummies", "iceCream", "lollipop", "chocolate", "cottonCandy", "popcorn", "marshmallows", "pudding", "candyCane", "jellyBeans", "caramel"],
    stickers: ["heart", "crown", "ribbon", "star"],
  },
];

const CHECK_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M22 63 L48 89 L98 31" fill="none" stroke="#ffffff" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

const PLAY_ICON = `
  <svg viewBox="0 0 120 90" aria-hidden="true">
    <path d="M42 16 C42 8 51 4 58 9 L93 34 C101 40 101 50 93 56 L58 81 C51 86 42 82 42 74 Z" fill="#ffffff"/>
  </svg>`;

const RETRY_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M82 32 A37 37 0 1 0 96 61" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>
    <path d="M80 13 L101 33 L74 39 Z" fill="#ffffff"/>
  </svg>`;

const SOUND_ON_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M18 47 H39 L67 25 V95 L39 73 H18 Z" fill="#ffffff"/>
    <path d="M79 43 C88 53 88 67 79 77 M91 31 C107 48 107 72 91 89" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round"/>
  </svg>`;

const SOUND_OFF_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M18 47 H39 L67 25 V95 L39 73 H18 Z" fill="#ffffff"/>
    <path d="M80 42 L104 78 M104 42 L80 78" fill="none" stroke="#ffffff" stroke-width="11" stroke-linecap="round"/>
  </svg>`;

const HOME_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <path d="M18 57 L60 23 L102 57" fill="none" stroke="#ffffff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M31 53 V98 H89 V53" fill="#ffffff"/>
    <path d="M52 98 V74 H68 V98" fill="#2ba9db" opacity="0.8"/>
  </svg>`;

const CROSS_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="45" fill="#ff5252"/>
    <path d="M39 39 L81 81 M81 39 L39 81" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round"/>
  </svg>`;

const SMALL_CHECK_ICON = `
  <svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="45" fill="#f7fff2" stroke="#315868" stroke-width="8"/>
    <path d="M33 62 L52 81 L88 39" fill="none" stroke="#48d33b" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

class ShoppingMemoryGame {
  constructor(root) {
    this.root = new SvgPlus(root);
    this.shell = this.root.createChild("main", {
      class: "game-shell",
      role: "application",
      "aria-label": "Shopping list memory game",
    });
    this.roundIndex = 0;
    this.basket = [];
    this.screenToken = 0;
    this.bagSerial = 0;
    this.stickerSerial = 0;
    this.accessOrder = 0;
    this.soundMuted = false;
    this.audioContext = null;
    this.theme = SHOPPING_THEMES[0];
    this.earnedStickers = [];
    this.correctItemCount = 0;
    this.totalItemCount = 0;
    this.sceneName = "home";
    this.memoryReady = false;
    this.checkComplete = false;
    this.syncApi = window.SquidlyAPI || null;
    this.syncClientId = createSyncClientId();
    this.syncUser = this.syncClientId;
    this.syncRevision = 0;
    this.isApplyingSyncState = false;
    this.roundLists = createRandomRoundLists(this.currentItemPool());
    this.shelfItemsByRound = [];
    this.setupSquidlySync();
    this.renderHome();
  }

  setScene(name) {
    this.screenToken += 1;
    this.sceneName = name;
    this.accessOrder = 0;
    this.shell.className = "game-shell";
    if (this.theme?.className) this.shell.classList.add(this.theme.className);
    this.shell.innerHTML = "";
    this.shell.dataset.screen = name;
    const scene = this.shell.createChild("section", { class: `scene ${name}` });
    this.addSoundToggle(scene);
    if (name !== "home") this.addHomeButton(scene);
    return scene;
  }

  currentList() {
    return this.roundLists[this.roundIndex] || [];
  }

  currentItemPool() {
    return this.theme?.items || SHELF_POOL;
  }

  setupSquidlySync() {
    if (!this.syncApi) return;

    try {
      this.syncApi.addSessionInfoListener?.((info) => {
        this.syncUser = info?.user || this.syncClientId;
      });
    } catch (error) {
      console.warn("Squidly session info listener was not available.", error);
    }

    try {
      this.syncApi.firebaseOnValue?.(SQUIDLY_STATE_PATH, (value) => this.receiveSyncedState(value));
    } catch (error) {
      console.warn("Squidly Firebase state listener was not available.", error);
    }
  }

  receiveSyncedState(value) {
    if (typeof value !== "string" || value.length === 0) return;

    let state;
    try {
      state = JSON.parse(value);
    } catch (error) {
      console.warn("Ignoring invalid Squidly game state.", error);
      return;
    }

    if (!state || state.version !== SQUIDLY_STATE_VERSION || state.updatedBy === this.syncClientId) return;
    if (!Number.isFinite(state.revision) || state.revision <= this.syncRevision) return;

    this.applySyncedState(state);
  }

  publishSyncedState(reason) {
    if (!this.syncApi || this.isApplyingSyncState) return;

    const state = this.createSyncedState(reason);
    const json = JSON.stringify(state);
    const byteLength = typeof TextEncoder === "function" ? new TextEncoder().encode(json).length : json.length;
    if (byteLength > SQUIDLY_VALUE_LIMIT) {
      console.warn(`Squidly game state is ${byteLength} bytes and cannot be saved in one Firebase value.`);
      return;
    }

    this.syncRevision = state.revision;
    try {
      this.syncApi.firebaseSet(SQUIDLY_STATE_PATH, json);
    } catch (error) {
      console.warn("Could not publish Squidly game state.", error);
    }
  }

  createSyncedState(reason) {
    return {
      version: SQUIDLY_STATE_VERSION,
      revision: this.syncRevision + 1,
      updatedBy: this.syncClientId,
      updatedByUser: this.syncUser,
      reason,
      screen: this.sceneName,
      theme: this.theme?.name || SHOPPING_THEMES[0].name,
      roundIndex: this.roundIndex,
      basket: [...this.basket],
      roundLists: copyItemRows(this.roundLists),
      shelfItemsByRound: copyShelfRows(this.shelfItemsByRound),
      earnedStickers: copyStickers(this.earnedStickers),
      correctItemCount: this.correctItemCount,
      totalItemCount: this.totalItemCount,
      memoryReady: this.memoryReady,
      checkComplete: this.checkComplete,
      soundMuted: this.soundMuted,
    };
  }

  applySyncedState(state) {
    this.isApplyingSyncState = true;
    try {
      this.syncRevision = state.revision;
      this.theme = getThemeByName(state.theme) || this.theme || SHOPPING_THEMES[0];
      this.roundIndex = clampInteger(state.roundIndex, 0, ROUND_SIZES.length - 1);
      this.basket = cleanItemIds(state.basket);
      const roundLists = copyItemRows(state.roundLists);
      this.roundLists = roundLists.length === ROUND_SIZES.length ? roundLists : createRandomRoundLists(this.currentItemPool());
      this.shelfItemsByRound = copyShelfRows(state.shelfItemsByRound);
      this.earnedStickers = copyStickers(state.earnedStickers);
      this.correctItemCount = clampInteger(state.correctItemCount, 0, 99);
      this.totalItemCount = clampInteger(state.totalItemCount, 0, 99);
      this.memoryReady = Boolean(state.memoryReady);
      this.checkComplete = Boolean(state.checkComplete);
      if (typeof state.soundMuted === "boolean") this.soundMuted = state.soundMuted;
      this.renderSyncedScene(state.screen);
    } finally {
      this.isApplyingSyncState = false;
    }
  }

  renderSyncedScene(screen) {
    if (screen === "memory") this.renderMemoryList({ fromSync: true });
    else if (screen === "shelf") this.renderShelf();
    else if (screen === "bagging") this.renderBagging({ fromSync: true });
    else if (screen === "check") this.renderCheck({ fromSync: true });
    else if (screen === "finale") this.renderFinale();
    else this.renderHome();
  }

  renderHome() {
    const scene = this.setScene("home");
    this.addStaticItem(scene, "sprinkles", "home-item left");
    this.addStaticItem(scene, "gummies", "home-item right");
    this.addBag(scene, "home-bag");
    this.addStaticItem(scene, "jam", "home-item center-bag-item");
    this.addThemePicker(scene);

    const play = scene.createChild("button", {
      class: "play-button",
      type: "button",
      "aria-label": "Play",
    });
    play.innerHTML = `${PLAY_ICON}<span>Play</span>`;
    this.bindAction(play, () => this.startGame(), { group: "home" });
  }

  startGame() {
    this.playSound("start");
    this.roundIndex = 0;
    this.basket = [];
    this.earnedStickers = [];
    this.stickerSerial = 0;
    this.correctItemCount = 0;
    this.totalItemCount = 0;
    this.memoryReady = false;
    this.checkComplete = false;
    this.roundLists = createRandomRoundLists(this.currentItemPool());
    this.shelfItemsByRound = [];
    this.renderMemoryList();
    this.publishSyncedState("start-game");
  }

  selectTheme(theme) {
    this.theme = theme;
    this.playSound("button");
    this.renderHome();
    this.publishSyncedState("select-theme");
  }

  goHome() {
    this.playSound("button");
    this.roundIndex = 0;
    this.basket = [];
    this.earnedStickers = [];
    this.correctItemCount = 0;
    this.totalItemCount = 0;
    this.memoryReady = false;
    this.checkComplete = false;
    this.shelfItemsByRound = [];
    this.roundLists = createRandomRoundLists(this.currentItemPool());
    this.renderHome();
    this.publishSyncedState("home");
  }

  renderMemoryList({ fromSync = false } = {}) {
    const scene = this.setScene("memory");
    this.addTripBadge(scene);
    const token = this.screenToken;
    const list = this.currentList();
    const paper = this.addPaper(scene, "clip");
    paper.createChild("h2", { class: "shopping-prompt", content: "Remember my shopping list" });
    const items = paper.createChild("div", {
      class: "memory-items",
      styles: { "--item-count": list.length },
    });

    for (const itemId of list) {
      const holder = items.createChild("div", { class: "memory-item" });
      holder.appendChild(this.createItemArt(itemId));
    }

    const tick = this.createTickButton(scene, "Go to the shelves", () => this.enterShelf());
    if (this.memoryReady) {
      tick.disabled = false;
      tick.classList.add("is-visible");
      return;
    }

    tick.disabled = true;
    delay(1450).then(() => {
      if (this.screenToken !== token) return;
      this.memoryReady = true;
      tick.disabled = false;
      tick.classList.add("is-visible");
      if (!fromSync) this.publishSyncedState("memory-ready");
    });
  }

  enterShelf() {
    this.basket = [];
    this.memoryReady = true;
    this.checkComplete = false;
    this.renderShelf();
    this.publishSyncedState("enter-shelf");
  }

  renderShelf() {
    const scene = this.setScene("shelf");
    this.addTripBadge(scene);
    const list = this.currentList();
    this.addShelfFurniture(scene);
    this.addProductGrid(scene);
    this.addBasket(scene, list.length);

    if (this.basket.length === list.length) {
      const tick = this.createTickButton(scene, "Pack the bag", () => this.packBag());
      tick.classList.add("is-visible");
    }
  }

  addProductGrid(scene) {
    const shelfItems = this.getShelfItems();
    const columns = Math.ceil(shelfItems.length / 2);
    const grid = scene.createChild(GridLayout, { class: "product-grid" }, 2, columns);

    shelfItems.forEach((itemId, index) => {
      const button = this.createItemButton(itemId, () => this.addToBasket(itemId));
      const gridItem = button.accessWrapper || button;
      gridItem.style.setProperty("--item-order", index);
      if (this.basket.includes(itemId)) {
        button.classList.add("is-picked");
        button.disabled = true;
        button.setAttribute("aria-hidden", "true");
      }
      grid.add(gridItem, Math.floor(index / columns), index % columns);
    });
  }

  addToBasket(itemId) {
    const list = this.currentList();
    if (this.basket.length >= list.length || this.basket.includes(itemId)) return;
    this.basket.push(itemId);
    this.playSound("pick");
    this.renderShelf();
    this.publishSyncedState("add-item");
  }

  removeFromBasket(index) {
    if (index < 0 || index >= this.basket.length) return;
    this.basket.splice(index, 1);
    this.playSound("remove");
    this.renderShelf();
    this.publishSyncedState("remove-item");
  }

  addBasket(scene, slotCount) {
    const basket = scene.createChild("div", {
      class: "basket-zone",
      styles: { "--slot-count": slotCount },
      "aria-label": "Basket",
    });

    for (let index = 0; index < slotCount; index += 1) {
      const itemId = this.basket[index];
      const tag = itemId ? "button" : "div";
      const slot = basket.createChild(tag, {
        class: "basket-slot",
        ...(itemId
          ? {
              type: "button",
              "aria-label": `Remove ${ITEMS[itemId].name}`,
            }
          : { "aria-hidden": "true" }),
      });
      if (itemId) {
        slot.classList.add("has-item");
        slot.appendChild(this.createItemArt(itemId));
        this.bindAction(slot, () => this.removeFromBasket(index), { group: "basket" });
      }
    }
  }

  packBag() {
    this.checkComplete = false;
    this.renderBagging();
    this.publishSyncedState("pack-bag");
  }

  async renderBagging({ fromSync = false } = {}) {
    const scene = this.setScene("bagging");
    this.addTripBadge(scene);
    const token = this.screenToken;
    this.addShelfFurniture(scene);
    this.addProductGrid(scene);
    this.addBasket(scene, this.currentList().length);
    const bag = this.addBag(scene);
    await delay(220);

    const slots = [...this.shell.querySelectorAll(".basket-slot")];
    for (let index = 0; index < this.basket.length; index += 1) {
      if (this.screenToken !== token) return;
      slots[index]?.classList.add("is-flying-source");
      await this.flyItem(this.basket[index], slots[index], bag, 570 + index * 55);
      this.pulseElement(bag, "is-catching");
      await delay(90);
    }

    if (this.screenToken === token) {
      await delay(220);
      this.checkComplete = false;
      this.renderCheck({ fromSync });
      if (!fromSync) this.publishSyncedState("check-start");
    }
  }

  async renderCheck({ fromSync = false } = {}) {
    const scene = this.setScene("check");
    this.addTripBadge(scene);
    const token = this.screenToken;
    const list = this.currentList();
    const recalledItems = [...this.basket];
    const recalledSet = new Set(recalledItems);
    const unmatchedItems = recalledItems.filter((itemId) => !list.includes(itemId));
    const reviewItems = list.map((itemId) => (recalledSet.has(itemId) ? itemId : unmatchedItems.shift()));
    const correctByTarget = list.map((itemId) => recalledSet.has(itemId));
    const roundCorrectCount = correctByTarget.filter(Boolean).length;
    const paper = this.addPaper(scene, "clip");
    const targetRow = paper.createChild("div", {
      class: "review-targets",
      styles: { "--item-count": list.length },
    });
    const marks = paper.createChild("div", {
      class: "review-marks",
      styles: { "--item-count": list.length },
    });
    const recallRow = scene.createChild("div", {
      class: "recalled-row",
      styles: { "--item-count": list.length },
    });
    const bag = this.addBag(scene);
    const recallSlots = [];
    const markSlots = [];

    for (let index = 0; index < list.length; index += 1) {
      const targetSlot = targetRow.createChild("div", { class: "review-item" });
      targetSlot.appendChild(this.createItemArt(list[index]));
      const mark = marks.createChild("div", { class: "mark-icon", "aria-hidden": "true" });
      markSlots.push(mark);
      recallSlots.push(recallRow.createChild("div", { class: "recall-slot" }));
    }

    if (this.checkComplete) {
      for (let index = 0; index < reviewItems.length; index += 1) {
        if (!reviewItems[index]) continue;
        recallSlots[index].appendChild(this.createItemArt(reviewItems[index]));
        recallSlots[index].classList.add("has-item");
      }

      for (let index = 0; index < list.length; index += 1) {
        markSlots[index].innerHTML = correctByTarget[index] ? SMALL_CHECK_ICON : CROSS_ICON;
        markSlots[index].classList.add("is-visible");
      }

      const sticker = this.earnedStickers[this.roundIndex];
      if (sticker) this.showRoundSticker(scene, sticker, roundCorrectCount, list.length);
      bag.classList.add("is-finished");
      const tick = this.createTickButton(scene, this.roundIndex === this.roundLists.length - 1 ? "See your score" : "Next shopping list", () => this.advanceAfterCheck());
      tick.classList.add("is-visible");
      return;
    }

    await delay(260);
    for (let index = 0; index < reviewItems.length; index += 1) {
      if (this.screenToken !== token) return;
      if (!reviewItems[index]) continue;
      this.pulseElement(bag, "is-releasing");
      await this.flyItem(reviewItems[index], bag, recallSlots[index], 520 + index * 45);
      recallSlots[index].appendChild(this.createItemArt(reviewItems[index]));
      recallSlots[index].classList.add("has-item");
      await delay(70);
    }

    await delay(180);
    for (let index = 0; index < list.length; index += 1) {
      if (this.screenToken !== token) return;
      const isCorrect = correctByTarget[index];
      markSlots[index].innerHTML = isCorrect ? SMALL_CHECK_ICON : CROSS_ICON;
      markSlots[index].classList.add("is-visible");
      this.playSound(isCorrect ? "correct" : "wrong");
      await delay(120);
    }

    this.correctItemCount += roundCorrectCount;
    this.totalItemCount += list.length;
    const sticker = this.awardRoundSticker(roundCorrectCount, list.length);
    this.showRoundSticker(scene, sticker, roundCorrectCount, list.length);
    bag.classList.add("is-finished");
    this.checkComplete = true;

    if (this.screenToken !== token) return;
    if (!fromSync) this.publishSyncedState("check-complete");
    const tick = this.createTickButton(scene, this.roundIndex === this.roundLists.length - 1 ? "See your score" : "Next shopping list", () => this.advanceAfterCheck());
    tick.classList.add("is-visible");
  }

  advanceAfterCheck() {
    if (this.roundIndex === this.roundLists.length - 1) {
      this.renderFinale();
      this.publishSyncedState("finale");
      return;
    }
    this.roundIndex += 1;
    this.basket = [];
    this.memoryReady = false;
    this.checkComplete = false;
    this.renderMemoryList();
    this.publishSyncedState("next-round");
  }

  renderFinale() {
    const scene = this.setScene("finale");
    this.addTripBadge(scene);
    this.addConfetti(scene);
    this.playSound("win");
    const panel = scene.createChild("div", { class: "final-panel" });
    panel.createChild("h1", { content: "Great job!" });
    const stickerBoard = panel.createChild("div", { class: "sticker-board", "aria-label": "Earned stickers" });
    for (const sticker of this.earnedStickers) {
      stickerBoard.appendChild(this.createStickerArt(sticker, "final-sticker"));
    }
    panel.createChild("p", {
      class: "final-score",
      content: `${this.correctItemCount}/${this.totalItemCount} correct items`,
    });
    const retry = panel.createChild("button", {
      class: "retry-button",
      type: "button",
      "aria-label": "Try again",
    });
    retry.innerHTML = RETRY_ICON;
    this.bindAction(retry, () => this.startGame(), { group: "finale" });
  }

  addPaper(scene, extraClass = "") {
    return scene.createChild("div", { class: `paper ${extraClass}`.trim() });
  }

  bindAction(button, onActivate, { group = "game", once = false } = {}) {
    const order = String(this.accessOrder);
    const wrapper = new SvgPlus("access-button");
    wrapper.props = {
      class: "access-button-wrap",
      "access-group": group,
      "access-order": order,
    };
    button.setAttribute("access-group", group);
    button.setAttribute("access-order", order);
    this.accessOrder += 1;

    const run = (event) => {
      event?.preventDefault();
      event?.stopPropagation();
      if (button.disabled || button.getAttribute("aria-hidden") === "true") return;
      if (once && button.dataset.activated === "true") return;
      if (once) button.dataset.activated = "true";
      onActivate(event);
    };

    if (button.parentNode) {
      button.parentNode.insertBefore(wrapper, button);
      wrapper.appendChild(button);
    } else {
      wrapper.appendChild(button);
    }
    button.accessWrapper = wrapper;
    button.addEventListener("click", run);
    button.addEventListener("access-click", run);
    wrapper.addEventListener("access-click", run);
  }

  addShelfFurniture(scene) {
    const stack = scene.createChild("div", { class: "shelf-stack", "aria-hidden": "true" });
    stack.createChild("div", { class: "shelf-row" });
    stack.createChild("div", { class: "shelf-row" });
    scene.createChild("div", { class: "wood-rail", "aria-hidden": "true" });
  }

  addStaticItem(parent, itemId, className) {
    const holder = parent.createChild("div", { class: className, "aria-hidden": "true" });
    holder.appendChild(this.createItemArt(itemId));
    return holder;
  }

  createItemButton(itemId, onClick) {
    const button = new SvgPlus("button");
    button.props = {
      class: "item-button",
      type: "button",
      "aria-label": `Choose ${ITEMS[itemId].name}`,
    };
    button.appendChild(this.createItemArt(itemId));
    this.bindAction(button, onClick, { group: "shelf" });
    return button;
  }

  createItemArt(itemId) {
    const art = new SvgPlus("div");
    art.props = { class: "item-art", "aria-hidden": "true", "data-item-id": itemId };
    art.innerHTML = ITEMS[itemId].svg();
    return art;
  }

  createTickButton(parent, ariaLabel, onClick) {
    const button = parent.createChild("button", {
      class: "tick-button",
      type: "button",
      "aria-label": ariaLabel,
    });
    button.innerHTML = CHECK_ICON;
    this.bindAction(
      button,
      () => {
        this.playSound("button");
        onClick();
      },
      { group: "progress", once: true }
    );
    return button;
  }

  addBag(parent, extraClass = "") {
    this.bagSerial += 1;
    const bag = parent.createChild("div", {
      class: `purple-bag ${extraClass}`.trim(),
      "aria-hidden": "true",
    });
    bag.innerHTML = bagSvg(`bag-${this.bagSerial}`);
    return bag;
  }

  addConfetti(parent) {
    const colors = ["#ff5f7e", "#28c2ff", "#7be500", "#8c35e8", "#ff9f1c", "#ffffff"];
    for (let index = 0; index < 42; index += 1) {
      const side = index % 2 === 0 ? "left" : "right";
      const piece = parent.createChild("span", { class: `confetti-piece ${side}`, "aria-hidden": "true" });
      const direction = side === "left" ? 1 : -1;
      piece.styles = {
        background: colors[index % colors.length],
        "--tx": `${direction * (24 + (index % 9) * 7)}vw`,
        "--ty": `${-24 - (index % 7) * 5}vh`,
        "--spin": `${direction * (220 + index * 18)}deg`,
        "animation-delay": `${(index % 10) * 42}ms`,
      };
    }
  }

  addSoundToggle(parent) {
    const button = parent.createChild("button", { class: "sound-toggle", type: "button" });
    this.updateSoundToggle(button);
    this.bindAction(button, () => {
      const wasMuted = this.soundMuted;
      this.soundMuted = !this.soundMuted;
      this.updateSoundToggle(button);
      if (wasMuted) this.playSound("toggle");
      this.publishSyncedState(this.soundMuted ? "mute-sound" : "unmute-sound");
    }, { group: "settings" });
  }

  updateSoundToggle(button) {
    button.innerHTML = this.soundMuted ? SOUND_OFF_ICON : SOUND_ON_ICON;
    button.setAttribute("aria-label", this.soundMuted ? "Turn sound on" : "Mute sound");
    button.setAttribute("aria-pressed", String(!this.soundMuted));
  }

  addHomeButton(parent) {
    const button = parent.createChild("button", {
      class: "home-button",
      type: "button",
      "aria-label": "Home",
    });
    button.innerHTML = HOME_ICON;
    this.bindAction(button, () => this.goHome(), { group: "navigation" });
  }

  addTripBadge(parent) {
    if (!this.theme) return;
    const badge = parent.createChild("div", {
      class: "trip-badge",
      "aria-label": `${this.theme.name} shopping trip`,
    });
    badge.innerHTML = `${themeIconSvg(this.theme.icon)}<span>${this.theme.name}</span>`;
  }

  addThemePicker(parent) {
    const picker = parent.createChild("div", { class: "theme-picker", "aria-label": "Shopping trip theme" });
    for (const theme of SHOPPING_THEMES) {
      const isSelected = theme === this.theme;
      const button = picker.createChild("button", {
        class: `theme-choice ${isSelected ? "is-selected" : ""}`.trim(),
        type: "button",
        "aria-label": theme.name,
        "aria-pressed": String(isSelected),
      });
      button.innerHTML = `${themeIconSvg(theme.icon)}<span>${theme.name}</span>`;
      this.bindAction(button, () => this.selectTheme(theme), { group: "themes" });
    }
  }

  awardRoundSticker(roundCorrectCount, totalCount) {
    const rating = roundCorrectCount === totalCount ? "perfect" : roundCorrectCount >= Math.ceil(totalCount * 0.6) ? "great" : "brave";
    const sticker = {
      type: this.theme.stickers[this.roundIndex % this.theme.stickers.length],
      rating,
    };
    this.earnedStickers.push(sticker);
    return sticker;
  }

  showRoundSticker(parent, sticker, roundCorrectCount, totalCount) {
    const reward = parent.createChild("div", {
      class: `round-reward is-${sticker.rating}`,
      "aria-live": "polite",
    });
    reward.appendChild(this.createStickerArt(sticker, "round-sticker"));
    reward.createChild("span", {
      content: roundCorrectCount === totalCount ? "Perfect round!" : `${roundCorrectCount}/${totalCount} remembered`,
    });
    this.playSound("sticker");
  }

  createStickerArt(sticker, extraClass = "") {
    this.stickerSerial += 1;
    const art = new SvgPlus("div");
    art.props = {
      class: `sticker-art ${extraClass}`.trim(),
      role: "img",
      "aria-label": `${sticker.rating} ${sticker.type} sticker`,
    };
    art.innerHTML = stickerSvg(sticker.type, `sticker-${this.stickerSerial}`, sticker.rating);
    return art;
  }

  ensureAudioContext() {
    if (this.soundMuted) return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.audioContext) this.audioContext = new AudioContextClass();
    if (this.audioContext.state === "suspended") this.audioContext.resume();
    return this.audioContext;
  }

  playSound(name) {
    const audioContext = this.ensureAudioContext();
    if (!audioContext) return;

    const soundMap = {
      start: [
        { frequency: 392, endFrequency: 523, delay: 0, duration: 0.09, gain: 0.055, type: "triangle" },
        { frequency: 523, endFrequency: 659, delay: 0.08, duration: 0.11, gain: 0.052, type: "triangle" },
        { frequency: 659, endFrequency: 784, delay: 0.17, duration: 0.13, gain: 0.048, type: "sine" },
      ],
      button: [{ frequency: 620, endFrequency: 820, delay: 0, duration: 0.08, gain: 0.035, type: "sine" }],
      pick: [{ frequency: 480, endFrequency: 760, delay: 0, duration: 0.1, gain: 0.045, type: "triangle" }],
      remove: [{ frequency: 420, endFrequency: 260, delay: 0, duration: 0.12, gain: 0.038, type: "triangle" }],
      correct: [
        { frequency: 784, endFrequency: 988, delay: 0, duration: 0.08, gain: 0.044, type: "sine" },
        { frequency: 988, endFrequency: 1175, delay: 0.07, duration: 0.1, gain: 0.04, type: "sine" },
      ],
      wrong: [
        { frequency: 210, endFrequency: 165, delay: 0, duration: 0.16, gain: 0.045, type: "sawtooth" },
        { frequency: 170, endFrequency: 135, delay: 0.11, duration: 0.15, gain: 0.028, type: "triangle" },
      ],
      sticker: [
        { frequency: 880, endFrequency: 1175, delay: 0, duration: 0.1, gain: 0.042, type: "sine" },
        { frequency: 1320, endFrequency: 1568, delay: 0.08, duration: 0.13, gain: 0.032, type: "sine" },
      ],
      toggle: [{ frequency: 700, endFrequency: 900, delay: 0, duration: 0.08, gain: 0.035, type: "triangle" }],
      win: [
        { frequency: 523, endFrequency: 659, delay: 0, duration: 0.13, gain: 0.05, type: "triangle" },
        { frequency: 659, endFrequency: 784, delay: 0.12, duration: 0.13, gain: 0.05, type: "triangle" },
        { frequency: 784, endFrequency: 1046, delay: 0.24, duration: 0.22, gain: 0.046, type: "sine" },
      ],
    };

    if (name === "fly") {
      this.playNoise(audioContext, 0.1, 0.016, 1600);
      this.playTone(audioContext, { frequency: 520, endFrequency: 390, delay: 0, duration: 0.12, gain: 0.018, type: "sine" });
      return;
    }

    for (const tone of soundMap[name] || []) {
      this.playTone(audioContext, tone);
    }
  }

  playTone(audioContext, tone) {
    const startTime = audioContext.currentTime + tone.delay;
    const endTime = startTime + tone.duration;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, endTime);
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(tone.gain, startTime + 0.018);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);
    oscillator.connect(gainNode).connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(endTime + 0.02);
  }

  playNoise(audioContext, duration, gain, frequency) {
    const sampleCount = Math.floor(audioContext.sampleRate * duration);
    const buffer = audioContext.createBuffer(1, sampleCount, audioContext.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();
    filter.type = "highpass";
    filter.frequency.value = frequency;
    gainNode.gain.value = gain;
    source.buffer = buffer;
    source.connect(filter).connect(gainNode).connect(audioContext.destination);
    source.start(audioContext.currentTime);
  }

  pulseElement(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  getShelfItems() {
    if (this.shelfItemsByRound[this.roundIndex]) {
      return this.shelfItemsByRound[this.roundIndex];
    }

    const targets = this.currentList();
    const neededCount = Math.max(5, Math.min(8, targets.length + 3));
    const extras = [];
    const itemPool = this.currentItemPool();
    const distractorPool = randomShuffle(itemPool.filter((itemId) => !targets.includes(itemId)));
    let cursor = 0;
    while (extras.length < neededCount - targets.length && cursor < distractorPool.length) {
      const itemId = distractorPool[cursor];
      if (!targets.includes(itemId) && !extras.includes(itemId)) extras.push(itemId);
      cursor += 1;
    }
    this.shelfItemsByRound[this.roundIndex] = randomShuffle([...targets, ...extras]);
    return this.shelfItemsByRound[this.roundIndex];
  }

  async flyItem(itemId, fromElement, toElement, duration = 560) {
    if (!fromElement || !toElement) return;
    this.playSound("fly");
    const from = fromElement.getBoundingClientRect();
    const to = toElement.getBoundingClientRect();
    const startSize = Math.max(42, Math.min(from.width, from.height));
    const endSize = Math.max(38, Math.min(to.width, to.height) * 0.72);
    const flyer = document.createElement("div");
    flyer.className = "flying-item";
    flyer.style.width = `${startSize}px`;
    flyer.style.height = `${startSize}px`;
    flyer.style.left = `${from.left + from.width / 2 - startSize / 2}px`;
    flyer.style.top = `${from.top + from.height / 2 - startSize / 2}px`;
    flyer.innerHTML = ITEMS[itemId].svg();
    document.body.appendChild(flyer);

    const deltaX = to.left + to.width / 2 - (from.left + from.width / 2);
    const deltaY = to.top + to.height / 2 - (from.top + from.height / 2);
    const animation = flyer.animate(
      [
        { transform: "translate(0, 0) rotate(0deg) scale(1)", opacity: 1 },
        { transform: `translate(${deltaX * 0.5}px, ${deltaY * 0.3 - 60}px) rotate(-9deg) scale(1.08)`, opacity: 1, offset: 0.48 },
        { transform: `translate(${deltaX}px, ${deltaY}px) rotate(8deg) scale(${endSize / startSize})`, opacity: 0.98 },
      ],
      { duration, easing: "cubic-bezier(.2,.8,.25,1)", fill: "forwards" }
    );

    try {
      await Promise.race([animation.finished.catch(() => undefined), delay(duration + 120)]);
    } finally {
      flyer.remove();
    }
  }
}

function createRandomRoundLists(itemPool = SHELF_POOL) {
  const requiredCount = ROUND_SIZES.reduce((total, size) => total + size, 0);
  const usablePool = itemPool.length >= requiredCount ? itemPool : SHELF_POOL;
  const shuffled = randomShuffle(usablePool);
  let cursor = 0;
  return ROUND_SIZES.map((size) => {
    if (cursor + size > shuffled.length) cursor = 0;
    const list = shuffled.slice(cursor, cursor + size);
    cursor += size;
    return list;
  });
}

function randomShuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function createSyncClientId() {
  return `shopping-memory-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function getThemeByName(name) {
  return SHOPPING_THEMES.find((theme) => theme.name === name);
}

function clampInteger(value, min, max) {
  const number = Number.isFinite(value) ? Math.floor(value) : min;
  return Math.max(min, Math.min(max, number));
}

function cleanItemIds(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((itemId, index, items) => ITEMS[itemId] && items.indexOf(itemId) === index);
}

function copyItemRows(value) {
  if (!Array.isArray(value)) return [];
  return value.map((row) => cleanItemIds(row)).filter((row) => row.length > 0);
}

function copyShelfRows(value) {
  if (!Array.isArray(value)) return [];
  return value.map((row) => (Array.isArray(row) ? cleanItemIds(row) : undefined));
}

function copyStickers(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((sticker) => sticker && typeof sticker.type === "string" && typeof sticker.rating === "string")
    .map((sticker) => ({ type: sticker.type, rating: sticker.rating }));
}

function themeIconSvg(icon) {
  const icons = {
    party: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M16 62 L32 18 L58 56 Z" fill="#ffcf4d" stroke="#315868" stroke-width="4" stroke-linejoin="round"/>
        <path d="M27 31 L47 39 M23 43 L53 53" stroke="#ff6f91" stroke-width="5" stroke-linecap="round"/>
        <circle cx="55" cy="22" r="11" fill="#68d8ff" stroke="#315868" stroke-width="4"/>
        <path d="M54 34 C54 43 50 47 43 51" fill="none" stroke="#315868" stroke-width="3" stroke-linecap="round"/>
      </svg>`,
    picnic: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M20 34 C20 20 60 20 60 34" fill="none" stroke="#315868" stroke-width="6" stroke-linecap="round"/>
        <rect x="14" y="33" width="52" height="30" rx="9" fill="#ffb457" stroke="#315868" stroke-width="4"/>
        <path d="M16 46 H64 M31 34 V63 M49 34 V63" stroke="#f06f4f" stroke-width="4" opacity="0.8"/>
        <path d="M25 27 C31 19 44 18 51 27" fill="none" stroke="#82c65a" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    breakfast: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="35" r="19" fill="#ffd85a" stroke="#315868" stroke-width="4"/>
        <path d="M40 8 V17 M40 53 V65 M13 35 H22 M58 35 H68 M21 16 L28 23 M52 49 L60 57 M59 16 L52 23 M28 49 L20 57" stroke="#ff9e30" stroke-width="5" stroke-linecap="round"/>
        <path d="M22 61 H58" stroke="#315868" stroke-width="5" stroke-linecap="round"/>
      </svg>`,
    rainbow: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M12 59 C14 28 66 28 68 59" fill="none" stroke="#ff5f7e" stroke-width="9" stroke-linecap="round"/>
        <path d="M22 59 C24 39 56 39 58 59" fill="none" stroke="#ffd84a" stroke-width="9" stroke-linecap="round"/>
        <path d="M32 59 C34 50 46 50 48 59" fill="none" stroke="#48d33b" stroke-width="9" stroke-linecap="round"/>
        <circle cx="17" cy="61" r="7" fill="#ffffff"/>
        <circle cx="63" cy="61" r="7" fill="#ffffff"/>
      </svg>`,
    fruit: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="33" cy="47" r="18" fill="#ff5c5c" stroke="#315868" stroke-width="4"/>
        <circle cx="52" cy="50" r="17" fill="#ffb13c" stroke="#315868" stroke-width="4"/>
        <path d="M42 23 C53 14 65 18 69 29 C57 32 48 31 42 23 Z" fill="#58c95b" stroke="#315868" stroke-width="3"/>
        <path d="M39 33 C38 25 36 20 32 16" fill="none" stroke="#71522a" stroke-width="5" stroke-linecap="round"/>
        <path d="M24 42 C27 36 31 33 36 31" fill="none" stroke="#ffa9a0" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    treat: `
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="M24 40 C25 26 35 19 48 22 C61 25 66 36 61 50 C57 63 45 69 32 65 C22 62 18 51 24 40 Z" fill="#ffd38c" stroke="#315868" stroke-width="4"/>
        <path d="M30 31 C39 24 53 29 55 39 C43 35 36 38 28 49 C26 42 26 36 30 31 Z" fill="#ff6f91"/>
        <circle cx="39" cy="43" r="4" fill="#ffffff"/>
        <circle cx="51" cy="45" r="4" fill="#64c7ff"/>
        <circle cx="42" cy="56" r="4" fill="#9ef04f"/>
      </svg>`,
  };
  return icons[icon] || icons.picnic;
}

function stickerSvg(type, id, rating) {
  const colors = {
    perfect: ["#fff8a8", "#ffca3a", "#ff7a59"],
    great: ["#d9fff0", "#5fe1a8", "#2db5d9"],
    brave: ["#f1e6ff", "#b278ff", "#6f4fe8"],
  }[rating] || ["#fff8a8", "#ffca3a", "#ff7a59"];

  const base = `
    <defs>
      <linearGradient id="${id}-base" x1="18%" y1="8%" x2="88%" y2="92%">
        <stop offset="0" stop-color="${colors[0]}"/>
        <stop offset="0.58" stop-color="${colors[1]}"/>
        <stop offset="1" stop-color="${colors[2]}"/>
      </linearGradient>
      <radialGradient id="${id}-shine" cx="30%" cy="24%" r="65%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/>
        <stop offset="0.48" stop-color="#ffffff" stop-opacity="0.16"/>
        <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="48" fill="url(#${id}-base)" stroke="#315868" stroke-width="5"/>
    <circle cx="60" cy="60" r="42" fill="none" stroke="#ffffff" stroke-width="5" stroke-dasharray="6 8" opacity="0.76"/>
    <circle cx="45" cy="38" r="26" fill="url(#${id}-shine)"/>`;

  const art = {
    star: `<path d="M60 24 L70 47 L95 49 L76 65 L82 90 L60 76 L38 90 L44 65 L25 49 L50 47 Z" fill="#ffffff" stroke="#315868" stroke-width="5" stroke-linejoin="round"/>`,
    heart: `<path d="M60 89 C34 70 25 58 27 43 C29 29 46 25 60 40 C74 25 91 29 93 43 C95 58 86 70 60 89 Z" fill="#ff5f7e" stroke="#315868" stroke-width="5" stroke-linejoin="round"/>`,
    crown: `<path d="M28 76 L34 39 L51 58 L60 32 L69 58 L86 39 L92 76 Z" fill="#ffffff" stroke="#315868" stroke-width="5" stroke-linejoin="round"/><path d="M35 82 H85" stroke="#315868" stroke-width="6" stroke-linecap="round"/>`,
    ribbon: `<path d="M36 27 H84 V72 H36 Z" fill="#ffffff" stroke="#315868" stroke-width="5"/><path d="M42 72 L42 96 L60 84 L78 96 L78 72" fill="#ff6f91" stroke="#315868" stroke-width="5" stroke-linejoin="round"/><path d="M48 49 H72 M48 61 H72" stroke="#315868" stroke-width="5" stroke-linecap="round"/>`,
    sun: `<circle cx="60" cy="60" r="22" fill="#fff7a3" stroke="#315868" stroke-width="5"/><path d="M60 22 V33 M60 87 V98 M22 60 H33 M87 60 H98 M33 33 L41 41 M79 79 L87 87 M87 33 L79 41 M41 79 L33 87" stroke="#315868" stroke-width="5" stroke-linecap="round"/>`,
    cart: `<path d="M31 37 H43 L51 72 H82 L91 47 H47" fill="none" stroke="#315868" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="56" cy="84" r="7" fill="#ffffff" stroke="#315868" stroke-width="5"/><circle cx="80" cy="84" r="7" fill="#ffffff" stroke="#315868" stroke-width="5"/><path d="M52 57 H84" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>`,
  };

  return `<svg viewBox="0 0 120 120" aria-hidden="true">${base}${art[type] || art.star}</svg>`;
}

function bagSvg(id) {
  return `
    <svg viewBox="0 0 260 230" aria-hidden="true">
      <defs>
        <linearGradient id="${id}-front" x1="18%" y1="8%" x2="86%" y2="96%">
          <stop offset="0" stop-color="#b667ff"/>
          <stop offset="0.42" stop-color="#8d35e6"/>
          <stop offset="1" stop-color="#5f17b3"/>
        </linearGradient>
        <linearGradient id="${id}-side" x1="7%" y1="5%" x2="92%" y2="90%">
          <stop offset="0" stop-color="#d583ff"/>
          <stop offset="0.58" stop-color="#a848f0"/>
          <stop offset="1" stop-color="#731fc4"/>
        </linearGradient>
        <linearGradient id="${id}-top" x1="8%" y1="0" x2="96%" y2="90%">
          <stop offset="0" stop-color="#f0b4ff"/>
          <stop offset="0.5" stop-color="#b756f6"/>
          <stop offset="1" stop-color="#5b138f"/>
        </linearGradient>
        <linearGradient id="${id}-inside" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#250445"/>
          <stop offset="0.62" stop-color="#3f086e"/>
          <stop offset="1" stop-color="#7512a8"/>
        </linearGradient>
        <linearGradient id="${id}-handle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#f0c1ff"/>
          <stop offset="0.5" stop-color="#b967ff"/>
          <stop offset="1" stop-color="#6e1bbd"/>
        </linearGradient>
      </defs>
      <ellipse cx="131" cy="211" rx="92" ry="13" fill="#3b124f" opacity="0.18"/>
      <g>
        <path d="M49 53 L158 32 L219 61 L205 201 L65 201 Z" fill="#4a0d86" opacity="0.22"/>
        <path d="M56 58 L162 39 L214 66 L198 196 L67 198 Z" fill="url(#${id}-front)"/>
        <path d="M162 39 L214 66 L198 196 L157 181 Z" fill="url(#${id}-side)"/>
        <path d="M56 58 L162 39 L214 66 L108 84 Z" fill="url(#${id}-top)"/>
        <path d="M73 64 L160 50 L194 66 L107 78 Z" fill="url(#${id}-inside)" opacity="0.95"/>
        <path d="M56 58 L108 84 L214 66" fill="none" stroke="#f2b0ff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>
        <path d="M73 64 L160 50 L194 66" fill="none" stroke="#2b0448" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.42"/>
        <path d="M82 88 L79 187" stroke="#ca77ff" stroke-width="4" stroke-linecap="round" opacity="0.36"/>
        <path d="M158 49 L155 184" stroke="#4b0b83" stroke-width="5" stroke-linecap="round" opacity="0.3"/>
        <path d="M178 79 L170 179" stroke="#f0b2ff" stroke-width="4" stroke-linecap="round" opacity="0.28"/>
        <path d="M107 102 C124 109 141 108 158 99" fill="none" stroke="#e9a0ff" stroke-width="5" stroke-linecap="round" opacity="0.34"/>
        <path d="M96 153 C125 163 154 162 181 151" fill="none" stroke="#4f0f82" stroke-width="4" stroke-linecap="round" opacity="0.22"/>
        <path d="M91 72 C90 29 129 18 142 56" fill="none" stroke="url(#${id}-handle)" stroke-width="12" stroke-linecap="round"/>
        <path d="M143 62 C153 24 196 25 192 75" fill="none" stroke="url(#${id}-handle)" stroke-width="12" stroke-linecap="round"/>
        <path d="M95 74 C96 39 124 31 134 58" fill="none" stroke="#4a0d7b" stroke-width="5" stroke-linecap="round" opacity="0.34"/>
        <path d="M149 63 C158 37 185 38 184 73" fill="none" stroke="#4a0d7b" stroke-width="5" stroke-linecap="round" opacity="0.34"/>
        <circle cx="91" cy="75" r="8" fill="#e4a1ff"/>
        <circle cx="143" cy="64" r="8" fill="#e4a1ff"/>
        <circle cx="185" cy="76" r="8" fill="#b75cff"/>
        <path d="M70 192 C112 203 156 202 198 195" fill="none" stroke="#3b0a63" stroke-width="5" stroke-linecap="round" opacity="0.18"/>
      </g>
    </svg>`;
}

function beachBallSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="beachBallGlow" cx="32%" cy="25%" r="78%">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="0.5" stop-color="#6ee4e7"/>
          <stop offset="1" stop-color="#3abcc8"/>
        </radialGradient>
        <clipPath id="beachBallClip"><circle cx="60" cy="60" r="48"/></clipPath>
      </defs>
      <circle cx="60" cy="60" r="49" fill="url(#beachBallGlow)" stroke="#61bfd0" stroke-width="2"/>
      <g clip-path="url(#beachBallClip)">
        <path d="M58 8 C72 33 69 61 51 111 L104 98 C89 72 88 43 103 19 Z" fill="#ffe45a"/>
        <path d="M70 18 C91 31 103 49 109 76 L118 28 Z" fill="#ff7a5c"/>
        <path d="M48 110 C38 76 40 49 55 8 L7 31 C23 51 28 78 21 101 Z" fill="#ffffff"/>
        <path d="M15 73 C32 74 43 85 48 107 L12 101 Z" fill="#ff7a5c"/>
        <path d="M81 86 C91 79 100 75 108 76 L101 101 C93 99 86 94 81 86 Z" fill="#7a62ff"/>
      </g>
      <circle cx="60" cy="60" r="11" fill="#fff6a6" stroke="#f4c832" stroke-width="3"/>
      <path d="M30 35 C36 27 45 22 55 20" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
      <circle cx="36" cy="51" r="5" fill="#fffef2" opacity="0.9"/>
    </svg>`;
}

function eggsSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="eggTray" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffe7a7"/>
          <stop offset="1" stop-color="#e5bd59"/>
        </linearGradient>
        <radialGradient id="eggShell" cx="32%" cy="20%" r="80%">
          <stop offset="0" stop-color="#fffaf0"/>
          <stop offset="0.7" stop-color="#f7eadb"/>
          <stop offset="1" stop-color="#ead7c9"/>
        </radialGradient>
      </defs>
      <path d="M20 68 H100 L92 99 H29 Z" fill="url(#eggTray)" stroke="#d4aa52" stroke-width="2"/>
      <path d="M28 54 H92 C101 54 106 63 101 71 L19 71 C14 63 19 54 28 54 Z" fill="#ffedae" stroke="#e4bd66" stroke-width="2"/>
      <path d="M31 53 C31 32 46 21 55 40 C63 57 52 77 41 77 C34 77 31 66 31 53 Z" fill="url(#eggShell)"/>
      <path d="M52 51 C52 27 70 18 79 40 C87 60 74 79 63 78 C56 77 52 65 52 51 Z" fill="url(#eggShell)"/>
      <path d="M72 52 C72 31 88 21 97 41 C104 59 93 76 82 76 C75 76 72 64 72 52 Z" fill="url(#eggShell)"/>
      <path d="M40 38 C42 33 45 30 49 29 M62 36 C65 30 69 27 73 27 M82 37 C85 32 89 30 92 30" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
      <rect x="42" y="82" width="39" height="13" rx="4" fill="#65c8ef"/>
      <text x="61.5" y="92" text-anchor="middle" font-size="10" font-weight="900" fill="#ffffff">EGG</text>
    </svg>`;
}

function vanillaSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="vanillaBottle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#fff0c4"/>
          <stop offset="0.62" stop-color="#ffd98c"/>
          <stop offset="1" stop-color="#efb95a"/>
        </linearGradient>
      </defs>
      <path d="M49 13 H70 V27 C82 34 87 47 82 64 L72 101 H48 L38 64 C33 47 38 34 49 27 Z" fill="url(#vanillaBottle)" stroke="#dba75a" stroke-width="2"/>
      <rect x="49" y="8" width="22" height="14" rx="5" fill="#d79a53"/>
      <rect x="51" y="5" width="18" height="7" rx="3" fill="#edb268"/>
      <ellipse cx="60" cy="63" rx="24" ry="29" fill="#fff7dc" stroke="#dfaa54" stroke-width="3"/>
      <text x="60" y="59" text-anchor="middle" font-size="10" font-weight="900" fill="#d7792b">VANILLA</text>
      <path d="M45 82 C56 69 62 96 78 73" fill="none" stroke="#e9ba6d" stroke-width="7" stroke-linecap="round"/>
      <path d="M48 36 C44 44 43 54 46 63" fill="none" stroke="#fff8dc" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
    </svg>`;
}

function redVelvetSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="velvetBottle" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff9aa8"/>
          <stop offset="0.58" stop-color="#ea4b69"/>
          <stop offset="1" stop-color="#bf254d"/>
        </linearGradient>
        <linearGradient id="velvetLabel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffecdf"/>
          <stop offset="1" stop-color="#ffd1c3"/>
        </linearGradient>
      </defs>
      <path d="M48 18 H72 V31 C84 37 88 52 83 70 L73 102 C63 108 49 107 39 101 L35 70 C30 52 36 37 48 31 Z" fill="url(#velvetBottle)" stroke="#c63857" stroke-width="2"/>
      <rect x="48" y="9" width="24" height="14" rx="5" fill="#d8395b"/>
      <rect x="51" y="4" width="18" height="8" rx="3" fill="#eb506f"/>
      <path d="M39 76 C51 69 64 93 82 76 L75 99 C63 107 50 106 39 99 Z" fill="#b72e4d" opacity="0.86"/>
      <rect x="39" y="45" width="43" height="31" rx="11" fill="url(#velvetLabel)" stroke="#d94e63" stroke-width="3" transform="rotate(-2 60 61)"/>
      <text x="60" y="58" text-anchor="middle" font-size="10" font-weight="900" fill="#d94a5c">RED</text>
      <text x="60" y="70" text-anchor="middle" font-size="10" font-weight="900" fill="#d94a5c">VELVET</text>
      <path d="M45 36 C41 45 40 55 43 66" fill="none" stroke="#ffc9cf" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function orangeSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="orangeBody" cx="34%" cy="27%" r="73%">
          <stop offset="0" stop-color="#ffc13a"/>
          <stop offset="0.6" stop-color="#ff9122"/>
          <stop offset="1" stop-color="#f06f20"/>
        </radialGradient>
      </defs>
      <circle cx="61" cy="66" r="44" fill="url(#orangeBody)" stroke="#e17123" stroke-width="2"/>
      <path d="M61 26 C68 14 79 13 87 22 C78 27 69 29 61 26 Z" fill="#48bd52"/>
      <path d="M58 32 C57 23 55 18 51 13" fill="none" stroke="#667b2e" stroke-width="4" stroke-linecap="round"/>
      <path d="M34 56 C38 47 44 40 52 36" fill="none" stroke="#ffd876" stroke-width="5.5" stroke-linecap="round" opacity="0.75"/>
      <circle cx="37" cy="71" r="3" fill="#ffd876" opacity="0.75"/>
      <g fill="#e37a1f" opacity="0.16"><circle cx="75" cy="54" r="2"/><circle cx="82" cy="70" r="2"/><circle cx="55" cy="82" r="2"/><circle cx="68" cy="91" r="2"/></g>
    </svg>`;
}

function lemonSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="lemonBody" cx="33%" cy="25%" r="78%">
          <stop offset="0" stop-color="#fff58b"/>
          <stop offset="0.7" stop-color="#ffe04a"/>
          <stop offset="1" stop-color="#f6c733"/>
        </radialGradient>
      </defs>
      <path d="M16 64 C30 29 73 22 97 45 C106 54 106 70 96 80 C73 103 31 96 16 64 Z" fill="url(#lemonBody)" stroke="#e6bd2b" stroke-width="2"/>
      <path d="M16 64 C10 62 8 57 13 52 C19 49 22 53 21 59 Z" fill="#ffe04a"/>
      <path d="M97 45 C104 42 110 47 107 54 C103 58 98 55 95 50 Z" fill="#f6d43d"/>
      <path d="M34 49 C42 39 56 34 71 36" fill="none" stroke="#fff9a7" stroke-width="6" stroke-linecap="round" opacity="0.8"/>
      <g fill="#dfb928" opacity="0.17"><circle cx="58" cy="55" r="2"/><circle cx="73" cy="61" r="2"/><circle cx="45" cy="70" r="2"/><circle cx="64" cy="78" r="2"/></g>
    </svg>`;
}

function milkSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="milkSide" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#dff8ff"/>
        </linearGradient>
      </defs>
      <path d="M38 25 L50 8 H76 L89 25 V102 H37 Z" fill="url(#milkSide)" stroke="#61bde8" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 8 L63 25 H89 L76 8 Z" fill="#d9f3ff" stroke="#61bde8" stroke-width="3" stroke-linejoin="round"/>
      <path d="M39 67 C55 48 70 87 89 59 V102 H37 V76 C38 73 38 70 39 67 Z" fill="#5ed2ed"/>
      <path d="M39 55 C55 38 70 70 89 45" fill="none" stroke="#27aada" stroke-width="7" stroke-linecap="round"/>
      <text x="63" y="78" text-anchor="middle" font-size="19" font-weight="900" fill="#318fc9">MILK</text>
      <path d="M38 25 H89" stroke="#61bde8" stroke-width="4"/>
      <path d="M78 22 L87 13" stroke="#3939c5" stroke-width="7" stroke-linecap="round"/>
      <path d="M46 33 V51" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.76"/>
    </svg>`;
}

function breadSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="breadCrust" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e4a250"/>
          <stop offset="1" stop-color="#bd6d35"/>
        </linearGradient>
      </defs>
      <path d="M23 56 C23 30 48 18 61 35 C75 17 98 30 97 57 V96 H23 Z" fill="url(#breadCrust)"/>
      <path d="M32 59 C32 39 50 32 59 45 C67 29 89 39 89 59 V86 H32 Z" fill="#f6c77e"/>
      <path d="M42 63 C50 69 58 69 66 63 M46 78 C56 83 65 82 74 78" fill="none" stroke="#bd743c" stroke-width="4" stroke-linecap="round"/>
      <path d="M37 50 C41 42 48 39 55 39" fill="none" stroke="#ffdfa2" stroke-width="4" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function appleSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="appleBody" cx="38%" cy="30%" r="76%">
          <stop offset="0" stop-color="#ff6c5d"/>
          <stop offset="0.68" stop-color="#ef4545"/>
          <stop offset="1" stop-color="#d9333e"/>
        </radialGradient>
      </defs>
      <path d="M61 34 C73 22 94 31 98 56 C103 92 75 109 61 95 C47 109 18 92 23 56 C27 31 49 22 61 34 Z" fill="url(#appleBody)" stroke="#cf3341" stroke-width="2"/>
      <path d="M61 33 C59 23 56 17 51 12" fill="none" stroke="#6a4a1f" stroke-width="5" stroke-linecap="round"/>
      <path d="M63 24 C75 13 89 16 95 27 C82 31 72 31 63 24 Z" fill="#4ec260"/>
      <path d="M39 52 C43 43 50 39 57 38" fill="none" stroke="#ffa69b" stroke-width="5.5" stroke-linecap="round"/>
      <circle cx="43" cy="66" r="3" fill="#ffa69b" opacity="0.65"/>
    </svg>`;
}

function carrotSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="carrotBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffb13c"/>
          <stop offset="1" stop-color="#f07022"/>
        </linearGradient>
      </defs>
      <path d="M66 28 C77 45 74 83 43 106 C36 72 47 42 66 28 Z" fill="url(#carrotBody)" stroke="#dc681d" stroke-width="2"/>
      <path d="M64 27 C55 16 43 14 30 20 C44 25 52 32 57 41 Z" fill="#58c45b"/>
      <path d="M69 29 C73 16 85 11 99 15 C88 25 80 34 72 43 Z" fill="#47aa50"/>
      <path d="M59 31 C64 18 72 13 83 12 C78 23 72 32 67 39 Z" fill="#63d465"/>
      <path d="M55 52 L68 48 M50 69 L63 64 M45 86 L56 80" stroke="#d96420" stroke-width="4" stroke-linecap="round"/>
      <path d="M58 42 C52 55 48 69 47 86" fill="none" stroke="#ffbd67" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    </svg>`;
}

function juiceSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="juiceBox" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffbd4f"/>
          <stop offset="1" stop-color="#ff7b2d"/>
        </linearGradient>
      </defs>
      <rect x="38" y="20" width="45" height="87" rx="13" fill="url(#juiceBox)" stroke="#ef7629" stroke-width="2"/>
      <rect x="45" y="12" width="31" height="16" rx="5" fill="#6ec8f1"/>
      <rect x="44" y="47" width="34" height="35" rx="8" fill="#fff1bd"/>
      <circle cx="61" cy="65" r="12" fill="#ff7a23"/>
      <path d="M54 61 C58 56 64 55 69 58" fill="none" stroke="#ffd766" stroke-width="3" stroke-linecap="round"/>
      <text x="60.5" y="96" text-anchor="middle" font-size="13" font-weight="900" fill="#ffffff">JUICE</text>
      <path d="M48 33 V45" stroke="#ffe7a5" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
    </svg>`;
}

function bananaSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M24 73 C45 98 88 94 103 53 C73 73 45 71 30 45 C27 55 23 64 24 73 Z" fill="#ffe257" stroke="#dba92d" stroke-width="2"/>
      <path d="M31 45 C50 69 75 71 103 53" fill="none" stroke="#dfa92b" stroke-width="6" stroke-linecap="round"/>
      <path d="M31 63 C48 80 74 82 92 66" fill="none" stroke="#fff48a" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M24 73 C23 80 28 86 36 89" stroke="#72532c" stroke-width="6" stroke-linecap="round"/>
      <path d="M100 52 C105 48 108 43 108 38" stroke="#72532c" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
}

function cheeseSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="cheeseTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffe36b"/>
          <stop offset="1" stop-color="#ffc133"/>
        </linearGradient>
      </defs>
      <path d="M21 78 L96 34 L105 89 H26 Z" fill="url(#cheeseTop)" stroke="#e2a92e" stroke-width="2"/>
      <path d="M21 78 L26 99 H105 V89 Z" fill="#edb82f"/>
      <circle cx="75" cy="67" r="8" fill="#e5a72c"/>
      <circle cx="50" cy="79" r="6" fill="#e5a72c"/>
      <circle cx="91" cy="85" r="5" fill="#e5a72c"/>
      <path d="M42 70 L69 55" stroke="#fff08a" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
    </svg>`;
}

function cerealSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="cerealBox" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff85a0"/>
          <stop offset="1" stop-color="#f14b7a"/>
        </linearGradient>
      </defs>
      <path d="M34 15 H88 L83 105 H38 Z" fill="url(#cerealBox)" stroke="#d63e72" stroke-width="2"/>
      <path d="M42 26 H79 V51 H42 Z" fill="#ffe873"/>
      <text x="60.5" y="43" text-anchor="middle" font-size="12" font-weight="900" fill="#af3175">OATS</text>
      <circle cx="53" cy="72" r="9" fill="#ffe9b7" stroke="#e6bf76" stroke-width="2"/>
      <circle cx="70" cy="78" r="8" fill="#ffe9b7" stroke="#e6bf76" stroke-width="2"/>
      <circle cx="62" cy="69" r="6" fill="#fff3c9"/>
      <path d="M34 15 L45 7 H94 L88 15 Z" fill="#ff9ab0"/>
      <path d="M43 58 V92" stroke="#ffabc0" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    </svg>`;
}

function strawberriesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M45 28 C64 22 81 34 79 56 C76 78 57 97 46 105 C34 94 21 72 24 51 C26 35 35 30 45 28 Z" fill="#ef3d55" stroke="#cf334a" stroke-width="2"/>
      <path d="M74 33 C89 28 102 39 99 57 C96 76 80 92 70 99 C61 91 50 72 54 54 C56 41 64 35 74 33 Z" fill="#ff5c68" stroke="#d74355" stroke-width="2"/>
      <path d="M42 30 L36 18 L51 26 L62 17 L60 31" fill="#49b851"/>
      <path d="M72 34 L67 23 L80 30 L90 23 L88 37" fill="#49b851"/>
      <path d="M36 46 C40 39 47 36 54 36" fill="none" stroke="#ff8998" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
      <g fill="#ffe79a"><circle cx="40" cy="50" r="2.2"/><circle cx="51" cy="62" r="2.2"/><circle cx="38" cy="76" r="2.2"/><circle cx="72" cy="56" r="2.2"/><circle cx="83" cy="68" r="2.2"/><circle cx="69" cy="80" r="2.2"/></g>
    </svg>`;
}

function yogurtSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="yogurtCup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ffffff"/>
          <stop offset="1" stop-color="#ecebff"/>
        </linearGradient>
      </defs>
      <path d="M33 35 H88 L80 105 H41 Z" fill="url(#yogurtCup)" stroke="#d9d6ff" stroke-width="2"/>
      <rect x="28" y="25" width="65" height="17" rx="6" fill="#7b6cff"/>
      <path d="M40 58 C53 47 65 72 81 55 V88 H40 Z" fill="#ff81b5"/>
      <text x="61" y="79" text-anchor="middle" font-size="14" font-weight="900" fill="#ffffff">YUM</text>
      <path d="M45 45 V56" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.78"/>
      <circle cx="75" cy="65" r="4" fill="#ffb2cf"/>
    </svg>`;
}

function cupcakeSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <linearGradient id="cupcakeCup" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#7ee7ef"/>
          <stop offset="1" stop-color="#3fb7d7"/>
        </linearGradient>
        <radialGradient id="cupcakeFrosting" cx="35%" cy="25%" r="75%">
          <stop offset="0" stop-color="#fff5ff"/>
          <stop offset="0.72" stop-color="#ff9bd1"/>
          <stop offset="1" stop-color="#f06ab7"/>
        </radialGradient>
      </defs>
      <path d="M29 58 C24 43 39 35 48 42 C50 27 70 26 73 43 C84 34 99 45 91 61 C104 65 99 85 84 82 H35 C20 83 16 65 29 58 Z" fill="url(#cupcakeFrosting)" stroke="#e869ae" stroke-width="2"/>
      <path d="M34 75 H86 L78 106 H42 Z" fill="url(#cupcakeCup)" stroke="#35a4c5" stroke-width="2"/>
      <path d="M43 79 L47 103 M55 77 L57 105 M69 77 L67 105 M81 79 L75 103" stroke="#2d9ab7" stroke-width="3" stroke-linecap="round" opacity="0.55"/>
      <circle cx="48" cy="54" r="3" fill="#fff06d"/><circle cx="64" cy="48" r="3" fill="#7be500"/><circle cx="78" cy="58" r="3" fill="#28c2ff"/>
      <path d="M41 51 C47 43 58 41 66 45" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.74"/>
    </svg>`;
}

function donutSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="donutDough" cx="33%" cy="26%" r="75%">
          <stop offset="0" stop-color="#f9c987"/>
          <stop offset="1" stop-color="#c9823f"/>
        </radialGradient>
        <radialGradient id="donutIcing" cx="35%" cy="28%" r="76%">
          <stop offset="0" stop-color="#ffb7dc"/>
          <stop offset="1" stop-color="#ef5dad"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="62" r="45" fill="url(#donutDough)"/>
      <path d="M22 60 C31 34 52 25 73 28 C97 31 106 54 99 75 C92 98 64 108 42 96 C24 86 15 76 22 60 Z" fill="url(#donutIcing)"/>
      <circle cx="60" cy="62" r="16" fill="#c9823f"/>
      <circle cx="60" cy="62" r="11" fill="#b8733b"/>
      <g stroke-linecap="round" stroke-width="5"><path d="M40 50 L50 44" stroke="#fff17b"/><path d="M76 48 L88 53" stroke="#7de7ef"/><path d="M39 76 L51 81" stroke="#ffffff"/><path d="M72 86 L84 78" stroke="#78ff8d"/><path d="M87 68 L96 72" stroke="#8c35e8"/></g>
      <path d="M34 50 C40 39 52 34 65 35" fill="none" stroke="#ffcfe8" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function cookieSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="cookieBody" cx="36%" cy="28%" r="76%">
          <stop offset="0" stop-color="#f7ca82"/>
          <stop offset="1" stop-color="#c9853c"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="62" r="45" fill="url(#cookieBody)" stroke="#b56e31" stroke-width="2"/>
      <g fill="#70422d"><circle cx="43" cy="50" r="6"/><circle cx="68" cy="42" r="5"/><circle cx="80" cy="68" r="6"/><circle cx="51" cy="78" r="5"/><circle cx="64" cy="91" r="4"/></g>
      <g fill="#d79b52" opacity="0.5"><circle cx="36" cy="71" r="4"/><circle cx="58" cy="55" r="3"/><circle cx="86" cy="49" r="3"/></g>
      <path d="M35 42 C43 34 55 30 68 32" fill="none" stroke="#ffe0a6" stroke-width="5" stroke-linecap="round" opacity="0.72"/>
    </svg>`;
}

function sprinklesSvg() {
  return `
    <svg viewBox="0 0 140 120" aria-hidden="true">
      <path d="M18 25 C48 16 91 16 122 25 L111 107 H29 Z" fill="#d859c9"/>
      <path d="M18 25 C49 34 90 34 122 25 L116 49 C96 57 48 58 24 49 Z" fill="#5f2a18"/>
      <text x="70" y="56" text-anchor="middle" font-size="21" font-weight="900" fill="#78e8d6" stroke="#ffffff" stroke-width="4" paint-order="stroke">SPRINKLES</text>
      <g stroke-linecap="round" stroke-width="5" fill="none">
        <path d="M43 78 L54 88" stroke="#fff17b"/><path d="M66 78 L82 69" stroke="#7de7ef"/><path d="M88 89 L101 80" stroke="#fff"/><path d="M52 93 L70 98" stroke="#78ff8d"/>
      </g>
      <g fill="#d7cd2b"><path d="M37 63 L42 68 L48 64 L45 72 L51 76 L43 76 L39 84 L37 76 L29 75 L35 70 Z"/><path d="M98 62 L103 67 L109 63 L106 71 L112 75 L104 75 L100 83 L98 75 L90 74 L96 69 Z"/></g>
    </svg>`;
}

function gummiesSvg() {
  return `
    <svg viewBox="0 0 140 120" aria-hidden="true">
      <path d="M18 21 C49 13 91 13 122 21 L115 108 H25 Z" fill="#d79b24"/>
      <path d="M25 61 C48 44 65 74 86 55 C98 45 112 52 119 62 L115 108 H25 Z" fill="#8c35e8"/>
      <text x="70" y="45" text-anchor="middle" font-size="22" font-weight="900" fill="#ffffff" stroke="#f1b23c" stroke-width="5" paint-order="stroke">JELLIES</text>
      <g opacity="0.82"><circle cx="48" cy="73" r="9" fill="#5fe8b4"/><circle cx="65" cy="68" r="8" fill="#ff5f7e"/><circle cx="82" cy="76" r="9" fill="#7be500"/><circle cx="99" cy="70" r="8" fill="#28c2ff"/></g>
    </svg>`;
}

function jamSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M36 29 H84 L91 99 C76 107 49 107 31 99 Z" fill="#d94a4a"/>
      <path d="M39 24 H81 V35 H39 Z" rx="5" fill="#d0a59c"/>
      <rect x="38" y="48" width="45" height="34" rx="7" fill="#cf3348" stroke="#f49aa0" stroke-width="3"/>
      <text x="60" y="62" text-anchor="middle" font-size="14" font-weight="900" fill="#ffd3d3">BERRY</text>
      <text x="60" y="77" text-anchor="middle" font-size="14" font-weight="900" fill="#ffd3d3">JAM</text>
    </svg>`;
}

function partyHatSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M23 96 L59 16 L97 96 Z" fill="#ffcf4d" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M42 54 L75 70 M35 71 L84 91" stroke="#ff5f9a" stroke-width="8" stroke-linecap="round"/>
      <path d="M50 37 L66 45 M31 92 H94" stroke="#60d8ff" stroke-width="7" stroke-linecap="round"/>
      <circle cx="59" cy="14" r="10" fill="#7be500" stroke="#315868" stroke-width="3"/>
      <path d="M39 98 C50 104 70 105 82 98" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
}

function presentSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="24" y="46" width="72" height="56" rx="10" fill="#ff6f91" stroke="#315868" stroke-width="3"/>
      <rect x="55" y="46" width="13" height="56" fill="#ffe45a"/>
      <rect x="20" y="37" width="80" height="18" rx="7" fill="#ff86a8" stroke="#315868" stroke-width="3"/>
      <path d="M60 39 C45 18 24 28 36 43 C43 51 54 46 60 39 Z" fill="#ffe45a" stroke="#315868" stroke-width="3"/>
      <path d="M60 39 C75 18 96 28 84 43 C77 51 66 46 60 39 Z" fill="#ffe45a" stroke="#315868" stroke-width="3"/>
      <path d="M35 66 H49 M72 78 H90" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function partyHornSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M28 78 C54 55 77 40 104 30 L91 91 C68 83 49 80 28 78 Z" fill="#68d8ff" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M47 65 L84 77 M62 54 L96 60" stroke="#ffcf4d" stroke-width="7" stroke-linecap="round"/>
      <circle cx="28" cy="78" r="13" fill="#ff6f91" stroke="#315868" stroke-width="3"/>
      <path d="M78 26 C82 14 94 17 91 29 M90 24 C103 13 113 24 102 34" fill="none" stroke="#7be500" stroke-width="5" stroke-linecap="round"/>
      <path d="M23 76 C17 71 14 65 14 58" fill="none" stroke="#315868" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function sandwichSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M20 80 L61 27 L101 80 Z" fill="#f4c779" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 78 L61 40 L91 78 Z" fill="#fff3bd"/>
      <path d="M31 78 C42 61 53 74 64 58 C75 76 87 61 96 78 Z" fill="#6acb66" stroke="#3f9e47" stroke-width="2"/>
      <path d="M39 76 L61 49 L83 76 Z" fill="#ff6f5f" opacity="0.85"/>
      <path d="M45 73 L61 53 L77 73 Z" fill="#ffd84a"/>
      <circle cx="48" cy="51" r="3" fill="#bf7b38"/><circle cx="67" cy="44" r="3" fill="#bf7b38"/>
    </svg>`;
}

function watermelonSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M17 72 C31 25 90 25 103 72 C83 98 40 98 17 72 Z" fill="#43bf55" stroke="#315868" stroke-width="3"/>
      <path d="M27 69 C39 38 80 37 93 69 C77 88 44 89 27 69 Z" fill="#ff5f7e"/>
      <path d="M23 70 C42 82 78 83 98 70" fill="none" stroke="#dfffb0" stroke-width="8" stroke-linecap="round"/>
      <g fill="#315868"><circle cx="47" cy="63" r="3.5"/><circle cx="61" cy="72" r="3.5"/><circle cx="74" cy="62" r="3.5"/></g>
      <path d="M38 51 C45 43 57 39 69 41" fill="none" stroke="#ff9eb0" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function waterBottleSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="46" y="13" width="28" height="17" rx="5" fill="#4ec5ff" stroke="#315868" stroke-width="3"/>
      <path d="M42 30 H78 L85 101 C72 108 49 108 36 101 Z" fill="#b9efff" stroke="#315868" stroke-width="3"/>
      <path d="M40 70 C52 57 68 82 83 63 L85 101 C72 108 49 108 36 101 Z" fill="#55cfff" opacity="0.85"/>
      <rect x="42" y="47" width="38" height="22" rx="8" fill="#ffffff" opacity="0.9"/>
      <text x="61" y="63" text-anchor="middle" font-size="13" font-weight="900" fill="#318fc9">WATER</text>
      <path d="M48 36 V50" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function pancakesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="84" rx="43" ry="15" fill="#d99345" stroke="#315868" stroke-width="3"/>
      <ellipse cx="60" cy="69" rx="39" ry="14" fill="#f4bd65" stroke="#c9853c" stroke-width="3"/>
      <ellipse cx="60" cy="55" rx="34" ry="13" fill="#ffd27a" stroke="#d89845" stroke-width="3"/>
      <rect x="51" y="37" width="22" height="16" rx="4" fill="#ffe45a" stroke="#d89a32" stroke-width="2"/>
      <path d="M60 51 C62 63 47 62 50 76 C53 87 71 77 66 93" fill="none" stroke="#b66b2e" stroke-width="7" stroke-linecap="round" opacity="0.75"/>
      <path d="M35 53 C43 45 56 42 70 45" fill="none" stroke="#ffe1a1" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function toastSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M27 55 C27 29 51 17 61 34 C73 16 94 31 93 56 V99 H27 Z" fill="#d88942" stroke="#315868" stroke-width="3"/>
      <path d="M37 59 C37 41 52 34 60 45 C69 32 83 42 83 59 V88 H37 Z" fill="#f6c77e"/>
      <path d="M45 66 C54 72 66 72 75 66 M47 80 C57 86 67 85 75 80" fill="none" stroke="#bd743c" stroke-width="4" stroke-linecap="round"/>
      <path d="M43 50 C47 43 53 40 60 40" fill="none" stroke="#ffe2a5" stroke-width="5" stroke-linecap="round"/>
      <circle cx="76" cy="51" r="5" fill="#ffd84a" opacity="0.85"/>
    </svg>`;
}

function honeySvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M42 30 H78 L87 99 C72 108 49 108 33 99 Z" fill="#ffbf3f" stroke="#315868" stroke-width="3"/>
      <rect x="44" y="17" width="33" height="17" rx="6" fill="#f2a92f" stroke="#315868" stroke-width="3"/>
      <rect x="40" y="52" width="42" height="28" rx="9" fill="#fff4b1" stroke="#d99b2f" stroke-width="3"/>
      <text x="61" y="70" text-anchor="middle" font-size="14" font-weight="900" fill="#c47a25">HONEY</text>
      <path d="M51 39 C45 50 50 55 45 63" fill="none" stroke="#ffe487" stroke-width="6" stroke-linecap="round"/>
      <path d="M78 35 C88 30 94 38 89 47" fill="none" stroke="#ffda62" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function grapesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M62 31 C67 19 78 15 89 21 C80 30 72 33 62 31 Z" fill="#55bf58" stroke="#315868" stroke-width="3"/>
      <path d="M58 38 C59 29 56 22 50 16" fill="none" stroke="#6a4a1f" stroke-width="5" stroke-linecap="round"/>
      <g stroke="#5b2ea6" stroke-width="2"><circle cx="51" cy="45" r="12" fill="#9466ff"/><circle cx="70" cy="47" r="12" fill="#7d4fe8"/><circle cx="42" cy="63" r="12" fill="#8f5cff"/><circle cx="61" cy="65" r="13" fill="#7848d6"/><circle cx="79" cy="66" r="12" fill="#9b6dff"/><circle cx="52" cy="83" r="12" fill="#7b4cda"/><circle cx="70" cy="85" r="11" fill="#8f5cff"/></g>
      <path d="M44 42 C49 37 56 35 62 36" fill="none" stroke="#c9b6ff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    </svg>`;
}

function pearSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 39 C52 21 78 15 78 37 C78 51 95 56 94 78 C93 100 75 109 60 105 C45 109 27 100 26 78 C25 56 42 51 42 37 C42 16 68 21 60 39 Z" fill="#b8e85b" stroke="#315868" stroke-width="3"/>
      <path d="M61 30 C62 22 59 16 54 10" fill="none" stroke="#6a4a1f" stroke-width="5" stroke-linecap="round"/>
      <path d="M65 22 C76 13 88 17 93 28 C81 31 72 30 65 22 Z" fill="#54c45a" stroke="#315868" stroke-width="3"/>
      <path d="M39 70 C42 57 50 49 59 48" fill="none" stroke="#ddff8e" stroke-width="6" stroke-linecap="round" opacity="0.7"/>
      <circle cx="73" cy="76" r="3" fill="#95c847"/>
    </svg>`;
}

function pineappleSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 14 C55 28 48 35 35 39 C47 43 54 48 60 60 C66 48 73 43 85 39 C72 35 65 28 60 14 Z" fill="#55c65a" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 57 C34 35 86 35 89 57 C95 89 78 108 60 108 C42 108 25 89 31 57 Z" fill="#f6c53f" stroke="#315868" stroke-width="3"/>
      <path d="M39 48 L83 92 M82 48 L38 92 M31 66 H89 M37 84 H83" stroke="#c98a2d" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M45 50 C52 43 66 41 75 46" fill="none" stroke="#ffe27c" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function iceCreamSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M37 60 H84 L62 107 Z" fill="#e7a755" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M43 70 L72 90 M77 70 L50 91" stroke="#be7b3c" stroke-width="4" stroke-linecap="round" opacity="0.65"/>
      <circle cx="60" cy="49" r="28" fill="#ff9bd1" stroke="#315868" stroke-width="3"/>
      <circle cx="45" cy="53" r="11" fill="#fff2a6" stroke="#315868" stroke-width="2"/>
      <circle cx="76" cy="54" r="11" fill="#8be9ff" stroke="#315868" stroke-width="2"/>
      <path d="M45 37 C51 29 62 26 72 30" fill="none" stroke="#ffd1e8" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function lollipopSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M62 67 L83 104" stroke="#315868" stroke-width="8" stroke-linecap="round"/>
      <path d="M62 67 L83 104" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="55" cy="43" r="34" fill="#ff6f91" stroke="#315868" stroke-width="3"/>
      <path d="M55 13 C82 16 91 53 66 66 C45 77 20 56 30 36 C37 22 57 25 62 38 C67 51 51 60 43 50" fill="none" stroke="#fff17b" stroke-width="9" stroke-linecap="round"/>
      <path d="M36 30 C42 22 52 19 61 21" fill="none" stroke="#ffc0d3" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function chocolateSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="28" y="23" width="64" height="82" rx="10" fill="#7c4428" stroke="#315868" stroke-width="3"/>
      <rect x="36" y="32" width="19" height="20" rx="5" fill="#9b5a34"/><rect x="60" y="32" width="19" height="20" rx="5" fill="#9b5a34"/>
      <rect x="36" y="57" width="19" height="20" rx="5" fill="#9b5a34"/><rect x="60" y="57" width="19" height="20" rx="5" fill="#9b5a34"/>
      <rect x="36" y="82" width="19" height="14" rx="5" fill="#9b5a34"/><rect x="60" y="82" width="19" height="14" rx="5" fill="#9b5a34"/>
      <path d="M44 38 H50 M68 38 H74 M44 63 H50 M68 63 H74" stroke="#c48352" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M28 26 C39 18 78 18 92 28" fill="none" stroke="#c48352" stroke-width="5" stroke-linecap="round" opacity="0.45"/>
    </svg>`;
}

function balloonsSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M48 60 C42 76 37 88 31 103 M66 61 C64 80 68 91 76 104 M80 56 C89 72 93 86 91 103" fill="none" stroke="#315868" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="45" cy="39" rx="20" ry="26" fill="#ff6f91" stroke="#315868" stroke-width="3"/>
      <ellipse cx="69" cy="38" rx="20" ry="27" fill="#68d8ff" stroke="#315868" stroke-width="3"/>
      <ellipse cx="83" cy="47" rx="18" ry="24" fill="#ffe45a" stroke="#315868" stroke-width="3"/>
      <path d="M37 29 C42 22 51 21 56 27 M62 27 C68 19 78 21 84 29" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.78"/>
    </svg>`;
}

function candlesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="30" y="39" width="17" height="58" rx="5" fill="#ff6f91" stroke="#315868" stroke-width="3"/><rect x="52" y="33" width="17" height="64" rx="5" fill="#68d8ff" stroke="#315868" stroke-width="3"/><rect x="74" y="42" width="17" height="55" rx="5" fill="#ffe45a" stroke="#315868" stroke-width="3"/>
      <path d="M38 24 C30 34 47 35 38 24 Z M60 18 C52 28 69 29 60 18 Z M82 27 C74 37 91 38 82 27 Z" fill="#ff9f1c" stroke="#315868" stroke-width="2"/>
      <path d="M35 51 L43 45 M57 48 L65 42 M79 56 L87 50" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.72"/>
      <path d="M24 99 H96" stroke="#315868" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
}

function partyCupSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M34 25 H86 L78 103 H42 Z" fill="#68d8ff" stroke="#315868" stroke-width="3"/>
      <path d="M36 44 H84 M39 70 H81" stroke="#ff6f91" stroke-width="8" stroke-linecap="round"/>
      <circle cx="52" cy="58" r="5" fill="#ffe45a"/><circle cx="70" cy="86" r="5" fill="#7be500"/>
      <path d="M47 34 C54 29 67 28 75 33" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function partyPlateSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="62" r="43" fill="#fff8d9" stroke="#315868" stroke-width="4"/>
      <circle cx="60" cy="62" r="28" fill="none" stroke="#68d8ff" stroke-width="7"/>
      <path d="M31 45 C44 33 72 28 91 49" fill="none" stroke="#ff6f91" stroke-width="8" stroke-linecap="round"/>
      <g fill="#ffe45a"><circle cx="43" cy="69" r="5"/><circle cx="67" cy="50" r="5"/><circle cx="77" cy="76" r="5"/></g>
    </svg>`;
}

function invitationSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="25" y="29" width="70" height="62" rx="9" fill="#fff3bd" stroke="#315868" stroke-width="3"/>
      <path d="M27 35 L60 62 L93 35" fill="none" stroke="#ff6f91" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M34 74 H86 M43 83 H77" stroke="#68d8ff" stroke-width="5" stroke-linecap="round"/>
      <path d="M50 48 L56 54 L70 40" fill="none" stroke="#7bbf40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function confettiPopperSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M26 91 L55 38 L91 75 Z" fill="#ffcf4d" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M39 67 L67 82 M48 53 L79 66" stroke="#ff6f91" stroke-width="6" stroke-linecap="round"/>
      <g stroke-linecap="round" stroke-width="6"><path d="M54 27 L48 14" stroke="#68d8ff"/><path d="M69 31 L79 16" stroke="#7be500"/><path d="M79 43 L102 35" stroke="#ff6f91"/><path d="M69 22 L91 20" stroke="#ffe45a"/></g>
      <circle cx="91" cy="51" r="5" fill="#68d8ff"/><circle cx="58" cy="18" r="4" fill="#ff6f91"/>
    </svg>`;
}

function cakeSliceSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M24 70 L91 37 L100 86 L33 99 Z" fill="#ff9bd1" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M31 80 L96 66" stroke="#fff3bd" stroke-width="10" stroke-linecap="round"/>
      <path d="M27 68 L91 37 L96 54 L33 83 Z" fill="#ffd7e9"/>
      <circle cx="79" cy="49" r="5" fill="#ff5f7e"/><circle cx="62" cy="57" r="4" fill="#68d8ff"/><circle cx="47" cy="65" r="4" fill="#ffe45a"/>
      <path d="M41 72 C50 65 65 59 78 56" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
    </svg>`;
}

function picnicBlanketSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M22 33 H97 L89 99 H30 Z" fill="#ffffff" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M23 51 H95 M21 69 H93 M28 87 H91 M43 34 V99 M62 34 V100 M81 34 V96" stroke="#ff6f5f" stroke-width="7" opacity="0.85"/>
      <path d="M31 40 H42 V51 H31 Z M62 69 H80 V87 H62 Z" fill="#ffd6d1" opacity="0.7"/>
    </svg>`;
}

function lemonadeSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M35 35 H85 L78 104 H43 Z" fill="#ffe45a" stroke="#315868" stroke-width="3"/>
      <path d="M39 70 C52 58 67 81 82 62 L78 104 H43 Z" fill="#ffd45a"/>
      <path d="M73 16 L63 43" stroke="#315868" stroke-width="5" stroke-linecap="round"/><path d="M70 18 H92" stroke="#ff6f91" stroke-width="5" stroke-linecap="round"/>
      <circle cx="60" cy="58" r="13" fill="#fff8a8" stroke="#e0b72e" stroke-width="3"/><path d="M60 45 V71 M47 58 H73 M51 49 L69 67 M69 49 L51 67" stroke="#e0b72e" stroke-width="2"/>
      <path d="M45 42 V56" stroke="#fff8c0" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    </svg>`;
}

function chipsSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M30 21 C50 29 70 29 90 21 L84 105 C70 111 50 111 36 105 Z" fill="#ff6f5f" stroke="#315868" stroke-width="3"/>
      <path d="M39 49 H81 V80 H39 Z" fill="#fff3bd" rx="8"/>
      <text x="60" y="68" text-anchor="middle" font-size="16" font-weight="900" fill="#d85f2e">CHIPS</text>
      <path d="M43 32 C51 37 68 37 77 32" fill="none" stroke="#ffd36a" stroke-width="6" stroke-linecap="round"/>
      <g fill="#ffd36a"><circle cx="48" cy="89" r="5"/><circle cx="64" cy="92" r="5"/><circle cx="76" cy="87" r="5"/></g>
    </svg>`;
}

function saladSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M24 63 H96 C92 93 80 104 60 104 C40 104 28 93 24 63 Z" fill="#68d8ff" stroke="#315868" stroke-width="3"/>
      <path d="M30 62 C38 39 53 54 60 39 C69 55 83 38 91 62 Z" fill="#70d95c" stroke="#3aa64e" stroke-width="2"/>
      <circle cx="47" cy="62" r="6" fill="#ff6f5f"/><circle cx="72" cy="59" r="6" fill="#ff6f5f"/><circle cx="61" cy="70" r="5" fill="#ffd84a"/>
      <path d="M42 78 C54 85 68 85 80 78" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.65"/>
    </svg>`;
}

function crackersSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="29" y="28" width="62" height="64" rx="12" fill="#f4c779" stroke="#315868" stroke-width="3"/>
      <path d="M38 42 H82 M38 58 H82 M38 74 H82" stroke="#d99a45" stroke-width="4" stroke-linecap="round"/>
      <g fill="#b87939"><circle cx="48" cy="49" r="3"/><circle cx="67" cy="49" r="3"/><circle cx="57" cy="66" r="3"/><circle cx="76" cy="66" r="3"/></g>
      <path d="M36 34 C44 27 62 25 77 30" fill="none" stroke="#ffe2a5" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function napkinsSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M31 25 H91 V91 L70 82 L51 101 L31 91 Z" fill="#fff3bd" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M42 36 H80 M42 49 H80 M42 62 H72" stroke="#68d8ff" stroke-width="5" stroke-linecap="round"/>
      <path d="M31 25 L61 55 L91 25" fill="none" stroke="#ff6f5f" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function picnicBasketSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M32 49 C32 26 88 26 88 49" fill="none" stroke="#315868" stroke-width="7" stroke-linecap="round"/>
      <rect x="22" y="47" width="76" height="48" rx="11" fill="#d9964c" stroke="#315868" stroke-width="3"/>
      <path d="M25 62 H95 M41 48 V95 M60 48 V95 M79 48 V95" stroke="#a86535" stroke-width="5" opacity="0.75"/>
      <path d="M36 37 C45 28 76 28 84 37" fill="none" stroke="#f5c06d" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function trailMixSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M29 25 C49 18 72 18 92 25 L84 105 C69 111 51 111 36 105 Z" fill="#8fd1ff" stroke="#315868" stroke-width="3"/>
      <path d="M38 48 H82 V78 H38 Z" fill="#fff3bd" rx="8"/>
      <text x="60" y="66" text-anchor="middle" font-size="13" font-weight="900" fill="#8a5a35">MIX</text>
      <g fill="#9b6438"><circle cx="45" cy="88" r="5"/><circle cx="61" cy="90" r="5"/><circle cx="77" cy="86" r="5"/></g><g fill="#ff6f91"><circle cx="53" cy="82" r="4"/><circle cx="70" cy="78" r="4"/></g>
    </svg>`;
}

function wafflesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="27" y="28" width="66" height="66" rx="14" fill="#f2b95b" stroke="#315868" stroke-width="3"/>
      <path d="M27 50 H93 M27 72 H93 M49 28 V94 M71 28 V94" stroke="#c7863c" stroke-width="5" opacity="0.75"/>
      <rect x="51" y="39" width="21" height="15" rx="4" fill="#ffe45a" stroke="#c7863c" stroke-width="2"/>
      <path d="M62 54 C57 66 73 68 66 83" fill="none" stroke="#9b5a34" stroke-width="6" stroke-linecap="round" opacity="0.65"/>
    </svg>`;
}

function oatmealSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M26 60 H94 C91 91 79 105 60 105 C41 105 29 91 26 60 Z" fill="#7bd3ff" stroke="#315868" stroke-width="3"/>
      <ellipse cx="60" cy="60" rx="37" ry="18" fill="#f3d59a" stroke="#315868" stroke-width="3"/>
      <g fill="#b87939"><circle cx="47" cy="56" r="4"/><circle cx="62" cy="63" r="4"/><circle cx="75" cy="55" r="4"/></g>
      <path d="M39 48 C51 40 70 40 82 48" fill="none" stroke="#ffe9b7" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function butterSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="25" y="45" width="70" height="38" rx="10" fill="#fff3a3" stroke="#315868" stroke-width="3"/>
      <path d="M33 45 L47 31 H103 L95 45 Z" fill="#ffe45a" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <path d="M95 45 L103 31 V68 L95 83 Z" fill="#eec83e" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <text x="60" y="69" text-anchor="middle" font-size="15" font-weight="900" fill="#c28b28">BUTTER</text>
    </svg>`;
}

function bagelSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="62" r="42" fill="#d89248" stroke="#315868" stroke-width="3"/>
      <circle cx="60" cy="62" r="18" fill="#fff3bd" stroke="#315868" stroke-width="3"/>
      <g fill="#7a4d2c"><circle cx="43" cy="45" r="3"/><circle cx="73" cy="42" r="3"/><circle cx="84" cy="65" r="3"/><circle cx="47" cy="82" r="3"/></g>
      <path d="M35 45 C43 34 58 30 73 34" fill="none" stroke="#f6c77e" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
}

function teaSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M29 50 H79 V79 C79 93 69 101 55 101 C41 101 29 93 29 79 Z" fill="#fff3bd" stroke="#315868" stroke-width="3"/>
      <path d="M78 58 H91 C102 58 103 79 90 81 H79" fill="none" stroke="#315868" stroke-width="7" stroke-linecap="round"/>
      <path d="M34 70 C47 61 60 82 76 65 V80 C76 91 68 97 55 97 C43 97 34 91 34 80 Z" fill="#d08a45" opacity="0.85"/>
      <path d="M45 34 C39 27 43 22 50 16 M62 34 C56 27 60 22 67 16" fill="none" stroke="#a9b8bd" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function syrupSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M47 21 H73 V36 C83 42 87 55 83 70 L76 103 H44 L37 70 C33 55 37 42 47 36 Z" fill="#b66b2e" stroke="#315868" stroke-width="3"/>
      <rect x="47" y="12" width="26" height="17" rx="6" fill="#8a4d2a" stroke="#315868" stroke-width="3"/>
      <rect x="42" y="51" width="37" height="28" rx="10" fill="#fff3bd" stroke="#7f4727" stroke-width="3"/>
      <text x="60.5" y="69" text-anchor="middle" font-size="12" font-weight="900" fill="#8a4d2a">SYRUP</text>
    </svg>`;
}

function kiwiSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="62" rx="44" ry="38" fill="#9b6a3b" stroke="#315868" stroke-width="3"/>
      <ellipse cx="60" cy="62" rx="34" ry="29" fill="#8ed64d"/>
      <circle cx="60" cy="62" r="13" fill="#fff3bd"/>
      <g fill="#315868"><circle cx="43" cy="57" r="2.6"/><circle cx="50" cy="75" r="2.6"/><circle cx="70" cy="75" r="2.6"/><circle cx="78" cy="57" r="2.6"/><circle cx="60" cy="84" r="2.6"/></g>
      <path d="M36 51 C43 42 56 38 70 40" fill="none" stroke="#c5f47d" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function mangoSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M35 76 C25 48 44 21 72 27 C99 32 103 67 82 89 C62 110 42 97 35 76 Z" fill="#ffb13c" stroke="#315868" stroke-width="3"/>
      <path d="M66 27 C72 15 83 13 91 21 C81 27 73 29 66 27 Z" fill="#55c65a" stroke="#315868" stroke-width="3"/>
      <path d="M37 76 C48 91 68 94 82 80" fill="none" stroke="#ff6f5f" stroke-width="8" stroke-linecap="round" opacity="0.55"/>
      <path d="M44 53 C51 43 64 38 77 41" fill="none" stroke="#ffd27a" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function peachSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M60 34 C76 18 99 33 96 61 C92 93 70 107 60 95 C50 107 28 93 24 61 C21 33 44 18 60 34 Z" fill="#ffad7a" stroke="#315868" stroke-width="3"/>
      <path d="M62 30 C69 15 82 14 91 23 C80 29 70 31 62 30 Z" fill="#54c45a" stroke="#315868" stroke-width="3"/>
      <path d="M60 36 C56 52 56 73 61 92" fill="none" stroke="#e87962" stroke-width="5" stroke-linecap="round" opacity="0.55"/>
      <path d="M38 54 C43 44 52 39 60 38" fill="none" stroke="#ffd0b5" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function cherriesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M51 54 C54 31 63 21 80 16 M75 55 C74 33 69 24 55 15" fill="none" stroke="#4b8c3f" stroke-width="6" stroke-linecap="round"/>
      <circle cx="45" cy="75" r="23" fill="#e83d4e" stroke="#315868" stroke-width="3"/><circle cx="79" cy="75" r="23" fill="#ff4f5f" stroke="#315868" stroke-width="3"/>
      <path d="M82 17 C94 12 104 17 108 27 C96 29 87 27 82 17 Z" fill="#55c65a" stroke="#315868" stroke-width="3"/>
      <path d="M36 66 C40 60 47 57 53 59 M70 66 C75 60 82 58 88 61" fill="none" stroke="#ff9aa6" stroke-width="5" stroke-linecap="round"/>
    </svg>`;
}

function blueberriesSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M25 50 H95 L88 99 H32 Z" fill="#83dfff" stroke="#315868" stroke-width="3"/>
      <path d="M31 45 H89 C98 45 102 55 96 62 H24 C18 55 22 45 31 45 Z" fill="#b8efff" stroke="#315868" stroke-width="3"/>
      <g fill="#4568d9" stroke="#315868" stroke-width="2"><circle cx="42" cy="62" r="10"/><circle cx="61" cy="61" r="10"/><circle cx="79" cy="64" r="10"/><circle cx="51" cy="79" r="10"/><circle cx="70" cy="80" r="10"/></g>
      <g stroke="#90a6ff" stroke-width="3" stroke-linecap="round"><path d="M39 59 L45 65 M61 57 L65 64 M77 61 L83 66"/></g>
    </svg>`;
}

function cottonCandySvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M58 64 L78 108" stroke="#315868" stroke-width="7" stroke-linecap="round"/><path d="M58 64 L78 108" stroke="#fff3bd" stroke-width="4" stroke-linecap="round"/>
      <path d="M34 52 C20 35 42 21 55 31 C62 13 88 22 82 42 C103 42 102 69 82 71 H39 C22 72 20 55 34 52 Z" fill="#ff9bd1" stroke="#315868" stroke-width="3"/>
      <path d="M39 41 C49 31 64 30 74 37" fill="none" stroke="#ffd5eb" stroke-width="6" stroke-linecap="round"/>
    </svg>`;
}

function popcornSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M28 42 H92 L84 106 H36 Z" fill="#ff6f5f" stroke="#315868" stroke-width="3"/>
      <path d="M45 42 V106 M63 42 V106 M81 42 L75 106" stroke="#ffffff" stroke-width="8" opacity="0.85"/>
      <g fill="#fff3bd" stroke="#315868" stroke-width="2"><circle cx="34" cy="39" r="10"/><circle cx="48" cy="31" r="11"/><circle cx="63" cy="37" r="11"/><circle cx="78" cy="31" r="11"/><circle cx="90" cy="40" r="10"/></g>
      <text x="60" y="82" text-anchor="middle" font-size="12" font-weight="900" fill="#ffffff">POP</text>
    </svg>`;
}

function marshmallowsSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="27" y="43" width="31" height="39" rx="12" fill="#ffffff" stroke="#315868" stroke-width="3" transform="rotate(-10 42 62)"/>
      <rect x="58" y="33" width="32" height="42" rx="13" fill="#fff5fb" stroke="#315868" stroke-width="3" transform="rotate(11 74 54)"/>
      <rect x="49" y="70" width="34" height="35" rx="13" fill="#ffffff" stroke="#315868" stroke-width="3" transform="rotate(5 66 87)"/>
      <path d="M35 52 C40 48 48 48 52 53 M65 44 C70 40 78 41 83 47" fill="none" stroke="#ffd5e6" stroke-width="4" stroke-linecap="round"/>
    </svg>`;
}

function puddingSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M28 45 H92 L84 101 H36 Z" fill="#ffe8a6" stroke="#315868" stroke-width="3"/>
      <path d="M32 58 C47 42 66 73 89 52 L84 101 H36 Z" fill="#d08a45" opacity="0.9"/>
      <rect x="30" y="34" width="60" height="17" rx="7" fill="#ff6f91" stroke="#315868" stroke-width="3"/>
      <text x="60" y="80" text-anchor="middle" font-size="14" font-weight="900" fill="#ffffff">PUD</text>
      <path d="M42 45 V58" stroke="#fff3bd" stroke-width="5" stroke-linecap="round" opacity="0.75"/>
    </svg>`;
}

function candyCaneSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M72 103 V39 C72 24 49 24 49 39 V49" fill="none" stroke="#ffffff" stroke-width="21" stroke-linecap="round"/>
      <path d="M72 103 V39 C72 24 49 24 49 39 V49" fill="none" stroke="#315868" stroke-width="25" stroke-linecap="round" opacity="0.25"/>
      <path d="M72 101 V39 C72 25 50 25 50 39 V49" fill="none" stroke="#ffffff" stroke-width="18" stroke-linecap="round"/>
      <path d="M72 85 L60 96 M72 64 L54 81 M68 34 L51 51 M56 25 L49 35" stroke="#ff4f5f" stroke-width="8" stroke-linecap="round"/>
    </svg>`;
}

function jellyBeansSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M24 30 C48 22 72 22 96 30 L88 105 C72 111 48 111 32 105 Z" fill="#fff3bd" stroke="#315868" stroke-width="3"/>
      <path d="M32 58 C46 45 57 66 70 53 C78 45 90 52 94 64 L88 105 C72 111 48 111 32 105 Z" fill="#ff6f91" opacity="0.85"/>
      <text x="60" y="47" text-anchor="middle" font-size="14" font-weight="900" fill="#8c35e8">BEANS</text>
      <g><ellipse cx="45" cy="76" rx="9" ry="6" fill="#7be500" transform="rotate(-20 45 76)"/><ellipse cx="61" cy="84" rx="9" ry="6" fill="#68d8ff" transform="rotate(17 61 84)"/><ellipse cx="77" cy="74" rx="9" ry="6" fill="#ffe45a" transform="rotate(-10 77 74)"/></g>
    </svg>`;
}

function caramelSvg() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M21 57 L39 39 H81 L99 57 L81 75 H39 Z" fill="#d9873b" stroke="#315868" stroke-width="3" stroke-linejoin="round"/>
      <rect x="36" y="42" width="48" height="30" rx="9" fill="#f2a94c" stroke="#8a4d2a" stroke-width="2"/>
      <path d="M22 57 L11 43 M22 57 L11 72 M98 57 L109 43 M98 57 L109 72" stroke="#315868" stroke-width="5" stroke-linecap="round"/>
      <text x="60" y="63" text-anchor="middle" font-size="12" font-weight="900" fill="#fff3bd">CARAMEL</text>
    </svg>`;
}

new ShoppingMemoryGame(document.getElementById("app"));